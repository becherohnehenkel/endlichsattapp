/**
 * PROJ-17 — Wöchentlicher Sättigungs-Recap
 *
 * Teststrategie:
 * - Security: /api/recap/wochen → 401 ohne Auth
 * - Fortschritts-Zustand: aktuelle Woche mit 0 / 1 / 2 Analysen
 * - Vollständiger Recap: Gesamtbewertung, Bausteine, Makros, Zutaten
 * - Collapse/Expand: aktuelle Woche offen, vergangene zu
 * - Regression: bestehende Historie-Features noch intakt
 * - Alle API-Routen via page.route() gemockt
 */

import { test, expect, type Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'

async function loginAndGoToHistorie(page: Page) {
  await page.goto('/login')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/', { timeout: 8000 })
  await page.goto('/historie')
}

// ─── Mock-Daten ───────────────────────────────────────────────

const MOCK_MEALS = {
  meals: [
    { id: 'meal-1', freeText: 'Hähnchen mit Gemüse', thumbnailUrl: null, createdAt: new Date(Date.now() - 3600000).toISOString(), gesamtbewertung: 'sehr_saettigend' },
    { id: 'meal-2', freeText: 'Pasta Bolognese', thumbnailUrl: null, createdAt: new Date(Date.now() - 7200000).toISOString(), gesamtbewertung: 'maessig_saettigend' },
  ],
  hasMore: false,
}

const WOCHE_AKTUELL_LEER = {
  startDatum: '2026-06-28',
  endDatum: '2026-07-04',
  label: 'Diese Woche',
  istAktuelleWoche: true,
  anzahlGesamt: 0,
  anzahlBeilagen: 0,
  anzahlStandard: 0,
  gesamtbewertungAvg: null,
  schwächsterBaustein: null,
  bausteine: null,
  makrosAvg: null,
  topZutaten: [],
}

const WOCHE_AKTUELL_EINE_ANALYSE = {
  ...WOCHE_AKTUELL_LEER,
  anzahlGesamt: 1,
  anzahlStandard: 1,
}

const WOCHE_AKTUELL_ZWEI_ANALYSEN = {
  ...WOCHE_AKTUELL_LEER,
  anzahlGesamt: 2,
  anzahlStandard: 2,
}

const WOCHE_AKTUELL_VOLLSTAENDIG = {
  startDatum: '2026-06-28',
  endDatum: '2026-07-04',
  label: 'Diese Woche',
  istAktuelleWoche: true,
  anzahlGesamt: 4,
  anzahlBeilagen: 1,
  anzahlStandard: 3,
  gesamtbewertungAvg: 'maessig_saettigend',
  schwächsterBaustein: 'biss',
  bausteine: {
    geschmack: 'gut', biss: 'schwach', ballaststoffe: 'mittel',
    proteine: 'gut', volumen: 'mittel', art_of_eating: 'nicht_bewertet',
  },
  makrosAvg: { kcal: 520, protein_g: 28, kohlenhydrate_g: 65, fett_g: 18, ballaststoffe_g: 4 },
  topZutaten: ['Hähnchenbrust', 'Pasta', 'Tomate', 'Olivenöl', 'Käse'],
}

const WOCHE_LETZTE_VOLLSTAENDIG = {
  startDatum: '2026-06-21',
  endDatum: '2026-06-27',
  label: 'Letzte Woche',
  istAktuelleWoche: false,
  anzahlGesamt: 5,
  anzahlBeilagen: 0,
  anzahlStandard: 5,
  gesamtbewertungAvg: 'sehr_saettigend',
  schwächsterBaustein: null,
  bausteine: {
    geschmack: 'gut', biss: 'gut', ballaststoffe: 'gut',
    proteine: 'gut', volumen: 'gut', art_of_eating: 'nicht_bewertet',
  },
  makrosAvg: { kcal: 580, protein_g: 35, kohlenhydrate_g: 70, fett_g: 20, ballaststoffe_g: 7 },
  topZutaten: ['Hähnchen', 'Gemüse', 'Quinoa'],
}

function mockApis(page: Page, recap: object | object[], meals = MOCK_MEALS) {
  const wochen = Array.isArray(recap) ? recap : [recap]
  page.route('/api/mahlzeiten**', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(meals) })
  )
  page.route('/api/recap/wochen', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ wochen }) })
  )
}

// ─── Security ─────────────────────────────────────────────────

test.describe('Security', () => {
  test('GET /api/recap/wochen → 401 ohne Authentifizierung', async ({ page }) => {
    const res = await page.request.get('/api/recap/wochen')
    expect(res.status()).toBe(401)
  })
})

// ─── Wochenrückblick-Sektion ──────────────────────────────────

test.describe('Wochenrückblick-Sektion sichtbar', () => {
  test('Wochenrückblick-Heading erscheint auf der Historien-Seite', async ({ page }) => {
    mockApis(page, WOCHE_AKTUELL_LEER)
    await loginAndGoToHistorie(page)
    await expect(page.getByText(/Wochenrückblick/i)).toBeVisible({ timeout: 8000 })
  })

  test('Lade-Skelett wird angezeigt während Recap lädt', async ({ page }) => {
    let resolve!: () => void
    page.route('/api/mahlzeiten**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_MEALS) })
    )
    page.route('/api/recap/wochen', async route => {
      await new Promise<void>(r => { resolve = r })
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ wochen: [WOCHE_AKTUELL_LEER] }) })
    })
    await loginAndGoToHistorie(page)
    const skeleton = page.locator('.animate-pulse').first()
    await expect(skeleton).toBeVisible({ timeout: 5000 })
    resolve()
    await expect(page.getByText('Diese Woche')).toBeVisible({ timeout: 5000 })
  })
})

// ─── Fortschritts-Zustand (< 3 Analysen) ─────────────────────

test.describe('Fortschritts-Zustand aktuelle Woche', () => {
  test('0 Analysen: "Noch 3 Mahlzeiten bis zu deinem Wochenrückblick"', async ({ page }) => {
    mockApis(page, WOCHE_AKTUELL_LEER, { meals: [], hasMore: false })
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Diese Woche')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/Noch 3 Mahlzeiten bis zu deinem Wochenrückblick/)).toBeVisible()
  })

  test('1 Analyse: "Noch 2 Mahlzeiten bis zu deinem Wochenrückblick"', async ({ page }) => {
    mockApis(page, WOCHE_AKTUELL_EINE_ANALYSE)
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Diese Woche')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/Noch 2 Mahlzeiten bis zu deinem Wochenrückblick/)).toBeVisible()
  })

  test('2 Analysen: "Noch 1 Mahlzeit bis zu deinem Wochenrückblick"', async ({ page }) => {
    mockApis(page, WOCHE_AKTUELL_ZWEI_ANALYSEN)
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Diese Woche')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/Noch 1 Mahlzeit bis zu deinem Wochenrückblick/)).toBeVisible()
  })

  test('Fortschritts-Punkte (3 Dots) sichtbar im aufgeklappten Zustand', async ({ page }) => {
    mockApis(page, WOCHE_AKTUELL_EINE_ANALYSE)
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Diese Woche')).toBeVisible({ timeout: 8000 })
    // Current week is open by default, so progress content visible
    await expect(page.getByText('1 / 3 Mahlzeiten analysiert')).toBeVisible()
  })
})

// ─── Vollständiger Recap (≥ 3 Analysen) ──────────────────────

test.describe('Vollständiger Recap-Inhalt', () => {
  test('Gesamtbewertungs-Badge im Header sichtbar', async ({ page }) => {
    mockApis(page, WOCHE_AKTUELL_VOLLSTAENDIG)
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Diese Woche')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/Ø Mäßig sättigend/)).toBeVisible()
  })

  test('Mahlzeiten-Anzahl mit Beilagen-Hinweis angezeigt', async ({ page }) => {
    mockApis(page, WOCHE_AKTUELL_VOLLSTAENDIG)
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Diese Woche')).toBeVisible({ timeout: 8000 })
    // 4 Mahlzeiten, davon 1 Beilage
    await expect(page.getByText(/4 Mahlzeiten analysiert.*davon 1 Beilage/)).toBeVisible({ timeout: 5000 })
  })

  test('6 Bausteine werden angezeigt', async ({ page }) => {
    mockApis(page, WOCHE_AKTUELL_VOLLSTAENDIG)
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Diese Woche')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('6 Bausteine')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Geschmack')).toBeVisible()
    await expect(page.getByText('Biss')).toBeVisible()
    await expect(page.getByText('Ballaststoffe')).toBeVisible()
    await expect(page.getByText('Proteine')).toBeVisible()
    await expect(page.getByText('Volumen')).toBeVisible()
    await expect(page.getByText('Art of Eating')).toBeVisible()
  })

  test('"Blinder Fleck" Callout zeigt schwächsten Baustein', async ({ page }) => {
    mockApis(page, WOCHE_AKTUELL_VOLLSTAENDIG)
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Diese Woche')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/Dein blinder Fleck diese Woche: Biss/)).toBeVisible({ timeout: 5000 })
  })

  test('Ø Makros pro Mahlzeit werden angezeigt', async ({ page }) => {
    mockApis(page, WOCHE_AKTUELL_VOLLSTAENDIG)
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Diese Woche')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Ø pro Mahlzeit')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('520')).toBeVisible() // kcal
    await expect(page.getByText('28g')).toBeVisible() // Protein
  })

  test('Top-5 Zutaten als Tags angezeigt', async ({ page }) => {
    mockApis(page, WOCHE_AKTUELL_VOLLSTAENDIG)
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Diese Woche')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Häufigste Zutaten')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Hähnchenbrust')).toBeVisible()
    await expect(page.getByText('Pasta')).toBeVisible()
    await expect(page.getByText('Tomate')).toBeVisible()
  })
})

// ─── Collapse / Expand ────────────────────────────────────────

test.describe('Collapse / Expand', () => {
  test('aktuelle Woche ist standardmäßig aufgeklappt', async ({ page }) => {
    mockApis(page, WOCHE_AKTUELL_VOLLSTAENDIG)
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Diese Woche')).toBeVisible({ timeout: 8000 })
    // Full recap content visible without clicking
    await expect(page.getByText('6 Bausteine')).toBeVisible({ timeout: 5000 })
  })

  test('vergangene Woche ist standardmäßig eingeklappt', async ({ page }) => {
    mockApis(page, [WOCHE_AKTUELL_VOLLSTAENDIG, WOCHE_LETZTE_VOLLSTAENDIG])
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Letzte Woche')).toBeVisible({ timeout: 8000 })
    // Past week content not visible until clicked
    await expect(page.getByText('Hähnchen')).toBeHidden()
  })

  test('Klick auf vergangene Woche klappt sie auf', async ({ page }) => {
    mockApis(page, [WOCHE_AKTUELL_VOLLSTAENDIG, WOCHE_LETZTE_VOLLSTAENDIG])
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Letzte Woche')).toBeVisible({ timeout: 8000 })
    await page.getByText('Letzte Woche').click()
    await expect(page.getByText('Hähnchen')).toBeVisible({ timeout: 5000 })
  })

  test('zwei Wochen können gleichzeitig aufgeklappt sein', async ({ page }) => {
    mockApis(page, [WOCHE_AKTUELL_VOLLSTAENDIG, WOCHE_LETZTE_VOLLSTAENDIG])
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Letzte Woche')).toBeVisible({ timeout: 8000 })
    // Current week is open → click past week → both open
    await page.getByText('Letzte Woche').click()
    await expect(page.getByText('Hähnchen')).toBeVisible({ timeout: 5000 }) // past week content
    await expect(page.getByText('Hähnchenbrust')).toBeVisible() // current week content still visible
  })

  test('vergangene Woche schließt sich wieder beim erneuten Klick', async ({ page }) => {
    mockApis(page, [WOCHE_AKTUELL_VOLLSTAENDIG, WOCHE_LETZTE_VOLLSTAENDIG])
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Letzte Woche')).toBeVisible({ timeout: 8000 })
    await page.getByText('Letzte Woche').click()
    await expect(page.getByText('Hähnchen')).toBeVisible({ timeout: 5000 })
    await page.getByText('Letzte Woche').click()
    await expect(page.getByText('Hähnchen')).toBeHidden({ timeout: 3000 })
  })
})

// ─── Wochenstruktur ───────────────────────────────────────────

test.describe('Wochenstruktur', () => {
  test('vergangene Woche mit < 3 Analysen erscheint nicht', async ({ page }) => {
    // API returns only current week (past week filtered server-side)
    mockApis(page, [WOCHE_AKTUELL_LEER])
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Diese Woche')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Letzte Woche')).toBeHidden()
  })

  test('vergangene Woche mit >= 3 Analysen erscheint eingeklappt', async ({ page }) => {
    mockApis(page, [WOCHE_AKTUELL_VOLLSTAENDIG, WOCHE_LETZTE_VOLLSTAENDIG])
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Letzte Woche')).toBeVisible({ timeout: 8000 })
    // Collapsed: headline visible, content not
    await expect(page.getByText('Ø Sehr sättigend')).toBeVisible()
    await expect(page.getByText('Hähnchen')).toBeHidden()
  })

  test('Datum-Spanne sichtbar im Wochenkarten-Header', async ({ page }) => {
    mockApis(page, WOCHE_AKTUELL_LEER)
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Diese Woche')).toBeVisible({ timeout: 8000 })
    // Date range "28. Jun – 4. Jul" or similar should be visible
    await expect(page.getByText(/Jun.*Jul|Jul.*Jun/)).toBeVisible({ timeout: 3000 })
  })
})

// ─── Regression: PROJ-6 Historie-Features ─────────────────────

test.describe('Regression: PROJ-6 Historien-Features', () => {
  test('Mahlzeiten-Liste noch sichtbar unter dem Wochenrückblick', async ({ page }) => {
    mockApis(page, WOCHE_AKTUELL_VOLLSTAENDIG)
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Diese Woche')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Hähnchen mit Gemüse')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Pasta Bolognese')).toBeVisible()
  })

  test('FAB-Button "Neue Mahlzeit" noch vorhanden', async ({ page }) => {
    mockApis(page, WOCHE_AKTUELL_VOLLSTAENDIG)
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Diese Woche')).toBeVisible({ timeout: 8000 })
    await expect(page.getByRole('link', { name: /neue mahlzeit/i })).toBeVisible({ timeout: 5000 })
  })

  test('Leerer Zustand zeigt CTA wenn keine Mahlzeiten', async ({ page }) => {
    mockApis(page, WOCHE_AKTUELL_LEER, { meals: [], hasMore: false })
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Diese Woche')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Deine erste Analyse wartet')).toBeVisible({ timeout: 5000 })
  })

  test('Mahlzeit-Link navigiert zur Detail-Seite', async ({ page }) => {
    mockApis(page, WOCHE_AKTUELL_VOLLSTAENDIG)
    await loginAndGoToHistorie(page)
    await expect(page.getByText('Hähnchen mit Gemüse')).toBeVisible({ timeout: 8000 })
    await page.getByRole('link', { name: /hähnchen mit gemüse/i }).click()
    await expect(page).toHaveURL(/\/mahlzeit\/meal-1/)
  })
})
