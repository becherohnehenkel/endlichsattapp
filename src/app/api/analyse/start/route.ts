import { NextResponse } from 'next/server'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import sharp from 'sharp'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  mealId: z.string().uuid(),
})

const SYSTEM_PROMPT = `Du analysierst eine Mahlzeit auf ihre Sättigungswirkung.

Verwende nie die Wörter "gesund", "ungesund" oder "Gesundheit". Sättigung ist kein Gesundheitsurteil.

Identifiziere fehlende Informationen, die deine Analyse wesentlich beeinflussen würden.
Frage nach: Kochfett/Menge, Fettgehalt von Milchprodukten, Portionsgrößen kalorienreicher Zutaten (Nüsse, Käse, Öl), Zubereitungsart (roh vs. gegart).
Stelle maximal 2 Fragen. Wenn du genug weißt, setze needs_clarification auf false.

BEILAGEN-RÜCKFRAGE: Wenn die Mahlzeit eindeutig Beilagen-Charakter hat, nutze eine der max. 2 Fragen dafür: "Ist das deine komplette Mahlzeit — oder isst du das als Beilage zu etwas anderem?"
Klare Trigger (ALLE müssen zutreffen): kein erkennbares Sättigungselement (keine Proteinquelle, keine Stärke, kein relevantes Fett) + erkennbar unter ca. 200 kcal + eindeutiger Beilagen-Charakter (Blattsalat ohne Protein, Rohkost allein, Frischkäse allein, trockenes Brötchen allein).
NICHT fragen wenn: Proteinquelle vorhanden, mehrere Hauptkomponenten, Beilagen-Charakter unklar (Caesar Salad mit Hähnchen, Avocado-Toast, Poke Bowl → nie fragen).

WICHTIG: Fülle meal_description IMMER aus — beschreibe kurz was du siehst oder liest (z.B. "Spaghetti Bolognese mit Hackfleisch, Tomatensauce und Parmesan").

Antworte AUSSCHLIESSLICH mit gültigem JSON, ohne Text davor oder danach:
{"needs_clarification": boolean, "meal_description": "Kurze Beschreibung der Mahlzeit", "questions": [{"id": "q1", "text": "Frage hier"}]}`

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
      let imageBuffer = Buffer.from(await imageData.arrayBuffer())
      try {
        imageBuffer = await sharp(imageBuffer)
          .resize(768, 768, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer()
      } catch {
        // corrupted image — send original, don't abort analysis
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
  let claudeResult: { needs_clarification: boolean; questions: { id: string; text: string }[] }
  try {
    claudeResult = JSON.parse(cleaned)
  } catch {
    console.error('[analyse/start] Claude returned non-JSON:', raw)
    // Fallback: no clarification needed
    claudeResult = { needs_clarification: false, questions: [] }
  }

  // Store conversation
  messages.push({ role: 'assistant', content: raw })
  await supabase.from('meal_conversations').insert({
    meal_id: mealId,
    claude_messages: messages,
    status: claudeResult.needs_clarification ? 'questioning' : 'ready',
    current_round: claudeResult.needs_clarification ? 1 : 0,
  })

  // Update meal status
  await supabase.from('meals').update({ status: 'analysing' }).eq('id', mealId)

  if (claudeResult.needs_clarification && claudeResult.questions?.length > 0) {
    return NextResponse.json({ questions: claudeResult.questions })
  }
  return NextResponse.json({ ready: true })
}
