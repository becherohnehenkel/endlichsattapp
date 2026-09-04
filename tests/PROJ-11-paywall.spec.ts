import { test, expect, Page } from '@playwright/test'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'
import { acquireQaAccountLock, LOCK_TIMEOUT_MS } from './helpers/qa-account-lock'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'
// "Fenchelsalat" — nicht gast-sichtbar (aus PROJ-24/25 bekannt)
const NON_GUEST_RECIPE_ID = 'ac634f99-9290-4c47-b5d3-78f3c11744f3'

// PROJ-11 (Refinement, 2026-07-23): Diese Tests verändern den echten Zugriffs-Zustand
// (photo_scans_remaining, trial_ends_at, subscription_status, invite_code_redeemed_at)
// des QA-Testkontos über Supabase, weil der Zustand serverseitig beim Seitenaufruf
// gelesen wird (page.route() kann das nicht mocken — gleiches Prinzip wie PROJ-10).
// Jeder Block seedet seine eigene Vorbedingung selbst (beforeAll) und stellt danach
// den zuvor gelesenen Ist-Zustand wieder her (afterAll) — kein manuelles Seeding mehr
// nötig.
//
// Kernänderung ggü. der Vor-Refinement-Version dieser Datei: kein Redirect zu /upgrade
// mehr — /analyse und /rezepte bleiben immer erreichbar, nur der Inhalt reduziert sich.
//
// WICHTIG: Der dauerhafte Baseline-Zustand des QA-Testkontos ist "voller Zugriff über
// invite_code_redeemed_at" (fest gesetzt, unabhängig vom Trial) — andere Test-Suiten
// (PROJ-8/24/25) nutzen dasselbe Konto, um beliebige nicht gast-sichtbare Rezepte zu
// öffnen, und würden ohne diese Baseline durch den jetzt korrekt greifenden
// Trial-Ablauf plötzlich den Sperrbildschirm sehen. Jeder Block hier überschreibt die
// betroffenen Felder daher nur für seine eigene Laufzeit und macht das in afterAll
// wieder rückgängig. Da PROJ-12 dasselbe Konto ebenfalls temporär umschreibt, teilen
// sich beide Dateien eine Dateisystem-Sperre (helpers/qa-account-lock.ts), damit sich
// ihre Schreibfenster bei parallelen Workern nicht überschneiden.

function readEnv() {
  const content = fs.readFileSync('.env.local', 'utf8')
  const env: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1)
  }
  return env
}

const env = readEnv()
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

type ProfileState = {
  trial_ends_at: string | null
  subscription_status: string | null
  invite_code_redeemed_at: string | null
  photo_scans_remaining: number
}

async function findQaUserId(): Promise<string> {
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const found = data.users.find(u => u.email === TEST_EMAIL)
    if (found) return found.id
    if (data.users.length < 200) break
  }
  throw new Error('QA-Testkonto qa-test@endlichsatt.dev nicht gefunden')
}

async function readProfileState(userId: string): Promise<ProfileState> {
  const { data, error } = await admin
    .from('profiles')
    .select('trial_ends_at, subscription_status, invite_code_redeemed_at, photo_scans_remaining')
    .eq('id', userId)
    .single()
  if (error || !data) throw new Error(`QA-Profil nicht lesbar: ${error?.message}`)
  return data
}

// Seedet die übergebene Vorbedingung für die Dauer des Blocks und stellt danach den
// zuvor gelesenen echten Zustand wieder her. Hält währenddessen die QA-Konto-Sperre,
// damit PROJ-11/PROJ-12 sich bei parallelen Workern nicht gegenseitig überschreiben.
function seedAccountState(precondition: Partial<ProfileState>) {
  let qaUserId: string
  let baseline: ProfileState
  let releaseLock: () => void

  test.beforeAll(async () => {
    // Playwrights Hook-Default (30s) reicht nicht, wenn diese Sperre hinter mehreren
    // anderen Blöcken warten muss — siehe LOCK_TIMEOUT_MS in qa-account-lock.ts.
    test.setTimeout(LOCK_TIMEOUT_MS + 30_000)
    releaseLock = await acquireQaAccountLock()
    qaUserId = await findQaUserId()
    baseline = await readProfileState(qaUserId)
    const { error } = await admin.from('profiles').update(precondition).eq('id', qaUserId)
    if (error) throw error
  })

  test.afterAll(async () => {
    test.setTimeout(LOCK_TIMEOUT_MS + 30_000)
    // Falls beforeAll fehlgeschlagen ist, bevor die Sperre erworben wurde: nichts
    // zurückzusetzen und nichts freizugeben.
    if (!releaseLock) return
    try {
      if (qaUserId && baseline) {
        await admin.from('profiles').update(baseline).eq('id', qaUserId)
      }
    } finally {
      releaseLock()
    }
  })
}

async function loginAs(page: Page) {
  await page.goto('/login?redirectTo=%2Fanalyse')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 8000 })
}

test.describe.serial('Reduzierter Zugriff (Trial abgelaufen, kein Abo, kein Invite-Code)', () => {
  // PRECONDITION: trial_ends_at = Vergangenheit, subscription_status = null,
  // invite_code_redeemed_at = NULL (temporär von der permanenten Baseline abweichend!),
  // photo_scans_remaining > 0
  seedAccountState({
    trial_ends_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    subscription_status: null,
    invite_code_redeemed_at: null,
    photo_scans_remaining: 3,
  })

  test('/analyse/start bleibt erreichbar, kein Redirect zu /upgrade', async ({ page }) => {
    await loginAs(page)
    await page.goto('/analyse/start')
    await expect(page).toHaveURL(/\/analyse\/start/)
  })

  test('/analyse/start zeigt das Foto-Kontingent als Lifetime-Zähler ("übrig" statt "heute")', async ({ page }) => {
    await loginAs(page)
    await page.goto('/analyse/start')
    await expect(page.getByText(/von 5 Foto-Scans übrig/)).toBeVisible()
  })

  test('/rezepte bleibt erreichbar und zeigt die reduzierte Ansicht mit Upgrade-Link', async ({ page }) => {
    await loginAs(page)
    await page.goto('/rezepte')
    await expect(page).toHaveURL(/\/rezepte/)
    await expect(page.getByText('Eingeschränkte Auswahl')).toBeVisible()
    await expect(page.getByRole('link', { name: /jetzt pro werden/i })).toBeVisible()
  })

  test('Rezept-Detailseite eines nicht gast-sichtbaren Rezepts zeigt den Sperrbildschirm mit "Jetzt Pro werden"', async ({ page }) => {
    await loginAs(page)
    await page.goto(`/rezept/${NON_GUEST_RECIPE_ID}`)
    await expect(page.getByText(/Dein Trial ist abgelaufen/)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Jetzt Pro werden' })).toBeVisible()
  })

  test('/upgrade zeigt die Vergleichstabelle mit "Aktuell"-Spalte', async ({ page }) => {
    await loginAs(page)
    await page.goto('/upgrade')
    await expect(page.getByText('Aktuell', { exact: true })).toBeVisible()
    await expect(page.getByText('Mit Pro', { exact: true })).toBeVisible()
    await expect(page.getByText('5 einmalig')).toBeVisible()
    await expect(page.getByText('Nur Gast-Auswahl')).toBeVisible()
  })

  test('"Jetzt freischalten" leitet zu einer von Stripe gehosteten Checkout-Seite weiter', async ({ page }) => {
    await loginAs(page)
    await page.goto('/upgrade')
    await page.getByRole('button', { name: /jetzt freischalten/i }).click()
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 })
  })
})

test.describe.serial('Voller Zugriff — 7-Tage-Trial aktiv', () => {
  // PRECONDITION: trial_ends_at = +3 Tage, subscription_status = null,
  // invite_code_redeemed_at = NULL (temporär — sonst nicht von der permanenten
  // Baseline unterscheidbar, siehe Kommentar am Dateianfang)
  seedAccountState({
    trial_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    subscription_status: null,
    invite_code_redeemed_at: null,
  })

  test('/analyse/start zeigt den Trial-Countdown und das tägliche Foto-Kontingent', async ({ page }) => {
    await loginAs(page)
    await page.goto('/analyse/start')
    await expect(page.getByText(/Noch 3 Tage tägliche Foto-Analysen/)).toBeVisible()
    await expect(page.getByText(/Heute noch .* von 5 Foto-Scans/)).toBeVisible()
  })

  test('/rezepte zeigt den Trial-Countdown, keine eingeschränkte Ansicht, keine gesperrten Karten', async ({ page }) => {
    await loginAs(page)
    await page.goto('/rezepte')
    await expect(page.getByText(/Noch 3 Tage volle Rezeptbibliothek/)).toBeVisible()
    await expect(page.getByText('Eingeschränkte Auswahl')).toHaveCount(0)
  })

  test('/upgrade zeigt "Noch X Tage voller Zugriff" und die Vergleichstabelle mit "Nach Trial-Ende"-Spalte', async ({ page }) => {
    await loginAs(page)
    await page.goto('/upgrade')
    await expect(page.getByText('Noch 3 Tage voller Zugriff')).toBeVisible()
    await expect(page.getByText('Nach Trial-Ende')).toBeVisible()
  })
})

test.describe.serial('Aktives Abo', () => {
  // PRECONDITION: subscription_status = 'active', trial_ends_at = Vergangenheit (Trial irrelevant bei aktivem Abo)
  seedAccountState({
    subscription_status: 'active',
    trial_ends_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    invite_code_redeemed_at: null,
  })

  test('/analyse/start ist trotz abgelaufenem Trial erreichbar, ohne Redirect', async ({ page }) => {
    await loginAs(page)
    await page.goto('/analyse/start')
    await expect(page).toHaveURL(/\/analyse\/start/)
  })

  test('/rezepte ist trotz abgelaufenem Trial vollständig erreichbar, keine gesperrten Karten', async ({ page }) => {
    await loginAs(page)
    await page.goto('/rezepte')
    await expect(page).toHaveURL(/\/rezepte/)
    await expect(page.getByText('Eingeschränkte Auswahl')).toHaveCount(0)
  })

  test('/upgrade zeigt "Pro-Mitglied" statt Kaufangebot', async ({ page }) => {
    await loginAs(page)
    await page.goto('/upgrade')
    await expect(page.getByText(/Pro-Mitglied/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /abo verwalten/i })).toBeVisible()
  })
})

test.describe('Sicherheit — Rezept-API-Bypass (Regressionstest für BUG-2)', () => {
  // Kein DB-Seeding nötig — nutzt eine frische anonyme Gast-Session.
  // Vor dem Fix konnte JEDE authentifizierte Session (auch diese anonyme Gast-Session)
  // den vollen Rezeptinhalt per direktem API-Aufruf abrufen, obwohl die UI korrekt den
  // Sperrbildschirm zeigte — die API-Route prüfte nur "ist überhaupt eine Session da?",
  // nicht `is_guest_visible`/`hasAccess`. Siehe QA Test Results, BUG-2.
  test('GET /api/rezepte/[id] liefert 403 für ein nicht gast-sichtbares Rezept, wenn die UI den Sperrbildschirm zeigt', async ({ page }) => {
    await page.goto('/analyse/start')
    await page.waitForFunction(() => document.cookie.includes('sb-'), { timeout: 10000 })

    await page.goto(`/rezept/${NON_GUEST_RECIPE_ID}`)
    await expect(page.getByText('Kostenlos registrieren')).toBeVisible()

    const res = await page.request.get(`/api/rezepte/${NON_GUEST_RECIPE_ID}`)
    expect(res.status()).toBe(403)
  })
})
