import { describe, it, expect } from 'vitest'
import { buildRezeptVorbefuellung } from './rezept-aus-mahlzeit'

const BASE_INPUT = {
  freeText: 'Hähnchenbrust mit Reis',
  createdAt: '2026-08-04T12:00:00Z',
  analysisTyp: null,
  ingredients: [
    { name: 'Hähnchenbrust', grams: 200 },
    { name: 'Reis', grams: 150 },
  ],
  vorschlaege: [
    { aktion: 'Füge einen Klecks griechischen Joghurt hinzu' },
    { aktion: 'Ergänze etwas Gurke' },
  ],
}

describe('buildRezeptVorbefuellung', () => {
  it('übernimmt den Freitext als Titel, wenn vorhanden', () => {
    const result = buildRezeptVorbefuellung({ ...BASE_INPUT, variante: 'wie-gescannt' })
    expect(result.defaultValues.title).toBe('Hähnchenbrust mit Reis')
  })

  it('fällt bei fehlendem Freitext auf einen Datums-Titel zurück', () => {
    const result = buildRezeptVorbefuellung({ ...BASE_INPUT, freeText: null, variante: 'wie-gescannt' })
    expect(result.defaultValues.title).toBe('Mahlzeit vom 04.08.')
  })

  it('fällt bei leerem/nur-Leerzeichen-Freitext ebenfalls auf den Datums-Titel zurück', () => {
    const result = buildRezeptVorbefuellung({ ...BASE_INPUT, freeText: '   ', variante: 'wie-gescannt' })
    expect(result.defaultValues.title).toBe('Mahlzeit vom 04.08.')
  })

  it('setzt Portionen immer auf 1', () => {
    const result = buildRezeptVorbefuellung({ ...BASE_INPUT, variante: 'wie-gescannt' })
    expect(result.defaultValues.servings).toBe('1')
  })

  it('füllt die Zubereitung mit dem Platzhaltertext', () => {
    const result = buildRezeptVorbefuellung({ ...BASE_INPUT, variante: 'wie-gescannt' })
    expect(result.defaultValues.instructions).toBe('Zutaten nach Belieben zubereiten.')
  })

  it('leitet Zutaten-Tags aus den Zutatennamen ab (kleingeschrieben, dedupliziert)', () => {
    const result = buildRezeptVorbefuellung({
      ...BASE_INPUT,
      ingredients: [{ name: 'Hähnchenbrust', grams: 200 }, { name: 'HÄHNCHENBRUST', grams: 50 }, { name: 'Reis', grams: 150 }],
      variante: 'wie-gescannt',
    })
    expect(result.defaultValues.ingredient_tags).toBe('hähnchenbrust, reis')
  })

  it('"wie gescannt": übernimmt Zutaten mit Gramm-Menge und Einheit "g", keine Vorschlags-Zeilen', () => {
    const result = buildRezeptVorbefuellung({ ...BASE_INPUT, variante: 'wie-gescannt' })
    expect(result.defaultValues.ingredients).toEqual([
      { itemType: 'zutat', name: 'Hähnchenbrust', amount: '200', unit: 'g', groupLabel: '' },
      { itemType: 'zutat', name: 'Reis', amount: '150', unit: 'g', groupLabel: '' },
    ])
  })

  it('"mit mehr Sättigung": hängt eine Zeile pro Vorschlag mit leerer Menge/Einheit an', () => {
    const result = buildRezeptVorbefuellung({ ...BASE_INPUT, variante: 'mehr-saettigung' })
    expect(result.defaultValues.ingredients).toEqual([
      { itemType: 'zutat', name: 'Hähnchenbrust', amount: '200', unit: 'g', groupLabel: '' },
      { itemType: 'zutat', name: 'Reis', amount: '150', unit: 'g', groupLabel: '' },
      { itemType: 'zutat', name: 'Füge einen Klecks griechischen Joghurt hinzu', amount: '', unit: '', groupLabel: '' },
      { itemType: 'zutat', name: 'Ergänze etwas Gurke', amount: '', unit: '', groupLabel: '' },
    ])
  })

  it('Beilage + "mit mehr Sättigung": hängt trotz erzwungener Variante keine Vorschlags-Zeilen an', () => {
    const result = buildRezeptVorbefuellung({ ...BASE_INPUT, analysisTyp: 'beilage', variante: 'mehr-saettigung' })
    expect(result.defaultValues.ingredients).toEqual([
      { itemType: 'zutat', name: 'Hähnchenbrust', amount: '200', unit: 'g', groupLabel: '' },
      { itemType: 'zutat', name: 'Reis', amount: '150', unit: 'g', groupLabel: '' },
    ])
  })

  it('leitet recipeTyp "beilage" aus analysisTyp ab', () => {
    const result = buildRezeptVorbefuellung({ ...BASE_INPUT, analysisTyp: 'beilage', variante: 'wie-gescannt' })
    expect(result.recipeTyp).toBe('beilage')
  })

  it('leitet recipeTyp null (vollständiges Gericht) für nicht-Beilage-Analysen ab', () => {
    const result = buildRezeptVorbefuellung({ ...BASE_INPUT, analysisTyp: null, variante: 'wie-gescannt' })
    expect(result.recipeTyp).toBeNull()
  })

  it('ohne Verbesserungsvorschläge: "mit mehr Sättigung" verhält sich identisch zu "wie gescannt"', () => {
    const result = buildRezeptVorbefuellung({ ...BASE_INPUT, vorschlaege: [], variante: 'mehr-saettigung' })
    expect(result.defaultValues.ingredients).toHaveLength(2)
  })

  it('leere Zutatenliste führt zu leeren Tags und leerer Zutatenliste (kein Crash)', () => {
    const result = buildRezeptVorbefuellung({ ...BASE_INPUT, ingredients: [], variante: 'wie-gescannt' })
    expect(result.defaultValues.ingredient_tags).toBe('')
    expect(result.defaultValues.ingredients).toEqual([])
  })
})
