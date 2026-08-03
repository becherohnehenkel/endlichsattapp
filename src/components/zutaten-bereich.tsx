'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { ZutatenQuelle } from '@/components/saettigungs-ergebnis'

export interface ZutatenBereichItem {
  name: string
  amount: string
  grams: number
}

interface ZutatenBereichProps {
  zutatenliste: ZutatenBereichItem[]
  /** PROJ-28 (BUG-7-Fix): positionsgenau zu `zutatenliste` ausgerichtet — `zutatenQuellen[i]`
   *  gehört zu `zutatenliste[i]`. Vermeidet Namens-Kollisionen bei doppelten Zutatennamen. */
  zutatenQuellen?: ZutatenQuelle[]
  /** PROJ-28: Mahlzeit wurde vor dem 3. August 2026 analysiert — Zutatendaten aus dieser
   *  Zeit sind bei geschätzten Zutaten unzuverlässig (stiller 0-kcal-Fallback statt eines
   *  echten KI-Werts), daher wird die Liste durch einen Hinweis ersetzt statt angezeigt. */
  tooOld?: boolean
}

export default function ZutatenBereich({
  zutatenliste,
  zutatenQuellen = [],
  tooOld = false,
}: ZutatenBereichProps) {
  const [open, setOpen] = useState(false)

  if (!tooOld && zutatenliste.length === 0) return null

  if (tooOld) {
    return (
      <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
        <span className="font-medium">🥗 Zutaten</span>
        <p className="text-xs mt-1">
          Diese Funktion ist seit dem 3. August 2026 verfügbar — für ältere Mahlzeiten liegen keine zuverlässigen Zutatendaten vor.
        </p>
      </div>
    )
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted/60 transition-colors">
        <span className="font-medium">🥗 Zutaten ({zutatenliste.length})</span>
        {open ? <ChevronUp className="h-4 w-4 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 flex-shrink-0" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pt-2 pb-1">
        <ul className="space-y-2">
          {zutatenliste.map((item, i) => {
            const quelle = zutatenQuellen[i]
            const isKiGeschaetzt = quelle === 'schaetzung'
            const isNichtSchaetzbar = quelle === 'nicht_schaetzbar'
            return (
              <li key={i} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-foreground font-medium break-words">{item.name}</span>
                  {isKiGeschaetzt && (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground border-border shrink-0">
                      ≈ KI-geschätzt
                    </Badge>
                  )}
                  {isNichtSchaetzbar && (
                    <Badge variant="outline" className="text-[10px] text-[#EAB308] border-[#EAB308]/30 bg-[#EAB308]/10 shrink-0">
                      ⚠️ nicht schätzbar
                    </Badge>
                  )}
                </div>
                <span className="text-muted-foreground flex-shrink-0">
                  {item.amount} → {item.grams}g
                </span>
              </li>
            )
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}
