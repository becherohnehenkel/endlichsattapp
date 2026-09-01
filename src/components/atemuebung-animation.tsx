'use client'

import { useEffect, useState } from 'react'

type Phase = 'countdown' | 'einatmen' | 'halten' | 'ausatmen' | 'fertig'

interface Zyklusschritt {
  phase: 'einatmen' | 'halten' | 'ausatmen'
  dauerMs: number
}

const ZYKLUS: Zyklusschritt[] = [
  { phase: 'einatmen', dauerMs: 4000 },
  { phase: 'halten', dauerMs: 6000 },
  { phase: 'ausatmen', dauerMs: 8000 },
]

const WIEDERHOLUNGEN = 5
const COUNTDOWN_START = 5

const FUELLHOEHE: Record<Phase, number> = {
  countdown: 0,
  einatmen: 100,
  halten: 100,
  ausatmen: 0,
  fertig: 0,
}

const UEBERGANG_MS: Record<Phase, number> = {
  countdown: 300,
  einatmen: 4000,
  halten: 300,
  ausatmen: 8000,
  fertig: 500,
}

const PHASE_LABEL: Record<Phase, string> = {
  countdown: 'Gleich geht’s los',
  einatmen: 'Einatmen',
  halten: 'Halten',
  ausatmen: 'Ausatmen',
  fertig: 'Geschafft!',
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
        return
      }
      setRunde(rundeNr)
      const schritt = ZYKLUS[schrittIndex]
      setPhase(schritt.phase)
      wait(schritt.dauerMs, () => {
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

  return (
    <div className="flex flex-col items-center gap-3 py-1">
      <div className="flex items-center gap-6">
        <div className="relative h-28 w-16 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-[#0E7C86]/25 bg-muted/30">
          <div
            className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0E7C86] to-[#2E9E6B] ${
              phase === 'halten' ? 'animate-pulse [animation-duration:3s]' : ''
            }`}
            style={{
              height: `${FUELLHOEHE[phase]}%`,
              transitionProperty: 'height',
              transitionDuration: `${UEBERGANG_MS[phase]}ms`,
              transitionTimingFunction: 'linear',
            }}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground tabular-nums">
            {phase === 'countdown' ? countdown : PHASE_LABEL[phase]}
          </p>
          {phase !== 'countdown' && phase !== 'fertig' && (
            <p className="mt-1 text-[10px] text-muted-foreground">Runde {runde} von {WIEDERHOLUNGEN}</p>
          )}
          {phase === 'fertig' && (
            <p className="mt-1 text-[10px] text-[#2E9E6B] font-medium">5 Runden geschafft ✓</p>
          )}
        </div>
      </div>
    </div>
  )
}
