/**
 * PROJ-39 — Heißhunger
 *
 * Teststrategie:
 * - Seitenstruktur: Intro, 4 flache Arbeitspunkte in der richtigen Reihenfolge, Breadcrumb.
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
  test('AC: zeigt Überschrift und Intro-Text zu Heißhunger', async ({ page }) => {
    await page.goto('/ernaehrung/heisshunger')
    await expect(page.getByRole('heading', { name: 'Plötzlich Hunger?' })).toBeVisible()
    await expect(page.getByText(/Heißhunger fühlt sich plötzlich an/)).toBeVisible()
    await expect(page.getByText(/Kaloriendefizit zu groß ist/)).toBeVisible()
  })

  test('AC (Refinement 2026-09-04): Intro-Text erwähnt Stresslevel, Umfeld und Social Media als verstärkende Faktoren', async ({ page }) => {
    await page.goto('/ernaehrung/heisshunger')
    await expect(page.getByText(/kommt aber so spontan wie Weihnachten/)).toBeVisible()
    await expect(page.getByText(/Verstärkt wird der Effekt durch dein Stresslevel, dein Umfeld und deine Gewohnheiten auf Social Media/)).toBeVisible()
  })

  test('AC: zeigt 4 Arbeitspunkte in der richtigen Reihenfolge', async ({ page }) => {
    await page.goto('/ernaehrung/heisshunger')
    await expect(page.getByRole('button', { name: 'Sehen, riechen, schmecken & hören' })).toBeVisible()
    const titel = [
      'Konstante Energie',
      'Stress',
      'Screentime und Content',
      'Sehen, riechen, schmecken & hören',
    ]
    // Y-Position der Accordion-Trigger-Buttons statt Text-Suche (Refinement 2026-09-04: der
    // Intro-Text enthält jetzt "Stresslevel", was eine naive `indexOf('Stress')`-Suche vor den
    // eigentlichen Trigger fälschlicherweise treffen würde).
    const positions: number[] = []
    for (const t of titel) {
      const box = await page.getByRole('button', { name: t }).boundingBox()
      expect(box).not.toBeNull()
      positions.push(box!.y)
    }
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  test('AC: Fortschrittsbalken startet bei "0 von 4 abgeschlossen"', async ({ page }) => {
    await page.goto('/ernaehrung/heisshunger')
    await expect(page.getByText('0 von 4 abgeschlossen')).toBeVisible()
  })

  test('AC: Breadcrumb "Ernährung / Heißhunger" ist vorhanden', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/ernaehrung/heisshunger')
    const breadcrumb = page.getByRole('navigation', { name: 'breadcrumb' })
    await expect(breadcrumb.getByRole('link', { name: 'Ernährung' })).toHaveAttribute('href', '/ernaehrung')
    await expect(breadcrumb.getByText('Heißhunger', { exact: true })).toBeVisible()
  })

  test('AC: alle Arbeitspunkte starten eingeklappt', async ({ page }) => {
    await page.goto('/ernaehrung/heisshunger')
    const trigger = page.getByRole('button', { name: 'Konstante Energie' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})

// ─── Arbeitspunkte-Inhalte ───────────────────────────────────────────────────

test.describe('Arbeitspunkte-Inhalte', () => {
  test('AC: "Konstante Energie" zeigt die Blutzucker-Erklärung, beide Vergleichs-Grafiken und den Bonus-Tipp', async ({ page }) => {
    await page.goto('/ernaehrung/heisshunger')
    await oeffneArbeitspunkt(page, 'Konstante Energie')
    await expect(page.getByText(/Je schneller er steigt, desto tiefer fällt er danach/)).toBeVisible()
    await expect(page.getByText('6 Mahlzeiten/Snacks über den Tag')).toBeVisible()
    await expect(page.getByText('3 Mahlzeiten über den Tag')).toBeVisible()
    await expect(page.getByText('Achterbahn — dein Körper kommt nicht zur Ruhe')).toBeVisible()
    await expect(page.getByText(/Bonus-Tipp/)).toBeVisible()
    await expect(page.getByText(/Banane, Brot, Reiswaffel, Gummibärchen/)).toBeVisible()
  })

  test('AC: "Konstante Energie" rendert beide Kurven als sichtbare, beschriftete SVG-Grafiken', async ({ page }) => {
    await page.goto('/ernaehrung/heisshunger')
    await oeffneArbeitspunkt(page, 'Konstante Energie')
    const kurve1 = page.getByRole('img', { name: /6 Mahlzeiten\/Snacks über den Tag/ })
    const kurve2 = page.getByRole('img', { name: /3 Mahlzeiten über den Tag/ })
    await expect(kurve1).toBeVisible()
    await expect(kurve2).toBeVisible()
    const box1 = await kurve1.boundingBox()
    const box2 = await kurve2.boundingBox()
    expect(box1!.width).toBeGreaterThan(50)
    expect(box2!.width).toBeGreaterThan(50)
  })

  test('AC (Refinement 2026-09-04): Blutzucker-Kurven strecken sich über die volle Box-Breite', async ({ page }) => {
    // Regression: vorher hat das Default-SVG-Seitenverhältnis die Kurve mittig "letterboxed"
    // statt zu strecken — behoben via preserveAspectRatio="none".
    await page.goto('/ernaehrung/heisshunger')
    await oeffneArbeitspunkt(page, 'Konstante Energie')
    const eyebrow = page.getByText('Beispielhafter Blutzuckerverlauf')
    await expect(eyebrow).toBeVisible()

    const kurve = page.getByRole('img', { name: /6 Mahlzeiten\/Snacks über den Tag/ })
    const kurveBox = await kurve.boundingBox()
    const cardBox = await eyebrow.locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]').boundingBox()
    expect(kurveBox).not.toBeNull()
    expect(cardBox).not.toBeNull()
    // Kurve soll (abzüglich Innenabstand) fast die volle Kartenbreite ausfüllen.
    expect(kurveBox!.width).toBeGreaterThan(cardBox!.width * 0.85)
  })

  test('AC: "Stress" verlinkt auf /ernaehrung/emotionales-essen', async ({ page }) => {
    await page.goto('/ernaehrung/heisshunger')
    await oeffneArbeitspunkt(page, 'Stress')
    await expect(page.getByText(/Stress fühlt sich oft wie Heißhunger an/)).toBeVisible()
    const link = page.getByRole('link', { name: /Zu Emotionales Essen/ })
    await expect(link).toHaveAttribute('href', '/ernaehrung/emotionales-essen')
  })

  test('AC (Refinement 2026-09-04): "Stress" zeigt das gestresste-Gesicht-Icon mit Blitz-Badge', async ({ page }) => {
    await page.goto('/ernaehrung/heisshunger')
    await oeffneArbeitspunkt(page, 'Stress')
    const zeile = page.locator('div.flex.items-center.gap-3', { hasText: /Stress fühlt sich oft wie Heißhunger an/ })
    // 1 Angry-Icon (Gesicht) + 1 Zap-Icon (Blitz-Badge) = 2 SVGs.
    await expect(zeile.locator('svg')).toHaveCount(2)
  })

  test('AC (Refinement 2026-09-04): "Screentime und Content" zeigt die neue Zwischenüberschrift "Hinterfrage die folgenden Punkte:"', async ({ page }) => {
    await page.goto('/ernaehrung/heisshunger')
    await oeffneArbeitspunkt(page, 'Screentime und Content')
    await expect(page.getByText('Hinterfrage die folgenden Punkte:')).toBeVisible()
  })

  test('AC: "Screentime und Content" zeigt die 4 Reflexionsfragen und die Handlungsempfehlung', async ({ page }) => {
    await page.goto('/ernaehrung/heisshunger')
    await oeffneArbeitspunkt(page, 'Screentime und Content')
    await expect(page.getByText('Wem folge ich?')).toBeVisible()
    await expect(page.getByText('Was sehe ich in meinem Feed?')).toBeVisible()
    await expect(page.getByText(/Was wird mir von Influencern/)).toBeVisible()
    await expect(page.getByText('Worauf habe ich gerade ständig Lust?')).toBeVisible()
    await expect(page.getByText(/Entfolgen oder schneller wegwischen/)).toBeVisible()
  })

  test('AC: "Sehen, riechen, schmecken & hören" zeigt genau 4 Beobachtungspunkte als Icon-Infoboxen (Refinement 2026-09-04)', async ({ page }) => {
    await page.goto('/ernaehrung/heisshunger')
    await oeffneArbeitspunkt(page, 'Sehen, riechen, schmecken & hören')
    const punkte = [/Auf dem Weg zur Arbeit/, /In Podcasts\/Radio/, /Unterwegs.*Gerüche/, /TV\/Film\/YouTube/]
    for (const text of punkte) {
      const box = page.getByText(text).locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]')
      await expect(box).toBeVisible()
      // Jede Infobox hat genau ein Icon (Eye/Ear/Wind/Tv).
      await expect(box.locator('svg')).toHaveCount(1)
    }
  })
})

// ─── Ein-/Ausklappen & Fortschritt ───────────────────────────────────────────

test.describe('Ein-/Ausklappen & Fortschritt', () => {
  test('AC: Aufklappen eines Punkts lässt andere unberührt (unabhängiges Verhalten)', async ({ page }) => {
    await page.goto('/ernaehrung/heisshunger')
    await oeffneArbeitspunkt(page, 'Konstante Energie')
    await expect(page.getByRole('button', { name: 'Konstante Energie' })).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('button', { name: 'Stress' })).toHaveAttribute('aria-expanded', 'false')
  })

  test('AC: "Verstanden" markiert einen Punkt als erledigt, aktualisiert den Fortschritt und bleibt nach Reload erhalten', async ({ page }) => {
    await page.goto('/ernaehrung/heisshunger')
    await oeffneArbeitspunkt(page, 'Konstante Energie')
    await page.getByRole('button', { name: 'Verstanden', exact: true }).click()
    await expect(page.getByText('1 von 4 abgeschlossen')).toBeVisible()

    await page.reload()
    await expect(page.getByText('1 von 4 abgeschlossen')).toBeVisible()
  })

  test('AC: Alle 4 Punkte als "Verstanden" markiert zeigt den "Alles durch"-Hinweis', async ({ page }) => {
    await page.goto('/ernaehrung/heisshunger')
    for (const titel of ['Konstante Energie', 'Stress', 'Screentime und Content', 'Sehen, riechen, schmecken & hören']) {
      await oeffneArbeitspunkt(page, titel)
      await page.getByRole('button', { name: titel }).locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]').getByRole('button', { name: 'Verstanden', exact: true }).click()
    }
    await expect(page.getByText('4 von 4 abgeschlossen')).toBeVisible()
    await expect(page.getByText('Alles durch ✓')).toBeVisible()
  })
})

// ─── Gast-Zugriff (reiner statischer Inhalt) ────────────────────────────────

test.describe('Gast-Zugriff', () => {
  test('AC: Gast (keine Session) kann die Seite ohne Login vollständig lesen', async ({ page, context }) => {
    await context.clearCookies()
    const response = await page.goto('/ernaehrung/heisshunger')
    expect(response?.status()).toBeLessThan(400)
    await expect(page.getByText(/Heißhunger fühlt sich plötzlich an/)).toBeVisible()
  })
})
