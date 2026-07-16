'use client'

import { Factory, Gauge, Layers, Euro } from 'lucide-react'
import type { Industry, Material } from './simulator'

const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: 'automotive', label: 'Automotive (EV Springs)' },
  { value: 'renewable', label: 'Renewable Energy (Wind Turbine Bolts)' },
  { value: 'infrastructure', label: 'Infrastructure (High-Speed Rail)' },
  { value: 'machinery', label: 'General Machinery' },
]

const MIN_TONNAGE = 100
const MAX_TONNAGE = 50000

type Props = {
  tonnage: number
  setTonnage: (v: number) => void
  industry: Industry
  setIndustry: (v: Industry) => void
  material: Material
  setMaterial: (v: Material) => void
  legacyPrice: number
  setLegacyPrice: (v: number) => void
}

function FieldLabel({
  icon: Icon,
  children,
}: {
  icon: typeof Gauge
  children: React.ReactNode
}) {
  return (
    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
      <Icon className="size-4 text-primary" aria-hidden="true" />
      {children}
    </label>
  )
}

export function InputsPanel({
  tonnage,
  setTonnage,
  industry,
  setIndustry,
  material,
  setMaterial,
  legacyPrice,
  setLegacyPrice,
}: Props) {
  const clampTonnage = (v: number) =>
    Math.min(MAX_TONNAGE, Math.max(MIN_TONNAGE, Number.isNaN(v) ? MIN_TONNAGE : v))

  const pct = ((tonnage - MIN_TONNAGE) / (MAX_TONNAGE - MIN_TONNAGE)) * 100

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="font-space-grotesk text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Order Parameters
        </h2>
        <p className="mt-1 text-xs text-muted-foreground/80">
          Configure the deal to model live Pure Steel+ value.
        </p>
      </div>

      {/* Tonnage */}
      <div>
        <FieldLabel icon={Gauge}>Annual Steel Tonnage Required</FieldLabel>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={MIN_TONNAGE}
            max={MAX_TONNAGE}
            value={tonnage}
            onChange={(e) => setTonnage(clampTonnage(e.target.valueAsNumber))}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-right font-space-grotesk text-lg font-semibold tabular-nums text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-sm text-muted-foreground">tons</span>
        </div>
        <input
          type="range"
          min={MIN_TONNAGE}
          max={MAX_TONNAGE}
          step={100}
          value={tonnage}
          onChange={(e) => setTonnage(clampTonnage(e.target.valueAsNumber))}
          aria-label="Annual steel tonnage slider"
          className="mt-3 w-full cursor-pointer accent-primary"
          style={{
            background: `linear-gradient(to right, var(--primary) ${pct}%, var(--secondary) ${pct}%)`,
            height: '6px',
            borderRadius: '9999px',
            appearance: 'none',
          }}
        />
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground/70">
          <span>100</span>
          <span>50,000</span>
        </div>
      </div>

      {/* Industry */}
      <div>
        <FieldLabel icon={Factory}>Target Industry Vertical</FieldLabel>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value as Industry)}
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        >
          {INDUSTRIES.map((i) => (
            <option key={i.value} value={i.value} className="bg-card">
              {i.label}
            </option>
          ))}
        </select>
      </div>

      {/* Material toggle */}
      <div>
        <FieldLabel icon={Layers}>Material Selection</FieldLabel>
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-input p-1">
          {(
            [
              { value: 'wire-rod', label: 'S-PURE+ Wire Rod' },
              { value: 'bar-steel', label: 'S-PURE+ Bar Steel' },
            ] as { value: Material; label: string }[]
          ).map((m) => {
            const active = material === m.value
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setMaterial(m.value)}
                className={`rounded-md px-2 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legacy price */}
      <div>
        <FieldLabel icon={Euro}>Current Legacy Steel Price per Ton (€)</FieldLabel>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">€</span>
          <input
            type="number"
            min={0}
            value={legacyPrice}
            onChange={(e) =>
              setLegacyPrice(
                Number.isNaN(e.target.valueAsNumber)
                  ? 0
                  : Math.max(0, e.target.valueAsNumber),
              )
            }
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-right font-space-grotesk text-lg font-semibold tabular-nums text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground/70">
          Establishes the value delta versus conventional blast-furnace supply.
        </p>
      </div>
    </div>
  )
}
