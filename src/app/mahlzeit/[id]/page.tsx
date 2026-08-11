import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { AnalysisResult, StandardAnalysisResult, KomponenteAnalysisResult, PillarSet, ZutatenQuelle, GeschmackState } from '@/components/saettigungs-ergebnis'
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
        geschmack_score,
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

  // Refinement 2026-08-11 ("Complete"-Umstrukturierung): `beilage_data` wird für drei
  // unterschiedliche Formen wiederverwendet, je nach `analysis_typ` und Alter der Zeile —
  // legacy-Beilage (als_beilage_top/...), neue Komponente (bilanz/kombinationsvorschlag),
  // neuer Snack (snack_bestaetigung). Als `unknown` gelesen und pro Zweig unten typgeprüft.
  type RawAnalysis = {
    id: string
    analysis_typ: string | null
    refined_ingredients: { ingredients: StandardAnalysisResult['zutatenliste']; assumptions: string[] } | null
    beilage_data: unknown
    macros_before: StandardAnalysisResult['vorher']['naehrwerte'] | null
    macros_after: StandardAnalysisResult['nachher']['naehrwerte'] | null
    satiety_scores_before: {
      pillars: Record<string, string>
      overall: StandardAnalysisResult['vorher']['gesamtbewertung']
      explanation: string
    } | null
    satiety_scores_after: {
      pillars: Record<string, string>
      overall: StandardAnalysisResult['nachher']['gesamtbewertung']
      deltas: StandardAnalysisResult['nachher']['deltas']
    } | null
    improvement: {
      suggestions: StandardAnalysisResult['vorschlaege']
      // Legacy-Feld — neue Analysen schreiben das nicht mehr (Art of Eating ist eigene Sektion)
      art_of_eating_tip?: string | null
    } | null
    data_sources: { ingredient: string; source: string; sourceName: string }[] | null
    // PROJ-33: bereits im GeschmackState-Shape gespeichert (siehe confirm/route.ts) — `null`
    // heißt "kein Score vorhanden" (Analyse von vor Einführung des Features), wird zu
    // `undefined` normalisiert, damit die Geschmack-Sektion in der UI korrekt ausblendet.
    geschmack_score: GeschmackState | null
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

  // Refinement 2026-08-11: erkennt am Schlüsselbestand, ob eine gespeicherte Säulen-Bewertung
  // noch das alte 6-Bausteine-Format hat (Schlüssel "geschmack" vorhanden) oder schon das neue
  // 3-Säulen-Format — keine Migration nötig, beide Formate bleiben dauerhaft lesbar.
  function toPillarSet(pillars: Record<string, string> | undefined): PillarSet {
    if (pillars && 'geschmack' in pillars) {
      return { format: 'legacy', bausteine: pillars } as unknown as PillarSet
    }
    const saeulen = pillars ?? { proteine: 'ungenuegend', ballaststoffe: 'ungenuegend', volumen: 'ungenuegend' }
    return { format: 'neu', saeulen } as unknown as PillarSet
  }

  let result: AnalysisResult

  if (analysis.analysis_typ === 'snack') {
    const snackData = analysis.beilage_data as { snack_bestaetigung?: string } | null
    result = {
      typ: 'snack',
      zutatenliste: analysis.refined_ingredients?.ingredients ?? [],
      annahmen: analysis.refined_ingredients?.assumptions ?? [],
      snackBestaetigung: snackData?.snack_bestaetigung ?? 'Alles klar, Snack — der braucht keine Analyse.',
    }
  } else if ((analysis.analysis_typ === 'beilage' || analysis.analysis_typ === 'komponente') && analysis.beilage_data) {
    const raw = analysis.beilage_data as Record<string, unknown>
    const komponente: KomponenteAnalysisResult['komponente'] =
      'als_beilage_top' in raw
        ? {
            format: 'legacy',
            als_beilage_top: raw.als_beilage_top as string,
            als_hauptgericht: raw.als_hauptgericht as string,
            beilage_upgrade: (raw.beilage_upgrade as string | null) ?? null,
            pairing: (raw.pairing as { empfehlung: string; warum: string }[]) ?? [],
            art_of_eating_tipp: (raw.art_of_eating_tipp as string | null) ?? null,
          }
        : { format: 'neu', bilanz: raw.bilanz as string, kombinationsvorschlag: raw.kombinationsvorschlag as string }

    result = {
      typ: analysis.analysis_typ === 'beilage' ? 'beilage' : 'komponente',
      zutatenliste: analysis.refined_ingredients?.ingredients ?? [],
      annahmen: analysis.refined_ingredients?.assumptions ?? [],
      zutatenQuellen,
      komponente,
      geschmack: analysis.geschmack_score ?? undefined,
    }
  } else {
    result = {
      typ: analysis.analysis_typ === 'mahlzeit' ? 'mahlzeit' : 'standard',
      zutatenliste: analysis.refined_ingredients?.ingredients ?? [],
      annahmen: analysis.refined_ingredients?.assumptions ?? [],
      zutatenQuellen,
      vorher: {
        ...toPillarSet(analysis.satiety_scores_before?.pillars),
        gesamtbewertung: analysis.satiety_scores_before?.overall ?? 'wenig_saettigend',
        erklaerung: analysis.satiety_scores_before?.explanation ?? '',
        naehrwerte: analysis.macros_before ?? emptyNaehrwerte,
      },
      vorschlaege: analysis.improvement?.suggestions ?? [],
      nachher: {
        ...toPillarSet(analysis.satiety_scores_after?.pillars),
        gesamtbewertung: analysis.satiety_scores_after?.overall ?? 'wenig_saettigend',
        naehrwerte: analysis.macros_after ?? emptyNaehrwerte,
        deltas: analysis.satiety_scores_after?.deltas ?? [],
      },
      art_of_eating_tipp: analysis.improvement?.art_of_eating_tip ?? null,
      geschmack: analysis.geschmack_score ?? undefined,
    } as StandardAnalysisResult
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
