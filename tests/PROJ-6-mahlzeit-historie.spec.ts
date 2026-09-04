import { test, expect, Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'

async function loginAndGoToHistorie(page: Page) {
  // "/" ist seit PROJ-6 die Standard-Landingpage nach Login (nicht mehr "/historie") — dieser
  // Helper navigierte bislang nie tatsächlich zur Historie-Seite weiter (vorbestehender
  // Test-Bug, unabhängig vom Refinement 2026-08-11).
  await page.goto('/login')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/', { timeout: 8000 })
  await page.goto('/historie')
}

const MEAL_SEHR_SAETTIGEND = {
  id: 'meal-1',
  freeText: 'Linsensalat mit Avocado',
  thumbnailUrl: null,
  createdAt: new Date(Date.now() - 3600000).toISOString(),
  gesamtbewertung: 'sehr_saettigend',
}

const MEAL_MAESSIG = {
  id: 'meal-2',
  freeText: 'Pasta mit Tomatensauce',
  thumbnailUrl: null,
  createdAt: new Date(Date.now() - 7200000).toISOString(),
  gesamtbewertung: 'maessig_saettigend',
}

const MEAL_WENIG = {
  id: 'meal-3',
  freeText: 'Weißbrot mit Marmelade',
  thumbnailUrl: null,
  createdAt: new Date(Date.now() - 10800000).toISOString(),
  gesamtbewertung: 'wenig_saettigend',
}

function setupEmptyHistorie(page: Page) {
  page.route('/api/mahlzeiten**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ meals: [], hasMore: false }),
    })
  )
}

function setupHistorieWith(page: Page, meals: typeof MEAL_SEHR_SAETTIGEND[], hasMore = false) {
  page.route('/api/mahlzeiten**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ meals, hasMore }),
    })
  )
}

// ─────────────────────────────────────────────────────────────
// LEERER ZUSTAND
// ─────────────────────────────────────────────────────────────
test.describe('Leerer Zustand', () => {
  test('zeigt freundliche Einladung wenn keine Mahlzeiten vorhanden', async ({ page }) => {
    setupEmptyHistorie(page)
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Deine erste Analyse wartet')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/Was hast du heute gegessen/)).toBeVisible()
  })

  test('leerer Zustand hat prominenten Mahlzeit-analysieren-Button in der Mitte', async ({ page }) => {
    setupEmptyHistorie(page)
    await loginAndGoToHistorie(page)
    const cta = page.getByRole('link', { name: /mahlzeit analysieren/i })
    await expect(cta).toBeVisible({ timeout: 5000 })
    await expect(cta).toHaveAttribute('href', '/analyse/start')
  })

  test('kein FAB-Button im leeren Zustand', async ({ page }) => {
    setupEmptyHistorie(page)
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Deine erste Analyse wartet')).toBeVisible({ timeout: 5000 })
    const fab = page.getByRole('link', { name: /neue mahlzeit/i })
    await expect(fab).toBeHidden()
  })
})

// ─────────────────────────────────────────────────────────────
// TIMELINE-ANSICHT
// ─────────────────────────────────────────────────────────────
test.describe('Timeline-Ansicht', () => {
  test('zeigt alle Mahlzeit-Karten mit Namen', async ({ page }) => {
    setupHistorieWith(page, [MEAL_SEHR_SAETTIGEND, MEAL_MAESSIG])
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Linsensalat mit Avocado')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Pasta mit Tomatensauce')).toBeVisible()
  })

  test('Sättigungs-Badges werden angezeigt', async ({ page }) => {
    setupHistorieWith(page, [MEAL_SEHR_SAETTIGEND, MEAL_MAESSIG, MEAL_WENIG])
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Linsensalat mit Avocado')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Sehr sättigend')).toBeVisible()
    await expect(page.getByText('Mäßig sättigend')).toBeVisible()
    await expect(page.getByText('Wenig sättigend')).toBeVisible()
  })

  test('FAB-Button "Neue Mahlzeit" ist sichtbar wenn Einträge vorhanden', async ({ page }) => {
    setupHistorieWith(page, [MEAL_SEHR_SAETTIGEND])
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Linsensalat mit Avocado')).toBeVisible({ timeout: 5000 })
    const fab = page.getByRole('link', { name: /neue mahlzeit/i })
    await expect(fab).toBeVisible()
    await expect(fab).toHaveAttribute('href', '/analyse/start')
  })

  test('FAB-Button navigiert zur Analyse-Seite', async ({ page }) => {
    setupHistorieWith(page, [MEAL_SEHR_SAETTIGEND])
    await loginAndGoToHistorie(page)
    await page.getByRole('link', { name: /neue mahlzeit/i }).click()
    await expect(page).toHaveURL(/\/analyse/)
  })

  test('Laden-Skelett erscheint während Daten geladen werden', async ({ page }) => {
    // `resolveDelay` wird SYNCHRON zugewiesen, bevor die Route überhaupt registriert wird —
    // nicht erst im Request-Handler. Vorher hing die Zuweisung am tatsächlichen Netzwerk-
    // Roundtrip (Fetch verlässt den Browser → CDP-Interception → Handler feuert), während das
    // sichtbare Skelett rein clientseitig ist und oft schon vorher steht. `resolveDelay()`
    // direkt nach der Sichtbarkeits-Assertion konnte den Handler damit überholen und
    // "resolveDelay is not a function" werfen. Mit der Zuweisung außerhalb des Handlers ist
    // `resolveDelay` immer schon eine Funktion, unabhängig vom Timing des Requests.
    let resolveDelay!: () => void
    const delay = new Promise<void>(r => { resolveDelay = r })
    // Route-Handler muss registriert (und die Registrierung abgewartet) sein, BEVOR die
    // Navigation die Requests auslöst (siehe PROJ-17-Fix, commit 0abe580, gleiches Muster).
    await page.route('/api/mahlzeiten**', async route => {
      await delay
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ meals: [MEAL_SEHR_SAETTIGEND], hasMore: false }),
      })
    })
    await loginAndGoToHistorie(page)
    // Dediziertes data-testid am Skelett statt des generischen ".animate-pulse"-Selektors —
    // die (hier ungemockte) WochenRecapSektion rendert während ihres eigenen Ladezustands
    // ebenfalls .animate-pulse-Elemente auf derselben Seite.
    const skeleton = page.getByTestId('mahlzeit-historie-skeleton')
    await expect(skeleton).toBeVisible({ timeout: 5000 })
    resolveDelay()
    await expect(page.getByText('Linsensalat mit Avocado')).toBeVisible({ timeout: 5000 })
  })
})

// ─────────────────────────────────────────────────────────────
// ÄLTERE EINTRÄGE LADEN
// ─────────────────────────────────────────────────────────────
test.describe('Ältere Einträge laden', () => {
  test('zeigt "Ältere Einträge laden"-Button wenn hasMore=true', async ({ page }) => {
    setupHistorieWith(page, [MEAL_SEHR_SAETTIGEND, MEAL_MAESSIG], true)
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Linsensalat mit Avocado')).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: /ältere einträge laden/i })).toBeVisible()
  })

  test('kein Pagination-Button wenn hasMore=false', async ({ page }) => {
    setupHistorieWith(page, [MEAL_SEHR_SAETTIGEND])
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Linsensalat mit Avocado')).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: /ältere einträge laden/i })).toBeHidden()
  })

  test('lädt ältere Einträge und hängt sie unten an (Refinement 2026-09-04)', async ({ page }) => {
    let callCount = 0
    page.route('/api/mahlzeiten**', route => {
      callCount++
      if (callCount === 1) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ meals: [MEAL_SEHR_SAETTIGEND], hasMore: true }),
        })
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ meals: [MEAL_WENIG], hasMore: false }),
        })
      }
    })
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Linsensalat mit Avocado')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /ältere einträge laden/i }).click()
    await expect(page.getByText('Weißbrot mit Marmelade')).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: /ältere einträge laden/i })).toBeHidden()

    // Neuere Mahlzeit steht weiterhin oben, ältere (gerade nachgeladene) darunter.
    const main = page.getByRole('main')
    const text = await main.innerText()
    expect(text.indexOf('Linsensalat mit Avocado')).toBeLessThan(text.indexOf('Weißbrot mit Marmelade'))
  })

  test('AC (Refinement 2026-09-04): initialer Abruf lädt nur 5 Einträge, Nachladen in 10er-Schritten', async ({ page }) => {
    const requestedUrls: string[] = []
    page.route('/api/mahlzeiten**', route => {
      requestedUrls.push(route.request().url())
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ meals: [MEAL_SEHR_SAETTIGEND], hasMore: true }),
      })
    })
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Linsensalat mit Avocado')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /ältere einträge laden/i }).click()
    await expect(page.getByRole('button', { name: /lade…/i })).toBeHidden({ timeout: 5000 })

    expect(requestedUrls[0]).toContain('limit=5')
    expect(requestedUrls[0]).toContain('offset=0')
    expect(requestedUrls[1]).toContain('limit=10')
  })
})

// ─────────────────────────────────────────────────────────────
// EINTRAG ÖFFNEN
// ─────────────────────────────────────────────────────────────
test.describe('Eintrag öffnen', () => {
  test('Klick auf Karte navigiert zur Detailansicht', async ({ page }) => {
    setupHistorieWith(page, [MEAL_SEHR_SAETTIGEND])
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Linsensalat mit Avocado')).toBeVisible({ timeout: 5000 })
    await page.getByRole('link', { name: /linsensalat mit avocado/i }).click()
    await expect(page).toHaveURL(/\/mahlzeit\/meal-1/)
  })
})

// ─────────────────────────────────────────────────────────────
// EINTRAG LÖSCHEN
// ─────────────────────────────────────────────────────────────
test.describe('Eintrag löschen', () => {
  test('Lösch-Button öffnet Bestätigungsdialog', async ({ page }) => {
    setupHistorieWith(page, [MEAL_SEHR_SAETTIGEND])
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Linsensalat mit Avocado')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /mahlzeit löschen/i }).click()
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await expect(page.getByText(/unwiderruflich/i)).toBeVisible()
  })

  test('Abbrechen im Dialog behält Eintrag', async ({ page }) => {
    setupHistorieWith(page, [MEAL_SEHR_SAETTIGEND])
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Linsensalat mit Avocado')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /mahlzeit löschen/i }).click()
    await page.getByRole('button', { name: /abbrechen/i }).click()
    await expect(page.getByRole('alertdialog')).toBeHidden()
    await expect(page.getByText('Linsensalat mit Avocado')).toBeVisible()
  })

  test('Bestätigen löscht Eintrag aus der Liste', async ({ page }) => {
    setupHistorieWith(page, [MEAL_SEHR_SAETTIGEND])
    page.route('/api/mahlzeiten/meal-1', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
    )
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Linsensalat mit Avocado')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /mahlzeit löschen/i }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: /löschen/i }).click()
    await expect(page.getByText('Linsensalat mit Avocado')).toBeHidden({ timeout: 5000 })
    // After deleting the only entry, empty state should appear
    await expect(page.getByText('Deine erste Analyse wartet')).toBeVisible({ timeout: 5000 })
  })

  test('Löschfehler zeigt Fehlermeldung und behält Eintrag', async ({ page }) => {
    setupHistorieWith(page, [MEAL_SEHR_SAETTIGEND])
    page.route('/api/mahlzeiten/meal-1', route =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Server error' }) })
    )
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Linsensalat mit Avocado')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /mahlzeit löschen/i }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: /löschen/i }).click()
    await expect(page.getByText(/löschen fehlgeschlagen/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Linsensalat mit Avocado')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────
// FEHLERFALL: API-FEHLER
// ─────────────────────────────────────────────────────────────
test.describe('Fehlerfall', () => {
  test('zeigt Fehlermeldung wenn API-Anfrage fehlschlägt', async ({ page }) => {
    page.route('/api/mahlzeiten**', route =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Server error' }) })
    )
    await loginAndGoToHistorie(page)
    await expect(page.getByText(/konnten nicht geladen werden/i)).toBeVisible({ timeout: 5000 })
  })
})

// ─────────────────────────────────────────────────────────────
// AUTHENTIFIZIERUNG
// ─────────────────────────────────────────────────────────────
test.describe('Authentifizierung', () => {
  // PROJ-42: /historie leitet jetzt bedingungslos auf /analyse weiter (die Historie lebt
  // dort in Sektion 3) — der Login-Zwang greift erst innerhalb der Sektion selbst
  // (Login-Hinweis-Karte statt Inhalt für Gäste), nicht mehr als Seiten-Redirect zu /konto.
  test('nicht eingeloggter Nutzer wird bei /historie zu /analyse weitergeleitet, sieht dort einen Login-Hinweis', async ({ page }) => {
    await page.goto('/historie')
    await expect(page).toHaveURL(/\/analyse$/, { timeout: 5000 })
    await expect(page.getByText('Melde dich an, um deine Analyse-Historie zu sehen.')).toBeVisible()
  })
})
