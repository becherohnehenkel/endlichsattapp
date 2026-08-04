/**
 * PROJ-32 — Rezept aus gescannter Mahlzeit anlegen ("wie gescannt" / "mit mehr Sättigung")
 *
 * Nutzt zwei permanente Mahlzeit-Fixtures für qa-test@endlichsatt.dev (analog zum
 * PROJ-30-Rezept-Fixture-Muster — echte, dauerhafte Datensätze statt Mocks, da die
 * Vorbefüllung echte DB-Daten liest):
 *   - '44444444-4444-4444-4444-444444444444': vollständige Mahlzeit mit 2 Zutaten + 2
 *     Verbesserungsvorschlägen (für "Wie gescannt" UND "Mit mehr Sättigung")
 *   - '55555555-5555-5555-5555-555555555555': als Beilage analysiert (nur "Wie gescannt")
 *
 * Jeder Test, der ein Rezept speichert, räumt es am Ende selbst wieder auf (DELETE via API).
 */

import { test, expect, type Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'
const VOLLSTAENDIGE_MAHLZEIT_ID = '44444444-4444-4444-4444-444444444444'
const BEILAGE_MAHLZEIT_ID = '55555555-5555-5555-5555-555555555555'

async function loginAs(page: Page) {
  await page.goto('/login')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 8000 })
}

async function deleteRecipeViaApi(page: Page, id: string) {
  await page.evaluate(async (id) => { await fetch(`/api/rezepte/${id}`, { method: 'DELETE' }) }, id)
}

test.describe('Sichtbarkeit & Zugriff', () => {
  test('Vollständige Mahlzeit zeigt beide Buttons', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/mahlzeit/${VOLLSTAENDIGE_MAHLZEIT_ID}`)
    await expect(page.getByRole('link', { name: 'Wie gescannt' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Mit mehr Sättigung' })).toBeVisible()
  })

  test('Beilage zeigt nur "Wie gescannt", nicht "Mit mehr Sättigung"', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/mahlzeit/${BEILAGE_MAHLZEIT_ID}`)
    await expect(page.getByRole('link', { name: 'Wie gescannt' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Mit mehr Sättigung' })).toHaveCount(0)
  })

  test('Gast wird beim Versuch, ein Rezept aus einer Mahlzeit anzulegen, zur Registrierung aufgefordert', async ({ page }) => {
    await page.goto(`/rezept/neu?mealId=${VOLLSTAENDIGE_MAHLZEIT_ID}&variante=wie-gescannt`)
    await page.waitForURL(url => url.toString().includes('/konto'), { timeout: 5000 })
    await expect(page.getByText('Erstelle einen kostenlosen Account um eigene Rezepte anzulegen.')).toBeVisible()
  })
})

test.describe('"Wie gescannt"', () => {
  test('Formular ist mit Titel, Zutaten, Tags und Portion=1 vorausgefüllt', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/neu?mealId=${VOLLSTAENDIGE_MAHLZEIT_ID}&variante=wie-gescannt`)
    await page.waitForSelector('#title')

    await expect(page.locator('#title')).toHaveValue('QA-Test PROJ-32: Hähnchenbrust mit Reis')
    await expect(page.locator('#servings')).toHaveValue('1')
    await expect(page.locator('#ingredient_tags')).toHaveValue('hähnchenbrust, reis')
    await expect(page.locator('#instructions')).toHaveValue('Zutaten nach Belieben zubereiten.')

    const namen = await page.locator('input[placeholder="Name"]').evaluateAll(els => els.map(e => (e as HTMLInputElement).value))
    expect(namen).toEqual(['Hähnchenbrust', 'Reis'])
    const mengen = await page.locator('input[placeholder="Menge"]').evaluateAll(els => els.map(e => (e as HTMLInputElement).value))
    expect(mengen).toEqual(['200', '150'])
  })

  test('Rezept kann unverändert gespeichert werden und erscheint unter Eigene Rezepte', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/neu?mealId=${VOLLSTAENDIGE_MAHLZEIT_ID}&variante=wie-gescannt`)
    await page.waitForSelector('#title')
    await page.click('button[type="submit"]')

    await page.waitForURL(url => url.toString().includes('/rezept/') && !url.toString().includes('/neu'), { timeout: 8000 })
    const recipeId = page.url().split('/rezept/')[1]
    await expect(page.getByRole('heading', { name: 'QA-Test PROJ-32: Hähnchenbrust mit Reis' })).toBeVisible()

    await page.goto('/rezepte')
    await page.getByRole('button', { name: 'Eigene Rezepte' }).click()
    await expect(page.getByText('QA-Test PROJ-32: Hähnchenbrust mit Reis')).toBeVisible()

    await deleteRecipeViaApi(page, recipeId)
  })
})

test.describe('"Mit mehr Sättigung"', () => {
  test('Zutatenliste enthält zusätzlich eine leere Zeile pro Verbesserungsvorschlag', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/neu?mealId=${VOLLSTAENDIGE_MAHLZEIT_ID}&variante=mehr-saettigung`)
    await page.waitForSelector('#title')

    const namen = await page.locator('input[placeholder="Name"]').evaluateAll(els => els.map(e => (e as HTMLInputElement).value))
    expect(namen).toEqual([
      'Hähnchenbrust',
      'Reis',
      'Füge einen Klecks griechischen Joghurt hinzu',
      'Ergänze etwas Gurke',
    ])
    const mengen = await page.locator('input[placeholder="Menge"]').evaluateAll(els => els.map(e => (e as HTMLInputElement).value))
    expect(mengen).toEqual(['200', '150', '', ''])
  })

  test('Speichern ohne ausgefüllte Vorschlags-Menge schlägt fehl, mit ausgefüllter Menge gelingt es', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/neu?mealId=${VOLLSTAENDIGE_MAHLZEIT_ID}&variante=mehr-saettigung`)
    await page.waitForSelector('#title')

    // Ohne ausgefüllte Menge: Speichern schlägt fehl (Server-Validierung, amount muss positiv sein)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(500)
    expect(page.url()).toContain('/rezept/neu')

    // Jetzt beide Vorschlags-Zeilen ausfüllen
    const amountInputs = page.locator('input[placeholder="Menge"]')
    const unitInputs = page.locator('input[placeholder="Einheit"]')
    await amountInputs.nth(2).fill('50')
    await unitInputs.nth(2).fill('g')
    await amountInputs.nth(3).fill('1')
    await unitInputs.nth(3).fill('Stück')

    await page.click('button[type="submit"]')
    await page.waitForURL(url => url.toString().includes('/rezept/') && !url.toString().includes('/neu'), { timeout: 8000 })
    const recipeId = page.url().split('/rezept/')[1]
    await expect(page.getByText('Sättigungs-Bausteine')).toBeVisible()

    await deleteRecipeViaApi(page, recipeId)
  })
})

test.describe('Beilage', () => {
  test('"Wie gescannt" setzt den Rezept-Typ auf Beilage', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/neu?mealId=${BEILAGE_MAHLZEIT_ID}&variante=wie-gescannt`)
    await page.waitForSelector('#title')
    await expect(page.locator('#typ-beilage')).toBeChecked()
  })
})

test.describe('Sicherheit', () => {
  test('Fremde/ungültige mealId führt zu einem leeren Formular, kein Datenleck', async ({ page }) => {
    await loginAs(page)
    await page.goto('/rezept/neu?mealId=00000000-0000-0000-0000-000000000000&variante=wie-gescannt')
    await page.waitForSelector('#title')
    await expect(page.locator('#title')).toHaveValue('')
    await expect(page.locator('#servings')).toHaveValue('2')
    await expect(page.locator('input[placeholder="Name"]')).toHaveCount(1)
  })
})
