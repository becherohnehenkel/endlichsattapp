import { test, expect, Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'
// "Fenchelsalat" — nicht gast-sichtbar (aus PROJ-24/25 bekannt)
const NON_GUEST_RECIPE_ID = 'ac634f99-9290-4c47-b5d3-78f3c11744f3'

// PROJ-11 (Refinement, 2026-07-23): Diese Tests verändern den echten Zugriffs-Zustand
// (photo_scans_remaining, trial_ends_at, subscription_status) des QA-Testkontos über
// Supabase, weil der Zustand serverseitig beim Seitenaufruf gelesen wird (page.route()
// kann das nicht mocken — gleiches Prinzip wie PROJ-10). Seeding erfolgt manuell vor
// jedem QA-Durchgang; für CI fehlt wie bei PROJ-10 noch eine automatisierte
// Seed-Strategie. Tests laufen serialisiert (.serial), da sie sich denselben Account
// teilen.
//
// Kernänderung ggü. der Vor-Refinement-Version dieser Datei: kein Redirect zu /upgrade
// mehr — /analyse und /rezepte bleiben immer erreichbar, nur der Inhalt reduziert sich.
//
// WICHTIG: Der dauerhafte Baseline-Zustand des QA-Testkontos ist "voller Zugriff über
// invite_code_redeemed_at" (fest gesetzt, unabhängig vom Trial) — andere Test-Suiten
// (PROJ-8/24/25) nutzen dasselbe Konto, um beliebige nicht gast-sichtbare Rezepte zu
// öffnen, und würden ohne diese Baseline durch den jetzt korrekt greifenden
// Trial-Ablauf plötzlich den Sperrbildschirm sehen. Die Tests in DIESER Datei müssen
// `invite_code_redeemed_at` daher selbst temporär auf NULL setzen, um die
// eingeschränkten/Trial-Zustände zu testen, und danach wieder auf den Baseline-Wert
// zurücksetzen.

async function loginAs(page: Page) {
  await page.goto('/login?redirectTo=%2Fanalyse')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 8000 })
}

test.describe.serial('Reduzierter Zugriff (Trial abgelaufen, kein Abo, kein Invite-Code)', () => {
  // PRECONDITION: trial_ends_at = Vergangenheit, subscription_status = null,
  // invite_code_redeemed_at = NULL (temporär von der permanenten Baseline abweichend!),
  // photo_scans_remaining > 0

  test('/analyse/start bleibt erreichbar, kein Redirect zu /upgrade', async ({ page }) => {
    await loginAs(page)
    await page.goto('/analyse/start')
    await expect(page).toHaveURL(/\/analyse\/start/)
  })

  test('/analyse/start zeigt das Foto-Kontingent als Lifetime-Zähler ("übrig" statt "heute")', async ({ page }) => {
    await loginAs(page)
    await page.goto('/analyse/start')
    await expect(page.getByText(/von 5 Foto-Scans übrig/)).toBeVisible()
  })

  test('/rezepte bleibt erreichbar und zeigt die reduzierte Ansicht mit Upgrade-Link', async ({ page }) => {
    await loginAs(page)
    await page.goto('/rezepte')
    await expect(page).toHaveURL(/\/rezepte/)
    await expect(page.getByText('Eingeschränkte Auswahl')).toBeVisible()
    await expect(page.getByRole('link', { name: /jetzt pro werden/i })).toBeVisible()
  })

  test('Rezept-Detailseite eines nicht gast-sichtbaren Rezepts zeigt den Sperrbildschirm mit "Jetzt Pro werden"', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/${NON_GUEST_RECIPE_ID}`)
    await expect(page.getByText(/Dein Trial ist abgelaufen/)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Jetzt Pro werden' })).toBeVisible()
  })

  test('/upgrade zeigt die Vergleichstabelle mit "Aktuell"-Spalte', async ({ page }) => {
    await loginAs(page)
    await page.goto('/upgrade')
    await expect(page.getByText('Aktuell', { exact: true })).toBeVisible()
    await expect(page.getByText('Mit Pro', { exact: true })).toBeVisible()
    await expect(page.getByText('5 einmalig')).toBeVisible()
    await expect(page.getByText('Nur Gast-Auswahl')).toBeVisible()
  })

  test('"Jetzt freischalten" leitet zu einer von Stripe gehosteten Checkout-Seite weiter', async ({ page }) => {
    await loginAs(page)
    await page.goto('/upgrade')
    await page.getByRole('button', { name: /jetzt freischalten/i }).click()
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 })
  })
})

test.describe.serial('Voller Zugriff — 7-Tage-Trial aktiv', () => {
  // PRECONDITION: trial_ends_at = +3 Tage, subscription_status = null,
  // invite_code_redeemed_at = NULL (temporär — sonst nicht von der permanenten
  // Baseline unterscheidbar, siehe Kommentar am Dateianfang)

  test('/analyse/start zeigt den Trial-Countdown und das tägliche Foto-Kontingent', async ({ page }) => {
    await loginAs(page)
    await page.goto('/analyse/start')
    await expect(page.getByText(/Noch 3 Tage tägliche Foto-Analysen/)).toBeVisible()
    await expect(page.getByText(/Heute noch .* von 5 Foto-Scans/)).toBeVisible()
  })

  test('/rezepte zeigt den Trial-Countdown, keine eingeschränkte Ansicht, keine gesperrten Karten', async ({ page }) => {
    await loginAs(page)
    await page.goto('/rezepte')
    await expect(page.getByText(/Noch 3 Tage volle Rezeptbibliothek/)).toBeVisible()
    await expect(page.getByText('Eingeschränkte Auswahl')).toHaveCount(0)
  })

  test('/upgrade zeigt "Noch X Tage voller Zugriff" und die Vergleichstabelle mit "Nach Trial-Ende"-Spalte', async ({ page }) => {
    await loginAs(page)
    await page.goto('/upgrade')
    await expect(page.getByText('Noch 3 Tage voller Zugriff')).toBeVisible()
    await expect(page.getByText('Nach Trial-Ende')).toBeVisible()
  })
})

test.describe.serial('Aktives Abo', () => {
  // PRECONDITION: subscription_status = 'active', trial_ends_at = Vergangenheit (Trial irrelevant bei aktivem Abo)

  test('/analyse/start ist trotz abgelaufenem Trial erreichbar, ohne Redirect', async ({ page }) => {
    await loginAs(page)
    await page.goto('/analyse/start')
    await expect(page).toHaveURL(/\/analyse\/start/)
  })

  test('/rezepte ist trotz abgelaufenem Trial vollständig erreichbar, keine gesperrten Karten', async ({ page }) => {
    await loginAs(page)
    await page.goto('/rezepte')
    await expect(page).toHaveURL(/\/rezepte/)
    await expect(page.getByText('Eingeschränkte Auswahl')).toHaveCount(0)
  })

  test('/upgrade zeigt "Pro-Mitglied" statt Kaufangebot', async ({ page }) => {
    await loginAs(page)
    await page.goto('/upgrade')
    await expect(page.getByText(/Pro-Mitglied/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /abo verwalten/i })).toBeVisible()
  })
})

test.describe('Sicherheit — Rezept-API-Bypass (Regressionstest für BUG-2)', () => {
  // Kein DB-Seeding nötig — nutzt eine frische anonyme Gast-Session.
  // Vor dem Fix konnte JEDE authentifizierte Session (auch diese anonyme Gast-Session)
  // den vollen Rezeptinhalt per direktem API-Aufruf abrufen, obwohl die UI korrekt den
  // Sperrbildschirm zeigte — die API-Route prüfte nur "ist überhaupt eine Session da?",
  // nicht `is_guest_visible`/`hasAccess`. Siehe QA Test Results, BUG-2.
  test('GET /api/rezepte/[id] liefert 403 für ein nicht gast-sichtbares Rezept, wenn die UI den Sperrbildschirm zeigt', async ({ page }) => {
    await page.goto('/analyse/start')
    await page.waitForFunction(() => document.cookie.includes('sb-'), { timeout: 10000 })

    await page.goto(`/rezept/${NON_GUEST_RECIPE_ID}`)
    await expect(page.getByText('Kostenlos registrieren')).toBeVisible()

    const res = await page.request.get(`/api/rezepte/${NON_GUEST_RECIPE_ID}`)
    expect(res.status()).toBe(403)
  })
})
