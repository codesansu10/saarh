'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react'
import type {
  DealInput,
  PredictionResponse,
  Stakeholder,
  Provenance,
} from '@/lib/types'
import { createMercedesExample, createEmptyDeal } from '@/lib/defaults'
import { calculateBusinessValue } from '@/lib/value-calculator'
import { validateDeal, isDealValid } from '@/lib/validation'
import { buildFeatureRows } from '@/lib/feature-engineering'
import { fetchPrediction, fetchBrief } from '@/lib/api-client'
import {
  loadCases,
  saveCase,
  deleteCase,
  type SavedCase,
} from '@/lib/storage'
import { buildCaseExport, downloadJson, slugify } from '@/lib/export'
import type { BriefResult } from '@/lib/brief-schema'

import { AppHeader } from '@/components/app-header'
import { WorkflowStepper, type WorkflowStep } from '@/components/workflow-stepper'
import { DealInputForm } from '@/components/deal-input-form'
import { BusinessValuePanel } from '@/components/business-value-panel'
import { ModelStatusBanner } from '@/components/model-status-banner'
import { StakeholderPredictions } from '@/components/stakeholder-predictions'
import { SalesBriefPanel } from '@/components/sales-brief-panel'
import { SavedCasesPanel } from '@/components/saved-cases-panel'

const STEP_LABELS = [
  'Deal Input',
  'Business Value',
  'Predictions',
  'Sales Brief',
  'Saved Cases',
]

function buildProvenance(deal: DealInput): Record<string, Provenance> {
  const prov: Record<string, Provenance> = {}
  for (const key of Object.keys(deal) as (keyof DealInput)[]) {
    const v = deal[key]
    if (v === '' || v === null || v === undefined) prov[key] = 'Missing'
    else prov[key] = 'Verified'
  }
  prov.carbonPrice = 'Assumed'
  return prov
}

export default function Page() {
  const [deal, setDeal] = useState<DealInput>(() => createMercedesExample())
  const [step, setStep] = useState(1)

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
  const [predLoading, setPredLoading] = useState(false)
  const [predError, setPredError] = useState<string | null>(null)

  const [activeStakeholder, setActiveStakeholder] =
    useState<Stakeholder>('Procurement')

  const [brief, setBrief] = useState<BriefResult | null>(null)
  const [briefLoading, setBriefLoading] = useState(false)
  const [briefError, setBriefError] = useState<string | null>(null)

  const [cases, setCases] = useState<SavedCase[]>([])

  useEffect(() => {
    setCases(loadCases())
  }, [])

  const errors = useMemo(() => validateDeal(deal), [deal])
  const valid = useMemo(() => isDealValid(deal), [deal])
  const output = useMemo(
    () => (valid ? calculateBusinessValue(deal) : null),
    [deal, valid],
  )

  const onChange = useCallback((patch: Partial<DealInput>) => {
    setDeal((d) => ({ ...d, ...patch }))
    // Any deal edit invalidates downstream model output.
    setPrediction(null)
    setBrief(null)
    setPredError(null)
  }, [])

  const runPrediction = useCallback(async () => {
    if (!output) return
    setPredLoading(true)
    setPredError(null)
    try {
      const res = await fetchPrediction(deal, output)
      setPrediction(res)
    } catch (e) {
      setPredError(e instanceof Error ? e.message : 'Prediction failed')
    } finally {
      setPredLoading(false)
    }
  }, [deal, output])

  const runBrief = useCallback(
    async (stakeholder: Stakeholder) => {
      if (!output || !prediction) return
      const pred = prediction.predictions.find(
        (p) => p.stakeholder === stakeholder,
      )
      if (!pred) return
      setBriefLoading(true)
      setBriefError(null)
      try {
        const res = await fetchBrief(deal, output, pred, stakeholder)
        setBrief(res)
      } catch (e) {
        setBriefError(e instanceof Error ? e.message : 'Brief failed')
      } finally {
        setBriefLoading(false)
      }
    },
    [deal, output, prediction],
  )

  // Auto-fetch prediction when arriving at step 3 without one.
  useEffect(() => {
    if (step === 3 && valid && !prediction && !predLoading) {
      void runPrediction()
    }
  }, [step, valid, prediction, predLoading, runPrediction])

  // Auto-generate brief when arriving at step 4.
  useEffect(() => {
    if (step === 4 && prediction && !brief && !briefLoading) {
      void runBrief(activeStakeholder)
    }
  }, [step, prediction, brief, briefLoading, activeStakeholder, runBrief])

  const steps: WorkflowStep[] = STEP_LABELS.map((label, i) => {
    const id = i + 1
    let enabled = true
    if (id === 2 || id === 3) enabled = valid
    if (id === 4) enabled = !!prediction
    return { id, label, enabled }
  })

  const handleSave = useCallback(() => {
    const features = output ? buildFeatureRows(deal, output) : []
    const name = `${deal.companyName} — ${deal.productName}`
    const next = saveCase({
      name,
      deal,
      output,
      features,
      prediction,
      brief: brief?.brief ?? null,
    })
    setCases(next)
  }, [deal, output, prediction, brief])

  const handleLoad = useCallback((c: SavedCase) => {
    setDeal(c.deal)
    setPrediction(c.prediction)
    setBrief(c.brief ? { mode: 'template', brief: c.brief } : null)
    setStep(2)
  }, [])

  const handleDelete = useCallback((id: string) => {
    setCases(deleteCase(id))
  }, [])

  const handleExport = useCallback(() => {
    const features = output ? buildFeatureRows(deal, output) : []
    const data = buildCaseExport({
      deal,
      output,
      features,
      prediction,
      brief: brief?.brief ?? null,
      provenance: buildProvenance(deal),
    })
    downloadJson(`saarstahl-${slugify(deal.companyName)}-case.json`, data)
  }, [deal, output, prediction, brief])

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-balance text-xl font-semibold text-foreground">
              Green-steel value &amp; objection simulator
            </h1>
            <p className="text-pretty text-sm text-muted-foreground">
              Model the commercial case and likely stakeholder objections for a
              Pure Steel+ deal, then generate an evidence-based sales brief.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => {
                setDeal(createMercedesExample())
                setStep(1)
              }}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--brand-green)]/50"
            >
              Load example
            </button>
            <button
              type="button"
              onClick={() => {
                setDeal(createEmptyDeal())
                setStep(1)
              }}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mb-6">
          <WorkflowStepper steps={steps} current={step} onSelect={setStep} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          {/* Persistent deal input sidebar */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  1 · Deal input
                </h2>
                {valid ? (
                  <span className="status-badge border-[var(--brand-green)]/40 bg-[var(--brand-green-soft)] text-[var(--brand-green-dark)]">
                    Valid
                  </span>
                ) : (
                  <span className="status-badge border-[var(--risk-high)]/40 bg-[var(--risk-high)]/10 text-[var(--risk-high)]">
                    Incomplete
                  </span>
                )}
              </div>
              <DealInputForm deal={deal} onChange={onChange} errors={errors} />
            </div>
          </aside>

          {/* Active step panel */}
          <section className="min-w-0">
            <div className="rounded-2xl border border-border bg-card p-5">
              {step === 1 ? (
                <StepIntro onNext={() => setStep(2)} valid={valid} />
              ) : null}

              {step === 2 ? (
                <PanelShell
                  title="2 · Business value"
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                  nextLabel="Predict objections"
                  nextEnabled={valid}
                >
                  {output ? (
                    <BusinessValuePanel deal={deal} output={output} />
                  ) : (
                    <Incomplete />
                  )}
                </PanelShell>
              ) : null}

              {step === 3 ? (
                <PanelShell
                  title="3 · Stakeholder objection predictions"
                  onBack={() => setStep(2)}
                  onNext={() => setStep(4)}
                  nextLabel="Generate brief"
                  nextEnabled={!!prediction}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <ModelStatusBanner prediction={prediction} />
                      <button
                        type="button"
                        onClick={() => void runPrediction()}
                        disabled={predLoading || !valid}
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--brand-green)]/50 disabled:opacity-50"
                      >
                        {predLoading ? (
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                        ) : (
                          <RefreshCw className="size-4" aria-hidden />
                        )}
                        Re-run
                      </button>
                    </div>
                    {predError ? (
                      <p className="text-sm text-[var(--risk-high)]">
                        {predError}
                      </p>
                    ) : null}
                    {predLoading && !prediction ? (
                      <LoadingRow label="Scoring objections across stakeholders…" />
                    ) : null}
                    {prediction ? (
                      <StakeholderPredictions
                        prediction={prediction}
                        activeStakeholder={activeStakeholder}
                        onSelectStakeholder={setActiveStakeholder}
                      />
                    ) : null}
                  </div>
                </PanelShell>
              ) : null}

              {step === 4 ? (
                <PanelShell
                  title="4 · Sales brief"
                  onBack={() => setStep(3)}
                  onNext={() => setStep(5)}
                  nextLabel="Save & export"
                  nextEnabled
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Stakeholder:
                      </span>
                      {prediction?.predictions.map((p) => (
                        <button
                          key={p.stakeholder}
                          type="button"
                          onClick={() => {
                            setActiveStakeholder(p.stakeholder)
                            void runBrief(p.stakeholder)
                          }}
                          className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                            activeStakeholder === p.stakeholder
                              ? 'border-[var(--brand-green)] bg-[var(--brand-green-soft)] text-[var(--brand-green-dark)]'
                              : 'border-border bg-surface text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {p.stakeholder}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => void runBrief(activeStakeholder)}
                        disabled={briefLoading}
                        className="ml-auto inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-[var(--brand-green)]/50 disabled:opacity-50"
                      >
                        {briefLoading ? (
                          <Loader2 className="size-3.5 animate-spin" aria-hidden />
                        ) : (
                          <RefreshCw className="size-3.5" aria-hidden />
                        )}
                        Regenerate
                      </button>
                    </div>
                    {briefError ? (
                      <p className="text-sm text-[var(--risk-high)]">
                        {briefError}
                      </p>
                    ) : null}
                    {briefLoading && !brief ? (
                      <LoadingRow label="Composing evidence-based brief…" />
                    ) : null}
                    {brief ? <SalesBriefPanel result={brief} /> : null}
                  </div>
                </PanelShell>
              ) : null}

              {step === 5 ? (
                <PanelShell
                  title="5 · Saved cases & export"
                  onBack={() => setStep(4)}
                >
                  <SavedCasesPanel
                    cases={cases}
                    onSave={handleSave}
                    onLoad={handleLoad}
                    onDelete={handleDelete}
                    onExportCurrent={handleExport}
                    canExport={valid}
                  />
                </PanelShell>
              ) : null}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function StepIntro({
  onNext,
  valid,
}: {
  onNext: () => void
  valid: boolean
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground">1 · Deal input</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Enter the deal on the left. All commercial and emissions figures are
        used to compute the business value and to engineer the features that
        drive the objection model. A worked Mercedes-Benz spring-steel example
        is pre-loaded — edit any field to see downstream results update.
      </p>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        <li>• Step 2 computes the transparent commercial &amp; CO2 value.</li>
        <li>• Step 3 predicts objection risk per stakeholder.</li>
        <li>• Step 4 produces an evidence-tagged sales brief.</li>
        <li>• Step 5 saves and exports the full provenance snapshot.</li>
      </ul>
      <button
        type="button"
        onClick={onNext}
        disabled={!valid}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-green)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-green-dark)] disabled:opacity-50"
      >
        View business value
        <ArrowRight className="size-4" aria-hidden />
      </button>
      {!valid ? (
        <p className="text-xs text-[var(--risk-high)]">
          Complete the required deal fields to continue.
        </p>
      ) : null}
    </div>
  )
}

function PanelShell({
  title,
  children,
  onBack,
  onNext,
  nextLabel,
  nextEnabled,
}: {
  title: string
  children: React.ReactNode
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  nextEnabled?: boolean
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {children}
      <div className="flex items-center justify-between border-t border-border pt-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </button>
        ) : (
          <span />
        )}
        {onNext ? (
          <button
            type="button"
            onClick={onNext}
            disabled={nextEnabled === false}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-green)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-green-dark)] disabled:opacity-50"
          >
            {nextLabel ?? 'Next'}
            <ArrowRight className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  )
}

function LoadingRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-subtle px-4 py-6 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      {label}
    </div>
  )
}

function Incomplete() {
  return (
    <p className="rounded-lg border border-dashed border-border bg-surface-subtle px-4 py-6 text-center text-sm text-muted-foreground">
      Complete the required deal inputs to compute business value.
    </p>
  )
}
