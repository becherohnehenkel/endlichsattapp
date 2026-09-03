interface WochenBalkenDiagrammProps {
  titel: string
  caption: string
  balkenHoehen: number[] // 7 Werte, 0-100 (%), rein illustrativ — keine echten Kalorienzahlen
  akzentIndex?: number // Index des hervorgehobenen (höheren) Tages
  /** PROJ-37 (Refinement 2026-09-03): "neutral" = gedeckte Farben (der "falsche"/starre Ansatz),
   * "hervorgehoben" = kräftige App-Farben auf grünem Hintergrund (der richtige, empfohlene Ansatz). */
  variante: 'neutral' | 'hervorgehoben'
}

const WOCHENTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

// PROJ-37, Arbeitspunkt 2 "Wöchentlich vs. tägliches Kaloriendefizit": rein CSS-gestylte,
// illustrative Balkendiagramme (keine echten Werte/Achsen) — siehe Spec für die Bedeutung
// der 2 Schaubilder. Jedes Diagramm steht in einer eigenen Box (Refinement 2026-09-03).
export function WochenBalkenDiagramm({ titel, caption, balkenHoehen, akzentIndex, variante }: WochenBalkenDiagrammProps) {
  const hervorgehoben = variante === 'hervorgehoben'
  return (
    <div
      className={`rounded-xl p-3 space-y-2 ${
        hervorgehoben
          ? 'bg-[#DFF0F2] border border-[#2E9E6B]/30'
          : 'bg-muted/50 border border-border'
      }`}
    >
      <p className={`text-xs font-semibold ${hervorgehoben ? 'text-[#0E7C86]' : 'text-muted-foreground'}`}>{titel}</p>
      <div className="flex items-end gap-1.5 h-16" role="img" aria-label={`${titel}: ${caption}`}>
        {balkenHoehen.map((hoehe, i) => (
          <div key={i} className="flex-1 h-full flex items-end">
            <div
              className={`w-full rounded-t-md ${
                hervorgehoben
                  ? i === akzentIndex ? 'bg-amber-400' : 'bg-[#2E9E6B]'
                  : 'bg-muted-foreground/30'
              }`}
              style={{ height: `${hoehe}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5">
        {WOCHENTAGE.map(tag => (
          <p key={tag} className={`flex-1 text-center text-[9px] font-medium ${hervorgehoben ? 'text-[#0E7C86]' : 'text-muted-foreground'}`}>
            {tag}
          </p>
        ))}
      </div>
      <p className={`text-xs text-center italic ${hervorgehoben ? 'text-[#0E7C86] font-medium' : 'text-muted-foreground'}`}>{caption}</p>
    </div>
  )
}
