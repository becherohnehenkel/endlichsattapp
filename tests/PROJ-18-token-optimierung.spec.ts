/**
 * PROJ-18 — Token-Optimierung Foto-Analyse
 *
 * Teststrategie:
 * - Security: auth-geschützte Routen via page.request
 * - Regression FIX-1: Analyse-Flow nach History-Bereinigung noch funktional
 * - Regression FIX-2/FIX-3: Start + Confirm-Flow noch funktional
 * - Alle API-Routen via page.route() gemockt (kein echter Claude-Call)
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

const MOCK_ANALYSIS_RESULT = {
  analysisId: 'analysis-proj18',
  result: {
    zutatenliste: [{ name: 'Hähnchenbrust', amount: '200g', grams: 200 }],
    annahmen: [],
    vorher: {
      bausteine: { geschmack: 'gut', biss: 'mittel', ballaststoffe: 'schwach', proteine: 'gut', volumen: 'mittel', art_of_eating: 'nicht_bewertet' },
      gesamtbewertung: 'maessig_saettigend',
      erklaerung: 'Gutes Protein, aber wenig Ballaststoffe.',
      naehrwerte: { kcal: 220, protein_g: 40, kohlenhydrate_g: 0, zucker_g: 0, fett_g: 5, ballaststoffe_g: 0 },
    },
    vorschlaege: [{ aktion: 'Gemüse dazugeben', begruendung: 'Mehr Ballaststoffe', baustein: 'ballaststoffe' }],
    nachher: {
      bausteine: { geschmack: 'gut', biss: 'gut', ballaststoffe: 'gut', proteine: 'gut', volumen: 'gut', art_of_eating: 'nicht_bewertet' },
      gesamtbewertung: 'sehr_saettigend',
      naehrwerte: { kcal: 280, protein_g: 42, kohlenhydrate_g: 8, zucker_g: 2, fett_g: 6, ballaststoffe_g: 5 },
      deltas: [{ wert: 'ballaststoffe_g', vorher: 0, nachher: 5, veraenderung: 5 }],
    },
    art_of_eating_tipp: null,
  },
}

// ─── Security: Auth auf allen Analyse-Routen ────────────────────────────────

test.describe('Security: Analyse-API Auth', () => {
  test('unauthenticated POST /api/analyse/start → 401', async ({ page }) => {
    const res = await page.request.post('/api/analyse/start', {
      data: { mealId: '550e8400-e29b-41d4-a716-446655440000' },
    })
    expect(res.status()).toBe(401)
  })

  test('unauthenticated POST /api/analyse/confirm → 401', async ({ page }) => {
    const res = await page.request.post('/api/analyse/confirm', {
      data: { mealId: '550e8400-e29b-41d4-a716-446655440000', ingredients: [{ name: 'Test', amount: '100g' }] },
    })
    expect(res.status()).toBe(401)
  })

  test('unauthenticated POST /api/analyse/answer → 401', async ({ page }) => {
    const res = await page.request.post('/api/analyse/answer', {
      data: { mealId: '550e8400-e29b-41d4-a716-446655440000', round: 1, answers: [], skipped: false },
    })
    expect(res.status()).toBe(401)
  })
})

// ─── Regression FIX-1: Analyse-Flow ohne Rückfragen ─────────────────────────

test.describe('Regression: Analyse-Flow ohne Rückfragen (FIX-1)', () => {
  test('Text-Analyse läuft durch: Start → Complete → Confirm zeigt Ergebnis', async ({ page }) => {
    await loginAs(page)

    page.route('/api/meal', route =>
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'mock-meal-id' }) })
    )
    page.route('/api/analyse/start', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ready: true }) })
    )
    page.route('/api/analyse/complete', route =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ ingredients: [{ name: 'Hähnchenbrust', amount: '200g', isAssumption: false }], assumptions: [] }),
      })
    )
    page.route('/api/analyse/confirm', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ANALYSIS_RESULT) })
    )

    await page.fill('textarea', 'Hähnchenbrust mit Gemüse')
    await page.getByRole('button', { name: /^analysieren/i }).click()
    await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /passt so/i }).click()
    await expect(page.getByText('Mäßig sättigend')).toBeVisible({ timeout: 10000 })
  })
})

// ─── Regression FIX-1: Analyse-Flow MIT Rückfrage ───────────────────────────

test.describe('Regression: Analyse-Flow mit Rückfrage (FIX-1 kritischer Pfad)', () => {
  test('Analyse mit einer Rückfrage: Antwort → Ergebnis erscheint', async ({ page }) => {
    await loginAs(page)

    page.route('/api/meal', route =>
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'mock-meal-id' }) })
    )
    page.route('/api/analyse/start', route =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ questions: [{ id: 'q1', text: 'Hast du Öl zum Braten verwendet?' }] }),
      })
    )
    page.route('/api/analyse/answer', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ready: true, assumptions: [] }) })
    )
    page.route('/api/analyse/complete', route =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ ingredients: [{ name: 'Hähnchenbrust', amount: '200g', isAssumption: false }], assumptions: [] }),
      })
    )
    page.route('/api/analyse/confirm', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ANALYSIS_RESULT) })
    )

    await page.fill('textarea', 'Gebratene Hähnchenbrust')
    await page.getByRole('button', { name: /^analysieren/i }).click()
    // Rückfrage erscheint
    await expect(page.getByText('Hast du Öl zum Braten verwendet?')).toBeVisible({ timeout: 10000 })
    // Nutzer beantwortet
    const answerInput = page.locator('textarea, input[type="text"]').last()
    await answerInput.fill('Ja, ein EL Olivenöl')
    await page.getByRole('button', { name: /weiter|senden|fertig/i }).first().click()
    // Ergebnis erscheint — FIX-1: History war sauber, kein 500 durch riesige Payload
    await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /passt so/i }).click()
    await expect(page.getByText('Mäßig sättigend')).toBeVisible({ timeout: 10000 })
  })

  test('Rückfrage überspringen: Analyse läuft durch', async ({ page }) => {
    await loginAs(page)

    page.route('/api/meal', route =>
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'mock-meal-id' }) })
    )
    page.route('/api/analyse/start', route =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ questions: [{ id: 'q1', text: 'Wie viel Öl hast du verwendet?' }] }),
      })
    )
    page.route('/api/analyse/answer', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ready: true, assumptions: ['Kein Öl angenommen.'] }) })
    )
    page.route('/api/analyse/complete', route =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ ingredients: [{ name: 'Gemüse', amount: '300g', isAssumption: false }], assumptions: ['Kein Öl angenommen.'] }),
      })
    )
    page.route('/api/analyse/confirm', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ANALYSIS_RESULT) })
    )

    await page.fill('textarea', 'Gedünstetes Gemüse')
    await page.getByRole('button', { name: /^analysieren/i }).click()
    await expect(page.getByText('Wie viel Öl hast du verwendet?')).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /überspringen|skip/i }).click()
    await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /passt so/i }).click()
    await expect(page.getByText('Mäßig sättigend')).toBeVisible({ timeout: 10000 })
  })
})

// ─── Regression: Sehr sättigendes Ergebnis ───────────────────────────────────

test.describe('Regression: Analyse-Ergebnis-Rendering', () => {
  test('Sehr sättigendes Ergebnis wird korrekt angezeigt', async ({ page }) => {
    await loginAs(page)

    const sehrSaettigend = {
      ...MOCK_ANALYSIS_RESULT,
      result: {
        ...MOCK_ANALYSIS_RESULT.result,
        vorher: { ...MOCK_ANALYSIS_RESULT.result.vorher, gesamtbewertung: 'sehr_saettigend' },
      },
    }

    page.route('/api/meal', route =>
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'mock-meal-id' }) })
    )
    page.route('/api/analyse/start', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ready: true }) })
    )
    page.route('/api/analyse/complete', route =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ ingredients: [{ name: 'Hähnchen', amount: '200g', isAssumption: false }], assumptions: [] }),
      })
    )
    page.route('/api/analyse/confirm', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(sehrSaettigend) })
    )

    await page.fill('textarea', 'Vollständige Mahlzeit')
    await page.getByRole('button', { name: /^analysieren/i }).click()
    await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /passt so/i }).click()
    await expect(page.getByText('Sehr sättigend')).toBeVisible({ timeout: 10000 })
  })
})
