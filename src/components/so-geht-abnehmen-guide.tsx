'use client'

import { useState, useSyncExternalStore, type ReactNode } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { KcalRechner, type KcalRechnerGespeicherteWerte } from './kcal-rechner'
import { WochenBalkenDiagramm } from './wochen-balken-diagramm'

// PROJ-37: gleiches Arbeitspunkte-Muster wie art-of-eating-guide.tsx (Fortschrittsbalken,
// nummerierte Karten, "Verstanden"-Button, lokal gespeicherter Fortschritt) — Arbeitspunkt 1
// (Kcal-Rechner) ist als einziger interaktiv statt reiner Text.

function subscribe() { return () => {} }
function getSnapshot() { return true }
function getServerSnapshot() { return false }

const STORAGE_KEY = 'sga_completed'
const ANZAHL_ARBEITSPUNKTE = 5

interface SoGehtAbnehmenGuideProps {
  kannSpeichern: boolean
  gespeicherteWerte: KcalRechnerGespeicherteWerte | null
}

export function SoGehtAbnehmenGuide({ kannSpeichern, gespeicherteWerte }: SoGehtAbnehmenGuideProps) {
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

  if (!isMounted) return null

  const allDone = completed.size === ANZAHL_ARBEITSPUNKTE

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{completed.size} von {ANZAHL_ARBEITSPUNKTE} abgeschlossen</span>
          {allDone && <span className="text-[#2E9E6B] font-semibold">Alles durch ✓</span>}
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2E9E6B] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(completed.size / ANZAHL_ARBEITSPUNKTE) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <ArbeitspunktCard nummer={1} titel="Kcal-Rechner" done={completed.has(1)} onToggle={() => toggle(1)}>
          <KcalRechner kannSpeichern={kannSpeichern} gespeicherteWerte={gespeicherteWerte} />
        </ArbeitspunktCard>

        <ArbeitspunktCard nummer={2} titel="Wöchentlich vs. Täglich" done={completed.has(2)} onToggle={() => toggle(2)}>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Dein Körper rechnet nicht in Tagen, sondern in Wochen. Ein Tag über deinem Ziel bedeutet nicht, dass du „versagt“ hast — er wird einfach von den anderen sechs Tagen ausgeglichen. Schau auf den Wochendurchschnitt, nicht auf jeden einzelnen Tag.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-1">
            <WochenBalkenDiagramm
              titel="Wie ein starrer Plan aussieht"
              caption="Jeden Tag exakt gleich."
              balkenHoehen={[70, 70, 70, 70, 70, 70, 70]}
            />
            <WochenBalkenDiagramm
              titel="Wie es wirklich aussieht"
              caption="Mal mehr, mal weniger — im Schnitt im Ziel."
              balkenHoehen={[55, 55, 85, 55, 55, 35, 55]}
              akzentIndex={2}
            />
          </div>
        </ArbeitspunktCard>

        <ArbeitspunktCard nummer={3} titel="Warum auf Proteine achten" done={completed.has(3)} onToggle={() => toggle(3)}>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Protein hält dich länger satt als Kohlenhydrate oder Fett — und schützt beim Abnehmen deine Muskeln. Ohne genug Protein verlierst du beim Abnehmen nicht nur Fett, sondern auch Muskelmasse.
          </p>
          <div className="rounded-xl bg-[#DFF0F2] border border-[#2E9E6B]/20 px-3 py-2.5">
            <p className="text-sm font-semibold text-[#0E7C86]">Richtwert: mindestens 30g Protein pro Mahlzeit</p>
          </div>
          <div className="space-y-1.5 text-sm text-foreground/80">
            <p>🥩 <strong>Tierisch:</strong> mageres Fleisch, Fisch</p>
            <p>🧀 <strong>Vegetarisch:</strong> magerer Käse, Milchprodukte</p>
            <p>
              🌱 <strong>Vegan:</strong> Tofu, Erbsen, Linsen, Bohnen, Sojagranulat{' '}
              <span className="text-xs text-muted-foreground">(enthalten zusätzlich Kohlenhydrate &amp; Ballaststoffe)</span>
            </p>
          </div>
        </ArbeitspunktCard>

        <ArbeitspunktCard nummer={4} titel="Krafttraining" done={completed.has(4)} onToggle={() => toggle(4)}>
          <div className="space-y-2.5 text-sm text-foreground/80 leading-relaxed">
            <p><strong>1. Muskeln erhalten</strong> — Im Kaloriendefizit denkt dein Körper sonst: „Das brauche ich nicht, kostet nur Energie.“ Krafttraining signalisiert ihm: Diese Muskulatur wird gebraucht — die bleibt.</p>
            <p><strong>2. Grundumsatz</strong> — Mehr Muskelmasse erhöht deinen Grundumsatz (nicht überbewerten, aber ein netter Nebeneffekt).</p>
            <p><strong>3. Gesund altern</strong> — Jede Bewegung bleibt mit steigendem Alter leichter. Eine halbe Kniebeuge ist ein Toilettengang, den du mit 80 noch selbstständig schaffen willst.</p>
            <p><strong>4. Körper formen</strong> — Kleidung sitzt leichter, du fühlst dich wohler in deiner Haut.</p>
          </div>
          <Link href="/training" className="inline-block text-xs text-muted-foreground hover:text-foreground transition-colors">
            Trainingspläne findest du im Training-Bereich →
          </Link>
        </ArbeitspunktCard>

        <ArbeitspunktCard nummer={5} titel="Schlaf / Erholung" done={completed.has(5)} onToggle={() => toggle(5)}>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Ein übermüdeter Körper hat mehr Hunger — Schlafmangel bringt deine Sättigungshormone durcheinander (mehr Ghrelin, weniger Leptin). Das Ergebnis: mehr Appetit, und unbewusst greifst du eher zu schnellen Kalorien wie Süßigkeiten und Snacks statt zu einer sättigenden Mahlzeit.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Genauso wichtig: Schlaf ist die Zeit, in der dein Körper insgesamt zur Ruhe kommt — das System fährt herunter und erholt sich. Nur so kannst du jeden Tag die Leistung abrufen, die du abrufen möchtest.
          </p>
          <div className="space-y-2.5 text-sm text-foreground/80 leading-relaxed pt-1">
            <p><strong>1. 3-2-1-Regel</strong> — 3h vorher nichts Schweres mehr essen, 2h vorher keine Arbeit/Aufregung/laute Musik mehr, 1h vorher keine Bildschirme mehr (blaues Licht vermeiden).</p>
            <p><strong>2. Kühle Umgebung</strong> — hilft deinem Körper, besser zu entspannen.</p>
            <p><strong>3. Dunkelheit</strong> — Rollladen, blickdichter Vorhang oder Schlafmaske.</p>
            <p><strong>4. Kreisende Gedanken?</strong> — Langsam ein-, noch langsamer ausatmen, bis du einschläfst. Oder von 21 aufwärts endlos weiterzählen. Im Notfall: Gedanken mit Stift und Papier festhalten statt im Kopf zu wälzen.</p>
          </div>
        </ArbeitspunktCard>
      </div>
    </div>
  )
}

interface ArbeitspunktCardProps {
  nummer: number
  titel: string
  done: boolean
  onToggle: () => void
  children: ReactNode
}

function ArbeitspunktCard({ nummer, titel, done, onToggle, children }: ArbeitspunktCardProps) {
  return (
    <div
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
          {done ? <Check className="h-3.5 w-3.5" /> : nummer}
        </div>
        <div className="flex-1 space-y-2.5 min-w-0">
          <p className={`font-semibold leading-tight transition-colors duration-300 ${done ? 'text-[#2E9E6B]' : 'text-foreground'}`}>
            {titel}
          </p>
          {children}
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
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
}
