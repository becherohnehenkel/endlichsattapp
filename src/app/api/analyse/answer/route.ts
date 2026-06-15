import { NextResponse } from 'next/server'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  mealId: z.string().uuid(),
  round: z.number().int().min(1).max(3),
  answers: z.array(z.object({
    questionId: z.string(),
    text: z.string(),
  })),
  skipped: z.boolean(),
})

const SYSTEM_PROMPT = `Du analysierst eine Mahlzeit auf ihre Sättigungswirkung.

Verwende nie die Wörter "gesund", "ungesund" oder "Gesundheit". Sättigung ist kein Gesundheitsurteil.

Identifiziere fehlende Informationen, die deine Analyse wesentlich beeinflussen würden.
Frage nach: Kochfett/Menge, Fettgehalt von Milchprodukten, Portionsgrößen kalorienreicher Zutaten (Nüsse, Käse, Öl), Zubereitungsart.
Stelle maximal 2 Fragen. Stelle keine Frage die du schon gestellt hast.
Wenn du genug weißt, setze needs_clarification auf false.

Bei skipped=true: Mache Annahmen für alle unklaren Punkte und liste sie explizit auf.

Antworte AUSSCHLIESSLICH mit gültigem JSON, ohne Text davor oder danach:
{"needs_clarification": boolean, "questions": [{"id": "q1", "text": "..."}], "assumptions": ["Annahme 1", ...]}`

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
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe' }, { status: 400 })
  }

  const { mealId, round, answers, skipped } = parsed.data

  // Verify meal ownership and fetch conversation
  const { data: meal } = await supabase
    .from('meals')
    .select('id, user_id')
    .eq('id', mealId)
    .eq('user_id', user.id)
    .single()

  if (!meal) return NextResponse.json({ error: 'Mahlzeit nicht gefunden' }, { status: 404 })

  const { data: conv } = await supabase
    .from('meal_conversations')
    .select('id, claude_messages, current_round')
    .eq('meal_id', mealId)
    .single()

  if (!conv) return NextResponse.json({ error: 'Konversation nicht gefunden' }, { status: 404 })

  // Enforce max 3 rounds
  if (round > 3) {
    return NextResponse.json({ ready: true })
  }

  const history = (conv.claude_messages ?? []) as ClaudeMessage[]

  // Append the user's response
  const userContent = skipped
    ? 'Bitte überspringe alle weiteren Fragen und mache explizite Annahmen für alle unklaren Punkte.'
    : answers.map(a => `${a.questionId}: ${a.text}`).join('\n') || '(keine Antwort)'

  history.push({ role: 'user', content: userContent })

  // Rebuild messages for Claude (convert stored flat messages to API format)
  const claudeMessages: Anthropic.MessageParam[] = history.map(m => ({
    role: m.role,
    content: m.content,
  }))

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: claudeMessages,
  })

  const raw = response.content[0]?.type === 'text' ? response.content[0].text : ''
  const cleaned = raw.replace(/^```(?:json)?\s*\n?/m, '').replace(/\n?```\s*$/m, '').trim()
  let claudeResult: {
    needs_clarification: boolean
    questions: { id: string; text: string }[]
    assumptions?: string[]
  }
  try {
    claudeResult = JSON.parse(cleaned)
  } catch {
    console.error('[analyse/answer] Claude returned non-JSON:', raw)
    claudeResult = { needs_clarification: false, questions: [], assumptions: [] }
  }

  history.push({ role: 'assistant', content: raw })

  const isReady = skipped || !claudeResult.needs_clarification || round >= 3
  const newStatus = skipped ? 'skipped' : isReady ? 'ready' : 'questioning'

  await supabase.from('meal_conversations').update({
    claude_messages: history,
    status: newStatus,
    current_round: round,
    assumptions: claudeResult.assumptions?.length ? claudeResult.assumptions : null,
  }).eq('id', conv.id)

  if (isReady) {
    return NextResponse.json({
      ready: true,
      assumptions: claudeResult.assumptions ?? [],
    })
  }

  return NextResponse.json({ questions: claudeResult.questions })
}
