import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// PROJ-31: eigenständiger Endpunkt statt Wiederverwendung von /api/admin/rezepte/bild —
// der Admin-Endpunkt bleibt bewusst admin-exklusiv (siehe Tech Design). Storage-Schreibzugriff
// läuft trotzdem über den Admin-Client, da der "recipe-images"-Bucket keine RLS-Policy für
// reguläre Nutzer hat — die Authentifizierungsprüfung hier ist die eigentliche Absicherung.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  if (user.is_anonymous) return NextResponse.json({ error: 'Bitte zuerst registrieren' }, { status: 403 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'Kein Bild gefunden' }, { status: 400 })

  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Nur JPEG, PNG oder WebP erlaubt' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Bild darf maximal 5 MB groß sein' }, { status: 400 })
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${crypto.randomUUID()}.${ext}`

  const admin = createAdminClient()
  const { error: uploadError } = await admin.storage
    .from('recipe-images')
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) return NextResponse.json({ error: 'Upload fehlgeschlagen' }, { status: 500 })

  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe-images/${path}`

  return NextResponse.json({ path, imageUrl }, { status: 201 })
}
