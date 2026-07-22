/**
 * PROJ-26 — Fehler-Feedback zu KI-Ergebnissen
 *
 * Bewusst KEIN Test, der ein echtes Feedback tatsächlich absendet: Feedback-Einträge
 * können laut Spec nicht gelöscht werden (Out of Scope), ein permanenter Regressionstest
 * würde also bei jedem Lauf einen bleibenden Fake-Eintrag in der Admin-Übersicht
 * hinterlassen. Der volle Absende-Erfolgspfad wurde stattdessen einmalig manuell live
 * verifiziert und danach per SQL wieder aufgeräumt (siehe Implementation Notes in der Spec).
 */

import { test, expect, type Page } from '@playwright/test'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'
const MATRIX_RECIPE_ID = 'fe8e05ab-af68-4e61-b8fd-6ead79b5e4e3'

async function loginAs(page: Page) {
  await page.goto('/login')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 8000 })
}

test.describe('Rezept-Detailseite: Feedback-Dialog', () => {
  test('zeigt "Feedback geben" beim KI-Hinweis', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/${MATRIX_RECIPE_ID}`)
    await expect(page.getByRole('button', { name: 'Feedback geben' })).toBeVisible()
  })

  test('öffnet den Dialog per Klick und schließt ohne zu speichern', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/${MATRIX_RECIPE_ID}`)
    await page.getByRole('button', { name: 'Feedback geben' }).click()
    await expect(page.getByText('Fehler melden')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByText('Fehler melden')).toHaveCount(0)
  })

  test('zeigt Validierungsfehler bei leerer Nachricht, ohne die API aufzurufen', async ({ page }) => {
    await loginAs(page)
    let apiCalled = false
    await page.route('**/api/feedback', route => {
      apiCalled = true
      route.continue()
    })
    await page.goto(`/rezept/${MATRIX_RECIPE_ID}`)
    await page.getByRole('button', { name: 'Feedback geben' }).click()
    await page.getByRole('button', { name: 'Absenden' }).click()
    await expect(page.getByText('Bitte gib eine Nachricht ein.')).toBeVisible()
    expect(apiCalled).toBe(false)
  })
})

test.describe('API Security: /api/feedback', () => {
  test('POST unauthenticated → 401', async ({ page }) => {
    const res = await page.request.post('/api/feedback', {
      data: { message: 'test', pageType: 'rezept', referenceId: MATRIX_RECIPE_ID, snapshot: {} },
    })
    expect(res.status()).toBe(401)
  })
})

test.describe('Admin-Zugriffskontrolle: /admin/feedback', () => {
  test('unauthenticated → Login-Redirect', async ({ page }) => {
    await page.goto('/admin/feedback')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })

  test('nicht-Admin → /admin/403', async ({ page }) => {
    await loginAs(page)
    await page.goto('/admin/feedback')
    await expect(page).toHaveURL(/\/admin\/403/, { timeout: 5000 })
  })
})

test.describe('API Security: /api/admin/feedback', () => {
  test('GET unauthenticated → 401', async ({ page }) => {
    const res = await page.request.get('/api/admin/feedback')
    expect(res.status()).toBe(401)
  })

  test('GET nicht-Admin → 403', async ({ page }) => {
    await loginAs(page)
    const res = await page.request.get('/api/admin/feedback')
    expect(res.status()).toBe(403)
  })

  test('PATCH unauthenticated → 401', async ({ page }) => {
    const res = await page.request.fetch('/api/admin/feedback/00000000-0000-4000-8000-000000000000', { method: 'PATCH' })
    expect(res.status()).toBe(401)
  })

  test('PATCH nicht-Admin → 403', async ({ page }) => {
    await loginAs(page)
    const res = await page.request.fetch('/api/admin/feedback/00000000-0000-4000-8000-000000000000', { method: 'PATCH' })
    expect(res.status()).toBe(403)
  })
})

// ─── Direkte Supabase-REST-Zugriffe (Row Level Security, nicht nur über /api) ──
//
// Diese Tests umgehen die eigene Next.js-API bewusst und sprechen die Supabase-REST-
// Schnittstelle direkt an (mit dem echten anon-Key + Session-Token des Testkontos aus
// dem Auth-Cookie) — sie prüfen, ob RLS selbst greift, nicht nur die API-Route-Logik.

async function getSupabaseCredentials(page: Page): Promise<{ url: string; apiKey: string; accessToken: string }> {
  let apiKey = ''
  let url = ''
  page.on('request', req => {
    const reqUrl = req.url()
    if (reqUrl.includes('.supabase.co') && !apiKey) {
      const hdrs = req.headers()
      if (hdrs['apikey']) { apiKey = hdrs['apikey']; url = new URL(reqUrl).origin }
    }
  })
  await loginAs(page)
  await page.goto(`/rezept/${MATRIX_RECIPE_ID}`)
  await page.waitForTimeout(1000)

  const cookies = await page.context().cookies()
  const authCookie = cookies.find(c => c.name.includes('auth-token'))
  let raw = authCookie?.value ?? ''
  if (raw.startsWith('base64-')) raw = Buffer.from(raw.slice(7), 'base64').toString('utf-8')
  const accessToken = JSON.parse(raw).access_token as string
  return { url, apiKey, accessToken }
}

test.describe('RLS: direkter Supabase-REST-Zugriff auf feedback', () => {
  test('SELECT liefert keine Zeilen, auch nicht die eigenen', async ({ page }) => {
    const { url, apiKey, accessToken } = await getSupabaseCredentials(page)
    const res = await page.request.get(`${url}/rest/v1/feedback?select=*`, {
      headers: { apikey: apiKey, Authorization: `Bearer ${accessToken}` },
    })
    expect(res.status()).toBe(200)
    expect(await res.json()).toEqual([])
  })

  test('INSERT mit fremder user_id (Identitäts-Spoofing) wird abgelehnt', async ({ page }) => {
    const { url, apiKey, accessToken } = await getSupabaseCredentials(page)
    const res = await page.request.post(`${url}/rest/v1/feedback`, {
      headers: { apikey: apiKey, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      data: {
        user_id: '00000000-0000-4000-8000-000000000099',
        message: 'Spoofing-Versuch',
        page_type: 'rezept',
        reference_id: MATRIX_RECIPE_ID,
        snapshot: {},
      },
    })
    expect(res.status()).toBe(403)
  })
})
