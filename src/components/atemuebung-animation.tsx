'use client'

import { useEffect, useState } from 'react'

type Phase = 'countdown' | 'einatmen' | 'halten' | 'ausatmen' | 'fertig'
type Uebungsphase = Exclude<Phase, 'countdown' | 'fertig'>

interface Zyklusschritt {
  phase: Uebungsphase
  dauerSek: number
}

const ZYKLUS: Zyklusschritt[] = [
  { phase: 'einatmen', dauerSek: 4 },
  { phase: 'halten', dauerSek: 6 },
  { phase: 'ausatmen', dauerSek: 8 },
]

const WIEDERHOLUNGEN = 5
const COUNTDOWN_START = 5

const FUELLHOEHE: Record<Uebungsphase, number> = {
  einatmen: 100,
  halten: 100,
  ausatmen: 0,
}

const ANWEISUNG: Record<Uebungsphase, string> = {
  einatmen: 'Tief durch die Nase in den Bauch',
  halten: 'Atem anhalten',
  ausatmen: 'Langsam durch den Mund',
}

const PHASE_LABEL: Record<Uebungsphase, string> = {
  einatmen: 'Einatmen',
  halten: 'Halten',
  ausatmen: 'Ausatmen',
}

// Läuft ausschließlich innerhalb eines useEffect auf Basis von setTimeout — Radix
// AccordionContent unmounted seinen Inhalt automatisch, sobald das Akkordion-Item
// geschlossen wird (siehe accordion.tsx: kein forceMount), wodurch der Cleanup dieses
// Effekts die Animation stoppt. Bei erneutem Öffnen startet die Komponente frisch neu —
// genau das gewünschte "läuft nur, wenn das Akkordion geöffnet ist".
export function AtemuebungAnimation() {
  const [phase, setPhase] = useState<Phase>('countdown')
  const [countdown, setCountdown] = useState(COUNTDOWN_START)
  const [runde, setRunde] = useState(1)
  const [restSekunden, setRestSekunden] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    const timeouts: ReturnType<typeof setTimeout>[] = []
    const wait = (ms: number, fn: () => void) => {
      timeouts.push(setTimeout(() => { if (!cancelled) fn() }, ms))
    }

    function starteCountdown(verbleibend: number) {
      setCountdown(verbleibend)
      if (verbleibend <= 1) {
        wait(1000, () => starteRunde(1, 0))
        return
      }
      wait(1000, () => starteCountdown(verbleibend - 1))
    }

    function starteRunde(rundeNr: number, schrittIndex: number) {
      if (rundeNr > WIEDERHOLUNGEN) {
        setPhase('fertig')
        setRestSekunden(null)
        return
      }
      setRunde(rundeNr)
      const schritt = ZYKLUS[schrittIndex]
      setPhase(schritt.phase)
      wait(schritt.dauerSek * 1000, () => {
        if (schrittIndex + 1 < ZYKLUS.length) {
          starteRunde(rundeNr, schrittIndex + 1)
        } else {
          starteRunde(rundeNr + 1, 0)
        }
      })
    }

    starteCountdown(COUNTDOWN_START)

    return () => {
      cancelled = true
      timeouts.forEach(clearTimeout)
    }
  }, [])

  // Live-Countdown pro Übungsphase (unabhängig von der obigen Ablauf-Steuerung) —
  // zeigt, wie viele Sekunden der aktuellen Phase noch bleiben.
  useEffect(() => {
    if (phase === 'countdown' || phase === 'fertig') {
      return
    }
    const dauerSek = ZYKLUS.find(z => z.phase === phase)!.dauerSek
    let n = dauerSek
    // setState wird bewusst nicht synchron im Effekt-Body aufgerufen (react-hooks/set-state-in-effect)
    // — der initiale Anzeigewert wird per setTimeout(…, 0) im nächsten Tick gesetzt, genau wie die
    // folgenden Sekunden-Updates aus dem Interval.
    const initial = setTimeout(() => setRestSekunden(n), 0)
    const interval = setInterval(() => {
      n -= 1
      setRestSekunden(Math.max(n, 0))
      if (n <= 0) clearInterval(interval)
    }, 1000)
    return () => {
      clearTimeout(initial)
      clearInterval(interval)
    }
  }, [phase, runde])

  const uebungsphase = phase === 'countdown' || phase === 'fertig' ? null : phase

  return (
    <div className="space-y-2">
      <p className="text-center text-xs font-semibold text-muted-foreground">
        {phase === 'countdown' ? 'Bereit?' : phase === 'fertig' ? 'Fertig!' : `Runde ${runde} von ${WIEDERHOLUNGEN}`}
      </p>
      <div className="relative h-32 w-full overflow-hidden rounded-2xl border-2 border-[#0E7C86]/25 bg-muted/30">
        {uebungsphase && (
          <div
            className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0E7C86] to-[#2E9E6B] ${
              uebungsphase === 'halten' ? 'animate-pulse [animation-duration:3s]' : ''
            }`}
            style={{
              height: `${FUELLHOEHE[uebungsphase]}%`,
              transitionProperty: 'height',
              transitionDuration: `${ZYKLUS.find(z => z.phase === uebungsphase)!.dauerSek * 1000}ms`,
              transitionTimingFunction: 'linear',
            }}
          />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center">
          {phase === 'countdown' && (
            <p className="text-2xl font-bold tabular-nums text-foreground">{countdown}</p>
          )}
          {uebungsphase && (
            <>
              <p className="text-lg font-bold text-foreground">{PHASE_LABEL[uebungsphase]}</p>
              <p className="text-[11px] text-muted-foreground">{ANWEISUNG[uebungsphase]}</p>
              {restSekunden != null && (
                <p className="text-sm font-semibold tabular-nums text-[#0E7C86]">{restSekunden}s</p>
              )}
            </>
          )}
          {phase === 'fertig' && (
            <p className="text-sm font-medium text-[#2E9E6B]">5 Runden geschafft ✓</p>
          )}
        </div>
      </div>
    </div>
  )
}
