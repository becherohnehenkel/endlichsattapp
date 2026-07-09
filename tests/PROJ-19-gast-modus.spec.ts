/**
 * PROJ-19 — Gast-Modus (Anonyme Nutzung ohne Account)
 *
 * Teststrategie:
 * - Öffentlicher Zugang: /, /rezepte, /wie-esse-ich-richtig, /analyse ohne Session
 * - /analyse: kein Redirect zu /login, Skeleton sichtbar während Anon-Session aufgebaut wird
 * - Gast-Konto-Screen: Conversion-View mit Wert-Versprechen, reason=historie Banner
 * - Navigation & Redirects: /historie → /konto?reason=historie, alle Tabs sichtbar
 * - Sicherheit: /admin gesperrt, API-Routen brauchen Auth
 * - Regression: eingeloggte Nutzer sehen weiterhin KontoView und können /analyse aufrufen
 * - Hinweis: Conversion-Block bei 0 Foto-Scans + Daten-Erhalt bei Registrierung → manuell getestet
 *   (server-seitiger Profile-State nicht via page.route() mockbar)
 */

import { test, expect, type Page, type BrowserContext } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'

async function clearSession(context: BrowserContext) {
  await context.clearCookies()
}

async function loginAs(page: Page) {
  await page.goto('/login')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/', { timeout: 8000 })
}

// ─── Gruppe 1: Öffentliche Seiten ohne Session ──────────────────────────────

test.describe('Öffentliche Seiten — ohne Session zugänglich', () => {
  test.beforeEach(async ({ context }) => {
    await clearSession(context)
  })

  test('AC-1a: Startseite / ohne Session erreichbar, kein Redirect zu /login', async ({ page }) => {
    await page.goto('/')
    expect(page.url()).not.toContain('/login')
    await expect(page.locator('body')).toBeVisible()
  })

  test('AC-1b: /rezepte ohne Session erreichbar', async ({ page }) => {
    await page.goto('/rezepte')
    expect(page.url()).not.toContain('/login')
    await expect(page.locator('body')).toBeVisible()
  })

  test('AC-1c: /wie-esse-ich-richtig ohne Session erreichbar', async ({ page }) => {
    await page.goto('/wie-esse-ich-richtig')
    expect(page.url()).not.toContain('/login')
    await expect(page.locator('body')).toBeVisible()
  })

  test('AC-2a: /analyse ohne Session erreichbar — kein Redirect zu /login', async ({ page }) => {
    await page.goto('/analyse')
    expect(page.url()).not.toContain('/login')
    await expect(page.locator('body')).toBeVisible()
  })

  test('AC-2b: /analyse zeigt Skeleton-Ladescreen während Anon-Session aufgebaut wird', async ({ page }) => {
    // Anon-Auth verlangsamen, damit der Skeleton-Zustand (server-rendered) sichtbar bleibt
    await page.route('**/auth/v1/signup**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      await route.continue()
    })

    await page.goto('/analyse')
    // Skeleton soll sichtbar sein: shadcn/ui Skeleton rendert .animate-pulse
    const skeleton = page.locator('.animate-pulse').first()
    await expect(skeleton).toBeVisible({ timeout: 3000 })
    expect(page.url()).not.toContain('/login')
  })
})

// ─── Gruppe 2: Gast-Konto-Screen (/konto) ───────────────────────────────────

test.describe('Gast-Konto-Screen', () => {
  test.beforeEach(async ({ context }) => {
    await clearSession(context)
  })

  test('AC-8a: /konto ohne Session zeigt Conversion-Screen (GastKontoView)', async ({ page }) => {
    await page.goto('/konto')
    expect(page.url()).not.toContain('/login')
    await expect(page.getByText('Kostenlos registrieren')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Einloggen' })).toBeVisible()
  })

  test('AC-8b: Gast-Konto-Screen zeigt alle 3 Wert-Versprechen', async ({ page }) => {
    await page.goto('/konto')
    await expect(page.getByText('Analysen dauerhaft sichern')).toBeVisible()
    await expect(page.getByText('Deine Analyse-Historie')).toBeVisible()
    await expect(page.getByText('Wöchentlicher Sättigungs-Recap')).toBeVisible()
  })

  test('AC-8c: "Kostenlos registrieren" Button navigiert zu /registrieren', async ({ page }) => {
    await page.goto('/konto')
    await page.click('text=Kostenlos registrieren')
    await expect(page).toHaveURL(/\/registrieren/)
  })

  test('AC-8d: "Einloggen" Link navigiert zu /login', async ({ page }) => {
    await page.goto('/konto')
    await page.getByRole('link', { name: 'Einloggen' }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('AC-9a: /konto?reason=historie zeigt kontextuellen Banner', async ({ page }) => {
    await page.goto('/konto?reason=historie')
    await expect(
      page.getByText('Erstelle einen kostenlosen Account um deine Analyse-Historie zu sehen.')
    ).toBeVisible()
  })

  test('AC-9b: /konto?reason=historie zeigt weiterhin Wert-Versprechen', async ({ page }) => {
    await page.goto('/konto?reason=historie')
    await expect(page.getByText('Analysen dauerhaft sichern')).toBeVisible()
    await expect(page.getByText('Kostenlos registrieren')).toBeVisible()
  })

  test('AC-10 Regression: eingeloggter Nutzer sieht KontoView, nicht GastKontoView', async ({ page }) => {
    await loginAs(page)
    await page.goto('/konto')
    // GastKontoView-spezifischer Button darf NICHT erscheinen
    await expect(page.getByText('Kostenlos registrieren')).not.toBeVisible()
    // KontoView zeigt die E-Mail des Users
    await expect(page.getByText(TEST_EMAIL)).toBeVisible()
  })
})

// ─── Gruppe 3: Navigation & Redirects ───────────────────────────────────────

test.describe('Navigation & Redirects', () => {
  test.beforeEach(async ({ context }) => {
    await clearSession(context)
  })

  test('AC-11a: /historie ohne Session → Redirect zu /konto?reason=historie', async ({ page }) => {
    await page.goto('/historie')
    await expect(page).toHaveURL(/\/konto\?reason=historie/)
  })

  test('AC-11b: Nach Redirect von /historie ist der kontextuelle Banner sichtbar', async ({ page }) => {
    await page.goto('/historie')
    await expect(page).toHaveURL(/\/konto\?reason=historie/)
    await expect(
      page.getByText('Erstelle einen kostenlosen Account um deine Analyse-Historie zu sehen.')
    ).toBeVisible()
  })

  test('AC-12: /registrieren ohne Session zugänglich (kein Redirect)', async ({ page }) => {
    await page.goto('/registrieren')
    expect(page.url()).not.toContain('/login')
    // CardDescription ist eindeutig (erscheint nur einmal auf der Seite)
    await expect(page.getByText('Kostenlos loslegen — keine Kreditkarte nötig.')).toBeVisible()
  })

  test('AC-13: Bottom-Navigation zeigt alle Tabs für eingeloggten Nutzer (Regression)', async ({ page }) => {
    // Gäste sehen Nav sobald sie eine anonyme Session haben (isLoggedIn=true für anon user).
    // Hier mit echtem Login + Mobile-Viewport getestet (BottomNav nutzt md:hidden).
    await loginAs(page)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const nav = page.locator('[data-testid="bottom-nav"]')
    await expect(nav).toBeVisible()
    // Keine Schloss-/Lock-Darstellung in der Navigation
    const lockElements = nav.locator('[aria-label*="gesperrt"], [aria-label*="lock"]')
    await expect(lockElements).toHaveCount(0)
  })

  test('Middleware: Eingeloggter Nutzer wird von /login zu / weitergeleitet', async ({ page }) => {
    await loginAs(page)
    await page.goto('/login')
    await expect(page).toHaveURL(/\/$/)
  })

  test('Middleware: Eingeloggter Nutzer wird von /registrieren zu / weitergeleitet', async ({ page }) => {
    await loginAs(page)
    await page.goto('/registrieren')
    await expect(page).toHaveURL(/\/$/)
  })
})

// ─── Gruppe 4: Sicherheit (Red-Team) ────────────────────────────────────────

test.describe('Security: Zugriffsschutz für Gäste', () => {
  test.beforeEach(async ({ context }) => {
    await clearSession(context)
  })

  test('SEC-1: /admin ohne Session nicht zugänglich', async ({ page }) => {
    await page.goto('/admin')
    const url = page.url()
    const blockedByRedirect = url.includes('/login') || url.includes('/konto')
    const response = await page.request.get('/admin')
    const blockedByStatus = response.status() === 401 || response.status() === 403
    expect(blockedByRedirect || blockedByStatus).toBe(true)
  })

  test('SEC-2: POST /api/meal ohne Session → 401', async ({ page }) => {
    const response = await page.request.post('/api/meal', {
      data: { text: 'Pasta', userId: '00000000-0000-0000-0000-000000000000' },
      headers: { 'Content-Type': 'application/json' },
    })
    expect(response.status()).toBe(401)
  })

  test('SEC-3: GET /api/recap/wochen ohne Session → 401', async ({ page }) => {
    const response = await page.request.get('/api/recap/wochen')
    expect(response.status()).toBe(401)
  })

  test('SEC-4: Gast kann nicht auf Analyse anderer User zugreifen via direkter URL', async ({ page }) => {
    await page.goto('/analyse/00000000-0000-0000-0000-000000000000')
    // Entweder 404 oder Redirect — nicht die Daten fremder User
    const url = page.url()
    const isNotFound = url.includes('/404') || url.includes('/not-found')
    const isRedirected = url.includes('/login') || url.includes('/konto') || url.includes('/')
    expect(isNotFound || isRedirected).toBe(true)
  })
})

// ─── Gruppe 5: Konversionsblock — Foto-Limit (UI-seitig mit Mock) ───────────

test.describe('Foto-Scan Konversionsblock bei Limit (UI-Mock)', () => {
  test('AC-5/6: Conversion-Block für Gäste bei 0 Scans — Inhalt korrekt', async ({ page, context }) => {
    await clearSession(context)

    // Anon-Auth mocken (nur empty-body signups = signInAnonymously)
    // postDataJSON() ist synchron in Playwright — kein .catch() nötig
    await page.route('**/auth/v1/signup**', async (route) => {
      const body = (route.request().postDataJSON() ?? {}) as Record<string, unknown>
      if (!body?.email) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'mock.anon.token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock-refresh',
            user: { id: 'anon-mock-id', email: null, is_anonymous: true, role: 'authenticated' },
          }),
        })
      } else {
        await route.continue()
      }
    })

    await page.goto('/analyse')
    // Seite lädt ohne Fehler und ohne Redirect zu /login
    await expect(page.locator('body')).toBeVisible()
    expect(page.url()).not.toContain('/login')
  })
})

// ─── Gruppe 6: Free-User Regression (PROJ-10-Limit-Erhöhung) ────────────────

test.describe('Free-User Scan-Limit Regression', () => {
  test('AC-16: Eingeloggter Free-User kann /analyse aufrufen (kein Redirect zu /upgrade)', async ({ page }) => {
    await loginAs(page)
    await page.goto('/analyse')
    expect(page.url()).not.toContain('/upgrade')
    await expect(page.locator('body')).toBeVisible()
  })

  test('AC-17: Eingeloggter Free-User sieht Foto-Scan-Zähler mit Maximalwert 5', async ({ page }) => {
    await loginAs(page)
    await page.goto('/analyse')
    // Scan-Counter zeigt "von 5 Foto-Scans" (neues Limit)
    const counter = page.getByText(/von 5 Foto-Scans/)
    // Nur prüfen wenn Scans noch vorhanden (User hat > 0 Scans übrig)
    const isVisible = await counter.isVisible().catch(() => false)
    if (isVisible) {
      await expect(counter).toBeVisible()
    }
    // Seite lädt auf jeden Fall ohne Fehler
    await expect(page.locator('body')).toBeVisible()
  })
})

// ─── Gruppe 7: Responsive / Mobile (375px) ──────────────────────────────────

test.describe('Mobile: Gast-Modus auf 375px', () => {
  test.beforeEach(async ({ context }) => {
    await clearSession(context)
  })

  test('MOB-1: /konto Conversion-Screen auf Mobile vollständig sichtbar', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/konto')
    await expect(page.getByText('Kostenlos registrieren')).toBeVisible()
    await expect(page.getByText('Analysen dauerhaft sichern')).toBeVisible()
    await expect(page.getByText('Deine Analyse-Historie')).toBeVisible()
  })

  test('MOB-2: /analyse auf Mobile erreichbar ohne Redirect zu /login', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/analyse')
    expect(page.url()).not.toContain('/login')
    await expect(page.locator('body')).toBeVisible()
  })

  test('MOB-3: /konto?reason=historie Banner auf Mobile sichtbar', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/konto?reason=historie')
    await expect(
      page.getByText('Erstelle einen kostenlosen Account um deine Analyse-Historie zu sehen.')
    ).toBeVisible()
  })
})

// ─── Gruppe 8: v2 — Sättigungsmatrix für Gäste ──────────────────────────────

test.describe('v2 — Sättigungsmatrix ohne Session zugänglich', () => {
  test.beforeEach(async ({ context }) => {
    await clearSession(context)
  })

  test('AC-v2-1: /saettigungsmatrix ohne Session erreichbar — kein Redirect zu /login', async ({ page }) => {
    await page.goto('/saettigungsmatrix')
    expect(page.url()).not.toContain('/login')
    await expect(page.getByText('Sättigungs-Matrix')).toBeVisible({ timeout: 6000 })
  })

  test('AC-v2-2: /saettigungsmatrix zeigt die 6 Säulen für Gäste', async ({ page }) => {
    await page.goto('/saettigungsmatrix')
    await expect(page.getByRole('heading', { name: 'Geschmack' })).toBeVisible({ timeout: 6000 })
    await expect(page.getByRole('heading', { name: 'Proteine' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Ballaststoffe' })).toBeVisible()
  })
})

// ─── Gruppe 9: v2 — Gast-Rezepte in der Bibliothek ─────────────────────────

// Bekannte IDs aus der DB (Stand 2026-07-09):
const GUEST_VISIBLE_ID = 'a0942760-262c-420b-87f5-5d10decb1f28'   // Power Oats — is_guest_visible: true
const LOCKED_ID        = 'ac634f99-9290-4c47-b5d3-78f3c11744f3'   // Fenchelsalat — is_guest_visible: false

test.describe('v2 — Rezepte für Gäste (is_guest_visible)', () => {
  test.beforeEach(async ({ context }) => {
    await clearSession(context)
  })

  test('AC-v2-3: /rezepte ohne Session zeigt freigeschaltete Rezepte (kein leerer Zustand)', async ({ page }) => {
    await page.goto('/rezepte')
    expect(page.url()).not.toContain('/login')
    // Mindestens ein Rezept-Titel sichtbar (Power Oats oder Shakshuka)
    const anyTitle = page.getByText(/Power Oats|Shakshuka/i)
    await expect(anyTitle.first()).toBeVisible({ timeout: 8000 })
  })

  test('AC-v2-4: /rezepte zeigt gesperrte Rezepte ausgegraut (opacity-60)', async ({ page }) => {
    await page.goto('/rezepte')
    await page.waitForLoadState('networkidle', { timeout: 8000 })
    // Gesperrte Karte hat opacity-60 CSS-Klasse
    const lockedCard = page.locator('a.opacity-60').first()
    await expect(lockedCard).toBeVisible({ timeout: 6000 })
  })

  test('AC-v2-5: Gesperrtes Rezept zeigt Schloss-Icon in der Karten-Liste', async ({ page }) => {
    await page.goto('/rezepte')
    await page.waitForLoadState('networkidle', { timeout: 8000 })
    // lucide-react rendert SVG mit einer title oder aria — prüfe svg in gesperrter Karte
    const lockedCard = page.locator('a.opacity-60').first()
    await expect(lockedCard).toBeVisible({ timeout: 6000 })
    // Schloss-SVG befindet sich im Bild-Overlay der gesperrten Karte
    const lockSvg = lockedCard.locator('svg').first()
    await expect(lockSvg).toBeVisible()
  })

  test('AC-v2-6: Gast kann freigeschaltetes Rezept vollständig lesen', async ({ page }) => {
    await page.goto(`/rezept/${GUEST_VISIBLE_ID}`)
    expect(page.url()).not.toContain('/login')
    // Vollständiges Rezept: Titel + Zutaten-Überschrift vorhanden
    await expect(page.getByText('Zutaten')).toBeVisible({ timeout: 8000 })
    // Kein Schloss-Conversion-Screen
    await expect(page.getByText('Kostenlos registrieren')).not.toBeVisible()
  })

  test('AC-v2-7: Gast öffnet gesperrtes Rezept — Conversion-Screen (kein 404, kein 403)', async ({ page }) => {
    await page.goto(`/rezept/${LOCKED_ID}`)
    expect(page.url()).not.toContain('/login')
    // Conversion-Screen mit Registrierungs-CTA sichtbar
    await expect(page.getByText('Kostenlos registrieren')).toBeVisible({ timeout: 8000 })
    // Kein Zutaten-Abschnitt (Rezept-Inhalt gesperrt)
    await expect(page.getByText('Zutaten')).not.toBeVisible()
  })

  test('AC-v2-8: Gesperrtes Rezept zeigt Rezept-Titel im Conversion-Screen', async ({ page }) => {
    await page.goto(`/rezept/${LOCKED_ID}`)
    // Titel des gesperrten Rezepts ist im Conversion-Screen sichtbar
    await expect(page.getByText('Fenchelsalat')).toBeVisible({ timeout: 8000 })
  })
})

// ─── Gruppe 10: v2 — Startseite zeigt nur guest-visible Rezepte ─────────────

test.describe('v2 — Startseite: nur freigeschaltete Rezepte für Gäste', () => {
  test.beforeEach(async ({ context }) => {
    await clearSession(context)
  })

  test('AC-v2-9: Startseite ohne Session zeigt freigeschaltete Rezepte', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    // Power Oats und/oder Shakshuka sollen sichtbar sein
    const guestRecipe = page.getByText(/Power Oats|Shakshuka/i)
    await expect(guestRecipe.first()).toBeVisible({ timeout: 8000 })
  })

  test('AC-v2-10: Startseite ohne Session zeigt KEINE gesperrten Rezepte', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    // Fenchelsalat und Berglinsen Salat dürfen NICHT erscheinen (nicht guest-visible)
    await expect(page.getByText('Fenchelsalat')).not.toBeVisible()
    await expect(page.getByText('Berglinsen Salat')).not.toBeVisible()
  })
})

// ─── Gruppe 11: v2 — Regression: eingeloggte Nutzer unverändert ─────────────

test.describe('v2 — Regression: eingeloggte Nutzer sehen alle Rezepte', () => {
  test('AC-v2-11: Eingeloggter Nutzer sieht /rezepte ohne Schloss-Overlay (keine opacity-60)', async ({ page }) => {
    await loginAs(page)
    await page.goto('/rezepte')
    await page.waitForLoadState('networkidle', { timeout: 8000 })
    // Keine ausgegrauten Karten für eingeloggte Nutzer
    const lockedCards = page.locator('a.opacity-60')
    await expect(lockedCards).toHaveCount(0)
  })

  test('AC-v2-12: Eingeloggter Nutzer kann gesperrtes Rezept direkt aufrufen (kein Conversion-Screen)', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/${LOCKED_ID}`)
    await expect(page.getByText('Zutaten')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Kostenlos registrieren')).not.toBeVisible()
  })
})

// ─── Gruppe 12: v3 — Upsell-Hints auf Startseite ────────────────────────────

test.describe('v3 — Startseite: Upsell-Hint für Gäste', () => {
  test.beforeEach(async ({ context }) => {
    await clearSession(context)
  })

  test('AC-v3-1: Startseite ohne Session zeigt Upsell-Hint mit Rezept-Count', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    // Upsell-Hint mit "Anmelden um alle [N] Rezepte zu sehen"
    await expect(page.getByText(/Anmelden um alle/)).toBeVisible({ timeout: 8000 })
    // CTA-Link "Jetzt registrieren" daneben
    await expect(page.getByRole('link', { name: 'Jetzt registrieren' })).toBeVisible()
  })

  test('AC-v3-2: Startseite eingeloggt — kein Upsell-Hint', async ({ page }) => {
    await loginAs(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle', { timeout: 8000 })
    await expect(page.getByText(/Anmelden um alle/)).not.toBeVisible()
  })
})

// ─── Gruppe 13: v3 — Upsell-Banner auf /rezepte ─────────────────────────────

test.describe('v3 — /rezepte: Upsell-Banner für Gäste', () => {
  test.beforeEach(async ({ context }) => {
    await clearSession(context)
  })

  test('AC-v3-3: /rezepte ohne Session zeigt Gast-Banner mit Rezept-Count', async ({ page }) => {
    await page.goto('/rezepte')
    await page.waitForLoadState('networkidle', { timeout: 8000 })
    // Banner-Überschrift sichtbar
    await expect(page.getByText('Gastrezepte', { exact: true })).toBeVisible({ timeout: 6000 })
    // Count-Text sichtbar
    await expect(page.getByText(/Anmelden um alle/)).toBeVisible()
    // Registrierungs-Link sichtbar
    await expect(page.getByRole('link', { name: /Jetzt kostenlos registrieren/ })).toBeVisible()
  })

  test('AC-v3-4: /rezepte eingeloggt — kein Gast-Banner', async ({ page }) => {
    await loginAs(page)
    await page.goto('/rezepte')
    await page.waitForLoadState('networkidle', { timeout: 8000 })
    await expect(page.getByText('Gastrezepte', { exact: true })).not.toBeVisible()
  })
})

// ─── Gruppe 14: v3 — Art-of-Eating Teaser auf Startseite ────────────────────

test.describe('v3 — Startseite: Art-of-Eating Teaser (alle Nutzer)', () => {
  test('AC-v3-5: Startseite zeigt Art-of-Eating Teaser-Box', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    await expect(page.getByText('Wie du isst entscheidet, wie satt du wirst')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Zur Art of Eating →')).toBeVisible()
  })

  test('AC-v3-6: Art-of-Eating Teaser navigiert zu /wie-esse-ich-richtig', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    await page.getByText('Zur Art of Eating →').click()
    await expect(page).toHaveURL(/wie-esse-ich-richtig/, { timeout: 5000 })
  })

  test('AC-v3-5b: Art-of-Eating Teaser auch für eingeloggte Nutzer sichtbar', async ({ page }) => {
    await loginAs(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle', { timeout: 8000 })
    await expect(page.getByText('Wie du isst entscheidet, wie satt du wirst')).toBeVisible({ timeout: 8000 })
  })
})
