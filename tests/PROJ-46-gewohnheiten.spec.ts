/**
 * PROJ-46 — Gewohnheiten
 *
 * Teststrategie:
 * - Komplett frontend-only, kein Backend, keine Datenbank, kein Login nötig — jeder
 *   Test läuft in einer frischen Playwright-Browser-Context (eigenes, leeres
 *   localStorage), daher kein Cleanup zwischen Tests nötig, anders als bei PROJ-45.
 * - Deckt alle 8 Acceptance Criteria + die dokumentierten Edge Cases ab.
 */

import { test, expect } from '@playwright/test'

const ALLE_TITEL = ['Weniger Snacks', 'Mehr Schritte', 'Wasser trinken', 'Social Media', 'Rezepte', 'Dehnen', 'Handy', 'Richtig essen']

// ─── Seitenstruktur ─────────────────────────────────────────────────────────

test.describe('Seitenstruktur', () => {
  test('AC: erscheint unterhalb der Wochen-Check-In-Sektion mit Überschrift, Intro-Text und Merksatz-Infobox', async ({ page }) => {
    await page.goto('/check-in')
    await expect(page.getByRole('heading', { name: 'Gewohnheiten' })).toBeVisible()
    await expect(page.getByText('Mach nicht alles auf einmal.', { exact: false })).toBeVisible()
    await expect(page.getByText('Gib dir die Zeit.', { exact: false })).toBeVisible()

    // Reihenfolge auf der Seite: Wochen-Check-In-Überschrift kommt vor Gewohnheiten-Überschrift
    const main = page.locator('main')
    const text = await main.innerText()
    expect(text.indexOf('Deine Erfolgskontrolle')).toBeGreaterThanOrEqual(0)
    expect(text.indexOf('Deine Erfolgskontrolle')).toBeLessThan(text.indexOf('Gewohnheiten'))
  })

  test('AC: alle 8 Gewohnheiten erscheinen als Checkbox-Infoboxen in der vorgegebenen Reihenfolge', async ({ page }) => {
    await page.goto('/check-in')
    await expect(page.getByRole('heading', { name: 'Gewohnheiten' })).toBeVisible()
    const main = page.locator('main')
    const text = await main.innerText()
    const positions = ALLE_TITEL.map(t => text.indexOf(t))
    expect(positions.every(p => p >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))

    for (const titel of ALLE_TITEL) {
      await expect(page.getByRole('checkbox', { name: titel })).toBeVisible()
    }
  })
})

// ─── Interaktion ────────────────────────────────────────────────────────────

test.describe('Interaktion', () => {
  test('AC: Checkbox anklicken markiert die Gewohnheit sofort als erledigt, ohne Speichern-Button', async ({ page }) => {
    await page.goto('/check-in')
    await expect(page.getByRole('button', { name: 'Speichern', exact: true })).toHaveCount(0) // kein Speichern-Button in der Gewohnheiten-Sektion nötig
    const checkbox = page.getByRole('checkbox', { name: 'Weniger Snacks' })
    await expect(checkbox).not.toBeChecked()
    await checkbox.click()
    await expect(checkbox).toBeChecked()
    await expect(page.getByText('1 von 8 erledigt')).toBeVisible()
  })

  test('AC: erneutes Anklicken einer abgehakten Gewohnheit entfernt die Markierung wieder', async ({ page }) => {
    await page.goto('/check-in')
    const checkbox = page.getByRole('checkbox', { name: 'Mehr Schritte' })
    await checkbox.click()
    await expect(checkbox).toBeChecked()
    await checkbox.click()
    await expect(checkbox).not.toBeChecked()
    await expect(page.getByText('0 von 8 erledigt')).toBeVisible()
  })

  test('AC: Aufklappen zeigt den Hinweistext, erneutes Klicken klappt ihn wieder zu', async ({ page }) => {
    await page.goto('/check-in')
    const hinweis = page.getByText('Trinke nach dem Aufstehen mindestens 1 großes Glas Wasser', { exact: false })
    await expect(hinweis).not.toBeVisible()
    await page.getByRole('button', { name: /Wasser trinken/ }).click()
    await expect(hinweis).toBeVisible()
    await page.getByRole('button', { name: /Wasser trinken/ }).click()
    await expect(hinweis).not.toBeVisible()
  })

  test('EDGE CASE: Aufklappen ohne Abhaken lässt die Checkbox unmarkiert, Auf-/Zuklappen und Abhaken sind unabhängig', async ({ page }) => {
    await page.goto('/check-in')
    await page.getByRole('button', { name: /Handy/ }).click()
    await expect(page.getByText('Ich fasse meine Handy erst an', { exact: false })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Handy' })).not.toBeChecked()

    // Umgekehrt: Abhaken ohne aufzuklappen
    const checkbox = page.getByRole('checkbox', { name: 'Dehnen' })
    await checkbox.click()
    await expect(checkbox).toBeChecked()
    await expect(page.getByText('Ich dehne mich nach dem Aufstehen', { exact: false })).not.toBeVisible()
  })

  test('AC: "Fortschritt zurücksetzen" entfernt alle Häkchen', async ({ page }) => {
    await page.goto('/check-in')
    await expect(page.getByRole('button', { name: 'Fortschritt zurücksetzen' })).toHaveCount(0)

    await page.getByRole('checkbox', { name: 'Weniger Snacks' }).click()
    await page.getByRole('checkbox', { name: 'Social Media' }).click()
    await expect(page.getByText('2 von 8 erledigt')).toBeVisible()

    await page.getByRole('button', { name: 'Fortschritt zurücksetzen' }).click()
    await expect(page.getByText('0 von 8 erledigt')).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Weniger Snacks' })).not.toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Social Media' })).not.toBeChecked()
    await expect(page.getByRole('button', { name: 'Fortschritt zurücksetzen' })).toHaveCount(0)
  })

  test('EDGE CASE: alle 8 Gewohnheiten abgehakt zeigt "Alles erledigt"', async ({ page }) => {
    await page.goto('/check-in')
    for (const titel of ALLE_TITEL) {
      await page.getByRole('checkbox', { name: titel }).click()
    }
    await expect(page.getByText('8 von 8 erledigt')).toBeVisible()
    await expect(page.getByText('Alles erledigt ✓')).toBeVisible()
  })
})

// ─── Persistenz ─────────────────────────────────────────────────────────────

test.describe('Persistenz', () => {
  test('AC: Häkchen bleiben nach einem Reload im selben Browser erhalten', async ({ page }) => {
    await page.goto('/check-in')
    await page.getByRole('checkbox', { name: 'Rezepte' }).click()
    await page.getByRole('checkbox', { name: 'Richtig essen' }).click()
    await expect(page.getByText('2 von 8 erledigt')).toBeVisible()

    await page.reload()
    await expect(page.getByText('2 von 8 erledigt')).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Rezepte' })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Richtig essen' })).toBeChecked()
  })

  test('AC: ohne je abgehakte Gewohnheit sind beim Laden alle Checkboxen leer', async ({ page }) => {
    await page.goto('/check-in')
    await expect(page.getByText('0 von 8 erledigt')).toBeVisible()
    for (const titel of ALLE_TITEL) {
      await expect(page.getByRole('checkbox', { name: titel })).not.toBeChecked()
    }
  })
})

// ─── Gast-Verhalten ─────────────────────────────────────────────────────────

test.describe('Gast-Verhalten', () => {
  test('AC: funktioniert für Gäste identisch zu eingeloggten Nutzern, kein Hinweistext zu fehlender Speicherung', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/check-in')
    await expect(page.getByRole('heading', { name: 'Gewohnheiten' })).toBeVisible()

    const checkbox = page.getByRole('checkbox', { name: 'Weniger Snacks' })
    await checkbox.click()
    await expect(checkbox).toBeChecked()
    await expect(page.getByText('1 von 8 erledigt')).toBeVisible()

    // Reload bestätigt: Gast-Fortschritt ist genauso persistent wie bei eingeloggten Nutzern
    await page.reload()
    await expect(checkbox).toBeChecked()

    // Kein Hinweistext zu fehlender Speicherung (anders als bei der Wochen-Check-In-Sektion,
    // die für Gäste explizit warnt) — die Gewohnheiten-Sektion braucht das nicht, da sie
    // für Gäste UND eingeloggte Nutzer gleichermaßen nur lokal speichert.
    const gewohnheitenSektion = page.locator('h2', { hasText: 'Gewohnheiten' }).locator('..')
    await expect(gewohnheitenSektion.getByText('werden nicht gespeichert', { exact: false })).toHaveCount(0)
  })
})

// ─── Edge Case: localStorage nicht verfügbar ───────────────────────────────

test.describe('Edge Case: localStorage nicht verfügbar', () => {
  test('EDGE CASE: Checkbox bleibt bedienbar, kein Absturz, Zustand geht beim Reload verloren', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() { throw new Error('localStorage blocked (simulated private browsing restriction)') },
      })
    })
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))

    await page.goto('/check-in')
    await expect(page.getByRole('heading', { name: 'Gewohnheiten' })).toBeVisible()

    const checkbox = page.getByRole('checkbox', { name: 'Weniger Snacks' })
    await checkbox.click()
    await expect(checkbox).toBeChecked()
    await expect(page.getByText('1 von 8 erledigt')).toBeVisible()

    expect(errors).toEqual([])

    await page.reload()
    await expect(page.getByRole('checkbox', { name: 'Weniger Snacks' })).not.toBeChecked()
  })
})
