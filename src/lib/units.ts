// Reine Mengen→Gramm-Umrechnung, ohne Server-Abhängigkeiten (kein Supabase-Import) —
// darf im Gegensatz zu src/lib/nutrition.ts sicher auch in Client-Komponenten importiert
// werden, ohne den Admin-Client (Service-Role-Key) ins Client-Bundle zu ziehen.

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

export function toGrams(amount: number, unit: string, ingredientName: string): number | null {
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
