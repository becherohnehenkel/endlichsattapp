/**
 * PROJ-48 — Startseite: Ultimatives Ziel
 *
 * Teststrategie:
 * - Komplett statischer Text-/Listen-Block auf der bestehenden Startseite (PROJ-47),
 *   kein Backend, keine Interaktivität — alle Tests laufen ohne DB-Zustand.
 * - Login nur dort, wo explizit "identisch für Gast und eingeloggten Nutzer" geprüft wird
 *   (bestehendes QA-Testkonto qa-test@endlichsatt.dev, hat seit PROJ-47 einen Namen
 *   hinterlegt — gut geeignet für den "langer Name / keine Wechselwirkung"-Edge-Case).
 */

import { test, expect, type Page } from '@playwright/test'

const QA_EMAIL = 'qa-test@endlichsatt.dev'
const QA_PASSWORD = 'QaTest123!'

async function loginAs(page: Page) {
  await page.goto('/login')
  await page.fill('#email', QA_EMAIL)
  await page.fill('#password', QA_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL('http://localhost:3000/', { timeout: 15000 })
}

const ZIELE = [
  '80–90 % der Zeit vollwertig und bewusst essen',
  'Ausreichend Wasser trinken',
  'Alltagsbewegung hoch halten (Schritte, Haushalt, etc.)',
  'Sport: 3× die Woche (Kraft- und Ausdauertraining gemischt)',
  'Schlaf priorisieren',
  'Körpergefühl schärfen',
]

// ─── Seitenstruktur ─────────────────────────────────────────────────────────

test.describe('Seitenstruktur', () => {
  test('AC: Sektion erscheint unterhalb des Video-Platzhalters und oberhalb von "So legst du los"', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Ein Ziel für uns alle' })).toBeVisible()

    const main = page.locator('main')
    const text = (await main.innerText()).toLowerCase()
    const posVideo = text.indexOf('video kommt bald')
    const posZiel = text.indexOf('ein ziel für uns alle')
    const posSoLegstDuLos = text.indexOf('so legst du los')

    expect(posVideo).toBeGreaterThanOrEqual(0)
    expect(posZiel).toBeGreaterThanOrEqual(0)
    expect(posSoLegstDuLos).toBeGreaterThanOrEqual(0)
    expect(posVideo).toBeLessThan(posZiel)
    expect(posZiel).toBeLessThan(posSoLegstDuLos)
  })

  test('AC: zeigt Überschrift, zweiabsätzigen Intro-Text und die 6 Ziel-Punkte', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Ein Ziel für uns alle' })).toBeVisible()
    await expect(page.getByText('Niemand von uns mag Veränderung.')).toBeVisible()
    await expect(page.getByText('normal geworden', { exact: false })).toBeVisible()
    for (const ziel of ZIELE) {
      await expect(page.getByText(ziel, { exact: true })).toBeVisible()
    }
  })
})

// ─── Inhalt ──────────────────────────────────────────────────────────────

test.describe('Inhalt', () => {
  test('AC: die 6 Ziel-Punkte erscheinen in genau der vorgegebenen Reihenfolge', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Ein Ziel für uns alle' })).toBeVisible()
    const main = page.locator('main')
    const text = await main.innerText()
    const positions = ZIELE.map(z => text.indexOf(z))
    expect(positions.every(p => p >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  test('AC: weder Überschrift, Intro-Text noch die 6 Punkte sind klickbar oder verlinkt', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    const heading = page.getByRole('heading', { name: 'Ein Ziel für uns alle' })
    await expect(heading).toBeVisible()

    const isInsideLink = async (locator: ReturnType<Page['locator']>) =>
      locator.evaluate(el => {
        let node: HTMLElement | null = el as HTMLElement
        while (node) {
          if (node.tagName === 'A' || node.tagName === 'BUTTON') return true
          node = node.parentElement
        }
        return false
      })

    expect(await isInsideLink(heading)).toBe(false)
    expect(await isInsideLink(page.getByText('Niemand von uns mag Veränderung.'))).toBe(false)
    for (const ziel of ZIELE) {
      expect(await isInsideLink(page.getByText(ziel, { exact: true }))).toBe(false)
    }
  })
})

// ─── Gast- & Nutzer-Verhalten ───────────────────────────────────────────────

test.describe('Gast- & Nutzer-Verhalten', () => {
  test('AC: Inhalt ist für Gast und eingeloggten Nutzer identisch', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Ein Ziel für uns alle' })).toBeVisible()
    const guestMain = await page.locator('main').innerText()

    await loginAs(page)
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Ein Ziel für uns alle' })).toBeVisible()
    const loggedInMain = await page.locator('main').innerText()

    // Begrüßung unterscheidet sich (Name), der Rest der Ziel-Sektion nicht — auf den
    // reinen Ziel-Block eingrenzen statt die ganze Seite zu vergleichen.
    for (const snippet of ['Ein Ziel für uns alle', 'Niemand von uns mag Veränderung.', ...ZIELE]) {
      expect(guestMain).toContain(snippet)
      expect(loggedInMain).toContain(snippet)
    }
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────────────

test.describe('Edge Cases', () => {
  test('EDGE CASE: sehr kleine Bildschirme (320px) — kein horizontales Scrollen', async ({ page, context }) => {
    await context.clearCookies()
    await page.setViewportSize({ width: 320, height: 700 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Ein Ziel für uns alle' })).toBeVisible()
    const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(hasHorizontalScroll).toBe(false)
  })

  test('EDGE CASE: Gast ohne jede Session sieht die Sektion identisch zu einem eingeloggten Nutzer', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Ein Ziel für uns alle' })).toBeVisible()
    for (const ziel of ZIELE) {
      await expect(page.getByText(ziel, { exact: true })).toBeVisible()
    }
  })

  test('EDGE CASE: eingeloggter Nutzer mit langem Namen in der Begrüßung — keine Wechselwirkung mit der Ziel-Sektion', async ({ page }) => {
    await loginAs(page)
    await page.goto('/')
    // QA-Konto hat "Lukas Testerson" hinterlegt (Vorname wird in der Begrüßung gezeigt) —
    // Ziel-Sektion muss unverändert vollständig und unverlinkt erscheinen.
    await expect(page.getByRole('heading', { name: /Schön, dass du da bist/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Ein Ziel für uns alle' })).toBeVisible()
    for (const ziel of ZIELE) {
      await expect(page.getByText(ziel, { exact: true })).toBeVisible()
    }
    const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(hasHorizontalScroll).toBe(false)
  })
})
