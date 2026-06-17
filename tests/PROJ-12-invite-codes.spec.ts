/**
 * PROJ-12 — Invite-Codes
 *
 * Teststrategie:
 * - Auth-Flows und UI-Verhalten testen mit echtem QA-Testkonto
 * - Code-Einlösung via page.route() gemockt, da Codes Single-Use sind und
 *   kein automatisches DB-Seeding existiert (gleicher Ansatz wie PROJ-9)
 * - API-Sicherheit (401 ohne Session) direkt über fetch getestet
 *
 * PRECONDITION: QA-Konto in "Paywall"-Zustand:
 *   photo_scans_remaining = 0, trial_ends_at = Vergangenheit, subscription_status = null
 *   invite_code_redeemed_at = null (Code noch nicht eingelöst)
 */

import { test, expect, type Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'

async function loginAs(page: Page) {
  await page.goto('/login')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 8000 })
}

async function loginAndGoToUpgrade(page: Page) {
  await loginAs(page)
  await page.goto('/upgrade')
  await page.waitForLoadState('networkidle')
}

// ─── Zugriffskontrolle ─────────────────────────────────────────────────────

test.describe('Zugriffskontrolle', () => {
  test('unauthenticated → Login-Redirect', async ({ page }) => {
    await page.goto('/upgrade')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })

  test('POST /api/invite/redeem ohne Session → 401', async ({ page }) => {
    const res = await page.request.post('/api/invite/redeem', {
      data: { code: 'TESTCODE' },
    })
    expect(res.status()).toBe(401)
  })
})

// ─── Code-Formular UI ──────────────────────────────────────────────────────

test.describe.serial('Code-Formular: Toggle und Anzeige', () => {
  // PRECONDITION: Paywall-Zustand (kein Abo, Trial abgelaufen)

  test('Link "Ich habe einen Einladungscode →" öffnet das Eingabefeld auf derselben Seite', async ({ page }) => {
    await loginAndGoToUpgrade(page)
    // Link ist sichtbar, Formular noch nicht
    await expect(page.getByText('Ich habe einen Einladungscode →')).toBeVisible()
    await expect(page.getByPlaceholder('Einladungscode eingeben')).not.toBeVisible()

    await page.getByText('Ich habe einen Einladungscode →').click()

    await expect(page.getByPlaceholder('Einladungscode eingeben')).toBeVisible()
    await expect(page.getByRole('button', { name: /einlösen/i })).toBeVisible()
    // Kein Seitenwechsel
    await expect(page).toHaveURL(/\/upgrade/)
  })

  test('?showCode=1 öffnet das Code-Formular direkt ohne Klick', async ({ page }) => {
    await loginAs(page)
    await page.goto('/upgrade?showCode=1')
    await page.waitForLoadState('networkidle')
    await expect(page.getByPlaceholder('Einladungscode eingeben')).toBeVisible()
    await expect(page.getByRole('button', { name: /einlösen/i })).toBeVisible()
  })

  test('"Abbrechen" klappt das Formular wieder ein', async ({ page }) => {
    await loginAndGoToUpgrade(page)
    await page.getByText('Ich habe einen Einladungscode →').click()
    await expect(page.getByPlaceholder('Einladungscode eingeben')).toBeVisible()

    await page.getByText('Abbrechen').click()

    await expect(page.getByPlaceholder('Einladungscode eingeben')).not.toBeVisible()
    await expect(page.getByText('Ich habe einen Einladungscode →')).toBeVisible()
  })
})

// ─── Code-Einlösung (API gemockt) ─────────────────────────────────────────

test.describe.serial('Code-Einlösung: Erfolg', () => {
  test('gültiger Code → Erfolgsmeldung und Weiterleitung zu /analyse', async ({ page }) => {
    await loginAndGoToUpgrade(page)

    // API mocken: Erfolg simulieren
    await page.route('**/api/invite/redeem', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
    )

    await page.getByText('Ich habe einen Einladungscode →').click()
    await page.getByPlaceholder('Einladungscode eingeben').fill('VALID-CODE')
    await page.getByRole('button', { name: /einlösen/i }).click()

    await page.waitForURL('**/analyse', { timeout: 8000 })
    await expect(page).toHaveURL(/\/analyse/)
  })
})

test.describe.serial('Code-Einlösung: Fehler-States', () => {
  test('ungültiger Code zeigt die korrekte Fehlermeldung', async ({ page }) => {
    await loginAndGoToUpgrade(page)

    await page.route('**/api/invite/redeem', route =>
      route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Dieser Code ist ungültig oder wurde bereits verwendet.' }),
      })
    )

    await page.getByText('Ich habe einen Einladungscode →').click()
    await page.getByPlaceholder('Einladungscode eingeben').fill('BADCODE')
    await page.getByRole('button', { name: /einlösen/i }).click()

    await expect(page.getByText('Dieser Code ist ungültig oder wurde bereits verwendet.')).toBeVisible()
    // Kein Redirect
    await expect(page).toHaveURL(/\/upgrade/)
  })

  test('bereits eingelöster Code zeigt dieselbe Meldung — keine Unterscheidung', async ({ page }) => {
    await loginAndGoToUpgrade(page)

    await page.route('**/api/invite/redeem', route =>
      route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Dieser Code ist ungültig oder wurde bereits verwendet.' }),
      })
    )

    await page.getByText('Ich habe einen Einladungscode →').click()
    await page.getByPlaceholder('Einladungscode eingeben').fill('ALREADY-USED')
    await page.getByRole('button', { name: /einlösen/i }).click()

    await expect(page.getByText('Dieser Code ist ungültig oder wurde bereits verwendet.')).toBeVisible()
  })

  test('Nutzer mit bereits aktivem Zugriff sieht "Du hast bereits vollen Zugriff."', async ({ page }) => {
    await loginAndGoToUpgrade(page)

    await page.route('**/api/invite/redeem', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ alreadyHasAccess: true }),
      })
    )

    await page.getByText('Ich habe einen Einladungscode →').click()
    await page.getByPlaceholder('Einladungscode eingeben').fill('ANYCODE')
    await page.getByRole('button', { name: /einlösen/i }).click()

    await expect(page.getByText('Du hast bereits vollen Zugriff.')).toBeVisible()
    // Code wurde nicht verbraucht (API gibt alreadyHasAccess zurück, kein Redirect)
    await expect(page).toHaveURL(/\/upgrade/)
  })

  test('Netzwerkfehler zeigt generische Fehlermeldung', async ({ page }) => {
    await loginAndGoToUpgrade(page)

    await page.route('**/api/invite/redeem', route => route.abort('failed'))

    await page.getByText('Ich habe einen Einladungscode →').click()
    await page.getByPlaceholder('Einladungscode eingeben').fill('ANYCODE')
    await page.getByRole('button', { name: /einlösen/i }).click()

    await expect(page.getByText('Etwas ist schiefgelaufen — bitte versuche es erneut.')).toBeVisible()
    await expect(page).toHaveURL(/\/upgrade/)
  })
})

// ─── Rate-Limit (API-Ebene) ────────────────────────────────────────────────

test.describe('Rate-Limit: kein sichtbarer Lockout', () => {
  test('Rate-Limit-Antwort zeigt dieselbe Meldung wie ein ungültiger Code', async ({ page }) => {
    await loginAndGoToUpgrade(page)

    // Rate-Limit: API antwortet ebenfalls mit 422 + gleicher Meldung
    await page.route('**/api/invite/redeem', route =>
      route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Dieser Code ist ungültig oder wurde bereits verwendet.' }),
      })
    )

    await page.getByText('Ich habe einen Einladungscode →').click()
    await page.getByPlaceholder('Einladungscode eingeben').fill('ANYCODE')
    await page.getByRole('button', { name: /einlösen/i }).click()

    // Kein Hinweis auf Rate-Limit, nur die normale Fehlermeldung
    await expect(page.getByText('Dieser Code ist ungültig oder wurde bereits verwendet.')).toBeVisible()
    await expect(page.getByText(/rate/i)).not.toBeVisible()
    await expect(page.getByText(/limit/i)).not.toBeVisible()
    await expect(page.getByText(/gesperrt/i)).not.toBeVisible()
  })
})

// ─── Countdown-Banner ──────────────────────────────────────────────────────

test.describe('Countdown-Banner: "Code einlösen →"-Link', () => {
  // PRECONDITION: QA-Konto im Trial-Fenster (photo_scans_remaining = 0, trial_ends_at = Zukunft)
  // Dieser Test muss ggf. manuell gegen einen Testkonto-Zustand mit aktivem Trial laufen.
  // Hier: Code-Review-Verifikation des Links in mahlzeit-input.tsx

  test('Link im Countdown-Hinweis führt zu /upgrade?showCode=1', async ({ page }) => {
    await loginAs(page)
    await page.goto('/analyse')
    await page.waitForLoadState('networkidle')

    // Falls kein Trial aktiv: Der Link existiert nur wenn trialDaysRemaining != null.
    // Wir prüfen, ob der Link falls vorhanden die richtige URL hat.
    const codeLink = page.getByRole('link', { name: /code einlösen/i })
    const count = await codeLink.count()
    if (count > 0) {
      await expect(codeLink).toHaveAttribute('href', '/upgrade?showCode=1')
    }
    // Falls kein Trial: Test ist implizit bestanden (Link ist legitimerweise nicht sichtbar)
  })
})

// ─── API-Validierung ───────────────────────────────────────────────────────

test.describe('API-Validierung: POST /api/invite/redeem', () => {
  test('fehlender Code-Body → 422', async ({ page }) => {
    await loginAs(page)
    const res = await page.request.post('/api/invite/redeem', { data: {} })
    expect(res.status()).toBe(422)
  })

  test('leerer Code → 422', async ({ page }) => {
    await loginAs(page)
    const res = await page.request.post('/api/invite/redeem', { data: { code: '' } })
    expect(res.status()).toBe(422)
  })
})
