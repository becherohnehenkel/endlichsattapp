import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MAHLZEITEN_ZIEL_MIN, MAHLZEITEN_ZIEL_MAX } from '@/lib/mahlzeiten-ziel'

const schema = z.object({
  mahlzeitenProTag: z.number().int().min(MAHLZEITEN_ZIEL_MIN).max(MAHLZEITEN_ZIEL_MAX),
})

// PROJ-42: Speichert das individuelle Tagesziel für Sektion 2 der Analyse-Übersicht.
// Gäste (kein User oder anonyme Session) dürfen laut Spec nichts speichern — selbes
// Muster wie /api/kcal-rechner.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  if (user.is_anonymous) return NextResponse.json({ error: 'Gäste können keine Werte speichern' }, { status: 403 })

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ mahlzeiten_pro_tag: parsed.data.mahlzeitenProTag })
    .eq('id', user.id)

  if (error) {
    console.error('[POST /api/mahlzeiten-ziel]', error)
    return NextResponse.json({ error: 'Speichern fehlgeschlagen' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
