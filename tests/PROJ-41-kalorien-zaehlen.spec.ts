/**
 * PROJ-41 — Kalorien zählen
 *
 * Teststrategie:
 * - Seitenstruktur: Intro, 2 flache Punkte in der richtigen Reihenfolge, Breadcrumb.
 * - Accordion-Verhalten (gemeinsame ArbeitspunkteListe): alle Punkte starten eingeklappt,
 *   unabhängig auf-/zuklappbar, "Verstanden"-Toggle aktualisiert den Fortschrittsbalken.
 * - Reiner statischer Inhalt, kein Login nötig — keine Backend-Abhängigkeit.
 */

import { test, expect, type Page } from '@playwright/test'

async function oeffneArbeitspunkt(page: Page, titel: string) {
  const trigger = page.getByRole('button', { name: titel })
  const expanded = await trigger.getAttribute('aria-expanded')
  if (expanded !== 'true') {
    await trigger.click()
  }
}

// ─── Seitenstruktur ─────────────────────────────────────────────────────────

test.describe('Seitenstruktur', () => {
  test('AC: zeigt den Intro-Text', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien-zaehlen')
    await expect(page.getByText(/Kalorienzählen ist ein Werkzeug auf Zeit/)).toBeVisible()
  })

  test('AC: zeigt 2 Punkte in der richtigen Reihenfolge', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien-zaehlen')
    const main = page.locator('main')
    const text = await main.innerText()
    const titel = ['Warum zählen wir Kalorien?', 'Das Wichtigste beim Kalorienzählen: das Aufhören']
    const positions = titel.map(t => text.indexOf(t))
    expect(positions.every(p => p >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  test('AC: Fortschrittsbalken startet bei "0 von 2 abgeschlossen"', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien-zaehlen')
    await expect(page.getByText('0 von 2 abgeschlossen')).toBeVisible()
  })

  test('AC: Breadcrumb "Ernährung / Kalorien zählen" ist vorhanden', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/ernaehrung/kalorien-zaehlen')
    const breadcrumb = page.getByRole('navigation', { name: 'breadcrumb' })
    await expect(breadcrumb.getByRole('link', { name: 'Ernährung' })).toHaveAttribute('href', '/ernaehrung')
    await expect(breadcrumb.getByText('Kalorien zählen', { exact: true })).toBeVisible()
  })

  test('AC: beide Punkte starten eingeklappt', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien-zaehlen')
    const trigger = page.getByRole('button', { name: 'Warum zählen wir Kalorien?' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})

// ─── Arbeitspunkte-Inhalte ───────────────────────────────────────────────────

test.describe('Arbeitspunkte-Inhalte', () => {
  test('AC: "Warum zählen wir Kalorien?" zeigt alle 3 Gründe als hervorgehobene Liste mit den 3 Erkenntnis-Fragen', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien-zaehlen')
    await oeffneArbeitspunkt(page, 'Warum zählen wir Kalorien?')
    await expect(page.getByText('Abnehmen mit Plan')).toBeVisible()
    await expect(page.getByText('Nährstoffe verstehen')).toBeVisible()
    await expect(page.getByText('Deinen Körper kennenlernen')).toBeVisible()
    await expect(page.getByText('Wie lange bin ich mit welcher Mahlzeit satt?')).toBeVisible()
    await expect(page.getByText('Was tut mir gut?')).toBeVisible()
    await expect(page.getByText(/Woher bekommt mein Körper die Energie/)).toBeVisible()
  })

  test('AC: "Warum zählen wir Kalorien?" verlinkt auf den Kcal-Rechner und die Makronährstoffe', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien-zaehlen')
    await oeffneArbeitspunkt(page, 'Warum zählen wir Kalorien?')
    await expect(page.getByRole('link', { name: /Zum Kcal-Rechner/ })).toHaveAttribute('href', '/ernaehrung/so-geht-abnehmen')
    await expect(page.getByRole('link', { name: /Zu den Makronährstoffen/ })).toHaveAttribute('href', '/ernaehrung/kalorien')
  })

  test('AC: "Das Aufhören" zeigt die Stützräder-Analogie und die Jetzt-vs-Zukunft-Grafik', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien-zaehlen')
    await oeffneArbeitspunkt(page, 'Das Wichtigste beim Kalorienzählen: das Aufhören')
    await expect(page.getByText(/Fahrradfahren mit Stützrädern/)).toBeVisible()
    await expect(page.getByText('So isst du jetzt')).toBeVisible()
    await expect(page.getByText('So wirst du in Zukunft essen')).toBeVisible()
  })

  test('AC: "Das Aufhören" zeigt den Ausstiegs-Fahrplan und den Stress-Tag-Hinweis', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien-zaehlen')
    await oeffneArbeitspunkt(page, 'Das Wichtigste beim Kalorienzählen: das Aufhören')
    await expect(page.getByText(/2–3 Monaten aufmerksamem Zählen/)).toBeVisible()
    await expect(page.getByText(/Wohlfühlgewicht/)).toBeVisible()
    await expect(page.getByText(/überfordert oder gestresst/)).toBeVisible()
  })
})

// ─── Ein-/Ausklappen & Fortschritt ───────────────────────────────────────────

test.describe('Ein-/Ausklappen & Fortschritt', () => {
  test('AC: Aufklappen eines Punkts lässt den anderen unberührt (unabhängiges Verhalten)', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien-zaehlen')
    await oeffneArbeitspunkt(page, 'Warum zählen wir Kalorien?')
    await expect(page.getByRole('button', { name: 'Warum zählen wir Kalorien?' })).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('button', { name: 'Das Wichtigste beim Kalorienzählen: das Aufhören' })).toHaveAttribute('aria-expanded', 'false')
  })

  test('AC: "Verstanden" markiert einen Punkt als erledigt, aktualisiert den Fortschritt und bleibt nach Reload erhalten', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien-zaehlen')
    await oeffneArbeitspunkt(page, 'Warum zählen wir Kalorien?')
    await page.getByRole('button', { name: 'Verstanden', exact: true }).click()
    await expect(page.getByText('1 von 2 abgeschlossen')).toBeVisible()

    await page.reload()
    await expect(page.getByText('1 von 2 abgeschlossen')).toBeVisible()
  })

  test('AC: Beide Punkte als "Verstanden" markiert zeigen den "Alles durch"-Hinweis', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien-zaehlen')
    for (const titel of ['Warum zählen wir Kalorien?', 'Das Wichtigste beim Kalorienzählen: das Aufhören']) {
      await oeffneArbeitspunkt(page, titel)
      await page.getByRole('button', { name: titel }).locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]').getByRole('button', { name: 'Verstanden', exact: true }).click()
    }
    await expect(page.getByText('2 von 2 abgeschlossen')).toBeVisible()
    await expect(page.getByText('Alles durch ✓')).toBeVisible()
  })
})

// ─── Gast-Zugriff (reiner statischer Inhalt) ────────────────────────────────

test.describe('Gast-Zugriff', () => {
  test('AC: Gast (keine Session) kann die Seite ohne Login vollständig lesen', async ({ page, context }) => {
    await context.clearCookies()
    const response = await page.goto('/ernaehrung/kalorien-zaehlen')
    expect(response?.status()).toBeLessThan(400)
    await expect(page.getByText(/Kalorienzählen ist ein Werkzeug auf Zeit/)).toBeVisible()
  })
})
