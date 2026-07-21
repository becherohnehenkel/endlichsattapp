import { cache } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, ChefHat, Users, Flame, Lock } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import BackButton from './back-button'
import RezeptSaettigungsMatrix from '@/components/rezept-saettigungs-matrix'
import RezeptKontextHinweis from '@/components/rezept-kontext-hinweis'
import { formatRezeptText } from '@/lib/format-rezept-text'
import type { RezeptSaettigungsMatrix as MatrixType } from '@/lib/saettigungs-matrix-rezept'

// React cache() dedupt den Query zwischen generateMetadata() und der Page-Komponente,
// damit die DB nur einmal pro Request angefragt wird.
const getRecipe = cache(async (id: string) => {
  const supabase = await createClient()
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
      macros_per_serving,
      saettigungs_matrix,
      recipe_typ,
      is_guest_visible,
      recipe_ingredients (
        id,
        item_type,
        name,
        amount,
        unit,
        label,
        sort_order
      )
    `)
    .eq('id', id)
    .single()
  return recipe
})

// generateMetadata() wird von Next.js VOR dem Start des Streams aufgelöst — ruft hier
// notFound() auf, damit der HTTP-Status bei ungültiger ID korrekt 404 ist. Ohne diesen
// vorgezogenen Check würde die vorhandene `loading.tsx` sofort mit Status 200 streamen,
// bevor die Page-Komponente asynchron feststellen kann, dass das Rezept nicht existiert
// (der HTTP-Status lässt sich danach nicht mehr ändern, nur noch der Seiteninhalt).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const recipe = await getRecipe(id)
  if (!recipe) notFound()
  return { title: recipe.title }
}

export default async function RezeptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isGuest = !user || user.is_anonymous === true

  const recipe = await getRecipe(id)

  if (!recipe) notFound()

  // Gäste dürfen nur freigeschaltete Rezepte lesen
  if (isGuest && !recipe.is_guest_visible) {
    return (
      <div className="min-h-screen bg-background">
        <header className="md:hidden sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
          <BackButton />
          <span className="font-semibold text-foreground tracking-tight">Rezept</span>
          <div className="w-16" />
        </header>
        <main className="max-w-sm mx-auto px-4 py-12 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-semibold tracking-tight">{recipe.title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dieses Rezept und viele weitere warten auf dich — kostenlos mit einem Account.
            </p>
          </div>
          <div className="w-full space-y-3">
            <Button asChild size="lg" className="w-full">
              <Link href="/registrieren">Kostenlos registrieren</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Bereits einen Account?{' '}
              <Link href="/login" className="text-[#2E9E6B] hover:underline font-medium">
                Einloggen
              </Link>
            </p>
          </div>
        </main>
      </div>
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const imageUrl = recipe.image_path
    ? `${supabaseUrl}/storage/v1/object/public/recipe-images/${recipe.image_path}`
    : null

  type MacrosPerServing = { kcal: number; protein_g: number; kohlenhydrate_g: number; zucker_g: number; fett_g: number; ballaststoffe_g: number }
  const macros = recipe.macros_per_serving as MacrosPerServing | null
  const matrix = recipe.saettigungs_matrix as MatrixType | null
  const recipeTyp = recipe.recipe_typ as 'beilage' | 'grundlage' | null

  type Ingredient = {
    id: string
    item_type: 'zutat' | 'gruppe'
    name: string | null
    amount: number | null
    unit: string | null
    label: string | null
    sort_order: number
  }
  const ingredients = (recipe.recipe_ingredients as unknown as Ingredient[])
    .sort((a, b) => a.sort_order - b.sort_order)

  // Zutaten unter der jeweils letzten vorangehenden Gruppen-Überschrift gruppieren.
  // Zutaten vor der ersten Überschrift bleiben ungruppiert (group === null).
  type ZutatenGruppe = { label: string | null; items: Ingredient[] }
  const zutatenGruppen = ingredients.reduce<ZutatenGruppe[]>((groups, ing) => {
    if (ing.item_type === 'gruppe') {
      groups.push({ label: ing.label, items: [] })
      return groups
    }
    if (groups.length === 0) groups.push({ label: null, items: [] })
    groups[groups.length - 1].items.push(ing)
    return groups
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="md:hidden sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <BackButton />
        <span className="font-semibold text-foreground tracking-tight">Rezept</span>
        <div className="w-16" />
      </header>

      <main className="max-w-sm mx-auto px-4 py-6 space-y-6">

        {/* Bild — quadratisch (Bilder werden beim Upload quadratisch zugeschnitten) */}
        {imageUrl ? (
          <div className="w-full aspect-square rounded-xl overflow-hidden bg-muted">
            <Image
              src={imageUrl}
              alt={recipe.title}
              width={400}
              height={400}
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
        <div className="space-y-6">
          <h2 className="text-sm font-semibold text-foreground">Zutaten</h2>
          {zutatenGruppen.map((gruppe, i) => {
            const liste = (
              <ul className="space-y-1.5">
                {gruppe.items.map((ing) => (
                  <li key={ing.id} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-foreground">{ing.name}</span>
                    <span className="text-muted-foreground flex-shrink-0">
                      {ing.amount !== null && (ing.amount % 1 === 0 ? ing.amount.toFixed(0) : ing.amount)} {ing.unit}
                    </span>
                  </li>
                ))}
              </ul>
            )

            // Nur echte Gruppen (mit Überschrift) bekommen einen Rahmen als visuelle Einheit —
            // ungruppierte Zutaten bleiben eine einfache Liste ohne Box.
            if (!gruppe.label) return <div key={i}>{liste}</div>

            return (
              <div key={i} className="rounded-xl border border-border p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{gruppe.label}</p>
                {liste}
              </div>
            )
          })}
        </div>

        <Separator />

        {/* Zubereitung */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Zubereitung</h2>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
            {formatRezeptText(recipe.instructions)}
          </p>
        </div>

        {/* Beilagen-/Grundlagen-Hinweis ODER Sättigungs-Bausteine */}
        {recipeTyp ? (
          <>
            <Separator />
            <RezeptKontextHinweis typ={recipeTyp} />
          </>
        ) : matrix ? (
          <>
            <Separator />
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Sättigungs-Bausteine</p>
              <RezeptSaettigungsMatrix matrix={matrix} />
            </div>
          </>
        ) : null}

        {/* Nährwerte pro Portion */}
        {macros && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">
                  Nährwerte pro Portion
                </h2>
                <span className="text-xs text-muted-foreground">({recipe.servings} Port. gesamt)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Kalorien', value: `${macros.kcal} kcal` },
                  { label: 'Protein', value: `${macros.protein_g}g` },
                  { label: 'Kohlenhydrate', value: `${macros.kohlenhydrate_g}g` },
                  { label: 'davon Zucker', value: `${macros.zucker_g}g` },
                  { label: 'Fett', value: `${macros.fett_g}g` },
                  { label: 'Ballaststoffe', value: `${macros.ballaststoffe_g}g` },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border border-border bg-muted/40 p-2.5 text-center">
                    <p className="text-xs text-muted-foreground leading-tight">{label}</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  )
}
