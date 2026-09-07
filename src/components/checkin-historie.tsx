'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ClipboardCheck } from 'lucide-react'
import CheckInEintrag, { type CheckInEntry } from '@/components/checkin-eintrag'
import CheckInKennzahlen, { type CheckInMetrikErgebnis } from '@/components/checkin-kennzahlen'

interface CheckInVerlaufResponse {
  checkIns: CheckInEntry[]
  hasMore: boolean
  /** Nur bei offset=0 vorhanden — serverseitig berechnete Kennzahlen. */
  kennzahlen?: CheckInMetrikErgebnis[]
}

// PROJ-51: Ersetzt den "Bald verfügbar"-Platzhalter im "Check-Ins"-Tab der Analyse-Seite.
// Lade-Muster identisch zu TrainingHistorie (PROJ-50): erste 5 Einträge, danach
// "Ältere Einträge laden" in 10er-Schritten. Kein Bearbeiten hier — das bleibt der
// bestehenden Mini-Historie auf /check-in (PROJ-45) vorbehalten (siehe Spec).
export default function CheckInHistorie() {
  const [checkIns, setCheckIns] = useState<CheckInEntry[]>([])
  const [kennzahlen, setKennzahlen] = useState<CheckInMetrikErgebnis[] | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [serverOffset, setServerOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInitial() {
      try {
        const res = await fetch('/api/check-in/verlauf?limit=5&offset=0')
        if (!res.ok) throw new Error()
        const data: CheckInVerlaufResponse = await res.json()
        setCheckIns(data.checkIns)
        setHasMore(data.hasMore)
        setServerOffset(data.checkIns.length)
        if (data.kennzahlen) setKennzahlen(data.kennzahlen)
      } catch {
        setLoadError('Deine Check-Ins konnten nicht geladen werden.')
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
      const res = await fetch(`/api/check-in/verlauf?limit=10&offset=${serverOffset}`)
      if (!res.ok) throw new Error()
      const data: CheckInVerlaufResponse = await res.json()
      setCheckIns(prev => [...prev, ...data.checkIns])
      setHasMore(data.hasMore)
      setServerOffset(prev => prev + data.checkIns.length)
    } catch {
      setLoadError('Ältere Einträge konnten nicht geladen werden.')
    } finally {
      setIsLoadingMore(false)
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 py-6 space-y-3" data-testid="checkin-historie-skeleton">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-11 h-11 rounded-lg flex-shrink-0" />
            <Skeleton className="h-4 w-1/2" />
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

      {kennzahlen && kennzahlen.length > 0 && (
        <div className="px-4">
          <CheckInKennzahlen metriken={kennzahlen} />
        </div>
      )}

      {checkIns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <ClipboardCheck className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="font-semibold text-foreground">Noch kein Check-In</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Fülle deinen ersten Wochen-Check-In aus, dann erscheint er hier.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {checkIns.map((c) => (
            <CheckInEintrag key={c.id} {...c} />
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
