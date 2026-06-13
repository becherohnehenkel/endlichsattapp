import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { calculateMacrosPerServing } from '@/lib/nutrition'
import { calculateRezeptMatrix } from '@/lib/saettigungs-matrix-rezept'

function imageUrl(path: string | null): string | null {
  if (!path) return null
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe-images/${path}`
}

const IngredientSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  unit: z.string().min(1),
  sort_order: z.number().int().optional().default(0),
  macros_per_100g: z.record(z.string(), z.number()).nullable().optional(),
})

const RecipeUpdateSchema = z.object({
  title: z.string().min(1).max(200),
  image_path: z.string().nullable().optional(),
  focal_point: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }).nullable().optional(),
  servings: z.number().int().positive(),
  cook_time_minutes: z.number().int().min(0),
  total_time_minutes: z.number().int().min(0),
  instructions: z.string().min(1),
  ingredient_tags: z.array(z.string().min(1)).min(1),
  cuisine_tags: z.array(z.string()).optional().default([]),
  ingredients: z.array(IngredientSchema).min(1),
})

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error } = await requireAdmin()
  if (error) return error

  const supabase = await createClient()
  const { data: recipe, error: dbError } = await supabase
    .from('recipes')
    .select('*, recipe_ingredients(id, name, amount, unit, sort_order)')
    .eq('id', id)
    .single()

  if (dbError || !recipe) return NextResponse.json({ error: 'Rezept nicht gefunden' }, { status: 404 })

  const ingredients = (recipe.recipe_ingredients as {
    id: string; name: string; amount: number; unit: string; sort_order: number
  }[]).sort((a, b) => a.sort_order - b.sort_order)

  return NextResponse.json({
    id: recipe.id,
    title: recipe.title,
    imagePath: recipe.image_path,
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error } = await requireAdmin()
  if (error) return error

  const body = await request.json()
  const parsed = RecipeUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { ingredients, ...recipeData } = parsed.data
  const admin = createAdminClient()

  const { error: updateError } = await admin
    .from('recipes')
    .update({
      title: recipeData.title,
      image_path: recipeData.image_path ?? null,
      focal_point: recipeData.focal_point ?? null,
      servings: recipeData.servings,
      cook_time_minutes: recipeData.cook_time_minutes,
      total_time_minutes: recipeData.total_time_minutes,
      instructions: recipeData.instructions,
      ingredient_tags: recipeData.ingredient_tags,
      cuisine_tags: recipeData.cuisine_tags ?? [],
    })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 })

  // Replace all ingredients: delete + re-insert
  await admin.from('recipe_ingredients').delete().eq('recipe_id', id)

  const { error: ingredientsError } = await admin
    .from('recipe_ingredients')
    .insert(
      ingredients.map((ing, i) => ({
        recipe_id: id,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        sort_order: ing.sort_order ?? i,
        macros_per_100g: ing.macros_per_100g ?? null,
      }))
    )

  if (ingredientsError) return NextResponse.json({ error: 'Fehler beim Speichern der Zutaten' }, { status: 500 })

  // Recalculate and save macros synchronously, using stored USDA data where available
  const macros = await calculateMacrosPerServing(
    ingredients.map(ing => ({ ...ing, macros_per_100g: (ing.macros_per_100g ?? null) as unknown as import('@/lib/nutrition').NutritionPer100g | null })),
    recipeData.servings
  )
  const matrix = calculateRezeptMatrix(ingredients, macros as Record<string, number> | null)
  await admin.from('recipes').update({
    macros_per_serving: (macros ?? null) as unknown as import('@/types/database').Json,
    saettigungs_matrix: matrix as unknown as import('@/types/database').Json,
  }).eq('id', id)

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error } = await requireAdmin()
  if (error) return error

  const supabase = await createClient()
  const { data: recipe } = await supabase
    .from('recipes')
    .select('image_path')
    .eq('id', id)
    .single()

  if (!recipe) return NextResponse.json({ error: 'Rezept nicht gefunden' }, { status: 404 })

  const admin = createAdminClient()

  if (recipe.image_path) {
    await admin.storage.from('recipe-images').remove([recipe.image_path])
  }

  const { error: deleteError } = await admin.from('recipes').delete().eq('id', id)
  if (deleteError) return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 })

  return NextResponse.json({ success: true })
}
