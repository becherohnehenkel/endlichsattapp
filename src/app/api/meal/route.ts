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
