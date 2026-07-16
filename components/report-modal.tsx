'use client'

import { useEffect, useState } from 'react'
import {
  X,
  Printer,
  Leaf,
  ShieldAlert,
  Loader2,
  BadgeCheck,
  FileDown,
} from 'lucide-react'
import { jsPDF } from 'jspdf'
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
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (open) {
      setProcessing(true)
      const t = setTimeout(() => setProcessing(false), 1100)
      return () => clearTimeout(t)
    }
  }, [open])

  const handleDownloadPdf = () => {
    setDownloading(true)

    // Brand palette
    const emerald: [number, number, number] = [16, 185, 129]
    const anthracite: [number, number, number] = [15, 23, 42]
    const slate: [number, number, number] = [100, 116, 139]

    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 48
    const contentW = pageW - margin * 2

    // Header band
    doc.setFillColor(...anthracite)
    doc.rect(0, 0, pageW, 96, 'F')
    doc.setFillColor(...emerald)
    doc.rect(0, 96, pageW, 4, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.text('saarstahl', margin, 50)
    doc.setTextColor(...emerald)
    doc.setFontSize(12)
    doc.text('We are Pure Steel+', margin, 70)

    doc.setTextColor(203, 213, 225)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const dateStr = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    doc.text('DiGreeS Value Report', pageW - margin, 44, { align: 'right' })
    doc.text(dateStr, pageW - margin, 60, { align: 'right' })

    // Title
    let y = 138
    doc.setTextColor(...anthracite)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('Boardroom-Ready Sustainability & ROI Summary', margin, y)

    // Deal configuration
    y += 32
    doc.setFontSize(10)
    doc.setTextColor(...slate)
    doc.text('DEAL CONFIGURATION', margin, y)
    y += 8
    doc.setDrawColor(226, 232, 240)
    doc.line(margin, y, pageW - margin, y)

    doc.setFontSize(11)
    rows.forEach(([k, v]) => {
      y += 24
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...slate)
      doc.text(k, margin, y)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...anthracite)
      doc.text(v, pageW - margin, y, { align: 'right' })
      doc.setDrawColor(241, 245, 249)
      doc.line(margin, y + 8, pageW - margin, y + 8)
    })

    // Headline result boxes
    y += 40
    const boxH = 92
    const gap = 16
    const boxW = (contentW - gap) / 2

    // CO2 box
    doc.setFillColor(236, 253, 245)
    doc.roundedRect(margin, y, boxW, boxH, 8, 8, 'F')
    doc.setTextColor(...emerald)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('CO2 SAVED', margin + 16, y + 24)
    doc.setTextColor(...anthracite)
    doc.setFontSize(24)
    doc.text(`${fmtInt(co2Saved)} t`, margin + 16, y + 56)
    doc.setTextColor(...slate)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text('70% reduction via EAF route vs. blast furnace', margin + 16, y + 76)

    // CBAM box
    const box2X = margin + boxW + gap
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(box2X, y, boxW, boxH, 8, 8, 'F')
    doc.setTextColor(...emerald)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('CBAM PENALTIES AVOIDED', box2X + 16, y + 24)
    doc.setTextColor(...emerald)
    doc.setFontSize(22)
    doc.text(fmtEuro(penaltiesAvoided), box2X + 16, y + 56)
    doc.setTextColor(...slate)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text('At EUR 85 / t CO2 carbon market price', box2X + 16, y + 76)

    // Certification band
    y += boxH + 28
    doc.setFillColor(236, 253, 245)
    doc.roundedRect(margin, y, contentW, 40, 8, 8, 'F')
    doc.setTextColor(...emerald)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(
      'LESS Certification: Low Emission Class C Verified - DiGreeS Data Network',
      margin + 16,
      y + 25,
    )

    // Disclaimer
    y += 68
    doc.setTextColor(...slate)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    const disclaimer = doc.splitTextToSize(
      'This document summarises modelled sustainability and commercial value for the configured Pure Steel+ allocation. Figures are indicative and provided for procurement decision support. Contact Saarstahl Key Account Management for a binding technical & commercial offer.',
      contentW,
    )
    doc.text(disclaimer, margin, y)

    // Footer
    const pageH = doc.internal.pageSize.getHeight()
    doc.setDrawColor(...emerald)
    doc.line(margin, pageH - 40, pageW - margin, pageH - 40)
    doc.setTextColor(...slate)
    doc.setFontSize(8)
    doc.text('Saarstahl AG - DiGreeS Value Simulator', margin, pageH - 26)
    doc.text('Confidential - Procurement Decision Support', pageW - margin, pageH - 26, {
      align: 'right',
    })

    doc.save(`Saarstahl-ESG-Report-${fmtInt(tonnage)}t.pdf`)
    setDownloading(false)
  }

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
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {downloading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <FileDown className="size-4" aria-hidden="true" />
                )}
                Download PDF
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-secondary/60"
              >
                <Printer className="size-4" aria-hidden="true" />
                Print
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
