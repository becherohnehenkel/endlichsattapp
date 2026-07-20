import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  photoPath: z.string().min(1).nullable().optional(),
  thumbPath: z.string().min(1).nullable().optional(),
  freeText: z.string().max(1000).nullable().optional(),
}).refine(
  d => d.photoPath || (d.freeText && d.freeText.trim().length > 0),
  { message: 'Mindestens ein Foto oder eine Beschreibung ist erforderlich.' }
)

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

  const { photoPath, thumbPath, freeText } = parsed.data

  // PROJ-10: Foto-Scans sind limitiert (Default 3, einmalig), Freitext bleibt unbegrenzt.
  // Prüfung + Reduzierung läuft atomar in der DB (decrement_photo_scan), damit zwei
  // gleichzeitige Anfragen den Counter nicht unter 0 drücken können.
  if (photoPath) {
    const { data: remaining, error: scanError } = await supabase.rpc('decrement_photo_scan')
    if (scanError) {
      console.error('[POST /api/meal] decrement_photo_scan', scanError)
      return NextResponse.json({ error: 'Mahlzeit konnte nicht gespeichert werden.' }, { status: 500 })
    }
    if (remaining === null) {
      const isAnonymous = user.is_anonymous === true
      const errorMsg = isAnonymous
        ? 'Deine Foto-Scans sind aufgebraucht. Freitext-Analyse bleibt aber weiterhin unbegrenzt verfügbar.'
        : 'Deine Foto-Scans für heute sind aufgebraucht. Morgen hast du wieder 5 neue. Freitext-Analyse bleibt weiterhin unbegrenzt verfügbar.'
      return NextResponse.json(
        { error: errorMsg, code: 'PHOTO_SCAN_LIMIT_REACHED' },
        { status: 403 }
      )
    }
  }

  const { data: meal, error } = await supabase
    .from('meals')
    .insert({
      user_id: user.id,
      photo_fullsize_path: photoPath ?? null,
      photo_thumbnail_path: thumbPath ?? null,
      free_text: freeText ?? null,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    console.error('[POST /api/meal]', error)
    return NextResponse.json({ error: 'Mahlzeit konnte nicht gespeichert werden.' }, { status: 500 })
  }

  return NextResponse.json({ id: meal.id }, { status: 201 })
}
