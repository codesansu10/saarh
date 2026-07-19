'use client'

import {
  Leaf, Euro, TrendingUp, Package, Percent, ShieldCheck, Truck,
  Download, ArrowRight, BookOpen,
} from 'lucide-react'
import {
  INDUSTRIES, MATERIAL_TYPES, CERTIFICATION_STATUSES, SUPPLY_RELIABILITY,
  type DealInput,
} from '@/lib/types'
import type { BusinessValueOutput } from '@/lib/types'
import type { ValidationErrors } from '@/lib/validation'
import {
  fmtCurrency, fmtInt, fmtPercent, fmtDecimal,
} from '@/lib/value-calculator'

// ── Shared input primitives ──────────────────────────────────────────────────
const inputCls =
  'w-full rounded-lg border border-border bg-[var(--surface-subtle)] px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--brand-green)] focus:ring-2 focus:ring-[var(--brand-green)]/20 transition-colors'
const selectCls =
  'w-full rounded-lg border border-border bg-[var(--surface-subtle)] px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--brand-green)] focus:ring-2 focus:ring-[var(--brand-green)]/20 transition-colors appearance-none cursor-pointer'

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-[var(--steel-grey-dark)]">
      {children}
    </label>
  )
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function UnitInput({ id, value, onChange, placeholder, unit, step }: {
  id: string; value: number | string; onChange: (v: number) => void
  placeholder: string; unit: string; step?: string
}) {
  return (
    <div className="relative">
      <input
        id={id} type="number" step={step}
        className={`${inputCls} pr-12`}
        value={value || ''}
        onChange={e => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        placeholder={placeholder}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{unit}</span>
    </div>
  )
}

// ── Results components ───────────────────────────────────────────────────────
function ResultRow({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${accent ? 'bg-[var(--brand-green-soft)] border border-[var(--brand-green)]/20' : 'bg-[var(--surface-subtle)]'}`}>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
      <p className={`font-mono text-sm font-semibold tabular-nums ${accent ? 'text-[var(--brand-green-dark)]' : 'text-foreground'}`}>{value}</p>
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex-1 border-t border-border" />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="flex-1 border-t border-border" />
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export function Step2Dashboard({
  deal,
  output,
  onChange,
  errors,
  valid,
  onNext,
}: {
  deal: DealInput
  output: BusinessValueOutput | null
  onChange: (patch: Partial<DealInput>) => void
  errors: ValidationErrors
  valid: boolean
  onNext: () => void
}) {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  type NumericField =
    | 'annualSteelVolumeTonnes' | 'conventionalSteelPricePerTonne' | 'greenPremiumPerTonne'
    | 'baselineCo2Intensity' | 'greenSteelCo2Intensity' | 'productUnits'
    | 'proofItemsAvailable' | 'proofItemsRequired'

  const num = (field: NumericField) => (v: number) => onChange({ [field]: v } as Partial<DealInput>)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Page header */}
      <div className="flex items-center justify-between border-b border-border bg-white px-6 py-3.5">
        <div>
          <h1 className="text-base font-semibold text-foreground">Business Value Calculator</h1>
          <p className="text-xs text-muted-foreground">Enter deal information to calculate the business impact of green steel.</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:border-[var(--brand-green)]/50 transition-colors"
        >
          <BookOpen className="size-3.5" aria-hidden />
          Saved Deals
        </button>
      </div>

      {/* Split body */}
      <div className="flex flex-1 min-h-0 divide-x divide-border">

        {/* ── LEFT: Calculator inputs ────────────────────────────── */}
        <div className="flex w-[52%] shrink-0 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

            {/* Customer & Deal */}
            <FieldGroup title="Customer & Deal Information">
              <div>
                <Label htmlFor="d-company">Company</Label>
                <input id="d-company" className={inputCls} value={deal.companyName}
                  onChange={e => onChange({ companyName: e.target.value })} placeholder="Mercedes-Benz" />
                {errors.companyName && <p className="mt-0.5 text-xs text-[var(--risk-high)]">{errors.companyName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="d-industry">Industry</Label>
                  <select id="d-industry" className={selectCls} value={deal.industry}
                    onChange={e => onChange({ industry: e.target.value as DealInput['industry'] })}>
                    {INDUSTRIES.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="d-material">Material Type</Label>
                  <select id="d-material" className={selectCls} value={deal.materialType}
                    onChange={e => onChange({ materialType: e.target.value as DealInput['materialType'] })}>
                    {MATERIAL_TYPES.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="d-product">Product / Application</Label>
                  <input id="d-product" className={inputCls} value={deal.productName}
                    onChange={e => onChange({ productName: e.target.value })} placeholder="EV Chassis / Springs" />
                </div>
                <div>
                  <Label htmlFor="d-dealid">Deal ID (optional)</Label>
                  <input id="d-dealid" className={inputCls} value={deal.dealId}
                    onChange={e => onChange({ dealId: e.target.value })} placeholder="D001" />
                </div>
              </div>
            </FieldGroup>

            {/* Deal Inputs */}
            <FieldGroup title="Deal Inputs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="d-vol">Annual Steel Volume</Label>
                  <UnitInput id="d-vol" value={deal.annualSteelVolumeTonnes}
                    onChange={num('annualSteelVolumeTonnes')} placeholder="31200" unit="t" />
                </div>
                <div>
                  <Label htmlFor="d-conv">Conventional Price</Label>
                  <UnitInput id="d-conv" value={deal.conventionalSteelPricePerTonne}
                    onChange={num('conventionalSteelPricePerTonne')} placeholder="720" unit="€/t" />
                </div>
                <div>
                  <Label htmlFor="d-prem">Green Premium</Label>
                  <UnitInput id="d-prem" value={deal.greenPremiumPerTonne}
                    onChange={num('greenPremiumPerTonne')} placeholder="180" unit="€/t" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="d-co2b">Baseline CO₂</Label>
                  <UnitInput id="d-co2b" value={deal.baselineCo2Intensity}
                    onChange={num('baselineCo2Intensity')} placeholder="1.921" unit="tCO₂/t" step="0.001" />
                </div>
                <div>
                  <Label htmlFor="d-co2g">Green CO₂</Label>
                  <UnitInput id="d-co2g" value={deal.greenSteelCo2Intensity}
                    onChange={num('greenSteelCo2Intensity')} placeholder="0.339" unit="tCO₂/t" step="0.001" />
                </div>
                <div>
                  <Label htmlFor="d-units">Product Units/yr</Label>
                  <UnitInput id="d-units" value={deal.productUnits}
                    onChange={num('productUnits')} placeholder="120000" unit="units" />
                </div>
              </div>
            </FieldGroup>

            {/* Proof & Supply */}
            <FieldGroup title="Proof & Supply Information">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="d-pcf">PCF Available</Label>
                  <select id="d-pcf" className={selectCls}
                    value={deal.proofStatus.includes('PCF available') ? 'Yes' : 'No'}
                    onChange={e => {
                      const has = deal.proofStatus.includes('PCF available')
                      if (e.target.value === 'Yes' && !has) onChange({ proofStatus: [...deal.proofStatus, 'PCF available'] })
                      else if (e.target.value === 'No' && has) onChange({ proofStatus: deal.proofStatus.filter(p => p !== 'PCF available') })
                    }}>
                    <option>Yes</option><option>No</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="d-cert">Certification Status</Label>
                  <select id="d-cert" className={selectCls} value={deal.certificationStatus}
                    onChange={e => onChange({ certificationStatus: e.target.value as DealInput['certificationStatus'] })}>
                    {CERTIFICATION_STATUSES.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="d-supply">Supply Reliability</Label>
                  <select id="d-supply" className={selectCls} value={deal.supplyReliability}
                    onChange={e => onChange({ supplyReliability: e.target.value as DealInput['supplyReliability'] })}>
                    {SUPPLY_RELIABILITY.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </FieldGroup>

          </div>

          {/* Footer CTA */}
          <div className="border-t border-border bg-white px-5 py-3">
            <button type="button" onClick={onNext} disabled={!valid}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--steel-grey-dark)] disabled:opacity-50">
              View Stakeholder Analysis
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* ── RIGHT: Live results panel ──────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Results header */}
          <div className="flex items-center justify-between border-b border-border bg-white px-5 py-3.5">
            <div>
              <h2 className="text-base font-semibold text-foreground">Business Impact Dashboard</h2>
              <p className="text-xs text-muted-foreground">Overview of the quantified impact of switching to green steel.</p>
            </div>
            <button type="button"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:border-[var(--brand-green)]/50 transition-colors">
              <Download className="size-3.5" aria-hidden />
              Export
            </button>
          </div>

          {!output ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Fill in required fields to see results.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {/* Deal strip */}
              <div className="grid grid-cols-5 gap-px rounded-xl overflow-hidden border border-border bg-border text-xs">
                {[
                  { label: 'Company', value: deal.companyName || '—' },
                  { label: 'Deal ID', value: deal.dealId || '—' },
                  { label: 'Product', value: deal.productName || '—' },
                  { label: 'Industry', value: deal.industry },
                  { label: 'Calculated on', value: today },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white px-3 py-2">
                    <p className="text-muted-foreground">{label}</p>
                    <p className="mt-0.5 font-medium text-foreground truncate">{value}</p>
                  </div>
                ))}
              </div>

              {/* CO2 + Premium spotlight */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[var(--brand-green)]/25 bg-[var(--brand-green-soft)] p-4">
                  <div className="mb-1 flex items-center gap-1.5">
                    <Leaf className="size-4 text-[var(--brand-green)]" aria-hidden />
                    <p className="text-xs font-medium text-[var(--brand-green-dark)]">CO₂ Saved</p>
                  </div>
                  <p className="font-mono text-3xl font-bold tabular-nums text-[var(--brand-green-dark)]">
                    {fmtInt(output.co2Saved)}
                  </p>
                  <p className="text-xs text-[var(--brand-green-dark)]/70">t CO₂ / year</p>
                </div>
                <div className="rounded-xl border border-border bg-white p-4">
                  <div className="mb-1 flex items-center gap-1.5">
                    <Euro className="size-4 text-muted-foreground" aria-hidden />
                    <p className="text-xs font-medium text-muted-foreground">Premium per Product</p>
                  </div>
                  <p className="font-mono text-3xl font-bold tabular-nums text-foreground">
                    €{fmtDecimal(output.premiumPerProduct, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">per vehicle</p>
                </div>
              </div>

              <SectionDivider label="Financial Impact" />

              <div className="space-y-1.5">
                <ResultRow label="Total Annual Premium" sub="per year"
                  value={output.totalPremium >= 1_000_000
                    ? `€${fmtDecimal(output.totalPremium / 1_000_000, 1)} M`
                    : fmtCurrency(output.totalPremium)}
                  accent
                />
                <ResultRow label="Product Price Impact" sub="vs. total product cost"
                  value={`+${fmtDecimal(output.premiumPercentage * 100, 2)}%`} />
                <ResultRow label="Material-Level Premium" sub="of conventional price"
                  value={fmtPercent(output.premiumPercentage, 0)} />
                <ResultRow label="Conventional Contract" sub="per year"
                  value={fmtCurrency(output.conventionalContractValue)} />
                <ResultRow label="Green Steel Contract" sub="per year"
                  value={fmtCurrency(output.greenSteelContractValue)} />
                <ResultRow label="Indicative Carbon Value" sub="EU ETS assumption"
                  value={fmtCurrency(output.indicativeCarbonValue)} />
              </div>

              <SectionDivider label="Readiness" />

              <div className="space-y-1.5">
                <ResultRow
                  label="Proof Score"
                  sub={`${deal.proofItemsAvailable} of ${deal.proofItemsRequired} items`}
                  value={`${Math.round(output.proofScore * 100)}%`}
                />
                <div className="flex items-center justify-between rounded-lg bg-[var(--surface-subtle)] px-3 py-2.5">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Supply Reliability</p>
                    <p className="text-[10px] text-muted-foreground">Current assessment</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    output.supplyRisk === 'High' ? 'bg-green-100 text-green-800'
                    : output.supplyRisk === 'Medium' ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                    {output.supplyRisk}
                  </span>
                </div>
              </div>

              {/* Business summary */}
              <div className="rounded-xl border border-border bg-white p-3.5">
                <p className="mb-1 text-xs font-semibold text-foreground">Business Summary</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Choosing green steel for this deal increases the final vehicle cost by only{' '}
                  <strong className="text-foreground">€{fmtDecimal(output.premiumPerProduct, 0)}</strong> per vehicle (
                  <strong className="text-foreground">{fmtPercent(output.premiumPercentage, 2)}</strong>) while reducing
                  embedded emissions by almost{' '}
                  <strong className="text-[var(--brand-green-dark)]">{fmtInt(output.co2Saved)} t CO₂</strong> per year.
                </p>
              </div>

              {/* Icon row */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: TrendingUp, label: 'Total Premium', value: output.totalPremium >= 1_000_000 ? `€${fmtDecimal(output.totalPremium / 1_000_000, 1)}M` : fmtCurrency(output.totalPremium) },
                  { icon: Percent, label: 'Material Premium', value: fmtPercent(output.premiumPercentage, 0) },
                  { icon: ShieldCheck, label: 'Proof Score', value: `${Math.round(output.proofScore * 100)}%` },
                  { icon: Truck, label: 'Supply Risk', value: output.supplyRisk },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex flex-col items-center rounded-xl border border-border bg-white p-3 text-center">
                    <Icon className="mb-1.5 size-4 text-muted-foreground" aria-hidden />
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
