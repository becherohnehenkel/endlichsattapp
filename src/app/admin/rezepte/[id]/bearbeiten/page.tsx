import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import RezeptFormular, { type RezeptFormularValues } from '@/components/rezept-formular'

export default async function RezeptBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.email !== process.env.ADMIN_EMAIL) redirect('/admin/403')

  const { data: recipe } = await supabase
    .from('recipes')
    .select(`
      id,
      title,
      image_path,
      focal_point,
      servings,
      cook_time_minutes,
      total_time_minutes,
      instructions,
      ingredient_tags,
      cuisine_tags,
      recipe_typ,
      is_guest_visible,
      recipe_ingredients (
        id,
        item_type,
        name,
        amount,
        unit,
        label,
        sort_order,
        macros_per_100g
      )
    `)
    .eq('id', id)
    .single()

  if (!recipe) notFound()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const existingImageUrl = recipe.image_path
    ? `${supabaseUrl}/storage/v1/object/public/recipe-images/${recipe.image_path}`
    : null

  type Ingredient = {
    id: string
    item_type: 'zutat' | 'gruppe'
    name: string | null
    amount: number | null
    unit: string | null
    label: string | null
    sort_order: number
    macros_per_100g: Record<string, number> | null
  }
  const sortedIngredients = (recipe.recipe_ingredients as unknown as Ingredient[])
    .sort((a, b) => a.sort_order - b.sort_order)

  const defaultValues: Partial<RezeptFormularValues> = {
    title: recipe.title,
    servings: String(recipe.servings),
    cook_time_minutes: String(recipe.cook_time_minutes),
    total_time_minutes: String(recipe.total_time_minutes),
    instructions: recipe.instructions,
    ingredient_tags: (recipe.ingredient_tags as string[]).join(', '),
    cuisine_tags: (recipe.cuisine_tags as string[]).join(', '),
    ingredients: sortedIngredients.map(i =>
      i.item_type === 'gruppe'
        ? { itemType: 'gruppe' as const, name: '', amount: '', unit: '', groupLabel: i.label ?? '' }
        : { itemType: 'zutat' as const, name: i.name ?? '', amount: String(i.amount ?? ''), unit: i.unit ?? '', groupLabel: '' }
    ),
    image_path: recipe.image_path ?? undefined,
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
        <Link
          href="/admin/rezepte"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Zurück
        </Link>
        <h1 className="font-semibold text-foreground">Rezept bearbeiten</h1>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        <RezeptFormular
          mode="edit"
          recipeId={id}
          defaultValues={defaultValues}
          existingImageUrl={existingImageUrl}
          defaultIngredientMacros={sortedIngredients.map(i => i.macros_per_100g as import('@/lib/nutrition').NutritionPer100g | null)}
          defaultRecipeTyp={recipe.recipe_typ as 'beilage' | 'grundlage' | null}
          defaultIsGuestVisible={recipe.is_guest_visible ?? false}
        />
      </main>
    </div>
  )
}
