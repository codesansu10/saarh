'use client'

import { BookOpen, ArrowRight } from 'lucide-react'
import {
  INDUSTRIES,
  MATERIAL_TYPES,
  CERTIFICATION_STATUSES,
  SUPPLY_RELIABILITY,
  type DealInput,
} from '@/lib/types'
import type { ValidationErrors } from '@/lib/validation'

const inputCls =
  'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--brand-green)] focus:ring-2 focus:ring-[var(--brand-green)]/20 transition-colors'

const selectCls =
  'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--brand-green)] focus:ring-2 focus:ring-[var(--brand-green)]/20 transition-colors appearance-none cursor-pointer'

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-[var(--steel-grey-dark)]">
      {children}
    </label>
  )
}

function CardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </div>
  )
}

type NumericField =
  | 'annualSteelVolumeTonnes'
  | 'conventionalSteelPricePerTonne'
  | 'greenPremiumPerTonne'
  | 'baselineCo2Intensity'
  | 'greenSteelCo2Intensity'
  | 'productUnits'
  | 'proofItemsAvailable'
  | 'proofItemsRequired'

export function Step1Calculator({
  deal,
  onChange,
  errors,
  onCalculate,
  valid,
}: {
  deal: DealInput
  onChange: (patch: Partial<DealInput>) => void
  errors: ValidationErrors
  onCalculate: () => void
  valid: boolean
}) {
  const num = (field: NumericField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    onChange({ [field]: v === '' ? 0 : Number(v) } as Partial<DealInput>)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Page header */}
      <div className="flex items-start justify-between border-b border-border bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Business Value Calculator</h1>
          <p className="text-sm text-muted-foreground">Enter deal information to calculate the business impact of green steel.</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:border-[var(--brand-green)]/50 transition-colors"
        >
          <BookOpen className="size-4" aria-hidden />
          Saved Deals
        </button>
      </div>

      {/* Scrollable form body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Customer & Deal Information */}
          <CardSection title="Customer & Deal Information">
            <div className="space-y-3">
              <div>
                <Label htmlFor="companyName">Company</Label>
                <input
                  id="companyName"
                  className={inputCls}
                  value={deal.companyName}
                  onChange={(e) => onChange({ companyName: e.target.value })}
                  placeholder="Mercedes-Benz"
                />
                {errors.companyName && (
                  <p className="mt-1 text-xs text-[var(--risk-high)]">{errors.companyName}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <select
                    id="industry"
                    className={selectCls}
                    value={deal.industry}
                    onChange={(e) => onChange({ industry: e.target.value as DealInput['industry'] })}
                  >
                    {INDUSTRIES.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="materialType">Material Type</Label>
                  <select
                    id="materialType"
                    className={selectCls}
                    value={deal.materialType}
                    onChange={(e) => onChange({ materialType: e.target.value as DealInput['materialType'] })}
                  >
                    {MATERIAL_TYPES.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="productName">Product / Application</Label>
                <input
                  id="productName"
                  className={inputCls}
                  value={deal.productName}
                  onChange={(e) => onChange({ productName: e.target.value })}
                  placeholder="EV Chassis / Springs"
                />
              </div>
              <div>
                <Label htmlFor="dealId">Deal ID (optional)</Label>
                <input
                  id="dealId"
                  className={inputCls}
                  value={deal.dealId}
                  onChange={(e) => onChange({ dealId: e.target.value })}
                  placeholder="D001"
                />
              </div>
            </div>
          </CardSection>

          {/* Deal Inputs */}
          <CardSection title="Deal Inputs">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <Label htmlFor="annualSteelVolumeTonnes">Annual Steel Volume</Label>
                  <div className="relative">
                    <input
                      id="annualSteelVolumeTonnes"
                      type="number"
                      className={inputCls}
                      value={deal.annualSteelVolumeTonnes || ''}
                      onChange={num('annualSteelVolumeTonnes')}
                      placeholder="31,200"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">t</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="conventionalSteelPricePerTonne">Conventional Steel Price</Label>
                  <div className="relative">
                    <input
                      id="conventionalSteelPricePerTonne"
                      type="number"
                      className={inputCls}
                      value={deal.conventionalSteelPricePerTonne || ''}
                      onChange={num('conventionalSteelPricePerTonne')}
                      placeholder="720"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€/t</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="greenPremiumPerTonne">Green Steel Premium</Label>
                  <div className="relative">
                    <input
                      id="greenPremiumPerTonne"
                      type="number"
                      className={inputCls}
                      value={deal.greenPremiumPerTonne || ''}
                      onChange={num('greenPremiumPerTonne')}
                      placeholder="180"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€/t</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="baselineCo2Intensity">Baseline CO₂ Intensity</Label>
                  <div className="relative">
                    <input
                      id="baselineCo2Intensity"
                      type="number"
                      step="0.001"
                      className={inputCls}
                      value={deal.baselineCo2Intensity || ''}
                      onChange={num('baselineCo2Intensity')}
                      placeholder="1.921"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">tCO₂/t</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="greenSteelCo2Intensity">Green Steel CO₂ Intensity</Label>
                  <div className="relative">
                    <input
                      id="greenSteelCo2Intensity"
                      type="number"
                      step="0.001"
                      className={inputCls}
                      value={deal.greenSteelCo2Intensity || ''}
                      onChange={num('greenSteelCo2Intensity')}
                      placeholder="0.339"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">tCO₂/t</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="productUnits">Product Units (per year)</Label>
                  <div className="relative">
                    <input
                      id="productUnits"
                      type="number"
                      className={inputCls}
                      value={deal.productUnits || ''}
                      onChange={num('productUnits')}
                      placeholder="120,000"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">units</span>
                  </div>
                </div>
              </div>
            </div>
          </CardSection>

          {/* Proof & Supply Information */}
          <CardSection title="Proof & Supply Information">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="pcfAvailable">PCF Available</Label>
                  <select
                    id="pcfAvailable"
                    className={selectCls}
                    value={deal.proofStatus.includes('PCF available') ? 'Yes' : 'No'}
                    onChange={(e) => {
                      const has = deal.proofStatus.includes('PCF available')
                      if (e.target.value === 'Yes' && !has) {
                        onChange({ proofStatus: [...deal.proofStatus, 'PCF available'] })
                      } else if (e.target.value === 'No' && has) {
                        onChange({ proofStatus: deal.proofStatus.filter((p) => p !== 'PCF available') })
                      }
                    }}
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="certificationStatus">Certification Status</Label>
                  <select
                    id="certificationStatus"
                    className={selectCls}
                    value={deal.certificationStatus}
                    onChange={(e) => onChange({ certificationStatus: e.target.value as DealInput['certificationStatus'] })}
                  >
                    {CERTIFICATION_STATUSES.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="supplyReliability">Supply Reliability</Label>
                  <select
                    id="supplyReliability"
                    className={selectCls}
                    value={deal.supplyReliability}
                    onChange={(e) => onChange({ supplyReliability: e.target.value as DealInput['supplyReliability'] })}
                  >
                    {SUPPLY_RELIABILITY.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="proofItemsAvailable">Proof Items Available</Label>
                  <input
                    id="proofItemsAvailable"
                    type="number"
                    className={inputCls}
                    value={deal.proofItemsAvailable || ''}
                    onChange={num('proofItemsAvailable')}
                    placeholder="3"
                  />
                </div>
                <div>
                  <Label htmlFor="proofItemsRequired">Proof Items Required</Label>
                  <input
                    id="proofItemsRequired"
                    type="number"
                    className={inputCls}
                    value={deal.proofItemsRequired || ''}
                    onChange={num('proofItemsRequired')}
                    placeholder="4"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="salespersonNotes">Salesperson Notes</Label>
                <textarea
                  id="salespersonNotes"
                  rows={2}
                  className={`${inputCls} resize-none`}
                  value={deal.salespersonNotes}
                  onChange={(e) => onChange({ salespersonNotes: e.target.value })}
                  placeholder="Add notes about this deal..."
                />
              </div>
            </div>
          </CardSection>

          {/* Carbon Price Assumption */}
          <CardSection title="Carbon Price Assumption">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="carbonValue">Carbon Price Value</Label>
                  <div className="relative">
                    <input
                      id="carbonValue"
                      type="number"
                      className={inputCls}
                      value={deal.carbonPrice.value || ''}
                      onChange={(e) =>
                        onChange({ carbonPrice: { ...deal.carbonPrice, value: e.target.value === '' ? 0 : Number(e.target.value) } })
                      }
                      placeholder="85"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€/t</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="carbonSource">Source / Assumption</Label>
                  <input
                    id="carbonSource"
                    className={inputCls}
                    value={deal.carbonPrice.source}
                    onChange={(e) => onChange({ carbonPrice: { ...deal.carbonPrice, source: e.target.value } })}
                    placeholder="EU ETS assumption"
                  />
                </div>
              </div>
            </div>
          </CardSection>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-border bg-white px-6 py-4">
        <button
          type="button"
          onClick={onCalculate}
          disabled={!valid}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--steel-grey-dark)] disabled:opacity-50"
        >
          Calculate Business Value
          <ArrowRight className="size-4" aria-hidden />
        </button>
        {!valid && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Fill in required fields to enable calculation.
          </p>
        )}
      </div>
    </div>
  )
}
