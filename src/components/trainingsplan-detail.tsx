'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { Trainingsplan, TrainingsUebung } from '@/lib/trainingsplaene'

interface SatzFelder {
  wiederholungen: string
  gewicht: string
}

function leereSaetze(plan: Trainingsplan): SatzFelder[] {
  const anzahl = parseInt(plan.schemaSaetze, 10) || 3
  return Array.from({ length: anzahl }, () => ({
    wiederholungen: plan.schemaWiederholungen,
    gewicht: '',
  }))
}

function UebungsKarte({ uebung, plan }: { uebung: TrainingsUebung; plan: Trainingsplan }) {
  const [offen, setOffen] = useState(false)
  const [pause, setPause] = useState(plan.schemaPause)
  const [saetze, setSaetze] = useState<SatzFelder[]>(() => leereSaetze(plan))

  function setSatzFeld(index: number, key: keyof SatzFelder, value: string) {
    setSaetze(prev => prev.map((satz, i) => (i === index ? { ...satz, [key]: value } : satz)))
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

      <div className="space-y-1 max-w-[140px]">
        <Label htmlFor={`${uebung.id}-pause`} className="text-[11px] text-muted-foreground uppercase tracking-wide">Pause</Label>
        <Input id={`${uebung.id}-pause`} value={pause} onChange={e => setPause(e.target.value)} className="h-9 text-sm" />
      </div>

      <div className="space-y-2">
        <div className={cn('grid gap-2 text-[11px] text-muted-foreground uppercase tracking-wide px-0.5', plan.zeigtGewichtsfeld ? 'grid-cols-[2rem_1fr_1fr]' : 'grid-cols-[2rem_1fr]')}>
          <span>Satz</span>
          <span>Wdh.</span>
          {plan.zeigtGewichtsfeld && <span>Gewicht</span>}
        </div>
        {saetze.map((satz, index) => (
          <div key={index} className={cn('grid gap-2 items-center', plan.zeigtGewichtsfeld ? 'grid-cols-[2rem_1fr_1fr]' : 'grid-cols-[2rem_1fr]')}>
            <span className="text-sm font-medium text-foreground">{index + 1}</span>
            <Input
              aria-label={`${uebung.name} Satz ${index + 1} Wiederholungen`}
              value={satz.wiederholungen}
              onChange={e => setSatzFeld(index, 'wiederholungen', e.target.value)}
              className="h-9 text-sm"
            />
            {plan.zeigtGewichtsfeld && (
              <Input
                aria-label={`${uebung.name} Satz ${index + 1} Gewicht`}
                value={satz.gewicht}
                onChange={e => setSatzFeld(index, 'gewicht', e.target.value)}
                placeholder="z. B. 20 kg"
                className="h-9 text-sm"
              />
            )}
          </div>
        ))}
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
