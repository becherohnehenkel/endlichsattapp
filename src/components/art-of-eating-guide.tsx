'use client'

import { useState, useSyncExternalStore } from 'react'
import { Check } from 'lucide-react'

function subscribe() { return () => {} }
function getSnapshot() { return true }
function getServerSnapshot() { return false }

const STEPS = [
  {
    number: 1,
    title: 'Schaffe den richtigen Rahmen',
    body: 'Setz dich hin. Immer. Wer im Gehen isst, verliert den Bezug zur Mahlzeit und damit auch das Sättigungsgefühl. Essen ist kein Anhängsel deines Tages, sondern ein fester Teil davon. Nimm dir die Zeit bewusst — nicht weil du sie hast, sondern weil du sie dir nimmst.',
    funFact: 'In Japan sieht man niemanden im Gehen essen — nicht umsonst gelten sie als eines der gesündesten Völker der Welt.',
  },
  {
    number: 2,
    title: 'Schalte Ablenkungen aus',
    body: 'Kein Smartphone, kein Fernseher, keine Musik, kein Podcast. Selbst das Essen bei einem Event im Stehen kann dich von deiner Sättigung ablenken. Voller Fokus auf den Teller. Ablenkung macht nicht nur unaufmerksam — sie macht dich buchstäblich weniger satt, weil dein Gehirn die Signale deines Körpers nicht verarbeiten kann. Es ist... abgelenkt.',
    funFact: null,
  },
  {
    number: 3,
    title: 'Riech, bevor du isst',
    body: 'Bevor der erste Bissen im Mund ist: nimm dir einen Moment und riech bewusst an deiner Mahlzeit. Bis zu 80 % dessen, was wir als Geschmack erleben, entsteht tatsächlich über den Geruch.',
    funFact: 'Das kennst du aus Fernsehsendungen: Bei verschlossener Nase schmecken Erdbeer- und Himbeermarmelade identisch. Wer das Riechen überspringt, verpasst den größten Teil des Genusses, bevor er überhaupt angefangen hat.',
  },
  {
    number: 4,
    title: 'Kau gründlich',
    body: 'Dein Magen hat keine Zähne. Verdauung beginnt im Mund: durch mechanisches Zerkleinern und Speichel, der bereits erste Nährstoffe aufschließt. Kaue jeden Bissen so lange, bis er fast flüssig ist.',
    funFact: 'Experiment: Kaue ein Stück Brot sehr lange. Es wird mit jedem Kauschritt süßer — weil die langen Kohlenhydratketten zu Zuckermolekülen aufgeschlossen werden. Aromen entfalten sich, die du vorher nie bewusst wahrgenommen hast.',
  },
  {
    number: 5,
    title: 'Schmecke die Details',
    body: 'Wie intensiv sind die Kartoffeln? Wie frisch die Petersilie? Wie komplex das Fleisch? Wer langsam kaut, schmeckt mehr und isst automatisch bewusster. Essen ist etwas Großartiges. Behandle es entsprechend.',
    funFact: null,
  },
  {
    number: 6,
    title: 'Hör auf deinen Körper',
    body: 'Dein Körper weiß, wann er satt ist — er braucht nur Zeit, um es dir zu sagen. Wer langsam und ohne Ablenkung isst, spürt das Signal nach etwa 20 Minuten ganz von alleine. Schau beim Essen auch mal auf die Uhr, nicht nur auf den Teller.',
    funFact: 'Hara Hachi Bu ist eine japanische Lebensweisheit: Hör auf zu essen, wenn der Magen zu 80 % gefüllt ist — angenehm satt statt unangenehm überfüllt. Das fasst eigentlich alles zusammen. 🙂',
  },
] as const

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
          {allDone && <span className="text-[#4A7C59] font-semibold">Alles durch ✓</span>}
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4A7C59] rounded-full transition-all duration-500 ease-out"
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
                done ? 'border-[#4A7C59]/30 bg-[#E8F0EB]' : 'border-border bg-card'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Step number / checkmark */}
                <div
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                    done ? 'bg-[#4A7C59] text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : step.number}
                </div>

                <div className="flex-1 space-y-2.5 min-w-0">
                  <p className={`font-semibold leading-tight transition-colors duration-300 ${done ? 'text-[#4A7C59]' : 'text-foreground'}`}>
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
                    ? 'bg-[#4A7C59] text-white'
                    : 'border border-[#4A7C59] text-[#4A7C59] hover:bg-[#4A7C59]/5 active:bg-[#4A7C59]/10'
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
        <div className="rounded-2xl border border-[#4A7C59]/30 bg-[#E8F0EB] p-5 text-center space-y-2">
          <p className="text-3xl">🧘</p>
          <p className="font-semibold text-[#4A7C59]">Du weißt jetzt, wie es geht.</p>
          <p className="text-sm text-[#4A7C59]/80 leading-relaxed">
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
