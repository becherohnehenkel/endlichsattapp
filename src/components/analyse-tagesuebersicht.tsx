'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, UtensilsCrossed } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

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
          {kcalRest == null ? (
            <p className="text-sm text-muted-foreground">
              Dafür fehlt noch dein Kalorienziel.{' '}
              <Link href="/ernaehrung/so-geht-abnehmen" className="text-[#2E9E6B] hover:underline font-medium">
                Kcal-Rechner ausfüllen →
              </Link>
            </p>
          ) : kcalRest > 0 ? (
            <p className="text-sm text-muted-foreground">
              Noch ca. <span className="font-semibold text-foreground">{kcalRest} kcal</span> übrig heute.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Dein Kalorienziel ist heute schon erreicht — passt schon.</p>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
