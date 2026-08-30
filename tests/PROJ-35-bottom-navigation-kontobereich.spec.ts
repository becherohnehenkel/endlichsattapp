/**
 * PROJ-35 — Bottom-Navigation & Kontobereich-Neuordnung
 *
 * Teststrategie:
 * - Nav-Struktur (Start/Ernährung/Analyse/Training/Check-In) — Kern-Assertions
 *   für Hrefs/Reihenfolge/Admin-Ausschluss liegen bereits in
 *   tests/PROJ-15-pwa-native-navigation.spec.ts (dort im Zuge von PROJ-35 aktualisiert).
 * - Diese Datei deckt die PROJ-35-spezifischen neuen Routen und das
 *   Gast-Verhalten ab: /ernaehrung (Alias), /training, /check-in (Platzhalter).
 */

import { test, expect, type Page, type BrowserContext } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'

async function clearSession(context: BrowserContext) {
  await context.clearCookies()
}

async function loginAs(page: Page) {
  await page.goto('/login')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 8000 })
}

// ─── /ernaehrung: temporärer Alias auf /rezepte ────────────────────────────

test.describe('/ernaehrung zeigt vorübergehend den Rezepte-Inhalt', () => {
  test('AC: /ernaehrung rendert dieselbe Rezeptbibliothek wie /rezepte, URL bleibt /ernaehrung', async ({ page }) => {
    await page.goto('/ernaehrung')
    expect(page.url()).toContain('/ernaehrung')
    await expect(page.getByPlaceholder('Rezept suchen…')).toBeVisible()
  })

  test('AC: Ernährung-Tab in Bottom-Nav ist auf /ernaehrung aktiv markiert', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await loginAs(page)
    await page.goto('/ernaehrung')
    const link = page.locator('[data-testid="bottom-nav"] a[href="/ernaehrung"]')
    await expect(link).toHaveClass(/text-\[#2E9E6B\]/)
  })
})

// ─── /training und /check-in: bewusst leere Platzhalterseiten ─────────────

test.describe('Training und Check-In: Platzhalterseiten statt 404', () => {
  test('AC: /training ist ohne Login erreichbar und zeigt "Bald verfügbar"', async ({ page, context }) => {
    await clearSession(context)
    const response = await page.goto('/training')
    expect(response?.status()).toBeLessThan(400)
    await expect(page.getByText('Bald verfügbar')).toBeVisible()
  })

  test('AC: /check-in ist ohne Login erreichbar und zeigt "Bald verfügbar"', async ({ page, context }) => {
    await clearSession(context)
    const response = await page.goto('/check-in')
    expect(response?.status()).toBeLessThan(400)
    await expect(page.getByText('Bald verfügbar')).toBeVisible()
  })

  test('AC: Training-Tab in Bottom-Nav ist auf /training aktiv markiert', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await loginAs(page)
    await page.goto('/training')
    const link = page.locator('[data-testid="bottom-nav"] a[href="/training"]')
    await expect(link).toHaveClass(/text-\[#2E9E6B\]/)
  })

  test('AC: Check-In-Tab in Bottom-Nav ist auf /check-in aktiv markiert', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await loginAs(page)
    await page.goto('/check-in')
    const link = page.locator('[data-testid="bottom-nav"] a[href="/check-in"]')
    await expect(link).toHaveClass(/text-\[#2E9E6B\]/)
  })
})

// ─── Konto-Icon auf Mobile: Seiten-Header statt globaler Leiste ───────────

test.describe('Konto-Icon oben rechts auf Mobile (bestehendes Seiten-Header-Muster)', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('AC: /training zeigt Konto-Icon im mobilen Seiten-Header', async ({ page }) => {
    await page.goto('/training')
    await expect(page.locator('header a[href="/konto"]')).toBeVisible()
  })

  test('AC: /check-in zeigt Konto-Icon im mobilen Seiten-Header', async ({ page }) => {
    await page.goto('/check-in')
    await expect(page.locator('header a[href="/konto"]')).toBeVisible()
  })
})

// ─── Gast-Verhalten: alle Tabs sichtbar, Konto führt zum Conversion-Screen ─

test.describe('Gast-Modus (PROJ-19) bleibt mit neuer Nav-Struktur intakt', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('AC: Gast sieht alle 5 Tabs uneingeschränkt (kein Lock-Icon)', async ({ page, context }) => {
    await clearSession(context)
    // Anonyme Session entsteht client-seitig erst beim Besuch von /analyse (AnonSignInInit) —
    // ohne Session ist die Nav grundsätzlich ausgeblendet (siehe navigation-shell.tsx).
    await page.goto('/analyse')
    await page.waitForSelector('text=Was hast du gegessen?', { timeout: 8000 })
    await page.goto('/')
    const nav = page.locator('[data-testid="bottom-nav"]')
    await expect(nav).toBeVisible()
    await expect(nav.locator('a[href="/"]')).toBeVisible()
    await expect(nav.locator('a[href="/ernaehrung"]')).toBeVisible()
    await expect(nav.locator('a[href="/analyse"]')).toBeVisible()
    await expect(nav.locator('a[href="/training"]')).toBeVisible()
    await expect(nav.locator('a[href="/check-in"]')).toBeVisible()
    await expect(nav.locator('[aria-label*="gesperrt"], [aria-label*="lock"]')).toHaveCount(0)
  })

  test('AC: Gast tippt Konto-Icon im Seiten-Header → Conversion-Screen (nicht KontoView)', async ({ page, context }) => {
    await clearSession(context)
    await page.goto('/')
    await page.locator('header a[href="/konto"]').click()
    await expect(page).toHaveURL(/\/konto/)
    await expect(page.getByText('Kostenlos registrieren')).toBeVisible()
  })

  test('AC: Gast tippt Training/Check-In → normale Platzhalterseite, kein Conversion-Screen', async ({ page, context }) => {
    await clearSession(context)
    await page.goto('/check-in')
    await expect(page.getByText('Bald verfügbar')).toBeVisible()
    expect(page.url()).toContain('/check-in')
  })
})

// ─── Regression: eingeloggter Nutzer, Desktop Top-Nav ─────────────────────

test.describe('Regression: eingeloggter Nutzer', () => {
  test('AC: /ernaehrung, /training, /check-in sind auch eingeloggt erreichbar', async ({ page }) => {
    await loginAs(page)
    for (const path of ['/ernaehrung', '/training', '/check-in']) {
      const response = await page.goto(path)
      expect(response?.status()).toBeLessThan(400)
    }
  })
})
