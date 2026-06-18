import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { AnalysisResult } from '@/components/saettigungs-ergebnis'
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
      meal_analyses (
        id,
        refined_ingredients,
        macros_before,
        macros_after,
        satiety_scores_before,
        satiety_scores_after,
        improvement
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
    refined_ingredients: { ingredients: AnalysisResult['zutatenliste']; assumptions: string[] } | null
    macros_before: AnalysisResult['vorher']['naehrwerte'] | null
    macros_after: AnalysisResult['nachher']['naehrwerte'] | null
    satiety_scores_before: {
      pillars: AnalysisResult['vorher']['bausteine']
      overall: AnalysisResult['vorher']['gesamtbewertung']
      explanation: string
    } | null
    satiety_scores_after: {
      pillars: AnalysisResult['nachher']['bausteine']
      overall: AnalysisResult['nachher']['gesamtbewertung']
      deltas: AnalysisResult['nachher']['deltas']
    } | null
    improvement: {
      suggestions: AnalysisResult['vorschlaege']
      art_of_eating_tip: string | null
    } | null
  }

  const analyses = meal.meal_analyses as unknown as RawAnalysis[]
  const analysis = analyses?.[0]
  if (!analysis) notFound()

  const emptyNaehrwerte = { kcal: 0, protein_g: 0, kohlenhydrate_g: 0, zucker_g: 0, fett_g: 0, ballaststoffe_g: 0 }
  const emptyBausteine = { geschmack: 'nicht_bewertet', biss: 'nicht_bewertet', ballaststoffe: 'nicht_bewertet', proteine: 'nicht_bewertet', volumen: 'nicht_bewertet', art_of_eating: 'nicht_bewertet' } as AnalysisResult['vorher']['bausteine']

  const result: AnalysisResult = {
    zutatenliste: analysis.refined_ingredients?.ingredients ?? [],
    annahmen: analysis.refined_ingredients?.assumptions ?? [],
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

  const conversations = meal.meal_conversations as unknown as { assumptions: string[] | null }[]
  const assumptions: string[] = conversations?.[0]?.assumptions ?? []

  let photoUrl: string | null = null
  const photoPath = (meal as unknown as { photo_fullsize_path: string | null }).photo_fullsize_path
  if (photoPath) {
    const { data: signed } = await supabase.storage
      .from('meal-photos')
      .createSignedUrl(photoPath, 3600)
    photoUrl = signed?.signedUrl ?? null
  }

  return <MahlzeitDetail result={result} assumptions={assumptions} analysisId={analysis.id} photoUrl={photoUrl} />
}
