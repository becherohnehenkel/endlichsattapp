import { describe, it, expect } from 'vitest'
import { isPlausibleEstimate } from './nutrition'

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
