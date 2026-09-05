export interface TrainingKennzahlenData {
  einheitenLetzte7Tage: number
  /** null = keine Fitnessstudio-Einheit in den letzten 7 Tagen — noch kein Wert zu zeigen. */
  durchschnittsgewichtKg: number | null
  /** null = Datenschwelle nicht erreicht (siehe Spec: min. 1 Einheit/7 Tage, min. 2 Einheiten/30 Tage). */
  steigerungProzent: number | null
  aktuelleSerieWochen: number
}

function Kachel({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-center">
      <p className="text-xs text-muted-foreground leading-tight">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}

export default function TrainingKennzahlen({
  einheitenLetzte7Tage,
  durchschnittsgewichtKg,
  steigerungProzent,
  aktuelleSerieWochen,
}: TrainingKennzahlenData) {
  const steigerungLabel = steigerungProzent === null
    ? '—'
    : `${steigerungProzent > 0 ? '+' : ''}${Math.round(steigerungProzent)} %`
  const steigerungColor = steigerungProzent === null
    ? 'text-foreground'
    : steigerungProzent > 0
      ? 'text-emerald-600'
      : steigerungProzent < 0
        ? 'text-red-600'
        : 'text-foreground'

  return (
    <div className="grid grid-cols-2 gap-2">
      <Kachel label="Einheiten (7 Tage)" value={String(einheitenLetzte7Tage)} />
      <Kachel
        label="Ø Gewicht / Einheit"
        value={durchschnittsgewichtKg !== null ? `${Math.round(durchschnittsgewichtKg).toLocaleString('de-DE')} kg` : '—'}
        sub={durchschnittsgewichtKg === null ? 'Noch keine Fitnessstudio-Einheit' : 'Fitnessstudio, Ø 7 Tage'}
      />
      <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-center">
        <p className="text-xs text-muted-foreground leading-tight">Steigerung</p>
        <p className={`text-sm font-semibold mt-0.5 ${steigerungColor}`}>{steigerungLabel}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {steigerungProzent === null ? 'Noch nicht genug Daten' : 'vs. 30-Tage-Schnitt'}
        </p>
      </div>
      <Kachel
        label="Aktuelle Serie"
        value={aktuelleSerieWochen > 0 ? `${aktuelleSerieWochen} ${aktuelleSerieWochen === 1 ? 'Woche' : 'Wochen'}` : '—'}
      />
    </div>
  )
}
