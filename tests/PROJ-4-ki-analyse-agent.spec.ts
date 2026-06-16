import { test, expect, Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'

async function loginAs(page: Page) {
  // Seit PROJ-6 ist "/" die Standard-Landingpage nach Login (ohne redirectTo) — explizit
  // anfordern, da diese Tests auf /analyse laufen. Siehe PROJ-2-Bugfix-Notiz 2026-06-16.
  await page.goto('/login?redirectTo=%2Fanalyse')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/analyse', { timeout: 8000 })
}

const MOCK_INGREDIENTS = [
  { name: 'Hähnchenbrust', amount: '200g', isAssumption: false },
  { name: 'Olivenöl', amount: '1 EL', isAssumption: true },
]

const MOCK_RESULT = {
  analysisId: 'analysis-123',
  result: {
    zutatenliste: [{ name: 'Hähnchenbrust', amount: '200g', source: 'usda', sourceName: 'Chicken, raw' }],
    annahmen: [],
    vorher: {
      bausteine: { geschmack: 'mittel', biss: 'gut', ballaststoffe: 'schwach', proteine: 'gut', volumen: 'mittel', art_of_eating: 'nicht_bewertet' },
      gesamtbewertung: 'maessig_saettigend',
      erklaerung: 'Gutes Protein.',
      naehrwerte: { kcal: 240, protein_g: 44, kohlenhydrate_g: 0, zucker_g: 0, fett_g: 5, ballaststoffe_g: 0 },
    },
    vorschlaege: [{ aktion: 'Gurken dazugeben', begruendung: 'Mehr Volumen', baustein: 'volumen' }],
    nachher: {
      bausteine: { geschmack: 'mittel', biss: 'gut', ballaststoffe: 'mittel', proteine: 'gut', volumen: 'gut', art_of_eating: 'nicht_bewertet' },
      gesamtbewertung: 'sehr_saettigend',
      naehrwerte: { kcal: 256, protein_g: 44, kohlenhydrate_g: 4, zucker_g: 2, fett_g: 5, ballaststoffe_g: 1 },
      deltas: [{ wert: 'volumen', vorher: 0, nachher: 1, veraenderung: 1 }],
    },
    art_of_eating_tipp: null,
  },
}

function setupToConfirming(
  page: Page,
  ingredients = MOCK_INGREDIENTS,
  assumptions: string[] = [],
) {
  page.route('/api/meal', route =>
    route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'mock-meal-id' }) })
  )
  page.route('/api/analyse/start', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ready: true }) })
  )
  page.route('/api/analyse/complete', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ingredients, assumptions }) })
  )
}

async function reachConfirming(
  page: Page,
  ingredients = MOCK_INGREDIENTS,
  assumptions: string[] = [],
) {
  setupToConfirming(page, ingredients, assumptions)
  await page.fill('textarea', 'Hähnchenbrust mit Olivenöl')
  await page.getByRole('button', { name: /^analysieren/i }).click()
  await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible({ timeout: 10000 })
}

// ─────────────────────────────────────────────────────────────
// ZUTATENLISTE-BESTÄTIGUNG — Anzeige
// ─────────────────────────────────────────────────────────────
test.describe('Zutatenliste-Bestätigung — Anzeige', () => {
  test('Step confirming zeigt alle Zutaten nach /api/analyse/complete', async ({ page }) => {
    await loginAs(page)
    await reachConfirming(page)
    await expect(page.getByText('Hähnchenbrust')).toBeVisible()
    await expect(page.getByText('200g')).toBeVisible()
    await expect(page.getByText('Olivenöl')).toBeVisible()
    await expect(page.getByText('1 EL')).toBeVisible()
  })

  test('Zutat mit isAssumption:true trägt "Annahme"-Badge', async ({ page }) => {
    await loginAs(page)
    await reachConfirming(page)
    await expect(page.getByText('Annahme')).toBeVisible()
  })

  test('Annahmen erscheinen im Alert-Block mit "Ich habe angenommen:"', async ({ page }) => {
    await loginAs(page)
    await reachConfirming(page, MOCK_INGREDIENTS, ['Magerquark 0,2% Fett', '1 EL Olivenöl ca. 10g'])
    await expect(page.getByText(/Ich habe angenommen:/)).toBeVisible()
    await expect(page.getByText(/Magerquark/)).toBeVisible()
  })

  test('"Passt so →"-Button ist sichtbar und aktiviert', async ({ page }) => {
    await loginAs(page)
    await reachConfirming(page)
    await expect(page.getByRole('button', { name: /passt so/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /passt so/i })).toBeEnabled()
  })
})

// ─────────────────────────────────────────────────────────────
// ZUTATENLISTE-BESTÄTIGUNG — Inline-Bearbeitung
// ─────────────────────────────────────────────────────────────
test.describe('Zutatenliste-Bestätigung — Inline-Bearbeitung', () => {
  test('Edit-Icon öffnet Bearbeitungsfelder für die Zutat', async ({ page }) => {
    await loginAs(page)
    await reachConfirming(page)
    await page.getByRole('button', { name: /hähnchenbrust bearbeiten/i }).click()
    await expect(page.locator('input[placeholder="Zutat"]')).toBeVisible()
    await expect(page.locator('input[placeholder*="Menge"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Fertig' })).toBeVisible()
  })

  test('"Fertig"-Button speichert den geänderten Zutaten-Namen', async ({ page }) => {
    await loginAs(page)
    await reachConfirming(page)
    await page.getByRole('button', { name: /hähnchenbrust bearbeiten/i }).click()
    const nameInput = page.locator('input[placeholder="Zutat"]')
    await nameInput.fill('Putenbrust')
    await page.getByRole('button', { name: 'Fertig' }).click()
    await expect(page.getByText('Putenbrust')).toBeVisible()
    await expect(page.getByText('Hähnchenbrust')).not.toBeVisible()
  })

  test('Enter-Taste speichert Inline-Bearbeitung', async ({ page }) => {
    await loginAs(page)
    await reachConfirming(page)
    await page.getByRole('button', { name: /hähnchenbrust bearbeiten/i }).click()
    const nameInput = page.locator('input[placeholder="Zutat"]')
    await nameInput.fill('Putenbrust')
    await nameInput.press('Enter')
    await expect(page.getByText('Putenbrust')).toBeVisible()
  })

  test('Escape bricht Bearbeitung ab ohne Änderung', async ({ page }) => {
    await loginAs(page)
    await reachConfirming(page)
    await page.getByRole('button', { name: /hähnchenbrust bearbeiten/i }).click()
    await page.locator('input[placeholder="Zutat"]').press('Escape')
    await expect(page.getByText('Hähnchenbrust')).toBeVisible()
    await expect(page.locator('input[placeholder="Zutat"]')).not.toBeVisible()
  })

  test('"Passt so →"-Button ist deaktiviert während Bearbeitung aktiv ist', async ({ page }) => {
    await loginAs(page)
    await reachConfirming(page)
    await page.getByRole('button', { name: /hähnchenbrust bearbeiten/i }).click()
    await expect(page.getByRole('button', { name: /passt so/i })).toBeDisabled()
  })
})

// ─────────────────────────────────────────────────────────────
// NÄHRSTOFFBERECHNUNG — Berechnung + Ergebnis
// ─────────────────────────────────────────────────────────────
test.describe('Nährstoffberechnung', () => {
  test('"Passt so →" zeigt Berechnungs-Ladescreen mit ⚗️', async ({ page }) => {
    await loginAs(page)
    // Slow down confirm so we can observe the calculating step
    page.route('/api/analyse/confirm', async route => {
      await new Promise(r => setTimeout(r, 600))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_RESULT) })
    })
    await reachConfirming(page)
    await page.getByRole('button', { name: /passt so/i }).click()
    await expect(page.getByText('Nährstoffe werden berechnet…')).toBeVisible({ timeout: 3000 })
    await expect(page.getByText('Open Food Facts & USDA werden abgefragt.')).toBeVisible()
  })

  test('Erfolgreiche Berechnung führt zu step "done"', async ({ page }) => {
    await loginAs(page)
    page.route('/api/analyse/confirm', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_RESULT) })
    )
    await reachConfirming(page)
    await page.getByRole('button', { name: /passt so/i }).click()
    await expect(page.getByText('Die 6 Sättigungs-Bausteine')).toBeVisible({ timeout: 8000 })
  })

  test('Geänderte Zutaten werden korrekt an /api/analyse/confirm gesendet', async ({ page }) => {
    await loginAs(page)
    let capturedBody: unknown = null
    page.route('/api/analyse/confirm', async route => {
      capturedBody = JSON.parse(await route.request().postData() ?? '{}')
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_RESULT) })
    })
    await reachConfirming(page)
    // Edit first ingredient
    await page.getByRole('button', { name: /hähnchenbrust bearbeiten/i }).click()
    await page.locator('input[placeholder="Zutat"]').fill('Putenbrust')
    await page.getByRole('button', { name: 'Fertig' }).click()
    await page.getByRole('button', { name: /passt so/i }).click()
    await expect(page.getByText('Die 6 Sättigungs-Bausteine')).toBeVisible({ timeout: 8000 })
    const body = capturedBody as { ingredients: { name: string }[] }
    expect(body.ingredients[0].name).toBe('Putenbrust')
  })
})

// ─────────────────────────────────────────────────────────────
// FEHLERVERHALTEN
// ─────────────────────────────────────────────────────────────
test.describe('Fehlerverhalten', () => {
  test('/api/analyse/complete Fehler → Fehlermeldung + zurück zu Input', async ({ page }) => {
    await loginAs(page)
    page.route('/api/meal', route =>
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'mock-meal-id' }) })
    )
    page.route('/api/analyse/start', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ready: true }) })
    )
    page.route('/api/analyse/complete', route =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Serverfehler' }) })
    )
    await page.fill('textarea', 'Hähnchenbrust')
    await page.getByRole('button', { name: /^analysieren/i }).click()
    await expect(page.getByText(/konnte nicht|fehler/i)).toBeVisible({ timeout: 8000 })
    // Step goes back to input — analyse button visible again
    await expect(page.getByRole('button', { name: /^analysieren/i })).toBeVisible()
  })

  test('/api/analyse/complete 503 (überlastet) → Fehlermeldung sichtbar', async ({ page }) => {
    await loginAs(page)
    page.route('/api/meal', route =>
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'mock-meal-id' }) })
    )
    page.route('/api/analyse/start', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ready: true }) })
    )
    page.route('/api/analyse/complete', route =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Die KI ist gerade überlastet. Bitte in ein paar Sekunden erneut versuchen.' }),
      })
    )
    await page.fill('textarea', 'Hähnchenbrust')
    await page.getByRole('button', { name: /^analysieren/i }).click()
    await expect(page.getByText(/konnte nicht abgeschlossen/i)).toBeVisible({ timeout: 8000 })
  })

  test('/api/analyse/confirm Fehler → Fehlermeldung auf confirming-Step', async ({ page }) => {
    await loginAs(page)
    page.route('/api/analyse/confirm', route =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Fehler' }) })
    )
    await reachConfirming(page)
    await page.getByRole('button', { name: /passt so/i }).click()
    // Error shown and user is back on confirming step
    await expect(page.getByText(/fehlgeschlagen|fehler/i)).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible()
  })

  test('/api/analyse/confirm 503 (KI überlastet) → Retry-Hinweis auf confirming-Step', async ({ page }) => {
    await loginAs(page)
    page.route('/api/analyse/confirm', route =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Die KI ist gerade überlastet. Bitte in ein paar Sekunden erneut versuchen.' }),
      })
    )
    await reachConfirming(page)
    await page.getByRole('button', { name: /passt so/i }).click()
    await expect(page.getByText(/überlastet|fehlgeschlagen/i)).toBeVisible({ timeout: 8000 })
    // User is back on confirming step and can retry
    await expect(page.getByRole('button', { name: /passt so/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /passt so/i })).toBeEnabled()
  })
})

// ─────────────────────────────────────────────────────────────
// RESPONSIVE — Mobile 375px
// ─────────────────────────────────────────────────────────────
test.describe('Responsive — Mobile 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('Confirming-Step scrollt nicht horizontal auf 375px', async ({ page }) => {
    await loginAs(page)
    await reachConfirming(page)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
  })

  test('"Passt so →"-Button ist mindestens 44px hoch (Touch-Target)', async ({ page }) => {
    await loginAs(page)
    await reachConfirming(page)
    const button = page.getByRole('button', { name: /passt so/i })
    const box = await button.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44)
  })
})
