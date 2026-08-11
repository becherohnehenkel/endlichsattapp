'use client'

import { useState, useSyncExternalStore } from 'react'
import { Check } from 'lucide-react'
import { ART_OF_EATING_PRINZIPIEN as STEPS } from '@/lib/art-of-eating-principles'

// PROJ-34: die sechs Schritte kommen jetzt aus einer gemeinsamen Quelle
// (src/lib/art-of-eating-principles.ts), geteilt mit dem neuen kompakten,
// zufällig rotierenden Hinweis auf den Ergebnisseiten (art-of-eating-hinweis.tsx).

function subscribe() { return () => {} }
function getSnapshot() { return true }
function getServerSnapshot() { return false }

const STORAGE_KEY = 'aoe_completed'

export default function ArtOfEatingGuide() {
  const isMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const [completed, setCompleted] = useState<Set<number>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? new Set(JSON.parse(stored) as number[]) : new Set()
    } catch {
      return new Set()
    }
  })

  function toggle(n: number) {
    setCompleted(prev => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])) } catch { /* ignore */ }
      return next
    })
  }

  function reset() {
    setCompleted(new Set())
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }

  const allDone = completed.size === STEPS.length

  if (!isMounted) return null

  return (
    <div className="space-y-6">

      {/* Intro */}
      <div className="space-y-1.5">
        <p className="text-foreground leading-relaxed">
          Die meisten Menschen glauben, Essen zu können. Wenige tun es wirklich.
        </p>
        <p className="text-sm text-muted-foreground">Dieser Guide hilft dir dabei.</p>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{completed.size} von {STEPS.length} abgeschlossen</span>
          {allDone && <span className="text-[#2E9E6B] font-semibold">Alles durch ✓</span>}
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2E9E6B] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(completed.size / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map(step => {
          const done = completed.has(step.number)
          return (
            <div
              key={step.number}
              className={`rounded-2xl border p-4 space-y-3 transition-colors duration-300 ${
                done ? 'border-[#2E9E6B]/30 bg-[#DFF0F2]' : 'border-border bg-card'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Step number / checkmark */}
                <div
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                    done ? 'bg-[#2E9E6B] text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : step.number}
                </div>

                <div className="flex-1 space-y-2.5 min-w-0">
                  <p className={`font-semibold leading-tight transition-colors duration-300 ${done ? 'text-[#2E9E6B]' : 'text-foreground'}`}>
                    {step.title}
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{step.body}</p>

                  {step.funFact && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
                      <p className="text-xs text-amber-800 leading-relaxed">
                        💡 {step.funFact}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggle(step.number)}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  done
                    ? 'bg-[#2E9E6B] text-white'
                    : 'border border-[#2E9E6B] text-[#2E9E6B] hover:bg-[#2E9E6B]/5 active:bg-[#2E9E6B]/10'
                }`}
              >
                {done ? '✓ Verstanden' : 'Verstanden'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Celebration */}
      {allDone && (
        <div className="rounded-2xl border border-[#2E9E6B]/30 bg-[#DFF0F2] p-5 text-center space-y-2">
          <p className="text-3xl">🧘</p>
          <p className="font-semibold text-[#2E9E6B]">Du weißt jetzt, wie es geht.</p>
          <p className="text-sm text-[#2E9E6B]/80 leading-relaxed">
            Jetzt ist Übung gefragt — bei jeder Mahlzeit ein kleiner Schritt mehr.
          </p>
        </div>
      )}

      {/* Reset */}
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

    </div>
  )
}
