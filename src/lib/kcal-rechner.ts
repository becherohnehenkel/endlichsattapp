export type Geschlecht = 'maennlich' | 'weiblich'
export type Aktivitaetslevel = 'sitzend' | 'leicht_aktiv' | 'moderat_aktiv' | 'sehr_aktiv' | 'extrem_aktiv'
export type Ziel = 'fett_verlieren' | 'gewicht_halten' | 'muskeln_aufbauen'

export interface KcalRechnerInput {
  gewichtKg: number
  groesseCm: number
  alterJahre: number
  geschlecht: Geschlecht
  aktivitaetslevel: Aktivitaetslevel
  ziel: Ziel
}

export const GEWICHT_MIN_KG = 30
export const GEWICHT_MAX_KG = 300
export const GROESSE_MIN_CM = 120
export const GROESSE_MAX_CM = 250
export const ALTER_MIN_JAHRE = 14
export const ALTER_MAX_JAHRE = 100

// PROJ-37: 5kg-Abweichung zwischen aktuellem Eingabewert und zuletzt gespeichertem
// Gewicht löst den "neu berechnen"-Hinweis aus (siehe Spec Decision Log).
export const GEWICHT_ABWEICHUNG_HINWEIS_KG = 5

export const PAL_FAKTOREN: Record<Aktivitaetslevel, number> = {
  sitzend: 1.2,
  leicht_aktiv: 1.375,
  moderat_aktiv: 1.55,
  sehr_aktiv: 1.725,
  extrem_aktiv: 1.9,
}

export const PAL_LABELS: Record<Aktivitaetslevel, string> = {
  sitzend: 'Sitzend — wenig bis keine Bewegung, Bürojob',
  leicht_aktiv: 'Leicht aktiv — 1–3 Tage/Woche Sport',
  moderat_aktiv: 'Moderat aktiv — 3–5 Tage/Woche Sport',
  sehr_aktiv: 'Sehr aktiv — 6–7 Tage/Woche intensiv',
  extrem_aktiv: 'Extrem aktiv — körperliche Arbeit + tägliches Training',
}

export const ZIEL_LABELS: Record<Ziel, string> = {
  fett_verlieren: 'Fett verlieren',
  gewicht_halten: 'Gewicht halten',
  muskeln_aufbauen: 'Muskeln aufbauen',
}

// Ziel-Anpassung relativ zum Erhaltungsbedarf (Mifflin-St-Jeor × PAL), siehe Spec.
export const ZIEL_FAKTOREN: Record<Ziel, number> = {
  fett_verlieren: 0.9,
  gewicht_halten: 1.0,
  muskeln_aufbauen: 1.1,
}

export function istGewichtGueltig(gewichtKg: number): boolean {
  return gewichtKg >= GEWICHT_MIN_KG && gewichtKg <= GEWICHT_MAX_KG
}

export function istGroesseGueltig(groesseCm: number): boolean {
  return groesseCm >= GROESSE_MIN_CM && groesseCm <= GROESSE_MAX_CM
}

export function istAlterGueltig(alterJahre: number): boolean {
  return alterJahre >= ALTER_MIN_JAHRE && alterJahre <= ALTER_MAX_JAHRE
}

// Mifflin-St-Jeor-Grundumsatz (Ruheenergieverbrauch), siehe Spec Acceptance Criteria.
export function berechneGrundumsatz(gewichtKg: number, groesseCm: number, alterJahre: number, geschlecht: Geschlecht): number {
  const basis = 10 * gewichtKg + 6.25 * groesseCm - 5 * alterJahre
  return geschlecht === 'maennlich' ? basis + 5 : basis - 161
}

export interface KcalRechnerErgebnis {
  erhaltungsbedarf: number
  zielKcal: number
}

export function berechneKcal(input: KcalRechnerInput): KcalRechnerErgebnis {
  const grundumsatz = berechneGrundumsatz(input.gewichtKg, input.groesseCm, input.alterJahre, input.geschlecht)
  const erhaltungsbedarf = grundumsatz * PAL_FAKTOREN[input.aktivitaetslevel]
  const zielKcal = erhaltungsbedarf * ZIEL_FAKTOREN[input.ziel]
  return {
    erhaltungsbedarf: Math.round(erhaltungsbedarf),
    zielKcal: Math.round(zielKcal),
  }
}

export function istGewichtDeutlichAbgewichen(aktuellesGewichtKg: number, gespeichertesGewichtKg: number): boolean {
  return Math.abs(aktuellesGewichtKg - gespeichertesGewichtKg) >= GEWICHT_ABWEICHUNG_HINWEIS_KG
}
