import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*, recipe_ingredients(id, name, amount, unit, sort_order)')
    .eq('id', id)
    .single()

  if (error || !recipe) return NextResponse.json({ error: 'Rezept nicht gefunden' }, { status: 404 })

  const ingredients = (recipe.recipe_ingredients as {
    id: string; name: string; amount: number; unit: string; sort_order: number
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
