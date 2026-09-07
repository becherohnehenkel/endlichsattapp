/**
 * PROJ-44 — Trainingspläne (Detailseiten + Gewicht-Logging)
 *
 * Teststrategie:
 * - Seitenstruktur: Breadcrumb, Überschrift, Intro, Warm-Up, Übungsreihenfolge.
 * - Übungskarten: einklappbare Ausführung, 3 Satz-Zeilen mit Wiederholungen (+ Gewicht
 *   bei Plan 2/3), gemeinsames Pause-Feld, alles frei editierbar.
 * - Speichern (eingeloggtes QA-Testkonto, echte DB — kein Mock möglich, da die Route
 *   den Service-Role-Client nutzt): "Training abschließen" legt einen neuen Eintrag an,
 *   ein Reload lädt ihn als Vorausfüllung zurück. Es gibt keine Lösch-Funktion (Out of
 *   Scope laut Spec), Test-Einträge bleiben dauerhaft in der DB — konsistent mit dem
 *   bereits akkumulierten Testdaten-Muster in diesem Projekt (z.B. Mahlzeiten-Historie).
 * - Gast-Verhalten: Felder nutzbar, aber kein Speichern — Hinweis-Karte statt Button.
 */

import { test, expect, type Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'

async function loginAs(page: Page, redirectPath: string) {
  await page.goto(`/login?redirectTo=${encodeURIComponent(redirectPath)}`)
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(`**${redirectPath}`, { timeout: 8000 })
}

// ─── Seitenstruktur & Routing ────────────────────────────────────────────────

test.describe('Seitenstruktur & Routing', () => {
  test('AC: Plan-Karte auf der Übersicht navigiert zur richtigen Detailseite', async ({ page }) => {
    await page.goto('/training')
    await page.getByText('Fitnessstudio').click()
    await page.waitForURL('**/training/fitnessstudio')
    await expect(page.getByRole('heading', { name: 'Fitnessstudio' })).toBeVisible()
  })

  test('AC: Detailseite zeigt Überschrift, Intro, Warm-Up-Hinweis und Übungen in der richtigen Reihenfolge', async ({ page }) => {
    await page.goto('/training/zuhause-ohne-equipment')
    await expect(page.getByRole('heading', { name: 'Zu Hause ohne Equipment' })).toBeVisible()
    await expect(page.getByText(/Bodyweight-Training für zu Hause/)).toBeVisible()
    await expect(page.getByText(/Hampelmann, Highknees/)).toBeVisible()

    const main = page.locator('main')
    const text = await main.innerText()
    const titel = ['Kniebeuge', 'Glute Bridge', 'Ausfallschritte abwechselnd', 'Liegestütz (ggf. kniend)', 'Superman Pose', 'Beinheben']
    const positions = titel.map(t => text.indexOf(t))
    expect(positions.every(p => p >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  test('AC: Breadcrumb zeigt "Training / [Planname]" und führt zurück zu /training', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/training/fitnessstudio')
    const breadcrumb = page.getByRole('navigation', { name: 'breadcrumb' })
    await expect(breadcrumb.getByRole('link', { name: 'Training' })).toHaveAttribute('href', '/training')
    await expect(breadcrumb.getByText('Fitnessstudio', { exact: true })).toBeVisible()
    await breadcrumb.getByRole('link', { name: 'Training' }).click()
    await page.waitForURL('**/training')
    await expect(page.getByRole('heading', { name: 'Krafttraining: Die Basics für deinen Start' })).toBeVisible()
  })

  test('AC: ungültiger Plan-Slug zeigt 404', async ({ page }) => {
    await page.goto('/training/does-not-exist')
    await expect(page.getByText('This page could not be found.')).toBeVisible()
  })
})

// ─── Übungskarten ─────────────────────────────────────────────────────────────

test.describe('Übungskarten', () => {
  test('AC: Ausführungs-Erklärung ist eingeklappt und lässt sich aufklappen', async ({ page }) => {
    await page.goto('/training/zuhause-ohne-equipment')
    await expect(page.getByText(/Füße schulterbreit/)).not.toBeVisible()
    await page.getByText('Ausführung anzeigen').first().click()
    await expect(page.getByText(/Füße schulterbreit/)).toBeVisible()
  })

  test('AC: 3 Satz-Zeilen mit Wiederholungen vorausgefüllt aus dem Plan-Schema, gemeinsames Pause-Feld', async ({ page }) => {
    await page.goto('/training/zuhause-ohne-equipment')
    await expect(page.getByLabel('Kniebeuge Satz 1 Wiederholungen')).toHaveValue('12')
    await expect(page.getByLabel('Kniebeuge Satz 2 Wiederholungen')).toHaveValue('12')
    await expect(page.getByLabel('Kniebeuge Satz 3 Wiederholungen')).toHaveValue('12')
    await expect(page.locator('#kniebeuge-pause')).toHaveValue('60 Sek.')
  })

  test('AC: Plan 3 nutzt 10 Wiederholungen als Schema-Startwert', async ({ page }) => {
    await page.goto('/training/fitnessstudio')
    await expect(page.getByLabel('Kniebeuge mit Langhantel Satz 1 Wiederholungen')).toHaveValue('10')
  })

  test('AC: Plan 2 und 3 zeigen ein Zusatzfeld pro Satz-Zeile (Widerstand bzw. Gewicht, Refinement 2026-09-07)', async ({ page }) => {
    await page.goto('/training/zuhause-mit-baendern')
    await expect(page.getByLabel('Kreuzheben Satz 1 Widerstand')).toBeVisible()
    await page.goto('/training/fitnessstudio')
    await expect(page.getByLabel('Kniebeuge mit Langhantel Satz 1 Gewicht')).toBeVisible()
  })

  test('AC: Plan 1 (Bodyweight) zeigt KEIN Gewicht-Feld', async ({ page }) => {
    await page.goto('/training/zuhause-ohne-equipment')
    await expect(page.getByLabel('Kniebeuge Satz 1 Gewicht')).toHaveCount(0)
  })
})

// ─── Felder anpassen ──────────────────────────────────────────────────────────

test.describe('Felder anpassen', () => {
  test('AC: Pause bleibt frei editierbar (alle Pläne), Wiederholungen/Widerstand bei Plan 2 ebenfalls', async ({ page }) => {
    await page.goto('/training/zuhause-mit-baendern')
    const widerstand = page.getByLabel('Kreuzheben Satz 1 Widerstand')
    await widerstand.fill('grün')
    await expect(widerstand).toHaveValue('grün')

    const pause = page.locator('#kreuzheben-band-pause')
    await pause.fill('90 Sek.')
    await expect(pause).toHaveValue('90 Sek.')
  })

  test('AC (Refinement 2026-09-07): Bei Plan 3 sind Wiederholungen und Gewicht numerisch — Wiederholungen ganzzahlig, Gewicht mit 0,5er-Schritten', async ({ page }) => {
    await page.goto('/training/fitnessstudio')
    const wdh = page.getByLabel('Kniebeuge mit Langhantel Satz 1 Wiederholungen')
    await expect(wdh).toHaveAttribute('type', 'number')
    await wdh.fill('8')
    await expect(wdh).toHaveValue('8')

    const gewicht = page.getByLabel('Kniebeuge mit Langhantel Satz 1 Gewicht')
    await expect(gewicht).toHaveAttribute('type', 'number')
    await expect(gewicht).toHaveAttribute('step', '0.5')
    await gewicht.fill('62.5')
    await expect(gewicht).toHaveValue('62.5')

    // Freitext lässt sich in ein natives Zahlen-Feld gar nicht erst eintippen.
    await expect(async () => await gewicht.fill('bis Muskelversagen')).rejects.toThrow()
  })
})

// ─── Speichern (eingeloggte Nutzer, echte DB) ─────────────────────────────────

test.describe('Speichern (eingeloggte Nutzer)', () => {
  test('AC: "Training abschließen" speichert, Reload lädt den zuletzt gespeicherten Stand', async ({ page }) => {
    await loginAs(page, '/training/zuhause-ohne-equipment')

    const wdh = page.getByLabel('Kniebeuge Satz 1 Wiederholungen')
    await wdh.fill('15')
    await page.getByRole('button', { name: 'Training abschließen' }).click()
    await expect(page.getByText('Training gespeichert ✓')).toBeVisible({ timeout: 5000 })

    await page.reload()
    await expect(page.getByLabel('Kniebeuge Satz 1 Wiederholungen')).toHaveValue('15')

    // Zurück auf den Plan-Standardwert setzen und erneut speichern, damit künftige
    // Testläufe/manuelle Prüfungen wieder von einem sauberen Stand starten.
    await page.getByLabel('Kniebeuge Satz 1 Wiederholungen').fill('12')
    await page.getByRole('button', { name: 'Training abschließen' }).click()
    await expect(page.getByText('Training gespeichert ✓')).toBeVisible({ timeout: 5000 })
  })

  test('AC (Refinement 2026-09-07): Plan 3 speichert numerische Werte erfolgreich, Reload lädt sie korrekt zurück', async ({ page }) => {
    await loginAs(page, '/training/fitnessstudio')

    const wdh = page.getByLabel('Kniebeuge mit Langhantel Satz 1 Wiederholungen')
    await wdh.fill('8')
    const gewicht = page.getByLabel('Kniebeuge mit Langhantel Satz 1 Gewicht')
    await gewicht.fill('55.5')
    await page.getByRole('button', { name: 'Training abschließen' }).click()
    await expect(page.getByText('Training gespeichert ✓')).toBeVisible({ timeout: 5000 })

    await page.reload()
    await expect(page.getByLabel('Kniebeuge mit Langhantel Satz 1 Wiederholungen')).toHaveValue('8')
    await expect(page.getByLabel('Kniebeuge mit Langhantel Satz 1 Gewicht')).toHaveValue('55.5')

    // Zurück auf den Plan-Standardwert setzen (Gewicht leer), damit künftige Testläufe/
    // manuelle Prüfungen wieder von einem sauberen Stand starten.
    await page.getByLabel('Kniebeuge mit Langhantel Satz 1 Wiederholungen').fill('10')
    await page.getByLabel('Kniebeuge mit Langhantel Satz 1 Gewicht').fill('')
    await page.getByRole('button', { name: 'Training abschließen' }).click()
    await expect(page.getByText('Training gespeichert ✓')).toBeVisible({ timeout: 5000 })
  })
})

// ─── Gast-Verhalten ────────────────────────────────────────────────────────────

test.describe('Gast-Verhalten', () => {
  test('AC: Gast kann Felder nutzen, sieht Login-Hinweis statt Speichern-Button', async ({ page, context }) => {
    await context.clearCookies()
    const response = await page.goto('/training/zuhause-ohne-equipment')
    expect(response?.status()).toBeLessThan(400)

    const wdh = page.getByLabel('Kniebeuge Satz 1 Wiederholungen')
    await wdh.fill('20')
    await expect(wdh).toHaveValue('20')

    await expect(page.getByRole('button', { name: 'Training abschließen' })).toHaveCount(0)
    await expect(page.getByText('Melde dich an, um dein Training zu speichern.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Anmelden' })).toHaveAttribute('href', '/konto?reason=training')
  })

  test('AC: Gast-Eingaben gehen beim Reload verloren (keine Persistenz)', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/training/zuhause-ohne-equipment')
    await page.getByLabel('Kniebeuge Satz 1 Wiederholungen').fill('20')
    await page.reload()
    await expect(page.getByLabel('Kniebeuge Satz 1 Wiederholungen')).toHaveValue('12')
  })
})
