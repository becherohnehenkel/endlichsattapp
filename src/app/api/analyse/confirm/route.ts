import { NextResponse } from 'next/server'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { queryBLS, queryOpenFoodFacts, isPlausibleEstimate, type NutritionPer100g } from '@/lib/nutrition'
import { GESCHMACK_PROMPT_RULES, GESCHMACK_JSON_FIELD, parseGeschmackFragment, type GeschmackState } from '@/lib/geschmack'

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
// Refinement 2026-08-11 ("Complete"-Umstrukturierung): 6-Bausteine-Modell → 3-Säulen-Modell
// (Protein/Ballaststoffe/Volumen). Geschmack, Biss und Art of Eating sind jetzt eigenständige,
// künftige Features — siehe docs/saettigungsmatrix.md. Neuer Sonderfall "Komponente" (löst
// "Beilage" ab) und komplett neuer Sonderfall "Snack". Siehe PROJ-4/PROJ-5/PROJ-16 Decision Logs.

const ANALYSIS_SYSTEM_PROMPT = `Du bist der Sättigungs-Assistent von Mehralsabnehmen. Du analysierst Mahlzeiten anhand der Sättigungs-Matrix mit drei Säulen: Protein, Ballaststoffe, Volumen. Du bist präzise, herzlich und nie bevormundend.

Was du nie tust: "weniger essen" empfehlen, moralisieren, Light-Produkte vorschlagen, Zutaten entfernen die der Nutzer mag, Proteinshakes empfehlen, die Wörter "gesund", "ungesund" oder "Gesundheit" verwenden — Sättigung ist kein Gesundheitsurteil. Einzige eng gefasste Ausnahme von "weniger essen": Portionskalibrierung bei hochenergiedichtem Fastfood, siehe eigener Abschnitt.

## Zutatennamen aus der finalen Zutatenliste sind bindend — NICHT korrigieren
Der User-Prompt enthält zwei Blöcke: ältere Rückfragen-Annahmen (Kontext, z.B. Portionsgröße) und danach die FINALE, vom Nutzer zuletzt geprüfte und ggf. korrigierte Zutatenliste. Diese finale Liste ist die einzige Quelle für Zutat-Identität und -Name im Output-Feld "zutatenliste".
Wenn eine ältere Annahme eine andere Zutat nennt als die finale Liste (z.B. Annahme sagt "Süßkartoffelnudeln", finale Liste sagt "Spaghetti") — das bedeutet, der Nutzer hat die Zutat bewusst geändert. Übernimm dann IMMER den Namen aus der finalen Liste unverändert, auch wenn dafür keine Datenbankdaten vorliegen und du den Nährwert selbst schätzen musst. Erkläre nicht warum die alte Zutat "eigentlich" gemeint gewesen sein könnte und tausche den Namen nicht zurück — das wäre ein stillschweigendes Verwerfen der Nutzerkorrektur. Annahmen zu Menge/Portionierung/Zubereitung bleiben weiterhin gültig und wichtig, nur die Zutat-Identität selbst ist ausschließlich durch die finale Liste bestimmt.

## Sonderfälle zuerst prüfen: Komponente oder Snack?
Prüfe die Rückfragen-Annahmen auf einen dieser Flags, BEVOR du irgendetwas anderes tust:
- "MAHLZEIT_TYP: komponente" → verwende AUSSCHLIESSLICH das Komponente-Ausgabe-Format (siehe unten). Kein Standard-Flow, keine Säulen-Bewertung.
- "MAHLZEIT_TYP: snack" → verwende AUSSCHLIESSLICH das Snack-Ausgabe-Format (siehe unten). Kein Standard-Flow, keine Säulen-Bewertung.
- Kein solcher Flag vorhanden → normale Mahlzeit, Standard-Format mit den drei Säulen unten.

## Die drei Säulen der Sättigung (nur für Standard-Format)
Bewerte jede Säule mit genau einem von vier Werten: ungenuegend / gering / mittel / gut. Alle Intervalle halboffen (Untergrenze eingeschlossen, Obergrenze ausgeschlossen).

**Protein** (pro Mahlzeit): unter 10g = ungenuegend | 10–20g = gering | 20–30g = mittel | ab 30g = gut
**Ballaststoffe** (pro Mahlzeit): unter 3g = ungenuegend | 3–5g = gering | 5–10g = mittel | ab 10g = gut
**Volumen**: berechne zwei Werte und nimm die SCHLECHTERE Stufe:
  1. Energiedichte = Gesamt-kcal ÷ Gesamt-Gramm der Mahlzeit: unter 1,0 = gut | 1,0–1,5 = mittel | 1,5–2,25 = gering | ab 2,25 = ungenuegend
  2. Gemüsemenge absolut (Gemüse+Salat+Pilze; Kartoffeln/Mais/Hülsenfrüchte zählen NICHT): unter 100g = ungenuegend | 100–200g = mittel | ab 200g = gut

## Gesamtbewertung
Zähle die Säulen mit "gut": 3 = sehr_saettigend | 2 = maessig_saettigend | 0–1 = wenig_saettigend

## Wenn die Mahlzeit bereits sehr gut ist (alle drei Säulen gut)
Das ist echte Leistung — erkenne sie aufrichtig an, ohne herablassend oder übertrieben zu wirken.
- Die "erklaerung" beginnt mit echter Anerkennung, z.B.: "Das ist eine wirklich gut strukturierte Mahlzeit — du hast intuitiv fast alle Sättigungsprinzipien umgesetzt."
- Maximal 1 Vorschlag, formuliert als optionaler Feinschliff ("Falls du noch einen kleinen Schritt machen willst…")
- 0 Vorschläge ist völlig in Ordnung wenn kein echter Mehrwert entsteht.

## Verbesserungsvorschläge (0–2, bei sehr_saettigend max. 1)
Priorität: Portionskalibrierung (nur bei Fastfood-Trigger unten) → schlechteste Säule zuerst → bei Gleichstand: Protein vor Ballaststoffen vor Volumen

**Machbarkeitsfilter — jeder Vorschlag muss diesen bestehen:**
1. Kein extra Einkauf: nur Zutaten die typischerweise im Haushalt vorhanden sind (Eier, Joghurt, Nüsse, Hülsenfrüchte aus der Dose, Kräuter, Käse, Zitrone)
2. Kein unverhältnismäßiger Mehraufwand: ein Ei hartkochen ist OK bei einem Salat; ein Steak braten ist NICHT OK wenn die Mahlzeit ein schneller Salat war
3. Geschmackliche Passung nach Gerichtstyp:
   - Salat → Ei, Thunfisch, Feta, Kichererbsen, Hühnchen ✓ | Quark pur ✗
   - Pasta/Risotto → Thunfisch, Hackfleisch, Ricotta, Hülsenfrüchte ✓ | Hartgekochtes Ei obendrauf ✗
   - Suppe/Eintopf → Linsen, Tofu-Würfel, Ei einrühren, Joghurt obendrauf ✓
   - Curry/asiatisch → Hühnchen, Tofu, Kichererbsen, Tempeh ✓ | Feta ✗
   - Frühstück → Ei, Joghurt, Quark, Nüsse ✓
   - Fleischgericht als Hauptzutat → KEIN Protein-Upgrade vorschlagen; andere Säulen prüfen
4. Wenn kein Vorschlag den Filter besteht: lieber keinen machen als einen unpassenden.

Für Volumen-Vorschläge: Energiedichte zu hoch → volumenreiche Komponente ERGÄNZEN (Gemüse, Salat, Suppe vorweg), nicht kalorische Komponente streichen. Gemüse zu wenig → konkrete Menge/Sorte die zum Gericht passt.

**Zusatz-Felder:**
Wenn ein Vorschlag eine neue Zutat hinzufügt: "zusatz" mit EINFACHEM Grundbegriff (z.B. "Ei", "Thunfisch", "Walnüsse") — GENAU EINE Zutat, keine Alternativen, kein "hartgekochtes Ei".
Wenn nur Zubereitung geändert wird: "zusatz" weglassen oder null.

## Portionskalibrierung bei hochenergiedichtem Fastfood (Ausnahme von "weniger essen")
Trigger (ALLE relevant): Erwachsenenportion · ≥ ca. 600–700 kcal in dieser Sitzung · kaum Eigenvolumen durch Gemüse/Ballaststoffe · Fastfood-/Convenience-Charakter (z.B. Pizza, Burger, Currywurst+Pommes, Chicken-Nuggets in Erwachsenenportion, Pommes frites, fettreicher Döner).
Greift NICHT bei Kinderportionen/Snacks oder Mahlzeiten die schon unter dem normalen Energiebedarf liegen (z.B. Nuggets-Kinderteller von einem Erwachsenen gegessen → hier fehlt eher Volumen/Protein, normale Additions-Logik gilt stattdessen).

Wenn der Trigger greift:
1. Portionskalibrierung (z.B. "2/3" oder "die Hälfte") VOR allen Additions-Vorschlägen in der Prioritätsliste
2. Niemals als Verzicht framen — als Kalibrierung auf echte Sättigung. Vorbild: "Bei diesem Energiegehalt reicht oft schon 2/3 für echte Sättigung — der Rest ist meist Gewohnheit, nicht Hunger."
3. Wenn realistisch verfügbar: mit einer Volumen-/Ballaststoff-Ergänzung kombinieren (z.B. Tütensalat zur Lieferpizza) — gleiche/weniger Kalorien, mehr Sättigung pro Kalorie. In diesem Fall "zusatz"-Feld wie gewohnt befüllen.
4. Keine Ergänzung realistisch verfügbar (Imbiss/Lieferdienst ohne Alternative)? Portionskalibrierung allein reicht, "zusatz" weglassen, optional auf die nächste Mahlzeit verweisen.

## Restaurant-Kontext
Erkenne einen Restaurantbesuch an: typischen Außer-Haus-Gerichten, Beschreibungen wie "im Restaurant/bestellt/Speisekarte", uniformen Portionen ohne eigene Zubereitung.

Im Restaurant-Kontext: KEINE Zutaten-Vorschläge ("Kichererbsen dazugeben" ist nicht bestellbar). Stattdessen Bestellstrategien:
- **Vorspeisensalat**: Bei schweren Hauptgerichten (Schnitzel, Pasta, Pizza, Burger) — Salat zuerst liefert Volumen + Ballaststoffe, dämpft den Hauptgerichten-Konsum natürlich
- **Teilen**: Bei sehr großen/üppigen Portionen in der Gruppe
- **Nächste Mahlzeit**: Im Restaurant-Kontext darf der Vorschlag auch auf die nächste Mahlzeit verweisen

## Stückweise verzehrtes Gebäck / Portionierung aus Gesamtrezepten
Wenn der Nutzer einzelne Stücke aus einem Batch beschreibt (z.B. "3 Kardamomknoten", "2 Muffins", "4 Kekse") UND bekannt ist, wie viele Stücke das Rezept insgesamt ergibt:
- ALLE grams-Werte müssen auf die tatsächlich verzehrte Menge skaliert werden
- Formel: grams = (Gesamtmenge Zutat ÷ Stück_gesamt) × Stück_gegessen
- Beispiel: Rezept macht 15 Knoten, Nutzer isst 1 → alle grams ÷ 15
- Beispiel: Rezept macht 15 Knoten, Nutzer isst 3 → alle grams ÷ 15 × 3
- In den annahmen dokumentieren: z.B. "Anteil: 1/15 des Gesamtrezepts (~X g pro Knoten)"
- Das "grams"-Feld repräsentiert IMMER die tatsächlich konsumierte Menge — nie die Gesamtrezeptmenge

## Roh-/Gekocht-Gewichtskonsistenz (Getreide, Hülsenfrüchte, Pasta)
Reis, Quinoa, Bulgur, Couscous, Hülsenfrüchte und Pasta werden beim Garen 2- bis 3-mal schwerer (Wasseraufnahme). Das "grams"-Feld muss IMMER den gegarten/verzehrfertigen Zustand abbilden — niemals rohes/trockenes Gewicht mit einem "(gekocht)"-Namen kombinieren oder umgekehrt.
Liegt die Angabe in rohem/trockenem Gewicht vor (z.B. "1 Tasse roher Quinoa"), zuerst umrechnen, BEVOR "grams" befüllt wird:
- Reis, Quinoa: ×~2,5–3
- Hülsenfrüchte (trocken: Linsen, Kichererbsen, Bohnen): ×~2,5
- Pasta: ×~2,2–2,5
- Couscous, Bulgur: ×~2–2,2
Die Zutatenbezeichnung (inkl. "(gekocht)"/"(roh)") muss exakt zum tatsächlichen Garzustand von "grams" passen. Umrechnung immer explizit in "annahmen" nennen, z.B. "1 Tasse roher Quinoa (~75g trocken) → ca. 210g gegart (Faktor ×2,8), Nährwerte auf gegartem Zustand berechnet".

## Wichtig: Nährwerte werden vom System berechnet
Keine Zahlen ausgeben. Nur "grams"-Feld pro Zutat schätzen. Gilt für ALLE drei Ausgabe-Formate (Standard, Komponente, Snack) — auch bei Komponente und Snack werden im Hintergrund Nährwerte berechnet, auch wenn sie im Ausgabe-Text nicht diskutiert werden.

**Ausnahme:** Bei Zutaten, die in der Zutatenliste unten als "Keine Datenbankdaten vorhanden — KI-Schätzung" markiert sind, schätze zusätzlich ihren Nährwert pro 100g in einem eigenen Feld "naehrwert_geschaetzt" (kcal, protein_g, carbs_g, sugar_g, fat_g, fiber_g — alles Zahlen, realistische Werte für dieses Lebensmittel). Für JEDE ANDERE Zutat (mit BLS- oder Open-Food-Facts-Daten) lässt du dieses Feld weg oder setzt es auf null — für diese gilt weiterhin: keine eigenen Zahlen ausgeben.

## Sonderfall: Komponente (löst "Beilage" ab)
Wenn "MAHLZEIT_TYP: komponente" in den Rückfragen-Annahmen steht: KEIN Sättigungs-Score, KEINE Säulen-Bewertung, KEINE Standard-Verbesserungsvorschläge.
Stattdessen zwei Felder:
- "bilanz": positive Bilanz MIT KONKRETEN ZAHLEN was das Gericht beisteuert, z.B. "Bringt schon mal 180g Gemüse und 4g Ballaststoffe mit." — nicht nur ein wertschätzender Satz ohne Zahlen.
- "kombinationsvorschlag": GENAU EIN konkreter Vorschlag womit daraus eine komplette Mahlzeit wird, mit Menge, z.B. "Dazu ein Stück Vollkornbrot und eine Handvoll Kichererbsen (ca. 100g) rein, dann trägt dich das bis zum Abend."
Ton: "Als Beilage macht das richtig Sinn." — nie "Das ist zu wenig." Nutzer lernt was fehlt, wird nicht dafür bestraft.

## Sonderfall: Snack (komplett neu)
Wenn "MAHLZEIT_TYP: snack" in den Rückfragen-Annahmen steht: KEINE Analyse, KEIN Sättigungs-Score, KEIN Kommentar zu Kalorien, KEIN "Ausnahme"- oder "Sünde"-Vokabular, KEINE Kompensations-Tipps.
Nur ein Feld "snack_bestaetigung": kurzer, neutral-warmer Satz, z.B. "Alles klar, Snack — der braucht keine Analyse." Zutatenliste und Gramm-Schätzung trotzdem normal ausfüllen (läuft im Hintergrund weiter, wird nur nicht diskutiert).

## Geschmacks-Score (PROJ-33 — NUR bei Standard- und Komponente-Format, NIE bei Snack)
Zusätzlich zur Sättigungs-Bewertung (Standard-Format) bzw. zusätzlich zur Komponente-Bilanz (Komponente-Format) füllst du ein eigenständiges "geschmack"-Feld. Es ist eine völlig unabhängige Bewertungsebene — nie mit der Sättigung vermischen, nie in "erklaerung"/"bilanz" erwähnen.

${GESCHMACK_PROMPT_RULES}

Antworte AUSSCHLIESSLICH mit gültigem JSON ohne Text davor oder danach.

"naehrwert_geschaetzt" (falls befüllt) hat immer die Form {"kcal": 0, "protein_g": 0, "carbs_g": 0, "sugar_g": 0, "fat_g": 0, "fiber_g": 0} — Werte pro 100g.

Standard-Format (kein MAHLZEIT_TYP-Flag):
{
  "typ": "mahlzeit",
  "zutatenliste": [{"name": "...", "amount": "...", "grams": 0, "naehrwert_geschaetzt": null}],
  "annahmen": ["..."],
  "vorher": {
    "saeulen": {"proteine": "ungenuegend|gering|mittel|gut", "ballaststoffe": "ungenuegend|gering|mittel|gut", "volumen": "ungenuegend|gering|mittel|gut"},
    "gesamtbewertung": "sehr_saettigend|maessig_saettigend|wenig_saettigend",
    "erklaerung": "2-4 Sätze auf Deutsch, warm. Bei sehr_saettigend: mit echter Anerkennung beginnen."
  },
  "vorschlaege": [{"aktion": "...", "begruendung": "...", "saeule": "proteine|ballaststoffe|volumen", "zusatz": {"name": "...", "grams": 0}}],
  "nachher": {
    "saeulen": {"proteine": "...", "ballaststoffe": "...", "volumen": "..."},
    "gesamtbewertung": "..."
  },
  ${GESCHMACK_JSON_FIELD}
}

Komponente-Format (MAHLZEIT_TYP: komponente):
{
  "typ": "komponente",
  "zutatenliste": [{"name": "...", "amount": "...", "grams": 0}],
  "annahmen": ["MAHLZEIT_TYP: komponente", "..."],
  "komponente": {
    "bilanz": "Quantitative positive Bilanz mit Zahlen",
    "kombinationsvorschlag": "Genau ein konkreter Vorschlag mit Menge"
  },
  ${GESCHMACK_JSON_FIELD}
}

Snack-Format (MAHLZEIT_TYP: snack):
{
  "typ": "snack",
  "zutatenliste": [{"name": "...", "amount": "...", "grams": 0}],
  "annahmen": ["MAHLZEIT_TYP: snack", "..."],
  "snack_bestaetigung": "Kurzer, neutral-warmer Satz"
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

  // Fetch Q&A assumptions — these are critical for portion scaling (e.g. "Rezept ergibt 15 Stück")
  // and now also carry the Schritt-0-Klassifikation-Flag ("MAHLZEIT_TYP: komponente"/"snack")
  const { data: conv } = await supabase
    .from('meal_conversations')
    .select('assumptions')
    .eq('meal_id', mealId)
    .single()

  // Query BLS first, fall back to Open Food Facts for branded/convenience products.
  // 'schaetzung' = plausible AI-estimated value used (PROJ-4 Refinement 2026-08-03);
  // 'nicht_schaetzbar' = no DB match AND no plausible AI estimate — contributes 0, shown to user
  type LookupSource = 'bls' | 'off' | 'schaetzung' | 'nicht_schaetzbar'
  type LookupResult = { ingredient: typeof ingredients[0]; per100g: NutritionPer100g | undefined; source: LookupSource }

  const lookupResults = await Promise.all(
    ingredients.map(async (ing): Promise<LookupResult> => {
      const bls = await queryBLS(ing.name)
      if (bls) return { ingredient: ing, per100g: bls.per100g, source: 'bls' }
      const off = await queryOpenFoodFacts(ing.name)
      if (off) return { ingredient: ing, per100g: off.per100g, source: 'off' }
      return { ingredient: ing, per100g: undefined, source: 'schaetzung' }
    })
  )

  // Build nutrition lookup map (name → {per100g, source}) for post-Claude macro computation
  const nutritionMap = new Map<string, { per100g: NutritionPer100g; source: LookupSource }>()
  lookupResults.forEach(({ ingredient, per100g, source }) => {
    if (per100g) nutritionMap.set(ingredient.name, { per100g, source })
  })

  // Build nutrition context block for Claude (qualitative use only)
  const ingredientLines = lookupResults.map(({ ingredient, per100g, source }) => {
    const lines = [`- ${ingredient.name}: ${ingredient.amount}`]
    if (per100g) {
      const label = source === 'off' ? 'Open Food Facts' : 'BLS'
      lines.push(`  Nährwertdaten (${label}): ${formatNutrition(per100g)} pro 100g`)
    } else {
      lines.push(`  Keine Datenbankdaten vorhanden — KI-Schätzung`)
    }
    return lines.join('\n')
  })

  const mealContext = meal.free_text
    ? `Ursprüngliche Beschreibung: ${meal.free_text}`
    : 'Ursprüngliche Eingabe: (nur Foto)'

  // Bugfix 2026-08-04: Die Rückfragen-Annahmen wurden bisher als "WICHTIG — maßgeblich"
  // markiert und standen VOR der bestätigten Zutatenliste. Wenn der Nutzer auf dem
  // Bestätigungs-Screen eine Zutat inhaltlich ändert (z.B. Süßkartoffelnudeln → Spaghetti),
  // widersprach die ältere Annahme ("Süßkartoffelnudeln: ca. 275g") der Korrektur — Claude
  // hat dann die veraltete, stärker gewichtete Annahme übernommen und die Korrektur des
  // Nutzers stillschweigend verworfen. Die Annahmen bleiben als Kontext (z.B. für
  // Portions-Skalierung "Rezept macht 15 Stück, isst 3") wichtig, aber die zuletzt vom
  // Nutzer bestätigte/korrigierte Zutatenliste muss bei Widersprüchen immer gewinnen.
  const qaAssumptions = (conv?.assumptions ?? []) as string[]
  const assumptionBlock = qaAssumptions.length > 0
    ? [
        '',
        'Kontext aus den Rückfragen (z.B. Portionsgrößen-Skalierung, Schritt-0-Klassifikation). Falls dies der Zutatenliste unten widerspricht, gilt die Zutatenliste — siehe Hinweis dort:',
        ...qaAssumptions.map(a => `- ${a}`),
      ]
    : []

  const userMessage = [
    mealContext,
    ...assumptionBlock,
    '',
    'FINALE, vom Nutzer zuletzt geprüfte und ggf. korrigierte Zutatenliste (mit BLS-Nährwertdaten pro 100g, nur zur Einschätzung, du musst nichts berechnen). Diese Liste ist maßgeblich für Zutat und Menge — bei Widerspruch zu den Annahmen oben hat sie IMMER Vorrang, der Nutzer hat sie zuletzt geprüft:',
    ...ingredientLines,
    '',
    'Bitte führe die vollständige Sättigungs-Analyse durch.',
    'Schätze für jede Zutat die Gramm-Menge im "grams"-Feld.',
  ].join('\n')

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  let response
  try {
    // FIX-3: cache_control reduces repeat costs ~90% within 5-minute window
    response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: [{ type: 'text', text: ANALYSIS_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
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

  // PROJ-33: `geschmack` ist bewusst `unknown` — die eigentliche Validierung passiert erst
  // über parseGeschmackFragment() (Graceful Degradation statt Wurf bei fehlerhaftem Fragment).
  type StandardClaudeResult = {
    typ?: 'mahlzeit' | undefined
    zutatenliste: { name: string; amount: string; grams: number; naehrwert_geschaetzt?: NutritionPer100g | null }[]
    annahmen: string[]
    vorher: {
      saeulen: Record<string, string>
      gesamtbewertung: string
      erklaerung: string
    }
    vorschlaege: { aktion: string; begruendung: string; saeule: string; zusatz?: { name: string; grams: number } | null }[]
    nachher: {
      saeulen: Record<string, string>
      gesamtbewertung: string
    }
    geschmack?: unknown
  }

  type KomponenteClaudeResult = {
    typ: 'komponente'
    zutatenliste: { name: string; amount: string; grams: number; naehrwert_geschaetzt?: NutritionPer100g | null }[]
    annahmen: string[]
    komponente: {
      bilanz: string
      kombinationsvorschlag: string
    }
    geschmack?: unknown
  }

  type SnackClaudeResult = {
    typ: 'snack'
    zutatenliste: { name: string; amount: string; grams: number; naehrwert_geschaetzt?: NutritionPer100g | null }[]
    annahmen: string[]
    snack_bestaetigung: string
  }

  type ClaudeResult = StandardClaudeResult | KomponenteClaudeResult | SnackClaudeResult

  let result: ClaudeResult
  try {
    result = JSON.parse(cleaned)
  } catch {
    console.error('[analyse/confirm] Claude non-JSON:', raw)
    return NextResponse.json({ error: 'Analyse konnte nicht verarbeitet werden. Bitte erneut versuchen.' }, { status: 500 })
  }

  // ─── Zutatennamen serverseitig erzwingen ──────────────────────
  // Bugfix 2026-08-04: Ein Prompt-Hinweis allein war nicht zuverlässig genug — Claude hat
  // trotz expliziter "hat IMMER Vorrang"-Anweisung wiederholt die vom Nutzer korrigierte
  // Zutat (z.B. "Spaghetti") wieder durch die ältere, in den Rückfragen-Annahmen
  // beschriebene Zutat ersetzt (z.B. "Süßkartoffel-Spiralnudeln"), inkl. selbst erfundener
  // Begründung dafür. Statt uns weiter auf Instruction-Following zu verlassen, wird der
  // Name jetzt serverseitig hart mit der vom Nutzer bestätigten Liste überschrieben
  // (positionsgenau) — Claude darf weiterhin Menge (grams) und ggf. Nährwert schätzen,
  // aber nicht mehr entscheiden, WAS die Zutat ist.
  if (result.zutatenliste.length === ingredients.length) {
    result.zutatenliste = result.zutatenliste.map((z, i) => ({ ...z, name: ingredients[i].name }))
  } else {
    console.warn('[analyse/confirm] Zutatenliste-Länge weicht von der bestätigten Liste ab — Namen werden nicht überschrieben.', {
      claudeCount: result.zutatenliste.length,
      confirmedCount: ingredients.length,
    })
  }

  // ─── Helper: re-resolve nutrition by Claude's restated name ──
  // PROJ-4 (Refinement 2026-08-03): if BLS/OFF have no match, fall back to Claude's own
  // per-ingredient estimate (only present for ingredients that had no DB match to begin
  // with) — but only if it passes the plausibility check. Otherwise the ingredient stays
  // unresolved ('nicht_schaetzbar' downstream) instead of silently contributing 0 kcal
  // under a generic "Schätzung" label.

  async function resolveNutrition(
    name: string,
    aiEstimate?: NutritionPer100g | null
  ): Promise<{ per100g: NutritionPer100g; source: LookupSource } | undefined> {
    const cached = nutritionMap.get(name)
    if (cached) return cached
    const bls = await queryBLS(name)
    if (bls) return { per100g: bls.per100g, source: 'bls' }
    const off = await queryOpenFoodFacts(name)
    if (off) return { per100g: off.per100g, source: 'off' }
    if (aiEstimate && isPlausibleEstimate(aiEstimate)) return { per100g: aiEstimate, source: 'schaetzung' }
    return undefined
  }

  // ─── Snack-Branch (komplett neu, 2026-08-11) ──────────────────
  // Makros laufen im Hintergrund weiter (für den künftigen Wochenrückblick, PROJ-17), werden
  // aber nicht diskutiert — kein Sättigungs-Score, keine Vorschläge, siehe PROJ-4/PROJ-16.

  if (result.typ === 'snack') {
    const resolvedSnack = await Promise.all(
      result.zutatenliste.map(async z => ({ z, resolved: await resolveNutrition(z.name, z.naehrwert_geschaetzt) }))
    )
    const snackMacros = computeMacros(resolvedSnack.map(({ z, resolved }) => ({ grams: z.grams ?? 0, per100g: resolved?.per100g })))
    const zutatenQuellenSnack = resolvedSnack.map(({ resolved }) => resolved?.source ?? 'nicht_schaetzbar')

    const snackFullResult = {
      typ: 'snack' as const,
      zutatenliste: result.zutatenliste,
      annahmen: result.annahmen,
      zutatenQuellen: zutatenQuellenSnack,
      snackBestaetigung: result.snack_bestaetigung,
    }

    const { data: snackAnalysis, error: snackInsertError } = await supabase
      .from('meal_analyses')
      .insert({
        meal_id: mealId,
        analysis_typ: 'snack',
        refined_ingredients: {
          ingredients: result.zutatenliste,
          assumptions: result.annahmen,
        } as unknown as import('@/types/database').Json,
        macros_before: snackMacros as unknown as import('@/types/database').Json,
        // Bugfix (noch in derselben Session gefunden): snack_bestaetigung wurde ursprünglich
        // nirgends persistiert — beim späteren Ansehen aus der Historie (/mahlzeit/[id]) gäbe es
        // dann keinen gespeicherten Text zum Rekonstruieren. `beilage_data`-Spalte wiederverwendet
        // (bereits der etablierte Ablageort für Komponente-Zusatzdaten), kein neues Feld nötig.
        beilage_data: { snack_bestaetigung: result.snack_bestaetigung } as unknown as import('@/types/database').Json,
        data_sources: resolvedSnack.map(({ z, resolved }) => ({
          ingredient: z.name,
          source: resolved?.source ?? 'nicht_schaetzbar',
          sourceName: z.name,
        })),
      })
      .select('id')
      .single()

    if (snackInsertError) {
      console.error('[analyse/confirm] snack DB insert error:', snackInsertError)
      return NextResponse.json({ error: 'Ergebnis konnte nicht gespeichert werden.' }, { status: 500 })
    }

    await supabase.from('meals').update({ status: 'completed' }).eq('id', mealId)
    await supabase.from('meal_conversations').update({ status: 'completed' }).eq('meal_id', mealId)

    return NextResponse.json({ analysisId: snackAnalysis.id, result: snackFullResult })
  }

  // ─── Komponente-Branch (löst Beilagen-Branch ab) ──────────────

  if (result.typ === 'komponente') {
    const resolvedKomponente = await Promise.all(
      result.zutatenliste.map(async z => ({ z, resolved: await resolveNutrition(z.name, z.naehrwert_geschaetzt) }))
    )

    // PROJ-28 (BUG-7-Fix, 2026-08-04): positionsgenau statt namensbasiert — zwei Zutaten mit
    // identischem Namen aber unterschiedlicher Quelle wurden vorher beide fälschlich gleich
    // gekennzeichnet, weil die Zuordnung über den Namen lief statt über den Index.
    const zutatenQuellenKomponente = resolvedKomponente.map(({ resolved }) => resolved?.source ?? 'nicht_schaetzbar')

    // PROJ-33: Graceful Degradation — ein fehlendes/fehlerhaftes Geschmack-Fragment darf die
    // Komponente-Analyse nie blockieren, siehe parseGeschmackFragment().
    const geschmackKomponente: GeschmackState = parseGeschmackFragment(result.geschmack)

    const komponenteFullResult = {
      typ: 'komponente' as const,
      zutatenliste: result.zutatenliste,
      annahmen: result.annahmen,
      zutatenQuellen: zutatenQuellenKomponente,
      // Bugfix (QA 2026-08-11): ohne explizites format-Feld fiel `komponenten-ergebnis.tsx`
      // (prüft `k.format === 'neu'`) in den Legacy-Renderzweig und crashte auf `k.pairing.map(...)`,
      // da das neue Format kein `pairing`-Array mehr hat. Analog zum bereits korrekten Muster in
      // mahlzeit/[id]/page.tsx bei der Historie-Rekonstruktion.
      komponente: { format: 'neu' as const, ...result.komponente },
      geschmack: geschmackKomponente,
    }

    const { data: komponenteAnalysis, error: komponenteInsertError } = await supabase
      .from('meal_analyses')
      .insert({
        meal_id: mealId,
        analysis_typ: 'komponente',
        refined_ingredients: {
          ingredients: result.zutatenliste,
          assumptions: result.annahmen,
        } as unknown as import('@/types/database').Json,
        beilage_data: result.komponente as unknown as import('@/types/database').Json,
        geschmack_score: geschmackKomponente as unknown as import('@/types/database').Json,
        data_sources: resolvedKomponente.map(({ z, resolved }) => ({
          ingredient: z.name,
          source: resolved?.source ?? 'nicht_schaetzbar',
          sourceName: z.name,
        })),
      })
      .select('id')
      .single()

    if (komponenteInsertError) {
      console.error('[analyse/confirm] komponente DB insert error:', komponenteInsertError)
      return NextResponse.json({ error: 'Ergebnis konnte nicht gespeichert werden.' }, { status: 500 })
    }

    await supabase.from('meals').update({ status: 'completed' }).eq('id', mealId)
    await supabase.from('meal_conversations').update({ status: 'completed' }).eq('meal_id', mealId)

    return NextResponse.json({ analysisId: komponenteAnalysis.id, result: komponenteFullResult })
  }

  // ─── Mahlzeit-Branch (Standard): macro computation ────────────

  const resolvedIngredients = await Promise.all(
    result.zutatenliste.map(async z => ({ z, resolved: await resolveNutrition(z.name, z.naehrwert_geschaetzt) }))
  )

  // PROJ-28 (BUG-7-Fix, 2026-08-04): positionsgenau statt namensbasiert — siehe Kommentar im
  // Komponente-Zweig oben. `zutatenQuellen[i]` gehört exakt zu `zutatenliste[i]`, unabhängig
  // davon ob mehrere Zutaten denselben Namen tragen.
  const zutatenQuellen = resolvedIngredients.map(({ resolved }) => resolved?.source ?? 'nicht_schaetzbar')

  const vorherInputs: MacroInput[] = resolvedIngredients.map(({ z, resolved }) => ({
    grams: z.grams ?? 0,
    per100g: resolved?.per100g,
  }))
  const vorherMacros = computeMacros(vorherInputs)

  const zusatzItems = result.vorschlaege
    .map(v => v.zusatz)
    .filter((z): z is { name: string; grams: number } => !!z && z.grams > 0)

  const zusatzInputs: MacroInput[] = await Promise.all(
    zusatzItems.map(async (z) => {
      const per100g =
        (await queryBLS(z.name))?.per100g ??
        (await queryOpenFoodFacts(z.name))?.per100g ??
        undefined
      return { grams: z.grams, per100g }
    })
  )

  const nachherMacros = computeMacros([...vorherInputs, ...zusatzInputs])

  const macroKeys = ['kcal', 'protein_g', 'kohlenhydrate_g', 'zucker_g', 'fett_g', 'ballaststoffe_g'] as const
  const deltas = macroKeys
    .filter(k => Math.abs(nachherMacros[k] - vorherMacros[k]) >= 1)
    .map(k => ({
      wert: k,
      vorher: vorherMacros[k],
      nachher: nachherMacros[k],
      veraenderung: nachherMacros[k] - vorherMacros[k],
    }))

  // PROJ-33: Graceful Degradation — ein fehlendes/fehlerhaftes Geschmack-Fragment darf die
  // Sättigungs-Analyse nie blockieren, siehe parseGeschmackFragment().
  const geschmackStandard: GeschmackState = parseGeschmackFragment(result.geschmack)

  const fullResult = {
    zutatenliste: result.zutatenliste,
    annahmen: result.annahmen,
    zutatenQuellen,
    vorher: {
      saeulen: result.vorher.saeulen,
      gesamtbewertung: result.vorher.gesamtbewertung,
      erklaerung: result.vorher.erklaerung,
      naehrwerte: vorherMacros,
    },
    vorschlaege: result.vorschlaege,
    nachher: {
      saeulen: result.nachher.saeulen,
      gesamtbewertung: result.nachher.gesamtbewertung,
      naehrwerte: nachherMacros,
      deltas,
    },
    geschmack: geschmackStandard,
  }

  // ─── Persist to meal_analyses ───────────────────────────────

  const { data: analysis, error: insertError } = await supabase
    .from('meal_analyses')
    .insert({
      meal_id: mealId,
      analysis_typ: 'mahlzeit',
      refined_ingredients: {
        ingredients: fullResult.zutatenliste,
        assumptions: fullResult.annahmen,
      } as unknown as import('@/types/database').Json,
      macros_before: fullResult.vorher.naehrwerte as unknown as import('@/types/database').Json,
      macros_after: fullResult.nachher.naehrwerte as unknown as import('@/types/database').Json,
      satiety_scores_before: {
        pillars: fullResult.vorher.saeulen,
        overall: fullResult.vorher.gesamtbewertung,
        explanation: fullResult.vorher.erklaerung,
      },
      satiety_scores_after: {
        pillars: fullResult.nachher.saeulen,
        overall: fullResult.nachher.gesamtbewertung,
        deltas: fullResult.nachher.deltas,
      },
      improvement: {
        suggestions: fullResult.vorschlaege,
      },
      geschmack_score: geschmackStandard as unknown as import('@/types/database').Json,
      data_sources: resolvedIngredients.map(({ z, resolved }) => ({
        ingredient: z.name,
        source: resolved?.source ?? 'nicht_schaetzbar',
        sourceName: z.name,
      })),
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('[analyse/confirm] DB insert error:', insertError)
    return NextResponse.json({ error: 'Ergebnis konnte nicht gespeichert werden.' }, { status: 500 })
  }

  await supabase.from('meals').update({ status: 'completed' }).eq('id', mealId)

  await supabase
    .from('meal_conversations')
    .update({ status: 'completed' })
    .eq('meal_id', mealId)

  return NextResponse.json({ analysisId: analysis.id, result: { typ: 'mahlzeit', ...fullResult } })
}
