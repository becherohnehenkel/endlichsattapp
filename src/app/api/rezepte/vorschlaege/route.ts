import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function imageUrl(path: string | null): string | null {
  if (!path) return null
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe-images/${path}`
}

function normalizeIngredientNames(ingredients: { name: string }[]): string[] {
  return ingredients.map(i => i.name.toLowerCase())
}

function countTagMatches(tags: string[], normalizedIngredients: string[]): number {
  return tags.filter(tag =>
    normalizedIngredients.some(name => name.includes(tag.toLowerCase()))
  ).length
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const analysisId = searchParams.get('analysisId')
  if (!analysisId) return NextResponse.json({ error: 'analysisId fehlt' }, { status: 400 })

  // Fetch analysis — verify it belongs to the user via meal join
  const { data: analysis } = await supabase
    .from('meal_analyses')
    .select('refined_ingredients, meals!inner(user_id)')
    .eq('id', analysisId)
    .eq('meals.user_id', user.id)
    .single()

  if (!analysis) return NextResponse.json({ recipes: [] })

  type RefinedIngredients = { ingredients: { name: string }[] }
  const refined = analysis.refined_ingredients as RefinedIngredients | null
  const ingredientNames = normalizeIngredientNames(refined?.ingredients ?? [])

  if (ingredientNames.length === 0) return NextResponse.json({ recipes: [] })

  // Fetch all recipes (ingredient_tags only for matching)
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, image_path, total_time_minutes, ingredient_tags')

  if (!recipes || recipes.length === 0) return NextResponse.json({ recipes: [] })

  // Score and filter
  const scored = recipes
    .map(r => ({
      ...r,
      matchCount: countTagMatches(r.ingredient_tags ?? [], ingredientNames),
    }))
    .filter(r => r.matchCount >= 2)
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 2)

  return NextResponse.json({
    recipes: scored.map(r => ({
      id: r.id,
      title: r.title,
      imageUrl: imageUrl(r.image_path),
      totalTimeMinutes: r.total_time_minutes,
    })),
  })
}
