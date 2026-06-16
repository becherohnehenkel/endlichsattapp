import { test, expect, Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'

// Realistisches 64×64-JPEG (via Headless-Chrome-Canvas erzeugt). Ein degeneriertes 1×1-Pixel-
// Fixture (wie es andere PROJ-3-Tests für reine Vorschau/Validierungs-Checks nutzen) lässt
// `browser-image-compression` mit einem rejection-Event statt einer echten Error fehlschlagen —
// das verschleiert hier den eigentlich zu testenden 403-Pfad. Siehe QA Test Results für den Fund.
const TEST_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCABAAEADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCWAnVsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//2Q==',
  'base64'
)

async function loginAs(page: Page) {
  // Hinweis (QA-Fund, siehe QA Test Results): seit PROJ-6 leitet /login standardmäßig nach "/"
  // weiter, nicht mehr nach "/analyse" — der explizite redirectTo-Parameter (von der Login-Seite
  // bereits unterstützt) wird hier genutzt, um den bestehenden loginAs()-Bug in anderen
  // Spec-Dateien (PROJ-3/4/5/8) nicht zu wiederholen.
  await page.goto('/login?redirectTo=%2Fanalyse')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/analyse', { timeout: 8000 })
}

// PROJ-10: Tests in dieser Datei nutzen page.route(), um /api/meal zu mocken — sie verändern
// nie den echten photo_scans_remaining-Wert des QA-Testkontos. Die einzige Ausnahme ist die
// Gruppe "0 Foto-Scans übrig (serverseitiger Initialzustand)" weiter unten: der Anfangswert
// wird server-seitig beim Seitenaufruf aus der DB gelesen (kann von Playwright nicht gemockt
// werden) und muss daher für diese Tests vorab auf 0 gesetzt sein. Siehe Kommentar dort.

test.describe('Foto-Scan-Limit — Scans verfügbar (Standardzustand: 3)', () => {
  test('zeigt die Foto-Upload-Zone mit Hinweistext "Noch X von 3 Foto-Scans übrig"', async ({ page }) => {
    await loginAs(page)
    await expect(page.getByRole('button', { name: /foto aufnehmen/i })).toBeVisible()
    await expect(page.getByText(/noch \d von 3 foto-scans übrig/i)).toBeVisible()
  })

  test('Freitext-Analyse funktioniert unabhängig vom Foto-Scan-Counter', async ({ page }) => {
    await page.route('/api/meal', async route => {
      const body = JSON.parse((await route.request().postData()) ?? '{}')
      expect(body.photoPath).toBeFalsy()
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'mock-meal-id' }) })
    })
    await page.route('/api/analyse/start', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ready: true }) })
    })
    await page.route('/api/analyse/complete', async route => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ ingredients: [{ name: 'Hähnchenbrust', amount: '150g' }], assumptions: [] }),
      })
    })

    await loginAs(page)
    await page.fill('textarea#freitext', 'Hähnchenbrust mit Reis')
    await page.getByRole('button', { name: /^analysieren/i }).click()
    // Stabiler Endzustand statt flüchtiger Zwischenbildschirm: Bestätigungs-Ansicht erreicht
    // bedeutet, der Request kam durch — der Foto-Scan-Counter hat ihn nicht blockiert.
    await expect(page.getByText(/hab ich das richtig verstanden/i)).toBeVisible({ timeout: 8000 })
  })

  test('Foto-Scan mit verfügbaren Scans wird nicht blockiert (photoPath wird mitgeschickt)', async ({ page }) => {
    let receivedPhotoPath: string | null | undefined
    await page.route('/api/meal', async route => {
      const body = JSON.parse((await route.request().postData()) ?? '{}')
      receivedPhotoPath = body.photoPath
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'mock-meal-id' }) })
    })
    await page.route('/api/analyse/start', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ready: true }) })
    })
    await page.route('/api/analyse/complete', async route => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ ingredients: [{ name: 'Test', amount: '100g' }], assumptions: [] }),
      })
    })

    await loginAs(page)
    await expect(page.getByText(/noch \d von 3 foto-scans übrig/i)).toBeVisible()

    const input = page.locator('input[type="file"]').first()
    await input.setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: TEST_JPEG })
    await page.getByRole('button', { name: /^analysieren/i }).click()

    await expect(page.getByText(/hab ich das richtig verstanden/i)).toBeVisible({ timeout: 8000 })
    expect(receivedPhotoPath).toBeTruthy()
  })

  test('Race Case: 403 PHOTO_SCAN_LIMIT_REACHED ersetzt die Foto-Zone sofort durch den Hinweis', async ({ page }) => {
    await page.route('/api/meal', async route => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Deine Foto-Scans sind aufgebraucht. Freitext-Analyse bleibt aber weiterhin unbegrenzt verfügbar.',
          code: 'PHOTO_SCAN_LIMIT_REACHED',
        }),
      })
    })

    await loginAs(page)
    const input = page.locator('input[type="file"]').first()
    await input.setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: TEST_JPEG })
    await page.getByRole('button', { name: /^analysieren/i }).click()

    // Erwartungsgemäß erscheinen jetzt ZWEI Hinweise gleichzeitig: die vom Server gelieferte
    // Fehlermeldung (apiError-Alert) UND die Standard-Banner, weil scansRemaining sofort auf 0
    // gesetzt wird — beide bestätigen denselben Sachverhalt, daher exakter Text statt Regex hier.
    await expect(page.getByText('Deine Foto-Scans sind aufgebraucht. Freitext-Analyse bleibt aber weiterhin unbegrenzt verfügbar.')).toBeVisible({ timeout: 5000 })
    // UI muss sofort nachziehen, ohne Reload: Foto-Upload-Button darf nicht mehr da sein
    await expect(page.getByRole('button', { name: /foto aufnehmen/i })).not.toBeVisible()
    await expect(page.getByText(/📸 Deine Foto-Scans sind aufgebraucht/)).toBeVisible()
  })
})

test.describe('Foto-Scan-Limit — 0 Foto-Scans übrig (serverseitiger Initialzustand)', () => {
  // PRECONDITION: Diese Tests prüfen den Zustand, der beim ERSTEN Seitenaufruf aus der DB
  // gelesen wird (src/app/analyse/page.tsx, Server Component) — das kann page.route() nicht
  // mocken. Das QA-Testkonto (qa-test@endlichsatt.dev) muss vor diesem describe-Block
  // photo_scans_remaining = 0 haben und danach wieder auf 3 zurückgesetzt werden.
  // Während dieses QA-Durchgangs wurde das manuell via Supabase MCP gesetzt (siehe QA Test
  // Results in features/PROJ-10-foto-scan-limit.md) — für CI fehlt noch eine automatisierte
  // Seed-Strategie, siehe dort als offenen Punkt.

  test('Foto-Upload-Zone wird durch einen freundlichen Hinweis ersetzt', async ({ page }) => {
    await loginAs(page)
    await expect(page.getByRole('button', { name: /foto aufnehmen/i })).not.toBeVisible()
    await expect(page.getByText(/foto-scans sind aufgebraucht/i)).toBeVisible()
  })

  test('Freitext-Feld bleibt normal nutzbar', async ({ page }) => {
    await page.route('/api/meal', async route => {
      const body = JSON.parse((await route.request().postData()) ?? '{}')
      expect(body.photoPath).toBeFalsy()
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'mock-meal-id' }) })
    })
    await page.route('/api/analyse/start', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ready: true }) })
    })

    await loginAs(page)
    await expect(page.locator('textarea#freitext')).toBeEnabled()
    await page.fill('textarea#freitext', 'Linsensuppe mit Brot')
    await page.getByRole('button', { name: /^analysieren/i }).click()
    await expect(page.getByText(/wird hochgeladen|analyse läuft|vorbereitet/i)).toBeVisible({ timeout: 3000 })
  })
})
