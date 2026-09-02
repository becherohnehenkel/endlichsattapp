'use client'

import { useState, useSyncExternalStore } from 'react'
import { ChevronDown } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'gewohnheiten_completed'

interface Gewohnheit {
  id: number
  titel: string
  hinweis: string
}

const GEWOHNHEITEN: Gewohnheit[] = [
  { id: 1, titel: 'Weniger Snacks', hinweis: 'Wenn du heute wieder vor einem Snack stehst: Überlege nochmal kurz warum du deine Gefühle in Essen wickeln möchtest und entscheide dich bewusst gegen Essen.' },
  { id: 2, titel: 'Mehr Schritte', hinweis: 'Nimm dir heute 10 Minuten Zeit - in 10 Minuten schaffst du 1000 Schritte mehr als gestern. Das ist Fortschritt.' },
  { id: 3, titel: 'Wasser trinken', hinweis: 'Trinke nach dem Aufstehen mindestens 1 großes Glas Wasser. Stell dazu ein Glas oder die Flasche neben dein Bett als Erinnerung.' },
  { id: 4, titel: 'Social Media', hinweis: 'Entfolge 1 Influencer der immer wieder in deinem Feed aufkommt, der dich dir Essen verkaufen möchte oder vor der Kamera isst.' },
  { id: 5, titel: 'Rezepte', hinweis: 'Ich teste diese 1 neues Rezept, dass viel Proteine, Ballaststoffe und Volumen hat. Am besten noch etwas zu kauen und lecker schmecken darf es auch. Schau gerne mal die Rezepte dafür an.' },
  { id: 6, titel: 'Dehnen', hinweis: 'Ich dehne mich nach dem Aufstehen für 5 Minuten. Ohne Bildschirm, Radio, Podcast oder Musik.' },
  { id: 7, titel: 'Handy', hinweis: 'Ich fasse meine Handy erst an, nachdem ich das Haus verlassen hab.' },
  { id: 8, titel: 'Richtig essen', hinweis: 'Ich esse heute bewusst 1 Mahlzeit in Ruhe. Ohne Bildschirm, Musik, Podcast oder andere Ablenkungen.' },
]

function subscribe() { return () => {} }
function getSnapshot() { return true }
function getServerSnapshot() { return false }

function ladeCompleted(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? new Set(JSON.parse(stored) as number[]) : new Set()
  } catch {
    return new Set()
  }
}

// PROJ-46: Gewohnheiten-Checkliste, zweite Sektion auf /check-in unterhalb des
// Wochen-Check-Ins. Rein lokal in localStorage gespeichert (kein Backend, kein
// Unterschied zwischen Gast und eingeloggtem Nutzer) — Checkbox ist unabhängig vom
// Auf-/Zuklappen des Hinweistexts, anders als das "Verstanden"-Muster in
// arbeitspunkte-liste.tsx, wo der Button erst nach dem Aufklappen erscheint.
export function GewohnheitenListe() {
  const isMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [completed, setCompleted] = useState<Set<number>>(ladeCompleted)
  const [offenId, setOffenId] = useState<number | null>(null)

  function toggle(id: number) {
    setCompleted(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])) } catch { /* ignore */ }
      return next
    })
  }

  function reset() {
    setCompleted(new Set())
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }

  if (!isMounted) return null

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Gewohnheiten</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Hier sind ein paar Gewohnheiten die du als Inspiration nutzen kannst dich jeden Tag etwas zu verbessern. Mach nicht alles auf einmal. 1 Veränderung pro Tag für 7 Tage am Stück sind ein Tempo, dass dir hilft diese Gewohnheit langsam in deinen Alltag zu integrieren.
        </p>
        <p className="text-sm text-[#0E7C86] bg-[#DFF0F2] rounded-xl px-4 py-3 leading-relaxed">
          Sobald du eine Gewohnheit lange machst und sie einmal vergisst und dabei merkst, dass sie dir fehlt, bist du bereit die nächste Gewohnheit in deinen Alltag zu integrieren. Gib dir die Zeit.
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{completed.size} von {GEWOHNHEITEN.length} erledigt</span>
          {completed.size === GEWOHNHEITEN.length && <span className="text-[#2E9E6B] font-semibold">Alles erledigt ✓</span>}
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2E9E6B] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(completed.size / GEWOHNHEITEN.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {GEWOHNHEITEN.map(g => {
          const done = completed.has(g.id)
          const offen = offenId === g.id
          return (
            <div
              key={g.id}
              className={cn(
                'rounded-2xl border px-4 py-3.5 transition-colors duration-300',
                done ? 'border-[#2E9E6B]/30 bg-[#DFF0F2]' : 'border-border bg-card'
              )}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={done}
                  onCheckedChange={() => toggle(g.id)}
                  aria-label={g.titel}
                  className="shrink-0"
                />
                <button
                  type="button"
                  onClick={() => setOffenId(offen ? null : g.id)}
                  className="flex-1 flex items-center justify-between gap-2 text-left"
                >
                  <span className={cn('font-semibold leading-tight transition-colors duration-300', done ? 'text-[#2E9E6B]' : 'text-foreground')}>
                    {g.titel}
                  </span>
                  <ChevronDown className={cn('h-4 w-4 text-muted-foreground shrink-0 transition-transform', offen && 'rotate-180')} />
                </button>
              </div>
              <Collapsible open={offen}>
                <CollapsibleContent className="pt-2.5 pl-7">
                  <p className="text-sm text-foreground/80 leading-relaxed">{g.hinweis}</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )
        })}
      </div>

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
