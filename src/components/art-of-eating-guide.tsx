import type { ReactNode } from 'react'
import { Armchair, PhoneOff, Wind, Timer, Utensils, Ear } from 'lucide-react'
import { ART_OF_EATING_PRINZIPIEN as STEPS } from '@/lib/art-of-eating-principles'
import { ArbeitspunkteListe, type ArbeitspunkteSektion } from './arbeitspunkte-liste'

// PROJ-34 (Refinement): auf die gemeinsame ArbeitspunkteListe umgestellt (Ein-/Ausklappen
// statt alles auf einmal sichtbar) — die sechs Prinzipien selbst kommen unverändert aus
// art-of-eating-principles.ts.

// PROJ-34 (Refinement 2026-09-04, Icon-Feinschliff): ein Lucide-Icon je Prinzip, per
// Prinzip-Nummer zugeordnet (bewusst hier im Guide statt in art-of-eating-principles.ts,
// da die Icons ein reines Darstellungs-/Frontend-Anliegen sind — der kompakte, zufällig
// rotierende Hinweis auf den Ergebnisseiten (art-of-eating-hinweis.tsx) nutzt weiterhin ein
// festes 🧘-Emoji und braucht keine Icons). "Kau gründlich" hat kein literales Lucide-Icon
// fürs Kauen — `Timer` steht stellvertretend fürs bewusste Langsam-Kauen. "Riech, bevor du
// isst" (Wind) und "Hör auf deinen Körper" (Ear) nutzen bewusst dieselben Icons wie bei
// "Heißhunger" (PROJ-39) für eine konsistente Bildsprache über beide Guides hinweg.
const PRINZIP_ICONS: Record<number, ReactNode> = {
  1: <Armchair className="h-6 w-6" strokeWidth={2} />,
  2: <PhoneOff className="h-6 w-6" strokeWidth={2} />,
  3: <Wind className="h-6 w-6" strokeWidth={2} />,
  4: <Timer className="h-6 w-6" strokeWidth={2} />,
  5: <Utensils className="h-6 w-6" strokeWidth={2} />,
  6: <Ear className="h-6 w-6" strokeWidth={2} />,
}

const SEKTIONEN: ArbeitspunkteSektion[] = [
  {
    punkte: STEPS.map(step => ({
      id: step.number,
      titel: step.title,
      inhalt: (
        <>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DFF0F2] text-[#0E7C86]">
              {PRINZIP_ICONS[step.number]}
            </div>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed">{step.body}</p>
          {step.funFact && (
            <div className="rounded-xl bg-[#DFF0F2] border border-[#2E9E6B]/20 px-3 py-2.5">
              <p className="text-xs text-[#0E7C86] leading-relaxed">
                💡 {step.funFact}
              </p>
            </div>
          )}
        </>
      ),
    })),
  },
]

export default function ArtOfEatingGuide() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Richtig Essen</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Die meisten Menschen glauben, Essen zu können. Wenige tun es wirklich. Dieser Guide hilft dir dabei.
        </p>
      </div>

      <ArbeitspunkteListe
        storageKey="aoe_completed"
        sektionen={SEKTIONEN}
        ersterPunktOnboarding={{ autoOpenNachMs: 700 }}
        celebration={
          <div className="rounded-2xl border border-[#2E9E6B]/30 bg-[#DFF0F2] p-5 text-center space-y-2">
            <p className="text-3xl">🧘</p>
            <p className="font-semibold text-[#2E9E6B]">Du weißt jetzt, wie es geht.</p>
            <p className="text-xs text-[#2E9E6B]/80 leading-relaxed">
              Jetzt ist Übung gefragt — bei jeder Mahlzeit ein kleiner Schritt mehr.
            </p>
          </div>
        }
      />
    </div>
  )
}
