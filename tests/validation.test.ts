import { describe, it, expect } from 'vitest'
import { validateDeal, isDealValid } from '@/lib/validation'
import { createMercedesExample, createEmptyDeal } from '@/lib/defaults'

describe('validateDeal', () => {
  it('Mercedes example is valid', () => {
    expect(isDealValid(createMercedesExample())).toBe(true)
  })

  it('flags empty required text fields', () => {
    const errors = validateDeal(createEmptyDeal())
    expect(errors.companyName).toBeDefined()
    expect(errors.dealId).toBeDefined()
    expect(errors.productName).toBeDefined()
  })

  it('volume must be greater than zero', () => {
    const errors = validateDeal({
      ...createMercedesExample(),
      annualSteelVolumeTonnes: 0,
    })
    expect(errors.annualSteelVolumeTonnes).toBeDefined()
  })

  it('negative conventional price is rejected', () => {
    const errors = validateDeal({
      ...createMercedesExample(),
      conventionalSteelPricePerTonne: -1,
    })
    expect(errors.conventionalSteelPricePerTonne).toBeDefined()
  })

  it('baseline below green intensity is rejected', () => {
    const errors = validateDeal({
      ...createMercedesExample(),
      baselineCo2Intensity: 0.1,
      greenSteelCo2Intensity: 0.5,
    })
    expect(errors.baselineCo2Intensity).toBeDefined()
  })

  it('available proof cannot exceed required proof', () => {
    const errors = validateDeal({
      ...createMercedesExample(),
      proofItemsAvailable: 9,
      proofItemsRequired: 4,
    })
    expect(errors.proofItemsAvailable).toBeDefined()
  })

  it('required proof must be greater than zero', () => {
    const errors = validateDeal({
      ...createMercedesExample(),
      proofItemsRequired: 0,
    })
    expect(errors.proofItemsRequired).toBeDefined()
  })
})
