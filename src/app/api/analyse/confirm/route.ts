import { NextResponse } from 'next/server'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { queryBLS, type NutritionPer100g } from '@/lib/nutrition'

const ingredientSchema = z.object({
  name: z.string().min(1).max(200),
  amount: z.string().min(1).max(50),
})

const schema = z.object({
  mealId: z.string().uuid(),
  ingredients: z.array(ingredientSchema).min(1).max(30),
})

// ─── Macro computation (server-side, BLS data) ───────────────

interface MacroInput {
  grams: number
  per100g: NutritionPer100g | undefined
}

interface Macros {
  kcal: number
  protein_g: number
  kohlenhydrate_g: number
  zucker_g: number
  fett_g: number
  ballaststoffe_g: number
}

function computeMacros(items: MacroInput[]): Macros {
  const totals = { kcal: 0, protein_g: 0, kohlenhydrate_g: 0, zucker_g: 0, fett_g: 0, ballaststoffe_g: 0 }
  for (const { grams, per100g } of items) {
    if (!per100g || grams <= 0) continue
    const f = grams / 100
    totals.kcal            += per100g.kcal * f
    totals.protein_g       += per100g.protein_g * f
    totals.kohlenhydrate_g += per100g.carbs_g * f
    totals.zucker_g        += per100g.sugar_g * f
    totals.fett_g          += per100g.fat_g * f
    totals.ballaststoffe_g += per100g.fiber_g * f
  }
  return {
    kcal:            Math.round(totals.kcal),
    protein_g:       Math.round(totals.protein_g),
    kohlenhydrate_g: Math.round(totals.kohlenhydrate_g),
    zucker_g:        Math.round(totals.zucker_g),
    fett_g:          Math.round(totals.fett_g),
    ballaststoffe_g: Math.round(totals.ballaststoffe_g),
  }
}

function formatNutrition(n: NutritionPer100g): string {
  return `${n.kcal} kcal, ${n.protein_g}g Protein, ${n.carbs_g}g KH, ${n.fat_g}g Fett, ${n.fiber_g}g Ballaststoffe`
}

// ─── Lean Claude prompt (no macro calculation) ───────────────

const ANALYSIS_SYSTEM_PROMPT = `Du bist der Sättigungs-Assistent von endlichsatt. Du analysierst Mahlzeiten anhand der Sättigungs-Matrix mit 6 Bausteinen. Du bist präzise, herzlich und nie bevormundend.

Was du nie tust: "weniger essen" empfehlen, moralisieren, Light-Produkte vorschlagen, Zutaten entfernen die der Nutzer mag.

## Die 6 Bausteine (bewerte jeden: gut / mittel / schwach)

**Geschmack** — gut: mehrere Dimensionen aktiv (Textur, Temperatur, Fett, Salz, Säure, Umami, Röstaromen) | mittel: 1–2 Dimensionen | schwach: monoton

**Biss** — gut: echter Kauaufwand (Nüsse, Kerne, rohes/bissfestes Gemüse, knusprig Gebackenes) | mittel: etwas Biss | schwach: alles weich/breiig/flüssig

**Ballaststoffe** — gut: Vollkorn, Hülsenfrüchte, Nüsse, Gemüse klar präsent | mittel: ansatzweise | schwach: kaum Ballaststoffe

**Proteine** — gut: proteindichte Quelle in ausreichender Menge (Fisch/Fleisch ~25-30% Protein, Quark/Joghurt >100g, Hülsenfrüchte als Hauptzutat) | mittel: Protein vorhanden aber ineffizient | schwach: keine nennenswerte Quelle

**Volumen** — gut: viel Gemüse/Salat/quellende Lebensmittel | mittel: etwas Volumen | schwach: kalorisch dicht, wenig physisches Volumen

**Art of Eating** — gut: sitzend, ablenkungsfrei, langsam | mittel: teilweise bewusst | schwach: im Stehen, mit Ablenkung | nicht_bewertet: wenn nicht angegeben

## Gesamtbewertung
5–6 gut: sehr_saettigend | 3–4 gut: maessig_saettigend | 0–2 gut: wenig_saettigend

## Verbesserungsvorschläge (1–3)
Priorität: Biss → Ballaststoffe → Volumen → Geschmack → Proteine → Art of Eating
Regeln: geschmacklich passend, konkret, minimaler Aufwand, kein Light/Diät/Weniger-Essen.
Wenn ein Vorschlag eine neue Zutat hinzufügt: "zusatz"-Feld mit deutschem Namen und geschätzten Gramm.
Wenn ein Vorschlag nur die Zubereitung ändert (kein zusatz): "zusatz" weglassen oder null setzen.

## Wichtig: Nährwerte werden vom System berechnet
Du musst KEINE Nährwerte berechnen oder ausgeben. Das System hat eine Datenbank und erledigt das automatisch.
Deine einzige Aufgabe bei Mengen: "grams"-Feld pro Zutat schätzen (wie viel Gramm die Menge entspricht).

Antworte AUSSCHLIESSLICH mit gültigem JSON ohne Text davor oder danach:
{
  "zutatenliste": [{"name": "...", "amount": "...", "grams": 0}],
  "annahmen": ["..."],
  "vorher": {
    "bausteine": {"geschmack": "gut|mittel|schwach", "biss": "gut|mittel|schwach", "ballaststoffe": "gut|mittel|schwach", "proteine": "gut|mittel|schwach", "volumen": "gut|mittel|schwach", "art_of_eating": "gut|mittel|schwach|nicht_bewertet"},
    "gesamtbewertung": "sehr_saettigend|maessig_saettigend|wenig_saettigend",
    "erklaerung": "2-4 Sätze auf Deutsch, warm, Fokus auf schwache/mittlere Bausteine"
  },
  "vorschlaege": [{"aktion": "...", "begruendung": "...", "baustein": "biss|ballaststoffe|volumen|geschmack|proteine|art_of_eating", "zusatz": {"name": "...", "grams": 0}}],
  "nachher": {
    "bausteine": {"geschmack": "...", "biss": "...", "ballaststoffe": "...", "proteine": "...", "volumen": "...", "art_of_eating": "..."},
    "gesamtbewertung": "..."
  },
  "art_of_eating_tipp": "1 warmer Satz wenn nicht bewertet, sonst null"
}`

// ─── Route handler ───────────────────────────────────────────

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Ungültiges JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe' }, { status: 400 })
  }
  const { mealId, ingredients } = parsed.data

  const { data: meal } = await supabase
    .from('meals')
    .select('id, user_id, free_text, photo_fullsize_path')
    .eq('id', mealId)
    .eq('user_id', user.id)
    .single()

  if (!meal) return NextResponse.json({ error: 'Mahlzeit nicht gefunden' }, { status: 404 })

  // Query BLS for all ingredients in parallel — results cached for macro computation
  const blsResults = await Promise.all(
    ingredients.map(async (ing) => {
      const bls = await queryBLS(ing.name)
      return { ingredient: ing, per100g: bls?.per100g ?? undefined }
    })
  )

  // Build BLS lookup map (name → per100g) for post-Claude macro computation
  const blsMap = new Map<string, NutritionPer100g>()
  blsResults.forEach(({ ingredient, per100g }) => {
    if (per100g) blsMap.set(ingredient.name, per100g)
  })

  // Build nutrition context block for Claude (qualitative use only)
  const ingredientLines = blsResults.map(({ ingredient, per100g }) => {
    const lines = [`- ${ingredient.name}: ${ingredient.amount}`]
    if (per100g) lines.push(`  BLS-Daten: ${formatNutrition(per100g)} pro 100g`)
    else lines.push(`  Keine BLS-Daten vorhanden`)
    return lines.join('\n')
  })

  const mealContext = meal.free_text
    ? `Ursprüngliche Beschreibung: ${meal.free_text}`
    : 'Ursprüngliche Eingabe: (nur Foto)'

  const userMessage = [
    mealContext,
    '',
    'Bestätigte Zutatenliste mit BLS-Nährwertdaten (pro 100g — nur zur Einschätzung, du musst nichts berechnen):',
    ...ingredientLines,
    '',
    'Bitte führe die vollständige Sättigungs-Analyse durch.',
    'Schätze für jede Zutat die Gramm-Menge im "grams"-Feld.',
  ].join('\n')

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  let response
  try {
    response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })
  } catch (err) {
    if (err instanceof Error && (err as Error & { status?: number }).status === 529) {
      return NextResponse.json({ error: 'Die KI ist gerade überlastet. Bitte in ein paar Sekunden erneut versuchen.' }, { status: 503 })
    }
    throw err
  }

  const raw = response.content[0]?.type === 'text' ? response.content[0].text : ''
  const cleaned = raw.replace(/^```(?:json)?\s*\n?/m, '').replace(/\n?```\s*$/m, '').trim()

  type ClaudeResult = {
    zutatenliste: { name: string; amount: string; grams: number }[]
    annahmen: string[]
    vorher: {
      bausteine: Record<string, string>
      gesamtbewertung: string
      erklaerung: string
    }
    vorschlaege: { aktion: string; begruendung: string; baustein: string; zusatz?: { name: string; grams: number } | null }[]
    nachher: {
      bausteine: Record<string, string>
      gesamtbewertung: string
    }
    art_of_eating_tipp: string | null
  }

  let result: ClaudeResult
  try {
    result = JSON.parse(cleaned)
  } catch {
    console.error('[analyse/confirm] Claude non-JSON:', raw)
    return NextResponse.json({ error: 'Analyse konnte nicht verarbeitet werden. Bitte erneut versuchen.' }, { status: 500 })
  }

  // ─── Server-side macro computation ─────────────────────────

  // Vorher: use Claude's grams estimates + cached BLS data
  const vorherInputs: MacroInput[] = result.zutatenliste.map(z => ({
    grams: z.grams ?? 0,
    per100g: blsMap.get(z.name),
  }))
  const vorherMacros = computeMacros(vorherInputs)

  // Zusatz-Zutaten aus Vorschlägen: neue BLS-Abfragen (nur für Additions)
  const zusatzItems = result.vorschlaege
    .map(v => v.zusatz)
    .filter((z): z is { name: string; grams: number } => !!z && z.grams > 0)

  const zusatzInputs: MacroInput[] = await Promise.all(
    zusatzItems.map(async (z) => {
      const bls = await queryBLS(z.name)
      return { grams: z.grams, per100g: bls?.per100g ?? undefined }
    })
  )

  const nachherMacros = computeMacros([...vorherInputs, ...zusatzInputs])

  // Deltas (nur sinnvolle Unterschiede ≥ 1g / 1 kcal)
  const macroKeys = ['kcal', 'protein_g', 'kohlenhydrate_g', 'zucker_g', 'fett_g', 'ballaststoffe_g'] as const
  const deltas = macroKeys
    .filter(k => Math.abs(nachherMacros[k] - vorherMacros[k]) >= 1)
    .map(k => ({
      wert: k,
      vorher: vorherMacros[k],
      nachher: nachherMacros[k],
      veraenderung: nachherMacros[k] - vorherMacros[k],
    }))

  // Assemble full result (same shape as before for frontend compatibility)
  const fullResult = {
    zutatenliste: result.zutatenliste,
    annahmen: result.annahmen,
    vorher: {
      bausteine: result.vorher.bausteine,
      gesamtbewertung: result.vorher.gesamtbewertung,
      erklaerung: result.vorher.erklaerung,
      naehrwerte: vorherMacros,
    },
    vorschlaege: result.vorschlaege,
    nachher: {
      bausteine: result.nachher.bausteine,
      gesamtbewertung: result.nachher.gesamtbewertung,
      naehrwerte: nachherMacros,
      deltas,
    },
    art_of_eating_tipp: result.art_of_eating_tipp ?? null,
  }

  // ─── Persist to meal_analyses ───────────────────────────────

  const { data: analysis, error: insertError } = await supabase
    .from('meal_analyses')
    .insert({
      meal_id: mealId,
      refined_ingredients: {
        ingredients: fullResult.zutatenliste,
        assumptions: fullResult.annahmen,
      },
      macros_before: fullResult.vorher.naehrwerte as unknown as import('@/types/database').Json,
      macros_after: fullResult.nachher.naehrwerte as unknown as import('@/types/database').Json,
      satiety_scores_before: {
        pillars: fullResult.vorher.bausteine,
        overall: fullResult.vorher.gesamtbewertung,
        explanation: fullResult.vorher.erklaerung,
      },
      satiety_scores_after: {
        pillars: fullResult.nachher.bausteine,
        overall: fullResult.nachher.gesamtbewertung,
        deltas: fullResult.nachher.deltas,
      },
      improvement: {
        suggestions: fullResult.vorschlaege,
        art_of_eating_tip: fullResult.art_of_eating_tipp,
      },
      data_sources: fullResult.zutatenliste.map(i => ({
        ingredient: i.name,
        source: blsMap.has(i.name) ? 'bls' : 'schaetzung',
        sourceName: i.name,
      })),
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('[analyse/confirm] DB insert error:', insertError)
    return NextResponse.json({ error: 'Ergebnis konnte nicht gespeichert werden.' }, { status: 500 })
  }

  await supabase.from('meals').update({ status: 'completed' }).eq('id', mealId)

  if (meal.photo_fullsize_path) {
    await supabase.storage.from('meal-photos').remove([meal.photo_fullsize_path])
  }

  await supabase
    .from('meal_conversations')
    .update({ status: 'completed' })
    .eq('meal_id', mealId)

  return NextResponse.json({ analysisId: analysis.id, result: fullResult })
}
