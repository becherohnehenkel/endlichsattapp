'use client'

import { useState, useSyncExternalStore, type ReactNode } from 'react'
import { Check } from 'lucide-react'

// PROJ-38: gemeinsamer Baustein für das "Arbeitspunkte"-Muster (Fortschrittsbalken,
// nummerierte Karten, "Verstanden"-Toggle, lokal gespeicherter Fortschritt) — bisher
// dupliziert in art-of-eating-guide.tsx und so-geht-abnehmen-guide.tsx. Diese beiden
// bleiben bewusst unverändert (siehe PROJ-38 Decision Log); neue Guide-Seiten nutzen
// ab hier diesen Baustein.

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
}

export function ArbeitspunkteListe({ storageKey, sektionen }: ArbeitspunkteListeProps) {
  const isMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const allePunkte = sektionen.flatMap(s => s.punkte)
  const gesamt = allePunkte.length

  const [completed, setCompleted] = useState<Set<number>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? new Set(JSON.parse(stored) as number[]) : new Set()
    } catch {
      return new Set()
    }
  })

  function toggle(id: number) {
    setCompleted(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try { localStorage.setItem(storageKey, JSON.stringify([...next])) } catch { /* ignore */ }
      return next
    })
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

          {sektion.punkte.map(punkt => {
            const done = completed.has(punkt.id)
            return (
              <div
                key={punkt.id}
                className={`rounded-2xl border p-4 space-y-3 transition-colors duration-300 ${
                  done ? 'border-[#2E9E6B]/30 bg-[#DFF0F2]' : 'border-border bg-card'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                      done ? 'bg-[#2E9E6B] text-white' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : punkt.id}
                  </div>
                  <div className="flex-1 space-y-2.5 min-w-0">
                    <p className={`font-semibold leading-tight transition-colors duration-300 ${done ? 'text-[#2E9E6B]' : 'text-foreground'}`}>
                      {punkt.titel}
                    </p>
                    {punkt.inhalt}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggle(punkt.id)}
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
      ))}
    </div>
  )
}
