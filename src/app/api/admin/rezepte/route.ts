import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { calculateMacrosPerServing } from '@/lib/nutrition'
import { calculateRezeptMatrix } from '@/lib/saettigungs-matrix-rezept'
import { RecipeIngredientsSchema, isZutat } from '@/lib/recipe-ingredients-schema'

function imageUrl(path: string | null): string | null {
  if (!path) return null
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe-images/${path}`
}

const RecipeSchema = z.object({
  title: z.string().min(1).max(200),
  image_path: z.string().nullable().optional(),
  focal_point: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }).nullable().optional(),
  servings: z.number().int().positive(),
  cook_time_minutes: z.number().int().min(0),
  total_time_minutes: z.number().int().min(0),
  instructions: z.string().min(1),
  ingredient_tags: z.array(z.string().min(1)).min(1, 'Mindestens ein Zutaten-Tag erforderlich'),
  cuisine_tags: z.array(z.string()).optional().default([]),
  ingredients: RecipeIngredientsSchema,
  recipe_typ: z.enum(['beilage', 'grundlage']).nullable().optional(),
  is_guest_visible: z.boolean().optional().default(false),
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
      focal_point: recipeData.focal_point ?? null,
      servings: recipeData.servings,
      cook_time_minutes: recipeData.cook_time_minutes,
      total_time_minutes: recipeData.total_time_minutes,
      instructions: recipeData.instructions,
      ingredient_tags: recipeData.ingredient_tags,
      cuisine_tags: recipeData.cuisine_tags ?? [],
      recipe_typ: recipeData.recipe_typ ?? null,
      is_guest_visible: recipeData.is_guest_visible ?? false,
    })
    .select('id')
    .single()

  if (insertError || !recipe) {
    return NextResponse.json({ error: 'Fehler beim Anlegen' }, { status: 500 })
  }

  const { error: ingredientsError } = await admin
    .from('recipe_ingredients')
    .insert(
      ingredients.map((ing, i) =>
        ing.item_type === 'gruppe'
          ? {
              recipe_id: recipe.id,
              item_type: 'gruppe' as const,
              label: ing.label,
              name: null,
              amount: null,
              unit: null,
              sort_order: ing.sort_order ?? i,
              macros_per_100g: null,
            }
          : {
              recipe_id: recipe.id,
              item_type: 'zutat' as const,
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
              sort_order: ing.sort_order ?? i,
              macros_per_100g: ing.macros_per_100g ?? null,
            }
      )
    )

  if (ingredientsError) {
    await admin.from('recipes').delete().eq('id', recipe.id)
    return NextResponse.json({ error: 'Fehler beim Speichern der Zutaten' }, { status: 500 })
  }

  // Makro-/Matrix-Berechnung nur mit echten Zutaten — Gruppen-Überschriften haben keine Nährwerte
  const zutaten = ingredients.filter(isZutat)
  const macros = await calculateMacrosPerServing(
    zutaten.map(ing => ({ ...ing, macros_per_100g: (ing.macros_per_100g ?? null) as unknown as import('@/lib/nutrition').NutritionPer100g | null })),
    recipeData.servings
  )
  const matrix = calculateRezeptMatrix(zutaten, macros as Record<string, number> | null)
  await admin.from('recipes').update({
    macros_per_serving: (macros ?? null) as unknown as import('@/types/database').Json,
    saettigungs_matrix: matrix as unknown as import('@/types/database').Json,
  }).eq('id', recipe.id)

  return NextResponse.json({ id: recipe.id }, { status: 201 })
}
