'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// PROJ-38 (Refinement): gemeinsamer Baustein für das "Arbeitspunkte"-Muster — jetzt als
// Ein-/Ausklapp-Liste (shadcn Accordion, type="multiple": jeder Punkt unabhängig
// auf-/zuklappbar), damit nicht der komplette Text aller Punkte auf einmal sichtbar ist.
// Ersetzt die bisher zweifach duplizierte, immer ausgeklappte Variante in
// art-of-eating-guide.tsx und so-geht-abnehmen-guide.tsx — beide wurden auf diesen
// Baustein umgestellt (Nutzerwunsch: einheitliches Verhalten über alle Guides hinweg).

function subscribe() { return () => {} }
function getSnapshot() { return true }
function getServerSnapshot() { return false }

export interface Arbeitspunkt {
  id: number
  titel: string
  inhalt: ReactNode
}

export interface ArbeitspunkteSektion {
  /** Optionale Überschrift + Trennlinie vor dieser Gruppe von Arbeitspunkten. */
  label?: string
  punkte: Arbeitspunkt[]
}

interface ArbeitspunkteListeProps {
  /** Eigener localStorage-Key pro Seite, damit sich Fortschritte nicht überschneiden. */
  storageKey: string
  sektionen: ArbeitspunkteSektion[]
  /** Optionaler Feier-Hinweis, wenn alle Punkte "Verstanden" sind. */
  celebration?: ReactNode
  /**
   * IDs der Punkte, die initial aufgeklappt starten sollen (z. B. der Kcal-Rechner,
   * wenn bereits gespeicherte Werte + Ergebnis vorliegen — die sollen ohne
   * zusätzlichen Klick sichtbar sein). Standardmäßig starten alle Punkte eingeklappt.
   */
  defaultOffenIds?: number[]
  /**
   * Onboarding-Hinweis für Erstbesucher: öffnet den allerersten Arbeitspunkt automatisch
   * nach `autoOpenNachMs`, lässt danach dessen "Verstanden"-Button nach `pulseNachMs`
   * pulsieren (zeigt, dass er anklickbar ist), und zeigt optional danach ein einmaliges
   * Erklär-Dialog (per `dialog.storageKey` dauerhaft in localStorage gemerkt). Alle drei
   * Schritte werden abgebrochen, sobald der Nutzer selbst irgendeinen Punkt bedient — sonst
   * würde z. B. das Dialog-Overlay eine parallel laufende eigene Interaktion blockieren.
   * Wird komplett übersprungen, wenn der erste Punkt schon abgeschlossen ist. Nur für
   * Emotionales Essen aktiviert — die anderen beiden Guides (Art of Eating, So geht
   * abnehmen) nutzen diese Komponente unverändert ohne Onboarding.
   */
  ersterPunktOnboarding?: {
    autoOpenNachMs: number
    pulseNachMs: number
    dialog?: { nachMs: number; storageKey: string; titel: string; text: string; buttonText: string }
  }
}

export function ArbeitspunkteListe({ storageKey, sektionen, celebration, defaultOffenIds = [], ersterPunktOnboarding }: ArbeitspunkteListeProps) {
  const isMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const allePunkte = sektionen.flatMap(s => s.punkte)
  const gesamt = allePunkte.length
  const ersterPunktId = allePunkte[0]?.id

  const [completed, setCompleted] = useState<Set<number>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? new Set(JSON.parse(stored) as number[]) : new Set()
    } catch {
      return new Set()
    }
  })

  const [pulsierendeId, setPulsierendeId] = useState<number | null>(null)
  const [dialogOffen, setDialogOffen] = useState(false)
  // Onboarding öffnet den ersten Punkt per simuliertem Klick auf seinen echten Trigger-Button
  // (statt den Accordion auf "controlled" umzustellen) — Radix bleibt dadurch vollständig
  // uncontrolled (defaultValue) und verhält sich exakt wie bei einem echten Nutzerklick.
  const ersterTriggerRef = useRef<HTMLButtonElement>(null)
  // Sobald der Nutzer selbst irgendeinen Punkt auf-/zuklappt oder "Verstanden" klickt, macht das
  // Onboarding keinen Sinn mehr (er hat's schon verstanden) — außerdem würde v. a. das
  // Dialog-Overlay sonst eine parallel laufende eigene Interaktion blockieren (volle Seite,
  // z-50). Ref statt State, da kein Re-Render nötig ist.
  const interagiertRef = useRef(false)
  // Der simulierte Klick fürs Auto-Öffnen löst denselben `onValueChange` aus wie ein echter
  // Nutzerklick — dieses Flag unterscheidet die beiden, damit der eigene Auto-Klick nicht
  // fälschlich als "Nutzer hat interagiert" gewertet wird und Pulse/Dialog abbricht.
  const autoKlickLaeuftRef = useRef(false)

  useEffect(() => {
    if (!ersterPunktOnboarding || ersterPunktId == null || completed.has(ersterPunktId)) return
    const openTimer = setTimeout(() => {
      if (interagiertRef.current) return
      autoKlickLaeuftRef.current = true
      ersterTriggerRef.current?.click()
      // Radix ruft onValueChange u. U. erst über einen Effekt auf, also nicht synchron
      // direkt nach click() zurücksetzen, sondern erst einen Tick später.
      setTimeout(() => { autoKlickLaeuftRef.current = false }, 0)
    }, ersterPunktOnboarding.autoOpenNachMs)
    const pulseTimer = setTimeout(() => {
      if (interagiertRef.current) return
      setPulsierendeId(ersterPunktId)
    }, ersterPunktOnboarding.pulseNachMs)

    const dialog = ersterPunktOnboarding.dialog
    let dialogTimer: ReturnType<typeof setTimeout> | null = null
    if (dialog) {
      let dialogBereitsGesehen = false
      try { dialogBereitsGesehen = localStorage.getItem(dialog.storageKey) === '1' } catch { /* ignore */ }
      if (!dialogBereitsGesehen) {
        dialogTimer = setTimeout(() => {
          if (interagiertRef.current) return
          setDialogOffen(true)
        }, dialog.nachMs)
      }
    }

    return () => {
      clearTimeout(openTimer)
      clearTimeout(pulseTimer)
      if (dialogTimer) clearTimeout(dialogTimer)
    }
    // Nur beim Mount einplanen — soll nicht erneut anlaufen, wenn sich `completed` später ändert.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function schliesseOnboardingDialog() {
    setDialogOffen(false)
    if (ersterPunktOnboarding?.dialog) {
      try { localStorage.setItem(ersterPunktOnboarding.dialog.storageKey, '1') } catch { /* ignore */ }
    }
  }

  function toggle(id: number) {
    interagiertRef.current = true
    if (id === pulsierendeId) setPulsierendeId(null)
    setCompleted(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try { localStorage.setItem(storageKey, JSON.stringify([...next])) } catch { /* ignore */ }
      return next
    })
  }

  function reset() {
    setCompleted(new Set())
    try { localStorage.removeItem(storageKey) } catch { /* ignore */ }
  }

  if (!isMounted) return null

  const allDone = completed.size === gesamt

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{completed.size} von {gesamt} abgeschlossen</span>
          {allDone && <span className="text-[#2E9E6B] font-semibold">Alles durch ✓</span>}
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2E9E6B] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(completed.size / gesamt) * 100}%` }}
          />
        </div>
      </div>

      {sektionen.map((sektion, sektionIndex) => (
        <div key={sektionIndex} className="space-y-3">
          {sektion.label && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {sektion.label}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
          )}

          <Accordion
            type="multiple"
            className="space-y-3"
            defaultValue={sektion.punkte.filter(p => defaultOffenIds.includes(p.id)).map(p => String(p.id))}
            onValueChange={() => { if (!autoKlickLaeuftRef.current) interagiertRef.current = true }}
          >
            {sektion.punkte.map(punkt => {
              const done = completed.has(punkt.id)
              const pulsiert = punkt.id === pulsierendeId && !done
              return (
                <AccordionItem
                  key={punkt.id}
                  value={String(punkt.id)}
                  className={`rounded-2xl border border-b px-4 transition-colors duration-300 ${
                    done ? 'border-[#2E9E6B]/30 bg-[#DFF0F2]' : 'border-border bg-card'
                  }`}
                >
                  <AccordionTrigger
                    ref={punkt.id === ersterPunktId ? ersterTriggerRef : undefined}
                    className="py-3.5 hover:no-underline [&>svg]:text-muted-foreground"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div
                        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                          done ? 'bg-[#2E9E6B] text-white' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {done ? <Check className="h-3.5 w-3.5" /> : punkt.id}
                      </div>
                      <span className={`font-semibold leading-tight transition-colors duration-300 ${done ? 'text-[#2E9E6B]' : 'text-foreground'}`}>
                        {punkt.titel}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2.5">
                      {punkt.inhalt}
                      <button
                        type="button"
                        onClick={() => toggle(punkt.id)}
                        className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          done
                            ? 'bg-[#2E9E6B] text-white'
                            : 'border border-[#2E9E6B] text-[#2E9E6B] hover:bg-[#2E9E6B]/5 active:bg-[#2E9E6B]/10'
                        } ${pulsiert ? 'animate-pulse ring-2 ring-[#2E9E6B]/50 ring-offset-2' : ''}`}
                      >
                        {done ? '✓ Verstanden' : 'Verstanden'}
                      </button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>
      ))}

      {allDone && celebration}

      {completed.size > 0 && (
        <div className="text-center">
          <button
            type="button"
            onClick={reset}
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            Fortschritt zurücksetzen
          </button>
        </div>
      )}

      {ersterPunktOnboarding?.dialog && (
        <Dialog open={dialogOffen} onOpenChange={open => { if (!open) schliesseOnboardingDialog() }}>
          <DialogContent className="max-w-[calc(100%-2rem)] rounded-2xl sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{ersterPunktOnboarding.dialog.titel}</DialogTitle>
              <DialogDescription className="text-left leading-relaxed">
                {ersterPunktOnboarding.dialog.text}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={schliesseOnboardingDialog} className="w-full">
                {ersterPunktOnboarding.dialog.buttonText}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
