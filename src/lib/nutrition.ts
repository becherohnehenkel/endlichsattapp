// Shared nutrition lookup — BLS database + fallback to USDA/OFFs

import { createAdminClient } from '@/lib/supabase/admin'

export interface NutritionPer100g {
  kcal: number
  protein_g: number
  carbs_g: number
  sugar_g: number
  fat_g: number
  fiber_g: number
}

interface NutritionSource {
  per100g: NutritionPer100g
}

export interface MacrosPerServing {
  kcal: number
  protein_g: number
  kohlenhydrate_g: number
  zucker_g: number
  fett_g: number
  ballaststoffe_g: number
}

// ─── Unit → grams conversion ────────────────────────────────

const UNIT_MAP: Record<string, number> = {
  g: 1, gr: 1, gramm: 1,
  kg: 1000, kilogramm: 1000,
  ml: 1, milliliter: 1,
  l: 1000, liter: 1000,
  el: 15, esslöffel: 15,
  tl: 5, teelöffel: 5,
  msp: 0.5,
  prise: 1,
  handvoll: 30,
  scheibe: 25,
  dose: 400,
  packung: 250,
  zehe: 5,
}

// Ingredient-specific weights for "Stück" (piece) in grams
const STUECK_WEIGHTS: [RegExp, number][] = [
  [/ei$|eier|ei\b/i, 60],
  [/zwiebel/i, 100],
  [/knoblauch/i, 5],
  [/tomate/i, 120],
  [/karotte|möhre/i, 80],
  [/avocado/i, 200],
  [/banane/i, 120],
  [/apfel/i, 180],
  [/zitrone/i, 100],
  [/paprika/i, 150],
  [/gurke/i, 300],
]

function toGrams(amount: number, unit: string, ingredientName: string): number | null {
  const u = unit.toLowerCase().trim()
  if (UNIT_MAP[u] != null) return amount * UNIT_MAP[u]

  if (u === 'stück' || u === 'st' || u === 'stk' || u === '') {
    for (const [pattern, weight] of STUECK_WEIGHTS) {
      if (pattern.test(ingredientName)) return amount * weight
    }
    return amount * 80 // generic fallback
  }
  return null
}

// ─── BLS database lookup (primary) ──────────────────────────

export async function queryBLS(ingredient: string): Promise<NutritionSource | null> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('bls_lebensmittel')
      .select('kcal_100g, protein_g_100g, fat_g_100g, carbs_g_100g, fiber_g_100g, sugar_g_100g')
      .ilike('name_de', `%${ingredient}%`)
      .limit(1)
      .single()

    if (!data) return null
    return {
      per100g: {
        kcal:      Number(data.kcal_100g ?? 0),
        protein_g: Number(data.protein_g_100g ?? 0),
        carbs_g:   Number(data.carbs_g_100g ?? 0),
        sugar_g:   Number(data.sugar_g_100g ?? 0),
        fat_g:     Number(data.fat_g_100g ?? 0),
        fiber_g:   Number(data.fiber_g_100g ?? 0),
      },
    }
  } catch {
    return null
  }
}

// ─── USDA fallback (English ingredients / no BLS match) ─────

export async function queryUSDA(ingredient: string): Promise<NutritionSource | null> {
  const apiKey = process.env.USDA_API_KEY
  if (!apiKey) return null
  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(ingredient)}&api_key=${apiKey}&pageSize=3&dataType=Foundation,SR%20Legacy`
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const data = await res.json()
    const food = data.foods?.[0]
    if (!food) return null
    type FoodNutrient = { nutrientName: string; value: number; unitName: string }
    const nutrients: FoodNutrient[] = food.foodNutrients ?? []
    const get = (kw: string) =>
      nutrients.find(n => n.nutrientName?.toLowerCase().includes(kw.toLowerCase()))?.value ?? 0
    const kcal = nutrients.find(
      n => n.nutrientName?.toLowerCase().includes('energy') && n.unitName === 'KCAL'
    )?.value ?? get('energy')
    return {
      per100g: {
        kcal:      Number(kcal),
        protein_g: Number(get('protein')),
        carbs_g:   Number(get('carbohydrate')),
        sugar_g:   Number(get('sugars')),
        fat_g:     Number(get('total lipid')),
        fiber_g:   Number(get('fiber')),
      },
    }
  } catch {
    return null
  }
}

export async function queryOpenFoodFacts(ingredient: string): Promise<NutritionSource | null> {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(ingredient)}&json=1&page_size=3&fields=product_name,nutriments`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'endlichsatt/1.0 (satiety analysis app)' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const product = data.products?.[0]
    if (!product?.nutriments) return null
    const n = product.nutriments
    return {
      per100g: {
        kcal:      Number(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0),
        protein_g: Number(n['proteins_100g'] ?? n['proteins'] ?? 0),
        carbs_g:   Number(n['carbohydrates_100g'] ?? n['carbohydrates'] ?? 0),
        sugar_g:   Number(n['sugars_100g'] ?? n['sugars'] ?? 0),
        fat_g:     Number(n['fat_100g'] ?? n['fat'] ?? 0),
        fiber_g:   Number(n['fiber_100g'] ?? n['fiber'] ?? 0),
      },
    }
  } catch {
    return null
  }
}

// ─── Recipe macro calculation ────────────────────────────────

export async function calculateMacrosPerServing(
  ingredients: { name: string; amount: number; unit: string; macros_per_100g?: NutritionPer100g | null }[],
  servings: number
): Promise<MacrosPerServing | null> {
  const totals = { kcal: 0, protein_g: 0, carbs_g: 0, sugar_g: 0, fat_g: 0, fiber_g: 0 }
  let anyFound = false

  const results = await Promise.all(
    ingredients.map(async (ing) => {
      const grams = toGrams(ing.amount, ing.unit, ing.name)
      if (grams === null || grams <= 0) return null

      // 1. Stored BLS data (admin selected from live search)
      // 2. BLS database lookup by name
      // 3. USDA API fallback (for non-German / exotic ingredients)
      // 4. Open Food Facts as last resort
      const per100g =
        ing.macros_per_100g ??
        (await queryBLS(ing.name))?.per100g ??
        (await queryUSDA(ing.name))?.per100g ??
        (await queryOpenFoodFacts(ing.name))?.per100g

      if (!per100g) return null
      const factor = grams / 100
      return {
        kcal:      per100g.kcal * factor,
        protein_g: per100g.protein_g * factor,
        carbs_g:   per100g.carbs_g * factor,
        sugar_g:   per100g.sugar_g * factor,
        fat_g:     per100g.fat_g * factor,
        fiber_g:   per100g.fiber_g * factor,
      }
    })
  )

  for (const r of results) {
    if (!r) continue
    anyFound = true
    totals.kcal      += r.kcal
    totals.protein_g += r.protein_g
    totals.carbs_g   += r.carbs_g
    totals.sugar_g   += r.sugar_g
    totals.fat_g     += r.fat_g
    totals.fiber_g   += r.fiber_g
  }

  if (!anyFound) return null

  const round = (n: number) => Math.round(n / servings)
  return {
    kcal:            round(totals.kcal),
    protein_g:       round(totals.protein_g),
    kohlenhydrate_g: round(totals.carbs_g),
    zucker_g:        round(totals.sugar_g),
    fett_g:          round(totals.fat_g),
    ballaststoffe_g: round(totals.fiber_g),
  }
}
