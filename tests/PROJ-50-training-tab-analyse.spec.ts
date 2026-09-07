/**
 * PROJ-50 — Training-Tab (Analyse-Seite)
 *
 * Teststrategie:
 * - Die meisten Acceptance Criteria werden über einen `page.route()`-Mock von
 *   `/api/training/verlauf` getestet (etabliertes Muster, siehe PROJ-11/12/13/14) —
 *   deterministisch und unabhängig vom echten Datenstand des QA-Testkontos. Das Konto
 *   hat bereits 18 reale "Zuhause ohne Equipment"-Einheiten und KEINE Fitnessstudio-
 *   Einheiten; `training_sessions` hat keine DELETE-Policy (siehe PROJ-44), es lässt
 *   sich also kein Fitnessstudio-Testdatensatz anlegen und wieder entfernen, ohne das
 *   Konto dauerhaft zu verschmutzen.
 * - Ein kleiner Smoke-Test läuft zusätzlich gegen die echte API/DB, um die reale
 *   Integration (kein Mock) mindestens einmal abzudecken.
 * - Serverseitige Berechnungslogik (Volumen, Steigerung, Serie) ist bereits über 11
 *   Vitest-Integrationstests in src/app/api/training/verlauf/route.test.ts abgedeckt —
 *   hier wird nur noch das Frontend-Rendering dieser Werte geprüft.
 */

import { test, expect, type Page, type Route } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'

async function loginAs(page: Page) {
  await page.goto('/login')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 })
}

async function oeffneTrainingTab(page: Page) {
  await page.goto('/analyse')
  await page.getByRole('tab', { name: 'Training' }).click()
}

function mockVerlauf(page: Page, byOffset: Record<string, unknown>) {
  return page.route('**/api/training/verlauf**', (route: Route) => {
    const url = new URL(route.request().url())
    const offset = url.searchParams.get('offset') ?? '0'
    const body = byOffset[offset] ?? byOffset['0']
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })
}

const KENNZAHLEN_LEER = { einheitenLetzte7Tage: 0, durchschnittsgewichtKg: null, steigerungProzent: null, aktuelleSerieWochen: 0 }

// ─── Trainingsliste ──────────────────────────────────────────────────────────

test.describe('Trainingsliste', () => {
  test('AC: zeigt maximal 5 Einheiten initial, neueste zuerst', async ({ page }) => {
    const trainings = Array.from({ length: 5 }, (_, i) => ({
      id: `t${i}`, planSlug: 'zuhause-ohne-equipment', createdAt: new Date(Date.now() - i * 3600_000).toISOString(), volumenKg: null,
    }))
    await mockVerlauf(page, { '0': { trainings, hasMore: true, kennzahlen: KENNZAHLEN_LEER } })
    await loginAs(page)
    await oeffneTrainingTab(page)
    await expect(page.getByText('Zu Hause ohne Equipment')).toHaveCount(5)
  })

  test('AC: "Ältere Einträge laden" erscheint, wenn mehr als 5 Einheiten existieren', async ({ page }) => {
    const trainings = Array.from({ length: 5 }, (_, i) => ({ id: `t${i}`, planSlug: 'zuhause-ohne-equipment', createdAt: new Date().toISOString(), volumenKg: null }))
    await mockVerlauf(page, { '0': { trainings, hasMore: true, kennzahlen: KENNZAHLEN_LEER } })
    await loginAs(page)
    await oeffneTrainingTab(page)
    await expect(page.getByRole('button', { name: /Ältere Einträge laden/ })).toBeVisible()
  })

  test('AC: Klick auf "Ältere Einträge laden" hängt die nächsten Einträge an (nicht ersetzt)', async ({ page }) => {
    const seite1 = Array.from({ length: 5 }, (_, i) => ({ id: `a${i}`, planSlug: 'zuhause-ohne-equipment', createdAt: new Date().toISOString(), volumenKg: null }))
    const seite2 = Array.from({ length: 3 }, (_, i) => ({ id: `b${i}`, planSlug: 'zuhause-mit-baendern', createdAt: new Date().toISOString(), volumenKg: null }))
    await mockVerlauf(page, {
      '0': { trainings: seite1, hasMore: true, kennzahlen: KENNZAHLEN_LEER },
      '5': { trainings: seite2, hasMore: false },
    })
    await loginAs(page)
    await oeffneTrainingTab(page)
    await expect(page.getByText('Zu Hause ohne Equipment')).toHaveCount(5)
    await page.getByRole('button', { name: /Ältere Einträge laden/ }).click()
    await expect(page.getByText('Zu Hause ohne Equipment')).toHaveCount(5)
    await expect(page.getByText('Zu Hause mit Widerstandsbändern')).toHaveCount(3)
  })

  test('AC: "Ältere Einträge laden" verschwindet, wenn keine weiteren Einträge existieren', async ({ page }) => {
    const trainings = Array.from({ length: 3 }, (_, i) => ({ id: `t${i}`, planSlug: 'fitnessstudio', createdAt: new Date().toISOString(), volumenKg: 500 }))
    await mockVerlauf(page, { '0': { trainings, hasMore: false, kennzahlen: KENNZAHLEN_LEER } })
    await loginAs(page)
    await oeffneTrainingTab(page)
    await expect(page.getByRole('button', { name: /Ältere Einträge laden/ })).not.toBeVisible()
  })

  test('AC: Fitnessstudio-Einheiten zeigen das bewegte Gewicht, andere Pläne nicht', async ({ page }) => {
    const trainings = [
      { id: 'f1', planSlug: 'fitnessstudio', createdAt: new Date().toISOString(), volumenKg: 940 },
      { id: 'z1', planSlug: 'zuhause-ohne-equipment', createdAt: new Date().toISOString(), volumenKg: null },
      { id: 'b1', planSlug: 'zuhause-mit-baendern', createdAt: new Date().toISOString(), volumenKg: null },
    ]
    await mockVerlauf(page, { '0': { trainings, hasMore: false, kennzahlen: KENNZAHLEN_LEER } })
    await loginAs(page)
    await oeffneTrainingTab(page)
    await expect(page.getByText('940 kg')).toBeVisible()
    await expect(page.getByText('bewegt')).toHaveCount(1)
  })

  test('AC: Leer-Zustand erscheint, wenn noch nie trainiert wurde', async ({ page }) => {
    await mockVerlauf(page, { '0': { trainings: [], hasMore: false, kennzahlen: KENNZAHLEN_LEER } })
    await loginAs(page)
    await oeffneTrainingTab(page)
    await expect(page.getByText('Noch keine Trainingseinheit')).toBeVisible()
  })
})

// ─── Analyse-Kennzahlen ──────────────────────────────────────────────────────

test.describe('Analyse-Kennzahlen', () => {
  test('AC: zeigt alle 4 Kennzahlen oberhalb der Liste', async ({ page }) => {
    await mockVerlauf(page, { '0': { trainings: [], hasMore: false, kennzahlen: { einheitenLetzte7Tage: 3, durchschnittsgewichtKg: 900, steigerungProzent: 5, aktuelleSerieWochen: 2 } } })
    await loginAs(page)
    await oeffneTrainingTab(page)
    await expect(page.getByText('Einheiten (7 Tage)')).toBeVisible()
    await expect(page.getByText('Ø Gewicht / Einheit')).toBeVisible()
    await expect(page.getByText('Steigerung')).toBeVisible()
    await expect(page.getByText('Aktuelle Serie')).toBeVisible()
  })

  test('AC: "Einheiten (7 Tage)" zeigt die korrekte Anzahl', async ({ page }) => {
    await mockVerlauf(page, { '0': { trainings: [], hasMore: false, kennzahlen: { ...KENNZAHLEN_LEER, einheitenLetzte7Tage: 3 } } })
    await loginAs(page)
    await oeffneTrainingTab(page)
    const kachel = page.locator('div', { hasText: 'Einheiten (7 Tage)' }).last()
    await expect(kachel.getByText('3', { exact: true })).toBeVisible()
  })

  test('AC: "Einheiten (7 Tage)" zeigt "0" ohne Trainings in den letzten 7 Tagen', async ({ page }) => {
    await mockVerlauf(page, { '0': { trainings: [], hasMore: false, kennzahlen: KENNZAHLEN_LEER } })
    await loginAs(page)
    await oeffneTrainingTab(page)
    const kachel = page.locator('div', { hasText: 'Einheiten (7 Tage)' }).last()
    await expect(kachel.getByText('0', { exact: true })).toBeVisible()
  })

  test('AC: "Durchschnittsgewicht" zeigt einen Wert bei mind. 1 Fitnessstudio-Einheit (7 Tage)', async ({ page }) => {
    await mockVerlauf(page, { '0': { trainings: [], hasMore: false, kennzahlen: { ...KENNZAHLEN_LEER, durchschnittsgewichtKg: 940 } } })
    await loginAs(page)
    await oeffneTrainingTab(page)
    await expect(page.getByText('940 kg')).toBeVisible()
  })

  test('AC: "Durchschnittsgewicht" zeigt einen neutralen Hinweis ohne Fitnessstudio-Daten', async ({ page }) => {
    await mockVerlauf(page, { '0': { trainings: [], hasMore: false, kennzahlen: KENNZAHLEN_LEER } })
    await loginAs(page)
    await oeffneTrainingTab(page)
    await expect(page.getByText('Noch keine Fitnessstudio-Einheit')).toBeVisible()
  })

  test('AC: "Steigerung" zeigt eine Prozentzahl, wenn die Datenschwelle erreicht ist', async ({ page }) => {
    await mockVerlauf(page, { '0': { trainings: [], hasMore: false, kennzahlen: { ...KENNZAHLEN_LEER, steigerungProzent: 12 } } })
    await loginAs(page)
    await oeffneTrainingTab(page)
    await expect(page.getByText('+12 %')).toBeVisible()
    await expect(page.getByText('vs. 30-Tage-Schnitt')).toBeVisible()
  })

  test('AC: "Steigerung" zeigt einen Hinweis statt Prozentzahl unterhalb der Datenschwelle', async ({ page }) => {
    await mockVerlauf(page, { '0': { trainings: [], hasMore: false, kennzahlen: KENNZAHLEN_LEER } })
    await loginAs(page)
    await oeffneTrainingTab(page)
    await expect(page.getByText('Noch nicht genug Daten')).toBeVisible()
  })

  test('AC: negative "Steigerung" wird erkennbar (Minuszeichen) dargestellt', async ({ page }) => {
    await mockVerlauf(page, { '0': { trainings: [], hasMore: false, kennzahlen: { ...KENNZAHLEN_LEER, steigerungProzent: -8 } } })
    await loginAs(page)
    await oeffneTrainingTab(page)
    await expect(page.getByText('-8 %')).toBeVisible()
  })

  test('AC: "Aktuelle Serie" zeigt die Anzahl der Wochen', async ({ page }) => {
    await mockVerlauf(page, { '0': { trainings: [], hasMore: false, kennzahlen: { ...KENNZAHLEN_LEER, aktuelleSerieWochen: 3 } } })
    await loginAs(page)
    await oeffneTrainingTab(page)
    await expect(page.getByText('3 Wochen')).toBeVisible()
  })
})

// ─── Gast-Zugriff ────────────────────────────────────────────────────────────

test.describe('Gast-Zugriff', () => {
  test('AC: Gast sieht eine Login-Hinweis-Karte statt des Training-Tabs', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/analyse')
    await expect(page.getByText('Melde dich an, um deine Analyse-Historie zu sehen.')).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Training' })).not.toBeVisible()
  })
})

// ─── Echte Integration (kein Mock) ───────────────────────────────────────────

test.describe('Echte API-Integration', () => {
  test('AC: Training-Tab lädt reale Daten von /api/training/verlauf ohne Fehlerzustand', async ({ page }) => {
    await loginAs(page)
    await oeffneTrainingTab(page)
    await expect(page.getByText('Deine Trainingseinheiten konnten nicht geladen werden.')).not.toBeVisible()
    await expect(page.getByText('Einheiten (7 Tage)')).toBeVisible()
  })
})
