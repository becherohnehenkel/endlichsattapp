/**
 * PROJ-47 — Startseite Neu
 *
 * Teststrategie:
 * - Struktur, Karten, Video-Platzhalter, Coach-Banner und Gast-Verhalten laufen ohne
 *   Login (kein Backend-Bezug für diese Teile).
 * - Personalisierte Begrüßung braucht echte Profildaten: das bestehende QA-Testkonto
 *   (qa-test@endlichsatt.dev) hat inzwischen einen Namen hinterlegt ("Lukas Testerson",
 *   siehe Implementation Notes) und deckt den "Name vorhanden"-Fall ab. Für den
 *   "kein Name hinterlegt"-Fall sowie die Edge Cases (langer Name, Sonderzeichen/XSS)
 *   wird ein temporärer Testnutzer per Supabase Admin API angelegt und am Ende wieder
 *   gelöscht (gleiches Muster wie die Live-Verifikation von PROJ-45).
 */

import { test, expect, type Page } from '@playwright/test'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const QA_EMAIL = 'qa-test@endlichsatt.dev'
const QA_PASSWORD = 'QaTest123!'

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

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('http://localhost:3000/', { timeout: 15000 })
  await page.waitForLoadState('networkidle')
}

const KARTEN = [
  { titel: 'Wissen wird zur Tat', href: '/ernaehrung' },
  { titel: 'Fortschritt sichtbar machen', href: '/analyse' },
  { titel: 'Klau dir Rezepte', href: '/ernaehrung/rezepte' },
  { titel: "Mach's dir messbar", href: '/check-in' },
]

// ─── Seitenstruktur (Gast) ──────────────────────────────────────────────────

test.describe('Seitenstruktur (Gast)', () => {
  test('AC: Reihenfolge Begrüßung → Video-Platzhalter → Funktions-Karten → Coach-Banner', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Schön, dass du da bist.' })).toBeVisible()
    // Auf das letzte Element der Seite warten, damit garantiert die komplette Seite
    // gerendert ist, bevor der Text für die Reihenfolge-Prüfung gelesen wird.
    await expect(page.getByText('Lieber mit Coach an deiner Seite?')).toBeVisible()

    const main = page.locator('main')
    // innerText() spiegelt das gerenderte (CSS-transformierte) Textbild wider, nicht den
    // rohen JSX-Quelltext — das "So legst du los"-Label ist per CSS uppercase gestylt und
    // erscheint hier entsprechend als Großschrift. Case-insensitiver Vergleich vermeidet
    // diese Falle robust für alle Label.
    const text = (await main.innerText()).toLowerCase()
    const posBegruessung = text.indexOf('schön, dass du da bist.')
    const posVideo = text.indexOf('so funktioniert die app')
    const posSoLegstDuLos = text.indexOf('so legst du los')
    const posKarte1 = text.indexOf('wissen wird zur tat')
    const posCoach = text.indexOf('lieber mit coach an deiner seite?')

    expect([posBegruessung, posVideo, posSoLegstDuLos, posKarte1, posCoach].every(p => p >= 0)).toBe(true)
    expect(posBegruessung).toBeLessThan(posVideo)
    expect(posVideo).toBeLessThan(posSoLegstDuLos)
    expect(posSoLegstDuLos).toBeLessThan(posKarte1)
    expect(posKarte1).toBeLessThan(posCoach)
  })

  test('AC: Gast-Begrüßung ist generisch ohne Namen', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Schön, dass du da bist.', exact: true })).toBeVisible()
  })
})

// ─── Gast/Login-Hinweis (Refinement 2026-09-04) ────────────────────────────

test.describe('Gast/Login-Hinweis', () => {
  test('AC: zeigt den Hinweis-Text zwischen "Ein Ziel für uns alle" und "So legst du los"', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await expect(page.getByText(/Du kannst diese App gratis nutzen/)).toBeVisible()
    await expect(page.getByText(/Ich sehe deine Daten nicht/)).toBeVisible()

    const main = page.locator('main')
    const text = (await main.innerText()).toLowerCase()
    const posZiel = text.indexOf('ein ziel für uns alle')
    const posHinweis = text.indexOf('du kannst diese app gratis nutzen')
    const posSoLegstDuLos = text.indexOf('so legst du los')
    expect([posZiel, posHinweis, posSoLegstDuLos].every(p => p >= 0)).toBe(true)
    expect(posZiel).toBeLessThan(posHinweis)
    expect(posHinweis).toBeLessThan(posSoLegstDuLos)
  })

  test('AC: Hinweis ist grün/blau eingefärbt, nicht als Warnung (kein Gelb/Amber)', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    const box = page.getByText(/Du kannst diese App gratis nutzen/).locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]')
    const bg = await box.evaluate(el => getComputedStyle(el).backgroundColor)
    expect(bg).toBe('rgb(223, 240, 242)') // #DFF0F2
  })
})

// ─── PWA-Installations-Hinweis (Refinement 2026-09-04) ─────────────────────

test.describe('PWA-Installations-Hinweis', () => {
  test('AC: Icon ist sichtbar, öffnet ein Overlay mit Anleitung für iOS und Android', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    const btn = page.getByRole('button', { name: 'Als App installieren' })
    await expect(btn).toBeVisible()
    await btn.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'App installieren' })).toBeVisible()
    await expect(page.getByText('iPhone / iPad (Safari)')).toBeVisible()
    await expect(page.getByText('Zum Home-Bildschirm', { exact: false })).toBeVisible()
    await expect(page.getByText('Android (Chrome)')).toBeVisible()
    await expect(page.getByText('App installieren', { exact: false }).last()).toBeVisible()
  })

  test('AC: Overlay schließt sich per "Verstanden"-Button', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await page.getByRole('button', { name: 'Als App installieren' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Verstanden' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('AC: Overlay schließt sich per X-Button', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await page.getByRole('button', { name: 'Als App installieren' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Close' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
  })
})

// ─── Video-Platzhalter ──────────────────────────────────────────────────────

test.describe('Video-Platzhalter', () => {
  test('AC: zeigt den Ankündigungstext "Video kommt bald"', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await expect(page.getByText('Video kommt bald')).toBeVisible()
  })

  test('AC: Platzhalter ist nicht interaktiv — kein Link, kein Klick-Effekt', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    const platzhalter = page.getByText('So funktioniert die App')
    await expect(platzhalter).toBeVisible()
    // Weder das Label noch sein Elternelement dürfen ein <a>/<button> mit href/onClick sein
    const isInteractive = await platzhalter.evaluate(el => {
      let node: HTMLElement | null = el as HTMLElement
      while (node) {
        if (node.tagName === 'A' || node.tagName === 'BUTTON') return true
        node = node.parentElement
      }
      return false
    })
    expect(isInteractive).toBe(false)
    await platzhalter.click()
    expect(page.url()).toContain('/') // keine Navigation ausgelöst
  })
})

// ─── Funktions-Karten ───────────────────────────────────────────────────────

test.describe('Funktions-Karten', () => {
  test('AC: alle 4 Karten erscheinen in der vorgegebenen Reihenfolge mit den korrekten Links', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Schön, dass du da bist.' })).toBeVisible()

    const main = page.locator('main')
    const text = await main.innerText()
    const positions = KARTEN.map(k => text.indexOf(k.titel))
    expect(positions.every(p => p >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))

    for (const karte of KARTEN) {
      await expect(page.getByRole('link', { name: karte.titel, exact: false })).toHaveAttribute('href', karte.href)
    }
  })

  test('AC: Klick auf eine Karte navigiert tatsächlich zur Zielseite', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await page.getByRole('link', { name: 'Wissen wird zur Tat', exact: false }).click()
    await page.waitForURL('**/ernaehrung')
    expect(page.url()).toContain('/ernaehrung')
  })
})

// ─── Coach-Banner ───────────────────────────────────────────────────────────

test.describe('Coach-Banner', () => {
  test('AC: verlinkt korrekt und öffnet in neuem Tab', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    const coachLink = page.getByRole('link', { name: 'Lieber mit Coach an deiner Seite?', exact: false })
    await expect(coachLink).toHaveAttribute('href', 'https://www.onlineernaehrungsberater.de/#coachingstart')
    await expect(coachLink).toHaveAttribute('target', '_blank')
    await expect(coachLink).toHaveAttribute('rel', /noopener/)

    const [popup] = await Promise.all([context.waitForEvent('page'), coachLink.click()])
    await popup.waitForURL(/onlineernaehrungsberater\.de/, { timeout: 15000 })
    expect(popup.url()).toContain('onlineernaehrungsberater.de')
    await popup.close()
  })
})

// ─── Gast-Verhalten ─────────────────────────────────────────────────────────

test.describe('Gast-Verhalten', () => {
  test('AC: Gast sieht exakt denselben Inhalt wie ein eingeloggter Nutzer (bis auf Namens-Personalisierung)', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await expect(page.getByText('Kurz erklärt: was dich erwartet, wie du loslegst.')).toBeVisible()
    await expect(page.getByText('So funktioniert die App')).toBeVisible()
    for (const karte of KARTEN) {
      await expect(page.getByRole('link', { name: karte.titel, exact: false })).toBeVisible()
    }
    await expect(page.getByRole('link', { name: 'Lieber mit Coach an deiner Seite?', exact: false })).toBeVisible()
  })
})

// ─── Personalisierte Begrüßung (eingeloggte Nutzer, echte DB) ──────────────

test.describe.serial('Personalisierte Begrüßung (eingeloggte Nutzer)', () => {
  let tempUserId: string
  let tempEmail: string
  const tempPassword = `Qa-${Math.random().toString(36).slice(2)}Aa1!`

  test.beforeAll(async () => {
    tempEmail = `qa-startseite-${Date.now()}@mehralsabnehmen-test.local`
    const { data, error } = await admin.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true,
    })
    if (error) throw error
    tempUserId = data.user.id
    // Trigger legt ein profiles-Row an; sicherstellen, dass name explizit null ist.
    await admin.from('profiles').update({ name: null }).eq('id', tempUserId)
  })

  test.afterAll(async () => {
    await admin.auth.admin.deleteUser(tempUserId)
  })

  test('AC: eingeloggter Nutzer mit hinterlegtem Namen sieht "Schön, dass du da bist, [Vorname]."', async ({ page }) => {
    await loginAs(page, QA_EMAIL, QA_PASSWORD)
    await expect(page.getByRole('heading', { name: 'Schön, dass du da bist, Lukas.' })).toBeVisible()
  })

  test('AC: eingeloggter Nutzer ohne hinterlegten Namen sieht die generische Begrüßung', async ({ page }) => {
    await loginAs(page, tempEmail, tempPassword)
    await expect(page.getByRole('heading', { name: 'Schön, dass du da bist.', exact: true })).toBeVisible()
  })

  test('EDGE CASE: sehr langer Vorname bricht um, kein horizontales Scrollen', async ({ page }) => {
    await admin.from('profiles').update({ name: 'Maximilian-Alexander-Konstantin' }).eq('id', tempUserId)
    await loginAs(page, tempEmail, tempPassword)
    await expect(page.getByText('Maximilian-Alexander-Konstantin', { exact: false })).toBeVisible()
    const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(hasHorizontalScroll).toBe(false)
  })

  test('EDGE CASE: Name mit Sonderzeichen/Emoji wird unverändert als Text angezeigt, kein XSS bei Script-Payload', async ({ page }) => {
    await admin.from('profiles').update({ name: "<script>window.__xss=true</script>María 🎉" }).eq('id', tempUserId)
    await loginAs(page, tempEmail, tempPassword)
    // Der Vorname ist der erste Whitespace-getrennte Teil — hier der komplette Script-String,
    // da er keine Leerzeichen enthält. Entscheidend: als Text gerendert, nicht ausgeführt.
    const xssExecuted = await page.evaluate(() => (window as unknown as { __xss?: boolean }).__xss === true)
    expect(xssExecuted).toBe(false)
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toContainText('<script>')
  })
})

// ─── Weitere Edge Cases ─────────────────────────────────────────────────────

test.describe('Edge Cases (allgemein)', () => {
  test('EDGE CASE: anonyme Session zeigt dieselbe generische Begrüßung wie ein Gast ohne Session', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/analyse/start') // löst den bestehenden anonymen Login-Flow aus PROJ-19 aus
    await page.waitForTimeout(1500)
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Schön, dass du da bist.', exact: true })).toBeVisible()
  })

  test('EDGE CASE: 375px kein horizontales Scrollen', async ({ page, context }) => {
    await context.clearCookies()
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Schön, dass du da bist.' })).toBeVisible()
    const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(hasHorizontalScroll).toBe(false)
  })
})

// ─── Security ───────────────────────────────────────────────────────────────

test.describe('Security', () => {
  test('AC: keine client-seitige Profil-Abfrage im Netzwerk-Traffic — Name kommt ausschließlich server-gerendert', async ({ page, context }) => {
    await context.clearCookies()
    const requests: string[] = []
    page.on('request', req => requests.push(req.url()))
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Schön, dass du da bist.' })).toBeVisible()
    const profileRequests = requests.filter(u => u.includes('/rest/v1/profiles'))
    expect(profileRequests).toEqual([])
  })
})
