/**
 * PROJ-25 — KI-Hinweis auf Ergebnisseiten
 *
 * Deckt die öffentliche Anzeige auf der Rezept-Detailseite ab (echte DB-Daten, kein Mock).
 * Die Platzierung im Mahlzeit-Ergebnis (saettigungs-ergebnis.tsx / rezept-vorschlaege.tsx)
 * ist NICHT per E2E abgedeckt: es existiert keine analysierte Mahlzeit im Testkonto, und
 * eine neue Analyse auszulösen würde reale Claude-API-Kosten verursachen. Diese Stelle
 * wurde stattdessen per Code-Review verifiziert (siehe Implementation Notes in der Spec) —
 * gleiche Komponente, gleiche Einbau-Logik wie auf der hier getesteten Rezeptseite.
 */

import { test, expect, type Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'
// Rezept mit Sättigungs-Matrix (kein Beilagen-/Grundlagen-Typ)
const MATRIX_RECIPE_ID = 'fe8e05ab-af68-4e61-b8fd-6ead79b5e4e3'
// "Fenchelsalat" — als Beilage markiert, zeigt RezeptKontextHinweis statt der Matrix
const BEILAGEN_RECIPE_ID = 'ac634f99-9290-4c47-b5d3-78f3c11744f3'

// Auf der Rezept-Detailseite ist die Matrix regelbasiert berechnet (kein KI-Call zur
// Laufzeit, siehe src/lib/saettigungs-matrix-rezept.ts) — anderer Wortlaut als im
// Mahlzeit-Ergebnis (dort läuft eine echte KI-Analyse über die Claude API).
const TEXT_AUTOMATISCH = 'Automatisch berechnete Einschätzung — kann Fehler enthalten'
const TEXT_ECHTHEIT = 'Rezept ist echt — nicht KI-generiert'

async function loginAs(page: Page) {
  await page.goto('/login')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 8000 })
}

test.describe('Rezept-Detailseite: KI-Hinweis', () => {
  test('zeigt beide Hinweise bei einem Rezept mit Sättigungs-Matrix', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/${MATRIX_RECIPE_ID}`)
    await expect(page.getByText(TEXT_AUTOMATISCH)).toBeVisible()
    await expect(page.getByText(TEXT_ECHTHEIT)).toBeVisible()
  })

  test('zeigt keinen KI-Hinweis bei einem Beilagen-Rezept (RezeptKontextHinweis statt Matrix)', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/${BEILAGEN_RECIPE_ID}`)
    await expect(page.getByText('Als Beilage gedacht')).toBeVisible()
    await expect(page.getByText(TEXT_AUTOMATISCH)).toHaveCount(0)
    await expect(page.getByText(TEXT_ECHTHEIT)).toHaveCount(0)
  })

  test('Icon ist für Screenreader als dekorativ markiert', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/${MATRIX_RECIPE_ID}`)
    const hinweis = page.getByText(TEXT_AUTOMATISCH).locator('..')
    const icon = hinweis.locator('svg')
    await expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  test('Hinweise bleiben auf 375px vollständig lesbar (kein Abschneiden)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await loginAs(page)
    await page.goto(`/rezept/${MATRIX_RECIPE_ID}`)
    const allgemein = page.getByText(TEXT_AUTOMATISCH)
    const echtheit = page.getByText(TEXT_ECHTHEIT)
    await expect(allgemein).toBeVisible()
    await expect(echtheit).toBeVisible()
    // "toBeVisible" allein erkennt kein CSS-Overflow-Abschneiden — zusätzlich sicherstellen,
    // dass der volle Text im DOM steht (kein text-overflow: ellipsis o.ä. hat ihn gekürzt).
    await expect(allgemein).toHaveText(TEXT_AUTOMATISCH)
    await expect(echtheit).toHaveText(TEXT_ECHTHEIT)
  })
})
