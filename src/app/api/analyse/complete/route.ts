import { NextResponse } from 'next/server'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  mealId: z.string().uuid(),
})

const EXTRACTION_PROMPT = `Du bekommst den Kontext einer Mahlzeitbeschreibung inkl. eventueller Rückfragen und Antworten.

Deine Aufgabe: Extrahiere die vollständige Zutatenliste.

Für jede Zutat:
- name: Name auf Deutsch
- amount: Menge mit Einheit (z.B. "200g", "1 EL", "1 Handvoll", "ca. 150g")
- isAssumption: true wenn Menge oder Variante geschätzt wurde (nicht vom Nutzer explizit angegeben)

Antworte AUSSCHLIESSLICH mit gültigem JSON ohne Text davor oder danach:
{"ingredients": [{"name": "...", "amount": "...", "isAssumption": false}], "assumptions": ["Annahme 1 falls zutreffend"]}`

type StoredMessage = { role: 'user' | 'assistant'; content: string }

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

  const { data: meal } = await supabase
    .from('meals')
    .select('id, user_id, free_text')
    .eq('id', mealId)
    .eq('user_id', user.id)
    .single()

  if (!meal) return NextResponse.json({ error: 'Mahlzeit nicht gefunden' }, { status: 404 })

  const { data: conv } = await supabase
    .from('meal_conversations')
    .select('id, claude_messages, assumptions')
    .eq('meal_id', mealId)
    .single()

  if (!conv) return NextResponse.json({ error: 'Konversation nicht gefunden' }, { status: 404 })

  // Build text context — skip the first message (may contain base64 image)
  const history = (conv.claude_messages ?? []) as StoredMessage[]
  const contextParts: string[] = []

  if (meal.free_text) {
    contextParts.push(`Mahlzeit: ${meal.free_text}`)
  } else {
    contextParts.push('Mahlzeit: (nur Foto, keine Textbeschreibung)')
  }

  // Append Q&A rounds (messages after the initial ones)
  for (let i = 1; i < history.length; i++) {
    const msg = history[i]
    if (msg.role === 'user') {
      contextParts.push(`Nutzer-Antwort: ${msg.content}`)
    } else if (msg.role === 'assistant') {
      try {
        const parsed = JSON.parse(msg.content)
        if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          const questions = parsed.questions.map((q: { text: string }) => q.text).join(' / ')
          contextParts.push(`KI-Fragen: ${questions}`)
        }
        if (Array.isArray(parsed.assumptions) && parsed.assumptions.length > 0) {
          contextParts.push(`Annahmen aus Rückfragen: ${parsed.assumptions.join(', ')}`)
        }
      } catch {
        // non-JSON assistant message, ignore
      }
    }
  }

  // Include any stored assumptions from previous rounds
  const storedAssumptions = (conv.assumptions as string[] | null) ?? []

  const context = contextParts.join('\n')

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  let response
  try {
    response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: EXTRACTION_PROMPT,
      messages: [{ role: 'user', content: context }],
    })
  } catch (err) {
    if (err instanceof Error && (err as Error & { status?: number }).status === 529) {
      return NextResponse.json({ error: 'Die KI ist gerade überlastet. Bitte in ein paar Sekunden erneut versuchen.' }, { status: 503 })
    }
    throw err
  }

  const raw = response.content[0]?.type === 'text' ? response.content[0].text : ''

  let extracted: {
    ingredients: { name: string; amount: string; isAssumption: boolean }[]
    assumptions: string[]
  }

  try {
    extracted = JSON.parse(raw)
  } catch {
    console.error('[analyse/complete] Claude non-JSON:', raw)
    extracted = {
      ingredients: meal.free_text
        ? [{ name: meal.free_text, amount: '1 Portion', isAssumption: true }]
        : [],
      assumptions: ['Zutaten konnten nicht automatisch extrahiert werden'],
    }
  }

  await supabase
    .from('meal_conversations')
    .update({ status: 'confirming' })
    .eq('id', conv.id)

  return NextResponse.json({
    ingredients: extracted.ingredients,
    assumptions: [
      ...storedAssumptions,
      ...extracted.assumptions,
    ].filter(Boolean),
  })
}
