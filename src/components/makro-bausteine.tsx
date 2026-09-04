import type { ReactNode } from 'react'
import { Info } from 'lucide-react'

// PROJ-40 (Refinement 2026-09-04): Gemeinsame Bausteine für die Makronährstoff-Punkte auf
// der Kalorien-Seite — Icon+Intro-Zeile, kcal/g + "Wichtig für"-Boxen, Quellen-Zeile und die
// hervorgehobene Tipp-Box ("Gut zu wissen" / "Lukas sagt"). Vorab per Artifact-Mockup mit dem
// Nutzer abgestimmt. Kein Titel in `MakroIconIntro`, da der Arbeitspunkt-Titel bereits im
// Accordion-Trigger von `ArbeitspunkteListe` steht — eine Wiederholung wäre redundant.

export function MakroIconIntro({ icon, intro }: { icon: ReactNode; intro: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#DFF0F2]">
        {icon}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{intro}</p>
    </div>
  )
}

export function MakroStatBoxen({
  kcalWert,
  wichtigLabel = 'Wichtig für',
  wichtigText,
}: {
  kcalWert: string
  wichtigLabel?: string
  wichtigText: string
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-2">
      <div className="flex min-w-[76px] flex-col items-center justify-center rounded-2xl bg-[#DFF0F2] px-3.5 py-2.5">
        <span className="text-xl font-bold tabular-nums leading-none text-[#0E7C86]">{kcalWert}</span>
        <span className="mt-1 text-center text-[9.5px] font-semibold uppercase tracking-wide text-[#0E7C86]">kcal / g</span>
      </div>
      <div className="flex flex-col justify-center rounded-2xl bg-[#DFF0F2] px-3.5 py-2.5">
        <span className="mb-1 text-[9.5px] font-semibold uppercase tracking-wide text-[#0E7C86]">{wichtigLabel}</span>
        <p className="text-xs font-semibold leading-relaxed text-[#0E7C86]">{wichtigText}</p>
      </div>
    </div>
  )
}

export function MakroQuellenListe({ label, quellen }: { label: string; quellen: { icon: ReactNode; kategorie: string; liste: string }[] }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <div className="space-y-2">
        {quellen.map(q => (
          <div key={q.kategorie} className="flex items-start gap-2.5 rounded-xl bg-[#DFF0F2]/50 px-3 py-2.5">
            <div className="mt-0.5 flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-lg bg-white">
              {q.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{q.kategorie}</p>
              <p className="text-xs text-foreground/75 leading-relaxed">{q.liste}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MakroTippBox({ variant, text }: { variant: 'wissen' | 'lukas'; text: string }) {
  return (
    <div className="flex gap-2.5 rounded-2xl border-[1.5px] border-[#0E7C86]/25 bg-[#DFF0F2]/40 p-3.5">
      <div
        className={`flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
          variant === 'lukas' ? 'bg-[#0E7C86]' : 'bg-[#2E9E6B]'
        }`}
      >
        {variant === 'lukas' ? 'L' : <Info className="h-[13px] w-[13px]" strokeWidth={2.5} />}
      </div>
      <div>
        <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0E7C86]">
          {variant === 'lukas' ? 'Lukas sagt' : 'Gut zu wissen'}
        </p>
        <p className="text-xs leading-relaxed text-foreground">{text}</p>
      </div>
    </div>
  )
}
