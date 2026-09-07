import { formatScreentime } from '@/lib/format-wochen-check-in'

export interface CheckInMetrikErgebnis {
  key: string
  label: string
  /** 'punkte' = 0–10/1–10-Skala, 'zeit' = Minuten (Screentime) */
  einheit: 'punkte' | 'zeit'
  /** 'mehr' = ein höherer Wert ist besser (Schlaf, Energielevel, …), 'weniger' = ein
   *  niedrigerer Wert ist besser (nur Screentime). */
  richtung: 'mehr' | 'weniger'
  aktuellerWert: number
  /** Differenz (aktuell − 30-Tage-Schnitt) in derselben Einheit; null = zu wenig Daten. */
  differenz: number | null
}

function formatWert(einheit: CheckInMetrikErgebnis['einheit'], wert: number): string {
  return einheit === 'zeit' ? formatScreentime(Math.round(wert)) : `${wert.toLocaleString('de-DE', { maximumFractionDigits: 1 })} / 10`
}

function formatDifferenz(einheit: CheckInMetrikErgebnis['einheit'], differenz: number): string {
  const vorzeichen = differenz > 0 ? '+' : differenz < 0 ? '−' : '±'
  const betrag = Math.abs(differenz)
  const betragText = einheit === 'zeit' ? formatScreentime(Math.round(betrag)) : betrag.toLocaleString('de-DE', { maximumFractionDigits: 1 })
  return `${vorzeichen}${betragText}`
}

export default function CheckInKennzahlen({ metriken }: { metriken: CheckInMetrikErgebnis[] }) {
  return (
    <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
      {metriken.map((m) => {
        const istVerbesserung = m.differenz === null ? null : m.richtung === 'mehr' ? m.differenz > 0 : m.differenz < 0
        const istVerschlechterung = m.differenz === null ? null : m.richtung === 'mehr' ? m.differenz < 0 : m.differenz > 0
        return (
          <div key={m.key} className="flex items-center justify-between gap-3 px-3 py-2.5 bg-card">
            <span className="text-xs font-medium text-foreground">{m.label}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-semibold text-foreground tabular-nums">{formatWert(m.einheit, m.aktuellerWert)}</span>
              {m.differenz === null ? (
                <span className="text-[10px] text-muted-foreground">Noch nicht genug Daten</span>
              ) : (
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    istVerbesserung ? 'text-emerald-600' : istVerschlechterung ? 'text-red-600' : 'text-muted-foreground'
                  }`}
                >
                  {formatDifferenz(m.einheit, m.differenz)}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
