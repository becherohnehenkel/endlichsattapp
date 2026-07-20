import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ChevronRight, Clock, ChefHat, UtensilsCrossed, UserRound } from 'lucide-react'

function formatRecipeCount(n: number): string {
  return n === 1 ? '1 Rezept' : `${n} Rezepte`
}

const BEWERTUNG_LABEL: Record<string, string> = {
  sehr_saettigend: 'Sehr sättigend',
  maessig_saettigend: 'Mäßig sättigend',
  wenig_saettigend: 'Wenig sättigend',
}
const BEWERTUNG_COLOR: Record<string, string> = {
  sehr_saettigend: 'bg-[#DFF0F2] text-[#2E9E6B] border-[#2E9E6B]/20',
  maessig_saettigend: 'bg-amber-50 text-[#EAB308] border-amber-200',
  wenig_saettigend: 'bg-red-50 text-red-600 border-red-200',
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()
  const time = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  if (isToday) return `Heute, ${time}`
  if (isYesterday) return `Gestern, ${time}`
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
}

export default async function StartPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  // PROJ-19: Guests see hero CTA + guest-visible recipes only. No personal meal history.
  const isGuest = !user || user.is_anonymous === true

  type RawMeal = {
    id: string
    free_text: string | null
    photo_thumbnail_path: string | null
    created_at: string
    meal_analyses: { satiety_scores_before: { overall: string } | null }[]
  }

  // PROJ-22: meals + recipes parallel abfragen statt sequenziell
  const mealsQuery = user
    ? supabase
        .from('meals')
        .select(`id, free_text, photo_thumbnail_path, created_at, meal_analyses ( satiety_scores_before )`)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(4)
    : Promise.resolve({ data: null })

  const recipesBase = supabase
    .from('recipes')
    .select('id, title, image_path, total_time_minutes')
    .order('created_at', { ascending: false })
    .limit(4)
  const recipesQuery = isGuest ? recipesBase.eq('is_guest_visible', true) : recipesBase
  const countQuery = supabase.from('recipes').select('*', { count: 'exact', head: true })

  const [{ data: recentMeals }, { data: recentRecipes }, { count: totalRecipeCount }] = await Promise.all([mealsQuery, recipesQuery, countQuery])

  let meals: { id: string; freeText: string | null; thumbnailUrl: string | null; createdAt: string; overall: string | null }[] = []
  if (user && recentMeals) {
    meals = await Promise.all(
      ((recentMeals ?? []) as unknown as RawMeal[]).map(async (m) => {
        let thumbnailUrl: string | null = null
        if (m.photo_thumbnail_path) {
          const { data } = await supabase.storage
            .from('meal-photos')
            .createSignedUrl(m.photo_thumbnail_path, 3600)
          thumbnailUrl = data?.signedUrl ?? null
        }
        const overall = m.meal_analyses?.[0]?.satiety_scores_before?.overall ?? null
        return { id: m.id, freeText: m.free_text, thumbnailUrl, createdAt: m.created_at, overall }
      })
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const recipes = (recentRecipes ?? []).map(r => ({
    id: r.id,
    title: r.title,
    total_time_minutes: r.total_time_minutes,
    imageUrl: r.image_path
      ? `${supabaseUrl}/storage/v1/object/public/recipe-images/${r.image_path}`
      : null,
  }))

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-foreground tracking-tight">endlichsatt</span>
        <Link href="/konto" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted">
          <UserRound className="h-4 w-4" />
        </Link>
      </header>

      <main className="max-w-sm mx-auto px-4 pb-10 space-y-8">

        {/* ── Hero: Analyse CTA ─────────────────────────────── */}
        <section className="pt-8 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Wie sättigend ist<br />deine Mahlzeit?
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Foto oder Beschreibung — wir zeigen dir warum du hungrig wirst und wie du das änderst.
            </p>
          </div>
          <Link href="/analyse">
            <Button className="w-full h-12 text-base font-medium rounded-xl">
              <Plus className="h-5 w-5 mr-2" />
              Mahlzeit analysieren
            </Button>
          </Link>
        </section>

        {/* ── Letzte Analysen ──────────────────────────────── */}
        {meals.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Letzte Analysen</h2>
              <Link
                href="/historie"
                className="text-xs text-[#2E9E6B] hover:underline flex items-center gap-0.5"
              >
                Alle <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {meals.map(meal => (
                <Link
                  key={meal.id}
                  href={`/mahlzeit/${meal.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-[#2E9E6B] transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                    {meal.thumbnailUrl ? (
                      <Image
                        src={meal.thumbnailUrl}
                        alt=""
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs text-foreground line-clamp-1">
                      {meal.freeText ?? 'Analyse via Foto'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(meal.createdAt)}</p>
                  </div>

                  {/* Badge */}
                  {meal.overall && (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${BEWERTUNG_COLOR[meal.overall] ?? ''}`}>
                      {BEWERTUNG_LABEL[meal.overall] ?? meal.overall}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Sättigungs-Matrix Teaser ─────────────────────── */}
        <section>
          <Link href="/saettigungsmatrix">
            <div className="rounded-2xl border border-[#2E9E6B]/30 bg-[#DFF0F2] p-4 flex items-center gap-4 hover:border-[#2E9E6B] transition-colors cursor-pointer">
              <span className="text-3xl flex-shrink-0">🧩</span>
              <div className="space-y-0.5 min-w-0">
                <p className="text-sm font-semibold text-[#0E7C86] leading-snug">
                  Warum satt werden kein Zufall ist
                </p>
                <p className="text-xs text-[#2E9E6B] font-medium">
                  Zur Sättigungs-Matrix →
                </p>
              </div>
            </div>
          </Link>
        </section>

        {/* ── Art of Eating Teaser ──────────────────────────── */}
        <section>
          <Link href="/wie-esse-ich-richtig">
            <div className="rounded-2xl border border-[#2E9E6B]/30 bg-[#DFF0F2] p-4 flex items-center gap-4 hover:border-[#2E9E6B] transition-colors cursor-pointer">
              <span className="text-3xl flex-shrink-0">🧘</span>
              <div className="space-y-0.5 min-w-0">
                <p className="text-sm font-semibold text-[#0E7C86] leading-snug">
                  Wie du isst entscheidet, wie satt du wirst
                </p>
                <p className="text-xs text-[#2E9E6B] font-medium">
                  Zur Art of Eating →
                </p>
              </div>
            </div>
          </Link>
        </section>

        {/* ── Rezeptbibliothek Teaser ───────────────────────── */}
        {recipes.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Rezeptbibliothek</h2>
              <Link
                href="/rezepte"
                className="text-xs text-[#2E9E6B] hover:underline flex items-center gap-0.5"
              >
                Alle <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {recipes.map(recipe => (
                <Link
                  key={recipe.id}
                  href={`/rezept/${recipe.id}`}
                  className="group rounded-xl border border-border bg-card overflow-hidden hover:border-[#2E9E6B] transition-colors"
                >
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {recipe.imageUrl ? (
                      <Image
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 space-y-1">
                    <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
                      {recipe.title}
                    </p>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px]">{recipe.total_time_minutes} Min.</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Link href="/rezepte" className="block">
              <Button variant="outline" className="w-full text-sm h-10 rounded-xl">
                Alle Rezepte ansehen
              </Button>
            </Link>

            {isGuest && totalRecipeCount != null && totalRecipeCount > 0 && (
              <p className="text-center text-xs text-muted-foreground">
                Anmelden um alle {formatRecipeCount(totalRecipeCount)} zu sehen —{' '}
                <Link href="/registrieren" className="text-[#2E9E6B] hover:underline font-medium">
                  Jetzt registrieren
                </Link>
              </p>
            )}
          </section>
        )}

      </main>
    </div>
  )
}
