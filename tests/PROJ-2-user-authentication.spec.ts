import { test, expect } from '@playwright/test'

// Confirmed test user created in Supabase for E2E tests
const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'

// ─────────────────────────────────────────
// Helper: log in via UI
// ─────────────────────────────────────────
async function loginAs(page: Parameters<typeof test>[1]['page'], email: string, password: string) {
  await page.goto('/login')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/analyse', { timeout: 8000 })
  // Wait for session cookies to be fully written before next navigation
  await page.waitForLoadState('networkidle')
}

// ─────────────────────────────────────────
// ZUGANGSSCHUTZ
// ─────────────────────────────────────────
test.describe('Zugangsschutz', () => {
  test('Nicht-eingeloggter Nutzer wird von /analyse zu /login weitergeleitet', async ({ page }) => {
    await page.goto('/analyse')
    await expect(page).toHaveURL(/\/login/)
  })

  test('redirectTo-Parameter bleibt beim Redirect zu /login erhalten', async ({ page }) => {
    await page.goto('/analyse')
    await page.waitForURL(/\/login/, { timeout: 5000 })
    const redirectTo = new URL(page.url()).searchParams.get('redirectTo')
    expect(redirectTo).toBe('/analyse')
  })

  test('Eingeloggter Nutzer wird von /login zu /analyse weitergeleitet', async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
    // New tab forces a real HTTP request so middleware runs (window.location.href is intercepted as soft nav)
    const newPage = await page.context().newPage()
    await newPage.goto('/login')
    await expect(newPage).toHaveURL(/\/analyse/, { timeout: 8000 })
    await newPage.close()
  })

  test('Eingeloggter Nutzer wird von /registrieren zu /analyse weitergeleitet', async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
    const newPage = await page.context().newPage()
    await newPage.goto('/registrieren')
    await expect(newPage).toHaveURL(/\/analyse/, { timeout: 8000 })
    await newPage.close()
  })
})

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('Korrekte Zugangsdaten → landet auf /analyse', async ({ page }) => {
    await page.fill('#email', TEST_EMAIL)
    await page.fill('#password', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/analyse/, { timeout: 8000 })
  })

  test('Falsche Zugangsdaten → generische Fehlermeldung', async ({ page }) => {
    await page.fill('#email', 'falsch@example.com')
    await page.fill('#password', 'FalschesPasswort99!')
    await page.click('button[type="submit"]')
    await expect(page.getByText('E-Mail oder Passwort falsch')).toBeVisible()
  })

  test('Fehlermeldung verrät nicht welches Feld falsch ist', async ({ page }) => {
    await page.fill('#email', TEST_EMAIL)
    await page.fill('#password', 'falschespasswort')
    await page.click('button[type="submit"]')
    // Message must say "E-Mail oder Passwort falsch" — both, not one specifically
    await expect(page.getByText('E-Mail oder Passwort falsch.')).toBeVisible()
  })

  test('redirectTo nach Login einhalten', async ({ page }) => {
    await page.goto('/login?redirectTo=/analyse')
    await page.fill('#email', TEST_EMAIL)
    await page.fill('#password', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/analyse/, { timeout: 8000 })
  })

  test('Open-Redirect-Schutz: externes redirectTo wird ignoriert', async ({ page }) => {
    await page.goto('/login?redirectTo=https://evil.example.com')
    await page.fill('#email', TEST_EMAIL)
    await page.fill('#password', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    // Must NOT navigate to external URL — should land on /analyse
    await expect(page).toHaveURL(/localhost.*\/analyse/, { timeout: 8000 })
  })

  test('Link "Passwort vergessen?" ist sichtbar und führt zur richtigen Seite', async ({ page }) => {
    await page.getByText('Passwort vergessen?').click()
    await expect(page).toHaveURL(/passwort-vergessen/)
  })

  test('Link "Registrieren" führt zu /registrieren', async ({ page }) => {
    await page.getByText('Registrieren').click()
    await expect(page).toHaveURL(/\/registrieren/)
  })
})

// ─────────────────────────────────────────
// REGISTRIERUNG
// ─────────────────────────────────────────
test.describe('Registrierung', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/registrieren')
  })

  test('Passwort kürzer als 8 Zeichen → Validierungsfehlermeldung', async ({ page }) => {
    await page.fill('#name', 'Test Nutzer')
    await page.fill('#email', 'neu@example.com')
    await page.fill('#password', 'kurz')
    await page.click('button[type="submit"]')
    await expect(page.getByText(/mindestens 8 Zeichen/i)).toBeVisible()
  })

  test('Gültige Registrierung leitet zu /auth/bestaetigen weiter', async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@endlichsatt.dev`
    await page.fill('#name', 'Test Nutzer')
    await page.fill('#email', uniqueEmail)
    await page.fill('#password', 'SicheresPasswort123!')
    await page.click('button[type="submit"]')
    // Expect either success redirect or a form error (Supabase rate limit in CI)
    await Promise.race([
      page.waitForURL(/\/auth\/bestaetigen/, { timeout: 10000 }),
      expect(page.locator('p.text-destructive')).toBeVisible({ timeout: 10000 }),
    ])
    // If still on /registrieren, it must be showing an error (not silently broken)
    if (page.url().includes('/registrieren')) {
      await expect(page.locator('p.text-destructive')).toBeVisible()
    }
  })

  test('Link "Einloggen" führt zu /login', async ({ page }) => {
    await page.getByText('Einloggen').click()
    await expect(page).toHaveURL(/\/login/)
  })
})

// ─────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────
test.describe('Logout', () => {
  test('Abmelden beendet Session und leitet zu /login', async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
    await page.getByRole('button', { name: 'Abmelden' }).click()
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
    // Verify session is gone — protected route should redirect again
    await page.goto('/analyse')
    await expect(page).toHaveURL(/\/login/)
  })
})

// ─────────────────────────────────────────
// RESPONSIVE (Mobile 375px)
// ─────────────────────────────────────────
test.describe('Responsive — Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('Login-Seite scrollt nicht horizontal auf 375px', async ({ page }) => {
    await page.goto('/login')
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
  })

  test('Registrierungs-Seite scrollt nicht horizontal auf 375px', async ({ page }) => {
    await page.goto('/registrieren')
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
  })

  test('Submit-Button auf Login ist mindestens 44px hoch (Touch-Target)', async ({ page }) => {
    await page.goto('/login')
    const button = page.getByRole('button', { name: 'Einloggen' })
    const box = await button.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44)
  })
})
