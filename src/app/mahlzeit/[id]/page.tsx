import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { AnalysisResult, StandardAnalysisResult, ZutatenQuelle } from '@/components/saettigungs-ergebnis'
import MahlzeitDetail from './mahlzeit-detail'

export default async function MahlzeitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/')

  const { data: meal } = await supabase
    .from('meals')
    .select(`
      id,
      free_text,
      created_at,
      photo_fullsize_path,
      photo_thumbnail_path,
      meal_analyses (
        id,
        analysis_typ,
        refined_ingredients,
        beilage_data,
        macros_before,
        macros_after,
        satiety_scores_before,
        satiety_scores_after,
        improvement,
        data_sources,
        created_at
      ),
      meal_conversations (
        assumptions
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .single()

  if (!meal) notFound()

  type RawAnalysis = {
    id: string
    analysis_typ: string | null
    refined_ingredients: { ingredients: StandardAnalysisResult['zutatenliste']; assumptions: string[] } | null
    beilage_data: {
      als_beilage_top: string
      als_hauptgericht: string
      beilage_upgrade: string | null
      pairing: { empfehlung: string; warum: string }[]
      art_of_eating_tipp: string | null
    } | null
    macros_before: StandardAnalysisResult['vorher']['naehrwerte'] | null
    macros_after: StandardAnalysisResult['nachher']['naehrwerte'] | null
    satiety_scores_before: {
      pillars: StandardAnalysisResult['vorher']['bausteine']
      overall: StandardAnalysisResult['vorher']['gesamtbewertung']
      explanation: string
    } | null
    satiety_scores_after: {
      pillars: StandardAnalysisResult['nachher']['bausteine']
      overall: StandardAnalysisResult['nachher']['gesamtbewertung']
      deltas: StandardAnalysisResult['nachher']['deltas']
    } | null
    improvement: {
      suggestions: StandardAnalysisResult['vorschlaege']
      art_of_eating_tip: string | null
    } | null
    data_sources: { ingredient: string; source: string; sourceName: string }[] | null
    created_at: string
  }

  const analyses = meal.meal_analyses as unknown as RawAnalysis[]
  const analysis = analyses?.[0]
  if (!analysis) notFound()

  // PROJ-4 (Refinement 2026-08-03): data_sources ist seit jeher nur persistiert, nie ausgelesen —
  // hier erstmals genutzt, um die Zutaten-Kennzeichnung auch beim späteren Ansehen aus der
  // Historie zu zeigen (nicht nur direkt nach der Analyse).
  //
  // PROJ-28 (BUG-7-Fix, 2026-08-04): positionsgenau statt namensbasiert — `data_sources` wird
  // in `/api/analyse/confirm` per `.map()` über dieselbe geordnete Zutatenliste gebaut, die auch
  // in `refined_ingredients.ingredients` landet, daher entspricht `data_sources[i]` exakt
  // `refined_ingredients.ingredients[i]`. Ein Filtern+Sammeln der Namen (wie vorher) verwechselt
  // zwei gleichnamige Zutaten mit unterschiedlicher Quelle — die Position ist eindeutig, der Name nicht.
  const zutatenQuellen = (analysis.data_sources ?? []).map(d => d.source as ZutatenQuelle)

  // PROJ-28: Zutatendaten vor diesem Stichtag sind bei "geschätzten" Zutaten unzuverlässig
  // (stiller 0-kcal-Fallback statt eines echten KI-Werts, siehe PROJ-4-Bugfix) — Zutatenliste
  // wird für ältere Mahlzeiten durch einen Hinweis ersetzt statt angezeigt
  const ZUTATENLISTE_CUTOFF = new Date('2026-08-03T00:00:00Z')
  const tooOld = new Date(analysis.created_at) < ZUTATENLISTE_CUTOFF

  const emptyNaehrwerte = { kcal: 0, protein_g: 0, kohlenhydrate_g: 0, zucker_g: 0, fett_g: 0, ballaststoffe_g: 0 }
  const emptyBausteine = { geschmack: 'nicht_bewertet', biss: 'nicht_bewertet', ballaststoffe: 'nicht_bewertet', proteine: 'nicht_bewertet', volumen: 'nicht_bewertet', art_of_eating: 'nicht_bewertet' } as StandardAnalysisResult['vorher']['bausteine']

  let result: AnalysisResult

  if (analysis.analysis_typ === 'beilage' && analysis.beilage_data) {
    result = {
      typ: 'beilage',
      zutatenliste: analysis.refined_ingredients?.ingredients ?? [],
      annahmen: analysis.refined_ingredients?.assumptions ?? [],
      zutatenQuellen,
      beilage: analysis.beilage_data,
    }
  } else {
    result = {
      zutatenliste: analysis.refined_ingredients?.ingredients ?? [],
      annahmen: analysis.refined_ingredients?.assumptions ?? [],
      zutatenQuellen,
      vorher: {
        bausteine: analysis.satiety_scores_before?.pillars ?? emptyBausteine,
        gesamtbewertung: analysis.satiety_scores_before?.overall ?? 'wenig_saettigend',
        erklaerung: analysis.satiety_scores_before?.explanation ?? '',
        naehrwerte: analysis.macros_before ?? emptyNaehrwerte,
      },
      vorschlaege: analysis.improvement?.suggestions ?? [],
      nachher: {
        bausteine: analysis.satiety_scores_after?.pillars ?? emptyBausteine,
        gesamtbewertung: analysis.satiety_scores_after?.overall ?? 'wenig_saettigend',
        naehrwerte: analysis.macros_after ?? emptyNaehrwerte,
        deltas: analysis.satiety_scores_after?.deltas ?? [],
      },
      art_of_eating_tipp: analysis.improvement?.art_of_eating_tip ?? null,
    }
  }

  const conversations = meal.meal_conversations as unknown as { assumptions: string[] | null }[]
  const assumptions: string[] = conversations?.[0]?.assumptions ?? []

  let photoUrl: string | null = null
  const mealRaw = meal as unknown as { photo_fullsize_path: string | null; photo_thumbnail_path: string | null }
  const photoPath = mealRaw.photo_fullsize_path ?? mealRaw.photo_thumbnail_path
  if (photoPath) {
    const { data: signed, error: signedError } = await supabase.storage
      .from('meal-photos')
      .createSignedUrl(photoPath, 3600)
    if (signedError && mealRaw.photo_thumbnail_path && photoPath !== mealRaw.photo_thumbnail_path) {
      // Fullsize not found — fall back to thumbnail
      const { data: thumb } = await supabase.storage
        .from('meal-photos')
        .createSignedUrl(mealRaw.photo_thumbnail_path, 3600)
      photoUrl = thumb?.signedUrl ?? null
    } else {
      photoUrl = signed?.signedUrl ?? null
    }
  }

  return <MahlzeitDetail result={result} assumptions={assumptions} analysisId={analysis.id} photoUrl={photoUrl} mealId={id} tooOld={tooOld} />
}
