import { NextResponse } from 'next/server'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const ingredientSchema = z.object({
  name: z.string().min(1).max(200),
  amount: z.string().min(1).max(50),
})

const schema = z.object({
  mealId: z.string().uuid(),
  ingredients: z.array(ingredientSchema).min(1).max(30),
})

// ─── Nutrition database helpers ─────────────────────────────

interface NutritionPer100g {
  kcal: number
  protein_g: number
  carbs_g: number
  sugar_g: number
  fat_g: number
  fiber_g: number
}

interface NutritionSource {
  source: 'open_food_facts' | 'usda' | 'schaetzung'
  sourceName: string
  per100g: NutritionPer100g
}

async function queryOpenFoodFacts(ingredient: string): Promise<NutritionSource | null> {
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
      source: 'open_food_facts',
      sourceName: product.product_name ?? ingredient,
      per100g: {
        kcal: Number(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0),
        protein_g: Number(n['proteins_100g'] ?? n['proteins'] ?? 0),
        carbs_g: Number(n['carbohydrates_100g'] ?? n['carbohydrates'] ?? 0),
        sugar_g: Number(n['sugars_100g'] ?? n['sugars'] ?? 0),
        fat_g: Number(n['fat_100g'] ?? n['fat'] ?? 0),
        fiber_g: Number(n['fiber_100g'] ?? n['fiber'] ?? 0),
      },
    }
  } catch {
    return null
  }
}

async function queryUSDA(ingredient: string): Promise<NutritionSource | null> {
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

    const get = (keyword: string) =>
      nutrients.find(n => n.nutrientName?.toLowerCase().includes(keyword.toLowerCase()))?.value ?? 0

    const kcal =
      nutrients.find(
        n => n.nutrientName?.toLowerCase().includes('energy') && n.unitName === 'KCAL'
      )?.value ?? get('energy')

    return {
      source: 'usda',
      sourceName: food.description ?? ingredient,
      per100g: {
        kcal: Number(kcal),
        protein_g: Number(get('protein')),
        carbs_g: Number(get('carbohydrate')),
        sugar_g: Number(get('sugars')),
        fat_g: Number(get('total lipid')),
        fiber_g: Number(get('fiber')),
      },
    }
  } catch {
    return null
  }
}

function formatNutrition(n: NutritionPer100g): string {
  return `${n.kcal} kcal, ${n.protein_g}g Protein, ${n.carbs_g}g KH (${n.sugar_g}g Zucker), ${n.fat_g}g Fett, ${n.fiber_g}g Ballaststoffe`
}

// ─── Full analysis prompt ────────────────────────────────────

const ANALYSIS_SYSTEM_PROMPT = `Du bist der Sättigungs-Assistent von endlichsatt. Du analysierst Mahlzeiten anhand der Sättigungs-Matrix mit 6 Bausteinen. Du bist präzise, herzlich und nie bevormundend.

Was du nie tust: "weniger essen" empfehlen, moralisieren, Light-Produkte vorschlagen, Zutaten entfernen die der Nutzer mag.

## Die 6 Bausteine (bewerte jeden: gut / mittel / schwach)

**Geschmack** — gut: mehrere Dimensionen aktiv (Textur, Temperatur, Fett, Salz, Säure, Umami, Röstaromen) | mittel: 1–2 Dimensionen | schwach: monoton

**Biss** — gut: echter Kauaufwand (Nüsse, Kerne, rohes/bissfestes Gemüse, knusprig Gebackenes) | mittel: etwas Biss | schwach: alles weich/breiig/flüssig

**Ballaststoffe** — gut: Vollkorn, Hülsenfrüchte, Nüsse, Gemüse klar präsent | mittel: ansatzweise | schwach: kaum Ballaststoffe

**Proteine** — gut: proteindichte Quelle in ausreichender Menge (Fisch/Fleisch ~25-30% Protein, Quark/Joghurt >100g, Hülsenfrüchte als Hauptzutat) | mittel: Protein vorhanden aber ineffizient | schwach: keine nennenswerte Quelle

**Volumen** — gut: viel Gemüse/Salat/quellende Lebensmittel | mittel: etwas Volumen | schwach: kalorisch dicht, wenig physisches Volumen

**Art of Eating** — gut: sitzend, ablenkungsfrei, langsam | mittel: teilweise bewusst | schwach: im Stehen, mit Ablenkung | nicht_bewertet: wenn nicht angegeben (dann freundlichen Tipp am Ende)

## Gesamtbewertung
5–6 gut: sehr_saettigend | 3–4 gut: maessig_saettigend | 0–2 gut: wenig_saettigend

## Verbesserungsvorschläge (1–3)
Priorität: Biss → Ballaststoffe → Volumen → Geschmack → Proteine → Art of Eating
Regeln: geschmacklich passend, konkret mit Menge ("eine Handvoll Walnüsse ca. 30g"), minimaler Aufwand, kein Light/Diät/Weniger-Essen

## Nährstoffberechnung
Berechne Gesamtnährstoffe aus den bereitgestellten Daten. Mengenumrechnung: 1 EL Öl ≈ 10g, 1 EL Butter ≈ 15g, 1 Handvoll Nüsse ≈ 30g, Pasta ungekocht ≈ 80g, Fleisch ≈ 150g, Fisch ≈ 130g.
Wenn keine Datenbankwerte vorhanden: nutze eigenes Ernährungswissen, Quelle dann "schaetzung".

Antworte AUSSCHLIESSLICH mit gültigem JSON ohne Text davor oder danach:
{
  "zutatenliste": [{"name": "...", "amount": "...", "source": "open_food_facts|usda|schaetzung", "sourceName": "..."}],
  "annahmen": ["..."],
  "vorher": {
    "bausteine": {"geschmack": "gut|mittel|schwach", "biss": "gut|mittel|schwach", "ballaststoffe": "gut|mittel|schwach", "proteine": "gut|mittel|schwach", "volumen": "gut|mittel|schwach", "art_of_eating": "gut|mittel|schwach|nicht_bewertet"},
    "gesamtbewertung": "sehr_saettigend|maessig_saettigend|wenig_saettigend",
    "erklaerung": "2-4 Sätze auf Deutsch, warm, Fokus auf schwache/mittlere Bausteine",
    "naehrwerte": {"kcal": 0, "protein_g": 0, "kohlenhydrate_g": 0, "zucker_g": 0, "fett_g": 0, "ballaststoffe_g": 0}
  },
  "vorschlaege": [{"aktion": "...", "begruendung": "...", "baustein": "biss|ballaststoffe|volumen|geschmack|proteine|art_of_eating"}],
  "nachher": {
    "bausteine": {"geschmack": "...", "biss": "...", "ballaststoffe": "...", "proteine": "...", "volumen": "...", "art_of_eating": "..."},
    "gesamtbewertung": "...",
    "naehrwerte": {"kcal": 0, "protein_g": 0, "kohlenhydrate_g": 0, "zucker_g": 0, "fett_g": 0, "ballaststoffe_g": 0},
    "deltas": [{"wert": "protein_g", "vorher": 0, "nachher": 0, "veraenderung": 0}]
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

  // Query both nutrition databases for each ingredient in parallel
  const nutritionResults = await Promise.all(
    ingredients.map(async (ingredient) => {
      const [off, usda] = await Promise.all([
        queryOpenFoodFacts(ingredient.name),
        queryUSDA(ingredient.name),
      ])
      return { ingredient, off, usda }
    })
  )

  // Build context block for Claude
  const ingredientLines = nutritionResults.map(({ ingredient, off, usda }) => {
    const lines = [`- ${ingredient.name}: ${ingredient.amount}`]
    if (off) lines.push(`  Open Food Facts (${off.sourceName}): ${formatNutrition(off.per100g)} pro 100g`)
    if (usda) lines.push(`  USDA (${usda.sourceName}): ${formatNutrition(usda.per100g)} pro 100g`)
    if (!off && !usda) lines.push(`  Keine Datenbankwerte — bitte eigenes Ernährungswissen nutzen`)
    return lines.join('\n')
  })

  const mealContext = meal.free_text
    ? `Ursprüngliche Beschreibung: ${meal.free_text}`
    : 'Ursprüngliche Eingabe: (nur Foto)'

  const userMessage = [
    mealContext,
    '',
    'Bestätigte Zutatenliste mit Nährstoffdaten (pro 100g aus Datenbanken):',
    ...ingredientLines,
    '',
    'Bitte führe die vollständige Sättigungs-Analyse durch.',
    'Berechne die Gesamtnährstoffe für die angegebenen Mengen.',
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

  type AnalysisResult = {
    zutatenliste: { name: string; amount: string; source: string; sourceName: string }[]
    annahmen: string[]
    vorher: {
      bausteine: Record<string, string>
      gesamtbewertung: string
      erklaerung: string
      naehrwerte: Record<string, number>
    }
    vorschlaege: { aktion: string; begruendung: string; baustein: string }[]
    nachher: {
      bausteine: Record<string, string>
      gesamtbewertung: string
      naehrwerte: Record<string, number>
      deltas: { wert: string; vorher: number; nachher: number; veraenderung: number }[]
    }
    art_of_eating_tipp: string | null
  }

  let result: AnalysisResult
  try {
    result = JSON.parse(raw)
  } catch {
    console.error('[analyse/confirm] Claude non-JSON:', raw)
    return NextResponse.json({ error: 'Analyse konnte nicht verarbeitet werden. Bitte erneut versuchen.' }, { status: 500 })
  }

  // Persist to meal_analyses
  const { data: analysis, error: insertError } = await supabase
    .from('meal_analyses')
    .insert({
      meal_id: mealId,
      refined_ingredients: {
        ingredients: result.zutatenliste,
        assumptions: result.annahmen,
      },
      macros_before: result.vorher.naehrwerte,
      macros_after: result.nachher.naehrwerte,
      satiety_scores_before: {
        pillars: result.vorher.bausteine,
        overall: result.vorher.gesamtbewertung,
        explanation: result.vorher.erklaerung,
      },
      satiety_scores_after: {
        pillars: result.nachher.bausteine,
        overall: result.nachher.gesamtbewertung,
        deltas: result.nachher.deltas,
      },
      improvement: {
        suggestions: result.vorschlaege,
        art_of_eating_tip: result.art_of_eating_tipp,
      },
      data_sources: result.zutatenliste.map(i => ({
        ingredient: i.name,
        source: i.source,
        sourceName: i.sourceName,
      })),
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('[analyse/confirm] DB insert error:', insertError)
    return NextResponse.json({ error: 'Ergebnis konnte nicht gespeichert werden.' }, { status: 500 })
  }

  // Update meal status and delete fullsize photo
  await supabase.from('meals').update({ status: 'completed' }).eq('id', mealId)

  if (meal.photo_fullsize_path) {
    await supabase.storage.from('meal-photos').remove([meal.photo_fullsize_path])
  }

  await supabase
    .from('meal_conversations')
    .update({ status: 'completed' })
    .eq('meal_id', mealId)

  return NextResponse.json({
    analysisId: analysis.id,
    result,
  })
}
