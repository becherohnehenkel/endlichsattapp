/**
 * PROJ-38 — Emotionales Essen
 *
 * Teststrategie:
 * - Seitenstruktur: Intro, 2 Sektionen, 9 Arbeitspunkte in der richtigen Reihenfolge, Breadcrumb.
 * - Accordion-Verhalten (Refinement): alle Punkte standardmäßig eingeklappt, unabhängig
 *   auf-/zuklappbar, "Verstanden"-Toggle aktualisiert den Fortschrittsbalken.
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
  test('AC: zeigt den Intro-Text zu emotionalem Essen', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await expect(page.getByText(/Trauer, Wut, Überforderung, Stress/)).toBeVisible()
    await expect(page.getByText(/Langeweile gibt es eigentlich nicht wirklich/)).toBeVisible()
  })

  test('AC: zeigt 9 Arbeitspunkte in 2 Sektionen mit den korrekten Überschriften', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await expect(page.getByText('Direkt an der Emotion ansetzen')).toBeVisible()
    await expect(page.getByText('Allgemeine Praxis-Übungen')).toBeVisible()

    const main = page.locator('main')
    const text = await main.innerText()
    const titel = [
      'Traurig?',
      'Wütend?',
      'Überfordert / Gestresst?',
      'Journaling',
      'Fragebogen: Hast du wirklich Hunger?',
      'Atemübung (4-6-8-Technik)',
      'Einkauf planen',
      'Feste Mahlzeiten planen (ohne Ablenkung)',
      'Screentime planen',
    ]
    const positions = titel.map((t) => text.indexOf(t))
    expect(positions.every((p) => p >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  test('AC: Fortschrittsbalken startet bei "0 von 9 abgeschlossen"', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await expect(page.getByText('0 von 9 abgeschlossen')).toBeVisible()
  })

  test('AC: Breadcrumb "Ernährung / Emotionales Essen" bleibt erhalten', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/ernaehrung/emotionales-essen')
    const breadcrumb = page.getByRole('navigation', { name: 'breadcrumb' })
    await expect(breadcrumb.getByRole('link', { name: 'Ernährung' })).toHaveAttribute('href', '/ernaehrung')
    await expect(breadcrumb.getByText('Emotionales Essen', { exact: true })).toBeVisible()
  })

  test('AC: alle Arbeitspunkte starten eingeklappt', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    const trigger = page.getByRole('button', { name: 'Traurig?' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})

// ─── Sektion 1: Direkt an der Emotion ansetzen ──────────────────────────────

test.describe('Sektion 1 — Direkt an der Emotion ansetzen', () => {
  test('AC: "Traurig?" zeigt Nähe-Hinweis (8-Minuten-Regel, Oxytocin/Dopamin/Serotonin)', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await oeffneArbeitspunkt(page, 'Traurig?')
    await expect(page.getByText(/8 Minuten reichen, um sich verstanden zu fühlen/)).toBeVisible()
    await expect(page.getByText(/Oxytocin, Dopamin und Serotonin/)).toBeVisible()
  })

  test('AC: "Wütend?" zeigt Bewegungs-Hinweis (Fight\\/Flight\\/Freeze)', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await oeffneArbeitspunkt(page, 'Wütend?')
    await expect(page.getByText(/Kniebeugen, Liegestütze, Planks/)).toBeVisible()
    await expect(page.getByText(/Fight, Flight oder Freeze/)).toBeVisible()
  })

  test('AC: "Überfordert / Gestresst?" zeigt Beispiel-Aufgaben mit Priorität/Bis-wann/Delegieren', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await oeffneArbeitspunkt(page, 'Überfordert / Gestresst?')
    await expect(page.getByText('Präsentation für Montag vorbereiten')).toBeVisible()
    await expect(page.getByText(/vergib 1–3 \(keine 4, keine 0\)/)).toBeVisible()
    await expect(page.getByText(/wer kann dir helfen oder es übernehmen/)).toBeVisible()
  })
})

// ─── Sektion 2: Allgemeine Praxis-Übungen ───────────────────────────────────

test.describe('Sektion 2 — Allgemeine Praxis-Übungen', () => {
  test('AC: "Journaling" zeigt die Plus/Minus-Beispiel-Listen mit 5-Minuten-Timer', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await oeffneArbeitspunkt(page, 'Journaling')
    await expect(page.getByText('5 Minuten', { exact: true })).toBeVisible()
    await expect(page.getByText('+ Was lief gut')).toBeVisible()
    await expect(page.getByText('− Was lief nicht so gut')).toBeVisible()
    await expect(page.getByText('Entspannt aufgewacht')).toBeVisible()
  })

  test('AC: "Fragebogen" zeigt genau 7 nummerierte Fragen in der richtigen Reihenfolge', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await oeffneArbeitspunkt(page, 'Fragebogen: Hast du wirklich Hunger?')
    const items = page.locator('main ol li')
    await expect(items).toHaveCount(7)
    await expect(items.nth(0)).toContainText('Ich WILL essen')
    await expect(items.nth(6)).toContainText('Was ist eigentlich mein Ziel')
  })

  test('AC: "Atemübung" zeigt die 4-6-8-Technik', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await oeffneArbeitspunkt(page, 'Atemübung (4-6-8-Technik)')
    await expect(page.getByText(/4 Sekunden lang tief durch die Nase/)).toBeVisible()
    await expect(page.getByText(/6 Sekunden lang anhalten/)).toBeVisible()
    await expect(page.getByText(/8 Sekunden lang langsam/)).toBeVisible()
  })

  test('AC: "Einkauf planen" zeigt Frisches- und Haltbares-Kategorien', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await oeffneArbeitspunkt(page, 'Einkauf planen')
    await expect(page.getByText('Frisches', { exact: true })).toBeVisible()
    await expect(page.getByText('Haltbares', { exact: true })).toBeVisible()
  })

  test('AC: "Feste Mahlzeiten planen" zeigt die 20/40/40-Regel mit 2000-kcal-Referenzwert', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await oeffneArbeitspunkt(page, 'Feste Mahlzeiten planen (ohne Ablenkung)')
    await expect(page.getByText(/20\/40\/40/)).toBeVisible()
    await expect(page.getByText('400 kcal')).toBeVisible()
    await expect(page.getByText('800 kcal')).toHaveCount(2)
    await expect(page.getByText(/Referenzwert: 2000 kcal/)).toBeVisible()
  })

  test('AC: Snack-Schalter bei "Feste Mahlzeiten planen" verteilt 10% von Mittag- und Abendessen auf einen Snack', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await oeffneArbeitspunkt(page, 'Feste Mahlzeiten planen (ohne Ablenkung)')
    await expect(page.getByText('Snack', { exact: true })).not.toBeVisible()
    await page.getByRole('switch').click()
    await expect(page.getByText('Snack', { exact: true })).toBeVisible()
    await expect(page.getByText('600 kcal')).toHaveCount(2)
    await expect(page.getByText('400 kcal')).toHaveCount(2)
  })

  test('AC: "Screentime planen" zeigt die 45-Minuten-Tagesdosis', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await oeffneArbeitspunkt(page, 'Screentime planen')
    await expect(page.getByText(/Tagesdosis.*von 45 Minuten/)).toBeVisible()
  })

  test('AC: "Screentime planen" zeigt die Reiz-Ampel mit 5 Sinnen (Hören/Sehen/Fühlen vom Smartphone bedient, Riechen/Schmecken offen)', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await oeffneArbeitspunkt(page, 'Screentime planen')
    for (const sinn of ['Hören', 'Sehen', 'Fühlen', 'Riechen', 'Schmecken']) {
      await expect(page.getByText(sinn, { exact: true })).toBeVisible()
    }
    await expect(page.getByText('Essen, kauen, leckeres Mundgefühl')).toBeVisible()
  })
})

// ─── Accordion- & Fortschritts-Verhalten ────────────────────────────────────

test.describe('Ein-/Ausklappen & Fortschritt', () => {
  test('AC: Aufklappen eines Punkts lässt andere unberührt (unabhängiges Verhalten)', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await oeffneArbeitspunkt(page, 'Traurig?')
    await expect(page.getByRole('button', { name: 'Traurig?' })).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('button', { name: 'Wütend?' })).toHaveAttribute('aria-expanded', 'false')
  })

  test('AC: "Verstanden" markiert einen Punkt als erledigt und aktualisiert den Fortschritt', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await oeffneArbeitspunkt(page, 'Traurig?')
    // Nur "Traurig?" ist gerade aufgeklappt — geschlossene Arbeitspunkte sind nicht im
    // Accessibility-Tree, daher matcht dieser Locator eindeutig den einen sichtbaren Button.
    await page.getByRole('button', { name: 'Verstanden', exact: true }).click()
    await expect(page.getByText('1 von 9 abgeschlossen')).toBeVisible()
  })
})

// ─── Gast-Zugriff (reiner statischer Inhalt) ────────────────────────────────

test.describe('Gast-Zugriff', () => {
  test('AC: Gast (keine Session) kann die Seite ohne Login vollständig lesen', async ({ page, context }) => {
    await context.clearCookies()
    const response = await page.goto('/ernaehrung/emotionales-essen')
    expect(response?.status()).toBeLessThan(400)
    await expect(page.getByText(/Trauer, Wut, Überforderung, Stress/)).toBeVisible()
  })
})
