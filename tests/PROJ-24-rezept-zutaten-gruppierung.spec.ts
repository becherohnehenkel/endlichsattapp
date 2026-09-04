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
 *     DB-Daten, kein Mock)
 *   - API-Validierung (Backend, Vitest — siehe src/app/api/admin/rezepte/*.test.ts)
 *
 * Der Admin-Editor selbst (Drag-Reorder, Gruppe hinzufügen/löschen, leere-Gruppe-
 * Validierung) wurde manuell vom Product Owner im Dev-Server getestet und per
 * direkter DB-Abfrage verifiziert. Siehe QA-Ergebnisse im Feature-Spec für Details
 * je Kriterium.
 *
 * Referenz-Rezept: "Spitzhkohl Erdnuss Nudeln" (echtes, admin-editiertes Rezept,
 * kein eigens angelegtes Test-Fixture) — 5 ungruppierte Zutaten, dann Gruppe
 * "Dressing" mit 4 Zutaten. Deckt beide Fälle (ungruppiert + gruppiert) in einem
 * echten Rezept ab.
 */

import { test, expect, type Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'
// "Spitzhkohl Erdnuss Nudeln" — echtes Rezept mit ungruppierten Zutaten vor der
// ersten Überschrift und einer "Dressing"-Gruppe danach.
const GROUPED_RECIPE_ID = 'fe8e05ab-af68-4e61-b8fd-6ead79b5e4e3'
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
    await page.goto(`/rezept/${GROUPED_RECIPE_ID}`)
    // Matcht auf die Gruppen-Überschrift-Struktur statt exaktem Text — das Rezept wird vom
    // Admin weiter bearbeitet, konkrete Gruppennamen sollen die Tests nicht verbindlich machen.
    const gruppenUeberschriften = page.locator('p.uppercase.tracking-wide')
    await expect(gruppenUeberschriften.first()).toBeVisible()
    expect(await gruppenUeberschriften.count()).toBeGreaterThanOrEqual(1)
    await expect(page.getByText('Honig')).toBeVisible()
  })

  test('umschließt jede Gruppe (Überschrift + Zutaten) mit einem Rahmen (PROJ-24 Refinement)', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/${GROUPED_RECIPE_ID}`)
    const ersteGruppenBox = page.locator('p.uppercase.tracking-wide').first().locator('..')
    await expect(ersteGruppenBox).toHaveClass(/border/)
  })

  test('zeigt ungruppierte Zutaten vor der ersten Überschrift ohne Heading', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/${GROUPED_RECIPE_ID}`)
    await expect(page.getByText('Spitzkohl roh')).toBeVisible()
  })

  test('Rezept ohne Gruppen zeigt weiterhin die klassische flache Zutatenliste (Regression)', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/${UNGROUPED_RECIPE_ID}`)
    await expect(page.getByRole('heading', { name: 'Fenchelsalat' })).toBeVisible()
    await expect(page.getByText('Gemüsefenchel')).toBeVisible()
  })
})

// ─── Öffentliche Anzeige: Punktlinie zwischen Zutat und Menge (Refinement 2026-09-04) ──

test.describe('Rezept-Detailseite: Punktlinie Zutat → Menge', () => {
  test('jede Zutaten-Zeile hat eine gepunktete Trennlinie zwischen Name und Menge', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/${UNGROUPED_RECIPE_ID}`)
    const zeilen = page.locator('li').filter({ has: page.locator('.border-dotted') })
    expect(await zeilen.count()).toBeGreaterThan(0)
  })

  test('die Punktlinie sitzt horizontal zwischen dem Zutat-Namen und der Mengenangabe', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/${UNGROUPED_RECIPE_ID}`)
    const ersteZeile = page.locator('li').filter({ has: page.locator('.border-dotted') }).first()
    await expect(ersteZeile).toBeVisible()
    const name = ersteZeile.locator('span').first()
    const linie = ersteZeile.locator('.border-dotted')
    const menge = ersteZeile.locator('span').last()

    const nameBox = await name.boundingBox()
    const linieBox = await linie.boundingBox()
    const mengeBox = await menge.boundingBox()
    expect(nameBox).not.toBeNull()
    expect(linieBox).not.toBeNull()
    expect(mengeBox).not.toBeNull()
    expect(linieBox!.x).toBeGreaterThanOrEqual(nameBox!.x + nameBox!.width - 1)
    expect(mengeBox!.x).toBeGreaterThanOrEqual(linieBox!.x + linieBox!.width - 1)
  })

  test('sehr lange Zutat-Namen laufen nicht über den Bildschirmrand hinaus (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 })
    await loginAs(page)
    await page.goto(`/rezept/${GROUPED_RECIPE_ID}`)
    const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(hasHScroll).toBe(false)
  })
})

// ─── Öffentliche Anzeige: Markdown-Formatierung in der Zubereitung (PROJ-24 Refinement) ─
//
// Bewusst KEIN Test, der sich auf konkrete Formatierungs-Marker im aktuellen Text eines
// echten Rezepts verlässt: Das Referenz-Rezept wird vom Admin fortlaufend live bearbeitet
// (siehe QA-Notiz) — ein zuvor dort vorhandenes "*Nudeln*" wurde zwischen /frontend und /qa
// bereits wieder entfernt. Ein dediziertes QA-Fixture dafür ist ausdrücklich nicht gewünscht
// (siehe Product Decision zur Entfernung des früheren "QA-Fixture PROJ-24"-Rezepts). Die
// Parser-Korrektheit (fett/kursiv/unterstrichen inkl. XSS-Sicherheit) ist stattdessen über
// 7 Unit-Tests in src/lib/format-rezept-text.test.tsx abgedeckt; hier wird nur inhaltsunabhängig
// geprüft, dass niemals rohe "**"-Marker im gerenderten Text sichtbar bleiben.

test.describe('Rezept-Detailseite: Markdown-Formatierung in der Zubereitung', () => {
  test('zeigt niemals rohe "**"-Formatierungsmarker im sichtbaren Zubereitungstext', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/${GROUPED_RECIPE_ID}`)
    const zubereitung = page.locator('h2', { hasText: 'Zubereitung' }).locator('..').locator('p')
    await expect(zubereitung).toBeVisible()
    const zubereitungsText = await zubereitung.textContent()
    expect(zubereitungsText).not.toContain('**')
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
    await page.goto(`/admin/rezepte/${GROUPED_RECIPE_ID}/bearbeiten`)
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

  test(`PUT /${GROUPED_RECIPE_ID} unauthenticated → 401`, async ({ page }) => {
    const res = await page.request.put(`/api/admin/rezepte/${GROUPED_RECIPE_ID}`, { data: {} })
    expect(res.status()).toBe(401)
  })

  test(`PUT /${GROUPED_RECIPE_ID} nicht-Admin → 403`, async ({ page }) => {
    await loginAs(page)
    const res = await page.request.put(`/api/admin/rezepte/${GROUPED_RECIPE_ID}`, { data: {} })
    expect(res.status()).toBe(403)
  })
})
