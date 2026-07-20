'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChefHat } from 'lucide-react'
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
      </div>
    )
  }

  // Kein passendes Rezept gefunden — kleiner Hinweis mit Absprung zur Bibliothek,
  // damit dieser Abschnitt unabhängig vom Match-Ergebnis immer etwas Konsistentes zeigt.
  if (!rezepte || rezepte.length === 0) {
    return (
      <Link href="/rezepte">
        <div className="rounded-xl border border-border bg-muted/40 p-4 flex items-center gap-3 hover:border-[#4A7C59] transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-[#4A7C59]/15 flex items-center justify-center shrink-0">
            <ChefHat className="h-4 w-4 text-[#4A7C59]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Zur Rezeptbibliothek</p>
            <p className="text-xs text-muted-foreground leading-snug">Kein direkt passendes Rezept gefunden — hier gibt es Inspiration</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">
        🍳 Passendes Rezept
      </p>
      <RezeptKarte {...rezepte[0]} />
    </div>
  )
}
