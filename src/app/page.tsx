import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import MahlzeitHistorie from '@/components/mahlzeit-historie'
import type { MealEntry } from '@/components/mahlzeit-karte'

export default async function HistoriePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  if (!user) redirect('/login?redirectTo=/')

  type RawMeal = {
    id: string
    free_text: string | null
    photo_thumbnail_path: string | null
    created_at: string
    meal_analyses: { satiety_scores_before: { overall: string } | null }[] | null
  }

  const { data: meals } = await supabase
    .from('meals')
    .select(`
      id,
      free_text,
      photo_thumbnail_path,
      created_at,
      meal_analyses (
        satiety_scores_before
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(20)

  const initialMeals: MealEntry[] = await Promise.all(
    ((meals ?? []) as unknown as RawMeal[]).map(async (meal) => {
      let thumbnailUrl: string | null = null
      if (meal.photo_thumbnail_path) {
        const { data } = await supabase.storage
          .from('meal-photos')
          .createSignedUrl(meal.photo_thumbnail_path, 3600)
        thumbnailUrl = data?.signedUrl ?? null
      }
      return {
        id: meal.id,
        freeText: meal.free_text,
        thumbnailUrl,
        createdAt: meal.created_at,
        gesamtbewertung: meal.meal_analyses?.[0]?.satiety_scores_before?.overall ?? null,
      }
    })
  )

  const hasMore = (meals?.length ?? 0) === 20

  async function logout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

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
      <MahlzeitHistorie initialMeals={initialMeals} hasMore={hasMore} />
    </div>
  )
}
