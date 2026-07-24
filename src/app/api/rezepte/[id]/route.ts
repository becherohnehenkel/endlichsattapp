import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAccessStatus } from '@/lib/paywall'

function imageUrl(path: string | null): string | null {
  if (!path) return null
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe-images/${path}`
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  // PROJ-11 (Refinement, QA-Fix): dieselbe Zugriffsprüfung wie /rezept/[id] — ohne sie
  // konnte jede authentifizierte Session (auch Gäste, auch abgelaufene Trials) den vollen
  // Rezeptinhalt per direktem API-Aufruf abrufen und damit den Sperrbildschirm umgehen.
  const isAnonymous = user.is_anonymous === true
  const access = !isAnonymous ? await getAccessStatus(supabase, user.id) : null
  const restricted = isAnonymous || (access !== null && !access.hasAccess)

  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*, recipe_ingredients(id, item_type, name, amount, unit, label, sort_order)')
    .eq('id', id)
    .single()

  if (error || !recipe) return NextResponse.json({ error: 'Rezept nicht gefunden' }, { status: 404 })

  if (restricted && !recipe.is_guest_visible) {
    return NextResponse.json({ error: 'Kein Zugriff auf dieses Rezept' }, { status: 403 })
  }

  const ingredients = (recipe.recipe_ingredients as {
    id: string; item_type: 'zutat' | 'gruppe'; name: string | null; amount: number | null; unit: string | null; label: string | null; sort_order: number
  }[]).sort((a, b) => a.sort_order - b.sort_order)

  return NextResponse.json({
    id: recipe.id,
    title: recipe.title,
    imageUrl: imageUrl(recipe.image_path),
    servings: recipe.servings,
    cookTimeMinutes: recipe.cook_time_minutes,
    totalTimeMinutes: recipe.total_time_minutes,
    instructions: recipe.instructions,
    ingredientTags: recipe.ingredient_tags,
    cuisineTags: recipe.cuisine_tags,
    ingredients,
  })
}
