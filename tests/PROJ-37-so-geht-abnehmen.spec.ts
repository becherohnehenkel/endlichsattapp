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

// ─── Eiweißbedarf (Refinement 2026-09-03) ──────────────────────────────────

test.describe('Eiweißbedarf', () => {
  test('AC: zeigt Mindest- (96g) und optimale (120g) Eiweißmenge bei 80kg im 2-spaltigen Ergebnis-Layout', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await fillValidesFormular(page)
    await page.getByRole('button', { name: 'Berechnen' }).click()

    await expect(page.getByText('Dein Kalorienbedarf')).toBeVisible()
    await expect(page.getByText('Mindestens')).toBeVisible()
    await expect(page.getByText('96g', { exact: true })).toBeVisible()
    await expect(page.getByText('Optimal')).toBeVisible()
    await expect(page.getByText('120g', { exact: true })).toBeVisible()
    await expect(page.getByText('Eiweiß/Tag')).toHaveCount(2)
  })

  test('AC: Eiweißmenge bleibt beim Wechsel des Ziels unverändert (nur vom Gewicht abhängig)', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await fillValidesFormular(page)
    await page.getByRole('button', { name: 'Berechnen' }).click()
    await expect(page.getByText('96g', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Muskeln aufbauen' }).click()
    await page.getByRole('button', { name: 'Berechnen' }).click()
    await expect(page.getByText('3035 kcal', { exact: true })).toBeVisible() // bestätigt: Ziel hat wirklich gewechselt
    await expect(page.getByText('96g', { exact: true })).toBeVisible()
    await expect(page.getByText('120g', { exact: true })).toBeVisible()
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
  test('AC: zeigt die Überschrift und den Intro-Text oberhalb der Arbeitspunkte', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await expect(page.getByRole('heading', { name: 'So geht abnehmen', exact: true })).toBeVisible()
    await expect(page.getByText(/kommen wir nicht dran vorbei/)).toBeVisible()
    await expect(page.getByText(/Allen voran das Kaloriendefizit/)).toBeVisible()
  })

  test('AC: zeigt alle 6 Arbeitspunkte in der richtigen Reihenfolge (Refinement 2026-09-03: neuer Ballaststoffe-Punkt)', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    // Wartet auf den letzten Arbeitspunkt (nicht nur die Überschrift), damit die komplette
    // Arbeitspunkte-Liste sicher gerendert ist, bevor main.innerText() gelesen wird.
    await expect(page.getByRole('button', { name: 'Schlaf / Erholung' })).toBeVisible()
    const main = page.getByRole('main')
    const text = await main.innerText()
    const positions = [
      'Kcal-Rechner',
      'Wöchentlich vs. tägliches Kaloriendefizit',
      'Warum auf Proteine achten',
      'Warum auf Ballaststoffe achten',
      'Krafttraining',
      'Schlaf / Erholung',
    ].map((label) => text.indexOf(label))
    expect(positions.every((p) => p >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  test('AC: Intro-Text spricht von 6 Punkten (Refinement 2026-09-03)', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await expect(page.getByText(/An den folgenden 6 Punkten kommen wir nicht dran vorbei/)).toBeVisible()
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

  test('AC: Wöchentlich vs. tägliches Kaloriendefizit zeigt beide Balkendiagramme mit den korrekten Captions', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await oeffneArbeitspunkt(page, 'Wöchentlich vs. tägliches Kaloriendefizit')
    await expect(page.getByRole('img', { name: /Wie ein starrer Plan aussieht: Jeden Tag exakt gleich viele Kalorien/ })).toBeVisible()
    await expect(page.getByRole('img', { name: /Wie es wirklich aussieht: Mal mehr Kalorien, mal weniger — im Schnitt trotzdem im Defizit/ })).toBeVisible()
  })

  test('AC (Refinement 2026-09-03): beide Diagramme sind gestapelt (nicht nebeneinander) und zeigen Mo–So unter jedem Balken', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await oeffneArbeitspunkt(page, 'Wöchentlich vs. tägliches Kaloriendefizit')
    const box1 = page.getByRole('img', { name: /Wie ein starrer Plan aussieht/ })
    const box2 = page.getByRole('img', { name: /Wie es wirklich aussieht/ })
    await expect(box1).toBeVisible()
    await expect(box2).toBeVisible()
    // Gestapelt statt nebeneinander: Box 2 liegt unterhalb von Box 1 (gleiche X-Achse in etwa, größere Y-Position).
    const box1Bounds = await box1.boundingBox()
    const box2Bounds = await box2.boundingBox()
    expect(box1Bounds).not.toBeNull()
    expect(box2Bounds).not.toBeNull()
    expect(box2Bounds!.y).toBeGreaterThan(box1Bounds!.y)

    // Die Wochentag-Labels liegen unterhalb des role="img"-Balken-Containers, als eigene
    // Zeile in derselben Box — daher über den gemeinsamen Eltern-Container (Titel-<p>) scopen.
    const box1Container = page.getByText('Wie ein starrer Plan aussieht', { exact: true }).locator('xpath=..')
    const box2Container = page.getByText('Wie es wirklich aussieht', { exact: true }).locator('xpath=..')
    for (const tag of ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']) {
      await expect(box1Container.getByText(tag, { exact: true })).toBeVisible()
      await expect(box2Container.getByText(tag, { exact: true })).toBeVisible()
    }
  })
})

// ─── Arbeitspunkt 4: Ballaststoffe (Refinement 2026-09-03 — komplett neu) ──

test.describe('Arbeitspunkt 4: Warum auf Ballaststoffe achten', () => {
  test('AC: zeigt den Erklärtext zu Ballaststoffen', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await oeffneArbeitspunkt(page, 'Warum auf Ballaststoffe achten')
    await expect(page.getByText(/kein Ballast für den Körper sondern wichtig für deine Verdauung und Sättigung/)).toBeVisible()
  })

  test('AC: zeigt die Amber-Warnbox mit dem 5g/4-Wochen-Hinweis', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await oeffneArbeitspunkt(page, 'Warum auf Ballaststoffe achten')
    await expect(page.getByText(/Achtung: Bitte maximal 5g Ballaststoffe mehr pro 4 Wochen/)).toBeVisible()
  })

  test('AC: zeigt die grüne Info-Box mit dem Ziel-Richtwert', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await oeffneArbeitspunkt(page, 'Warum auf Ballaststoffe achten')
    await expect(page.getByText(/Ziel-Richtwert: Mindestens 30 Ballaststoffe pro Tag\. Heißt ca\. 10g pro Mahlzeit\./)).toBeVisible()
  })

  test('AC: listet alle 4 Ballaststoffquellen-Kategorien', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await oeffneArbeitspunkt(page, 'Warum auf Ballaststoffe achten')
    await expect(page.getByText('Vollkornprodukte & Pseudogetreide:')).toBeVisible()
    await expect(page.getByText(/Brot, Wraps, Haferflocken, Quinoa, Amaranth/)).toBeVisible()
    await expect(page.getByText('Hülsenfrüchte:')).toBeVisible()
    await expect(page.getByText(/Linsen, Bohnen, \(Kicher-\)Erbsen/)).toBeVisible()
    await expect(page.getByText('Gemüse und Obst:')).toBeVisible()
    await expect(page.getByText(/Brokkoli, Karotten, Fenchel, Beeren/)).toBeVisible()
    await expect(page.getByText('Nüsse, Saaten und Kerne:')).toBeVisible()
    await expect(page.getByText(/insbesondere Lein-, Chia- und Flohsamen/)).toBeVisible()
  })
})

// ─── Arbeitspunkt 5: Krafttraining-Icons (Refinement 2026-09-03) ───────────

test.describe('Arbeitspunkt 5: Krafttraining-Vergleichsicons', () => {
  test('AC: zeigt für "Muskeln erhalten" das Lucide BicepsFlexed-Icon in klein und groß', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await oeffneArbeitspunkt(page, 'Krafttraining')
    await expect(page.locator('svg.lucide-biceps-flexed')).toHaveCount(2)
  })

  test('AC: zeigt alle 4 nummerierten Krafttraining-Gründe mit Text', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await oeffneArbeitspunkt(page, 'Krafttraining')
    await expect(page.getByText(/1\. Muskeln erhalten/)).toBeVisible()
    await expect(page.getByText(/2\. Grundumsatz/)).toBeVisible()
    await expect(page.getByText(/3\. Gesund altern/)).toBeVisible()
    await expect(page.getByText(/4\. Körper formen/)).toBeVisible()
  })

  test('AC: jeder der 4 Gründe zeigt ein eigenes Vergleichsicon-Paar (klein + groß = 2 SVGs pro Zeile)', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await oeffneArbeitspunkt(page, 'Krafttraining')
    const zeilen = [
      /1\. Muskeln erhalten/,
      /2\. Grundumsatz/,
      /3\. Gesund altern/,
      /4\. Körper formen/,
    ]
    for (const text of zeilen) {
      const zeile = page.locator('div.flex.items-start.gap-3', { hasText: text })
      await expect(zeile.locator('svg')).toHaveCount(2)
    }
  })
})

// ─── Fortschrittsanzeige (Regression, Refinement 2026-09-03) ──────────────

test.describe('Fortschrittsanzeige zählt jetzt 6 statt 5 Punkte', () => {
  test('AC: "X von 6 abgeschlossen" — neuer Ballaststoffe-Punkt zählt korrekt mit', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await expect(page.getByText('0 von 6 abgeschlossen')).toBeVisible()

    await oeffneArbeitspunkt(page, 'Warum auf Ballaststoffe achten')
    await page.getByRole('button', { name: 'Verstanden' }).click()
    await expect(page.getByText('1 von 6 abgeschlossen')).toBeVisible()
  })
})

// ─── Arbeitspunkt 6: Schlaf-Icon (Refinement 2026-09-03) ───────────────────

test.describe('Arbeitspunkt 6: Schlaf-Icon', () => {
  test('AC: zeigt das Schlaf-Icon neben dem Erklärtext', async ({ page }) => {
    await page.goto('/ernaehrung/so-geht-abnehmen')
    await oeffneArbeitspunkt(page, 'Schlaf / Erholung')
    await expect(page.getByText(/Ein übermüdeter Körper hat mehr Hunger/)).toBeVisible()
    const row = page.locator('div.flex.items-start.gap-3', { hasText: /Ein übermüdeter Körper hat mehr Hunger/ })
    await expect(row.locator('svg')).toHaveCount(1)
  })
})
