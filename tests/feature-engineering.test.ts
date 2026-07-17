import { describe, it, expect } from 'vitest'
import { buildFeatureRows } from '@/lib/feature-engineering'
import { calculateBusinessValue } from '@/lib/value-calculator'
import { createMercedesExample } from '@/lib/defaults'
import { STAKEHOLDER_PROFILES } from '@/lib/stakeholder-profiles'
import { STAKEHOLDERS } from '@/lib/types'

describe('stakeholder profiles', () => {
  it('has the documented base values for all four stakeholders', () => {
    expect(STAKEHOLDER_PROFILES.Procurement.costSensitivity).toBe(0.9)
    expect(STAKEHOLDER_PROFILES.Sustainability.proofSensitivity).toBe(0.9)
    expect(STAKEHOLDER_PROFILES.Management.strategicFocus).toBe(0.95)
    expect(STAKEHOLDER_PROFILES.Compliance.claimRiskSensitivity).toBe(0.95)
  })
})

describe('buildFeatureRows', () => {
  const deal = createMercedesExample()
  const output = calculateBusinessValue(deal)
  const rows = buildFeatureRows(deal, output)

  it('produces four rows for one deal', () => {
    expect(rows).toHaveLength(4)
    expect(rows.map((r) => r.stakeholder)).toEqual(STAKEHOLDERS)
  })

  it('deal-level values are identical across rows', () => {
    const totals = new Set(rows.map((r) => r.totalPremium))
    const co2 = new Set(rows.map((r) => r.co2Saved))
    expect(totals.size).toBe(1)
    expect(co2.size).toBe(1)
    expect([...totals][0]).toBe(5_616_000)
  })

  it('stakeholder profile values differ across rows', () => {
    const cost = new Set(rows.map((r) => r.costSensitivity))
    expect(cost.size).toBeGreaterThan(1)
  })
})
