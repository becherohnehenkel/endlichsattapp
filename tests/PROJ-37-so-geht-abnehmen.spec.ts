/**
 * PROJ-37 — So geht abnehmen (inkl. Kcal-Rechner)
 *
 * Teststrategie:
 * - Formel-Korrektheit ist bereits umfassend in src/lib/kcal-rechner.test.ts (Vitest) abgedeckt.
 * - Hier: End-to-End-Verhalten — Formular/Validierung, Speichern & Vorausfüllen für eingeloggte
 *   Nutzer, Gast-Verhalten (zustandslos), Seitenstruktur.
 */

import { test, expect, type Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'

async function loginAs(page: Page) {
  await page.goto('/login')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 8000 })
}

// PROJ-37 (Refinement): Arbeitspunkte sind jetzt Accordion-Items, standardmäßig eingeklappt.
// Idempotent (prüft aria-expanded), da der Kcal-Rechner bei bereits gespeicherten Werten
// automatisch aufgeklappt startet (defaultOffenIds) — ein blinder Klick würde ihn sonst
// wieder zuklappen.
async function oeffneArbeitspunkt(page: Page, titel: string) {
  const trigger = page.getByRole('button', { name: titel })
  const expanded = await trigger.getAttribute('aria-expanded')
  if (expanded !== 'true') {
    await trigger.click()
  }
}

async function fillValidesFormular(page: Page) {
  await oeffneArbeitspunkt(page, 'Kcal-Rechner')
  await page.fill('#kcal-gewicht', '80')
  await page.fill('#kcal-groesse', '180')
  await page.fill('#kcal-alter', '30')
  await page.getByLabel('Männlich').check()
  await page.getByLabel('Aktivitätslevel').click()
  await page.getByRole('option', { name: /Moderat aktiv/ }).click()
  await page.getByRole('button', { name: 'Gewicht halten' }).click()
}

// ─── Eingabe & Validierung ──────────────────────────────────────────────────

test.describe('Eingabe & Validierung', () => {
  test('AC: zeigt alle Eingabefelder (Gewicht, Größe, Alter, Geschlecht, Aktivitätslevel, Ziel)', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await oeffneArbeitspunkt(page, 'Kcal-Rechner')
    await expect(page.locator('#kcal-gewicht')).toBeVisible()
    await expect(page.locator('#kcal-groesse')).toBeVisible()
    await expect(page.locator('#kcal-alter')).toBeVisible()
    await expect(page.getByLabel('Männlich')).toBeVisible()
    await expect(page.getByLabel('Weiblich')).toBeVisible()
    await expect(page.getByLabel('Aktivitätslevel')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Fett verlieren' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Gewicht halten' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Muskeln aufbauen' })).toBeVisible()
  })

  test('AC: Gewicht außerhalb 30–300kg zeigt Fehler, Berechnen bleibt deaktiviert', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await fillValidesFormular(page)
    await page.fill('#kcal-gewicht', '5')
    await expect(page.getByText('30–300 kg')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Berechnen' })).toBeDisabled()
  })

  test('AC: Größe außerhalb 120–250cm zeigt Fehler, Berechnen bleibt deaktiviert', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await fillValidesFormular(page)
    await page.fill('#kcal-groesse', '400')
    await expect(page.getByText('120–250 cm')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Berechnen' })).toBeDisabled()
  })

  test('AC: Alter außerhalb 14–100 Jahre zeigt Fehler, Berechnen bleibt deaktiviert', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await fillValidesFormular(page)
    await page.fill('#kcal-alter', '5')
    await expect(page.getByText('14–100 Jahre')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Berechnen' })).toBeDisabled()
  })

  test('AC: bei vollständig gültigem Formular ist "Berechnen" aktiv', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await fillValidesFormular(page)
    await expect(page.getByRole('button', { name: 'Berechnen' })).toBeEnabled()
  })
})

// ─── Berechnung ─────────────────────────────────────────────────────────────

test.describe('Berechnung', () => {
  test('AC: 80kg/180cm/30J/männlich/moderat aktiv/Gewicht halten → 2759 kcal (Mifflin-St-Jeor × PAL)', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await fillValidesFormular(page)
    await page.getByRole('button', { name: 'Berechnen' }).click()
    await expect(page.getByText('2759 kcal', { exact: true })).toBeVisible()
    await expect(page.getByText('Erhaltungsbedarf: 2759 kcal')).toBeVisible()
  })

  test('AC: "Fett verlieren" zeigt 90% des Erhaltungsbedarfs (2483 kcal)', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await fillValidesFormular(page)
    await page.getByRole('button', { name: 'Fett verlieren' }).click()
    await page.getByRole('button', { name: 'Berechnen' }).click()
    await expect(page.getByText('2483 kcal', { exact: true })).toBeVisible()
    await expect(page.getByText('Erhaltungsbedarf: 2759 kcal')).toBeVisible()
  })

  test('AC: "Muskeln aufbauen" zeigt 110% des Erhaltungsbedarfs (3035 kcal)', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await fillValidesFormular(page)
    await page.getByRole('button', { name: 'Muskeln aufbauen' }).click()
    await page.getByRole('button', { name: 'Berechnen' }).click()
    await expect(page.getByText('3035 kcal', { exact: true })).toBeVisible()
  })
})

// ─── Gäste (zustandslos) ────────────────────────────────────────────────────

test.describe('Gäste', () => {
  test('AC: Gast öffnet den Rechner mit leeren Feldern', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await oeffneArbeitspunkt(page, 'Kcal-Rechner')
    await expect(page.locator('#kcal-gewicht')).toHaveValue('')
    await expect(page.locator('#kcal-groesse')).toHaveValue('')
    await expect(page.locator('#kcal-alter')).toHaveValue('')
  })

  test('AC: Gast berechnet ein Ergebnis, nach Reload sind die Felder wieder leer (nichts gespeichert)', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await fillValidesFormular(page)
    await page.getByRole('button', { name: 'Berechnen' }).click()
    await expect(page.getByText('2759 kcal', { exact: true })).toBeVisible()

    await page.reload()
    await oeffneArbeitspunkt(page, 'Kcal-Rechner')
    await expect(page.locator('#kcal-gewicht')).toHaveValue('')
  })
})

// ─── Speichern (eingeloggte Nutzer) ─────────────────────────────────────────

// .serial: alle drei Tests schreiben auf dieselbe profiles-Zeile (qa-test-Account) —
// parallele Ausführung würde sich gegenseitig überschreiben (race condition).
test.describe.serial('Speichern für eingeloggte Nutzer', () => {
  test('AC: Berechnen speichert automatisch (kein Speichern-Button) — nach Reload vorausgefüllt', async ({ page }) => {
    await loginAs(page)
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await fillValidesFormular(page)

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/kcal-rechner')),
      page.getByRole('button', { name: 'Berechnen' }).click(),
    ])
    expect(response.status()).toBe(200)

    await page.reload()
    await expect(page.locator('#kcal-gewicht')).toHaveValue('80')
    await expect(page.locator('#kcal-groesse')).toHaveValue('180')
    await expect(page.locator('#kcal-alter')).toHaveValue('30')
    await expect(page.getByLabel('Männlich')).toBeChecked()
    await expect(page.getByText('2759 kcal', { exact: true })).toBeVisible()
  })

  test('AC: 5kg-Abweichung vom gespeicherten Gewicht zeigt einen Neu-berechnen-Hinweis', async ({ page }) => {
    await loginAs(page)
    await page.goto('/ernaehrung/so-geht-abnehmen')
    // Eigenständig: erst 80kg speichern, dann auf 86kg ändern (>=5kg Abweichung) und neu berechnen.
    await fillValidesFormular(page)
    await page.getByRole('button', { name: 'Berechnen' }).click()
    await expect(page.getByText('2759 kcal', { exact: true })).toBeVisible()

    await page.fill('#kcal-gewicht', '86')
    await page.getByRole('button', { name: 'Berechnen' }).click()
    await expect(page.getByText(/Gewicht hat sich um mehr als 5 kg verändert/)).toBeVisible()
  })

  test('AC: fehlschlagenes Speichern zeigt trotzdem das Ergebnis + Fehlerhinweis', async ({ page }) => {
    await loginAs(page)
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await page.route('**/api/kcal-rechner', (route) => route.fulfill({ status: 500, body: '{}' }))
    await fillValidesFormular(page)
    await page.getByRole('button', { name: 'Berechnen' }).click()
    await expect(page.getByText('2759 kcal', { exact: true })).toBeVisible()
    await expect(page.getByText(/Speichern fehlgeschlagen/)).toBeVisible()
  })
})

// ─── Seiten-Struktur ────────────────────────────────────────────────────────

test.describe('Seiten-Struktur "So geht abnehmen"', () => {
  test('AC: zeigt alle 5 Arbeitspunkte in der richtigen Reihenfolge', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    const main = page.locator('main')
    const text = await main.innerText()
    const positions = [
      'Kcal-Rechner',
      'Wöchentlich vs. Täglich',
      'Warum auf Proteine achten',
      'Krafttraining',
      'Schlaf / Erholung',
    ].map((label) => text.indexOf(label))
    expect(positions.every((p) => p >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  test('AC: Breadcrumb "Ernährung / So geht abnehmen" bleibt erhalten', async ({ page }) => {
    // ErnaehrungSubHeader ist wie alle Seiten-Header der App bewusst md:hidden (nur Mobile,
    // siehe PROJ-36 QA-Beobachtung) — Desktop nutzt stattdessen die persistente Top-Nav.
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/ernaehrung/so-geht-abnehmen')
    const breadcrumb = page.getByRole('navigation', { name: 'breadcrumb' })
    await expect(breadcrumb.getByRole('link', { name: 'Ernährung' })).toHaveAttribute('href', '/ernaehrung')
    await expect(breadcrumb.getByText('So geht abnehmen', { exact: true })).toBeVisible()
  })

  test('AC: Krafttraining-Arbeitspunkt verlinkt dezent auf /training', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await oeffneArbeitspunkt(page, 'Krafttraining')
    await expect(page.getByRole('link', { name: 'Trainingspläne findest du im Training-Bereich →' })).toHaveAttribute('href', '/training')
  })

  test('AC: Wöchentlich vs. Täglich zeigt beide Balkendiagramme mit den korrekten Captions', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await oeffneArbeitspunkt(page, 'Wöchentlich vs. Täglich')
    await expect(page.getByRole('img', { name: /Wie ein starrer Plan aussieht: Jeden Tag exakt gleich\./ })).toBeVisible()
    await expect(page.getByRole('img', { name: /Wie es wirklich aussieht: Mal mehr, mal weniger/ })).toBeVisible()
  })
})
