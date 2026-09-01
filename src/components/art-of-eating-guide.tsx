import { ART_OF_EATING_PRINZIPIEN as STEPS } from '@/lib/art-of-eating-principles'
import { ArbeitspunkteListe, type ArbeitspunkteSektion } from './arbeitspunkte-liste'

// PROJ-34 (Refinement): auf die gemeinsame ArbeitspunkteListe umgestellt (Ein-/Ausklappen
// statt alles auf einmal sichtbar) — die sechs Prinzipien selbst kommen unverändert aus
// art-of-eating-principles.ts.

const SEKTIONEN: ArbeitspunkteSektion[] = [
  {
    punkte: STEPS.map(step => ({
      id: step.number,
      titel: step.title,
      inhalt: (
        <>
          <p className="text-xs text-foreground/80 leading-relaxed">{step.body}</p>
          {step.funFact && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
              <p className="text-xs text-amber-800 leading-relaxed">
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
