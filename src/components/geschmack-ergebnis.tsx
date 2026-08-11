'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import KIHinweis from '@/components/ki-hinweis'
import type { GeschmackState, GeschmackResult } from '@/components/saettigungs-ergebnis'

// PROJ-33: eigenständige, gleichwertig prominente Geschmack-Sektion neben der Sättigung —
// nie inhaltlich vermischt (siehe docs/saettigungsmatrix.md Abschnitt 7 "Ausgelagert").
// Bewusst kompakter Inhalt (nur Score + Label + max. 2 Highlights) trotz gleicher visueller
// Größe wie die Sättigungs-Sektion — die 10 Geschmackskomponenten sind laut
// docs/geschmacks-score-prompt.md nicht additiv zu lesen ("Balance, nicht Checkliste"), eine
// Einzelkomponenten-Liste würde das falsch suggerieren (siehe PROJ-33 Decision Log).

interface GeschmackErgebnisProps {
  geschmack: GeschmackState
  /** Endpunkt für den "Nochmal prüfen"-Retry — fragt NUR den Geschmack-Teil neu an, nie die
   *  ganze Analyse bzw. das ganze Rezept (siehe PROJ-33 Tech Design, "schlanker Zweit-Pfad"). */
  retryEndpoint: string
  retryBody?: Record<string, unknown>
  /** 'automatisch' im Rezept-Kontext (analog RezeptSaettigungsMatrix), sonst 'allgemein' */
  kiHinweisVariante?: 'allgemein' | 'automatisch'
}

function labelConfig(label: GeschmackResult['label']) {
  switch (label) {
    case 'richtig_gut': return { display: 'Richtig gut', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
    case 'lecker':       return { display: 'Lecker',      text: 'text-[#0E7C86]',  bg: 'bg-[#DFF0F2]',  border: 'border-[#DCEEF0]' }
    case 'okay':          return { display: 'Okay',        text: 'text-[#EAB308]',  bg: 'bg-amber-50',   border: 'border-amber-200' }
    case 'fad':            return { display: 'Fad',         text: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-200' }
  }
}

export default function GeschmackErgebnis({
  geschmack,
  retryEndpoint,
  retryBody,
  kiHinweisVariante = 'allgemein',
}: GeschmackErgebnisProps) {
  // Retry-Ergebnis wird bewusst lokal gehalten statt an einen Eltern-State zurückgereicht —
  // betrifft ausschließlich diese Sektion, ein Ändern des übergeordneten Analyse-/Rezept-States
  // wäre unnötig invasiv für einen reinen Teil-Retry.
  const [current, setCurrent] = useState(geschmack)
  const [retrying, setRetrying] = useState(false)
  const [retryFailed, setRetryFailed] = useState(false)

  async function handleRetry() {
    setRetrying(true)
    setRetryFailed(false)
    try {
      const res = await fetch(retryEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(retryBody ?? {}),
      })
      if (!res.ok) throw new Error('retry failed')
      const data = await res.json()
      setCurrent({ status: 'ok', ...(data.geschmack as GeschmackResult) })
    } catch {
      setRetryFailed(true)
    } finally {
      setRetrying(false)
    }
  }

  if (current.status === 'error') {
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Geschmack</p>
        <div className="rounded-xl border border-border bg-muted/40 p-4 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Geschmack konnte nicht ermittelt werden.</p>
          {retryFailed && (
            <p className="text-xs text-red-600">Hat wieder nicht geklappt — versuch&apos;s gern nochmal.</p>
          )}
          <Button variant="outline" size="sm" onClick={handleRetry} disabled={retrying}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Wird geprüft…' : 'Nochmal prüfen'}
          </Button>
        </div>
      </div>
    )
  }

  const cfg = labelConfig(current.label)
  const isTopScore = current.score >= 85

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">Geschmack</p>
        <KIHinweis variante={kiHinweisVariante} />
      </div>

      <div className="text-center space-y-2">
        <p className={`text-4xl font-bold ${cfg.text}`}>{current.score}</p>
        <span
          className={`inline-block px-5 py-2 rounded-full border text-base font-semibold ${cfg.text} ${cfg.bg} ${cfg.border}`}
        >
          {cfg.display}
        </span>
      </div>

      {isTopScore ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center space-y-1">
          <p className="text-2xl">😋</p>
          <p className="text-sm font-semibold text-emerald-600">Geschmacklich stimmt hier alles!</p>
        </div>
      ) : current.verbesserungen.length > 0 && (
        <div className="space-y-2">
          {current.verbesserungen.map((tipp, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-3">
              <p className="text-sm text-foreground">{tipp}</p>
            </div>
          ))}
        </div>
      )}

      {current.unklarHinweis && (
        <p className="text-xs text-muted-foreground">{current.unklarHinweis}</p>
      )}
    </div>
  )
}
