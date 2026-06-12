'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import RezeptKarte, { type RezeptKarteData } from '@/components/rezept-karte'

interface RezeptVorschlaegeProps {
  analysisId: string
}

export default function RezeptVorschlaege({ analysisId }: RezeptVorschlaegeProps) {
  const [rezepte, setRezepte] = useState<RezeptKarteData[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/rezepte/vorschlaege?analysisId=${analysisId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setRezepte(data?.recipes ?? []))
      .catch(() => setRezepte([]))
      .finally(() => setLoading(false))
  }, [analysisId])

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-[72px] w-full rounded-xl" />
        <Skeleton className="h-[72px] w-full rounded-xl" />
      </div>
    )
  }

  if (!rezepte || rezepte.length === 0) return null

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">
        🍳 Passende Rezepte
      </p>
      <div className="space-y-2">
        {rezepte.map(r => (
          <RezeptKarte key={r.id} {...r} />
        ))}
      </div>
    </div>
  )
}
