import { describe, it, expect } from 'vitest'
import { calculateRezeptMatrix } from './saettigungs-matrix-rezept'

// Refinement 2026-08-11 ("Complete"-Umstrukturierung): 6 Bausteine → 3 Säulen
// (Protein/Ballaststoffe/Volumen), vier Stufen statt drei. Siehe docs/saettigungsmatrix.md.

describe('calculateRezeptMatrix — Protein', () => {
  it('rates below 10g as ungenuegend', () => {
    const m = calculateRezeptMatrix([], { protein_g: 8, ballaststoffe_g: 0, kcal: 0 }, 1)
    expect(m.saeulen.proteine.rating).toBe('ungenuegend')
  })
  it('rates 10-19g as gering', () => {
    const m = calculateRezeptMatrix([], { protein_g: 15, ballaststoffe_g: 0, kcal: 0 }, 1)
    expect(m.saeulen.proteine.rating).toBe('gering')
  })
  it('rates 20-29g as mittel', () => {
    const m = calculateRezeptMatrix([], { protein_g: 25, ballaststoffe_g: 0, kcal: 0 }, 1)
    expect(m.saeulen.proteine.rating).toBe('mittel')
  })
  it('rates 30g+ as gut', () => {
    const m = calculateRezeptMatrix([], { protein_g: 35, ballaststoffe_g: 0, kcal: 0 }, 1)
    expect(m.saeulen.proteine.rating).toBe('gut')
  })
  it('boundary: exactly 30g is gut (halboffenes Intervall)', () => {
    const m = calculateRezeptMatrix([], { protein_g: 30, ballaststoffe_g: 0, kcal: 0 }, 1)
    expect(m.saeulen.proteine.rating).toBe('gut')
  })
  it('boundary: exactly 29g is mittel, not gut', () => {
    const m = calculateRezeptMatrix([], { protein_g: 29, ballaststoffe_g: 0, kcal: 0 }, 1)
    expect(m.saeulen.proteine.rating).toBe('mittel')
  })
})

describe('calculateRezeptMatrix — Ballaststoffe', () => {
  it('rates below 3g as ungenuegend', () => {
    const m = calculateRezeptMatrix([], { protein_g: 0, ballaststoffe_g: 2, kcal: 0 }, 1)
    expect(m.saeulen.ballaststoffe.rating).toBe('ungenuegend')
  })
  it('rates 3-4g as gering', () => {
    const m = calculateRezeptMatrix([], { protein_g: 0, ballaststoffe_g: 4, kcal: 0 }, 1)
    expect(m.saeulen.ballaststoffe.rating).toBe('gering')
  })
  it('rates 5-9g as mittel', () => {
    const m = calculateRezeptMatrix([], { protein_g: 0, ballaststoffe_g: 7, kcal: 0 }, 1)
    expect(m.saeulen.ballaststoffe.rating).toBe('mittel')
  })
  it('rates 10g+ as gut', () => {
    const m = calculateRezeptMatrix([], { protein_g: 0, ballaststoffe_g: 12, kcal: 0 }, 1)
    expect(m.saeulen.ballaststoffe.rating).toBe('gut')
  })
  it('accepts legacy fiber_g key as fallback', () => {
    const m = calculateRezeptMatrix([], { protein_g: 0, fiber_g: 12, kcal: 0 }, 1)
    expect(m.saeulen.ballaststoffe.rating).toBe('gut')
  })
})

describe('calculateRezeptMatrix — Volumen (Energiedichte + Gemüsemenge)', () => {
  it('rates gut when both energy density is low and vegetables are plenty', () => {
    // 200g Gurke + 100g Tomate = 300g Gemüse, 150 kcal total → 0.5 kcal/g
    const ingredients = [
      { name: 'Gurke', amount: 200, unit: 'g' },
      { name: 'Tomate', amount: 100, unit: 'g' },
    ]
    const m = calculateRezeptMatrix(ingredients, { protein_g: 0, ballaststoffe_g: 0, kcal: 150 }, 1)
    expect(m.saeulen.volumen.rating).toBe('gut')
  })

  it('is capped by low vegetable grams even when energy density is good', () => {
    // Only 50g vegetables, but very low kcal/g overall — vegetable-grams criterion caps it
    const ingredients = [
      { name: 'Gurke', amount: 50, unit: 'g' },
      { name: 'Wasser', amount: 500, unit: 'ml' },
    ]
    const m = calculateRezeptMatrix(ingredients, { protein_g: 0, ballaststoffe_g: 0, kcal: 20 }, 1)
    expect(m.saeulen.volumen.rating).toBe('ungenuegend')
  })

  it('is capped by high energy density even with plenty of vegetables', () => {
    // 250g Gurke (viel Gemüse), aber extrem energiedicht insgesamt (z.B. viel Öl)
    const ingredients = [
      { name: 'Gurke', amount: 250, unit: 'g' },
      { name: 'Olivenöl', amount: 200, unit: 'g' },
    ]
    const m = calculateRezeptMatrix(ingredients, { protein_g: 0, ballaststoffe_g: 0, kcal: 1500 }, 1)
    expect(m.saeulen.volumen.rating).toBe('ungenuegend')
  })

  it('excludes potatoes and small aromatics from vegetable grams', () => {
    const ingredients = [
      { name: 'Kartoffel geschält, roh', amount: 300, unit: 'g' },
      { name: 'Zwiebel', amount: 100, unit: 'g' },
      { name: 'Knoblauch', amount: 10, unit: 'g' },
    ]
    const m = calculateRezeptMatrix(ingredients, { protein_g: 0, ballaststoffe_g: 0, kcal: 50 }, 1)
    // Keine der drei Zutaten zählt als Volumen-Gemüse → ungenuegend trotz "gesundem" Gericht
    expect(m.saeulen.volumen.rating).toBe('ungenuegend')
  })

  it('divides ingredient grams and kcal by servings', () => {
    // 400g Gemüse gesamt, 4 Portionen → 100g/Portion = "mittel"-Grenze
    const ingredients = [{ name: 'Zucchini', amount: 400, unit: 'g' }]
    const m = calculateRezeptMatrix(ingredients, { protein_g: 0, ballaststoffe_g: 0, kcal: 80 }, 4)
    expect(m.saeulen.volumen.rating).toBe('mittel')
  })

  it('handles servings=0 without dividing by zero', () => {
    const ingredients = [{ name: 'Gurke', amount: 100, unit: 'g' }]
    expect(() => calculateRezeptMatrix(ingredients, { protein_g: 0, ballaststoffe_g: 0, kcal: 50 }, 0)).not.toThrow()
  })

  it('treats units toGrams cannot resolve as zero contribution, not a crash', () => {
    const ingredients = [{ name: 'Prise Salz', amount: 1, unit: 'unbekannte-einheit-xyz' }]
    expect(() => calculateRezeptMatrix(ingredients, { protein_g: 0, ballaststoffe_g: 0, kcal: 0 }, 1)).not.toThrow()
  })
})

describe('calculateRezeptMatrix — Gesamtbewertung', () => {
  const gutMacros = { protein_g: 35, ballaststoffe_g: 12, kcal: 100 }
  const gemueseIngredients = [{ name: 'Gurke', amount: 250, unit: 'g' }]

  it('all three gut → sehr_saettigend', () => {
    const m = calculateRezeptMatrix(gemueseIngredients, gutMacros, 1)
    expect(m.saeulen.proteine.rating).toBe('gut')
    expect(m.saeulen.ballaststoffe.rating).toBe('gut')
    expect(m.saeulen.volumen.rating).toBe('gut')
    expect(m.gesamtbewertung).toBe('sehr_saettigend')
  })

  it('two gut → maessig_saettigend', () => {
    const m = calculateRezeptMatrix(gemueseIngredients, { protein_g: 35, ballaststoffe_g: 12, kcal: 100 }, 1)
    // Downgrade one pillar by removing vegetable volume
    const mLowVolumen = calculateRezeptMatrix([], { protein_g: 35, ballaststoffe_g: 12, kcal: 100 }, 1)
    expect(m.saeulen.proteine.rating).toBe('gut')
    expect(mLowVolumen.gesamtbewertung).toBe('maessig_saettigend')
  })

  it('zero or one gut → wenig_saettigend', () => {
    const m = calculateRezeptMatrix([], { protein_g: 2, ballaststoffe_g: 1, kcal: 0 }, 1)
    expect(m.gesamtbewertung).toBe('wenig_saettigend')
  })
})

describe('calculateRezeptMatrix — null macros', () => {
  it('treats missing macros as zero for all pillars, does not throw', () => {
    const m = calculateRezeptMatrix([{ name: 'Gurke', amount: 100, unit: 'g' }], null, 1)
    expect(m.saeulen.proteine.rating).toBe('ungenuegend')
    expect(m.saeulen.ballaststoffe.rating).toBe('ungenuegend')
    expect(m.gesamtbewertung).toBe('wenig_saettigend')
  })
})
