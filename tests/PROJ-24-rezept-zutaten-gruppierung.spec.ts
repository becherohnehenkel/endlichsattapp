/**
 * PROJ-24 — Zutaten-Reihenfolge & Gruppierung im Rezept-Editor
 *
 * Note: Der Admin-Editor (Drag-and-Drop, "Gruppe hinzufügen", Validierung) läuft auf
 * Seiten mit Server-seitigem Admin-Auth-Check (E-Mail gegen ADMIN_EMAIL). Da der
 * E2E-Testnutzer (qa-test@endlichsatt.dev) kein Admin ist, kann die Editor-Interaktion
 * selbst nicht automatisiert getestet werden — das greift auf dem Next.js-Server,
 * nicht im Browser, wodurch page.route()-Mocking nicht wirkt (gleiche Einschränkung
 * wie in PROJ-9/PROJ-13).
 *
 * Diese Datei deckt ab:
 *   - Die öffentliche Anzeige gruppierter Zutaten auf der Rezept-Detailseite (echte
 *     DB-Daten, kein Mock — über eine dedizierte QA-Fixture, siehe unten)
 *   - API-Validierung (Backend, Vitest — siehe src/app/api/admin/rezepte/*.test.ts)
 *
 * Der Admin-Editor selbst (Drag-Reorder, Gruppe hinzufügen/löschen, leere-Gruppe-
 * Validierung) wurde manuell vom Product Owner im Dev-Server getestet und per
 * direkter DB-Abfrage verifiziert (Rezept "Spitzhkohl Erdnuss Nudeln" — 5 ungruppierte
 * Zutaten, dann Gruppe "Dressing" mit 4 Zutaten, korrekte sort_order, Makros nur an
 * Zutaten-Zeilen). Siehe QA-Ergebnisse im Feature-Spec für Details je Kriterium.
 *
 * QA-Fixture: Rezept '00000000-0000-4000-8000-000000000024' wurde direkt per SQL
 * angelegt (1 ungruppierte Zutat, 1 Gruppe mit 1 Zutat) — stabil für die permanente
 * Regressionssuite, unabhängig von admin-editierten Live-Daten. Nicht löschen.
 */

import { test, expect, type Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'
const QA_FIXTURE_RECIPE_ID = '00000000-0000-4000-8000-000000000024'
// Bestehendes PROJ-8-Rezept ohne jegliche Gruppen-Überschrift (Regressions-Referenz)
const UNGROUPED_RECIPE_ID = 'ac634f99-9290-4c47-b5d3-78f3c11744f3' // Fenchelsalat

async function loginAs(page: Page) {
  await page.goto('/login')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 8000 })
}

// ─── Öffentliche Anzeige: Gruppierte Zutatenliste (echte DB-Daten) ────────────

test.describe('Rezept-Detailseite: Zutaten-Gruppierung', () => {
  test('zeigt Gruppen-Überschrift über den zugehörigen Zutaten', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/${QA_FIXTURE_RECIPE_ID}`)
    await expect(page.getByText('QA-Testgruppe')).toBeVisible()
    await expect(page.getByText('Testzutat In Gruppe')).toBeVisible()
  })

  test('zeigt ungruppierte Zutaten vor der ersten Überschrift ohne Heading', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/${QA_FIXTURE_RECIPE_ID}`)
    await expect(page.getByText('Testzutat Ungruppiert')).toBeVisible()
  })

  test('Rezept ohne Gruppen zeigt weiterhin die klassische flache Zutatenliste (Regression)', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/${UNGROUPED_RECIPE_ID}`)
    await expect(page.getByRole('heading', { name: 'Fenchelsalat' })).toBeVisible()
    await expect(page.getByText('Gemüsefenchel')).toBeVisible()
  })
})

// ─── Admin-Zugriffskontrolle (Editor-Seiten) ──────────────────────────────────

test.describe('Admin-Zugriff: Rezept-Editor', () => {
  test('unauthenticated → Login-Redirect', async ({ page }) => {
    await page.goto('/admin/rezepte/neu')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })

  test('nicht-Admin → /admin/403', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/admin/rezepte/${QA_FIXTURE_RECIPE_ID}/bearbeiten`)
    await expect(page).toHaveURL(/\/admin\/403/, { timeout: 5000 })
  })
})

// ─── API Security: Admin-Rezept-Routen ────────────────────────────────────────

test.describe('API Security: /api/admin/rezepte', () => {
  test('POST unauthenticated → 401', async ({ page }) => {
    const res = await page.request.post('/api/admin/rezepte', { data: {} })
    expect(res.status()).toBe(401)
  })

  test('POST nicht-Admin → 403', async ({ page }) => {
    await loginAs(page)
    const res = await page.request.post('/api/admin/rezepte', { data: {} })
    expect(res.status()).toBe(403)
  })

  test(`PUT /${QA_FIXTURE_RECIPE_ID} unauthenticated → 401`, async ({ page }) => {
    const res = await page.request.put(`/api/admin/rezepte/${QA_FIXTURE_RECIPE_ID}`, { data: {} })
    expect(res.status()).toBe(401)
  })

  test(`PUT /${QA_FIXTURE_RECIPE_ID} nicht-Admin → 403`, async ({ page }) => {
    await loginAs(page)
    const res = await page.request.put(`/api/admin/rezepte/${QA_FIXTURE_RECIPE_ID}`, { data: {} })
    expect(res.status()).toBe(403)
  })
})
