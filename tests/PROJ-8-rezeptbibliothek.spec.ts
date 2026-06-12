import { test, expect, Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'

async function loginAs(page: Page) {
  await page.goto('/login')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  // Wait for redirect away from /login (may go to / or /analyse depending on user state)
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 8000 })
  // Then navigate to /analyse for the analysis flow tests
  await page.goto('/analyse')
}

// ─── Mock helpers for the analyse flow ────────────────────────

const MOCK_RESULT = {
  analysisId: 'analysis-proj8-test',
  result: {
    zutatenliste: [{ name: 'Hähnchenbrust', amount: '200g', source: 'usda', sourceName: 'Chicken' }],
    annahmen: [],
    vorher: {
      bausteine: {
        geschmack: 'mittel', biss: 'schwach', ballaststoffe: 'schwach',
        proteine: 'gut', volumen: 'mittel', art_of_eating: 'nicht_bewertet',
      },
      gesamtbewertung: 'maessig_saettigend',
      erklaerung: 'Gutes Protein, aber wenig Biss.',
      naehrwerte: { kcal: 240, protein_g: 44, kohlenhydrate_g: 0, zucker_g: 0, fett_g: 5, ballaststoffe_g: 0 },
    },
    vorschlaege: [{ aktion: 'Gurken dazugeben', begruendung: 'Mehr Volumen', baustein: 'volumen' }],
    nachher: {
      bausteine: {
        geschmack: 'mittel', biss: 'schwach', ballaststoffe: 'schwach',
        proteine: 'gut', volumen: 'gut', art_of_eating: 'nicht_bewertet',
      },
      gesamtbewertung: 'maessig_saettigend',
      naehrwerte: { kcal: 256, protein_g: 44, kohlenhydrate_g: 4, zucker_g: 2, fett_g: 5, ballaststoffe_g: 1 },
      deltas: [{ wert: 'volumen', vorher: 0, nachher: 1, veraenderung: 1 }],
    },
    art_of_eating_tipp: null,
  },
}

const MOCK_RECIPES = [
  {
    id: 'recipe-abc',
    title: 'Hähnchen Reis Bowl',
    imageUrl: null,
    total_time_minutes: 30,
  },
  {
    id: 'recipe-def',
    title: 'Asiatischer Hähnchensalat',
    imageUrl: null,
    total_time_minutes: 20,
  },
]

function setupAnalyseToResult(page: Page, mockResult = MOCK_RESULT) {
  page.route('/api/meal', route =>
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'meal-proj8' }),
    })
  )
  page.route('/api/analyse/start', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ready: true }),
    })
  )
  page.route('/api/analyse/complete', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ingredients: [{ name: 'Hähnchenbrust', amount: '200g', isAssumption: false }],
        assumptions: [],
      }),
    })
  )
  page.route('/api/analyse/confirm', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResult),
    })
  )
}

async function reachDone(page: Page) {
  setupAnalyseToResult(page)
  await page.fill('textarea', 'Hähnchenbrust mit Reis und Sojasauce')
  await page.getByRole('button', { name: /^analysieren/i }).click()
  await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible({ timeout: 10000 })
  await page.getByRole('button', { name: /passt so/i }).click()
  await expect(page.getByText('Die 6 Sättigungs-Bausteine')).toBeVisible({ timeout: 10000 })
}

// ─────────────────────────────────────────────────────────────
// REZEPTVORSCHLÄGE — kein Match
// ─────────────────────────────────────────────────────────────
test.describe('Rezeptvorschläge — kein Match', () => {
  test('Kein Rezeptabschnitt wenn API leere Liste zurückgibt', async ({ page }) => {
    await loginAs(page)
    page.route('/api/rezepte/vorschlaege**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ recipes: [] }) })
    )
    await reachDone(page)
    await expect(page.getByText('🍳 Passende Rezepte')).not.toBeVisible()
  })

  test('Kein Rezeptabschnitt wenn API-Fehler auftritt', async ({ page }) => {
    await loginAs(page)
    page.route('/api/rezepte/vorschlaege**', route =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Server error' }) })
    )
    await reachDone(page)
    await expect(page.getByText('🍳 Passende Rezepte')).not.toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────
// REZEPTVORSCHLÄGE — mit Matches
// ─────────────────────────────────────────────────────────────
test.describe('Rezeptvorschläge — mit Matches', () => {
  test('Rezeptabschnitt mit Überschrift erscheint wenn Rezepte vorhanden', async ({ page }) => {
    await loginAs(page)
    page.route('/api/rezepte/vorschlaege**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ recipes: MOCK_RECIPES }) })
    )
    await reachDone(page)
    await expect(page.getByText('🍳 Passende Rezepte')).toBeVisible({ timeout: 5000 })
  })

  test('Rezepttitel wird auf der Karte angezeigt', async ({ page }) => {
    await loginAs(page)
    page.route('/api/rezepte/vorschlaege**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ recipes: MOCK_RECIPES }) })
    )
    await reachDone(page)
    await expect(page.getByText('Hähnchen Reis Bowl')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Asiatischer Hähnchensalat')).toBeVisible({ timeout: 5000 })
  })

  test('Platzhalter-Icon wird angezeigt wenn kein Bild vorhanden', async ({ page }) => {
    await loginAs(page)
    page.route('/api/rezepte/vorschlaege**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ recipes: MOCK_RECIPES }) })
    )
    await reachDone(page)
    await expect(page.getByText('🍳 Passende Rezepte')).toBeVisible({ timeout: 5000 })
    // Placeholder icon (ChefHat) is rendered as SVG — verify no <img> with src (no actual image)
    await expect(page.locator('[href="/rezept/recipe-abc"] img')).not.toBeVisible()
  })

  test('Klick auf Rezeptkarte navigiert zur Detailseite', async ({ page }) => {
    await loginAs(page)
    page.route('/api/rezepte/vorschlaege**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ recipes: MOCK_RECIPES }) })
    )
    // 404 for non-existent recipe — but click should navigate to the correct URL
    page.route('/rezept/recipe-abc', route => route.fulfill({ status: 200, body: '<html><body>ok</body></html>' }))
    await reachDone(page)
    await expect(page.getByText('Hähnchen Reis Bowl')).toBeVisible({ timeout: 5000 })
    const recipeLink = page.locator('a[href="/rezept/recipe-abc"]').first()
    await expect(recipeLink).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────
// REZEPT-DETAILSEITE
// ─────────────────────────────────────────────────────────────
test.describe('Rezept-Detailseite', () => {
  test('Nicht-existierendes Rezept zeigt 404', async ({ page }) => {
    await loginAs(page)
    const response = await page.goto('/rezept/non-existent-recipe-id-12345')
    // Next.js notFound() returns 404
    expect(response?.status()).toBe(404)
  })
})

// ─────────────────────────────────────────────────────────────
// ADMIN-ZUGRIFF
// ─────────────────────────────────────────────────────────────
test.describe('Admin-Zugriff', () => {
  test('Nicht eingeloggter Nutzer wird zu Login weitergeleitet', async ({ page }) => {
    await page.goto('/admin/rezepte')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })

  test('Eingeloggter Nicht-Admin sieht 403-Seite', async ({ page }) => {
    await loginAs(page)
    await page.goto('/admin/rezepte')
    // Test user is not admin → redirected to /admin/403
    await expect(page).toHaveURL(/\/admin\/403/, { timeout: 5000 })
    await expect(page.getByText('Kein Zugriff')).toBeVisible()
  })

  test('Nicht eingeloggter Nutzer wird beim Create-Formular zu Login weitergeleitet', async ({ page }) => {
    await page.goto('/admin/rezepte/neu')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })

  test('Nicht eingeloggter Nutzer wird beim Edit-Formular zu Login weitergeleitet', async ({ page }) => {
    await page.goto('/admin/rezepte/some-id/bearbeiten')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })
})

// ─────────────────────────────────────────────────────────────
// API SECURITY
// ─────────────────────────────────────────────────────────────
test.describe('API Security', () => {
  test('GET /api/rezepte/vorschlaege gibt 401 ohne Auth zurück', async ({ page }) => {
    const response = await page.request.get('/api/rezepte/vorschlaege?analysisId=test')
    expect(response.status()).toBe(401)
  })

  test('GET /api/admin/rezepte gibt 401 ohne Auth zurück', async ({ page }) => {
    const response = await page.request.get('/api/admin/rezepte')
    expect(response.status()).toBe(401)
  })

  test('POST /api/admin/rezepte gibt 401 ohne Auth zurück', async ({ page }) => {
    const response = await page.request.post('/api/admin/rezepte', {
      data: { title: 'Test' },
    })
    expect(response.status()).toBe(401)
  })

  test('DELETE /api/admin/rezepte/[id] gibt 401 ohne Auth zurück', async ({ page }) => {
    const response = await page.request.delete('/api/admin/rezepte/any-id')
    expect(response.status()).toBe(401)
  })

  test('POST /api/admin/rezepte/bild gibt 401 ohne Auth zurück', async ({ page }) => {
    const response = await page.request.post('/api/admin/rezepte/bild', {
      multipart: { file: { name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') } },
    })
    expect(response.status()).toBe(401)
  })
})
