'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Dumbbell } from 'lucide-react'
import TrainingKarte, { type TrainingEntry } from '@/components/training-karte'
import TrainingKennzahlen, { type TrainingKennzahlenData } from '@/components/training-kennzahlen'

interface TrainingVerlaufResponse {
  trainings: TrainingEntry[]
  hasMore: boolean
  /** Nur bei offset=0 vorhanden — serverseitig berechnete Kennzahlen. */
  kennzahlen?: TrainingKennzahlenData
}

// PROJ-50: Ersetzt den "Bald verfügbar"-Platzhalter im "Training"-Tab der Analyse-Seite.
// Lade-Muster bewusst identisch zu MahlzeitHistorie (PROJ-6): erste 5 Einträge, danach
// "Ältere Einträge laden" in 10er-Schritten. Kein Löschen, keine FAB — reine Anzeige/Analyse
// (siehe Spec Out of Scope).
export default function TrainingHistorie() {
  const [trainings, setTrainings] = useState<TrainingEntry[]>([])
  const [kennzahlen, setKennzahlen] = useState<TrainingKennzahlenData | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [serverOffset, setServerOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInitial() {
      try {
        const res = await fetch('/api/training/verlauf?limit=5&offset=0')
        if (!res.ok) throw new Error()
        const data: TrainingVerlaufResponse = await res.json()
        setTrainings(data.trainings)
        setHasMore(data.hasMore)
        setServerOffset(data.trainings.length)
        if (data.kennzahlen) setKennzahlen(data.kennzahlen)
      } catch {
        setLoadError('Deine Trainingseinheiten konnten nicht geladen werden.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchInitial()
  }, [])

  async function loadMore() {
    setIsLoadingMore(true)
    setLoadError(null)
    try {
      const res = await fetch(`/api/training/verlauf?limit=10&offset=${serverOffset}`)
      if (!res.ok) throw new Error()
      const data: TrainingVerlaufResponse = await res.json()
      setTrainings(prev => [...prev, ...data.trainings])
      setHasMore(data.hasMore)
      setServerOffset(prev => prev + data.trainings.length)
    } catch {
      setLoadError('Ältere Einträge konnten nicht geladen werden.')
    } finally {
      setIsLoadingMore(false)
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 py-6 space-y-3" data-testid="training-historie-skeleton">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-11 h-11 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {loadError && (
        <div className="px-4">
          <Alert variant="destructive">
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        </div>
      )}

      {kennzahlen && (
        <div className="px-4">
          <TrainingKennzahlen {...kennzahlen} />
        </div>
      )}

      {trainings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <Dumbbell className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="font-semibold text-foreground">Noch keine Trainingseinheit</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Schließe dein erstes Training ab, dann erscheint es hier.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {trainings.map((t) => (
            <TrainingKarte key={t.id} {...t} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-1 pb-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="text-muted-foreground text-xs"
          >
            {isLoadingMore ? 'Lade…' : '↓ Ältere Einträge laden'}
          </Button>
        </div>
      )}
    </div>
  )
}
