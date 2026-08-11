#!/usr/bin/env node
/**
 * One-time backfill: recompute recipes.saettigungs_matrix for all existing recipes with
 * the new Drei-Säulen-Modell ("Complete"-Umstrukturierung, 2026-08-11).
 *
 * Recipes are the one place in this refinement where a backfill makes sense (unlike
 * meal_analyses, whose photo-analyses can't be recomputed) — saettigungs_matrix is
 * deterministic from ingredients + servings, so recomputing is safe and correct, not
 * just convenient. After this runs, every recipe has the new { saeulen, gesamtbewertung }
 * shape — no dual-format rendering needed on the recipe side.
 *
 * Usage: node scripts/backfill-rezept-saettigungsmatrix.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.dirname(__dirname)

function loadEnv() {
  const envPath = path.join(projectRoot, '.env.local')
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...valueParts] = trimmed.split('=')
    if (key && valueParts.length) process.env[key.trim()] = valueParts.join('=').trim()
  }
}

// ─── toGrams (mirrors src/lib/units.ts — kept in sync manually, see that file) ─
const UNIT_MAP = {
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
const STUECK_WEIGHTS = [
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
function toGrams(amount, unit, ingredientName) {
  const u = String(unit).toLowerCase().trim()
  if (UNIT_MAP[u] != null) return amount * UNIT_MAP[u]
  if (u === 'stück' || u === 'st' || u === 'stk' || u === '') {
    for (const [pattern, weight] of STUECK_WEIGHTS) {
      if (pattern.test(ingredientName)) return amount * weight
    }
    return amount * 80
  }
  return null
}

// ─── calculateRezeptMatrix (mirrors src/lib/saettigungs-matrix-rezept.ts) ──────
const VOLUMEN_KEYWORDS = [
  'salat', 'blattsalat', 'feldsalat', 'rucola', 'spinat', 'kopfsalat', 'eisberg', 'romanasalat',
  'gurke', 'zucchini', 'brokkoli', 'blumenkohl', 'weißkohl', 'rotkohl', 'grünkohl', 'lauch', 'porree',
  'champignon', 'pilze', 'tomate', 'paprika', 'karotte', 'möhre', 'fenchel', 'staudensellerie', 'bleichsellerie',
  'heidelbeere', 'blaubeere', 'erdbeere', 'himbeere', 'brombeere', 'beere', 'wassermelone',
  'radieschen', 'sauerkraut',
]
const VOLUMEN_EXCLUSION_TERMS = [
  'pulver', 'extrakt', 'mark',
  'öl', 'essig', 'gewürz', 'gewürzmischung', 'mehl', 'stärke', 'sirup',
  'getrocknet', 'gerebelt', 'gemahlen', 'rosenscharf', 'edelsüß', 'geräuchert',
  'knoblauch', 'zwiebel', 'schalotte', 'ingwer', 'chili',
]
function isVolumenZutat(name) {
  if (VOLUMEN_EXCLUSION_TERMS.some(ex => name.includes(ex))) return false
  return VOLUMEN_KEYWORDS.some(kw => name.includes(kw))
}
const RATING_ORDER = ['ungenuegend', 'gering', 'mittel', 'gut']
function worseOf(a, b) {
  return RATING_ORDER.indexOf(a) <= RATING_ORDER.indexOf(b) ? a : b
}

function calculateRezeptMatrix(ingredients, macros, servings) {
  const proteinProPortion = macros?.protein_g ?? 0
  const ballaststoffeProPortion = macros?.ballaststoffe_g ?? macros?.fiber_g ?? 0
  const kcalProPortion = macros?.kcal ?? 0

  const protG = Math.round(proteinProPortion)
  const proteine =
    protG >= 30 ? { rating: 'gut', erklaerung: `${protG}g Protein pro Portion — starkes Sättigungssignal über GLP-1 und PYY.` }
    : protG >= 20 ? { rating: 'mittel', erklaerung: `${protG}g Protein pro Portion. Solide — eine etwas größere Proteinquelle würde noch mehr rausholen.` }
    : protG >= 10 ? { rating: 'gering', erklaerung: `${protG}g Protein pro Portion. Noch ausbaufähig — eine Ei-, Quark- oder Hülsenfrucht-Ergänzung würde helfen.` }
    : { rating: 'ungenuegend', erklaerung: `Nur ${protG}g Protein pro Portion. Proteine sind knapp — das verkürzt die Sättigungsdauer deutlich.` }

  const fiberG = Math.round(ballaststoffeProPortion)
  const ballaststoffe =
    fiberG >= 10 ? { rating: 'gut', erklaerung: `${fiberG}g Ballaststoffe pro Portion — verlangsamen die Verdauung und strecken das Sättigungsfenster deutlich.` }
    : fiberG >= 5 ? { rating: 'mittel', erklaerung: `${fiberG}g Ballaststoffe pro Portion. Gut — noch mehr Gemüse, Hülsenfrüchte oder Vollkorn würde die Sättigungsdauer weiter verlängern.` }
    : fiberG >= 3 ? { rating: 'gering', erklaerung: `${fiberG}g Ballaststoffe pro Portion. Noch ausbaufähig — mehr Gemüse oder Hülsenfrüchte würden hier viel bewirken.` }
    : { rating: 'ungenuegend', erklaerung: `Nur ${fiberG}g Ballaststoffe pro Portion. Mehr Gemüse, Hülsenfrüchte oder Vollkornprodukte würden hier viel bewirken.` }

  const gramsPerIngredient = ingredients.map(ing => ({
    name: ing.name.toLowerCase(),
    grams: toGrams(ing.amount, ing.unit, ing.name),
  }))
  const totalGramsWholeRecipe = gramsPerIngredient.reduce((sum, i) => sum + (i.grams ?? 0), 0)
  const totalGramsProPortion = servings > 0 ? totalGramsWholeRecipe / servings : 0
  const energiedichte = totalGramsProPortion > 0 ? kcalProPortion / totalGramsProPortion : 0
  const energiedichteRating =
    energiedichte > 0 && energiedichte < 1.0 ? 'gut'
    : energiedichte < 1.5 ? 'mittel'
    : energiedichte < 2.25 ? 'gering'
    : 'ungenuegend'

  const gemueseGrammeWholeRecipe = gramsPerIngredient.filter(i => isVolumenZutat(i.name)).reduce((sum, i) => sum + (i.grams ?? 0), 0)
  const gemueseGrammeProPortion = servings > 0 ? gemueseGrammeWholeRecipe / servings : 0
  const gemueseRating =
    gemueseGrammeProPortion >= 200 ? 'gut'
    : gemueseGrammeProPortion >= 100 ? 'mittel'
    : 'ungenuegend'

  const volumenRating = worseOf(energiedichteRating, gemueseRating)
  const gemueseGRund = Math.round(gemueseGrammeProPortion)
  const volumen = {
    rating: volumenRating,
    erklaerung:
      volumenRating === 'gut' ? `Ca. ${gemueseGRund}g Gemüse pro Portion bei moderater Energiedichte — füllt den Magen ohne viele Kalorien zu liefern.`
      : volumenRating === 'mittel' ? `Ca. ${gemueseGRund}g Gemüse pro Portion. Etwas mehr wasserreiches Gemüse würde den Füllungseffekt weiter verstärken.`
      : energiedichteRating === 'ungenuegend' ? `Energiedicht bei wenig Eigenvolumen (ca. ${gemueseGRund}g Gemüse pro Portion). Eine volumenreiche Ergänzung (Salat, Gemüse) würde hier viel bewirken.`
      : `Wenig Eigenvolumen (ca. ${gemueseGRund}g Gemüse pro Portion). Mehr Gemüse oder Beeren würden das Magenvolumen erhöhen, ohne viele Kalorien beizusteuern.`,
  }

  const saeulen = { proteine, ballaststoffe, volumen }
  const gutCount = Object.values(saeulen).filter(s => s.rating === 'gut').length
  const gesamtbewertung = gutCount === 3 ? 'sehr_saettigend' : gutCount === 2 ? 'maessig_saettigend' : 'wenig_saettigend'

  return { saeulen, gesamtbewertung }
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  loadEnv()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) throw new Error('Env vars fehlen')

  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }

  const recipesRes = await fetch(`${supabaseUrl}/rest/v1/recipes?select=id,servings,macros_per_serving`, { headers })
  const recipes = await recipesRes.json()
  console.log(`${recipes.length} Rezepte gefunden\n`)

  let updated = 0
  for (const recipe of recipes) {
    const ingRes = await fetch(
      `${supabaseUrl}/rest/v1/recipe_ingredients?recipe_id=eq.${recipe.id}&item_type=eq.zutat&select=name,amount,unit`,
      { headers }
    )
    const ingredients = await ingRes.json()
    process.stdout.write(`  ${recipe.id.slice(0, 8)}… `)

    const matrix = calculateRezeptMatrix(ingredients, recipe.macros_per_serving, recipe.servings)

    const updateRes = await fetch(`${supabaseUrl}/rest/v1/recipes?id=eq.${recipe.id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ saettigungs_matrix: matrix }),
    })

    if (updateRes.ok) {
      console.log(`✓ ${matrix.gesamtbewertung}`)
      updated++
    } else {
      console.log(`✗ Fehler: ${await updateRes.text()}`)
    }
  }

  console.log(`\n${updated}/${recipes.length} Rezepte aktualisiert.`)
}

main().catch(err => { console.error(err); process.exit(1) })
