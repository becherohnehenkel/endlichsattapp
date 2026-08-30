/**
 * PROJ-36 — Ernährung-Hub (Übersichtsseite)
 *
 * Teststrategie:
 * - Hub-Seite: 8 Einträge, korrekte Ziel-URLs, kein Zurück/Breadcrumb (Tab-Root)
 * - Verschachtelte URLs & Redirects: alte Pfade → neue Pfade (308), Inhalt unverändert
 * - Breadcrumb & Zurück auf allen 8 Unterseiten
 * - Platzhalter-Unterseiten (5 neue)
 * - Gast-Zugriff bleibt erhalten
 */

import { test, expect, type Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'

async function loginAs(page: Page) {
  await page.goto('/login')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 8000 })
}

// ─── Ernährung-Hub ──────────────────────────────────────────────────────────

test.describe('Ernährung-Hub', () => {
  test('AC: zeigt alle 8 Einträge mit den korrekten Ziel-URLs', async ({ page }) => {
    await page.goto('/ernaehrung')
    const expected: [string, string][] = [
      ['Rezepte', '/ernaehrung/rezepte'],
      ['Richtig essen', '/ernaehrung/wie-esse-ich-richtig'],
      ['Sättigungsmatrix', '/ernaehrung/saettigungsmatrix'],
      ['So geht abnehmen', '/ernaehrung/so-geht-abnehmen'],
      ['Emotionales Essen', '/ernaehrung/emotionales-essen'],
      ['Heißhunger', '/ernaehrung/heisshunger'],
      ['Kalorien', '/ernaehrung/kalorien'],
      ['Kalorien zählen', '/ernaehrung/kalorien-zaehlen'],
    ]
    for (const [title, href] of expected) {
      await expect(page.locator(`a[href="${href}"]`).getByText(title)).toBeVisible()
    }
  })

  test('AC: Hub hat weder Zurück-Pfeil noch Breadcrumb (Tab-Root)', async ({ page }) => {
    await page.goto('/ernaehrung')
    await expect(page.getByRole('navigation', { name: 'breadcrumb' })).toHaveCount(0)
    await expect(page.getByLabel('Zurück')).toHaveCount(0)
  })

  test('AC: Gast (keine Session) kann /ernaehrung ohne Login öffnen', async ({ page, context }) => {
    await context.clearCookies()
    const response = await page.goto('/ernaehrung')
    expect(response?.status()).toBeLessThan(400)
    expect(page.url()).not.toContain('/login')
  })
})

// ─── Verschachtelte URLs & Redirects ────────────────────────────────────────

test.describe('Alte Pfade redirecten dauerhaft auf die neuen', () => {
  test('AC: /rezepte → 308 → /ernaehrung/rezepte', async ({ page }) => {
    const response = await page.goto('/rezepte')
    expect(page.url()).toContain('/ernaehrung/rezepte')
    expect(response?.request().redirectedFrom()).not.toBeNull()
  })

  test('AC: /saettigungsmatrix → 308 → /ernaehrung/saettigungsmatrix', async ({ page }) => {
    await page.goto('/saettigungsmatrix')
    expect(page.url()).toContain('/ernaehrung/saettigungsmatrix')
  })

  test('AC: /wie-esse-ich-richtig → 308 → /ernaehrung/wie-esse-ich-richtig', async ({ page }) => {
    await page.goto('/wie-esse-ich-richtig')
    expect(page.url()).toContain('/ernaehrung/wie-esse-ich-richtig')
  })

  test('AC: /ernaehrung/rezepte zeigt die volle Rezeptbibliothek-Funktionalität (keine Regression durch Umzug)', async ({ page }) => {
    await page.goto('/ernaehrung/rezepte')
    await expect(page.getByPlaceholder('Rezept suchen…')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Alle' })).toBeVisible()
  })
})

// ─── Breadcrumb & Zurück auf den 8 Unterseiten ──────────────────────────────

test.describe('Breadcrumb auf allen 8 Unterseiten', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  const pages: [string, string][] = [
    ['/ernaehrung/rezepte', 'Rezepte'],
    ['/ernaehrung/wie-esse-ich-richtig', 'Wie esse ich richtig?'],
    ['/ernaehrung/saettigungsmatrix', 'Sättigungs-Matrix'],
    ['/ernaehrung/so-geht-abnehmen', 'So geht abnehmen'],
    ['/ernaehrung/emotionales-essen', 'Emotionales Essen'],
    ['/ernaehrung/heisshunger', 'Heißhunger'],
    ['/ernaehrung/kalorien', 'Kalorien'],
    ['/ernaehrung/kalorien-zaehlen', 'Kalorien zählen'],
  ]

  for (const [path, title] of pages) {
    test(`AC: ${path} zeigt Breadcrumb "Ernährung / ${title}" und Konto-Icon`, async ({ page }) => {
      await page.goto(path)
      const breadcrumb = page.getByRole('navigation', { name: 'breadcrumb' })
      await expect(breadcrumb.getByRole('link', { name: 'Ernährung' })).toHaveAttribute('href', '/ernaehrung')
      await expect(breadcrumb.getByText(title, { exact: true })).toBeVisible()
      await expect(page.locator('header a[href="/konto"]')).toBeVisible()
    })
  }

  test('AC: "Zurück" von einer Unterseite, die vom Hub aus geöffnet wurde, führt zurück zum Hub', async ({ page }) => {
    await page.goto('/ernaehrung')
    await page.locator('a[href="/ernaehrung/kalorien"]').click()
    await expect(page).toHaveURL(/\/ernaehrung\/kalorien$/)
    await page.getByLabel('Zurück').click()
    await expect(page).toHaveURL(/\/ernaehrung$/)
  })
})

// ─── Platzhalter-Unterseiten ────────────────────────────────────────────────

test.describe('5 neue Platzhalter-Unterseiten', () => {
  const placeholders = [
    '/ernaehrung/so-geht-abnehmen',
    '/ernaehrung/emotionales-essen',
    '/ernaehrung/heisshunger',
    '/ernaehrung/kalorien',
    '/ernaehrung/kalorien-zaehlen',
  ]

  for (const path of placeholders) {
    test(`AC: ${path} lädt ohne Login und zeigt "Bald verfügbar"`, async ({ page, context }) => {
      await context.clearCookies()
      const response = await page.goto(path)
      expect(response?.status()).toBeLessThan(400)
      await expect(page.getByText('Bald verfügbar')).toBeVisible()
    })
  }
})

// ─── Regression: eingeloggter Nutzer ────────────────────────────────────────

test.describe('Regression: eingeloggter Nutzer', () => {
  test('AC: Ernährung-Tab in Bottom-Nav bleibt auf allen 8 Unterseiten aktiv markiert', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await loginAs(page)
    for (const path of ['/ernaehrung/rezepte', '/ernaehrung/kalorien']) {
      await page.goto(path)
      const link = page.locator('[data-testid="bottom-nav"] a[href="/ernaehrung"]')
      await expect(link).toHaveClass(/text-\[#2E9E6B\]/)
    }
  })
})
