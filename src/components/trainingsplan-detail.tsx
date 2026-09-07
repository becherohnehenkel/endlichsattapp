'use client'

import { useState } from 'react'
import { ChevronDown, Dumbbell } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoginHinweis } from '@/components/login-hinweis'
import { cn } from '@/lib/utils'
import type { Trainingsplan, TrainingsUebung } from '@/lib/trainingsplaene'

export interface SatzFelder {
  wiederholungen: string
  gewicht: string
}

export interface UebungsWerte {
  pause: string
  saetze: SatzFelder[]
}

function leereSaetze(plan: Trainingsplan): SatzFelder[] {
  const anzahl = parseInt(plan.schemaSaetze, 10) || 3
  return Array.from({ length: anzahl }, () => ({
    wiederholungen: plan.schemaWiederholungen,
    gewicht: '',
  }))
}

// PROJ-44 (Refinement 2026-09-07): Wandelt ein Freitext-Feld in eine Zahl um — leere oder
// nicht-numerische Eingaben werden zu `null` (kein Pflichtfeld, "leer" bleibt "nichts
// eingetragen" statt fälschlich "0"). Komma wird als Dezimaltrennzeichen akzeptiert, auch
// wenn das native Zahlen-Feld selbst schon einen Punkt liefert.
function parseZahlOderNull(value: string): number | null {
  const bereinigt = value.trim().replace(',', '.')
  if (bereinigt === '') return null
  const zahl = parseFloat(bereinigt)
  return Number.isFinite(zahl) ? zahl : null
}

// Formt einen aus der DB gelesenen Satz-Wert (kann bei Plan 3 künftig eine echte Zahl sein,
// bei älteren Einträgen weiterhin Freitext, siehe Architektur-Entscheidung "keine Migration")
// zurück in einen String fürs Eingabefeld — Formulare sind hier immer string-kontrolliert.
function alsFeldString(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

function normalisiereGespeicherteWerte(werte: UebungsWerte): UebungsWerte {
  return {
    pause: alsFeldString(werte.pause),
    saetze: werte.saetze.map(satz => ({
      wiederholungen: alsFeldString(satz.wiederholungen),
      gewicht: alsFeldString(satz.gewicht),
    })),
  }
}

// Formt die Formular-Werte (immer Strings, auch bei numerischen Feldern) in das Format um,
// das die API erwartet — bei Plan 3 (Fitnessstudio) echte Zahlen statt Freitext.
function serialisiereWerte(plan: Trainingsplan, werte: Record<string, UebungsWerte>) {
  return Object.fromEntries(
    Object.entries(werte).map(([id, uebungsWerte]) => [
      id,
      {
        pause: uebungsWerte.pause,
        saetze: uebungsWerte.saetze.map(satz => ({
          wiederholungen: plan.wiederholungenNumerisch ? parseZahlOderNull(satz.wiederholungen) : satz.wiederholungen,
          gewicht: plan.zusatzfeld.art === 'numerisch' ? parseZahlOderNull(satz.gewicht) : satz.gewicht,
        })),
      },
    ])
  )
}

function UebungsKarte({
  uebung,
  plan,
  werte,
  onChange,
}: {
  uebung: TrainingsUebung
  plan: Trainingsplan
  werte: UebungsWerte
  onChange: (werte: UebungsWerte) => void
}) {
  const [offen, setOffen] = useState(false)

  function setSatzFeld(index: number, key: keyof SatzFelder, value: string) {
    onChange({
      ...werte,
      saetze: werte.saetze.map((satz, i) => (i === index ? { ...satz, [key]: value } : satz)),
    })
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
        <Input id={`${uebung.id}-pause`} value={werte.pause} onChange={e => onChange({ ...werte, pause: e.target.value })} className="h-9 text-sm" />
      </div>

      <div className="space-y-2">
        <div className={cn('grid gap-2 text-[11px] text-muted-foreground uppercase tracking-wide px-0.5', plan.zusatzfeld.art !== 'keins' ? 'grid-cols-[2rem_1fr_1fr]' : 'grid-cols-[2rem_1fr]')}>
          <span>Satz</span>
          <span>Wdh.</span>
          {plan.zusatzfeld.art !== 'keins' && <span>{plan.zusatzfeld.label}</span>}
        </div>
        {werte.saetze.map((satz, index) => (
          <div key={index} className={cn('grid gap-2 items-center', plan.zusatzfeld.art !== 'keins' ? 'grid-cols-[2rem_1fr_1fr]' : 'grid-cols-[2rem_1fr]')}>
            <span className="text-sm font-medium text-foreground">{index + 1}</span>
            <Input
              aria-label={`${uebung.name} Satz ${index + 1} Wiederholungen`}
              type={plan.wiederholungenNumerisch ? 'number' : 'text'}
              inputMode={plan.wiederholungenNumerisch ? 'numeric' : undefined}
              step={plan.wiederholungenNumerisch ? 1 : undefined}
              min={plan.wiederholungenNumerisch ? 0 : undefined}
              value={satz.wiederholungen}
              onChange={e => setSatzFeld(index, 'wiederholungen', e.target.value)}
              className="h-9 text-sm"
            />
            {plan.zusatzfeld.art === 'freitext' && (
              <Input
                aria-label={`${uebung.name} Satz ${index + 1} ${plan.zusatzfeld.label}`}
                value={satz.gewicht}
                onChange={e => setSatzFeld(index, 'gewicht', e.target.value)}
                placeholder={plan.zusatzfeld.platzhalter}
                className="h-9 text-sm"
              />
            )}
            {plan.zusatzfeld.art === 'numerisch' && (
              <Input
                aria-label={`${uebung.name} Satz ${index + 1} ${plan.zusatzfeld.label}`}
                type="number"
                inputMode="decimal"
                step={plan.zusatzfeld.schritt}
                min={0}
                value={satz.gewicht}
                onChange={e => setSatzFeld(index, 'gewicht', e.target.value)}
                placeholder="z. B. 62,5"
                className="h-9 text-sm"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

interface TrainingsplanDetailProps {
  plan: Trainingsplan
  isGuest: boolean
  letzterStand: Record<string, UebungsWerte> | null
}

// PROJ-44: Trainingsplan-Detailseite. Für eingeloggte Nutzer werden die Felder mit dem
// zuletzt gespeicherten Stand vorausgefüllt (falls vorhanden), sonst mit dem Plan-Schema.
// "Training abschließen" legt einen neuen, datierten Verlaufs-Eintrag an. Gäste sehen
// statt des Buttons einen Login-Hinweis — ihre Eingaben werden nie gespeichert.
export function TrainingsplanDetail({ plan, isGuest, letzterStand }: TrainingsplanDetailProps) {
  const [werte, setWerte] = useState<Record<string, UebungsWerte>>(() =>
    Object.fromEntries(
      plan.uebungen.map(uebung => [
        uebung.id,
        letzterStand?.[uebung.id]
          ? normalisiereGespeicherteWerte(letzterStand[uebung.id])
          : { pause: plan.schemaPause, saetze: leereSaetze(plan) },
      ])
    )
  )
  const [speichern, setSpeichern] = useState(false)
  const [fehler, setFehler] = useState(false)
  const [erfolg, setErfolg] = useState(false)

  function updateUebung(id: string, neueWerte: UebungsWerte) {
    setWerte(prev => ({ ...prev, [id]: neueWerte }))
    setErfolg(false)
  }

  async function handleAbschliessen() {
    setSpeichern(true)
    setFehler(false)
    try {
      const res = await fetch(`/api/training/${plan.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uebungen: serialisiereWerte(plan, werte) }),
      })
      if (!res.ok) throw new Error()
      setErfolg(true)
    } catch {
      setFehler(true)
    } finally {
      setSpeichern(false)
    }
  }

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
          <UebungsKarte
            key={uebung.id}
            uebung={uebung}
            plan={plan}
            werte={werte[uebung.id]}
            onChange={w => updateUebung(uebung.id, w)}
          />
        ))}
      </div>

      {isGuest ? (
        <LoginHinweis
          icon={Dumbbell}
          text="Melde dich an, um dein Training zu speichern."
          reason="training"
        />
      ) : (
        <div className="space-y-2">
          {fehler && (
            <Alert variant="destructive">
              <AlertDescription>Speichern fehlgeschlagen. Bitte erneut versuchen.</AlertDescription>
            </Alert>
          )}
          {erfolg && (
            <Alert>
              <AlertDescription>Training gespeichert ✓</AlertDescription>
            </Alert>
          )}
          <Button className="w-full h-12" onClick={handleAbschliessen} disabled={speichern}>
            {speichern ? 'Wird gespeichert…' : 'Training abschließen'}
          </Button>
        </div>
      )}
    </div>
  )
}
