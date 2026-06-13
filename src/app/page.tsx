import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ChevronRight, Clock, ChefHat, UtensilsCrossed } from 'lucide-react'

const BEWERTUNG_LABEL: Record<string, string> = {
  sehr_saettigend: 'Sehr sättigend',
  maessig_saettigend: 'Mäßig sättigend',
  wenig_saettigend: 'Wenig sättigend',
}
const BEWERTUNG_COLOR: Record<string, string> = {
  sehr_saettigend: 'bg-[#E8F0EB] text-[#4A7C59] border-[#4A7C59]/20',
  maessig_saettigend: 'bg-amber-50 text-amber-700 border-amber-200',
  wenig_saettigend: 'bg-red-50 text-red-700 border-red-200',
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
  if (!session?.user) redirect('/login?redirectTo=/')

  async function logout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  // Last 4 completed meals with satiety score
  const { data: recentMeals } = await supabase
    .from('meals')
    .select(`
      id, free_text, photo_thumbnail_path, created_at,
      meal_analyses ( satiety_scores_before )
    `)
    .eq('user_id', session.user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(4)

  // Sign thumbnail URLs (private bucket)
  type RawMeal = {
    id: string
    free_text: string | null
    photo_thumbnail_path: string | null
    created_at: string
    meal_analyses: { satiety_scores_before: { overall: string } | null }[]
  }
  const meals = await Promise.all(
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

  // Last 4 recipes for teaser
  const { data: recentRecipes } = await supabase
    .from('recipes')
    .select('id, title, image_path, total_time_minutes')
    .order('created_at', { ascending: false })
    .limit(4)

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
        <form action={logout}>
          <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground text-sm h-8">
            Abmelden
          </Button>
        </form>
      </header>

      <main className="max-w-sm mx-auto px-4 pb-10 space-y-8">

        {/* ── Hero: Analyse CTA ─────────────────────────────── */}
        <section className="pt-8 space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Wie sättigend ist<br />deine Mahlzeit?
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Foto oder Beschreibung — wir zeigen dir warum du hungrig wirst und wie du das änderst.
            </p>
          </div>
          <Link href="/analyse">
            <Button className="w-full bg-[#4A7C59] hover:bg-[#3d6849] text-white h-12 text-base font-medium rounded-xl">
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
                className="text-xs text-[#4A7C59] hover:underline flex items-center gap-0.5"
              >
                Alle <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {meals.map(meal => (
                <Link
                  key={meal.id}
                  href={`/mahlzeit/${meal.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-[#4A7C59] transition-colors"
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

        {/* ── Rezeptbibliothek Teaser ───────────────────────── */}
        {recipes.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Rezeptbibliothek</h2>
              <Link
                href="/rezepte"
                className="text-xs text-[#4A7C59] hover:underline flex items-center gap-0.5"
              >
                Alle <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {recipes.map(recipe => (
                <Link
                  key={recipe.id}
                  href={`/rezept/${recipe.id}`}
                  className="group rounded-xl border border-border bg-card overflow-hidden hover:border-[#4A7C59] transition-colors"
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

            <Link href="/rezepte">
              <Button variant="outline" className="w-full text-sm h-10 rounded-xl">
                Alle Rezepte ansehen
              </Button>
            </Link>
          </section>
        )}

      </main>
    </div>
  )
}
