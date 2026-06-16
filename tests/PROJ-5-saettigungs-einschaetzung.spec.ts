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
]

const MOCK_RESULT_MAESSIG = {
  analysisId: 'analysis-123',
  result: {
    zutatenliste: [{ name: 'Hähnchenbrust', amount: '200g', source: 'usda', sourceName: 'Chicken, raw' }],
    annahmen: [],
    vorher: {
      bausteine: {
        geschmack: 'mittel',
        biss: 'gut',
        ballaststoffe: 'schwach',
        proteine: 'gut',
        volumen: 'mittel',
        art_of_eating: 'nicht_bewertet',
      },
      gesamtbewertung: 'maessig_saettigend',
      erklaerung: 'Gutes Protein, aber wenig Ballaststoffe.',
      naehrwerte: { kcal: 240, protein_g: 44, kohlenhydrate_g: 0, zucker_g: 0, fett_g: 5, ballaststoffe_g: 0 },
    },
    vorschlaege: [{ aktion: 'Gurken dazugeben', begruendung: 'Mehr Volumen', baustein: 'volumen' }],
    nachher: {
      bausteine: {
        geschmack: 'mittel',
        biss: 'gut',
        ballaststoffe: 'mittel',
        proteine: 'gut',
        volumen: 'gut',
        art_of_eating: 'nicht_bewertet',
      },
      gesamtbewertung: 'sehr_saettigend',
      naehrwerte: { kcal: 256, protein_g: 44, kohlenhydrate_g: 4, zucker_g: 2, fett_g: 5, ballaststoffe_g: 1 },
      deltas: [{ wert: 'volumen', vorher: 0, nachher: 1, veraenderung: 1 }],
    },
    art_of_eating_tipp: 'Nimm dir 10 Minuten ohne Handy.',
  },
}

const MOCK_RESULT_SEHR_SAETTIGEND = {
  analysisId: 'analysis-456',
  result: {
    zutatenliste: [{ name: 'Linsensalat', amount: '300g', source: 'usda', sourceName: 'Lentils' }],
    annahmen: [],
    vorher: {
      bausteine: {
        geschmack: 'gut',
        biss: 'gut',
        ballaststoffe: 'gut',
        proteine: 'gut',
        volumen: 'gut',
        art_of_eating: 'gut',
      },
      gesamtbewertung: 'sehr_saettigend',
      erklaerung: 'Exzellente Mahlzeit mit top Sättigungswert.',
      naehrwerte: { kcal: 450, protein_g: 40, kohlenhydrate_g: 50, zucker_g: 5, fett_g: 15, ballaststoffe_g: 12 },
    },
    vorschlaege: [],
    nachher: {
      bausteine: {
        geschmack: 'gut',
        biss: 'gut',
        ballaststoffe: 'gut',
        proteine: 'gut',
        volumen: 'gut',
        art_of_eating: 'gut',
      },
      gesamtbewertung: 'sehr_saettigend',
      naehrwerte: { kcal: 450, protein_g: 40, kohlenhydrate_g: 50, zucker_g: 5, fett_g: 15, ballaststoffe_g: 12 },
      deltas: [],
    },
    art_of_eating_tipp: null,
  },
}

function setupToConfirming(page: Page) {
  page.route('/api/meal', route =>
    route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'mock-meal-id' }) })
  )
  page.route('/api/analyse/start', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ready: true }) })
  )
  page.route('/api/analyse/complete', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ingredients: MOCK_INGREDIENTS, assumptions: [] }) })
  )
}

async function reachDone(page: Page, mockResult = MOCK_RESULT_MAESSIG) {
  setupToConfirming(page)
  page.route('/api/analyse/confirm', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockResult) })
  )
  await page.fill('textarea', 'Hähnchenbrust mit Olivenöl')
  await page.getByRole('button', { name: /^analysieren/i }).click()
  await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible({ timeout: 10000 })
  await page.getByRole('button', { name: /passt so/i }).click()
  await expect(page.getByText('Die 6 Sättigungs-Bausteine')).toBeVisible({ timeout: 10000 })
}

// ─────────────────────────────────────────────────────────────
// GESAMTBEWERTUNG
// ─────────────────────────────────────────────────────────────
test.describe('Gesamtbewertung', () => {
  test('Badge "Mäßig sättigend" erscheint bei maessig_saettigend', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    await expect(page.getByText('Mäßig sättigend')).toBeVisible()
  })

  test('Badge "Sehr sättigend" erscheint bei sehr_saettigend', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_SEHR_SAETTIGEND)
    await expect(page.getByText('Sehr sättigend')).toBeVisible()
  })

  test('Erklärungs-Text des Gerichts wird angezeigt', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    await expect(page.getByText('Gutes Protein, aber wenig Ballaststoffe.')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────
// DIE 6 SÄTTIGUNGS-BAUSTEINE
// ─────────────────────────────────────────────────────────────
test.describe('Die 6 Sättigungs-Bausteine', () => {
  test('Alle 6 Baustein-Namen sind sichtbar', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    for (const label of ['Geschmack', 'Biss', 'Ballaststoffe', 'Proteine', 'Volumen', 'Art of Eating']) {
      await expect(page.getByText(label).first()).toBeVisible()
    }
  })

  test('Baustein mit Rating "gut" zeigt Label "Gut"', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    // biss is 'gut' in MOCK_RESULT_MAESSIG
    const bausteinSection = page.locator('div.grid.grid-cols-3')
    await expect(bausteinSection.getByText('Gut').first()).toBeVisible()
  })

  test('Baustein mit Rating "schwach" zeigt Label "Schwach"', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    // ballaststoffe is 'schwach' — label appears in both grid and Vorher/Nachher
    await expect(page.getByText('Schwach').first()).toBeVisible()
  })

  test('Baustein mit Rating "nicht_bewertet" zeigt Label "–"', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    // art_of_eating is 'nicht_bewertet' — dash appears in both sections
    await expect(page.getByText('–').first()).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────
// VERBESSERUNGSVORSCHLÄGE
// ─────────────────────────────────────────────────────────────
test.describe('Verbesserungsvorschläge', () => {
  test('"So wird\'s noch sättigender" Abschnitt ist sichtbar bei maessig_saettigend', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    await expect(page.getByText("So wird's noch sättigender")).toBeVisible()
  })

  test('Vorschlag "Gurken dazugeben" erscheint', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    await expect(page.getByText('Gurken dazugeben')).toBeVisible()
  })

  test('Bei "sehr_saettigend" erscheint KEIN Verbesserungsvorschlag-Abschnitt', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_SEHR_SAETTIGEND)
    await expect(page.getByText("So wird's noch sättigender")).not.toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────
// SEHR SÄTTIGEND — POSITIVE BESTÄTIGUNG
// ─────────────────────────────────────────────────────────────
test.describe('Sehr sättigend — positive Bestätigung', () => {
  test('Positiver Bestätigungs-Block erscheint bei sehr_saettigend', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_SEHR_SAETTIGEND)
    await expect(page.getByText('Das machst du bereits richtig gut!')).toBeVisible()
  })

  test('Positive Bestätigung enthält 🎉-Emoji', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_SEHR_SAETTIGEND)
    await expect(page.getByText('🎉')).toBeVisible()
  })

  test('Bei maessig_saettigend erscheint KEIN positiver Bestätigungs-Block', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    await expect(page.getByText('Das machst du bereits richtig gut!')).not.toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────
// VORHER / NACHHER VERGLEICH
// ─────────────────────────────────────────────────────────────
test.describe('Vorher → Nachher Vergleich', () => {
  test('"Vorher → Nachher" Abschnitt ist sichtbar wenn Vorschläge vorhanden', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    await expect(page.getByText('Vorher → Nachher')).toBeVisible()
  })

  test('"Jetzt"-Spalte ist sichtbar', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    await expect(page.getByText('Jetzt')).toBeVisible()
  })

  test('"Nach Verbesserung"-Spalte ist sichtbar', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    await expect(page.getByText('Nach Verbesserung')).toBeVisible()
  })

  test('Verbesserte Bausteine in Nachher-Spalte haben Ring-Highlight', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    // 'volumen' improved — it should have ring-emerald-400 class
    const nachherSection = page.locator('div').filter({ hasText: 'Nach Verbesserung' })
    const improvedChip = nachherSection.locator('.ring-emerald-400').first()
    await expect(improvedChip).toBeVisible()
  })

  test('Kein Vorher/Nachher-Abschnitt wenn keine Vorschläge (sehr_saettigend)', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_SEHR_SAETTIGEND)
    await expect(page.getByText('Vorher → Nachher')).not.toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────
// ART OF EATING TIPP
// ─────────────────────────────────────────────────────────────
test.describe('Art of Eating Tipp', () => {
  test('Tipp-Block erscheint wenn art_of_eating_tipp gesetzt ist', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    await expect(page.getByText('Nimm dir 10 Minuten ohne Handy.')).toBeVisible()
  })

  test('Tipp-Block hat "🧘 Art of Eating" Label', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    await expect(page.getByText('🧘 Art of Eating')).toBeVisible()
  })

  test('Tipp-Block fehlt wenn art_of_eating_tipp null ist', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_SEHR_SAETTIGEND)
    await expect(page.getByText('🧘 Art of Eating')).not.toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────
// NÄHRWERTE
// ─────────────────────────────────────────────────────────────
test.describe('Nährwerte', () => {
  test('"Nährwerte der Mahlzeit" Abschnitt ist sichtbar', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    await expect(page.getByText('Nährwerte der Mahlzeit')).toBeVisible()
  })

  test('kcal-Wert der Mahlzeit erscheint', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    await expect(page.getByText('240 kcal')).toBeVisible()
  })

  test('Protein-Wert erscheint', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    await expect(page.getByText('44g Protein')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────
// ANNAHMEN-ALERT
// ─────────────────────────────────────────────────────────────
test.describe('Annahmen-Alert', () => {
  test('Alert erscheint wenn assumptions vom confirm-Schritt mitgegeben werden', async ({ page }) => {
    await loginAs(page)
    setupToConfirming(page)
    page.route('/api/analyse/confirm', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_RESULT_MAESSIG) })
    )
    // Override complete to include assumptions
    page.route('/api/analyse/complete', route =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ ingredients: MOCK_INGREDIENTS, assumptions: ['Magerquark 0,2% Fett angenommen'] }),
      })
    )
    await page.fill('textarea', 'Hähnchenbrust')
    await page.getByRole('button', { name: /^analysieren/i }).click()
    await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /passt so/i }).click()
    await expect(page.getByText('Basierend auf Annahmen:')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Magerquark/)).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────
// RESET — NEUE MAHLZEIT
// ─────────────────────────────────────────────────────────────
test.describe('Reset — Neue Mahlzeit', () => {
  test('"Neue Mahlzeit analysieren"-Button ist sichtbar', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    await expect(page.getByRole('button', { name: /neue mahlzeit analysieren/i })).toBeVisible()
  })

  test('Klick auf "Neue Mahlzeit" kehrt zum Input-Formular zurück', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    await page.getByRole('button', { name: /neue mahlzeit analysieren/i }).click()
    await expect(page.getByRole('button', { name: /^analysieren/i })).toBeVisible({ timeout: 5000 })
  })
})

// ─────────────────────────────────────────────────────────────
// RESPONSIVE — Mobile 375px
// ─────────────────────────────────────────────────────────────
test.describe('Responsive — Mobile 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('Ergebnis-Screen scrollt nicht horizontal auf 375px', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
  })

  test('"Neue Mahlzeit"-Button ist mindestens 44px hoch (Touch-Target)', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    const button = page.getByRole('button', { name: /neue mahlzeit analysieren/i })
    const box = await button.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44)
  })

  test('Vorher/Nachher zeigt gestapelt (einspaltig) bei 375px', async ({ page }) => {
    await loginAs(page)
    await reachDone(page, MOCK_RESULT_MAESSIG)
    // At 375px the grid is single-column — "Jetzt" appears above "Nach Verbesserung"
    const jetztEl = page.getByText('Jetzt')
    const nachherEl = page.getByText('Nach Verbesserung')
    await expect(jetztEl).toBeVisible()
    await expect(nachherEl).toBeVisible()
    const jetztBox = await jetztEl.boundingBox()
    const nachherBox = await nachherEl.boundingBox()
    // Stacked means Jetzt is higher up (smaller y) than Nach Verbesserung
    expect(jetztBox!.y).toBeLessThan(nachherBox!.y)
  })
})
