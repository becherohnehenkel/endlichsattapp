/**
 * PROJ-34 — Art of Eating
 *
 * Teststrategie:
 * - Analyse-Flow (Mahlzeit + Komponente + Snack): confirm-API via page.route() gemockt,
 *   prüft dass der neue dezente, rotierende Hinweis erscheint
 * - Legacy: echte permanente DB-Fixture (44444444-…, art_of_eating_tip ist dort null) —
 *   verifiziert, dass weder der alte Block noch der neue Hinweis fälschlich erscheinen
 * - Rotation: mehrere Seitenaufrufe sollten nicht immer exakt denselben Prinzip-Titel zeigen
 *   (statistischer Test, siehe unten)
 */

import { test, expect, type Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'
const LEGACY_MAHLZEIT_ID = '44444444-4444-4444-4444-444444444444'

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

const MAHLZEIT_RESULT = {
  analysisId: 'aoe-mahlzeit-1',
  result: {
    typ: 'mahlzeit',
    zutatenliste: [{ name: 'Hähnchenbrust', amount: '200g', grams: 200 }],
    annahmen: [],
    vorher: {
      saeulen: { proteine: 'gut', ballaststoffe: 'gering', volumen: 'mittel' },
      gesamtbewertung: 'maessig_saettigend',
      erklaerung: 'x',
      naehrwerte: { kcal: 240, protein_g: 44, kohlenhydrate_g: 0, zucker_g: 0, fett_g: 5, ballaststoffe_g: 0 },
    },
    vorschlaege: [],
    nachher: {
      saeulen: { proteine: 'gut', ballaststoffe: 'gering', volumen: 'mittel' },
      gesamtbewertung: 'maessig_saettigend',
      naehrwerte: { kcal: 240, protein_g: 44, kohlenhydrate_g: 0, zucker_g: 0, fett_g: 5, ballaststoffe_g: 0 },
      deltas: [],
    },
  },
}

test.describe('Art of Eating: erscheint bei allen drei neuen Analyse-Typen', () => {
  test('Mahlzeit (neu-Format) zeigt den dezenten, rotierenden Hinweis mit Link zum Guide', async ({ page }) => {
    await loginAs(page)
    setupAnalyseMocks(page, MAHLZEIT_RESULT)
    await page.fill('textarea', 'Hähnchenbrust')
    await page.getByRole('button', { name: /^analysieren/i }).click()
    await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /passt so/i }).click()
    await expect(page.getByText('Die 3 Sättigungs-Säulen')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/🧘 Art of Eating ·/)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Wie esse ich richtig? →' })).toHaveAttribute('href', '/wie-esse-ich-richtig')
  })

  test('Komponente (neu-Format) zeigt den Hinweis', async ({ page }) => {
    await loginAs(page)
    setupAnalyseMocks(page, {
      analysisId: 'aoe-komponente-1',
      result: {
        typ: 'komponente',
        zutatenliste: [{ name: 'Blattsalat', amount: '100g', grams: 100 }],
        annahmen: ['MAHLZEIT_TYP: komponente'],
        komponente: { format: 'neu', bilanz: 'x', kombinationsvorschlag: 'y' },
      },
    })
    await page.fill('textarea', 'Blattsalat')
    await page.getByRole('button', { name: /^analysieren/i }).click()
    await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /passt so/i }).click()
    await expect(page.getByText('Als Beilage gedacht')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/🧘 Art of Eating ·/)).toBeVisible()
  })

  test('Snack zeigt den Hinweis (anders als Geschmack, das bei Snack fehlt)', async ({ page }) => {
    await loginAs(page)
    setupAnalyseMocks(page, {
      analysisId: 'aoe-snack-1',
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
    await expect(page.getByText(/🧘 Art of Eating ·/)).toBeVisible()
  })
})

test.describe('Art of Eating: Legacy-Analysen unberührt', () => {
  test('Legacy-Mahlzeit ohne gespeicherten Tipp zeigt weder den alten Block noch den neuen Hinweis', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/mahlzeit/${LEGACY_MAHLZEIT_ID}`)
    await expect(page.getByText('Die 6 Sättigungs-Bausteine')).toBeVisible({ timeout: 10000 })
    // Die Pillar-Kachel "Art of Eating" (immer "nicht_bewertet") existiert weiterhin im Grid —
    // hier wird nur geprüft, dass KEIN eigenständiger Hinweis-Block mit Link erscheint
    await expect(page.getByRole('link', { name: 'Wie esse ich richtig? →' })).not.toBeVisible()
  })
})

test.describe('Art of Eating: Rotation', () => {
  test('zeigt über mehrere Analysen hinweg nicht immer exakt denselben Prinzip-Titel', async ({ page }) => {
    await loginAs(page)
    const seenTitles = new Set<string>()

    for (let i = 0; i < 8; i++) {
      setupAnalyseMocks(page, { ...MAHLZEIT_RESULT, analysisId: `aoe-rotation-${i}` })
      await page.goto('/analyse')
      await page.locator('textarea').waitFor({ timeout: 10000 })
      await page.fill('textarea', 'Hähnchenbrust')
      await page.getByRole('button', { name: /^analysieren/i }).click()
      await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible({ timeout: 10000 })
      await page.getByRole('button', { name: /passt so/i }).click()
      const label = await page.getByText(/🧘 Art of Eating ·/).textContent()
      if (label) seenTitles.add(label)
    }

    // Bei 8 Versuchen über 6 mögliche Prinzipien ist es statistisch verschwindend
    // unwahrscheinlich, nur ein einziges zu sehen, wenn die Auswahl wirklich zufällig ist
    expect(seenTitles.size).toBeGreaterThan(1)
  })
})
