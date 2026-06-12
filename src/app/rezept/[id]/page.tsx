import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import { Clock, ChefHat, Users } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import BackButton from './back-button'

export default async function RezeptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: recipe } = await supabase
    .from('recipes')
    .select(`
      id,
      title,
      image_path,
      servings,
      cook_time_minutes,
      total_time_minutes,
      instructions,
      recipe_ingredients (
        id,
        name,
        amount,
        unit,
        sort_order
      )
    `)
    .eq('id', id)
    .single()

  if (!recipe) notFound()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const imageUrl = recipe.image_path
    ? `${supabaseUrl}/storage/v1/object/public/recipe-images/${recipe.image_path}`
    : null

  type Ingredient = { id: string; name: string; amount: number; unit: string; sort_order: number }
  const ingredients = (recipe.recipe_ingredients as unknown as Ingredient[])
    .sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <BackButton />
        <span className="font-semibold text-foreground tracking-tight">Rezept</span>
        <div className="w-16" />
      </header>

      <main className="max-w-sm mx-auto px-4 py-6 space-y-6">

        {/* Bild */}
        {imageUrl ? (
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-muted">
            <Image
              src={imageUrl}
              alt={recipe.title}
              width={400}
              height={225}
              className="w-full h-full object-cover"
              unoptimized
              priority
            />
          </div>
        ) : (
          <div className="w-full aspect-video rounded-xl bg-muted flex items-center justify-center">
            <ChefHat className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Titel + Meta */}
        <div className="space-y-3">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{recipe.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{recipe.total_time_minutes} Min. gesamt</span>
            </div>
            {recipe.cook_time_minutes > 0 && (
              <div className="flex items-center gap-1.5">
                <ChefHat className="h-4 w-4" />
                <span>{recipe.cook_time_minutes} Min. kochen</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{recipe.servings} Port.</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Zutaten */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Zutaten</h2>
          <ul className="space-y-1.5">
            {ingredients.map((ing) => (
              <li key={ing.id} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-foreground">{ing.name}</span>
                <span className="text-muted-foreground flex-shrink-0">
                  {ing.amount % 1 === 0 ? ing.amount.toFixed(0) : ing.amount} {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Zubereitung */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Zubereitung</h2>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
            {recipe.instructions}
          </p>
        </div>

      </main>
    </div>
  )
}
