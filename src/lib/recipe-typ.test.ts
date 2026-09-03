import { describe, it, expect } from 'vitest'
import {
  matchesRecipeTypFilter,
  RECIPE_TYP_DB_VALUES,
  RECIPE_TYP_FORMULAR_OPTIONEN,
  RECIPE_TYP_FILTER_OPTIONEN,
  RECIPE_TYP_KONTEXT_HINWEIS,
} from './recipe-typ'

describe('matchesRecipeTypFilter', () => {
  it('"alle" matched immer, unabhängig vom Wert', () => {
    expect(matchesRecipeTypFilter(null, 'alle')).toBe(true)
    expect(matchesRecipeTypFilter('beilage', 'alle')).toBe(true)
    expect(matchesRecipeTypFilter('grundlage', 'alle')).toBe(true)
    expect(matchesRecipeTypFilter('snack', 'alle')).toBe(true)
  })

  it('"mahlzeiten" matched nur null (vollständiges Gericht)', () => {
    expect(matchesRecipeTypFilter(null, 'mahlzeiten')).toBe(true)
    expect(matchesRecipeTypFilter('beilage', 'mahlzeiten')).toBe(false)
    expect(matchesRecipeTypFilter('grundlage', 'mahlzeiten')).toBe(false)
    expect(matchesRecipeTypFilter('snack', 'mahlzeiten')).toBe(false)
  })

  it('"beilage"/"grundlage"/"snack" matchen nur den exakt gleichen Wert', () => {
    expect(matchesRecipeTypFilter('beilage', 'beilage')).toBe(true)
    expect(matchesRecipeTypFilter('grundlage', 'beilage')).toBe(false)
    expect(matchesRecipeTypFilter('snack', 'beilage')).toBe(false)
    expect(matchesRecipeTypFilter(null, 'beilage')).toBe(false)

    expect(matchesRecipeTypFilter('snack', 'snack')).toBe(true)
    expect(matchesRecipeTypFilter('beilage', 'snack')).toBe(false)
  })
})

describe('zentrale Werte-Liste', () => {
  it('RECIPE_TYP_DB_VALUES enthält genau die 3 erwarteten Werte', () => {
    expect(RECIPE_TYP_DB_VALUES).toEqual(['beilage', 'grundlage', 'snack'])
  })

  it('RECIPE_TYP_FORMULAR_OPTIONEN enthält 4 Optionen inkl. "vollstaendig"', () => {
    expect(RECIPE_TYP_FORMULAR_OPTIONEN.map(o => o.value)).toEqual([
      'vollstaendig', 'beilage', 'grundlage', 'snack',
    ])
  })

  it('RECIPE_TYP_FILTER_OPTIONEN enthält 5 Optionen inkl. "alle" und "mahlzeiten"', () => {
    expect(RECIPE_TYP_FILTER_OPTIONEN.map(o => o.value)).toEqual([
      'alle', 'mahlzeiten', 'beilage', 'grundlage', 'snack',
    ])
  })

  it('RECIPE_TYP_KONTEXT_HINWEIS deckt alle 3 DB-Werte ab', () => {
    for (const value of RECIPE_TYP_DB_VALUES) {
      expect(RECIPE_TYP_KONTEXT_HINWEIS[value].badge).toBeTruthy()
      expect(RECIPE_TYP_KONTEXT_HINWEIS[value].text).toBeTruthy()
    }
  })
})
