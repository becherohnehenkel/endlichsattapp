/**
 * PROJ-52 — Explizite Einwilligung für gesundheitsnahe Daten (Art. 9 DSGVO)
 *
 * Teststrategie:
 * - Gate-, Zustimmen-, Ablehnen- und Widerruf-Verhalten laufen gegen die echte DB über
 *   das bestehende QA-Testkonto (qa-test@endlichsatt.dev), da die betroffenen Routen den
 *   Service-Role-Client nutzen und die Einwilligung serverseitig geprüft wird — kein Mock
 *   möglich. Ein admin-Setup (Service-Role-Key, gleiche .env.local wie die App) setzt den
 *   Einwilligungs-Zeitstempel des QA-Kontos vor jeder Testgruppe auf einen bekannten
 *   Zustand, damit die Tests unabhängig von Lauf-Reihenfolge und vorherigen manuellen
 *   QA-Durchgängen sind.
 * - Registrierungs-Checkbox: nur die clientseitige Pflichtfeld-Validierung wird getestet.
 *   Der volle Signup → E-Mail-Bestätigung → Backfill-Kreislauf ist durch Supabase' eigenes
 *   E-Mail-Rate-Limit in der Dev-Umgebung nicht praktikabel E2E-testbar; diese Logik ist
 *   stattdessen durch `src/app/auth/callback/route.test.ts` (Vitest) abgedeckt.
 * - Gast-Verhalten inkl. anonymer Session (ausgelöst über /analyse/start, wie in PROJ-19/45).
 */

import { test, expect, type Page } from '@playwright/test'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'

function readEnv() {
  const content = fs.readFileSync('.env.local', 'utf8')
  const env: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1)
  }
  return env
}

const env = readEnv()
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

let qaUserId: string

test.beforeAll(async () => {
  let found: { id: string } | undefined
  for (let page = 1; page <= 50 && !found; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    found = data.users.find(u => u.email === TEST_EMAIL)
    if (data.users.length < 200) break
  }
  if (!found) throw new Error('QA-Testkonto qa-test@endlichsatt.dev nicht gefunden')
  qaUserId = found.id
})

// Dieses File manipuliert die Einwilligung des gemeinsamen QA-Kontos aktiv (u.a. der
// "Widerruf"-Block widerruft sie als letzten Testschritt echt). Andere Spec-Files
// (PROJ-37/45/51) laufen zwar mittlerweile selbst mit eigener Vorbedingung (siehe dort),
// aber dieser afterAll stellt zusätzlich sicher, dass das Konto nach diesem File in jedem
// Fall — unabhängig davon, welcher Test zuletzt lief — wieder im eingewilligten
// Normalzustand zurückbleibt, statt andere Files/manuelle QA-Durchgänge zu überraschen.
test.afterAll(async () => {
  await admin
    .from('profiles')
    .update({ gesundheitsdaten_einwilligung_at: new Date().toISOString() })
    .eq('id', qaUserId)
})

async function setzeEinwilligung(eingewilligt: boolean) {
  await admin
    .from('profiles')
    .update({ gesundheitsdaten_einwilligung_at: eingewilligt ? new Date().toISOString() : null })
    .eq('id', qaUserId)
}

async function loginAs(page: Page) {
  await page.goto('/login')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 })
  await page.waitForLoadState('networkidle')
}

test.describe('Kalorien-Rechner-Gate', () => {
  test.beforeEach(async () => {
    await setzeEinwilligung(false)
  })

  test('AC: zeigt den Zustimmungs-Bildschirm ohne Einwilligung', async ({ page }) => {
    await loginAs(page)
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await page.getByRole('button', { name: 'Kcal-Rechner' }).click()
    await expect(page.getByText('Einwilligung erforderlich')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Zustimmen' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ablehnen' })).toBeVisible()
    await expect(page.getByLabel('Gewicht (kg)')).not.toBeVisible()
  })

  test('AC: "Zustimmen" schaltet den Kalorien-Rechner sofort frei, ohne erneutes Laden', async ({ page }) => {
    await loginAs(page)
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await page.getByRole('button', { name: 'Kcal-Rechner' }).click()
    await page.getByRole('button', { name: 'Zustimmen' }).click()
    await expect(page.getByText('Einwilligung erforderlich')).not.toBeVisible()
    await expect(page.getByLabel('Gewicht (kg)')).toBeVisible()
  })

  test('AC: "Zustimmen" auf einer Seite schaltet auch den Wochen-Check-In frei', async ({ page }) => {
    await loginAs(page)
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await page.getByRole('button', { name: 'Kcal-Rechner' }).click()
    await page.getByRole('button', { name: 'Zustimmen' }).click()
    await expect(page.getByLabel('Gewicht (kg)')).toBeVisible()

    await page.goto('/check-in')
    await expect(page.getByText('Einwilligung erforderlich')).not.toBeVisible()
    await expect(page.getByText('Aktuelle Woche')).toBeVisible()
  })

  test('AC: "Ablehnen" bleibt gesperrt und speichert keine Einwilligung', async ({ page }) => {
    await loginAs(page)
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await page.getByRole('button', { name: 'Kcal-Rechner' }).click()
    await page.getByRole('button', { name: 'Ablehnen' }).click()
    await expect(page.getByText('Einwilligung erforderlich')).toBeVisible()

    const res = await page.request.get('/api/einwilligung/gesundheitsdaten')
    expect((await res.json()).eingewilligt).toBe(false)
  })
})

test.describe('Wochen-Check-In-Gate', () => {
  test.beforeEach(async () => {
    await setzeEinwilligung(false)
  })

  test('AC: /check-in zeigt denselben Zustimmungs-Bildschirm', async ({ page }) => {
    await loginAs(page)
    await page.goto('/check-in')
    await expect(page.getByText('Einwilligung erforderlich')).toBeVisible()
    // Gewohnheiten (PROJ-46) liegt außerhalb des Gates und bleibt sichtbar.
    await expect(page.getByRole('heading', { name: 'Gewohnheiten' })).toBeVisible()
  })

  test('AC: der Check-In-Tab auf /analyse (PROJ-51) zeigt ebenfalls den Zustimmungs-Bildschirm', async ({ page }) => {
    await loginAs(page)
    await page.goto('/analyse')
    await page.getByRole('tab', { name: 'Check-Ins' }).click()
    await expect(page.getByText('Einwilligung erforderlich')).toBeVisible()
  })
})

test.describe('Passive Anzeige-Stellen', () => {
  test.beforeEach(async () => {
    await setzeEinwilligung(false)
  })

  test('AC: Analyse-Übersicht zeigt Leerzustand statt Gate ohne Einwilligung', async ({ page }) => {
    await loginAs(page)
    await page.goto('/analyse')
    await page.getByText('Kannst du noch etwas essen?').click()
    await expect(page.getByText('Einwilligung erforderlich')).not.toBeVisible()
    await expect(page.getByText(/Kcal-Rechner ausfüllen/)).toBeVisible()
  })

  test('AC: Emotionales Essen zeigt Referenz-Standardwert statt Gate ohne Einwilligung', async ({ page }) => {
    await loginAs(page)
    await page.goto('/ernaehrung/emotionales-essen')
    await page.getByRole('button', { name: /Feste Mahlzeiten planen/ }).click()
    await expect(page.getByText('Einwilligung erforderlich')).not.toBeVisible()
    await expect(page.getByText(/noch kein eigener Wert berechnet/)).toBeVisible()
  })
})

test.describe('Widerruf (Konto-Ansicht)', () => {
  test.beforeEach(async () => {
    await setzeEinwilligung(true)
  })

  test('AC: Widerruf-Button ist sichtbar, sobald eine Einwilligung vorliegt', async ({ page }) => {
    await loginAs(page)
    await page.goto('/konto')
    await expect(page.getByRole('button', { name: 'Einwilligung für Gesundheitsdaten widerrufen' })).toBeVisible()
  })

  test('AC: Abbrechen im Bestätigungsdialog lässt die Einwilligung unverändert', async ({ page }) => {
    await loginAs(page)
    await page.goto('/konto')
    await page.getByRole('button', { name: 'Einwilligung für Gesundheitsdaten widerrufen' }).click()
    await expect(page.getByText('Beim Widerruf werden')).toBeVisible()
    await page.getByRole('button', { name: 'Abbrechen' }).click()
    await expect(page.getByText('Beim Widerruf werden')).not.toBeVisible()

    const res = await page.request.get('/api/einwilligung/gesundheitsdaten')
    expect((await res.json()).eingewilligt).toBe(true)
  })

  test('AC: Bestätigter Widerruf löscht die Daten und sperrt beide Funktionen wieder', async ({ page }) => {
    await loginAs(page)
    await page.goto('/konto')
    await page.getByRole('button', { name: 'Einwilligung für Gesundheitsdaten widerrufen' }).click()
    await page.getByRole('button', { name: 'Widerrufen und löschen' }).click()
    await expect(page.getByText('Einwilligung widerrufen')).toBeVisible()

    const res = await page.request.get('/api/einwilligung/gesundheitsdaten')
    expect((await res.json()).eingewilligt).toBe(false)

    await page.goto('/ernaehrung/so-geht-abnehmen')
    await page.getByRole('button', { name: 'Kcal-Rechner' }).click()
    await expect(page.getByText('Einwilligung erforderlich')).toBeVisible()
  })
})

test.describe('Registrierung — Pflicht-Checkbox', () => {
  test('AC: Absenden ohne aktivierte Einwilligungs-Checkbox wird abgelehnt', async ({ page }) => {
    await page.goto('/registrieren')
    await page.fill('#name', 'QA Playwright Test')
    await page.fill('#email', `qa-e2e-${Date.now()}@endlichsatt.dev`)
    await page.fill('#password', 'TestPassword123!')
    await page.getByRole('button', { name: 'Konto erstellen' }).click()
    await expect(page.getByText('Bitte stimme der Verarbeitung deiner Gesundheitsdaten zu')).toBeVisible()
    await expect(page).toHaveURL(/\/registrieren/)
  })
})

test.describe('Sicherheit: Gast-/Anonym-Zugriff', () => {
  test('AC: Gast sieht den Kalorien-Rechner direkt ohne Gate', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await page.getByRole('button', { name: 'Kcal-Rechner' }).click()
    await expect(page.getByText('Einwilligung erforderlich')).not.toBeVisible()
    await expect(page.getByLabel('Gewicht (kg)')).toBeVisible()
  })

  test('AC: eine anonyme Session erhält 403 auf POST/DELETE der Einwilligungs-Route', async ({ page }) => {
    // Löst die bestehende anonyme Anmeldung aus PROJ-19 aus.
    await page.goto('/analyse/start')
    await page.waitForLoadState('networkidle')

    const postRes = await page.request.post('/api/einwilligung/gesundheitsdaten')
    expect(postRes.status()).toBe(403)
    const delRes = await page.request.delete('/api/einwilligung/gesundheitsdaten')
    expect(delRes.status()).toBe(403)
  })
})
