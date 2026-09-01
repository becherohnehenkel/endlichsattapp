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
  test('AC: "Traurig?" zeigt Nähe-Hinweis (8-Minuten-Regel, Aktions-Kacheln, Hormon-Pills)', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await oeffneArbeitspunkt(page, 'Traurig?')
    await expect(page.getByText(/8 Minuten reichen, um sich verstanden zu fühlen/)).toBeVisible()
    await expect(page.getByText('Anrufen & austauschen')).toBeVisible()
    await expect(page.getByText('Um Umarmung bitten')).toBeVisible()
    await expect(page.getByText('Das schüttet aus:')).toBeVisible()
    await expect(page.getByText('Oxytocin', { exact: true })).toBeVisible()
    await expect(page.getByText('Dopamin', { exact: true })).toBeVisible()
    await expect(page.getByText('Serotonin', { exact: true })).toBeVisible()
  })

  test('AC: "Wütend?" zeigt Bewegungs-Timer (Kniebeugen/Liegestütze/Plank/Runde um den Block) und Fight/Flight/Freeze-Hinweis', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await oeffneArbeitspunkt(page, 'Wütend?')
    await expect(page.getByText('Kniebeugen', { exact: true })).toBeVisible()
    await expect(page.getByText('Liegestütze', { exact: true })).toBeVisible()
    await expect(page.getByText('Plank', { exact: true })).toBeVisible()
    await expect(page.getByText('Runde um den Block')).toBeVisible()
    await expect(page.getByText(/Fight, Flight oder Freeze/)).toBeVisible()

    // Timer starten: Button wechselt von "▶ Start" zu einer laufenden Countdown-Anzeige
    const kniebeugenZeile = page.getByText('Kniebeugen', { exact: true }).locator('xpath=ancestor::div[contains(@class, "rounded-xl")][1]')
    await kniebeugenZeile.getByRole('button', { name: '▶ Start' }).click()
    await expect(kniebeugenZeile.getByRole('button', { name: /0:5\d/ })).toBeVisible()
  })

  test('AC: "Überfordert / Gestresst?" erklärt die Struktur (Aufgabe/Priorität/Bis-wann/Delegieren) vor der Tabelle', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await oeffneArbeitspunkt(page, 'Überfordert / Gestresst?')
    const inhalt = page.getByRole('button', { name: 'Überfordert / Gestresst? Mach das:' }).locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]')

    const struktur = inhalt.getByText(/wer kann dir helfen oder es übernehmen/)
    const tabelle = inhalt.locator('table')
    await expect(struktur).toBeVisible()
    await expect(tabelle).toBeVisible()
    // Struktur-Erklärung steht laut Anforderung VOR der Tabelle/Visualisierung
    const strukturBox = await struktur.boundingBox()
    const tabelleBox = await tabelle.boundingBox()
    expect(strukturBox!.y).toBeLessThan(tabelleBox!.y)

    // Tabelle zeigt alle 4 Spalten als echtes <table> (kein Karten-Grid mehr)
    await expect(tabelle.locator('th')).toHaveCount(4)
    await expect(tabelle.getByText('Präsentation für Montag vorbereiten')).toBeVisible()
    await expect(tabelle.getByText('Sonntag, 20 Uhr')).toBeVisible()
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

  test('AC: "Fragebogen" zeigt die Routine-Grafik (Auslöser → Routine → Belohnung) und genau 7 nummerierte Fragen in der richtigen Reihenfolge', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await oeffneArbeitspunkt(page, 'Fragebogen: Hast du wirklich Hunger?')
    await expect(page.getByText('Auslöser', { exact: true })).toBeVisible()
    await expect(page.getByText('Routine', { exact: true })).toBeVisible()
    await expect(page.getByText('Belohnung', { exact: true })).toBeVisible()
    const items = page.locator('main ol li')
    await expect(items).toHaveCount(7)
    await expect(items.nth(0)).toContainText('Ich WILL essen')
    await expect(items.nth(6)).toContainText('Was ist eigentlich mein Ziel')
  })

  test('AC: "Atemübung" erklärt die Technik im Anfangstext und zeigt die animierte 4-6-8-Technik (Countdown → Einatmen/Halten/Ausatmen, 5 Runden) mit Sekunden-Countdown und Rundenzähler als Überschrift', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    await oeffneArbeitspunkt(page, 'Atemübung (4-6-8-Technik)')
    await expect(page.getByText(/4 Sekunden einatmen, 6 Sekunden halten, 8 Sekunden ausatmen/)).toBeVisible()

    // Startet mit einem 5-Sekunden-Countdown, dann Phase "Einatmen" (4s), "Halten" (6s), "Ausatmen" (8s)
    await expect(page.getByText('Einatmen', { exact: true })).toBeVisible({ timeout: 7000 })
    await expect(page.getByText('Runde 1 von 5')).toBeVisible()
    await expect(page.getByText('Tief durch die Nase in den Bauch')).toBeVisible()
    await expect(page.getByText(/^\ds$/)).toBeVisible()
    await expect(page.getByText('Halten', { exact: true })).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Ausatmen', { exact: true })).toBeVisible({ timeout: 7000 })

    // Rundenzähler steht als Überschrift ÜBER dem Block, Block spannt die volle Breite
    const rundenzaehler = page.getByText(/Runde \d von 5/)
    const block = rundenzaehler.locator('xpath=following-sibling::div[1]')
    const rundenBox = await rundenzaehler.boundingBox()
    const blockBox = await block.boundingBox()
    expect(rundenBox!.y).toBeLessThan(blockBox!.y)
    expect(blockBox!.width).toBeGreaterThan(280)
  })

  test('AC: "Atemübung" pausiert, wenn das Akkordion-Item geschlossen wird (Radix unmounted den Inhalt)', async ({ page }) => {
    await page.goto('/ernaehrung/emotionales-essen')
    const trigger = page.getByRole('button', { name: 'Atemübung (4-6-8-Technik)' })
    await trigger.click()
    await expect(page.getByText('Einatmen', { exact: true })).toBeVisible({ timeout: 7000 })
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(page.getByText('Einatmen', { exact: true })).not.toBeVisible()
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
