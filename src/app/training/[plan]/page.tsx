import { notFound } from 'next/navigation'
import { findTrainingsplan } from '@/lib/trainingsplaene'
import { TrainingSubHeader } from '@/components/training-sub-header'
import { TrainingsplanDetail } from '@/components/trainingsplan-detail'

export default async function TrainingsplanPage({
  params,
}: {
  params: Promise<{ plan: string }>
}) {
  const { plan: slug } = await params
  const plan = findTrainingsplan(slug)
  if (!plan) notFound()

  return (
    <div className="min-h-screen bg-background">
      <TrainingSubHeader title={plan.titel} />
      <main className="max-w-sm md:max-w-[850px] mx-auto px-4 py-6">
        <TrainingsplanDetail plan={plan} />
      </main>
    </div>
  )
}
