import { describe, it, expect, vi, afterEach } from 'vitest'
import { isPlausibleEstimate, queryOpenFoodFacts } from './nutrition'

const base = { kcal: 100, protein_g: 10, carbs_g: 10, sugar_g: 5, fat_g: 5, fiber_g: 2 }

describe('isPlausibleEstimate', () => {
  it('accepts a realistic estimate', () => {
    expect(isPlausibleEstimate(base)).toBe(true)
  })

  it('accepts values at the exact upper bounds', () => {
    expect(isPlausibleEstimate({ kcal: 900, protein_g: 100, carbs_g: 100, sugar_g: 100, fat_g: 100, fiber_g: 100 })).toBe(true)
  })

  it('accepts all-zero values', () => {
    expect(isPlausibleEstimate({ kcal: 0, protein_g: 0, carbs_g: 0, sugar_g: 0, fat_g: 0, fiber_g: 0 })).toBe(true)
  })

  it('rejects kcal above 900 per 100g', () => {
    expect(isPlausibleEstimate({ ...base, kcal: 1500 })).toBe(false)
  })

  it('rejects negative kcal', () => {
    expect(isPlausibleEstimate({ ...base, kcal: -50 })).toBe(false)
  })

  it('rejects a macro above 100g per 100g', () => {
    expect(isPlausibleEstimate({ ...base, protein_g: 250 })).toBe(false)
  })

  it('rejects a negative macro', () => {
    expect(isPlausibleEstimate({ ...base, fat_g: -1 })).toBe(false)
  })

  it('rejects NaN', () => {
    expect(isPlausibleEstimate({ ...base, kcal: NaN })).toBe(false)
  })

  it('rejects Infinity', () => {
    expect(isPlausibleEstimate({ ...base, carbs_g: Infinity })).toBe(false)
  })
})

// Bugfix 2026-08-03: query variants × endpoints wurden sequenziell mit je 5s Timeout probiert —
// bei einer Zutat ohne Treffer im Worst Case ~40s. Jetzt laufen alle Kombinationen parallel;
// diese Tests stellen sicher, dass dabei die ursprüngliche Prioritätsreihenfolge (erste
// Query-Variante vor zweiter, erster Endpoint vor zweitem) erhalten bleibt — unabhängig davon,
// welcher parallele Request zuerst durchkommt.
describe('queryOpenFoodFacts', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function mockProduct(kcal: number) {
    return {
      products: [{ product_name: 'Testprodukt', nutriments: { 'energy-kcal_100g': kcal, proteins_100g: 1, carbohydrates_100g: 2, sugars_100g: 3, fat_100g: 4, fiber_100g: 5 } }],
    }
  }

  it('prefers the first query/endpoint combination even if a later one resolves first', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      const isFirstQuery = url.includes(encodeURIComponent('Bio Joghurt Test'))
      const isDe = url.includes('de.openfoodfacts.org')
      if (isFirstQuery && isDe) {
        // first-priority combination: not ok, should NOT be picked
        return Promise.resolve({ ok: false } as Response)
      }
      if (isFirstQuery && !isDe) {
        // second-priority combination: succeeds — this is the expected winner
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockProduct(111)) } as Response)
      }
      // lower-priority combinations: also succeed, with a different value, to prove they're ignored
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockProduct(999)) } as Response)
    }))

    const result = await queryOpenFoodFacts('Bio Joghurt Test')
    expect(result?.per100g.kcal).toBe(111)
  })

  it('returns null when every combination fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false } as Response)))
    const result = await queryOpenFoodFacts('Unbekannte Zutat')
    expect(result).toBeNull()
  })

  it('returns null when a request throws (e.g. timeout)', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('timeout'))))
    const result = await queryOpenFoodFacts('Langsame Zutat')
    expect(result).toBeNull()
  })
})
