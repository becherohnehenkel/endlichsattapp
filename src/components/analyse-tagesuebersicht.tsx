'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, UtensilsCrossed } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { ladeKcalGastWerte } from '@/lib/kcal-gast-speicher'
import { berechneKcal } from '@/lib/kcal-rechner'

interface AnalyseTagesuebersichtProps {
  mahlzeitenHeute: number
  mahlzeitenZiel: number
  kcalRest: number | null
}

// PROJ-42: Sektion 2 der Analyse-Übersicht. Zeigt den Mahlzeiten-Fortschritt des Tages
// ohne Kalorien-Bezug; die Restkalorien-Zahl ist bewusst erst nach aktivem Aufklappen
// sichtbar — eingeklappt gibt es nur den Hinweis, dass noch etwas Spielraum da ist
// (siehe Spec Open Questions / Decision Log: bewusste, passive Ausnahme vom
// Kein-Kalorienzählen-Non-Goal).
export function AnalyseTagesuebersicht({ mahlzeitenHeute, mahlzeitenZiel, kcalRest }: AnalyseTagesuebersichtProps) {
  const [offen, setOffen] = useState(false)
  const erledigt = mahlzeitenHeute >= mahlzeitenZiel
  const nochOffen = Math.max(mahlzeitenZiel - mahlzeitenHeute, 0)

  // PROJ-37 (Refinement: Stateless Gast-Persistenz) — greift nur, wenn kein serverseitiger
  // Wert vorliegt (kcalRest === null). Für Gäste gibt es kein Tracking der heute bereits
  // verzehrten Kalorien, daher entspricht der Fallback direkt dem vollen Tagesziel. Bewusst
  // ein `useEffect`, nicht ein lazy `useState`-Initializer — sonst würde der Client beim
  // ersten Rendern (Hydration) einen anderen Wert anzeigen als der Server, was zu einem
  // Hydration-Mismatch führt (bei einem harten Seitenaufruf reproduzierbar zu einem Absturz
  // geführt, siehe QA an `feste-mahlzeiten-planer.tsx`).
  const [gastKcalRest, setGastKcalRest] = useState<number | null>(null)
  useEffect(() => {
    if (kcalRest != null) return
    const gastWerte = ladeKcalGastWerte()
    if (!gastWerte) return
    setGastKcalRest(berechneKcal(gastWerte).zielKcal)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const effektivesKcalRest = kcalRest ?? gastKcalRest

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-[#DFF0F2] flex items-center justify-center">
          <UtensilsCrossed className="h-5 w-5 text-[#2E9E6B]" />
        </div>
        <div className="flex-1 min-w-0">
          {erledigt ? (
            <p className="font-semibold text-foreground">Alle {mahlzeitenZiel} Mahlzeiten erledigt ✓</p>
          ) : (
            <p className="font-semibold text-foreground">{mahlzeitenHeute} von {mahlzeitenZiel} Mahlzeiten heute</p>
          )}
          <p className="text-sm text-muted-foreground">
            {erledigt ? 'Guter Tag.' : `Noch ${nochOffen} ${nochOffen === 1 ? 'Mahlzeit' : 'Mahlzeiten'} offen`}
          </p>
        </div>
      </div>

      <Collapsible open={offen} onOpenChange={setOffen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-sm text-[#2E9E6B] hover:underline">
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', offen && 'rotate-180')} />
          {offen ? 'Genauen Wert ausblenden' : 'Kannst du noch etwas essen?'}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          {effektivesKcalRest == null ? (
            <p className="text-sm text-muted-foreground">
              Dafür fehlt noch dein Kalorienziel.{' '}
              <Link href="/ernaehrung/so-geht-abnehmen" className="text-[#2E9E6B] hover:underline font-medium">
                Kcal-Rechner ausfüllen →
              </Link>
            </p>
          ) : effektivesKcalRest > 0 ? (
            <p className="text-sm text-muted-foreground">
              Noch ca. <span className="font-semibold text-foreground">{effektivesKcalRest} kcal</span> übrig heute.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Dein Kalorienziel ist heute schon erreicht — passt schon.</p>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
