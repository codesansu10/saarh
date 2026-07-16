'use client'

import { useEffect, useState } from 'react'
import {
  X,
  Printer,
  Leaf,
  ShieldAlert,
  Loader2,
  BadgeCheck,
} from 'lucide-react'
import type { Industry, Material } from './simulator'

type Props = {
  open: boolean
  onClose: () => void
  tonnage: number
  co2Saved: number
  penaltiesAvoided: number
  legacyPrice: number
  industry: Industry
  material: Material
  timeline: string
}

const fmtInt = (n: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
    Math.round(n),
  )

const fmtEuro = (n: number) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Math.round(n))

const INDUSTRY_LABELS: Record<Industry, string> = {
  automotive: 'Automotive (EV Springs)',
  renewable: 'Renewable Energy (Wind Turbine Bolts)',
  infrastructure: 'Infrastructure (High-Speed Rail)',
  machinery: 'General Machinery',
}

export function ReportModal({
  open,
  onClose,
  tonnage,
  co2Saved,
  penaltiesAvoided,
  legacyPrice,
  industry,
  material,
  timeline,
}: Props) {
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (open) {
      setProcessing(true)
      const t = setTimeout(() => setProcessing(false), 1100)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const rows: [string, string][] = [
    ['Annual Tonnage', `${fmtInt(tonnage)} t`],
    [
      'Material',
      material === 'wire-rod' ? 'S-PURE+ Wire Rod' : 'S-PURE+ Bar Steel',
    ],
    ['Industry Vertical', INDUSTRY_LABELS[industry]],
    ['Delivery Timeline', timeline],
    ['Legacy Price / t', fmtEuro(legacyPrice)],
  ]

  return (
    <div
      className="report-overlay fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Boardroom ESG report"
    >
      {processing ? (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 text-center">
          <Loader2
            className="size-10 animate-spin text-primary"
            aria-hidden="true"
          />
          <p className="font-space-grotesk text-sm font-semibold text-foreground">
            Composing boardroom-ready ESG report…
          </p>
        </div>
      ) : (
        <div className="report-sheet my-6 w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl">
          {/* Controls (hidden on print) */}
          <div className="report-controls flex items-center justify-between gap-3 border-b border-border px-6 py-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              ESG &amp; ROI Summary — Print or Save as PDF
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Printer className="size-4" aria-hidden="true" />
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close report"
                className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Printable content */}
          <div className="report-body px-8 py-8">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-6">
              <div>
                <p className="font-space-grotesk text-xl font-bold text-foreground">
                  saarstahl
                </p>
                <p className="text-sm font-semibold text-primary">
                  We are Pure Steel+
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  DiGreeS Value Report
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <h2 className="font-space-grotesk text-lg font-bold text-foreground">
              Boardroom-Ready Sustainability &amp; ROI Summary
            </h2>

            {/* Inputs */}
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Deal Configuration
              </p>
              <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
                {rows.map(([k, v]) => (
                  <div key={k} className="flex justify-between bg-card px-4 py-3">
                    <span className="text-sm text-muted-foreground">{k}</span>
                    <span className="text-sm font-semibold text-foreground">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Headline results */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-5">
                <div className="flex items-center gap-2 text-primary">
                  <Leaf className="size-4" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    CO₂ Saved
                  </span>
                </div>
                <p className="mt-2 font-space-grotesk text-3xl font-bold text-foreground">
                  {fmtInt(co2Saved)} t
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  70% reduction via EAF route vs. blast furnace
                </p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/40 p-5">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldAlert className="size-4" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    CBAM Penalties Avoided
                  </span>
                </div>
                <p className="mt-2 font-space-grotesk text-3xl font-bold text-primary">
                  {fmtEuro(penaltiesAvoided)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  At €85 / t CO₂ carbon market price
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
              <BadgeCheck className="size-5 text-primary" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">
                LESS Certification: Low Emission Class C Verified — DiGreeS Data
                Network
              </p>
            </div>

            <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
              This document summarises modelled sustainability and commercial
              value for the configured Pure Steel+ allocation. Figures are
              indicative and provided for procurement decision support. Contact
              Saarstahl Key Account Management for a binding technical &amp;
              commercial offer.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
