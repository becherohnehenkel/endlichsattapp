import { Activity } from 'lucide-react'

interface KurveProps {
  titel: string
  caption: string
  pfad: string
  farbe: string
}

// PROJ-39, Arbeitspunkt 1 "Konstante Energie": rein illustrative Blutzucker-Kurven
// (keine echten Messwerte/Achsen) — analog zum Stil von WochenBalkenDiagramm (PROJ-37),
// aber als durchgehender Kurvenverlauf statt einzelner Tages-Balken.
// PROJ-39 (Refinement): `preserveAspectRatio="none"` + `vector-effect="non-scaling-stroke"`,
// damit die Kurve wirklich die volle Box-Breite ausfüllt (vorher: Default-Seitenverhältnis
// hat die Kurve mittig "letterboxed" statt gestreckt) — Strichbreite bleibt trotz
// nicht-uniformer Skalierung konstant.
function Kurve({ titel, caption, pfad, farbe }: KurveProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-foreground">{titel}</p>
      <svg
        viewBox="0 0 300 100"
        preserveAspectRatio="none"
        className="w-full h-20"
        role="img"
        aria-label={`${titel}: ${caption}`}
      >
        <line x1="0" y1="70" x2="300" y2="70" stroke="currentColor" className="text-border" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        <path d={pfad} fill="none" stroke={farbe} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="text-xs text-muted-foreground text-center italic">{caption}</p>
    </div>
  )
}

const SECHS_MAHLZEITEN_PFAD =
  'M5,60 L30,15 L55,75 L80,18 L105,78 L130,20 L155,75 L180,18 L205,78 L230,20 L255,75 L280,15 L295,55'

const DREI_MAHLZEITEN_PFAD =
  'M5,65 C15,55 25,20 40,15 C70,25 110,55 135,65 C142,60 145,20 150,15 C180,25 220,55 245,65 C252,60 255,20 260,15 C275,25 290,50 295,60'

export function BlutzuckerVergleichsGrafik() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 text-[#0E7C86]">
        <Activity className="h-4 w-4" strokeWidth={2} />
        <span className="text-[11px] font-bold uppercase tracking-wide">Beispielhafter Blutzuckerverlauf</span>
      </div>
      <Kurve
        titel="6 Mahlzeiten/Snacks über den Tag"
        caption="Achterbahn — dein Körper kommt nicht zur Ruhe"
        pfad={SECHS_MAHLZEITEN_PFAD}
        farbe="#D97706"
      />
      <Kurve
        titel="3 Mahlzeiten über den Tag"
        caption="3 Peaks, jeweils ein sanfter Abstieg"
        pfad={DREI_MAHLZEITEN_PFAD}
        farbe="#2E9E6B"
      />
    </div>
  )
}
