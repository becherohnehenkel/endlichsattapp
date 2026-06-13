#!/usr/bin/env node
/**
 * Recalculate macros_before + macros_after for all meal_analyses
 * using the BLS Lebensmitteldatenbank.
 *
 * Usage: node scripts/recalculate-analysis-macros.mjs
 *
 * Works with both old format (amount strings) and new format (grams field).
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

// ─── Parse gram weight from amount strings ───────────────────
// Handles: "ca. 40g", "1 Stück (ca. 150g)", "4 EL (ca. 40g)", "200ml", "400g"
function parseGrams(amountStr) {
  if (!amountStr) return null
  const s = String(amountStr)

  // Parenthesized gram value takes priority: "(ca. 30g)" or "(30g)"
  const paren = s.match(/\(ca\.\s*(\d+(?:[,.]\d+)?)\s*(?:[-–]\s*\d+)?\s*g\)/i)
    ?? s.match(/\((\d+(?:[,.]\d+)?)\s*g\)/i)
  if (paren) return parseFloat(paren[1].replace(',', '.'))

  // Standalone gram value: "400g", "ca. 40g"
  const gram = s.match(/(?:ca\.\s*)?(\d+(?:[,.]\d+)?)\s*g\b/i)
  if (gram) return parseFloat(gram[1].replace(',', '.'))

  // ml (treated as grams for liquids/oils)
  const ml = s.match(/(?:ca\.\s*)?(\d+(?:[,.]\d+)?)\s*ml\b/i)
  if (ml) return parseFloat(ml[1].replace(',', '.'))

  return null
}

// ─── Alltagsbegriff → BLS-Bezeichnung ───────────────────────
// Muss mit BLS_ALIASES in src/lib/nutrition.ts synchron bleiben
const BLS_ALIASES = {
  // Milchalternativen
  hafermilch:           'haferdrink',
  mandelmilch:          'mandeldrink',
  reismilch:            'reisdrink',
  sojamilch:            'sojadrink',
  dinkelmilch:          'dinkeldrink',
  kokosmilch:           'kokosmilch',
  // Milchprodukte & Käse
  butter:               'süßrahmbutter',
  milch:                'vollmilch frisch',
  sahne:                'schlagsahne mind. 30',
  mozzarella:           'mozzarella mind. 45',
  parmesan:             'parmesan mind. 30',
  gouda:                'gouda 48',
  skyr:                 'skyr',
  frischkäse:          'frischkäsezubereitung natur, mind. 40',
  magerquark:           'speisequark mager',
  hüttenkäse:          'cottage cheese',
  feta:                 'schafskäse',
  // Eier — kritisch
  eier:                 'hühnerei roh',
  ei:                   'hühnerei roh',
  hühnerei:            'hühnerei roh',
  hühnereier:          'hühnerei roh',
  // Geflügel
  hähnchenbrust:       'hähnchen brustfilet, roh',
  hühnchenbrust:       'hähnchen brustfilet, roh',
  hähnchenbrustfilet:  'hähnchen brustfilet, roh',
  hähnchenfilet:       'hähnchen brustfilet, roh',
  // Fisch & Meeresfrüchte
  lachs:                'lachs roh',
  thunfisch:            'thunfisch roh',
  garnelen:             'garnele',
  // Tomatenprodukte — kritisch
  tomatensauce:         'tomaten passiert',
  tomatensoße:          'tomaten passiert',
  passata:              'tomaten passiert',
  // Getreide & Teigwaren
  nudeln:               'teigwaren eifrei, roh',
  pasta:                'teigwaren eifrei, roh',
  spaghetti:            'teigwaren eifrei, roh',
  penne:                'teigwaren eifrei, roh',
  fusilli:              'teigwaren eifrei, roh',
  rigatoni:             'teigwaren eifrei, roh',
  farfalle:             'teigwaren eifrei, roh',
  tagliatelle:          'eierteigwaren roh',
  haferflocken:         'hafer flocken',
  mehl:                 'weizen mehl, type 405',
  weizenmehl:           'weizen mehl, type 405',
  dinkelmehl:           'dinkel mehl, type 630',
  reis:                 'reis poliert, roh',
  couscous:             'couscous (hartweizen) roh',
  // Gemüse
  brokkoli:             'broccoli roh',
  paprika:              'gemüsepaprika rot, roh',
  'rote paprika':       'gemüsepaprika rot, roh',
  'grüne paprika':      'gemüsepaprika grün, roh',
  'gelbe paprika':      'gemüsepaprika gelb, roh',
  kartoffeln:           'kartoffel',
  zwiebel:              'speisezwiebel roh',
  zwiebeln:             'speisezwiebel roh',
  möhre:                'karotte',
  möhren:               'karotte',
  karotten:             'karotte',
  karotte:              'karotte',
  tomaten:              'tomate roh',
  süßkartoffel:         'batate',
  süßkartoffeln:        'batate',
  sellerie:             'knollensellerie roh',
  stangensellerie:      'bleichsellerie roh',
  champignons:          'champignon roh',
  pilze:                'champignon roh',
  // Hülsenfrüchte (gekochte Form)
  kichererbsen:         'kichererbse reif, gekocht',
  linsen:               'linse reif, gekocht',
  'rote linsen':        'linse rot, reif, gekocht',
  kidneybohnen:         'bohne kidney',
  // Nüsse & Samen
  mandeln:              'mandel süß',
  mandel:               'mandel süß',
  haselnüsse:           'haselnuss',
  chiasamen:            'chia-samen',
  sonnenblumenkerne:    'sonnenblumenkern',
  kürbiskerne:          'kürbiskern',
  // Fette & Öle
  kokosöl:              'kokosfett',
  ghee:                 'butterschmalz',
  // Proteinpulver
  erbsenprotein:        'erbse',
}

function normalizeName(name) {
  const lower = name.toLowerCase().trim()
  return BLS_ALIASES[lower] ?? name
}

// ─── BLS lookup ──────────────────────────────────────────────
async function lookupBLS(supabaseUrl, serviceKey, name) {
  const searchName = normalizeName(name)
  const encoded = encodeURIComponent(`%${searchName}%`)
  const url = `${supabaseUrl}/rest/v1/bls_lebensmittel?name_de=ilike.${encoded}&select=kcal_100g,protein_g_100g,fat_g_100g,carbs_g_100g,fiber_g_100g,sugar_g_100g&limit=1`
  try {
    const res = await fetch(url, {
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data[0] ?? null
  } catch {
    return null
  }
}

// ─── Compute macros from ingredient list ─────────────────────
function computeMacros(items) {
  const t = { kcal: 0, protein_g: 0, kohlenhydrate_g: 0, zucker_g: 0, fett_g: 0, ballaststoffe_g: 0 }
  for (const { grams, bls } of items) {
    if (!bls || !grams || grams <= 0) continue
    const f = grams / 100
    t.kcal            += Number(bls.kcal_100g ?? 0) * f
    t.protein_g       += Number(bls.protein_g_100g ?? 0) * f
    t.kohlenhydrate_g += Number(bls.carbs_g_100g ?? 0) * f
    t.zucker_g        += Number(bls.sugar_g_100g ?? 0) * f
    t.fett_g          += Number(bls.fat_g_100g ?? 0) * f
    t.ballaststoffe_g += Number(bls.fiber_g_100g ?? 0) * f
  }
  return {
    kcal:            Math.round(t.kcal),
    protein_g:       Math.round(t.protein_g),
    kohlenhydrate_g: Math.round(t.kohlenhydrate_g),
    zucker_g:        Math.round(t.zucker_g),
    fett_g:          Math.round(t.fett_g),
    ballaststoffe_g: Math.round(t.ballaststoffe_g),
  }
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  loadEnv()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) throw new Error('Env vars fehlen')

  // Fetch all analyses
  const res = await fetch(`${supabaseUrl}/rest/v1/meal_analyses?select=id,refined_ingredients,improvement`, {
    headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` },
  })
  const analyses = await res.json()
  console.log(`${analyses.length} Analysen gefunden\n`)

  let updated = 0
  let skipped = 0

  for (const analysis of analyses) {
    const ingredients = analysis.refined_ingredients?.ingredients ?? []
    if (ingredients.length === 0) { skipped++; continue }

    process.stdout.write(`  ${analysis.id.slice(0, 8)}… `)

    // ── Vorher: original ingredients ──────────────────────────
    const vorherItems = await Promise.all(
      ingredients.map(async (ing) => {
        // New format has numeric grams field; old format has amount string
        const grams = typeof ing.grams === 'number'
          ? ing.grams
          : parseGrams(ing.amount)
        if (!grams) return { grams: 0, bls: null, name: ing.name }
        const bls = await lookupBLS(supabaseUrl, serviceKey, ing.name)
        return { grams, bls, name: ing.name }
      })
    )

    const vorherFound = vorherItems.filter(i => i.bls).length
    const macrosBefore = computeMacros(vorherItems)

    // ── Nachher: original + additions from suggestions ─────────
    const suggestions = analysis.improvement?.suggestions ?? []
    const zusatzItems = await Promise.all(
      suggestions.map(async (s) => {
        // New format: s.zusatz = { name, grams }
        // Old format: try parsing grams from aktion text
        let name, grams
        if (s.zusatz?.name && s.zusatz?.grams > 0) {
          name = s.zusatz.name
          grams = s.zusatz.grams
        } else if (s.aktion) {
          // Parse gram amount from suggestion text e.g. "(ca. 30g)"
          grams = parseGrams(s.aktion)
          // Extract food name — take first meaningful noun phrase before the gram spec
          // e.g. "Eine Handvoll Walnüsse (ca. 30g)" → search for "Walnüsse"
          const match = s.aktion.match(/(?:Eine?\s+\w+\s+)?(\w{4,}(?:\s+\w{4,})?)\s+\(ca\.?\s*\d+/)
          name = match?.[1] ?? null
        }

        if (!name || !grams) return { grams: 0, bls: null, name: '' }
        const bls = await lookupBLS(supabaseUrl, serviceKey, name)
        return { grams, bls, name }
      })
    )

    const nachherFound = zusatzItems.filter(i => i.bls).length
    const macrosAfter = computeMacros([...vorherItems, ...zusatzItems])

    // Update in Supabase
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/meal_analyses?id=eq.${analysis.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        macros_before: macrosBefore,
        macros_after: macrosAfter,
      }),
    })

    if (updateRes.ok) {
      console.log(`✓  vorher: ${vorherFound}/${ingredients.length} BLS-Treffer, nachher +${nachherFound} Zusätze`)
      updated++
    } else {
      console.log(`✗ Update fehlgeschlagen`)
    }
  }

  console.log(`\nFertig: ${updated} aktualisiert, ${skipped} übersprungen`)
}

main().catch(err => {
  console.error('Fehler:', err.message)
  process.exit(1)
})
