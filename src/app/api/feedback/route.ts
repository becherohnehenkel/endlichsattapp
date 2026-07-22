import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { FeedbackSchema } from '@/lib/feedback-schema'
import type { Json } from '@/types/database'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = FeedbackSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Atomarer Tages-Zähler (max. 5/Tag) — siehe check_and_increment_feedback_count()
  // in der Migration. NULL = Limit für heute bereits erreicht.
  const { data: remaining, error: rpcError } = await supabase
    .rpc('check_and_increment_feedback_count')

  if (rpcError) {
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 })
  }
  if (remaining === null) {
    return NextResponse.json({ error: 'Tageslimit erreicht — versuch es morgen wieder' }, { status: 429 })
  }

  const { message, pageType, referenceId, snapshot } = parsed.data

  // Kein .select() nach dem Insert: es gibt bewusst keine SELECT-Policy für normale
  // Nutzer (Feedback ist nicht für den einreichenden Nutzer selbst einsehbar, siehe
  // Tech Design) — ein INSERT...RETURNING würde daran unter RLS scheitern.
  const { error: insertError } = await supabase
    .from('feedback')
    .insert({
      user_id: user.id,
      message,
      page_type: pageType,
      reference_id: referenceId,
      // Kommt bereits aus request.json() — strukturell garantiert serialisierbar,
      // Zod validiert nur Form/Größe, nicht die exakte (variable) Feldstruktur.
      snapshot: snapshot as Json,
    })

  if (insertError) {
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
