import { test, expect, Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'

// Minimal valid 1×1 JPEG for upload tests
const TINY_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoH' +
  'BwYIDAoMCwsKCwsNCxAQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/wAAR' +
  'CAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAP/' +
  'xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=',
  'base64'
)

// Realistische Mock-Daten für /api/analyse/complete und /api/analyse/confirm — vorher gab
// /complete nur { ok: true } zurück, was runCompleteAnalysis() als "Zutaten nicht erkannt"
// interpretierte und zurück zu 'input' schickte. Dadurch erreichten 4 Tests nie den
// erwarteten Folgezustand (fiel erst auf, nachdem der Login-Redirect-Bug behoben wurde —
// vorher kamen diese Tests gar nicht so weit). Siehe PROJ-2-Bugfix-Notiz 2026-06-16.
const MOCK_INGREDIENTS = [
  { name: 'Hähnchenbrust', amount: '150g' },
  { name: 'Reis', amount: '80g' },
]

const MOCK_RESULT = {
  zutatenliste: [{ name: 'Hähnchenbrust', amount: '150g', source: 'bls', sourceName: 'Hähnchenbrust' }],
  annahmen: [],
  vorher: {
    bausteine: { geschmack: 'gut', biss: 'gut', ballaststoffe: 'mittel', proteine: 'gut', volumen: 'mittel', art_of_eating: 'nicht_bewertet' },
    gesamtbewertung: 'sehr_saettigend',
    erklaerung: 'Test-Erklärung.',
    naehrwerte: { kcal: 500, protein_g: 40, kohlenhydrate_g: 50, zucker_g: 5, fett_g: 15, ballaststoffe_g: 5 },
  },
  rezeptbibliothek_hinweis: false,
  vorschlaege: [],
  nachher: {
    bausteine: { geschmack: 'gut', biss: 'gut', ballaststoffe: 'mittel', proteine: 'gut', volumen: 'mittel', art_of_eating: 'nicht_bewertet' },
    gesamtbewertung: 'sehr_saettigend',
    naehrwerte: { kcal: 500, protein_g: 40, kohlenhydrate_g: 50, zucker_g: 5, fett_g: 15, ballaststoffe_g: 5 },
    deltas: [],
  },
  art_of_eating_tipp: null,
}

async function loginAs(page: Page) {
  // Seit PROJ-6 ist "/" die Standard-Landingpage nach Login (ohne redirectTo) — explizit
  // anfordern, da diese Tests auf /analyse laufen. Siehe PROJ-2-Bugfix-Notiz 2026-06-16.
  await page.goto('/login?redirectTo=%2Fanalyse')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/analyse', { timeout: 8000 })
}

function mockApis(page: Page, scenario: 'questions' | 'ready' | 'skip-assumptions') {
  page.route('/api/meal', async route => {
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'mock-meal-id' }) })
  })

  page.route('/api/analyse/start', async route => {
    if (scenario === 'ready') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ready: true }) })
    } else {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          questions: [
            { id: 'q1', text: 'Wie wurde das Fleisch zubereitet?' },
            { id: 'q2', text: 'Wie viel Öl wurde zum Braten verwendet?' },
          ],
        }),
      })
    }
  })

  page.route('/api/analyse/answer', async route => {
    const body = JSON.parse((await route.request().postData()) ?? '{}')
    if (body.skipped || scenario === 'skip-assumptions') {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ ready: true, assumptions: ['Magerquark 0,2% Fett', '1 EL Olivenöl'] }),
      })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ready: true }) })
    }
  })

  // /api/analyse/complete (PROJ-4) — muss { ingredients, assumptions } liefern, sonst
  // interpretiert runCompleteAnalysis() das als "Zutaten nicht erkannt" und bricht ab.
  // assumptions hier bewusst NICHT mitschicken, damit die bereits über /answer gesetzten
  // Annahmen (skip-assumptions-Szenario) nicht überschrieben werden.
  page.route('/api/analyse/complete', async route => {
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ ingredients: MOCK_INGREDIENTS }),
    })
  })

  // /api/analyse/confirm (PROJ-5) — wird beim Klick auf "Passt so →" aufgerufen
  page.route('/api/analyse/confirm', async route => {
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ analysisId: 'mock-analysis-id', result: MOCK_RESULT }),
    })
  })
}

// ─────────────────────────────────────────
// EINGABE-FORMULAR
// ─────────────────────────────────────────
test.describe('Eingabe-Formular', () => {
  test('Eingeloggter Nutzer sieht Foto-Upload-Feld und Freitext-Feld', async ({ page }) => {
    await loginAs(page)
    await expect(page.getByRole('button', { name: /foto aufnehmen/i })).toBeVisible()
    await expect(page.locator('textarea')).toBeVisible()
    await expect(page.getByRole('button', { name: /analysieren/i })).toBeVisible()
  })

  test('Leeres Formular zeigt Fehlermeldung', async ({ page }) => {
    await loginAs(page)
    await page.getByRole('button', { name: /analysieren/i }).click()
    await expect(page.getByText(/mindestens ein foto oder eine beschreibung/i)).toBeVisible()
  })

  test('Nur Text eingeben startet Analyse', async ({ page }) => {
    await loginAs(page)
    mockApis(page, 'ready')
    await page.fill('textarea', 'Hähnchenbrust mit Reis und Brokkoli')
    await page.getByRole('button', { name: /analysieren/i }).click()
    // Mit den gemockten APIs läuft die Analyse durch bis zur Bestätigungs-Ansicht
    await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible({ timeout: 8000 })
  })

  test('Ladestate — kein leerer Bildschirm nach Absenden', async ({ page }) => {
    await loginAs(page)
    // Slow down API to observe loading state
    page.route('/api/meal', async route => {
      await new Promise(r => setTimeout(r, 800))
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'mock-id' }) })
    })
    page.route('/api/analyse/**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ready: true }) })
    })
    await page.fill('textarea', 'Salat mit Tomaten')
    await page.getByRole('button', { name: /analysieren/i }).click()
    // Should show loading screen, not empty
    await expect(page.getByText(/wird hochgeladen|analyse läuft|vorbereitet/i)).toBeVisible({ timeout: 3000 })
    // Button should be gone (no double-submit)
    await expect(page.getByRole('button', { name: /^analysieren/i })).not.toBeVisible()
  })
})

// ─────────────────────────────────────────
// FOTO-UPLOAD
// ─────────────────────────────────────────
test.describe('Foto-Upload', () => {
  test('Upload-Feld ist vorhanden und korrekt für Datei-Auswahl konfiguriert', async ({ page }) => {
    await loginAs(page)
    // Upload zone button is visible and interactive
    await expect(page.getByRole('button', { name: /foto aufnehmen/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /foto aufnehmen/i })).toBeEnabled()
    // Hidden file input is wired up with the correct accept attribute
    // Note: triggering the native filechooser dialog in headless Chromium via programmatic
    // click is blocked by browser security. File selection itself is tested by the upload tests below.
    await expect(page.locator('input[type="file"]')).toHaveAttribute('accept', 'image/*')
  })

  test('Foto-Vorschau erscheint nach Auswahl und Ersetzen-Button sichtbar', async ({ page }) => {
    await loginAs(page)
    const input = page.locator('input[type="file"]').first()
    await input.setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: TINY_JPEG })
    await expect(page.locator('img[alt="Mahlzeit Vorschau"]')).toBeVisible({ timeout: 3000 })
    await expect(page.getByRole('button', { name: /foto ersetzen/i })).toBeVisible()
  })

  test('Foto kann entfernt werden (X-Button)', async ({ page }) => {
    await loginAs(page)
    const input = page.locator('input[type="file"]').first()
    await input.setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: TINY_JPEG })
    await expect(page.locator('img[alt="Mahlzeit Vorschau"]')).toBeVisible({ timeout: 3000 })
    await page.getByRole('button', { name: /foto entfernen/i }).click()
    await expect(page.locator('img[alt="Mahlzeit Vorschau"]')).not.toBeVisible()
    await expect(page.getByRole('button', { name: /foto aufnehmen/i })).toBeVisible()
  })

  test('Nicht unterstütztes Format (GIF) wird abgelehnt', async ({ page }) => {
    await loginAs(page)
    const input = page.locator('input[type="file"]').first()
    // Use GIF (valid image type but not JPEG/PNG/WEBP) — accept="image/*" passes it through,
    // our JS validation rejects it. PDF gets filtered before onChange fires in Chromium.
    await input.setInputFiles({ name: 'animation.gif', mimeType: 'image/gif', buffer: Buffer.from('GIF87a') })
    // Use exact text to avoid matching the upload zone subtitle "JPEG, PNG, WEBP — max. 10 MB"
    await expect(page.getByText('Nur JPEG, PNG oder WEBP erlaubt.')).toBeVisible({ timeout: 3000 })
  })

  test('Datei über 10 MB wird abgelehnt', async ({ page }) => {
    await loginAs(page)
    const bigBuffer = Buffer.alloc(11 * 1024 * 1024, 0xff)
    const input = page.locator('input[type="file"]').first()
    await input.setInputFiles({ name: 'gross.jpg', mimeType: 'image/jpeg', buffer: bigBuffer })
    await expect(page.getByText(/maximal 10 mb/i)).toBeVisible({ timeout: 3000 })
  })
})

// ─────────────────────────────────────────
// RÜCKFRAGEN-FLOW
// ─────────────────────────────────────────
test.describe('Rückfragen-Flow', () => {
  test('KI-Rückfragen werden angezeigt (max. 2 pro Runde)', async ({ page }) => {
    await loginAs(page)
    mockApis(page, 'questions')
    await page.fill('textarea', 'Hähnchenbrust mit Reis')
    await page.getByRole('button', { name: /analysieren/i }).click()
    await expect(page.getByText('Wie wurde das Fleisch zubereitet?')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Wie viel Öl wurde zum Braten verwendet?')).toBeVisible()
    // Runden-Badge
    await expect(page.getByText(/rückfrage.*runde 1/i)).toBeVisible()
  })

  test('Weiter-Button sendet Antworten und schließt Rückfragen ab', async ({ page }) => {
    await loginAs(page)
    mockApis(page, 'questions')
    await page.fill('textarea', 'Hähnchenbrust mit Reis')
    await page.getByRole('button', { name: /analysieren/i }).click()
    await expect(page.getByText('Wie wurde das Fleisch zubereitet?')).toBeVisible({ timeout: 8000 })
    // Answer questions
    const textareas = page.locator('main textarea')
    await textareas.nth(0).fill('In der Pfanne gebraten')
    await textareas.nth(1).fill('1 EL Olivenöl')
    await page.getByRole('button', { name: /weiter/i }).click()
    // After answering (mock returns ready), should reach the confirming step
    await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible({ timeout: 8000 })
    await page.getByRole('button', { name: /passt so/i }).click()
    await expect(page.getByText(/neue mahlzeit/i)).toBeVisible({ timeout: 8000 })
  })

  test('Überspringen startet Analyse sofort', async ({ page }) => {
    await loginAs(page)
    mockApis(page, 'skip-assumptions')
    await page.fill('textarea', 'Joghurt mit Granola')
    await page.getByRole('button', { name: /analysieren/i }).click()
    await expect(page.getByRole('button', { name: /überspringen/i })).toBeVisible({ timeout: 8000 })
    await page.getByRole('button', { name: /überspringen/i }).click()
    // Analyse läuft durch und erreicht die Bestätigungs-Ansicht (Zutatenliste)
    await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible({ timeout: 8000 })
  })

  test('Annahmen werden nach Überspringen angezeigt', async ({ page }) => {
    await loginAs(page)
    mockApis(page, 'skip-assumptions')
    await page.fill('textarea', 'Joghurt mit Granola')
    await page.getByRole('button', { name: /analysieren/i }).click()
    await expect(page.getByRole('button', { name: /überspringen/i })).toBeVisible({ timeout: 8000 })
    await page.getByRole('button', { name: /überspringen/i }).click()
    await expect(page.getByText(/magerquark|olivenöl|angenommen/i)).toBeVisible({ timeout: 8000 })
  })

  test('KI mit ausreichend Infos startet direkt ohne Rückfragen', async ({ page }) => {
    await loginAs(page)
    mockApis(page, 'ready')
    await page.fill('textarea', 'Detaillierte Beschreibung: 150g Hähnchenbrust in 1 EL Olivenöl gebraten, 80g Basmatireis, 100g Brokkoli gedünstet')
    await page.getByRole('button', { name: /analysieren/i }).click()
    // Sollte ohne Rückfragen direkt zur Bestätigungs-Ansicht durchlaufen
    await expect(page.getByText('Hab ich das richtig verstanden?')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/rückfrage/i)).not.toBeVisible()
  })
})

// ─────────────────────────────────────────
// EDGE CASES
// ─────────────────────────────────────────
test.describe('Edge Cases', () => {
  test('Nur Leerzeichen im Textfeld gilt als leer', async ({ page }) => {
    await loginAs(page)
    await page.fill('textarea', '   ')
    await page.getByRole('button', { name: /analysieren/i }).click()
    await expect(page.getByText(/mindestens ein foto/i)).toBeVisible()
  })

  test('Zeichenzähler erscheint ab 800 Zeichen', async ({ page }) => {
    await loginAs(page)
    await expect(page.getByText(/\/1000/)).not.toBeVisible()
    await page.fill('textarea', 'a'.repeat(800))
    await expect(page.getByText('800/1000')).toBeVisible()
  })

  test('Freitext-Limit: 1000 Zeichen werden akzeptiert, 1001 nicht', async ({ page }) => {
    await loginAs(page)
    // maxLength attribute on textarea should prevent typing past 1000
    const textarea = page.locator('textarea')
    await textarea.fill('a'.repeat(1001))
    const value = await textarea.inputValue()
    expect(value.length).toBeLessThanOrEqual(1000)
  })

  test('Upload-Fehler zeigt Fehlermeldung und bleibt auf Input-Seite', async ({ page }) => {
    await loginAs(page)
    page.route('/api/meal', async route => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Serverfehler' }) })
    })
    await page.fill('textarea', 'Pasta')
    await page.getByRole('button', { name: /analysieren/i }).click()
    await expect(page.getByText(/konnte nicht|fehler/i)).toBeVisible({ timeout: 8000 })
    // Should be back on input form
    await expect(page.getByRole('button', { name: /analysieren/i })).toBeVisible()
  })
})

// ─────────────────────────────────────────
// RESPONSIVE — Mobile 375px
// ─────────────────────────────────────────
test.describe('Responsive — Mobile 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('Analyse-Seite scrollt nicht horizontal auf 375px', async ({ page }) => {
    await loginAs(page)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
  })

  test('Analysieren-Button ist mindestens 44px hoch (Touch-Target)', async ({ page }) => {
    await loginAs(page)
    const button = page.getByRole('button', { name: /^analysieren/i })
    const box = await button.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44)
  })

  test('Upload-Zone ist auf 375px vollständig bedienbar (≥44px hoch)', async ({ page }) => {
    await loginAs(page)
    const uploadZone = page.getByRole('button', { name: /foto aufnehmen/i })
    const box = await uploadZone.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44)
  })
})
