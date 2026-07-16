'use client'

import { useEffect } from 'react'
import {
  X,
  BadgeCheck,
  Download,
  FileCheck,
  ScanLine,
  ShieldCheck,
} from 'lucide-react'
import type { Material } from './simulator'

type Props = {
  open: boolean
  onClose: () => void
  material: Material
  tonnage: number
}

const QR_SIZE = 21

// Deterministic pseudo-QR pattern (visual mockup, not a scannable code)
function buildQrCells() {
  const cells: boolean[] = []
  let seed = 987654321
  for (let i = 0; i < QR_SIZE * QR_SIZE; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    cells.push((seed >> 16) % 2 === 0)
  }
  return cells
}

const QR_CELLS = buildQrCells()

function isFinder(r: number, c: number) {
  const inBox = (br: number, bc: number) =>
    r >= br && r < br + 7 && c >= bc && c < bc + 7
  return inBox(0, 0) || inBox(0, QR_SIZE - 7) || inBox(QR_SIZE - 7, 0)
}

const METALLURGY = [
  { el: 'Fe', name: 'Iron', legacy: 'Balance', pure: 'Balance', tol: '±0.00' },
  { el: 'C', name: 'Carbon', legacy: '0.42%', pure: '0.42%', tol: '±0.01' },
  { el: 'Mn', name: 'Manganese', legacy: '0.75%', pure: '0.75%', tol: '±0.02' },
  { el: 'Si', name: 'Silicon', legacy: '0.25%', pure: '0.25%', tol: '±0.01' },
]

export function DppModal({ open, onClose, material, tonnage }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const materialLabel =
    material === 'wire-rod' ? 'S-PURE+ Wire Rod' : 'S-PURE+ Bar Steel'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dpp-title"
    >
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <FileCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="dpp-title"
                className="font-space-grotesk text-base font-bold text-foreground"
              >
                Digital Product Passport
              </h2>
              <p className="text-xs text-muted-foreground">
                {materialLabel} · {new Intl.NumberFormat('en-US').format(tonnage)} t
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close passport"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr]">
          {/* QR + network */}
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-xl border border-border bg-foreground p-3">
              <svg
                width="160"
                height="160"
                viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
                role="img"
                aria-label="Simulated DiGreeS data network QR code"
                shapeRendering="crispEdges"
              >
                {QR_CELLS.map((filled, i) => {
                  const r = Math.floor(i / QR_SIZE)
                  const c = i % QR_SIZE
                  const show = isFinder(r, c) ? true : filled
                  if (!show) return null
                  return (
                    <rect
                      key={i}
                      x={c}
                      y={r}
                      width={1}
                      height={1}
                      fill="#0f172a"
                    />
                  )
                })}
              </svg>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-primary">
              <ScanLine className="size-3.5" aria-hidden="true" />
              <span>Live DiGreeS Data Network</span>
            </div>
          </div>

          {/* Status + intro */}
          <div className="flex flex-col justify-center gap-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5">
              <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
              <span className="text-xs font-bold text-primary">
                LESS Certification: Low Emission Class C Verified
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This passport certifies the origin, emission class and metallurgical
              integrity of Saarstahl Pure Steel+ produced via the electric arc
              furnace (EAF) route. All data points are anchored to the DiGreeS
              distributed data network and independently auditable.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              <span>Verified batch integrity · Chain-of-custody secured</span>
            </div>
          </div>
        </div>

        {/* Metallurgy table */}
        <div className="px-6 pb-6">
          <h3 className="mb-3 font-space-grotesk text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Metallurgical Quality Breakdown
          </h3>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Element</th>
                  <th className="px-4 py-3 font-semibold">Legacy Route</th>
                  <th className="px-4 py-3 font-semibold">Pure Steel+ (EAF)</th>
                  <th className="px-4 py-3 font-semibold">Tolerance</th>
                </tr>
              </thead>
              <tbody>
                {METALLURGY.map((row) => (
                  <tr
                    key={row.el}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <span className="font-space-grotesk font-bold text-foreground">
                        {row.el}
                      </span>{' '}
                      <span className="text-xs text-muted-foreground">
                        {row.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {row.legacy}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-medium text-foreground">
                      {row.pure}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {row.tol}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-primary">
            <BadgeCheck className="size-4 shrink-0" aria-hidden="true" />
            100% identical micro-cleanliness and fatigue strength to legacy supply —
            verified equivalent performance.
          </p>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-border bg-card/95 px-6 py-4 backdrop-blur">
          <button
            type="button"
            onClick={() =>
              alert(
                'Boardroom-Ready ESG Report export initiated (PDF). This is a demo action.',
              )
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-space-grotesk text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
          >
            <Download className="size-4" aria-hidden="true" />
            Export Boardroom-Ready ESG Report (PDF)
          </button>
        </div>
      </div>
    </div>
  )
}
