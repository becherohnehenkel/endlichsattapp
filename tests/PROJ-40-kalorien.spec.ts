/**
 * PROJ-40 — Kalorien
 *
 * Teststrategie:
 * - Seitenstruktur: Intro, 2 Bereiche (Was sind Kalorien / Die Makronährstoffe), 6 Punkte
 *   in der richtigen Reihenfolge, Breadcrumb.
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
  test('AC: zeigt den Intro-Text zu Kalorien', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien')
    await expect(page.getByText(/Kalorien und Makronährstoffe/)).toBeVisible()
  })

  test('AC: zeigt 2 Bereiche mit 6 Punkten in der richtigen Reihenfolge', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien')
    await expect(page.getByText('Die Makronährstoffe')).toBeVisible()
    const titel = [
      'Was sind Kalorien',
      'Proteine',
      'Kohlenhydrate',
      'Fette',
      'Ballaststoffe',
      'Alkohol',
    ]
    const positions: number[] = []
    for (const t of titel) {
      const box = await page.getByRole('button', { name: t }).boundingBox()
      expect(box).not.toBeNull()
      positions.push(box!.y)
    }
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  test('AC: Fortschrittsbalken startet bei "0 von 6 abgeschlossen"', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien')
    await expect(page.getByText('0 von 6 abgeschlossen')).toBeVisible()
  })

  test('AC: Breadcrumb "Ernährung / Kalorien" ist vorhanden', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/ernaehrung/kalorien')
    const breadcrumb = page.getByRole('navigation', { name: 'breadcrumb' })
    await expect(breadcrumb.getByRole('link', { name: 'Ernährung' })).toHaveAttribute('href', '/ernaehrung')
    await expect(breadcrumb.getByText('Kalorien', { exact: true })).toBeVisible()
  })

  test('AC: alle Punkte starten eingeklappt', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien')
    const trigger = page.getByRole('button', { name: 'Was sind Kalorien' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})

// ─── Arbeitspunkte-Inhalte ───────────────────────────────────────────────────

test.describe('Arbeitspunkte-Inhalte', () => {
  test('AC: "Was sind Kalorien" zeigt die 5 nummerierten Kernaussagen und verlinkt auf "So geht abnehmen"', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien')
    await oeffneArbeitspunkt(page, 'Was sind Kalorien')
    const items = page.locator('main ol li')
    await expect(items).toHaveCount(5)
    await expect(items.nth(1)).toContainText('14,5 °C auf 15,5 °C')
    const link = page.getByRole('link', { name: /Zum Kcal-Rechner/ })
    await expect(link).toHaveAttribute('href', '/ernaehrung/so-geht-abnehmen')
  })

  test('AC: "Proteine" zeigt kcal/g, Rolle im Körper, Aminosäuren-Erklärung und alle 3 Prozent-Stufen der Quellen-Übersicht', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien')
    await oeffneArbeitspunkt(page, 'Proteine')
    await expect(page.getByText(/1g Protein = ca\. 4 kcal/)).toBeVisible()
    await expect(page.getByText(/Baustein — für Muskulatur/)).toBeVisible()
    await expect(page.getByText(/Aminosäuren/).first()).toBeVisible()
    await expect(page.getByText(/wenig Lysin/)).toBeVisible()

    await expect(page.getByText('40 % Proteinanteil')).toBeVisible()
    await expect(page.getByText(/Thunfisch, magerer Fisch \(Kabeljau\)/)).toBeVisible()
    await expect(page.getByText('30 % Proteinanteil')).toBeVisible()
    await expect(page.getByText(/Hüttenkäse, Parmesan, Vollei/)).toBeVisible()
    await expect(page.getByText('20 % Proteinanteil')).toBeVisible()
    await expect(page.getByText(/Kichererbsen, Kürbiskerne/)).toBeVisible()
  })

  test('AC: "Kohlenhydrate" zeigt kcal/g, Rolle im Körper und ein konkretes Beispiel', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien')
    await oeffneArbeitspunkt(page, 'Kohlenhydrate')
    await expect(page.getByText(/1g Kohlenhydrate = ca\. 4 kcal/)).toBeVisible()
    await expect(page.getByText(/schnellster Energielieferant/)).toBeVisible()
    await expect(page.getByText(/Banane, Dattel, Marmeladenbrot/)).toBeVisible()
  })

  test('AC: "Fette" zeigt kcal/g, Rolle im Körper und ein konkretes Beispiel', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien')
    await oeffneArbeitspunkt(page, 'Fette')
    await expect(page.getByText(/1g Fett = ca\. 9 kcal/)).toBeVisible()
    await expect(page.getByText(/fettlösliche Vitamine/)).toBeVisible()
    await expect(page.getByText(/Olivenöl, Leinöl, Rapsöl/)).toBeVisible()
  })

  test('AC: "Ballaststoffe" zeigt Rolle im Körper und Quellen', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien')
    await oeffneArbeitspunkt(page, 'Ballaststoffe')
    await expect(page.getByText(/unverdauliche, sehr lange Kohlenhydratketten/)).toBeVisible()
    await expect(page.getByText(/Vollkornprodukte, Hülsenfrüchte/)).toBeVisible()
  })

  test('AC: "Alkohol" zeigt kcal/g und die Einordnung', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien')
    await oeffneArbeitspunkt(page, 'Alkohol')
    await expect(page.getByText(/1g Alkohol = 7 kcal/)).toBeVisible()
    await expect(page.getByText(/Nervengift/)).toBeVisible()
    await expect(page.getByText(/Prost/)).toBeVisible()
  })
})

// ─── Ein-/Ausklappen & Fortschritt ───────────────────────────────────────────

test.describe('Ein-/Ausklappen & Fortschritt', () => {
  test('AC: Aufklappen eines Punkts lässt andere unberührt (unabhängiges Verhalten)', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien')
    await oeffneArbeitspunkt(page, 'Proteine')
    await expect(page.getByRole('button', { name: 'Proteine' })).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('button', { name: 'Kohlenhydrate' })).toHaveAttribute('aria-expanded', 'false')
  })

  test('AC: "Verstanden" markiert einen Punkt als erledigt, aktualisiert den Fortschritt und bleibt nach Reload erhalten', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien')
    await oeffneArbeitspunkt(page, 'Was sind Kalorien')
    await page.getByRole('button', { name: 'Verstanden', exact: true }).click()
    await expect(page.getByText('1 von 6 abgeschlossen')).toBeVisible()

    await page.reload()
    await expect(page.getByText('1 von 6 abgeschlossen')).toBeVisible()
  })

  test('AC: Alle 6 Punkte als "Verstanden" markiert zeigt den "Alles durch"-Hinweis', async ({ page }) => {
    await page.goto('/ernaehrung/kalorien')
    for (const titel of ['Was sind Kalorien', 'Proteine', 'Kohlenhydrate', 'Fette', 'Ballaststoffe', 'Alkohol']) {
      await oeffneArbeitspunkt(page, titel)
      await page.getByRole('button', { name: titel }).locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]').getByRole('button', { name: 'Verstanden', exact: true }).click()
    }
    await expect(page.getByText('6 von 6 abgeschlossen')).toBeVisible()
    await expect(page.getByText('Alles durch ✓')).toBeVisible()
  })
})

// ─── Gast-Zugriff (reiner statischer Inhalt) ────────────────────────────────

test.describe('Gast-Zugriff', () => {
  test('AC: Gast (keine Session) kann die Seite ohne Login vollständig lesen', async ({ page, context }) => {
    await context.clearCookies()
    const response = await page.goto('/ernaehrung/kalorien')
    expect(response?.status()).toBeLessThan(400)
    await expect(page.getByText(/Kalorien und Makronährstoffe/)).toBeVisible()
  })
})
