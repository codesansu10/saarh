import { describe, it, expect } from 'vitest'
import { toRiskLevel } from '@/lib/risk-level'

describe('toRiskLevel', () => {
  it('0.00 -> Low', () => expect(toRiskLevel(0.0)).toBe('Low'))
  it('0.39 -> Low', () => expect(toRiskLevel(0.39)).toBe('Low'))
  it('0.40 -> Medium', () => expect(toRiskLevel(0.4)).toBe('Medium'))
  it('0.69 -> Medium', () => expect(toRiskLevel(0.69)).toBe('Medium'))
  it('0.70 -> High', () => expect(toRiskLevel(0.7)).toBe('High'))
  it('1.00 -> High', () => expect(toRiskLevel(1.0)).toBe('High'))
  it('guards non-finite values', () => expect(toRiskLevel(NaN)).toBe('Low'))
})
