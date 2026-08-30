import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getOwnRecipeLimitStatus, OWN_RECIPE_LIMIT } from '@/lib/paywall'
import { Button } from '@/components/ui/button'
import RezeptFormular from '@/components/rezept-formular'
import { buildRezeptVorbefuellung, type MahlzeitRezeptVariante, type RezeptVorbefuellung } from '@/lib/rezept-aus-mahlzeit'

interface NeuesEigenesRezeptPageProps {
  searchParams: Promise<{ mealId?: string; variante?: string }>
}

// PROJ-32: lädt optional die Vorbefüllung aus einer gescannten Mahlzeit — Eigentümer- und
// Status-Prüfung identisch zu /mahlzeit/[id]. Liefert bei jedem Problem (fremde/fehlende/
// unvollständige Mahlzeit) bewusst `null` statt eines Fehlers — die Seite fällt dann still auf
// ein normales, leeres Anlege-Formular zurück (kein Auskunfts-Orakel über fremde Mahlzeit-IDs).
async function ladeMahlzeitVorbefuellung(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  mealId: string,
  variante: MahlzeitRezeptVariante
): Promise<{ vorbefuellung: RezeptVorbefuellung; photoUrl: string | null } | null> {
  const { data: meal } = await supabase
    .from('meals')
    .select(`
      free_text,
      created_at,
      photo_fullsize_path,
      photo_thumbnail_path,
      meal_analyses ( analysis_typ, refined_ingredients, improvement )
    `)
    .eq('id', mealId)
    .eq('user_id', userId)
    .eq('status', 'completed')
    .single()

  if (!meal) return null

  type RawAnalysis = {
    analysis_typ: string | null
    refined_ingredients: { ingredients: { name: string; grams: number }[] } | null
    improvement: { suggestions: { aktion: string }[] } | null
  }
  const analysis = (meal.meal_analyses as unknown as RawAnalysis[])?.[0]
  if (!analysis) return null

  const vorbefuellung = buildRezeptVorbefuellung({
    freeText: meal.free_text,
    createdAt: meal.created_at,
    analysisTyp: analysis.analysis_typ,
    ingredients: analysis.refined_ingredients?.ingredients ?? [],
    vorschlaege: analysis.improvement?.suggestions ?? [],
    variante,
  })

  const photoPath = meal.photo_fullsize_path ?? meal.photo_thumbnail_path
  let photoUrl: string | null = null
  if (photoPath) {
    const { data: signed } = await supabase.storage.from('meal-photos').createSignedUrl(photoPath, 3600)
    photoUrl = signed?.signedUrl ?? null
  }

  return { vorbefuellung, photoUrl }
}

export default async function NeuesEigenesRezeptPage({ searchParams }: NeuesEigenesRezeptPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // PROJ-31: eigene Rezepte setzen einen vollwertigen (nicht-anonymen) Account voraus
  if (!user || user.is_anonymous) {
    redirect('/konto?reason=eigenes-rezept')
  }

  const { mealId, variante: rawVariante } = await searchParams
  const variante: MahlzeitRezeptVariante = rawVariante === 'mehr-saettigung' ? 'mehr-saettigung' : 'wie-gescannt'

  const mahlzeitDaten = mealId
    ? await ladeMahlzeitVorbefuellung(supabase, user.id, mealId, variante)
    : null

  const limitStatus = await getOwnRecipeLimitStatus(supabase, user.id)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
        <Link
          href="/ernaehrung/rezepte"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Zurück
        </Link>
        <h1 className="font-semibold text-foreground">Eigenes Rezept anlegen</h1>
      </header>

      {limitStatus.allowed ? (
        <main className="max-w-lg mx-auto px-4 py-6">
          <RezeptFormular
            mode="create"
            variant="user"
            defaultValues={mahlzeitDaten?.vorbefuellung.defaultValues}
            defaultRecipeTyp={mahlzeitDaten?.vorbefuellung.recipeTyp}
            suggestedImageUrl={mahlzeitDaten?.photoUrl}
          />
        </main>
      ) : (
        <main className="max-w-sm mx-auto px-4 py-12 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-semibold tracking-tight">Limit erreicht</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Du hast bereits {OWN_RECIPE_LIMIT} eigene Rezepte angelegt — das Maximum ohne volle Ausstattung.
              Werde Pro für unbegrenzt eigene Rezepte.
            </p>
          </div>
          <Button asChild size="lg" className="w-full">
            <Link href="/upgrade">Jetzt Pro werden</Link>
          </Button>
        </main>
      )}
    </div>
  )
}
