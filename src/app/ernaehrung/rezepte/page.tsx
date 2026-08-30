import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAccessStatus } from '@/lib/paywall'
import RezeptBibliothek, { type RezeptListItem } from '@/components/rezept-bibliothek'
import { ErnaehrungSubHeader } from '@/components/ernaehrung-sub-header'

function formatRecipeCount(n: number): string {
  return n === 1 ? '1 Rezept' : `${n} Rezepte`
}

export default async function RezeptePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // PROJ-19: Guests (no session or anonymous) can browse recipes.
  // PROJ-11 (Refinement): Registered users without full access (trial expired, no
  // sub/invite) fall back to the same reduced view as guests — no redirect anymore.
  // PROJ-22: access check + recipes parallel abfragen
  const isAnonymous = user?.is_anonymous === true

  const accessQuery = (user && !isAnonymous)
    ? getAccessStatus(supabase, user.id)
    : Promise.resolve(null)

  const isGuest = !user || isAnonymous

  // PROJ-30: owner_id mitladen, damit die Rezepte-Seite zwischen offiziellen und
  // eigenen Rezepten filtern kann. RLS liefert hier ohnehin nur offizielle Rezepte
  // (owner_id IS NULL) + die eigenen des anfragenden Nutzers — nie fremde private.
  const recipesQuery = supabase
    .from('recipes')
    .select('id, title, image_path, total_time_minutes, cuisine_tags, is_guest_visible, owner_id')
    .order('created_at', { ascending: false })

  const countQuery = supabase.from('recipes').select('*', { count: 'exact', head: true })

  const [access, { data: recipes }, { count: totalRecipeCount }] = await Promise.all([accessQuery, recipesQuery, countQuery])

  // "restricted" = sieht nur die gast-sichtbare Teilmenge — trifft auf Gäste UND auf
  // registrierte Nutzer ohne volle Ausstattung (Trial abgelaufen, kein Abo/Invite) zu.
  const restricted = isGuest || (access !== null && !access.hasAccess)
  const trialDaysRemaining = access?.trialDaysRemaining ?? null

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
    // PROJ-30: owner_id ist durch RLS bereits auf "eigenes oder offizielles Rezept"
    // begrenzt — ein gesetzter owner_id-Wert hier kann also nur der eigene sein.
    isOwn: r.owner_id !== null,
  }))

  return (
    <div className="min-h-screen bg-background">
      <ErnaehrungSubHeader title="Rezepte" />

      {trialDaysRemaining !== null && (
        <p className="text-center text-xs text-muted-foreground px-4 pt-3">
          Noch {trialDaysRemaining} {trialDaysRemaining === 1 ? 'Tag' : 'Tage'} volle Rezeptbibliothek & tägliche Foto-Analysen — danach reduziert sich dein Zugriff auf die Gast-Auswahl
        </p>
      )}

      {restricted && totalRecipeCount != null && totalRecipeCount > 0 && (
        <div className="max-w-sm mx-auto px-4 pt-4">
          <div className="rounded-xl border border-[#2E9E6B]/30 bg-[#DFF0F2] px-4 py-3 space-y-1">
            <p className="text-sm font-semibold text-[#0E7C86]">
              {isGuest ? 'Gastrezepte' : 'Eingeschränkte Auswahl'}
            </p>
            <p className="text-xs text-[#2E9E6B] leading-relaxed">
              {isGuest
                ? `Hier siehst du alle Gastrezepte. Anmelden um alle ${formatRecipeCount(totalRecipeCount)} zu sehen.`
                : `Dein Trial ist abgelaufen — hier siehst du die Gast-Auswahl. Werde Pro um alle ${formatRecipeCount(totalRecipeCount)} zu sehen.`}
            </p>
            <Link
              href={isGuest ? '/registrieren' : '/upgrade'}
              className="inline-block text-xs font-medium text-[#2E9E6B] hover:underline mt-0.5"
            >
              {isGuest ? 'Jetzt kostenlos registrieren →' : 'Jetzt Pro werden →'}
            </Link>
          </div>
        </div>
      )}

      {/* PROJ-30: "Eigene Rezepte" nur für echte (nicht-anonyme) Accounts sinnvoll — Gäste
          können mangels Login ohnehin keine eigenen Rezepte haben. */}
      <RezeptBibliothek rezepte={rezepte} restricted={restricted} showEigeneFilter={!isGuest} />
    </div>
  )
}
