import { describe, it, expect } from 'vitest'
import { generateTemplateBrief } from '@/lib/brief-generator'
import { calculateBusinessValue } from '@/lib/value-calculator'
import { createMercedesExample } from '@/lib/defaults'
import { buildFeatureRows } from '@/lib/feature-engineering'
import { predictFromRows } from '@/lib/prediction-engine'

describe('generateTemplateBrief', () => {
  const deal = createMercedesExample()
  const output = calculateBusinessValue(deal)
  const rows = buildFeatureRows(deal, output)
  const predictions = predictFromRows(rows)
  const procurement = predictions.find((p) => p.stakeholder === 'Procurement')!

  const brief = generateTemplateBrief({
    deal,
    calculatorOutput: output,
    prediction: procurement,
    stakeholder: 'Procurement',
  })

  it('produces a complete structured brief', () => {
    expect(brief.primaryObjection).toBeTruthy()
    expect(brief.whyLikely.length).toBeGreaterThan(0)
    expect(brief.conversationStrategy.length).toBeGreaterThan(0)
    expect(brief.claimsToAvoid.length).toBeGreaterThan(0)
    expect(brief.followUpQuestions.length).toBeGreaterThan(0)
    expect(brief.recommendedOpening).toContain('Mercedes')
    expect(brief.recommendedNextStep).toBeTruthy()
  })

  it('never claims certification is complete when pending', () => {
    const joined = JSON.stringify(brief).toLowerCase()
    expect(joined).toContain('pending')
    expect(
      brief.claimsToAvoid.some((c) =>
        c.text.toLowerCase().includes('pending certification'),
      ),
    ).toBe(true)
  })

  it('labels every item with a provenance tag', () => {
    const all = [
      ...brief.whyLikely,
      ...brief.conversationStrategy,
      ...brief.evidenceToBring,
      ...brief.claimsToAvoid,
      ...brief.followUpQuestions,
      ...brief.missingInformation,
    ]
    for (const item of all) {
      expect(item.provenance).toBeTruthy()
    }
  })
})

describe('predictFromRows', () => {
  const deal = createMercedesExample()
  const output = calculateBusinessValue(deal)
  const predictions = predictFromRows(buildFeatureRows(deal, output))

  it('returns four stakeholder predictions with seven objections each', () => {
    expect(predictions).toHaveLength(4)
    for (const p of predictions) {
      expect(Object.keys(p.probabilities)).toHaveLength(7)
      expect(Object.keys(p.riskLevels)).toHaveLength(7)
    }
  })

  it('stakeholder tabs produce meaningfully different outputs', () => {
    const proc = predictions.find((p) => p.stakeholder === 'Procurement')!
    const comp = predictions.find((p) => p.stakeholder === 'Compliance')!
    expect(proc.probabilities.price_objection).not.toBe(
      comp.probabilities.price_objection,
    )
    // Procurement is more price sensitive than Compliance.
    expect(proc.probabilities.price_objection).toBeGreaterThan(
      comp.probabilities.price_objection,
    )
  })
})
