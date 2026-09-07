/**
 * PROJ-20 — Datenschutzerklärung & Impressum (Refinement: Rechtstext-Aktualisierung & globaler Footer)
 *
 * Deckt den globalen LegalFooter (erscheint ausnahmslos auf jeder Seite, auch dort wo die
 * reguläre Navigation ausgeblendet ist) sowie die inhaltliche Vollständigkeit der aktualisierten
 * Rechtstexte ab.
 */

import { test, expect } from '@playwright/test'

test.describe('Globaler Footer', () => {
  test('AC: Footer mit Impressum/Datenschutz erscheint auf der Startseite', async ({ page }) => {
    await page.goto('/')
    const footer = page.getByTestId('legal-footer')
    await expect(footer.getByRole('link', { name: 'Impressum' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Datenschutz' })).toBeVisible()
  })

  test('AC: Footer erscheint auch auf Seiten ohne reguläre Navigation (Login)', async ({ page }) => {
    await page.goto('/login')
    const footer = page.getByTestId('legal-footer')
    await expect(footer.getByRole('link', { name: 'Impressum' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Datenschutz' })).toBeVisible()
  })

  test('AC: Footer erscheint auch auf der Registrierungsseite', async ({ page }) => {
    await page.goto('/registrieren')
    await expect(page.getByTestId('legal-footer')).toBeVisible()
  })

  test('AC: Footer erscheint auch auf /admin (redirect zu Login ohne Session, Footer bleibt sichtbar)', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByTestId('legal-footer')).toBeVisible()
  })

  test('AC: Footer-Link "Impressum" navigiert zu /impressum', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('legal-footer').getByRole('link', { name: 'Impressum' }).click()
    await expect(page).toHaveURL(/\/impressum$/)
  })

  test('AC: Footer-Link "Datenschutz" navigiert zu /datenschutz', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('legal-footer').getByRole('link', { name: 'Datenschutz' }).click()
    await expect(page).toHaveURL(/\/datenschutz$/)
  })

  test('AC: mobil (375px) sitzt der Footer oberhalb der Bottom-Navigation, ohne sie zu überlappen', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const footerBox = await page.getByTestId('legal-footer').boundingBox()
    const navBox = await page.getByTestId('bottom-nav').boundingBox()
    expect(footerBox).not.toBeNull()
    expect(navBox).not.toBeNull()
    // Footer-Unterkante darf nicht unterhalb der Bottom-Nav-Oberkante liegen (keine Überlappung)
    expect(footerBox!.y + footerBox!.height).toBeLessThanOrEqual(navBox!.y + 1)
  })

  test('AC: mobil (375px) auf einer Seite ohne Bottom-Nav sitzt der Footer ganz unten am Viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/login')
    await expect(page.getByTestId('bottom-nav')).not.toBeVisible()
    const footerBox = await page.getByTestId('legal-footer').boundingBox()
    expect(footerBox).not.toBeNull()
    expect(footerBox!.y + footerBox!.height).toBeGreaterThanOrEqual(812 - 5)
  })

  test('kein doppelter Footer: Konto-Gast-Seite zeigt "Impressum" genau einmal (alter Einzel-Link entfernt)', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/konto')
    await expect(page.getByRole('link', { name: 'Impressum' })).toHaveCount(1)
  })
})

test.describe('Datenschutzerklärung — Inhalt', () => {
  test('AC: /datenschutz ist ohne Login erreichbar', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/datenschutz')
    await expect(page).toHaveURL(/\/datenschutz$/)
    await expect(page.getByRole('heading', { name: 'Datenschutzerklärung' })).toBeVisible()
  })

  test('AC: nennt alle Datenkategorien bis PROJ-51', async ({ page }) => {
    await page.goto('/datenschutz')
    for (const label of ['Eigene Rezepte', 'Trainingseinheiten', 'Wochen-Check-In', 'Fehler-Feedback zu KI-Ergebnissen', 'Einladungscodes']) {
      await expect(page.getByRole('heading', { name: label })).toBeVisible()
    }
  })

  test('AC: ordnet Gewichts-/Check-In-Daten als Art.-9-Sonderkategorie ein', async ({ page }) => {
    await page.goto('/datenschutz')
    await expect(page.getByRole('heading', { name: 'Besondere Kategorien personenbezogener Daten' })).toBeVisible()
    await expect(page.getByText('Art. 9 Abs. 2 lit. a DSGVO').first()).toBeVisible()
  })

  test('AC: nennt Open Food Facts und stellt klar, dass keine personenbezogenen Daten übermittelt werden', async ({ page }) => {
    await page.goto('/datenschutz')
    await expect(page.getByText('Open Food Facts', { exact: true })).toBeVisible()
    await expect(page.getByText('keine personenbezogenen Daten übertragen')).toBeVisible()
  })

  test('AC: erklärt Google-Fonts-Self-Hosting ohne Laufzeitverbindung zu Google', async ({ page }) => {
    await page.goto('/datenschutz')
    await expect(page.getByText(/Self-Hosting.*keine.*Verbindung zu Google-Servern/s)).toBeVisible()
  })

  test('AC: enthält einen medizinischen Disclaimer', async ({ page }) => {
    await page.goto('/datenschutz')
    await expect(page.getByText('keine medizinische Beratung, Diagnose oder Behandlung')).toBeVisible()
  })

  test('AC: nennt das Widerrufsrecht für die Art.-9-Einwilligung', async ({ page }) => {
    await page.goto('/datenschutz')
    await expect(page.getByText(/Widerruf deiner Einwilligung/)).toBeVisible()
  })
})

test.describe('Impressum — Inhalt', () => {
  test('AC: /impressum ist ohne Login erreichbar', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/impressum')
    await expect(page).toHaveURL(/\/impressum$/)
    await expect(page.getByRole('heading', { name: 'Impressum' })).toBeVisible()
  })

  test('AC: zeigt Anbieter, Kontakt und USt-IdNr', async ({ page }) => {
    await page.goto('/impressum')
    await expect(page.getByText('Lukas Beck').first()).toBeVisible()
    await expect(page.getByText('lukas@onlineernaehrungsberater.de').first()).toBeVisible()
    await expect(page.getByText('DE 428402078')).toBeVisible()
  })

  test('AC: zitiert die aktuelle Rechtsgrundlage (§ 5 DDG, § 18 Abs. 2 MStV)', async ({ page }) => {
    await page.goto('/impressum')
    await expect(page.getByText('Angaben gemäß § 5 DDG')).toBeVisible()
    await expect(page.getByRole('heading', { name: /§ 18 Abs\. 2 MStV/ })).toBeVisible()
  })
})
