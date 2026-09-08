import type { KcalRechnerGespeicherteWerte } from '@/components/kcal-rechner'

// PROJ-37 (Refinement: Stateless Gast-Persistenz) — rein client-seitiger Speicher für
// Gäste. Landet nie auf dem Server: weder beim Schreiben noch beim Lesen wird eine
// Netzwerkanfrage ausgelöst. Alle Zugriffe defensiv (privater Modus, deaktivierter
// Speicher, Kontingent-Überschreitung dürfen nie zu einem Fehler führen).
const STORAGE_KEY = 'mehralsabnehmen_kcal_gast'

export function ladeKcalGastWerte(): KcalRechnerGespeicherteWerte | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      typeof parsed?.gewichtKg !== 'number' ||
      typeof parsed?.groesseCm !== 'number' ||
      typeof parsed?.alterJahre !== 'number' ||
      typeof parsed?.geschlecht !== 'string' ||
      typeof parsed?.aktivitaetslevel !== 'string' ||
      typeof parsed?.ziel !== 'string'
    ) {
      return null
    }
    return parsed as KcalRechnerGespeicherteWerte
  } catch {
    return null
  }
}

export function speichereKcalGastWerte(werte: KcalRechnerGespeicherteWerte): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(werte))
  } catch {
    // Speicher nicht verfügbar (z. B. privater Modus, Kontingent voll) — bewusst ignoriert,
    // der Rechner funktioniert dann einfach wie zuvor ohne Persistenz.
  }
}
