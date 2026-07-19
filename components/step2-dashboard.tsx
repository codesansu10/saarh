'use client'

import { Leaf, Euro, TrendingUp, Package, Percent, ShieldCheck, Truck, Info, Edit, Download, ArrowRight } from 'lucide-react'
import type { BusinessValueOutput, DealInput } from '@/lib/types'
import {
  fmtCurrency,
  fmtInt,
  fmtPercent,
  fmtDecimal,
} from '@/lib/value-calculator'

function KpiCard({
  icon: Icon,
  iconColor,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ElementType
  iconColor: string
  label: string
  value: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <div className={`flex flex-col rounded-xl border p-4 ${highlight ? 'border-[var(--brand-green)]/30 bg-[var(--brand-green-soft)]' : 'border-border bg-white'}`}>
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-subtle)]">
        <Icon className="size-4" style={{ color: iconColor }} aria-hidden />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

function SecondaryCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-white p-4">
      <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-[var(--surface-subtle)]">
        <Icon className="size-3.5 text-muted-foreground" aria-hidden />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

export function Step2Dashboard({
  deal,
  output,
  onEditInputs,
  onNext,
}: {
  deal: DealInput
  output: BusinessValueOutput
  onEditInputs: () => void
  onNext: () => void
}) {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const productPriceImpactPct = fmtDecimal(output.premiumPercentage * 100, 2)

  const businessSummary = `Choosing green steel for this deal increases the final vehicle cost by only ${fmtCurrency(output.premiumPerProduct)} per vehicle (${fmtPercent(output.premiumPercentage, 2)}) while reducing embedded emissions by almost ${fmtInt(output.co2Saved)} t CO₂ per year.`

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Page header */}
      <div className="flex items-start justify-between border-b border-border bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Business Impact Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of the quantified impact of switching to green steel.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEditInputs}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:border-[var(--brand-green)]/50 transition-colors"
          >
            <Edit className="size-3.5" aria-hidden />
            Edit Inputs
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:border-[var(--brand-green)]/50 transition-colors"
          >
            <Download className="size-3.5" aria-hidden />
            Export
          </button>
        </div>
      </div>

      {/* Deal summary strip */}
      <div className="grid grid-cols-4 gap-px border-b border-border bg-border">
        {[
          { label: 'Company', value: deal.companyName || '—' },
          { label: 'Deal ID', value: deal.dealId || '—' },
          { label: 'Product', value: deal.productName || '—' },
          { label: 'Industry', value: deal.industry },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white px-5 py-2.5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Primary KPI grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <KpiCard
            icon={Leaf}
            iconColor="var(--brand-green)"
            label="CO₂ Saved"
            value={`${fmtInt(output.co2Saved)}`}
            sub="t CO₂ / year"
            highlight
          />
          <KpiCard
            icon={Euro}
            iconColor="var(--steel-grey-dark)"
            label="Premium per Product"
            value={`€${fmtDecimal(output.premiumPerProduct, 0)}`}
            sub="per vehicle"
          />
          <KpiCard
            icon={TrendingUp}
            iconColor="var(--steel-grey-dark)"
            label="Total Premium"
            value={output.totalPremium >= 1_000_000
              ? `€${fmtDecimal(output.totalPremium / 1_000_000, 1)} M`
              : fmtCurrency(output.totalPremium)}
            sub="per year"
          />
          <KpiCard
            icon={Package}
            iconColor="var(--steel-grey-dark)"
            label="Product Price Impact"
            value={`+${productPriceImpactPct}%`}
            sub="vs. total product cost"
          />
        </div>

        {/* Secondary metrics row */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <SecondaryCard
            icon={Percent}
            label="Material-Level Premium"
            value={fmtPercent(output.premiumPercentage, 0)}
            sub="of conventional price"
          />
          <SecondaryCard
            icon={ShieldCheck}
            label="Proof Score"
            value={`${Math.round(output.proofScore * 100)} %`}
            sub={`${deal.proofItemsAvailable} of ${deal.proofItemsRequired} items available`}
          />
          <SecondaryCard
            icon={Truck}
            label="Supply Reliability"
            value={output.supplyRisk}
            sub="Current assessment"
          />
          <SecondaryCard
            icon={Info}
            label="Assumptions"
            value="View all"
            sub="Key assumptions used"
          />
        </div>

        {/* Business Summary */}
        <div className="rounded-xl border border-border bg-white p-4 mb-4">
          <p className="mb-2 text-sm font-semibold text-foreground">Business Summary</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{businessSummary}</p>
        </div>

        {/* Contract value row */}
        <div className="rounded-xl border border-border bg-[var(--surface-subtle)] px-5 py-3 flex flex-wrap items-center gap-x-8 gap-y-1">
          <span className="text-xs text-muted-foreground">Conventional contract: <span className="font-semibold text-foreground">{fmtCurrency(output.conventionalContractValue)}</span></span>
          <span className="text-xs text-muted-foreground">Green steel contract: <span className="font-semibold text-foreground">{fmtCurrency(output.greenSteelContractValue)}</span></span>
          <span className="text-xs text-muted-foreground">Indicative carbon value: <span className="font-semibold text-foreground">{fmtCurrency(output.indicativeCarbonValue)}</span></span>
          <span className="text-xs text-muted-foreground">Calculated on: <span className="font-medium text-foreground">{today}</span></span>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-border bg-white px-6 py-4">
        <button
          type="button"
          onClick={onNext}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--steel-grey-dark)]"
        >
          View Stakeholder Analysis
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
