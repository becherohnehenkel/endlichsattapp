'use client'

import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import WochenRecapKarte, { type WochenRecap } from './wochen-recap-karte'

export default function WochenRecapSektion() {
  const [wochen, setWochen] = useState<WochenRecap[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRecap() {
      try {
        const res = await fetch('/api/recap/wochen')
        if (!res.ok) return
        const data: { wochen: WochenRecap[] } = await res.json()
        setWochen(data.wochen)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRecap()
  }, [])

  if (isLoading) {
    return (
      <div className="border-b-4 border-border/30 mb-1">
        <div className="px-4 py-2 bg-card border-b border-border">
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="divide-y divide-border">
          {[1, 2].map((i) => (
            <div key={i} className="px-4 py-3 bg-card flex items-start justify-between gap-2">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-4 w-4 rounded mt-0.5" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (wochen.length === 0) return null

  return (
    <div className="border-b-4 border-border/30 mb-1">
      <div className="px-4 py-2 bg-card border-b border-border">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Wochenrückblick
        </p>
      </div>
      <div className="divide-y divide-border">
        {wochen.map((woche, idx) => (
          <WochenRecapKarte
            key={woche.startDatum}
            woche={woche}
            defaultOpen={idx === 0}
          />
        ))}
      </div>
    </div>
  )
}
