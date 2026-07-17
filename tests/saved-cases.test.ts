import { describe, it, expect } from 'vitest'
import {
  createMemoryStore,
  saveCase,
  loadCases,
  renameCase,
  deleteCase,
} from '@/lib/storage'
import { createMercedesExample } from '@/lib/defaults'
import { calculateBusinessValue } from '@/lib/value-calculator'
import { buildFeatureRows } from '@/lib/feature-engineering'

describe('saved cases storage', () => {
  const deal = createMercedesExample()
  const output = calculateBusinessValue(deal)
  const features = buildFeatureRows(deal, output)

  it('saves, lists, renames and deletes cases', () => {
    const store = createMemoryStore()

    let cases = saveCase(
      { name: 'Mercedes D001', deal, output, features, prediction: null, brief: null },
      store,
    )
    expect(cases).toHaveLength(1)
    expect(cases[0].savedAt).toBeTruthy()
    const id = cases[0].id

    saveCase(
      { name: 'Second', deal, output, features, prediction: null, brief: null },
      store,
    )
    expect(loadCases(store)).toHaveLength(2)

    cases = renameCase(id, 'Renamed', store)
    expect(cases.find((c) => c.id === id)?.name).toBe('Renamed')

    cases = deleteCase(id, store)
    expect(cases).toHaveLength(1)
    expect(cases.find((c) => c.id === id)).toBeUndefined()
  })

  it('returns an empty array when nothing is stored', () => {
    const store = createMemoryStore()
    expect(loadCases(store)).toEqual([])
  })
})
