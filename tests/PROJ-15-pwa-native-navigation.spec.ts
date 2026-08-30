/**
 * PROJ-15 — PWA & Native Navigation
 *
 * Teststrategie:
 * - PWA-Infrastruktur: Manifest, sw.js und Icons erreichbar
 * - Bottom Navigation (data-testid="bottom-nav"): Mobile-Tests auf beiden Projekten
 * - Top Navigation (data-testid="top-nav"): nur chromium (Desktop-Viewport ist bei isMobile:true unzuverlässig)
 * - Navigation ausgeblendet auf /login, /registrieren, /upgrade, /admin/*
 *
 * Hrefs/Item-Set 2026-08-30 im Zuge von PROJ-35 aktualisiert (Start/Ernährung/Analyse/
 * Training/Check-In statt Start/Analyse/Rezepte/Historie/Konto) — siehe
 * features/PROJ-35-bottom-navigation-kontobereich.md.
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

// ─── PWA-Infrastruktur ────────────────────────────────────────────────────────

test.describe('PWA-Infrastruktur', () => {
  test('manifest.json ist erreichbar und enthält alle Pflichtfelder', async ({ request }) => {
    const response = await request.get('/manifest.json')
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.name).toBe('Mehralsabnehmen')
    expect(body.start_url).toBe('/')
    expect(body.display).toBe('standalone')
    expect(body.theme_color).toBe('#2E9E6B')
    expect(Array.isArray(body.icons)).toBe(true)
    expect(body.icons.length).toBeGreaterThanOrEqual(2)
  })

  test('service worker (sw.js) ist erreichbar', async ({ request }) => {
    const response = await request.get('/sw.js')
    expect(response.status()).toBe(200)
    const text = await response.text()
    expect(text).toContain('endlichsatt')
  })

  test('icon-192.png und icon-512.png sind erreichbar', async ({ request }) => {
    const [r192, r512] = await Promise.all([
      request.get('/icon-192.png'),
      request.get('/icon-512.png'),
    ])
    expect(r192.status()).toBe(200)
    expect(r512.status()).toBe(200)
  })

  test('apple-touch-icon.png ist erreichbar', async ({ request }) => {
    const response = await request.get('/apple-touch-icon.png')
    expect(response.status()).toBe(200)
  })

  test('manifest-Link ist im <head> der App vorhanden', async ({ page }) => {
    await page.goto('/login')
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json')
  })

  test('apple-touch-icon-Link ist im <head> vorhanden', async ({ page }) => {
    await page.goto('/login')
    const appleIcon = page.locator('link[rel="apple-touch-icon"]')
    await expect(appleIcon).toHaveAttribute('href', '/apple-touch-icon.png')
  })
})

// ─── Bottom Navigation (Mobile) ───────────────────────────────────────────────

test.describe('Bottom Navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('eingeloggter Nutzer sieht Bottom Navigation auf Startseite', async ({ page }) => {
    await loginAs(page)
    await page.goto('/')
    await expect(page.locator('[data-testid="bottom-nav"]')).toBeVisible()
  })

  test('Bottom Navigation enthält alle 5 Standard-Tabs', async ({ page }) => {
    await loginAs(page)
    await page.goto('/')
    const nav = page.locator('[data-testid="bottom-nav"]')
    await expect(nav.locator('a[href="/"]')).toBeVisible()
    await expect(nav.locator('a[href="/ernaehrung"]')).toBeVisible()
    await expect(nav.locator('a[href="/analyse"]')).toBeVisible()
    await expect(nav.locator('a[href="/training"]')).toBeVisible()
    await expect(nav.locator('a[href="/check-in"]')).toBeVisible()
  })

  test('Bottom Navigation enthält kein Konto- oder Admin-Icon (PROJ-35)', async ({ page }) => {
    await loginAs(page)
    await page.goto('/')
    const nav = page.locator('[data-testid="bottom-nav"]')
    await expect(nav.locator('a[href="/konto"]')).toHaveCount(0)
    await expect(nav.locator('a[href="/admin"]')).toHaveCount(0)
  })

  test('aktiver Tab (Startseite) ist hervorgehoben', async ({ page }) => {
    await loginAs(page)
    await page.goto('/')
    const homeLink = page.locator('[data-testid="bottom-nav"] a[href="/"]')
    await expect(homeLink).toHaveClass(/text-\[#2E9E6B\]/)
  })

  test('aktiver Tab wechselt beim Navigieren zu /ernaehrung', async ({ page }) => {
    await loginAs(page)
    await page.goto('/ernaehrung')
    const ernaehrungLink = page.locator('[data-testid="bottom-nav"] a[href="/ernaehrung"]')
    await expect(ernaehrungLink).toHaveClass(/text-\[#2E9E6B\]/)
  })

  test('Bottom Navigation ist auf Sub-Seite /konto sichtbar', async ({ page }) => {
    await loginAs(page)
    await page.goto('/konto')
    await expect(page.locator('[data-testid="bottom-nav"]')).toBeVisible()
  })

  test('keine Bottom Navigation auf /login (nicht eingeloggt)', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('[data-testid="bottom-nav"]')).not.toBeVisible()
  })

  test('keine Bottom Navigation auf /upgrade', async ({ page }) => {
    await loginAs(page)
    await page.goto('/upgrade')
    await expect(page.locator('[data-testid="bottom-nav"]')).not.toBeVisible()
  })

  test('keine Bottom Navigation auf /admin', async ({ page }) => {
    await loginAs(page)
    await page.goto('/admin')
    await expect(page.locator('[data-testid="bottom-nav"]')).not.toBeVisible()
  })

  test('keine Bottom Navigation auf /registrieren', async ({ page }) => {
    await page.goto('/registrieren')
    await expect(page.locator('[data-testid="bottom-nav"]')).not.toBeVisible()
  })
})

// ─── Top Navigation (Desktop, nur chromium) ───────────────────────────────────

test.describe('Top Navigation', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  // Desktop-Nav-Tests nur auf chromium ausführen (Mobile Chrome hat isMobile:true)
  test('eingeloggter Nutzer sieht Top Navigation auf Startseite @chromium', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Desktop-Test nur auf chromium')
    await loginAs(page)
    await page.goto('/')
    await expect(page.locator('[data-testid="top-nav"]')).toBeVisible()
    await expect(page.locator('[data-testid="top-nav"]').locator('text=Mehralsabnehmen')).toBeVisible()
  })

  test('Top Navigation enthält alle Standard-Links', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Desktop-Test nur auf chromium')
    await loginAs(page)
    await page.goto('/')
    // Nav-Links sind im <nav> innerhalb des Headers — Logo-Link (/) separat davon
    const navLinks = page.locator('[data-testid="top-nav"] nav')
    await expect(navLinks.locator('a[href="/"]')).toBeVisible()
    await expect(navLinks.locator('a[href="/ernaehrung"]')).toBeVisible()
    await expect(navLinks.locator('a[href="/analyse"]')).toBeVisible()
    await expect(navLinks.locator('a[href="/training"]')).toBeVisible()
    await expect(navLinks.locator('a[href="/check-in"]')).toBeVisible()
    // Konto-Link (PROJ-35) liegt außerhalb des <nav>-Item-Loops, direkt im Header
    await expect(navLinks.locator('a[href="/konto"]')).toHaveCount(0)
    await expect(page.locator('[data-testid="top-nav"] a[href="/konto"]')).toBeVisible()
  })

  test('aktiver Link (/ernaehrung) ist in Top Navigation hervorgehoben', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Desktop-Test nur auf chromium')
    await loginAs(page)
    await page.goto('/ernaehrung')
    const ernaehrungLink = page.locator('[data-testid="top-nav"] a[href="/ernaehrung"]')
    await expect(ernaehrungLink).toHaveClass(/bg-\[#DFF0F2\]/)
  })

  test('keine Top Navigation auf /login', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Desktop-Test nur auf chromium')
    await page.goto('/login')
    await expect(page.locator('[data-testid="top-nav"]')).not.toBeVisible()
  })

  test('keine Top Navigation auf /admin', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Desktop-Test nur auf chromium')
    await loginAs(page)
    await page.goto('/admin')
    await expect(page.locator('[data-testid="top-nav"]')).not.toBeVisible()
  })

  test('kein Admin-Link in Top Navigation für normalen Nutzer', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Desktop-Test nur auf chromium')
    await loginAs(page)
    await page.goto('/')
    await expect(page.locator('[data-testid="top-nav"] a[href="/admin"]')).not.toBeVisible()
  })
})
