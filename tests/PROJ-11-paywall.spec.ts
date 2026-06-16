import { test, expect, Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'

// PROJ-11: Diese Tests verändern den echten Zugriffs-Zustand (photo_scans_remaining,
// trial_ends_at, subscription_status) des QA-Testkontos über Supabase, weil der Zustand
// serverseitig beim Seitenaufruf gelesen wird (page.route() kann das nicht mocken — gleiches
// Prinzip wie PROJ-10). Seeding erfolgte manuell während dieses QA-Durchgangs (siehe QA Test
// Results in features/PROJ-11-paywall.md); für CI fehlt wie bei PROJ-10 noch eine
// automatisierte Seed-Strategie. Tests laufen serialisiert (--workers=1 bzw. .serial), da sie
// sich denselben Account teilen.

async function loginAs(page: Page) {
  await page.goto('/login?redirectTo=%2Fanalyse')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
}

test.describe.serial('Paywall — kein Zugriff (Trial abgelaufen, kein Abo)', () => {
  // PRECONDITION: photo_scans_remaining = 0, trial_ends_at = Vergangenheit, subscription_status = null

  test('wird von /analyse zur Paywall-Seite weitergeleitet', async ({ page }) => {
    await loginAs(page)
    await page.waitForURL('**/upgrade', { timeout: 8000 })
  })

  test('wird von /rezepte zur Paywall-Seite weitergeleitet', async ({ page }) => {
    await loginAs(page)
    await page.waitForURL('**/upgrade', { timeout: 8000 })
    await page.goto('/rezepte')
    await page.waitForURL('**/upgrade', { timeout: 8000 })
  })

  test('zeigt Preis und "Jetzt freischalten" auf der Paywall-Seite', async ({ page }) => {
    await loginAs(page)
    await page.waitForURL('**/upgrade', { timeout: 8000 })
    await expect(page.getByText('4,99 €')).toBeVisible()
    await expect(page.getByRole('button', { name: /jetzt freischalten/i })).toBeVisible()
  })

  test('"Jetzt freischalten" leitet zu einer von Stripe gehosteten Checkout-Seite weiter', async ({ page }) => {
    await loginAs(page)
    await page.waitForURL('**/upgrade', { timeout: 8000 })
    await page.getByRole('button', { name: /jetzt freischalten/i }).click()
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 })
  })
})

test.describe.serial('Paywall — Übergangsfenster aktiv', () => {
  // PRECONDITION: photo_scans_remaining = 0, trial_ends_at = +3 Tage, subscription_status = null

  test('Mahlzeit-Eingabeseite bleibt erreichbar und zeigt den Countdown-Hinweis', async ({ page }) => {
    await loginAs(page)
    await page.waitForURL('**/analyse', { timeout: 8000 })
    await expect(page.getByText(/bis Freitext-Analyse & Rezepte ebenfalls eingeschränkt werden/i)).toBeVisible()
  })

  test('Rezeptbibliothek bleibt erreichbar und zeigt den Countdown-Hinweis', async ({ page }) => {
    await loginAs(page)
    await page.waitForURL('**/analyse', { timeout: 8000 })
    await page.goto('/rezepte')
    await expect(page).toHaveURL(/\/rezepte/)
    await expect(page.getByText(/bis Freitext-Analyse & Rezepte eingeschränkt werden/i)).toBeVisible()
  })
})

test.describe.serial('Paywall — aktives Abo', () => {
  // PRECONDITION: subscription_status = 'active', trial_ends_at = Vergangenheit (Trial irrelevant bei aktivem Abo)

  test('Mahlzeit-Eingabeseite ist trotz abgelaufenem Trial erreichbar', async ({ page }) => {
    await loginAs(page)
    await page.waitForURL('**/analyse', { timeout: 8000 })
  })

  test('Rezeptbibliothek ist trotz abgelaufenem Trial erreichbar', async ({ page }) => {
    await loginAs(page)
    await page.waitForURL('**/analyse', { timeout: 8000 })
    await page.goto('/rezepte')
    await expect(page).toHaveURL(/\/rezepte/)
  })

  test('Paywall-Seite zeigt "Pro-Mitglied" statt Kaufangebot', async ({ page }) => {
    await loginAs(page)
    await page.waitForURL('**/analyse', { timeout: 8000 })
    await page.goto('/upgrade')
    await expect(page.getByText(/Pro-Mitglied/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /abo verwalten/i })).toBeVisible()
  })
})
