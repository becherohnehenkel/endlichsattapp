import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAccessStatus } from '@/lib/paywall'
import { calculateMacrosPerServing } from '@/lib/nutrition'
import { calculateRezeptMatrix } from '@/lib/saettigungs-matrix-rezept'
import { computeGeschmack } from '@/lib/geschmack'
import { RecipeIngredientsSchema, isZutat } from '@/lib/recipe-ingredients-schema'

function imageUrl(path: string | null): string | null {
  if (!path) return null
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe-images/${path}`
}

// PROJ-31: bewusst kein is_guest_visible-Feld — siehe Begründung in POST /api/rezepte
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
  ingredients: RecipeIngredientsSchema,
  recipe_typ: z.enum(['beilage', 'grundlage']).nullable().optional(),
})

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

  // PROJ-30: ein eigenes Rezept darf nie hinter der Paywall-Sperre landen — der Nutzer
  // hat es selbst angelegt, unabhängig vom Zugriffsstatus.
  const isOwn = recipe.owner_id === user.id

  if (restricted && !recipe.is_guest_visible && !isOwn) {
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

// PROJ-31: Nutzer dürfen ausschließlich eigene Rezepte bearbeiten — offizielle oder fremde
// Rezepte bleiben tabu, auch wenn sie (wie offizielle Rezepte) lesbar sind. RLS würde ein
// Update auf eine fremde Zeile ohnehin folgenlos ins Leere laufen lassen (0 betroffene Zeilen,
// kein Fehler) — die explizite Prüfung hier sorgt für eine klare 403/404-Antwort statt eines
// stillen No-Ops.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const body = await request.json()
  const parsed = RecipeUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data: existing } = await supabase.from('recipes').select('owner_id').eq('id', id).single()
  if (!existing) return NextResponse.json({ error: 'Rezept nicht gefunden' }, { status: 404 })
  if (existing.owner_id !== user.id) {
    return NextResponse.json({ error: 'Kein Zugriff auf dieses Rezept' }, { status: 403 })
  }

  const { ingredients, ...recipeData } = parsed.data

  const { error: updateError } = await supabase
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
      recipe_typ: recipeData.recipe_typ ?? null,
    })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 })

  // Zutaten komplett ersetzen: löschen + neu einfügen
  await supabase.from('recipe_ingredients').delete().eq('recipe_id', id)

  const { error: ingredientsError } = await supabase
    .from('recipe_ingredients')
    .insert(
      ingredients.map((ing, i) =>
        ing.item_type === 'gruppe'
          ? {
              recipe_id: id,
              item_type: 'gruppe' as const,
              label: ing.label,
              name: null,
              amount: null,
              unit: null,
              sort_order: ing.sort_order ?? i,
              macros_per_100g: null,
            }
          : {
              recipe_id: id,
              item_type: 'zutat' as const,
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
              sort_order: ing.sort_order ?? i,
              macros_per_100g: ing.macros_per_100g ?? null,
            }
      )
    )

  if (ingredientsError) return NextResponse.json({ error: 'Fehler beim Speichern der Zutaten' }, { status: 500 })

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
  }).eq('id', id)

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { data: existing } = await supabase.from('recipes').select('owner_id, image_path').eq('id', id).single()
  if (!existing) return NextResponse.json({ error: 'Rezept nicht gefunden' }, { status: 404 })
  if (existing.owner_id !== user.id) {
    return NextResponse.json({ error: 'Kein Zugriff auf dieses Rezept' }, { status: 403 })
  }

  if (existing.image_path) {
    // Storage-Bucket "recipe-images" hat keine RLS-Policy für reguläre Nutzer (nur der
    // Admin-Editor bekam bisher Zugriff, über den Service-Role-Client) — Löschen des Bilds
    // läuft daher über den Admin-Client. Die Eigentümer-Prüfung oben ist bereits erfolgt,
    // dieser Schritt läuft nur für ein bereits als eigen verifiziertes Rezept.
    await createAdminClient().storage.from('recipe-images').remove([existing.image_path])
  }

  const { error: deleteError } = await supabase.from('recipes').delete().eq('id', id)
  if (deleteError) return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 })

  return NextResponse.json({ success: true })
}
