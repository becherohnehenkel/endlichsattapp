import { describe, it, expect } from 'vitest'
import { RecipeIngredientsSchema, RecipeIngredientItemSchema, isZutat } from './recipe-ingredients-schema'

describe('RecipeIngredientItemSchema', () => {
  it('accepts a valid Zutat item', () => {
    const result = RecipeIngredientItemSchema.safeParse({
      item_type: 'zutat', name: 'Reis', amount: 150, unit: 'g',
    })
    expect(result.success).toBe(true)
  })

  it('accepts a valid Gruppe item', () => {
    const result = RecipeIngredientItemSchema.safeParse({
      item_type: 'gruppe', label: 'Für das Dressing',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a Gruppe item with an empty label', () => {
    const result = RecipeIngredientItemSchema.safeParse({ item_type: 'gruppe', label: '  ' })
    expect(result.success).toBe(false)
  })

  it('rejects a Gruppe item with a label over 40 characters', () => {
    const result = RecipeIngredientItemSchema.safeParse({
      item_type: 'gruppe', label: 'x'.repeat(41),
    })
    expect(result.success).toBe(false)
  })

  it('rejects a Zutat item with a negative amount', () => {
    const result = RecipeIngredientItemSchema.safeParse({
      item_type: 'zutat', name: 'Reis', amount: -1, unit: 'g',
    })
    expect(result.success).toBe(false)
  })
})

describe('RecipeIngredientsSchema', () => {
  it('accepts a mixed list of ungrouped and grouped ingredients', () => {
    const result = RecipeIngredientsSchema.safeParse([
      { item_type: 'zutat', name: 'Reis', amount: 150, unit: 'g', sort_order: 0 },
      { item_type: 'gruppe', label: 'Für das Dressing', sort_order: 1 },
      { item_type: 'zutat', name: 'Sojasauce', amount: 30, unit: 'g', sort_order: 2 },
    ])
    expect(result.success).toBe(true)
  })

  it('rejects a list with only group headers (no ingredient)', () => {
    const result = RecipeIngredientsSchema.safeParse([
      { item_type: 'gruppe', label: 'Nur Überschrift', sort_order: 0 },
    ])
    expect(result.success).toBe(false)
  })

  it('rejects a group header immediately followed by another group header', () => {
    const result = RecipeIngredientsSchema.safeParse([
      { item_type: 'zutat', name: 'Reis', amount: 150, unit: 'g', sort_order: 0 },
      { item_type: 'gruppe', label: 'Leere Gruppe', sort_order: 1 },
      { item_type: 'gruppe', label: 'Noch eine', sort_order: 2 },
      { item_type: 'zutat', name: 'Sojasauce', amount: 30, unit: 'g', sort_order: 3 },
    ])
    expect(result.success).toBe(false)
  })

  it('rejects a group header at the end of the list with no following ingredient', () => {
    const result = RecipeIngredientsSchema.safeParse([
      { item_type: 'zutat', name: 'Reis', amount: 150, unit: 'g', sort_order: 0 },
      { item_type: 'gruppe', label: 'Leere Gruppe am Ende', sort_order: 1 },
    ])
    expect(result.success).toBe(false)
  })

  it('accepts ingredients before the first group header (ungrouped)', () => {
    const result = RecipeIngredientsSchema.safeParse([
      { item_type: 'zutat', name: 'Reis', amount: 150, unit: 'g', sort_order: 0 },
      { item_type: 'zutat', name: 'Hähnchen', amount: 200, unit: 'g', sort_order: 1 },
    ])
    expect(result.success).toBe(true)
  })

  it('rejects an empty list', () => {
    const result = RecipeIngredientsSchema.safeParse([])
    expect(result.success).toBe(false)
  })
})

describe('isZutat', () => {
  it('narrows to true for zutat items', () => {
    const parsed = RecipeIngredientItemSchema.parse({ item_type: 'zutat', name: 'Reis', amount: 150, unit: 'g' })
    expect(isZutat(parsed)).toBe(true)
  })

  it('narrows to false for gruppe items', () => {
    const parsed = RecipeIngredientItemSchema.parse({ item_type: 'gruppe', label: 'Dressing' })
    expect(isZutat(parsed)).toBe(false)
  })
})
