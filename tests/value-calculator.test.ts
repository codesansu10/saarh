import { describe, it, expect } from 'vitest'
import { calculateBusinessValue, fmtPercent } from '@/lib/value-calculator'
import { createMercedesExample, createEmptyDeal } from '@/lib/defaults'
import type { DealInput } from '@/lib/types'

describe('calculateBusinessValue - Mercedes scenario', () => {
  const out = calculateBusinessValue(createMercedesExample())

  it('totalPremium = 5,616,000', () => {
    expect(out.totalPremium).toBe(5_616_000)
  })
  it('premiumPerProduct = 46.80', () => {
    expect(out.premiumPerProduct).toBeCloseTo(46.8, 10)
  })
  it('premiumPercentage = 0.25 (25%)', () => {
    expect(out.premiumPercentage).toBeCloseTo(0.25, 10)
    expect(fmtPercent(out.premiumPercentage)).toBe('25%')
  })
  it('co2Saved = 49,358.4 t CO2', () => {
    expect(out.co2Saved).toBeCloseTo(49_358.4, 6)
  })
  it('proofScore = 0.75', () => {
    expect(out.proofScore).toBe(0.75)
  })
  it('does not hard-code 49,920 or a €42 premium-per-product', () => {
    expect(out.co2Saved).not.toBe(49_920)
    expect(out.premiumPerProduct).not.toBe(42)
  })
})

describe('calculateBusinessValue - edge cases', () => {
  function withDeal(overrides: Partial<DealInput>): DealInput {
    return { ...createEmptyDeal(), ...overrides }
  }

  it('handles product units = 0 without dividing by zero', () => {
    const out = calculateBusinessValue(
      withDeal({
        annualSteelVolumeTonnes: 100,
        greenPremiumPerTonne: 50,
        productUnits: 0,
      }),
    )
    expect(out.premiumPerProduct).toBe(0)
    expect(Number.isFinite(out.premiumPerProduct)).toBe(true)
  })

  it('handles conventional price = 0 (percentage guarded)', () => {
    const out = calculateBusinessValue(
      withDeal({ conventionalSteelPricePerTonne: 0, greenPremiumPerTonne: 50 }),
    )
    expect(out.premiumPercentage).toBe(0)
  })

  it('baseline < green intensity yields negative co2Saved (surfaced by validation)', () => {
    const out = calculateBusinessValue(
      withDeal({
        annualSteelVolumeTonnes: 100,
        baselineCo2Intensity: 0.3,
        greenSteelCo2Intensity: 0.5,
      }),
    )
    expect(out.co2Saved).toBeCloseTo(-20, 10)
  })

  it('proof score boundaries', () => {
    expect(
      calculateBusinessValue(
        withDeal({ proofItemsAvailable: 0, proofItemsRequired: 4 }),
      ).proofScore,
    ).toBe(0)
    expect(
      calculateBusinessValue(
        withDeal({ proofItemsAvailable: 4, proofItemsRequired: 4 }),
      ).proofScore,
    ).toBe(1)
  })

  it('preserves full internal precision (rounds only for display)', () => {
    const out = calculateBusinessValue(
      withDeal({
        annualSteelVolumeTonnes: 33,
        greenPremiumPerTonne: 1,
        productUnits: 7,
      }),
    )
    expect(out.premiumPerProduct).toBeCloseTo(33 / 7, 12)
  })

  it('indicative carbon value uses the editable carbon price', () => {
    const out = calculateBusinessValue(
      withDeal({
        annualSteelVolumeTonnes: 100,
        baselineCo2Intensity: 2,
        greenSteelCo2Intensity: 1,
        carbonPrice: {
          value: 85,
          currency: 'EUR',
          effectiveDate: '2026-01-01',
          source: 'test',
        },
      }),
    )
    // co2Saved = 100 * 1 = 100; indicative = 100 * 85 = 8500
    expect(out.indicativeCarbonValue).toBe(8_500)
  })
})
