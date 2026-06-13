import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { calculateMacrosPerServing } from '@/lib/nutrition'

function imageUrl(path: string | null): string | null {
  if (!path) return null
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe-images/${path}`
}

const IngredientSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  unit: z.string().min(1),
  sort_order: z.number().int().optional().default(0),
})

const RecipeSchema = z.object({
  title: z.string().min(1).max(200),
  image_path: z.string().nullable().optional(),
  servings: z.number().int().positive(),
  cook_time_minutes: z.number().int().min(0),
  total_time_minutes: z.number().int().min(0),
  instructions: z.string().min(1),
  ingredient_tags: z.array(z.string().min(1)).min(1, 'Mindestens ein Zutaten-Tag erforderlich'),
  cuisine_tags: z.array(z.string()).optional().default([]),
  ingredients: z.array(IngredientSchema).min(1, 'Mindestens eine Zutat erforderlich'),
})

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const supabase = await createClient()
  const { data: recipes, error: dbError } = await supabase
    .from('recipes')
    .select('id, title, image_path, cook_time_minutes, total_time_minutes, created_at')
    .order('created_at', { ascending: false })

  if (dbError) return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })

  return NextResponse.json({
    recipes: (recipes ?? []).map(r => ({
      id: r.id,
      title: r.title,
      imageUrl: imageUrl(r.image_path),
      cookTimeMinutes: r.cook_time_minutes,
      totalTimeMinutes: r.total_time_minutes,
      createdAt: r.created_at,
    })),
  })
}

export async function POST(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await request.json()
  const parsed = RecipeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { ingredients, ...recipeData } = parsed.data
  const admin = createAdminClient()

  const { data: recipe, error: insertError } = await admin
    .from('recipes')
    .insert({
      title: recipeData.title,
      image_path: recipeData.image_path ?? null,
      servings: recipeData.servings,
      cook_time_minutes: recipeData.cook_time_minutes,
      total_time_minutes: recipeData.total_time_minutes,
      instructions: recipeData.instructions,
      ingredient_tags: recipeData.ingredient_tags,
      cuisine_tags: recipeData.cuisine_tags ?? [],
    })
    .select('id')
    .single()

  if (insertError || !recipe) {
    return NextResponse.json({ error: 'Fehler beim Anlegen' }, { status: 500 })
  }

  const { error: ingredientsError } = await admin
    .from('recipe_ingredients')
    .insert(
      ingredients.map((ing, i) => ({
        recipe_id: recipe.id,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        sort_order: ing.sort_order ?? i,
      }))
    )

  if (ingredientsError) {
    await admin.from('recipes').delete().eq('id', recipe.id)
    return NextResponse.json({ error: 'Fehler beim Speichern der Zutaten' }, { status: 500 })
  }

  // Calculate and save macros synchronously (Vercel kills background promises after response)
  const macros = await calculateMacrosPerServing(ingredients, recipeData.servings)
  if (macros) {
    await admin.from('recipes').update({
      macros_per_serving: macros as unknown as import('@/types/database').Json,
    }).eq('id', recipe.id)
  }

  return NextResponse.json({ id: recipe.id }, { status: 201 })
}
