import { describe, it, expect } from 'vitest'
import {
  berechneGrundumsatz,
  berechneKcal,
  istGewichtGueltig,
  istGroesseGueltig,
  istAlterGueltig,
  istGewichtDeutlichAbgewichen,
  GEWICHT_MIN_KG,
  GEWICHT_MAX_KG,
  GROESSE_MIN_CM,
  GROESSE_MAX_CM,
  ALTER_MIN_JAHRE,
  ALTER_MAX_JAHRE,
  GEWICHT_ABWEICHUNG_HINWEIS_KG,
} from './kcal-rechner'

describe('berechneGrundumsatz (Mifflin-St-Jeor)', () => {
  it('addiert +5 für Männer', () => {
    // 10*80 + 6.25*180 - 5*30 = 800 + 1125 - 150 = 1775, +5 = 1780
    expect(berechneGrundumsatz(80, 180, 30, 'maennlich')).toBe(1780)
  })

  it('subtrahiert 161 für Frauen', () => {
    // 1775 - 161 = 1614
    expect(berechneGrundumsatz(80, 180, 30, 'weiblich')).toBe(1614)
  })
})

describe('berechneKcal', () => {
  const basis = {
    gewichtKg: 80,
    groesseCm: 180,
    alterJahre: 30,
    geschlecht: 'maennlich' as const,
    aktivitaetslevel: 'moderat_aktiv' as const,
  }

  it('Gewicht halten = 100% des Erhaltungsbedarfs', () => {
    // Grundumsatz 1780 * PAL 1.55 = 2759
    const ergebnis = berechneKcal({ ...basis, ziel: 'gewicht_halten' })
    expect(ergebnis.erhaltungsbedarf).toBe(2759)
    expect(ergebnis.zielKcal).toBe(2759)
  })

  it('Fett verlieren = 90% des Erhaltungsbedarfs', () => {
    const ergebnis = berechneKcal({ ...basis, ziel: 'fett_verlieren' })
    expect(ergebnis.erhaltungsbedarf).toBe(2759)
    expect(ergebnis.zielKcal).toBe(2483) // 2759 * 0.9 = 2483.1 → gerundet
  })

  it('Muskeln aufbauen = 110% des Erhaltungsbedarfs', () => {
    const ergebnis = berechneKcal({ ...basis, ziel: 'muskeln_aufbauen' })
    expect(ergebnis.erhaltungsbedarf).toBe(2759)
    expect(ergebnis.zielKcal).toBe(3035) // 2759 * 1.1 = 3034.9 → gerundet
  })

  it('rundet auf ganze Zahlen', () => {
    const ergebnis = berechneKcal({ ...basis, gewichtKg: 77.3, ziel: 'gewicht_halten' })
    expect(Number.isInteger(ergebnis.erhaltungsbedarf)).toBe(true)
    expect(Number.isInteger(ergebnis.zielKcal)).toBe(true)
  })

  it('sitzend (PAL 1.2) liefert einen niedrigeren Erhaltungsbedarf als extrem_aktiv (PAL 1.9)', () => {
    const sitzend = berechneKcal({ ...basis, aktivitaetslevel: 'sitzend', ziel: 'gewicht_halten' })
    const extrem = berechneKcal({ ...basis, aktivitaetslevel: 'extrem_aktiv', ziel: 'gewicht_halten' })
    expect(sitzend.erhaltungsbedarf).toBeLessThan(extrem.erhaltungsbedarf)
  })
})

describe('Validierungsgrenzen', () => {
  it('Gewicht: Grenzwerte inklusive gültig, knapp außerhalb ungültig', () => {
    expect(istGewichtGueltig(GEWICHT_MIN_KG)).toBe(true)
    expect(istGewichtGueltig(GEWICHT_MAX_KG)).toBe(true)
    expect(istGewichtGueltig(GEWICHT_MIN_KG - 1)).toBe(false)
    expect(istGewichtGueltig(GEWICHT_MAX_KG + 1)).toBe(false)
  })

  it('Größe: Grenzwerte inklusive gültig, knapp außerhalb ungültig', () => {
    expect(istGroesseGueltig(GROESSE_MIN_CM)).toBe(true)
    expect(istGroesseGueltig(GROESSE_MAX_CM)).toBe(true)
    expect(istGroesseGueltig(GROESSE_MIN_CM - 1)).toBe(false)
    expect(istGroesseGueltig(GROESSE_MAX_CM + 1)).toBe(false)
  })

  it('Alter: Grenzwerte inklusive gültig, knapp außerhalb ungültig', () => {
    expect(istAlterGueltig(ALTER_MIN_JAHRE)).toBe(true)
    expect(istAlterGueltig(ALTER_MAX_JAHRE)).toBe(true)
    expect(istAlterGueltig(ALTER_MIN_JAHRE - 1)).toBe(false)
    expect(istAlterGueltig(ALTER_MAX_JAHRE + 1)).toBe(false)
  })
})

describe('istGewichtDeutlichAbgewichen (5kg-Hinweis)', () => {
  it('löst NICHT aus bei einer Abweichung knapp unter der Schwelle', () => {
    expect(istGewichtDeutlichAbgewichen(80, 80 + GEWICHT_ABWEICHUNG_HINWEIS_KG - 0.1)).toBe(false)
  })

  it('löst aus bei exakt der Schwelle (>=)', () => {
    expect(istGewichtDeutlichAbgewichen(80, 80 + GEWICHT_ABWEICHUNG_HINWEIS_KG)).toBe(true)
  })

  it('löst aus unabhängig von der Richtung (Zunahme oder Abnahme)', () => {
    expect(istGewichtDeutlichAbgewichen(85, 80)).toBe(true)
    expect(istGewichtDeutlichAbgewichen(75, 80)).toBe(true)
  })

  it('löst nicht aus bei unverändertem Gewicht', () => {
    expect(istGewichtDeutlichAbgewichen(80, 80)).toBe(false)
  })
})
