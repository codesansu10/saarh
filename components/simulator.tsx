'use client'

import { useMemo, useState } from 'react'
import { BarChart3, FileCheck, Activity } from 'lucide-react'
import { SaarstahlLogo } from './saarstahl-logo'
import { InputsPanel } from './inputs-panel'
import { ValueCards } from './value-cards'
import { DppModal } from './dpp-modal'

export type Industry = 'automotive' | 'renewable' | 'infrastructure' | 'machinery'
export type Material = 'wire-rod' | 'bar-steel'

const CARBON_PRICE = 85 // €/t CO2
const CO2_FACTOR = 1.6 // t CO2 saved per t steel

export function Simulator() {
  const [tonnage, setTonnage] = useState(5000)
  const [industry, setIndustry] = useState<Industry>('automotive')
  const [material, setMaterial] = useState<Material>('wire-rod')
  const [legacyPrice, setLegacyPrice] = useState(720)
  const [modalOpen, setModalOpen] = useState(false)

  const { co2Saved, penaltiesAvoided } = useMemo(() => {
    const co2 = tonnage * CO2_FACTOR
    return { co2Saved: co2, penaltiesAvoided: co2 * CARBON_PRICE }
  }, [tonnage])

  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="flex flex-col border-b border-sidebar-border bg-sidebar lg:h-svh lg:w-[340px] lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="border-b border-sidebar-border px-6 py-5">
          <SaarstahlLogo />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <InputsPanel
            tonnage={tonnage}
            setTonnage={setTonnage}
            industry={industry}
            setIndustry={setIndustry}
            material={material}
            setMaterial={setMaterial}
            legacyPrice={legacyPrice}
            setLegacyPrice={setLegacyPrice}
          />
        </div>
      </aside>

      {/* Main viewport */}
      <main className="flex-1 overflow-y-auto">
        <header className="flex flex-col gap-4 border-b border-border px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:px-10">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Activity className="size-4" aria-hidden="true" />
              DiGreeS Value Simulator
            </div>
            <h1 className="font-space-grotesk text-2xl font-bold text-foreground text-balance">
              Saarstahl Value Engine
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Live commercial &amp; sustainability modelling for Pure Steel+ deals.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-space-grotesk text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
          >
            <FileCheck className="size-4" aria-hidden="true" />
            Generate DPP &amp; LESS Compliance Pack
          </button>
        </header>

        <div className="px-6 py-8 md:px-10">
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" aria-hidden="true" />
            <h2 className="font-space-grotesk text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Saarstahl Value Engine Output
            </h2>
          </div>
          <ValueCards
            tonnage={tonnage}
            co2Saved={co2Saved}
            penaltiesAvoided={penaltiesAvoided}
            industry={industry}
          />

          <div className="mt-8 rounded-2xl border border-border bg-card/60 p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">
                Deal summary:
              </span>{' '}
              At{' '}
              <span className="font-semibold text-primary">
                {new Intl.NumberFormat('en-US').format(tonnage)} tons
              </span>{' '}
              of{' '}
              {material === 'wire-rod' ? 'S-PURE+ Wire Rod' : 'S-PURE+ Bar Steel'},
              this order eliminates{' '}
              <span className="font-semibold text-primary">
                {new Intl.NumberFormat('en-US').format(Math.round(co2Saved))} tons
                of CO₂
              </span>{' '}
              versus the legacy blast-furnace route while shielding the customer
              from six-figure CBAM exposure.
            </p>
          </div>
        </div>
      </main>

      <DppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        material={material}
        tonnage={tonnage}
      />
    </div>
  )
}
