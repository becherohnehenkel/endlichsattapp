/**
 * PROJ-33 — Geschmacks-Score
 *
 * Teststrategie:
 * - Analyse-Flow (Mahlzeit + Komponente + Snack): confirm-API via page.route() gemockt
 * - Retry-Endpunkte: direkt via page.request (Auth/Validierung) — die eigentliche
 *   Rezept-Detailseite ist server-rendered (Supabase-Query, kein client-seitiger Fetch) und
 *   daher wie bei PROJ-16 nicht über page.route() mockbar; das Rendering dort wurde stattdessen
 *   live gegen einen echten Claude-Aufruf manuell verifiziert (siehe QA Test Results).
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

function setupAnalyseMocks(page: Page, confirmResult: object) {
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
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(confirmResult) })
  )
  page.route('/api/rezepte/vorschlaege**', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ recipes: [] }) })
  )
}

async function reachDone(page: Page) {
  await page.fill('textarea', 'Hähnchenbrust')
  await page.getByRole('button', { name: /^analysieren/i }).click()
  await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible({ timeout: 10000 })
  await page.getByRole('button', { name: /passt so/i }).click()
  await expect(page.getByText('Die 3 Sättigungs-Säulen')).toBeVisible({ timeout: 10000 })
}

const BASE_MAHLZEIT_RESULT = {
  typ: 'mahlzeit',
  zutatenliste: [{ name: 'Hähnchenbrust', amount: '200g', grams: 200 }],
  annahmen: [],
  vorher: {
    saeulen: { proteine: 'gut', ballaststoffe: 'gering', volumen: 'mittel' },
    gesamtbewertung: 'maessig_saettigend',
    erklaerung: 'Gutes Protein, aber wenig Volumen.',
    naehrwerte: { kcal: 240, protein_g: 44, kohlenhydrate_g: 0, zucker_g: 0, fett_g: 5, ballaststoffe_g: 0 },
  },
  vorschlaege: [{ aktion: 'Gurken dazugeben', begruendung: 'Mehr Volumen', saeule: 'volumen' }],
  nachher: {
    saeulen: { proteine: 'gut', ballaststoffe: 'gering', volumen: 'gut' },
    gesamtbewertung: 'maessig_saettigend',
    naehrwerte: { kcal: 256, protein_g: 44, kohlenhydrate_g: 4, zucker_g: 2, fett_g: 5, ballaststoffe_g: 1 },
    deltas: [{ wert: 'volumen', vorher: 0, nachher: 1, veraenderung: 1 }],
  },
}

test.describe('Geschmack-Sektion: Mahlzeit', () => {
  test('zeigt Score, Label und Verbesserungsvorschläge gleichwertig neben der Sättigung', async ({ page }) => {
    await loginAs(page)
    setupAnalyseMocks(page, {
      analysisId: 'analysis-1',
      result: {
        ...BASE_MAHLZEIT_RESULT,
        geschmack: { status: 'ok', score: 72, label: 'lecker', verbesserungen: ['Ein Spritzer Zitrone dazu.'], unklarHinweis: null },
      },
    })
    await reachDone(page)
    await expect(page.getByText('Geschmack', { exact: true })).toBeVisible()
    await expect(page.getByText('72')).toBeVisible()
    await expect(page.getByText('Lecker')).toBeVisible()
    await expect(page.getByText('Ein Spritzer Zitrone dazu.')).toBeVisible()
  })

  test('Score >= 85 zeigt Bestätigung statt Verbesserungsvorschläge', async ({ page }) => {
    await loginAs(page)
    setupAnalyseMocks(page, {
      analysisId: 'analysis-2',
      result: {
        ...BASE_MAHLZEIT_RESULT,
        geschmack: { status: 'ok', score: 90, label: 'richtig_gut', verbesserungen: [], unklarHinweis: null },
      },
    })
    await reachDone(page)
    await expect(page.getByText('90')).toBeVisible()
    await expect(page.getByText('Richtig gut')).toBeVisible()
    await expect(page.getByText('Geschmacklich stimmt hier alles!')).toBeVisible()
  })

  test('zeigt den unklar-Hinweis als reinen Info-Text, ohne den Flow zu unterbrechen', async ({ page }) => {
    await loginAs(page)
    setupAnalyseMocks(page, {
      analysisId: 'analysis-3',
      result: {
        ...BASE_MAHLZEIT_RESULT,
        geschmack: { status: 'ok', score: 65, label: 'okay', verbesserungen: ['Etwas Salz fehlt noch.'], unklarHinweis: 'Hast du Zitrone drüber?' },
      },
    })
    await reachDone(page)
    // Kein zusätzlicher Rückfrage-Schritt — direkt am Ergebnis sichtbar
    await expect(page.getByText('Hast du Zitrone drüber?')).toBeVisible()
  })

  test('Fehlerzustand zeigt "Nochmal prüfen"-Button, Sättigung bleibt unberührt sichtbar', async ({ page }) => {
    await loginAs(page)
    setupAnalyseMocks(page, {
      analysisId: 'analysis-4',
      result: { ...BASE_MAHLZEIT_RESULT, geschmack: { status: 'error' } },
    })
    await reachDone(page)
    await expect(page.getByText('Geschmack konnte nicht ermittelt werden.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Nochmal prüfen' })).toBeVisible()
    // Sättigung ist trotzdem vollständig da
    await expect(page.getByText('Mäßig sättigend')).toBeVisible()
  })

  test('Klick auf "Nochmal prüfen" lädt nur den Geschmack-Teil neu und ersetzt den Fehlerzustand', async ({ page }) => {
    await loginAs(page)
    setupAnalyseMocks(page, {
      analysisId: 'analysis-5',
      result: { ...BASE_MAHLZEIT_RESULT, geschmack: { status: 'error' } },
    })
    await page.route('/api/analyse/geschmack-retry', route =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ geschmack: { status: 'ok', score: 55, label: 'okay', verbesserungen: [], unklarHinweis: null } }),
      })
    )
    await reachDone(page)
    await page.getByRole('button', { name: 'Nochmal prüfen' }).click()
    await expect(page.getByText('55')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Okay')).toBeVisible()
    await expect(page.getByText('Geschmack konnte nicht ermittelt werden.')).not.toBeVisible()
  })

  test('fehlgeschlagener Retry zeigt erneut einen Hinweis, Button bleibt klickbar', async ({ page }) => {
    await loginAs(page)
    setupAnalyseMocks(page, {
      analysisId: 'analysis-6',
      result: { ...BASE_MAHLZEIT_RESULT, geschmack: { status: 'error' } },
    })
    await page.route('/api/analyse/geschmack-retry', route =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Fehler' }) })
    )
    await reachDone(page)
    await page.getByRole('button', { name: 'Nochmal prüfen' }).click()
    await expect(page.getByText(/nicht geklappt/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: 'Nochmal prüfen' })).toBeEnabled()
  })

  test('alte Mahlzeit ohne geschmack-Feld: Sektion erscheint gar nicht', async ({ page }) => {
    await loginAs(page)
    setupAnalyseMocks(page, {
      analysisId: 'analysis-7',
      result: BASE_MAHLZEIT_RESULT, // kein "geschmack"-Feld — simuliert eine Analyse von vor PROJ-33
    })
    await reachDone(page)
    await expect(page.getByText('Geschmack', { exact: true })).not.toBeVisible()
  })
})

test.describe('Geschmack-Sektion: Komponente', () => {
  test('zeigt Geschmack zusätzlich zur Komponente-Bilanz', async ({ page }) => {
    await loginAs(page)
    setupAnalyseMocks(page, {
      analysisId: 'komponente-analysis-1',
      result: {
        typ: 'komponente',
        zutatenliste: [{ name: 'Blattsalat', amount: '100g', grams: 100 }],
        annahmen: ['MAHLZEIT_TYP: komponente'],
        komponente: {
          format: 'neu',
          bilanz: 'Bringt schon mal 100g Blattgemüse mit.',
          kombinationsvorschlag: '150g Skyr dazu.',
        },
        geschmack: { status: 'ok', score: 60, label: 'okay', verbesserungen: ['Etwas Feta dazu.'], unklarHinweis: null },
      },
    })
    await page.fill('textarea', 'Blattsalat')
    await page.getByRole('button', { name: /^analysieren/i }).click()
    await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /passt so/i }).click()
    await expect(page.getByText('Als Beilage gedacht')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Geschmack', { exact: true })).toBeVisible()
    await expect(page.getByText('60')).toBeVisible()
    await expect(page.getByText('Etwas Feta dazu.')).toBeVisible()
  })
})

test.describe('Geschmack-Sektion: Snack (nie vorhanden)', () => {
  test('Snack-Ergebnis zeigt nie eine Geschmack-Sektion', async ({ page }) => {
    await loginAs(page)
    setupAnalyseMocks(page, {
      analysisId: 'snack-analysis-1',
      result: {
        typ: 'snack',
        zutatenliste: [{ name: 'Apfel', amount: '1 Stück', grams: 180 }],
        annahmen: ['MAHLZEIT_TYP: snack'],
        snackBestaetigung: 'Alles klar, Snack — der braucht keine Analyse.',
      },
    })
    await page.fill('textarea', 'Ein Apfel')
    await page.getByRole('button', { name: /^analysieren/i }).click()
    await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /passt so/i }).click()
    await expect(page.getByText('Alles klar, Snack')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Geschmack', { exact: true })).not.toBeVisible()
  })
})

test.describe('Security: Geschmack-Retry-Endpunkte', () => {
  test('POST /api/analyse/geschmack-retry ohne Auth → 401', async ({ page }) => {
    const res = await page.request.post('/api/analyse/geschmack-retry', {
      data: { analysisId: '550e8400-e29b-41d4-a716-446655440000' },
    })
    expect(res.status()).toBe(401)
  })

  test('POST /api/analyse/geschmack-retry mit ungültiger analysisId → 400', async ({ page }) => {
    await loginAs(page)
    const res = await page.request.post('/api/analyse/geschmack-retry', {
      data: { analysisId: 'not-a-uuid' },
    })
    expect(res.status()).toBe(400)
  })

  test('POST /api/analyse/geschmack-retry mit fremder/nicht existierender analysisId → 404, kein Datenleck', async ({ page }) => {
    await loginAs(page)
    const res = await page.request.post('/api/analyse/geschmack-retry', {
      data: { analysisId: '00000000-0000-0000-0000-000000000000' },
    })
    expect(res.status()).toBe(404)
  })

  test('POST /api/rezepte/[id]/geschmack-retry ohne Auth → 401', async ({ page }) => {
    const res = await page.request.post('/api/rezepte/00000000-0000-0000-0000-000000000000/geschmack-retry')
    expect(res.status()).toBe(401)
  })

  test('POST /api/rezepte/[id]/geschmack-retry mit nicht existierender ID → 404', async ({ page }) => {
    await loginAs(page)
    const res = await page.request.post('/api/rezepte/00000000-0000-0000-0000-000000000000/geschmack-retry')
    expect(res.status()).toBe(404)
  })
})
