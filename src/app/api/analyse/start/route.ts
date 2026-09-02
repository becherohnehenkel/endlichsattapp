import { NextResponse } from 'next/server'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  mealId: z.string().uuid(),
})

const SYSTEM_PROMPT = `Du analysierst eine Mahlzeit auf ihre Sättigungswirkung.

Verwende nie die Wörter "gesund", "ungesund" oder "Gesundheit". Sättigung ist kein Gesundheitsurteil.

Identifiziere fehlende Informationen, die deine Analyse wesentlich beeinflussen würden.
Frage nach: Kochfett/Menge, Fettgehalt von Milchprodukten, Portionsgrößen kalorienreicher Zutaten (Nüsse, Käse, Öl), Zubereitungsart (roh vs. gegart).
Stelle maximal 2 Fragen. Wenn du genug weißt, setze needs_clarification auf false.

SCHRITT-0-KLASSIFIKATION (Refinement 2026-08-11): Bestimme IMMER zuerst, ob es sich um eine vollständige Mahlzeit, eine Komponente (Teil einer Mahlzeit) oder einen Snack handelt. Setze das Feld "mahlzeit_typ" auf genau einen von vier Werten:
- "snack": einzelnes Obst, Gebäck/Süßes, Riegel, Handvoll Nüsse, Eis — oder erkennbar unter ca. 250 kcal ohne erkennbaren Mahlzeits-Aufbau (kein Teller mit mehreren Komponenten).
- "komponente": wirkt wie Teil eines Gerichts — Beilagensalat ohne Protein, Rohkost allein, Frischkäse allein, trockenes Brötchen allein, Vorsuppe.
- "mahlzeit": alles andere — insbesondere wenn eine Proteinquelle erkennbar vorhanden ist, mehrere Hauptkomponenten beschrieben sind, oder es ein bekanntes vollständiges Gericht ist (Caesar Salad mit Hähnchen, Avocado-Toast, Poke Bowl → IMMER "mahlzeit", nie "snack" oder "komponente").
- "unklar": NUR wenn die geschätzte Kalorienmenge zwischen ca. 250 und 400 kcal liegt UND die Einordnung wirklich uneindeutig ist. In diesem Fall ist "Ist das eine Mahlzeit, ein Teil davon oder ein Snack?" die EINZIGE Frage dieser Runde — keine weiteren Fragen parallel dazu stellen.
Bei "mahlzeit", "komponente" oder "snack": keine zusätzliche Frage für die Klassifikation nötig — andere Rückfragen (Kochfett, Portionsgröße etc.) laufen unabhängig davon normal weiter, sofern relevant.

WICHTIG: Fülle meal_description IMMER aus — beschreibe kurz was du siehst oder liest (z.B. "Spaghetti Bolognese mit Hackfleisch, Tomatensauce und Parmesan").

Antworte AUSSCHLIESSLICH mit gültigem JSON, ohne Text davor oder danach:
{"needs_clarification": boolean, "meal_description": "Kurze Beschreibung der Mahlzeit", "mahlzeit_typ": "mahlzeit"|"komponente"|"snack"|"unklar", "questions": [{"id": "q1", "text": "Frage hier"}]}`

type ClaudeMessage = { role: 'user' | 'assistant'; content: string }

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
    return NextResponse.json({ error: 'Ungültige meal_id' }, { status: 400 })
  }

  const { mealId } = parsed.data

  // Fetch meal and verify ownership
  const { data: meal, error: mealError } = await supabase
    .from('meals')
    .select('id, free_text, photo_fullsize_path, user_id')
    .eq('id', mealId)
    .eq('user_id', user.id)
    .single()

  if (mealError || !meal) {
    return NextResponse.json({ error: 'Mahlzeit nicht gefunden' }, { status: 404 })
  }

  // Build initial user message content
  const userMessageParts: Anthropic.MessageParam['content'] = []

  if (meal.photo_fullsize_path) {
    const { data: imageData, error: imgError } = await supabase.storage
      .from('meal-photos')
      .download(meal.photo_fullsize_path)

    if (!imgError && imageData) {
      // FIX-2: resize to max 768px before encoding — reduces vision tokens ~20×
      // Dynamischer Import statt top-level: sharp lädt ein plattformspezifisches natives
      // Binary — schlägt das fehl (z. B. fehlendes libvips-Binary in der Laufzeitumgebung),
      // darf das nur die Foto-Verkleinerung betreffen, nicht die ganze Route (inkl.
      // reiner Text-Analysen, die sharp nie brauchen).
      let imageBuffer = Buffer.from(await imageData.arrayBuffer())
      try {
        const sharp = (await import('sharp')).default
        imageBuffer = await sharp(imageBuffer)
          .resize(768, 768, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer()
      } catch (err) {
        // sharp nicht verfügbar oder Bild beschädigt — Original unverkleinert senden,
        // Analyse nicht abbrechen
        console.error('[analyse/start] sharp resize failed, sending original image', err)
      }
      const base64 = imageBuffer.toString('base64')
      userMessageParts.push({
        type: 'image',
        source: { type: 'base64', media_type: 'image/jpeg', data: base64 },
      })
    }
  }

  const textPart = meal.free_text
    ? `Mahlzeit: ${meal.free_text}`
    : 'Der Nutzer hat ein Foto hochgeladen ohne Textbeschreibung. Analysiere was du siehst.'
  userMessageParts.push({ type: 'text', text: textPart })

  // FIX-1: store only text in history — never store base64 image data in DB
  const messages: ClaudeMessage[] = [
    { role: 'user', content: textPart },
  ]

  // Call Claude
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  let response
  try {
    response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessageParts }],
    })
  } catch (err) {
    if (err instanceof Error && (err as Error & { status?: number }).status === 529) {
      return NextResponse.json({ error: 'Die KI ist gerade überlastet. Bitte in ein paar Sekunden erneut versuchen.' }, { status: 503 })
    }
    throw err
  }

  const raw = response.content[0]?.type === 'text' ? response.content[0].text : ''
  const cleaned = raw.replace(/^```(?:json)?\s*\n?/m, '').replace(/\n?```\s*$/m, '').trim()
  type MahlzeitTyp = 'mahlzeit' | 'komponente' | 'snack' | 'unklar'
  let claudeResult: { needs_clarification: boolean; questions: { id: string; text: string }[]; mahlzeit_typ?: MahlzeitTyp }
  try {
    claudeResult = JSON.parse(cleaned)
  } catch {
    console.error('[analyse/start] Claude returned non-JSON:', raw)
    // Fallback: no clarification needed
    claudeResult = { needs_clarification: false, questions: [] }
  }

  // Refinement 2026-08-11 (Schritt-0-Klassifikation): "unklar" erzwingt eine Rückfrage, auch
  // falls Claude needs_clarification fälschlich auf false gesetzt hat oder die Klassifikations-
  // Frage in "questions" vergessen hat — doppeltes Sicherheitsnetz.
  const needsClarification = claudeResult.needs_clarification || claudeResult.mahlzeit_typ === 'unklar'
  if (claudeResult.mahlzeit_typ === 'unklar' && !(claudeResult.questions?.length > 0)) {
    claudeResult.questions = [{ id: 'mahlzeit_typ', text: 'Ist das eine Mahlzeit, ein Teil davon oder ein Snack?' }]
  }

  // Eindeutige Klassifikation (komponente/snack) wird sofort als Flag gespeichert — kein
  // Warten auf eine Rückfrage-Antwort nötig. "mahlzeit" oder fehlender Wert = Standard,
  // kein Flag nötig (analog zum bisherigen BEILAGE_KONTEXT-Muster).
  const initialAssumptions =
    claudeResult.mahlzeit_typ === 'komponente' ? ['MAHLZEIT_TYP: komponente']
    : claudeResult.mahlzeit_typ === 'snack' ? ['MAHLZEIT_TYP: snack']
    : null

  // Store conversation
  messages.push({ role: 'assistant', content: raw })
  await supabase.from('meal_conversations').insert({
    meal_id: mealId,
    claude_messages: messages,
    status: needsClarification ? 'questioning' : 'ready',
    current_round: needsClarification ? 1 : 0,
    assumptions: initialAssumptions,
  })

  // Update meal status
  await supabase.from('meals').update({ status: 'analysing' }).eq('id', mealId)

  if (needsClarification && claudeResult.questions?.length > 0) {
    return NextResponse.json({ questions: claudeResult.questions })
  }
  return NextResponse.json({ ready: true })
}
