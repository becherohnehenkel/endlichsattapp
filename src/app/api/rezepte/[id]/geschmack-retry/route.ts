import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeGeschmack } from '@/lib/geschmack'

// PROJ-33: schlanker Zweit-Pfad für den "Nochmal prüfen"-Button auf der Rezept-Detailseite —
// fragt NUR den Geschmack-Teil neu an, auf Basis der bereits gespeicherten Zutaten/Anleitung.
// Berechtigung ist bewusst identisch zum ursprünglichen Speichern (siehe PROJ-33 Tech Design,
// "derselbe Auth-/Eigentümerschafts-Check wie beim ursprünglichen Speichern"): eigene Rezepte
// darf der Eigentümer aktualisieren, offizielle Rezepte (owner_id null) nur Admin — dieselbe
// Aufteilung wie /api/rezepte/[id] (Nutzer) vs. /api/admin/rezepte/[id] (Admin).

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  // RLS ("Authenticated users can read official or own recipes") filtert fremde private
  // Rezepte bereits auf DB-Ebene heraus.
  const { data: recipe } = await supabase
    .from('recipes')
    .select('id, owner_id, instructions, recipe_ingredients(item_type, name, amount, unit)')
    .eq('id', id)
    .single()

  if (!recipe) return NextResponse.json({ error: 'Rezept nicht gefunden' }, { status: 404 })

  const isOwnRecipe = recipe.owner_id === user.id
  const isOfficialRecipe = recipe.owner_id === null

  if (!isOwnRecipe && !(isOfficialRecipe && user.email === process.env.ADMIN_EMAIL)) {
    return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })
  }

  const ingredients = (recipe.recipe_ingredients as { item_type: string; name: string | null; amount: number | null; unit: string | null }[])
    .filter(i => i.item_type === 'zutat' && i.name)
    .map(i => ({ name: i.name as string, amount: `${i.amount ?? ''} ${i.unit ?? ''}`.trim() }))

  const geschmack = await computeGeschmack({ zutatenliste: ingredients, anleitung: recipe.instructions })

  // Offizielle Rezepte gehören keinem Nutzer (owner_id null) — die UPDATE-RLS-Policy erlaubt
  // dafür nur den Eigentümer, ein Admin muss also über den Admin-Client (Service Role) schreiben.
  const writer = isOfficialRecipe ? createAdminClient() : supabase
  const { error: updateError } = await writer
    .from('recipes')
    .update({ geschmack_score: geschmack as unknown as import('@/types/database').Json })
    .eq('id', id)

  if (updateError) {
    console.error('[rezepte/geschmack-retry] DB update error:', updateError)
    return NextResponse.json({ error: 'Ergebnis konnte nicht gespeichert werden.' }, { status: 500 })
  }

  return NextResponse.json({ geschmack })
}
