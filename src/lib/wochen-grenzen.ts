export function getWeekStartIso(date: Date): string {
  const d = new Date(date)
  const day = d.getUTCDay() // 0 = Sunday
  d.setUTCDate(d.getUTCDate() - day)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}
