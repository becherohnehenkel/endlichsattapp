'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, UtensilsCrossed } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { LoginHinweis } from '@/components/login-hinweis'
import { ladeKcalGastWerte } from '@/lib/kcal-gast-speicher'
import { berechneKcal } from '@/lib/kcal-rechner'

// PROJ-37 (Refinement: Stateless Gast-Persistenz) — schlanke Gast-Variante der
// Analyse-Übersicht-Sektion "Das hast du bereits gegessen". Anders als bei eingeloggten
// Nutzern gibt es für Gäste kein Tracking der heutigen Mahlzeiten (server-seitig immer 0),
// daher zeigt diese Variante bewusst KEINEN Mahlzeiten-Zähler — nur das lokal gespeicherte
// Kalorienziel, falls vorhanden. Ohne gespeicherten Wert bleibt der bisherige
// Login-Hinweis unverändert bestehen.
//
// Bewusst ein `useEffect`, nicht ein lazy `useState`-Initializer: der Server rendert
// immer den Login-Hinweis (kein `window.localStorage`), ein Initializer, der auf dem
// Client sofort den echten Wert läse, erzeugt einen Hydration-Mismatch (führte bei einem
// harten Seitenaufruf reproduzierbar zu einem Absturz der gesamten Sektion, siehe QA).
export function AnalyseTagesuebersichtGast() {
  const [offen, setOffen] = useState(false)
  const [gastKcal, setGastKcal] = useState<number | null>(null)
  useEffect(() => {
    const gastWerte = ladeKcalGastWerte()
    if (!gastWerte) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- absichtlich, siehe Kommentar oben
    setGastKcal(berechneKcal(gastWerte).zielKcal)
  }, [])

  if (gastKcal == null) {
    return (
      <LoginHinweis
        icon={UtensilsCrossed}
        text="Melde dich an, um deinen Tagesfortschritt zu sehen."
        reason="tagesuebersicht"
      />
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-[#DFF0F2] flex items-center justify-center">
          <UtensilsCrossed className="h-5 w-5 text-[#2E9E6B]" />
        </div>
        <p className="text-sm text-muted-foreground">
          Dein Mahlzeiten-Fortschritt braucht ein Konto — dein Kalorienziel aus dem Kcal-Rechner steht dir aber schon jetzt zur Verfügung.
        </p>
      </div>

      <Collapsible open={offen} onOpenChange={setOffen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-sm text-[#2E9E6B] hover:underline">
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', offen && 'rotate-180')} />
          {offen ? 'Genauen Wert ausblenden' : 'Kannst du noch etwas essen?'}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <p className="text-sm text-muted-foreground">
            Noch ca. <span className="font-semibold text-foreground">{gastKcal} kcal</span> übrig heute.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
