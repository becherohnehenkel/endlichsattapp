import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getOwnRecipeLimitStatus, OWN_RECIPE_LIMIT } from '@/lib/paywall'
import { calculateMacrosPerServing } from '@/lib/nutrition'
import { calculateRezeptMatrix } from '@/lib/saettigungs-matrix-rezept'
import { computeGeschmack } from '@/lib/geschmack'
import { RecipeIngredientsSchema, isZutat } from '@/lib/recipe-ingredients-schema'
import { RECIPE_TYP_DB_VALUES } from '@/lib/recipe-typ'

// PROJ-31: bewusst kein is_guest_visible-Feld — das ist eine kuratorische Einordnung für die
// offizielle Bibliothek und ergibt bei privaten Nutzer-Rezepten keinen Sinn (siehe Spec).
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
  recipe_typ: z.enum(RECIPE_TYP_DB_VALUES).nullable().optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  if (user.is_anonymous) return NextResponse.json({ error: 'Bitte zuerst registrieren' }, { status: 403 })

  const body = await request.json()
  const parsed = RecipeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // PROJ-31: 5-Rezepte-Limit für Nutzer ohne volle Ausstattung — serverseitig erzwungen,
  // nicht nur im Formular, sonst wäre es per direktem API-Aufruf umgehbar (siehe Spec-Edge-Case).
  const limitStatus = await getOwnRecipeLimitStatus(supabase, user.id)
  if (!limitStatus.allowed) {
    return NextResponse.json(
      { error: `Limit von ${OWN_RECIPE_LIMIT} eigenen Rezepten erreicht`, limitReached: true },
      { status: 403 }
    )
  }

  const { ingredients, ...recipeData } = parsed.data

  // Regulärer, nutzer-eigener Client (nicht Admin) — RLS erzwingt, dass owner_id nur der
  // eigene sein darf (siehe PROJ-31-Migration).
  const { data: recipe, error: insertError } = await supabase
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
      owner_id: user.id,
    })
    .select('id')
    .single()

  if (insertError || !recipe) {
    return NextResponse.json({ error: 'Fehler beim Anlegen' }, { status: 500 })
  }

  const { error: ingredientsError } = await supabase
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
    await supabase.from('recipes').delete().eq('id', recipe.id)
    return NextResponse.json({ error: 'Fehler beim Speichern der Zutaten' }, { status: 500 })
  }

  // Makro-/Matrix-Berechnung nur mit echten Zutaten — Gruppen-Überschriften haben keine Nährwerte
  const zutaten = ingredients.filter(isZutat)
  const macros = await calculateMacrosPerServing(
    zutaten.map(ing => ({ ...ing, macros_per_100g: (ing.macros_per_100g ?? null) as unknown as import('@/lib/nutrition').NutritionPer100g | null })),
    recipeData.servings
  )
  const matrix = calculateRezeptMatrix(zutaten, macros as Record<string, number> | null, recipeData.servings)
  // PROJ-33: bei jedem Speichern neu berechnet (bewusst ohne Diffing, siehe Spec Open Questions)
  const geschmack = await computeGeschmack({
    zutatenliste: zutaten.map(z => ({ name: z.name, amount: `${z.amount} ${z.unit}` })),
    anleitung: recipeData.instructions,
  })
  await supabase.from('recipes').update({
    macros_per_serving: (macros ?? null) as unknown as import('@/types/database').Json,
    saettigungs_matrix: matrix as unknown as import('@/types/database').Json,
    geschmack_score: geschmack as unknown as import('@/types/database').Json,
  }).eq('id', recipe.id)

  return NextResponse.json({ id: recipe.id }, { status: 201 })
}
