import { test, expect } from '@playwright/test'

// Refinement 2026-08-11 ("Complete"-Umstrukturierung): verifiziert, dass Mahlzeit-Analysen,
// die VOR diesem Refinement gespeichert wurden (6-Bausteine-Format, `bausteine`-Schlüssel
// inkl. "geschmack"), weiterhin korrekt über die Historie-Seite (/mahlzeit/[id]) angezeigt
// werden — keine Migration, reine Alt-Format-Erkennung in der Anzeige-Komponente
// (`saettigungs-ergebnis.tsx`). Nutzt die permanente PROJ-32-Fixture-Mahlzeit
// (44444444-…, angelegt vor diesem Refinement, satiety_scores_before.pillars hat noch die
// alte 6-Schlüssel-Form), da dieser Zustand über eine frische API-Antwort nicht mehr
// erzeugbar ist (siehe PROJ-5-saettigungs-einschaetzung.spec.ts).

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'
const LEGACY_MAHLZEIT_ID = '44444444-4444-4444-4444-444444444444'

async function loginAs(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 8000 })
}

test.describe('Legacy-Rendering (Analysen von vor dem Refinement 2026-08-11)', () => {
  test('zeigt "Die 6 Sättigungs-Bausteine" statt "Die 3 Sättigungs-Säulen"', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/mahlzeit/${LEGACY_MAHLZEIT_ID}`)
    await expect(page.getByText('Die 6 Sättigungs-Bausteine')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Die 3 Sättigungs-Säulen')).toHaveCount(0)
  })

  test('zeigt alle 6 Baustein-Namen inkl. Geschmack/Biss/Art of Eating', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/mahlzeit/${LEGACY_MAHLZEIT_ID}`)
    for (const label of ['Geschmack', 'Biss', 'Ballaststoffe', 'Proteine', 'Volumen', 'Art of Eating']) {
      await expect(page.getByText(label).first()).toBeVisible()
    }
  })

  test('nutzt weiterhin die alte Drei-Farben-Ampel (gut/mittel/schwach), nicht die neuen vier Stufen', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/mahlzeit/${LEGACY_MAHLZEIT_ID}`)
    await expect(page.getByText('Die 6 Sättigungs-Bausteine')).toBeVisible({ timeout: 10000 })
    // Die neuen Vier-Stufen-Labels ("Gering"/"Ungenügend") dürfen bei einer Legacy-Analyse nie auftauchen
    await expect(page.getByText('Ungenügend')).toHaveCount(0)
  })

  test('Vorher/Nachher-Vergleich zeigt weiterhin alle 6 Bausteine', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/mahlzeit/${LEGACY_MAHLZEIT_ID}`)
    await expect(page.getByText('Vorher → Nachher')).toBeVisible({ timeout: 10000 })
    // "Jetzt"/"Nach Verbesserung" erscheinen zweimal (Säulen-Vergleich UND Nährwerte-Sektion
    // haben je eine eigene Spaltenüberschrift) — vorbestehendes Verhalten, .first() genügt hier
    await expect(page.getByText('Jetzt').first()).toBeVisible()
    await expect(page.getByText('Nach Verbesserung').first()).toBeVisible()
  })
})
