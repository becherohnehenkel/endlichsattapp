import { test, expect, Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'

async function loginAs(page: Page) {
  await page.goto('/login?redirectTo=%2Fanalyse')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/analyse', { timeout: 8000 })
}

function mockAnalyseFlow(page: Page, confirmResult: unknown) {
  page.route('/api/meal', route => route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'mock-meal-id' }) }))
  page.route('/api/analyse/start', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ready: true }) }))
  page.route('/api/analyse/complete', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ingredients: [{ name: 'Hähnchenbrust', amount: '200g', isAssumption: false }], assumptions: [] }),
  }))
  page.route('/api/analyse/confirm', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(confirmResult) }))
}

async function reachResult(page: Page) {
  await page.fill('textarea', 'Hähnchenbrust')
  await page.getByRole('button', { name: /^analysieren/i }).click()
  await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible({ timeout: 10000 })
  await page.getByRole('button', { name: /passt so/i }).click()
  await expect(page.getByText('Die 6 Sättigungs-Bausteine')).toBeVisible({ timeout: 8000 })
}

const BASE_STANDARD_RESULT = {
  vorher: {
    bausteine: { geschmack: 'mittel', biss: 'gut', ballaststoffe: 'schwach', proteine: 'gut', volumen: 'mittel', art_of_eating: 'nicht_bewertet' },
    gesamtbewertung: 'maessig_saettigend',
    erklaerung: 'Test.',
    naehrwerte: { kcal: 240, protein_g: 44, kohlenhydrate_g: 0, zucker_g: 0, fett_g: 5, ballaststoffe_g: 0 },
  },
  vorschlaege: [],
  nachher: {
    bausteine: { geschmack: 'mittel', biss: 'gut', ballaststoffe: 'mittel', proteine: 'gut', volumen: 'gut', art_of_eating: 'nicht_bewertet' },
    gesamtbewertung: 'sehr_saettigend',
    naehrwerte: { kcal: 256, protein_g: 44, kohlenhydrate_g: 4, zucker_g: 2, fett_g: 5, ballaststoffe_g: 1 },
    deltas: [],
  },
  art_of_eating_tipp: null,
}

test.describe('Zutatenliste-Transparenz auf der Ergebnisseite', () => {
  test('Zutaten-Bereich ist eigenständig, getrennt vom Annahmen-Bereich, und standardmäßig eingeklappt', async ({ page }) => {
    await loginAs(page)
    mockAnalyseFlow(page, {
      analysisId: 'a1',
      result: {
        ...BASE_STANDARD_RESULT,
        zutatenliste: [{ name: 'Hähnchenbrust', amount: '200g', grams: 200 }],
        annahmen: ['Testannahme'],
        zutatenQuellen: ['bls'],
      },
    })
    await reachResult(page)
    await expect(page.getByText('ℹ️ Basierend auf Annahmen')).toBeVisible()
    await expect(page.getByText(/🥗 Zutaten/)).toBeVisible()
    // Eingeklappt: Zutaten-Inhalt noch nicht sichtbar
    await expect(page.getByText('200g → 200g')).toHaveCount(0)
  })

  test('Zeigt pro Zutat Name, Original-Menge und Gramm-Schätzung', async ({ page }) => {
    await loginAs(page)
    mockAnalyseFlow(page, {
      analysisId: 'a2',
      result: {
        ...BASE_STANDARD_RESULT,
        zutatenliste: [{ name: 'Olivenöl', amount: '1 EL', grams: 15 }],
        annahmen: [],
        zutatenQuellen: ['bls'],
      },
    })
    await reachResult(page)
    await page.getByText(/🥗 Zutaten/).click()
    await expect(page.getByText('Olivenöl')).toBeVisible()
    await expect(page.getByText('1 EL → 15g')).toBeVisible()
  })

  test('BLS/OFF-Zutat ohne Kennzeichnung, KI-geschätzte und nicht-schätzbare Zutat mit Badge', async ({ page }) => {
    await loginAs(page)
    mockAnalyseFlow(page, {
      analysisId: 'a3',
      result: {
        ...BASE_STANDARD_RESULT,
        zutatenliste: [
          { name: 'Reis', amount: '150g', grams: 150 },
          { name: 'Yuzu-Paste', amount: '1 TL', grams: 5 },
          { name: 'Mysteriöses Pulver', amount: '1 Prise', grams: 1 },
        ],
        annahmen: [],
        zutatenQuellen: ['bls', 'schaetzung', 'nicht_schaetzbar'],
      },
    })
    await reachResult(page)
    await page.getByText(/🥗 Zutaten/).click()
    const reisRow = page.locator('li', { hasText: 'Reis' })
    await expect(reisRow.getByText('≈ KI-geschätzt')).toHaveCount(0)
    await expect(reisRow.getByText('⚠️ nicht schätzbar')).toHaveCount(0)
    await expect(page.locator('li', { hasText: 'Yuzu-Paste' }).getByText('≈ KI-geschätzt')).toBeVisible()
    await expect(page.locator('li', { hasText: 'Mysteriöses Pulver' }).getByText('⚠️ nicht schätzbar')).toBeVisible()
  })

  test('Alte Hinweisblöcke (KI-Schätzung/nicht schätzbar als Satz im Annahmen-Bereich) erscheinen nicht mehr', async ({ page }) => {
    await loginAs(page)
    mockAnalyseFlow(page, {
      analysisId: 'a4',
      result: {
        ...BASE_STANDARD_RESULT,
        zutatenliste: [{ name: 'Yuzu-Paste', amount: '1 TL', grams: 5 }],
        annahmen: [],
        zutatenQuellen: ['schaetzung'],
      },
    })
    await reachResult(page)
    await expect(page.getByText(/ist eine KI-Schätzung \(keine Datenbankquelle/)).toHaveCount(0)
    await expect(page.getByText(/konnte nicht zuverlässig geschätzt werden — fließt/)).toHaveCount(0)
  })

  // PROJ-28 (BUG-7-Fix, 2026-08-04): zwei gleichnamige Zutaten mit unterschiedlicher Quelle
  // dürfen nicht dieselbe Badge-Kennzeichnung bekommen
  test('Zwei Zutaten mit identischem Namen behalten jeweils ihre eigene, korrekte Kennzeichnung', async ({ page }) => {
    await loginAs(page)
    mockAnalyseFlow(page, {
      analysisId: 'a5',
      result: {
        ...BASE_STANDARD_RESULT,
        zutatenliste: [
          { name: 'Zwiebel', amount: '1 Stück', grams: 80 },
          { name: 'Zwiebel', amount: '1 EL geröstet', grams: 15 },
        ],
        annahmen: [],
        zutatenQuellen: ['bls', 'schaetzung'],
      },
    })
    await reachResult(page)
    await page.getByText(/🥗 Zutaten/).click()
    const zwiebelRows = page.locator('li', { hasText: 'Zwiebel' })
    await expect(zwiebelRows).toHaveCount(2)
    // Erste Zeile (BLS-Treffer): kein Badge
    await expect(zwiebelRows.nth(0).getByText('≈ KI-geschätzt')).toHaveCount(0)
    // Zweite Zeile (KI-geschätzt): Badge vorhanden
    await expect(zwiebelRows.nth(1).getByText('≈ KI-geschätzt')).toBeVisible()
  })
})
