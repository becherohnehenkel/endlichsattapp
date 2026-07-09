import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getAccessStatus } from '@/lib/paywall'
import RezeptBibliothek, { type RezeptListItem } from '@/components/rezept-bibliothek'

function formatRecipeCount(n: number): string {
  return n === 1 ? '1 Rezept' : `${n} Rezepte`
}

export default async function RezeptePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // PROJ-19: Guests (no session or anonymous) can browse recipes.
  // Registered users go through the paywall check (PROJ-11).
  // PROJ-22: access check + recipes parallel abfragen
  const isAnonymous = user?.is_anonymous === true

  const accessQuery = (user && !isAnonymous)
    ? getAccessStatus(supabase, user.id)
    : Promise.resolve(null)

  const isGuest = !user || isAnonymous

  const recipesQuery = supabase
    .from('recipes')
    .select('id, title, image_path, total_time_minutes, cuisine_tags, is_guest_visible')
    .order('created_at', { ascending: false })

  const countQuery = supabase.from('recipes').select('*', { count: 'exact', head: true })

  const [access, { data: recipes }, { count: totalRecipeCount }] = await Promise.all([accessQuery, recipesQuery, countQuery])

  let trialDaysRemaining: number | null = null
  if (access) {
    if (!access.hasAccess) redirect('/upgrade')
    trialDaysRemaining = access.trialDaysRemaining
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const rezepte: RezeptListItem[] = (recipes ?? []).map(r => ({
    id: r.id,
    title: r.title,
    imageUrl: r.image_path
      ? `${supabaseUrl}/storage/v1/object/public/recipe-images/${r.image_path}`
      : null,
    total_time_minutes: r.total_time_minutes,
    cuisine_tags: r.cuisine_tags ?? [],
    is_guest_visible: r.is_guest_visible ?? false,
  }))

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center">
        <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-16">
          <ChevronLeft className="h-4 w-4" />
          Zurück
        </Link>
        <span className="font-semibold text-foreground tracking-tight flex-1 text-center">Rezepte</span>
        <div className="w-16 flex justify-end">
          <Link href="/konto" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted">
            <UserRound className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {trialDaysRemaining !== null && (
        <p className="text-center text-xs text-muted-foreground px-4 pt-3">
          Noch {trialDaysRemaining} {trialDaysRemaining === 1 ? 'Tag' : 'Tage'} bis Freitext-Analyse & Rezepte eingeschränkt werden
        </p>
      )}

      {isGuest && totalRecipeCount != null && totalRecipeCount > 0 && (
        <div className="max-w-sm mx-auto px-4 pt-4">
          <div className="rounded-xl border border-[#4A7C59]/30 bg-[#E8F0EB] px-4 py-3 space-y-1">
            <p className="text-sm font-semibold text-[#2D5016]">
              Gastrezepte
            </p>
            <p className="text-xs text-[#4A7C59] leading-relaxed">
              Hier siehst du alle Gastrezepte. Anmelden um alle {formatRecipeCount(totalRecipeCount)} zu sehen.
            </p>
            <Link
              href="/registrieren"
              className="inline-block text-xs font-medium text-[#4A7C59] hover:underline mt-0.5"
            >
              Jetzt kostenlos registrieren →
            </Link>
          </div>
        </div>
      )}

      <RezeptBibliothek rezepte={rezepte} isGuest={isGuest} />
    </div>
  )
}
