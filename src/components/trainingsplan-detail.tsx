'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { Trainingsplan, TrainingsUebung } from '@/lib/trainingsplaene'

interface UebungsFelder {
  saetze: string
  wiederholungen: string
  pause: string
  gewicht: string
}

function UebungsKarte({ uebung, plan }: { uebung: TrainingsUebung; plan: Trainingsplan }) {
  const [offen, setOffen] = useState(false)
  const [felder, setFelder] = useState<UebungsFelder>({
    saetze: plan.schemaSaetze,
    wiederholungen: plan.schemaWiederholungen,
    pause: plan.schemaPause,
    gewicht: '',
  })

  function setFeld(key: keyof UebungsFelder, value: string) {
    setFelder(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{uebung.name}</p>
        <Collapsible open={offen} onOpenChange={setOffen}>
          <CollapsibleTrigger className="flex items-center gap-1.5 text-sm text-[#2E9E6B] hover:underline">
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', offen && 'rotate-180')} />
            {offen ? 'Ausführung ausblenden' : 'Ausführung anzeigen'}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <p className="text-xs text-foreground/80 leading-relaxed">{uebung.ausfuehrung}</p>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className={cn('grid grid-cols-2 gap-2', plan.zeigtGewichtsfeld ? 'sm:grid-cols-4' : 'sm:grid-cols-3')}>
        <div className="space-y-1">
          <Label htmlFor={`${uebung.id}-saetze`} className="text-[11px] text-muted-foreground uppercase tracking-wide">Sätze</Label>
          <Input id={`${uebung.id}-saetze`} value={felder.saetze} onChange={e => setFeld('saetze', e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${uebung.id}-wdh`} className="text-[11px] text-muted-foreground uppercase tracking-wide">Wdh.</Label>
          <Input id={`${uebung.id}-wdh`} value={felder.wiederholungen} onChange={e => setFeld('wiederholungen', e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${uebung.id}-pause`} className="text-[11px] text-muted-foreground uppercase tracking-wide">Pause</Label>
          <Input id={`${uebung.id}-pause`} value={felder.pause} onChange={e => setFeld('pause', e.target.value)} className="h-9 text-sm" />
        </div>
        {plan.zeigtGewichtsfeld && (
          <div className="space-y-1">
            <Label htmlFor={`${uebung.id}-gewicht`} className="text-[11px] text-muted-foreground uppercase tracking-wide">Gewicht/Widerstand</Label>
            <Input id={`${uebung.id}-gewicht`} value={felder.gewicht} onChange={e => setFeld('gewicht', e.target.value)} placeholder="z. B. 20 kg" className="h-9 text-sm" />
          </div>
        )}
      </div>
    </div>
  )
}

// PROJ-44: Trainingsplan-Detailseite. Felder sind aktuell rein lokaler Component-State
// (vorausgefüllt mit dem Plan-Schema) — Speichern als Trainingseinheit, Vorausfüllung mit
// dem zuletzt gespeicherten Stand und der Gast-Hinweis kommen erst mit /backend
// (neue Tabelle + API-Route, siehe Spec Implementation Notes).
export function TrainingsplanDetail({ plan }: { plan: Trainingsplan }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{plan.titel}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{plan.intro}</p>
      </div>

      <div className="rounded-xl bg-muted/40 p-3 space-y-1">
        <p className="text-xs font-semibold text-foreground">Warm-Up</p>
        <p className="text-xs text-foreground/80 leading-relaxed">{plan.warmup}</p>
      </div>

      <div className="space-y-3">
        {plan.uebungen.map(uebung => (
          <UebungsKarte key={uebung.id} uebung={uebung} plan={plan} />
        ))}
      </div>
    </div>
  )
}
