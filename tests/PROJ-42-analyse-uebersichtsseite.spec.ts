/**
 * PROJ-42 — Analyse-Übersichtsseite
 *
 * Teststrategie:
 * - Routing: /analyse zeigt die Hub-Seite, der bisherige Flow liegt jetzt unter
 *   /analyse/start, /historie leitet auf /analyse weiter
 * - Sektion 2 (Tagesübersicht) liest live aus meals/meal_analyses + profiles — nicht
 *   über page.route() mockbar (server-seitige Supabase-Queries, gleiches Prinzip wie
 *   PROJ-10/11). Assertions daher strukturell/flexibel (Regex auf "X von Y"), nicht auf
 *   exakte Zahlen, da das QA-Testkonto reale Historie ansammelt.
 * - Sektion 3 (Historie) bettet die bestehenden PROJ-6/17-Komponenten unverändert ein —
 *   hier nur auf Vorhandensein/Struktur geprüft, nicht auf Inhalte (die haben eigene Suiten).
 */

import { test, expect, type Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'

async function loginAs(page: Page) {
  await page.goto('/login?redirectTo=%2Fanalyse')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/analyse', { timeout: 8000 })
}

// ─── Routing ──────────────────────────────────────────────────────────────

test.describe('Routing', () => {
  test('AC: /analyse zeigt die Übersichtsseite, nicht den Analyse-Flow', async ({ page }) => {
    await page.goto('/analyse')
    await expect(page.getByRole('heading', { name: 'Lerne deine Ernährung kennen' })).toBeVisible()
    await expect(page.locator('textarea')).not.toBeVisible()
  })

  test('AC: Sektion-1-Karte navigiert zu /analyse/start, wo der Flow unverändert läuft', async ({ page }) => {
    await page.goto('/analyse')
    await page.getByText('Ernährungsanalyse starten').click()
    await page.waitForURL('**/analyse/start', { timeout: 8000 })
    await expect(page.locator('textarea')).toBeVisible()
  })

  test('AC: /historie leitet auf /analyse weiter', async ({ page }) => {
    await page.goto('/historie')
    await expect(page).toHaveURL(/\/analyse$/)
    await expect(page.getByRole('heading', { name: 'Lerne deine Ernährung kennen' })).toBeVisible()
  })
})

// ─── Sektion 1 — für Gäste und eingeloggte Nutzer identisch ────────────────

test.describe('Sektion 1 — Ernährungsanalyse starten', () => {
  test('AC: Karte mit Überschrift und Text ist für Gäste sichtbar und nutzbar', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/analyse')
    const karte = page.getByText('Ernährungsanalyse starten')
    await expect(karte).toBeVisible()
    await expect(page.getByText(/Springe direkt ins Tool/)).toBeVisible()
    await karte.click()
    await page.waitForURL('**/analyse/start', { timeout: 8000 })
  })
})

// ─── Sektion 2 — Tagesübersicht ─────────────────────────────────────────────

test.describe('Sektion 2 — Tagesübersicht', () => {
  test('AC: Gast sieht eine Login-Hinweis-Karte statt der Tagesübersicht', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/analyse')
    await expect(page.getByText('Melde dich an, um deinen Tagesfortschritt zu sehen.')).toBeVisible()
    const anmelden = page.getByRole('link', { name: 'Anmelden' }).first()
    await expect(anmelden).toHaveAttribute('href', '/konto?reason=tagesuebersicht')
  })

  test('AC: eingeloggter Nutzer sieht den Mahlzeiten-Fortschritt des Tages', async ({ page }) => {
    await loginAs(page)
    await expect(page.getByText(/\d+ von \d+ Mahlzeiten heute|Alle \d+ Mahlzeiten erledigt/)).toBeVisible()
  })

  test('AC: Restkalorien sind eingeklappt, Klick zeigt den genauen Wert oder einen Kcal-Rechner-Hinweis', async ({ page }) => {
    await loginAs(page)
    const trigger = page.getByText('Kannst du noch etwas essen?')
    await expect(trigger).toBeVisible()
    // Eingeklappt: weder eine kcal-Zahl noch der Kcal-Rechner-Hinweis sichtbar
    await expect(page.getByText(/kcal übrig heute|Kcal-Rechner ausfüllen/)).not.toBeVisible()
    await trigger.click()
    await expect(page.getByText(/kcal übrig heute|Kcal-Rechner ausfüllen|Kalorienziel ist heute schon erreicht/)).toBeVisible()
    await expect(page.getByText('Genauen Wert ausblenden')).toBeVisible()
  })
})

// ─── Sektion 3 — Historie der letzten Tage ──────────────────────────────────

test.describe('Sektion 3 — Historie der letzten Tage', () => {
  test('AC: Gast sieht eine Login-Hinweis-Karte statt der Historie', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/analyse')
    await expect(page.getByText('Melde dich an, um deine Analyse-Historie zu sehen.')).toBeVisible()
    const anmelden = page.getByRole('link', { name: 'Anmelden' }).last()
    await expect(anmelden).toHaveAttribute('href', '/konto?reason=historie')
  })

  test('AC: 3 Kategorie-Tabs sichtbar, "Mahlzeiten" ist standardmäßig aktiv', async ({ page }) => {
    await loginAs(page)
    const tabs = page.getByRole('tab')
    await expect(tabs).toHaveCount(3)
    await expect(page.getByRole('tab', { name: 'Mahlzeiten' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('tab', { name: 'Training' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Check-Ins' })).toBeVisible()
  })

  test('AC: aktiver Tab "Mahlzeiten" zeigt Wochenrückblick + Mahlzeiten-Liste (PROJ-6/17)', async ({ page }) => {
    await loginAs(page)
    await expect(page.getByText('Wochenrückblick', { exact: true })).toBeVisible({ timeout: 8000 })
  })

  test('AC: Klick auf "Training" zeigt "Bald verfügbar", keine Navigation, kein Fehler', async ({ page }) => {
    await loginAs(page)
    await page.getByRole('tab', { name: 'Training' }).click()
    await expect(page.getByText('Bald verfügbar.')).toBeVisible()
    await expect(page).toHaveURL(/\/analyse$/)
  })

  test('AC: Klick auf "Check-Ins" zeigt "Bald verfügbar", keine Navigation, kein Fehler', async ({ page }) => {
    await loginAs(page)
    await page.getByRole('tab', { name: 'Check-Ins' }).click()
    await expect(page.getByText('Bald verfügbar.')).toBeVisible()
    await expect(page).toHaveURL(/\/analyse$/)
  })
})

// ─── Startseite ──────────────────────────────────────────────────────────

test.describe('Startseite', () => {
  test('AC: "Mahlzeit analysieren"-Button ist aus dem Hero-Bereich entfernt', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Mahlzeit analysieren' })).not.toBeVisible()
    await expect(page.getByRole('heading', { name: /Wie komplett ist/ })).toBeVisible()
  })
})
