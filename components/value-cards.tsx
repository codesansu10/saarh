'use client'

import {
  Leaf,
  ShieldAlert,
  Scale,
  TrendingUp,
  Trophy,
  Factory,
  CheckCircle2,
} from 'lucide-react'
import type { Industry } from './simulator'

type Props = {
  tonnage: number
  co2Saved: number
  penaltiesAvoided: number
  industry: Industry
  timeline: string
}

const fmtInt = (n: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n))

const fmtEuro = (n: number) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Math.round(n))

export function ValueCards({
  tonnage,
  co2Saved,
  penaltiesAvoided,
  industry,
  timeline,
}: Props) {
  return (
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {/* CARD 1 — Scope 3 Carbon Impact */}
      <article className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Scope 3 Carbon Impact
          </span>
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Leaf className="size-5" aria-hidden="true" />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-space-grotesk text-4xl font-bold tabular-nums text-foreground transition-all">
            {fmtInt(co2Saved)}
          </span>
          <span className="text-sm font-medium text-muted-foreground">t CO₂ saved</span>
        </div>
        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
            <span>Carbon reduction via EAF route</span>
            <span className="text-primary">70%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
              style={{ width: '70%' }}
            />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground/70">
            70% Carbon Reduction via EAF Route vs. Blast Furnace
          </p>
        </div>
      </article>

      {/* CARD 2 — Financial Protection */}
      <article className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Financial Protection
          </span>
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ShieldAlert className="size-5" aria-hidden="true" />
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          EU Regulatory &amp; CBAM Penalties Avoided
        </p>
        <span className="mt-2 font-space-grotesk text-5xl font-bold leading-none tabular-nums text-primary transition-all">
          {fmtEuro(penaltiesAvoided)}
        </span>
        <div className="mt-6 flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-[11px] text-muted-foreground">
          <Scale className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            Based on current carbon market price of €85 / t CO₂ across{' '}
            {fmtInt(tonnage)} t of supply.
          </span>
        </div>
      </article>

      {/* CARD 3 — Commercial Leverage */}
      <article className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50 lg:col-span-2 xl:col-span-1">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Commercial Leverage
          </span>
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <TrendingUp className="size-5" aria-hidden="true" />
          </span>
        </div>
        <CommercialLeverage industry={industry} />
      </article>

      {/* CARD 4 — Logistics & Supply Security */}
      <article className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50 lg:col-span-2 xl:col-span-3">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Logistics &amp; Supply Security
          </span>
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Factory className="size-5" aria-hidden="true" />
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Capacity Secured
              </span>
            </div>
            <p className="mt-2 font-space-grotesk text-2xl font-bold text-foreground">
              100%
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Guaranteed allocation for {fmtInt(tonnage)} t via the €3.5B
              Power4Steel programme.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/40 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Active Supply Line
            </p>
            <p className="mt-2 font-space-grotesk text-base font-bold text-foreground">
              Völklingen / Neunkirchen
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-primary">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              EAF route active
            </div>
          </div>
          <div className="rounded-lg border border-border bg-secondary/40 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Delivery Schedule
            </p>
            <p className="mt-2 font-space-grotesk text-base font-bold text-foreground">
              {timeline}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Lead-time locked against confirmed rolling-mill slots.
            </p>
          </div>
        </div>
      </article>
    </div>
  )
}

function CommercialLeverage({ industry }: { industry: Industry }) {
  if (industry === 'automotive') {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4">
        <div className="rounded-lg border border-border bg-secondary/40 p-4">
          <p className="text-xs text-muted-foreground">
            Added investment per vehicle chassis
          </p>
          <p className="mt-1 font-space-grotesk text-2xl font-bold text-foreground">
            +€42
          </p>
        </div>
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
          <p className="text-xs text-muted-foreground">
            Marketable Eco-Premium Value
          </p>
          <p className="mt-1 font-space-grotesk text-2xl font-bold text-primary">
            +€450
          </p>
        </div>
      </div>
    )
  }

  if (industry === 'renewable') {
    return (
      <div className="flex flex-1 flex-col justify-center">
        <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/10 p-4">
          <Trophy className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="font-space-grotesk text-base font-bold text-foreground">
              Wins Public Tenders
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              High-scoring green procurement criteria give Pure Steel+ a decisive
              edge in wind-turbine bolt tenders.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const copy =
    industry === 'infrastructure'
      ? 'Meets public high-speed rail sustainability mandates and lifecycle carbon accounting requirements.'
      : 'Differentiates general machinery supply with certified low-emission inputs and premium ESG positioning.'

  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/40 p-4">
        <Trophy className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-muted-foreground">{copy}</p>
      </div>
    </div>
  )
}
