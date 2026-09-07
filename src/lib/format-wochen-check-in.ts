// PROJ-45/PROJ-51: Geteilte Anzeige-Formatierung für Wochen-Check-In-Werte — ursprünglich in
// wochen-check-in-form.tsx definiert, hierher ausgelagert, damit der neue Check-In-Tab
// (PROJ-51, Analyse-Seite) dieselbe Formatierung ohne Duplikat wiederverwenden kann.

export function formatScreentime(minuten: number): string {
  if (minuten < 60) return `${minuten} Min`
  const stunden = minuten / 60
  const stundenText = Number.isInteger(stunden) ? `${stunden}` : stunden.toFixed(1).replace('.', ',')
  return `${stundenText} Std`
}

export function formatWochenLabel(wocheStart: string): string {
  const start = new Date(`${wocheStart}T00:00:00Z`)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
  return `${fmt(start)} – ${fmt(end)}`
}
