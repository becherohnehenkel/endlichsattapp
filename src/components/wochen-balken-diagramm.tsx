interface WochenBalkenDiagrammProps {
  titel: string
  caption: string
  balkenHoehen: number[] // 7 Werte, 0-100 (%), rein illustrativ — keine echten Kalorienzahlen
  akzentIndex?: number // Index des hervorgehobenen (höheren) Tages
}

// PROJ-37, Arbeitspunkt 2 "Wöchentlich vs. Täglich": rein CSS-gestylte, illustrative
// Balkendiagramme (keine echten Werte/Achsen) — siehe Spec für die Bedeutung der 2 Schaubilder.
export function WochenBalkenDiagramm({ titel, caption, balkenHoehen, akzentIndex }: WochenBalkenDiagrammProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-foreground">{titel}</p>
      <div className="flex items-end gap-1.5 h-20" role="img" aria-label={`${titel}: ${caption}`}>
        {balkenHoehen.map((hoehe, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t-md ${i === akzentIndex ? 'bg-amber-400' : 'bg-[#2E9E6B]'}`}
            style={{ height: `${hoehe}%` }}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center italic">{caption}</p>
    </div>
  )
}
