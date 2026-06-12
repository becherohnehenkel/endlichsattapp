import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { data: meal } = await supabase
    .from('meals')
    .select('id, user_id, photo_thumbnail_path, photo_fullsize_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!meal) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })

  const filesToDelete = [
    (meal as { photo_thumbnail_path: string | null }).photo_thumbnail_path,
    (meal as { photo_fullsize_path: string | null }).photo_fullsize_path,
  ].filter(Boolean) as string[]

  if (filesToDelete.length > 0) {
    await supabase.storage.from('meal-photos').remove(filesToDelete)
  }

  const { error } = await supabase.from('meals').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Löschen fehlgeschlagen' }, { status: 500 })

  return NextResponse.json({ success: true })
}
