/**
 * PROJ-31 — Nutzer legen eigene Rezepte an
 *
 * Nutzt denselben permanenten E2E-Testnutzer wie PROJ-30 (qa-test@endlichsatt.dev).
 * Dieser Account hat einen eingelösten Invite-Code (voller Zugriff, kein 5-Rezepte-Limit) —
 * das 5-Rezepte-Limit selbst ist deshalb NICHT Teil dieser Suite (würde den dauerhaften
 * Account-Zustand verändern müssen) und wird stattdessen durch die Vitest-Suiten
 * (src/lib/paywall.test.ts, src/app/api/rezepte/route.test.ts) sowie eine manuelle
 * QA-Verifikation mit temporärem Zugriffs-Flag abgedeckt (siehe Feature-Spec, QA-Abschnitt).
 *
 * Jeder Test, der ein Rezept anlegt, räumt es am Ende selbst wieder auf (DELETE via API),
 * damit die Suite wiederholt lauffähig bleibt und den permanenten PROJ-30-Fixture-Datensatz
 * (owner_id = Testnutzer, "QA-Test: Privates Rezept PROJ-30") nicht beeinflusst.
 */

import { test, expect, type Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'
// Offizielles (nicht-eigenes) Rezept — owner_id ist NULL
const OFFICIAL_RECIPE_ID = '54112aab-769c-44ca-8aff-3c8843be1cb9'

async function loginAs(page: Page) {
  await page.goto('/login')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 8000 })
}

async function createRecipeViaApi(page: Page, title: string) {
  return page.evaluate(async (title) => {
    const res = await fetch('/api/rezepte', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        servings: 2,
        cook_time_minutes: 10,
        total_time_minutes: 15,
        instructions: 'Alles vermischen und servieren.',
        ingredient_tags: ['testzutat'],
        cuisine_tags: [],
        ingredients: [{ item_type: 'zutat', name: 'Testzutat', amount: 100, unit: 'g' }],
      }),
    })
    return { status: res.status, body: await res.json() }
  }, title)
}

async function deleteRecipeViaApi(page: Page, id: string) {
  await page.evaluate(async (id) => {
    await fetch(`/api/rezepte/${id}`, { method: 'DELETE' })
  }, id)
}

test.describe('Zugriff & Einstiegspunkt', () => {
  test('Gast wird bei /rezept/neu zur Registrierung aufgefordert', async ({ page }) => {
    await page.goto('/rezept/neu')
    await page.waitForURL(url => url.toString().includes('/konto'), { timeout: 5000 })
    await expect(page.getByText('Erstelle einen kostenlosen Account um eigene Rezepte anzulegen.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Kostenlos registrieren' })).toBeVisible()
  })

  test('Eingeloggter Nutzer sieht "+ Rezept anlegen" im "Eigene Rezepte"-Filter', async ({ page }) => {
    await loginAs(page)
    await page.goto('/rezepte')
    await page.getByRole('button', { name: 'Eigene Rezepte' }).click()
    await expect(page.getByRole('link', { name: 'Eigenes Rezept anlegen' })).toBeVisible()
  })

  // BUG-1-Regressionstest (gefunden bei der PROJ-31-QA, behoben 2026-08-04): der Button war
  // zunächst nur im "Eigene Rezepte"-Filter sichtbar, obwohl die Acceptance Criteria auch
  // "Alle Rezepte" verlangt.
  test('"+ Rezept anlegen" ist auch im "Alle Rezepte"-Filter sichtbar, aber nicht in "Lukas\' Rezepte"', async ({ page }) => {
    await loginAs(page)
    await page.goto('/rezepte')
    await expect(page.getByRole('link', { name: 'Eigenes Rezept anlegen' })).toBeVisible()

    await page.getByRole('button', { name: "Lukas' Rezepte" }).click()
    await expect(page.getByRole('link', { name: 'Eigenes Rezept anlegen' })).toHaveCount(0)
  })
})

test.describe('Anlegen, Bearbeiten, Löschen', () => {
  test('Nutzer kann ein eigenes Rezept anlegen — erscheint unter "Eigene Rezepte" mit Sättigungs-Matrix', async ({ page }) => {
    await loginAs(page)
    await page.goto('/rezept/neu')
    await page.waitForSelector('#title')

    await page.fill('#title', 'QA-Test E2E: Neues Rezept')
    await page.fill('#servings', '2')
    await page.fill('#cook_time_minutes', '10')
    await page.fill('#total_time_minutes', '15')
    await page.fill('input[placeholder="Name"]', 'Testzutat')
    await page.fill('input[placeholder="Menge"]', '100')
    await page.fill('input[placeholder="Einheit"]', 'g')
    await page.fill('#ingredient_tags', 'testzutat')
    await page.fill('#instructions', 'Alles vermischen und servieren.')
    await page.click('button[type="submit"]')

    await page.waitForURL(url => url.toString().includes('/rezept/') && !url.toString().includes('/neu'), { timeout: 8000 })
    const recipeId = page.url().split('/rezept/')[1]

    await expect(page.getByRole('heading', { name: 'QA-Test E2E: Neues Rezept' })).toBeVisible()
    await expect(page.getByText('Sättigungs-Bausteine')).toBeVisible()

    await page.goto('/rezepte')
    await page.getByRole('button', { name: 'Eigene Rezepte' }).click()
    await expect(page.getByText('QA-Test E2E: Neues Rezept')).toBeVisible()

    await deleteRecipeViaApi(page, recipeId)
  })

  test('Nutzer kann ein eigenes Rezept bearbeiten', async ({ page }) => {
    await loginAs(page)
    const created = await createRecipeViaApi(page, 'QA-Test E2E: Vor dem Bearbeiten')
    const recipeId = created.body.id as string

    await page.goto(`/rezept/${recipeId}/bearbeiten`)
    await page.waitForSelector('#title')
    await page.fill('#title', 'QA-Test E2E: Nach dem Bearbeiten')
    await page.click('button[type="submit"]')

    await page.waitForURL(`/rezept/${recipeId}`, { timeout: 8000 })
    await expect(page.getByRole('heading', { name: 'QA-Test E2E: Nach dem Bearbeiten' })).toBeVisible()

    await deleteRecipeViaApi(page, recipeId)
  })

  test('Löschen zeigt eine Bestätigung, bevor das Rezept endgültig entfernt wird', async ({ page }) => {
    await loginAs(page)
    const created = await createRecipeViaApi(page, 'QA-Test E2E: Löschen-Dialog')
    const recipeId = created.body.id as string

    await page.goto(`/rezept/${recipeId}`)
    await page.getByRole('button', { name: 'Löschen' }).click()
    await expect(page.getByText('Rezept löschen?')).toBeVisible()

    // Abbrechen -> Rezept bleibt bestehen
    await page.getByRole('button', { name: 'Abbrechen' }).click()
    await expect(page.getByText('Rezept löschen?')).toHaveCount(0)

    // Endgültig löschen
    await page.getByRole('button', { name: 'Löschen' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Löschen' }).click()
    await page.waitForURL(url => url.toString().includes('/rezepte'), { timeout: 8000 })
  })

  test('Nutzer kann ein fremdes (offizielles) Rezept nicht bearbeiten oder löschen', async ({ page }) => {
    await loginAs(page)

    const putRes = await page.evaluate(async (id) => {
      const res = await fetch(`/api/rezepte/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'HACKED', servings: 1, cook_time_minutes: 1, total_time_minutes: 1,
          instructions: 'x', ingredient_tags: ['x'], cuisine_tags: [],
          ingredients: [{ item_type: 'zutat', name: 'x', amount: 1, unit: 'g' }],
        }),
      })
      return res.status
    }, OFFICIAL_RECIPE_ID)
    expect(putRes).toBe(403)

    const deleteRes = await page.evaluate(async (id) => {
      const res = await fetch(`/api/rezepte/${id}`, { method: 'DELETE' })
      return res.status
    }, OFFICIAL_RECIPE_ID)
    expect(deleteRes).toBe(403)

    // Rezept ist unverändert erreichbar
    await page.goto(`/rezept/${OFFICIAL_RECIPE_ID}`)
    await expect(page.getByText('HACKED')).toHaveCount(0)
    // Kein Bearbeiten/Löschen-UI für ein fremdes Rezept
    await expect(page.getByRole('link', { name: 'Bearbeiten' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Löschen' })).toHaveCount(0)
  })
})

test.describe('Sicherheit', () => {
  test('Unauthentifizierte API-Aufrufe werden abgelehnt (401)', async ({ page }) => {
    await page.goto('/login')
    const status = await page.evaluate(async () => {
      const res = await fetch('/api/rezepte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'x', servings: 1, cook_time_minutes: 1, total_time_minutes: 1,
          instructions: 'x', ingredient_tags: ['x'], cuisine_tags: [],
          ingredients: [{ item_type: 'zutat', name: 'x', amount: 1, unit: 'g' }],
        }),
      })
      return res.status
    })
    expect(status).toBe(401)
  })

  test('Rezept-Titel mit HTML-ähnlichem Inhalt wird als Text angezeigt, nicht ausgeführt', async ({ page }) => {
    await loginAs(page)
    const xssTitle = '<img src=x onerror=alert(1)>'
    const created = await createRecipeViaApi(page, xssTitle)
    const recipeId = created.body.id as string

    await page.goto(`/rezept/${recipeId}`)
    await expect(page.getByRole('heading', { name: xssTitle })).toBeVisible()
    const hasRawImgTag = await page.evaluate(() => document.body.innerHTML.includes('<img src=x onerror'))
    expect(hasRawImgTag).toBe(false)

    await deleteRecipeViaApi(page, recipeId)
  })
})
