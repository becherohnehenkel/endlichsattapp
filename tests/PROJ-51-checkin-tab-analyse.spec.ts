/**
 * PROJ-51 — Check-In-Tab (Analyse-Seite)
 *
 * Teststrategie: identisch zu PROJ-50 (Training-Tab) — die meisten Acceptance Criteria
 * werden über einen `page.route()`-Mock von `/api/check-in/verlauf` getestet (etabliertes
 * Muster, siehe PROJ-11/12/13/14/50), deterministisch und unabhängig vom echten Datenstand
 * des QA-Testkontos. Ein Smoke-Test läuft zusätzlich gegen die echte API/DB. Serverseitige
 * Berechnungslogik (Differenz, Richtung, Rundung) ist bereits über 9 Vitest-Integrationstests
 * in src/app/api/check-in/verlauf/route.test.ts abgedeckt.
 */

import { test, expect, type Page, type Route } from '@playwright/test'
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

// Seit PROJ-52 sitzt der Check-In-Tab hinter dem Einwilligungs-Gate für Gesundheitsdaten.
// Selbst geseedet statt von der Lauf-Reihenfolge anderer Spec-Files (z.B. PROJ-52 selbst,
// das die Einwilligung des gleichen QA-Kontos zwischenzeitlich widerruft) abhängig zu sein.
test.beforeAll(async () => {
  let found: { id: string } | undefined
  for (let page = 1; page <= 50 && !found; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    found = data.users.find(u => u.email === TEST_EMAIL)
    if (data.users.length < 200) break
  }
  if (!found) throw new Error('QA-Testkonto qa-test@endlichsatt.dev nicht gefunden')
  await admin.from('profiles').update({ gesundheitsdaten_einwilligung_at: new Date().toISOString() }).eq('id', found.id)
})

async function loginAs(page: Page) {
  await page.goto('/login')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 })
}

async function oeffneCheckInTab(page: Page) {
  await page.goto('/analyse')
  await page.getByRole('tab', { name: 'Check-Ins' }).click()
}

function mockVerlauf(page: Page, byOffset: Record<string, unknown>) {
  return page.route('**/api/check-in/verlauf**', (route: Route) => {
    const url = new URL(route.request().url())
    const offset = url.searchParams.get('offset') ?? '0'
    const body = byOffset[offset] ?? byOffset['0']
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })
}

const KENNZAHLEN_LEER = [
  { key: 'schlaf', label: 'Schlaf', einheit: 'punkte', richtung: 'mehr', aktuellerWert: 7, differenz: null },
  { key: 'screentime', label: 'Screentime', einheit: 'zeit', richtung: 'weniger', aktuellerWert: 120, differenz: null },
  { key: 'energielevel', label: 'Energielevel', einheit: 'punkte', richtung: 'mehr', aktuellerWert: 6, differenz: null },
  { key: 'achtsamkeit', label: 'Ernährung', einheit: 'punkte', richtung: 'mehr', aktuellerWert: 7, differenz: null },
  { key: 'bewusstEssen', label: 'Bewusstes Essen', einheit: 'punkte', richtung: 'mehr', aktuellerWert: 8, differenz: null },
  { key: 'sicherheitOhneTracking', label: 'Tracking-Bereitschaft', einheit: 'punkte', richtung: 'mehr', aktuellerWert: 5, differenz: null },
]

// ─── Check-In-Liste ──────────────────────────────────────────────────────────

test.describe('Check-In-Liste', () => {
  test('AC: zeigt maximal 5 Einheiten initial, neueste zuerst', async ({ page }) => {
    const checkIns = Array.from({ length: 5 }, (_, i) => ({ id: `c${i}`, wocheStart: `2026-08-${16 + i}` }))
    await mockVerlauf(page, { '0': { checkIns, hasMore: true, kennzahlen: KENNZAHLEN_LEER } })
    await loginAs(page)
    await oeffneCheckInTab(page)
    await expect(page.locator('p', { hasText: /–/ })).toHaveCount(5)
  })

  test('AC: "Ältere Einträge laden" erscheint, wenn mehr als 5 Einträge existieren', async ({ page }) => {
    const checkIns = Array.from({ length: 5 }, (_, i) => ({ id: `c${i}`, wocheStart: `2026-08-${16 + i}` }))
    await mockVerlauf(page, { '0': { checkIns, hasMore: true, kennzahlen: KENNZAHLEN_LEER } })
    await loginAs(page)
    await oeffneCheckInTab(page)
    await expect(page.getByRole('button', { name: /Ältere Einträge laden/ })).toBeVisible()
  })

  test('AC: Klick auf "Ältere Einträge laden" hängt die nächsten Einträge an (nicht ersetzt)', async ({ page }) => {
    const seite1 = [
      { id: 'a1', wocheStart: '2026-09-01' },
      { id: 'a2', wocheStart: '2026-08-25' },
    ]
    const seite2 = [
      { id: 'b1', wocheStart: '2026-08-18' },
      { id: 'b2', wocheStart: '2026-08-11' },
    ]
    await mockVerlauf(page, {
      '0': { checkIns: seite1, hasMore: true, kennzahlen: KENNZAHLEN_LEER },
      '2': { checkIns: seite2, hasMore: false },
    })
    await loginAs(page)
    await oeffneCheckInTab(page)
    await expect(page.locator('p', { hasText: /–/ })).toHaveCount(2)
    await page.getByRole('button', { name: /Ältere Einträge laden/ }).click()
    await expect(page.locator('p', { hasText: /–/ })).toHaveCount(4)
  })

  test('AC: "Ältere Einträge laden" verschwindet, wenn keine weiteren Einträge existieren', async ({ page }) => {
    await mockVerlauf(page, { '0': { checkIns: [{ id: 'c1', wocheStart: '2026-09-01' }], hasMore: false, kennzahlen: KENNZAHLEN_LEER } })
    await loginAs(page)
    await oeffneCheckInTab(page)
    await expect(page.getByRole('button', { name: /Ältere Einträge laden/ })).not.toBeVisible()
  })

  test('AC: ein Eintrag zeigt ausschließlich die Kalenderwoche als Datumsspanne', async ({ page }) => {
    await mockVerlauf(page, { '0': { checkIns: [{ id: 'c1', wocheStart: '2026-08-30' }], hasMore: false, kennzahlen: KENNZAHLEN_LEER } })
    await loginAs(page)
    await oeffneCheckInTab(page)
    await expect(page.getByText('30. Aug. – 5. Sept.')).toBeVisible()
  })

  test('AC: Leer-Zustand erscheint, wenn noch nie ein Check-In ausgefüllt wurde', async ({ page }) => {
    await mockVerlauf(page, { '0': { checkIns: [], hasMore: false } })
    await loginAs(page)
    await oeffneCheckInTab(page)
    await expect(page.getByText('Noch kein Check-In')).toBeVisible()
  })
})

// ─── Analyse-Kennzahlen ──────────────────────────────────────────────────────

test.describe('Analyse-Kennzahlen', () => {
  test('AC: zeigt alle 6 Metrik-Zeilen oberhalb der Liste', async ({ page }) => {
    await mockVerlauf(page, { '0': { checkIns: [{ id: 'c1', wocheStart: '2026-09-01' }], hasMore: false, kennzahlen: KENNZAHLEN_LEER } })
    await loginAs(page)
    await oeffneCheckInTab(page)
    const panel = page.getByRole('tabpanel')
    for (const label of ['Schlaf', 'Screentime', 'Energielevel', 'Ernährung', 'Bewusstes Essen', 'Tracking-Bereitschaft']) {
      await expect(panel.getByText(label, { exact: true })).toBeVisible()
    }
  })

  test('AC: zeigt den aktuellen Wert des neuesten Check-Ins (Punkte-Skala als "X / 10")', async ({ page }) => {
    await mockVerlauf(page, { '0': { checkIns: [{ id: 'c1', wocheStart: '2026-09-01' }], hasMore: false, kennzahlen: KENNZAHLEN_LEER } })
    await loginAs(page)
    await oeffneCheckInTab(page)
    await expect(page.getByText('7 / 10').first()).toBeVisible()
  })

  test('AC: Screentime wird als Std/Min formatiert, nicht als rohe Minutenzahl', async ({ page }) => {
    const kennzahlen = KENNZAHLEN_LEER.map(m => m.key === 'screentime' ? { ...m, aktuellerWert: 90 } : m)
    await mockVerlauf(page, { '0': { checkIns: [{ id: 'c1', wocheStart: '2026-09-01' }], hasMore: false, kennzahlen } })
    await loginAs(page)
    await oeffneCheckInTab(page)
    await expect(page.getByText('1,5 Std')).toBeVisible()
  })

  test('AC: zeigt einen neutralen Hinweis statt einer Differenz unterhalb der Datenschwelle', async ({ page }) => {
    await mockVerlauf(page, { '0': { checkIns: [{ id: 'c1', wocheStart: '2026-09-01' }], hasMore: false, kennzahlen: KENNZAHLEN_LEER } })
    await loginAs(page)
    await oeffneCheckInTab(page)
    await expect(page.getByText('Noch nicht genug Daten').first()).toBeVisible()
  })

  test('AC: zeigt eine positive Differenz bei "mehr ist besser"-Metriken grün mit Pluszeichen', async ({ page }) => {
    const kennzahlen = KENNZAHLEN_LEER.map(m => m.key === 'schlaf' ? { ...m, differenz: 1.5 } : m)
    await mockVerlauf(page, { '0': { checkIns: [{ id: 'c1', wocheStart: '2026-09-01' }], hasMore: false, kennzahlen } })
    await loginAs(page)
    await oeffneCheckInTab(page)
    const badge = page.getByText('+1,5')
    await expect(badge).toBeVisible()
    await expect(badge).toHaveClass(/emerald/)
  })

  test('AC: eine negative Screentime-Differenz gilt als Verbesserung (grün), nicht als Verschlechterung', async ({ page }) => {
    const kennzahlen = KENNZAHLEN_LEER.map(m => m.key === 'screentime' ? { ...m, differenz: -15 } : m)
    await mockVerlauf(page, { '0': { checkIns: [{ id: 'c1', wocheStart: '2026-09-01' }], hasMore: false, kennzahlen } })
    await loginAs(page)
    await oeffneCheckInTab(page)
    const badge = page.getByText('−15 Min')
    await expect(badge).toBeVisible()
    await expect(badge).toHaveClass(/emerald/)
  })

  test('AC: eine positive Screentime-Differenz gilt als Verschlechterung (rot)', async ({ page }) => {
    const kennzahlen = KENNZAHLEN_LEER.map(m => m.key === 'screentime' ? { ...m, differenz: 20 } : m)
    await mockVerlauf(page, { '0': { checkIns: [{ id: 'c1', wocheStart: '2026-09-01' }], hasMore: false, kennzahlen } })
    await loginAs(page)
    await oeffneCheckInTab(page)
    const badge = page.getByText('+20 Min')
    await expect(badge).toBeVisible()
    await expect(badge).toHaveClass(/red/)
  })

  test('AC: die Analyse-Sektion erscheint nicht, wenn noch nie ein Check-In ausgefüllt wurde', async ({ page }) => {
    await mockVerlauf(page, { '0': { checkIns: [], hasMore: false } })
    await loginAs(page)
    await oeffneCheckInTab(page)
    await expect(page.getByText('Schlaf', { exact: true })).not.toBeVisible()
  })
})

// ─── Gast-Zugriff ────────────────────────────────────────────────────────────

test.describe('Gast-Zugriff', () => {
  test('AC: Gast sieht eine Login-Hinweis-Karte statt des Check-In-Tabs', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/analyse')
    await expect(page.getByText('Melde dich an, um deine Analyse-Historie zu sehen.')).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Check-Ins' })).not.toBeVisible()
  })
})

// ─── Echte Integration (kein Mock) ───────────────────────────────────────────

test.describe('Echte API-Integration', () => {
  test('AC: Check-In-Tab lädt reale Daten von /api/check-in/verlauf ohne Fehlerzustand', async ({ page }) => {
    await loginAs(page)
    await oeffneCheckInTab(page)
    await expect(page.getByText('Deine Check-Ins konnten nicht geladen werden.')).not.toBeVisible()
  })
})
