/**
 * PROJ-43 — Training-Übersicht (Krafttraining-Basics)
 *
 * Teststrategie:
 * - Seitenstruktur: Überschrift, Intro, 5 Grundlagen-Arbeitspunkte, 3 Plan-Karten,
 *   jeweils in der richtigen Reihenfolge.
 * - Accordion-Verhalten (gemeinsame ArbeitspunkteListe): alle Punkte starten eingeklappt,
 *   erster Punkt öffnet automatisch, "Verstanden"-Toggle aktualisiert den Fortschrittsbalken.
 * - Plan-Karten: korrekte Ziel-Hrefs (Detailseiten folgen erst mit PROJ-44).
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
  test('AC: zeigt Überschrift und Intro-Text', async ({ page }) => {
    await page.goto('/training')
    await expect(page.getByRole('heading', { name: 'Krafttraining: Die Basics für deinen Start' })).toBeVisible()
    await expect(page.getByText(/Du musst kein Gym-Profi werden/)).toBeVisible()
  })

  test('AC: zeigt 5 Grundlagen-Punkte und 3 Plan-Karten in der richtigen Reihenfolge', async ({ page }) => {
    await page.goto('/training')
    const main = page.locator('main')
    // ArbeitspunkteListe rendert erst nach dem Client-Mount (Hydration) — auf den ersten
    // Trigger warten, bevor der Text-Snapshot gelesen wird, sonst ist die Liste noch leer.
    await page.getByRole('button', { name: 'Warum Krafttraining?' }).waitFor()
    const text = await main.innerText()
    const titel = [
      'Warum Krafttraining?',
      'Was bedeutet was?',
      'Warm-Up',
      'Das richtige Gewicht',
      'Richtig steigern',
      'Zu Hause ohne Equipment',
      'Zu Hause mit Widerstandsbändern',
      'Fitnessstudio',
    ]
    const positions = titel.map(t => text.indexOf(t))
    expect(positions.every(p => p >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  test('AC: Fortschrittsbalken startet bei "0 von 5 abgeschlossen"', async ({ page }) => {
    await page.goto('/training')
    await expect(page.getByText('0 von 5 abgeschlossen')).toBeVisible()
  })

  test('AC: alle Arbeitspunkte starten eingeklappt', async ({ page }) => {
    await page.goto('/training')
    const trigger = page.getByRole('button', { name: 'Warum Krafttraining?' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('AC: erster Arbeitspunkt öffnet sich automatisch', async ({ page }) => {
    await page.goto('/training')
    const trigger = page.getByRole('button', { name: 'Warum Krafttraining?' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'true', { timeout: 2000 })
  })
})

// ─── Arbeitspunkte-Inhalte ───────────────────────────────────────────────────

test.describe('Arbeitspunkte-Inhalte', () => {
  test('AC: "Warum Krafttraining?" zeigt die Stoffwechsel-Erklärung', async ({ page }) => {
    await page.goto('/training')
    await oeffneArbeitspunkt(page, 'Warum Krafttraining?')
    await expect(page.getByText(/Stoffwechsel-Booster/)).toBeVisible()
  })

  test('AC: "Was bedeutet was?" zeigt alle 5 Begriffe', async ({ page }) => {
    await page.goto('/training')
    await oeffneArbeitspunkt(page, 'Was bedeutet was?')
    await expect(page.getByText('Wiederholung (Wdh):')).toBeVisible()
    await expect(page.getByText('Satz:')).toBeVisible()
    await expect(page.getByText('Kg:')).toBeVisible()
    await expect(page.getByText('Pause:')).toBeVisible()
    await expect(page.getByText('Stange/Gerät:')).toBeVisible()
  })

  test('AC: "Warm-Up" zeigt die 5-10-Minuten-Erklärung', async ({ page }) => {
    await page.goto('/training')
    await oeffneArbeitspunkt(page, 'Warm-Up')
    await expect(page.getByText(/5–10 Minuten locker bewegen/)).toBeVisible()
  })

  test('AC: "Das richtige Gewicht" zeigt die Faustregel', async ({ page }) => {
    await page.goto('/training')
    await oeffneArbeitspunkt(page, 'Das richtige Gewicht')
    await expect(page.getByText(/Ego bleibt in der Umkleide/)).toBeVisible()
  })

  test('AC: "Richtig steigern" zeigt die Steigerungs-Schritte', async ({ page }) => {
    await page.goto('/training')
    await oeffneArbeitspunkt(page, 'Richtig steigern')
    await expect(page.getByText(/2,5 kg bei großen Übungen/)).toBeVisible()
  })
})

// ─── Ein-/Ausklappen & Fortschritt ───────────────────────────────────────────

test.describe('Ein-/Ausklappen & Fortschritt', () => {
  test('AC: Aufklappen eines Punkts lässt andere unberührt (unabhängiges Verhalten)', async ({ page }) => {
    await page.goto('/training')
    await oeffneArbeitspunkt(page, 'Warm-Up')
    await expect(page.getByRole('button', { name: 'Warm-Up' })).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('button', { name: 'Das richtige Gewicht' })).toHaveAttribute('aria-expanded', 'false')
  })

  test('AC: "Verstanden" markiert einen Punkt als erledigt, aktualisiert den Fortschritt und bleibt nach Reload erhalten', async ({ page }) => {
    await page.goto('/training')
    await oeffneArbeitspunkt(page, 'Warum Krafttraining?')
    const punktContainer = page.getByRole('button', { name: 'Warum Krafttraining?' })
      .locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]')
    await punktContainer.getByRole('button', { name: 'Verstanden' }).click()
    await expect(page.getByText('1 von 5 abgeschlossen')).toBeVisible()

    await page.reload()
    await expect(page.getByText('1 von 5 abgeschlossen')).toBeVisible()
  })

  test('AC: alle 5 Punkte als "Verstanden" markiert zeigt den "Alles durch"-Hinweis', async ({ page }) => {
    await page.goto('/training')
    const titel = ['Warum Krafttraining?', 'Was bedeutet was?', 'Warm-Up', 'Das richtige Gewicht', 'Richtig steigern']
    for (const t of titel) {
      await oeffneArbeitspunkt(page, t)
      await page.getByRole('button', { name: t }).locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]').getByRole('button', { name: 'Verstanden', exact: true }).click()
    }
    await expect(page.getByText('5 von 5 abgeschlossen')).toBeVisible()
    await expect(page.getByText(/Alles durch/)).toBeVisible()
  })
})

// ─── Plan-Karten ─────────────────────────────────────────────────────────────

test.describe('Plan-Karten', () => {
  test('AC: 3 Plan-Karten mit Titel und Unterzeile sichtbar', async ({ page }) => {
    await page.goto('/training')
    await expect(page.getByText('Zu Hause ohne Equipment')).toBeVisible()
    await expect(page.getByText('Bodyweight, ganz ohne Geräte')).toBeVisible()
    await expect(page.getByText('Zu Hause mit Widerstandsbändern')).toBeVisible()
    await expect(page.getByText('Mehr Widerstand, bleibt flexibel')).toBeVisible()
    await expect(page.getByText('Fitnessstudio')).toBeVisible()
    await expect(page.getByText('Mit Hanteln und Kabelzug')).toBeVisible()
  })

  test('AC: Plan-Karten verlinken auf die (noch nicht gebauten) Detailrouten', async ({ page }) => {
    await page.goto('/training')
    await expect(page.getByRole('link', { name: /Zu Hause ohne Equipment/ })).toHaveAttribute('href', '/training/zuhause-ohne-equipment')
    await expect(page.getByRole('link', { name: /Zu Hause mit Widerstandsbändern/ })).toHaveAttribute('href', '/training/zuhause-mit-baendern')
    await expect(page.getByRole('link', { name: /Fitnessstudio/ })).toHaveAttribute('href', '/training/fitnessstudio')
  })
})

// ─── Gast-Zugriff ────────────────────────────────────────────────────────────

test.describe('Gast-Zugriff', () => {
  test('AC: Gast (keine Session) kann die Seite ohne Login vollständig lesen', async ({ page, context }) => {
    await context.clearCookies()
    const response = await page.goto('/training')
    expect(response?.status()).toBeLessThan(400)
    await expect(page.getByRole('heading', { name: 'Krafttraining: Die Basics für deinen Start' })).toBeVisible()
    await oeffneArbeitspunkt(page, 'Was bedeutet was?')
    await expect(page.getByText('Wiederholung (Wdh):')).toBeVisible()
    await expect(page.getByText('Zu Hause ohne Equipment')).toBeVisible()
  })
})
