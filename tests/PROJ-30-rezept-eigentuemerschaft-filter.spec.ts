/**
 * PROJ-30 — Rezept-Eigentümerschaft & Filter
 *
 * Anders als beim Admin-Rezept-Editor (PROJ-24/PROJ-29) sind /rezepte und /rezept/[id]
 * öffentliche bzw. nutzerseitige Routen — der reguläre E2E-Testnutzer (qa-test@endlichsatt.dev)
 * reicht hier aus, kein Admin-Zugang nötig.
 *
 * Ein privates Test-Rezept wurde vor diesem Testlauf per SQL direkt für den Testnutzer
 * angelegt (id 'c5e87274-db3a-427d-bc69-175a96371b8e', owner_id = Testnutzer-ID) — es gibt
 * noch keine UI zum Anlegen eigener Rezepte (kommt erst mit PROJ-31), daher dieser Weg für
 * einen echten Cross-User-Sichtbarkeitstest.
 */

import { test, expect, type Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'
const OWN_RECIPE_ID = 'c5e87274-db3a-427d-bc69-175a96371b8e'
const OWN_RECIPE_TITLE = 'QA-Test: Privates Rezept PROJ-30'

async function loginAs(page: Page) {
  await page.goto('/login')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 8000 })
}

test.describe('Gast (nicht eingeloggt)', () => {
  test('sieht keine Eigentümer-Filter-Leiste auf der Rezepte-Seite', async ({ page }) => {
    await page.goto('/rezepte')
    await expect(page.getByRole('button', { name: 'Eigene Rezepte' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: "Lukas' Rezepte" })).toHaveCount(0)
  })

  test('kann ein fremdes privates Rezept nicht über die Bibliothek finden', async ({ page }) => {
    await page.goto('/rezepte')
    await expect(page.getByText(OWN_RECIPE_TITLE)).toHaveCount(0)
  })

  test('bekommt 404 beim direkten Aufruf der URL eines fremden privaten Rezepts', async ({ page }) => {
    const response = await page.goto(`/rezept/${OWN_RECIPE_ID}`)
    // BUG-2-Fix (QA 2026-09-03): notFound() setzt den HTTP-Status im Next.js/Turbopack
    // Dev-Server nicht zuverlässig auf 404 (bestätigt: im Produktions-Build — `next build`
    // + `next start` — ist der Status korrekt 404). Da diese Suite gegen den Dev-Server läuft,
    // wird hier zusätzlich geprüft, dass der Rezeptinhalt NICHT geleakt wird (die eigentliche
    // sicherheitsrelevante Garantie) und stattdessen die Not-Found-Seite erscheint.
    await expect(page.getByText('This page could not be found')).toBeVisible()
    await expect(page.getByText(OWN_RECIPE_TITLE)).not.toBeVisible()
    expect([200, 404]).toContain(response?.status())
  })
})

test.describe('Eingeloggter Nutzer', () => {
  test('sieht die Eigentümer-Filter-Leiste mit allen drei Optionen', async ({ page }) => {
    await loginAs(page)
    await page.goto('/rezepte')
    await expect(page.getByRole('button', { name: 'Alle Rezepte' })).toBeVisible()
    await expect(page.getByRole('button', { name: "Lukas' Rezepte" })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Eigene Rezepte' })).toBeVisible()
  })

  test('"Alle Rezepte" (Standard) zeigt das eigene private Rezept mit an', async ({ page }) => {
    await loginAs(page)
    await page.goto('/rezepte')
    await expect(page.getByText(OWN_RECIPE_TITLE)).toBeVisible()
  })

  test('"Eigene Rezepte" zeigt das eigene private Rezept', async ({ page }) => {
    await loginAs(page)
    await page.goto('/rezepte')
    await page.getByRole('button', { name: 'Eigene Rezepte' }).click()
    await expect(page.getByText(OWN_RECIPE_TITLE)).toBeVisible()
  })

  test('"Lukas\' Rezepte" blendet das eigene private Rezept aus', async ({ page }) => {
    await loginAs(page)
    await page.goto('/rezepte')
    await page.getByRole('button', { name: "Lukas' Rezepte" }).click()
    await expect(page.getByText(OWN_RECIPE_TITLE)).toHaveCount(0)
  })

  test('kann das eigene private Rezept direkt über die URL öffnen', async ({ page }) => {
    await loginAs(page)
    const response = await page.goto(`/rezept/${OWN_RECIPE_ID}`)
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { name: OWN_RECIPE_TITLE })).toBeVisible()
  })
})
