import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { findTrainingsplan } from '@/lib/trainingsplaene'
import { TrainingSubHeader } from '@/components/training-sub-header'
import { TrainingsplanDetail, type UebungsWerte } from '@/components/trainingsplan-detail'

export default async function TrainingsplanPage({
  params,
}: {
  params: Promise<{ plan: string }>
}) {
  const { plan: slug } = await params
  const plan = findTrainingsplan(slug)
  if (!plan) notFound()

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null
  const isGuest = !user || user.is_anonymous === true

  let letzterStand: Record<string, UebungsWerte> | null = null
  if (!isGuest && user) {
    // Fehler (z. B. Tabelle existiert noch nicht) werden bewusst ignoriert — die Seite
    // fällt dann einfach auf die Plan-Standardwerte zurück statt zu crashen.
    const { data } = await supabase
      .from('training_sessions')
      .select('uebungen')
      .eq('user_id', user.id)
      .eq('plan_slug', plan.slug)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    letzterStand = (data?.uebungen as Record<string, UebungsWerte> | undefined) ?? null
  }

  return (
    <div className="min-h-screen bg-background">
      <TrainingSubHeader title={plan.titel} />
      <main className="max-w-sm md:max-w-[850px] mx-auto px-4 py-6">
        <TrainingsplanDetail plan={plan} isGuest={isGuest} letzterStand={letzterStand} />
      </main>
    </div>
  )
}
