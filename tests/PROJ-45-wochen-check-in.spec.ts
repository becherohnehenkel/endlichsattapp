/**
 * PROJ-45 — Wochen-Check-In
 *
 * Teststrategie:
 * - Seitenstruktur, Formular-Felder und bedingte Elemente werden als Gast getestet
 *   (kein Login nötig, keine DB-Abhängigkeit, schnellste/robusteste Variante).
 * - Speichern/Bearbeiten und Mini-Historie laufen gegen die echte DB über das
 *   bestehende QA-Testkonto (qa-test@endlichsatt.dev, gleiches Konto wie PROJ-44) —
 *   kein Mock möglich, da die Route den Service-Role-Client nutzt. Da diese Tests
 *   eine echte "kein Eintrag existiert"-Vorbedingung brauchen (anders als bei PROJ-44),
 *   räumt ein admin-Setup (Service-Role-Key, gleiche .env.local wie die App) die
 *   aktuelle Kalenderwoche des QA-Kontos vor dem Lauf auf. Ein zweiter, fester
 *   Vergangenheits-Eintrag wird per Upsert geseedet (idempotent, kein Duplikat bei
 *   wiederholten Läufen) für die Mini-Historie-Tests.
 * - Gast-Verhalten inkl. anonymer Session (ausgelöst über /analyse/start, wo der
 *   bestehende anonyme Login-Flow aus PROJ-19 sitzt).
 */

import { test, expect, type Page } from '@playwright/test'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const TEST_EMAIL = 'qa-test@endlichsatt.dev'
const TEST_PASSWORD = 'QaTest123!'

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

function getWeekStartIso(date: Date): string {
  const d = new Date(date)
  const day = d.getUTCDay()
  d.setUTCDate(d.getUTCDate() - day)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

const env = readEnv()
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const AKTUELLE_WOCHE = getWeekStartIso(new Date())
const zweiWochenZuvor = new Date()
zweiWochenZuvor.setUTCDate(zweiWochenZuvor.getUTCDate() - 14)
const VERGANGENE_WOCHE = getWeekStartIso(zweiWochenZuvor)

let qaUserId: string

async function loginAs(page: Page, redirectPath: string) {
  await page.goto(`/login?redirectTo=${encodeURIComponent(redirectPath)}`)
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(`**${redirectPath}`, { timeout: 8000 })
  // Stabilisierung gegen eine seltene Hydration-Race: ohne diesen Wait kann ein
  // sofortiges .fill() direkt nach der Navigation auf einem noch nicht vollständig
  // hydrierten Formular landen (in Isolation lief der betroffene Test 3/3 mal grün,
  // nur im vollen Suite-Lauf einmal geflaked) — reine Test-Stabilisierung, kein
  // Produktbug.
  await page.waitForLoadState('networkidle')
}

test.beforeAll(async () => {
  let found: { id: string } | undefined
  for (let page = 1; page <= 50 && !found; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    found = data.users.find(u => u.email === TEST_EMAIL)
    if (data.users.length < 200) break
  }
  if (!found) throw new Error('QA-Testkonto qa-test@endlichsatt.dev nicht gefunden')
  qaUserId = found.id

  // Vollständig saubere Vorbedingung für den "kein Eintrag existiert"-Test — die
  // Mini-Historie-Tests seeden ihren Vergangenheits-Eintrag erst in ihrem eigenen
  // beforeAll, NACHDEM der "Speichern & Bearbeiten"-Block (der zuerst im File steht)
  // durchgelaufen ist. So bleibt die "0 gespeicherte Check-Ins"-Vorbedingung für den
  // allerersten Test tatsächlich wahr.
  await admin.from('wochen_check_ins').delete().eq('user_id', qaUserId)
})

// ─── Seitenstruktur ─────────────────────────────────────────────────────────

test.describe('Seitenstruktur', () => {
  test('AC: zeigt H1 "Deine Erfolgskontrolle" und den vorgegebenen Intro-Text', async ({ page }) => {
    await page.goto('/check-in')
    await expect(page.getByRole('heading', { name: 'Deine Erfolgskontrolle' })).toBeVisible()
    await expect(page.getByText('Investier diese 10 Minuten in dich.')).toBeVisible()
  })

  test('AC: alle 12 Fragen erscheinen in der vorgegebenen Reihenfolge', async ({ page }) => {
    await page.goto('/check-in')
    const main = page.locator('main')
    const text = await main.innerText()
    const fragen = [
      'Highlights der letzten Woche',
      'Lowlights der letzten Woche',
      'Wie könntest du weniger Lowlights haben?',
      'Das mache ich nächste Woche anders',
      'Wie war dein Schlaf letzte Woche?',
      'Wie war deine Screentime letzte Woche?',
      'Wie war dein Energielevel?',
      'Wie sehr hast du auf deine Ernährung geachtet?',
      'Wie schwer war es für dich, bewusst zu essen?',
      'Wie sicher fühlst du dich, wenn du nächste Woche nicht mehr trackst?',
      'Hast du dein Training machen können?',
      'Etwas vergessen? Was war sonst noch wichtig?',
    ]
    const positions = fragen.map(f => text.indexOf(f))
    expect(positions.every(p => p >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })
})

// ─── Formular-Felder ────────────────────────────────────────────────────────

test.describe('Formular-Felder', () => {
  test('AC: die 5 Textfragen sind leere, mehrzeilige Freitextfelder', async ({ page }) => {
    await page.goto('/check-in')
    const textfragen = [
      'Highlights der letzten Woche',
      'Lowlights der letzten Woche',
      'Wie könntest du weniger Lowlights haben? Woran hat es konkret gelegen?',
      'Das mache ich nächste Woche anders',
      'Etwas vergessen? Was war sonst noch wichtig?',
    ]
    for (const label of textfragen) {
      const field = page.getByLabel(label)
      await expect(field).toHaveValue('')
      expect(await field.evaluate(el => el.tagName)).toBe('TEXTAREA')
    }
  })

  test('AC: die 6 Slider-Fragen zeigen die vorgegebenen Endpunkt-/Zwischen-Beschriftungen', async ({ page }) => {
    await page.goto('/check-in')
    await expect(page.getByText('1 Schlecht', { exact: true })).toBeVisible()
    await expect(page.getByText('10 Sehr erholsam', { exact: true })).toBeVisible()
    await expect(page.getByText('0 Min', { exact: true })).toBeVisible()
    await expect(page.getByText('>10 Std.', { exact: true })).toBeVisible()
    await expect(page.getByText('0 Krank', { exact: true })).toBeVisible()
    await expect(page.getByText('10 Bäume ausreißen', { exact: true })).toBeVisible()
    await expect(page.getByText('0 Gar nicht', { exact: true })).toBeVisible()
    await expect(page.getByText('10 Alles getrackt', { exact: true })).toBeVisible()
    await expect(page.getByText('0 Sehr schwer', { exact: true })).toBeVisible()
    await expect(page.getByText('5 Immer mal wieder', { exact: true })).toBeVisible()
    await expect(page.getByText('10 Total einfach', { exact: true })).toBeVisible()
    await expect(page.getByText('0 Unsicher', { exact: true })).toBeVisible()
    await expect(page.getByText('5 Könnte klappen', { exact: true })).toBeVisible()
    await expect(page.getByText('10 Bin bereit', { exact: true })).toBeVisible()
    expect(await page.locator('[role="slider"]').count()).toBe(6)
  })

  test('AC: die Trainings-Frage zeigt 4 auswählbare Optionen (0/1/2/3 Mal)', async ({ page }) => {
    await page.goto('/check-in')
    for (const label of ['0x', '1x', '2x', '3x']) {
      await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible()
    }
  })
})

// ─── Bedingte Elemente ──────────────────────────────────────────────────────

test.describe('Bedingte Elemente', () => {
  test('AC: Sicherheits-Slider zeigt den Hinweistext ab Wert 5, darunter nicht', async ({ page }) => {
    await page.goto('/check-in')
    await expect(page.getByText('Dann tracke an normalen Arbeitstagen nicht')).toHaveCount(0)

    const slider = page.locator('#sicherheit-ohne-tracking [role="slider"]')
    await slider.focus()
    for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight')
    await expect(page.getByText('Dann tracke an normalen Arbeitstagen nicht')).toHaveCount(0)

    await page.keyboard.press('ArrowRight') // now at 5
    await expect(page.getByText('Dann tracke an normalen Arbeitstagen nicht — deine Routine sitzt schon.')).toBeVisible()

    await page.keyboard.press('ArrowLeft') // back to 4
    await expect(page.getByText('Dann tracke an normalen Arbeitstagen nicht')).toHaveCount(0)
  })

  test('AC: Trainings-Frage 1/2/3 zeigt den jeweiligen Feedback-Text', async ({ page }) => {
    await page.goto('/check-in')
    await page.getByRole('button', { name: '1x', exact: true }).click()
    await expect(page.getByText('Super!')).toBeVisible()
    await page.getByRole('button', { name: '2x', exact: true }).click()
    await expect(page.getByText('WOW — richtig gut!')).toBeVisible()
    await expect(page.getByText('Super!')).toHaveCount(0)
    await page.getByRole('button', { name: '3x', exact: true }).click()
    await expect(page.getByText('Dein Körper ist dir wichtig — toll!')).toBeVisible()
    await expect(page.getByText('WOW — richtig gut!')).toHaveCount(0)
  })

  test('AC: Trainings-Frage 0 zeigt zusätzlich ein Textfeld, wechselt man weg verschwindet es wieder', async ({ page }) => {
    await page.goto('/check-in')
    await page.getByRole('button', { name: '0x', exact: true }).click()
    await expect(page.getByLabel('Woran hat es gelegen? Wie stellst du sicher, dass es nächstes Mal klappt?')).toBeVisible()
    await page.getByRole('button', { name: '2x', exact: true }).click()
    await expect(page.getByLabel('Woran hat es gelegen? Wie stellst du sicher, dass es nächstes Mal klappt?')).toHaveCount(0)
  })
})

// ─── Speichern, Bearbeiten & Mini-Historie (eingeloggte Nutzer, echte DB) ──
//
// Ein einziger describe.serial-Block: Playwright kann zwischen zwei getrennten
// Top-Level-serial-Blöcken einen frischen Worker starten (auch bei --workers=1),
// wodurch ein datei-weiter beforeAll-Hook ein zweites Mal feuert. Da hier die
// Mini-Historie-Tests auf dem Endzustand des Speichern-Blocks aufbauen, müssen
// beide in EINEM ununterbrechbaren serial-Block laufen.

test.describe.serial('Speichern, Bearbeiten & Mini-Historie (eingeloggte Nutzer)', () => {
  test.beforeAll(async () => {
    let found: { id: string } | undefined
    for (let page = 1; page <= 50 && !found; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
      if (error) throw error
      found = data.users.find(u => u.email === TEST_EMAIL)
      if (data.users.length < 200) break
    }
    if (!found) throw new Error('QA-Testkonto qa-test@endlichsatt.dev nicht gefunden')
    qaUserId = found.id

    // Vollständig saubere Vorbedingung für den "kein Eintrag existiert"-Test.
    await admin.from('wochen_check_ins').delete().eq('user_id', qaUserId)
  })

  test('AC: kein Eintrag für die aktuelle Woche → Formular leer, keine Historie / freundlicher Leer-Hinweis', async ({ page }) => {
    await loginAs(page, '/check-in')
    await expect(page.getByLabel('Highlights der letzten Woche')).toHaveValue('')
    await expect(page.getByText(/^Aktuelle Woche/)).toBeVisible()
    await expect(page.getByText('Noch keine Check-Ins gespeichert')).toBeVisible()
    await expect(page.getByText('Deine letzten Check-Ins')).toHaveCount(0)
  })

  test('AC: Speichern legt einen neuen Eintrag für die aktuelle Woche an', async ({ page }) => {
    await loginAs(page, '/check-in')
    await page.getByLabel('Highlights der letzten Woche').fill('QA: aktuelle Woche, erster Save')
    await page.getByRole('button', { name: 'Speichern' }).click()
    await expect(page.getByText('Check-In gespeichert')).toBeVisible({ timeout: 10000 })

    const { data, error } = await admin.from('wochen_check_ins').select('id').eq('user_id', qaUserId).eq('woche_start', AKTUELLE_WOCHE)
    expect(error).toBeNull()
    expect(data?.length).toBe(1)
  })

  test('AC: bestehender Eintrag für die aktuelle Woche → Formular ist vorausgefüllt', async ({ page }) => {
    await loginAs(page, '/check-in')
    await expect(page.getByLabel('Highlights der letzten Woche')).toHaveValue('QA: aktuelle Woche, erster Save')
    await expect(page.getByText('Heute aktualisiert')).toBeVisible()
  })

  test('AC: Bearbeiten + Speichern aktualisiert den bestehenden Eintrag, legt keinen neuen an', async ({ page }) => {
    await loginAs(page, '/check-in')
    await page.getByLabel('Highlights der letzten Woche').fill('QA: aktuelle Woche, bearbeitet')
    await page.getByRole('button', { name: 'Speichern' }).click()
    await expect(page.getByText('Check-In gespeichert')).toBeVisible({ timeout: 10000 })

    const { data, error } = await admin.from('wochen_check_ins').select('antworten').eq('user_id', qaUserId).eq('woche_start', AKTUELLE_WOCHE)
    expect(error).toBeNull()
    expect(data?.length).toBe(1)
    expect((data![0].antworten as { highlights: string }).highlights).toBe('QA: aktuelle Woche, bearbeitet')
  })

  test('AC: Speichervorgang schlägt fehl → Fehlermeldung, eingegebene Werte bleiben erhalten', async ({ page }) => {
    await loginAs(page, '/check-in')
    await page.route('**/api/check-in/wochen', route => route.fulfill({ status: 500, body: JSON.stringify({ error: 'Speichern fehlgeschlagen' }) }))
    await page.getByLabel('Highlights der letzten Woche').fill('Dieser Wert soll erhalten bleiben')
    await page.getByRole('button', { name: 'Speichern' }).click()
    await expect(page.getByText('Speichern fehlgeschlagen. Bitte erneut versuchen.')).toBeVisible({ timeout: 10000 })
    await expect(page.getByLabel('Highlights der letzten Woche')).toHaveValue('Dieser Wert soll erhalten bleiben')
  })

  test('EDGE CASE: alle Felder leer speichern funktioniert (keine Pflichtfelder)', async ({ page }) => {
    await loginAs(page, '/check-in')
    await page.getByLabel('Highlights der letzten Woche').fill('')
    await page.getByRole('button', { name: 'Speichern' }).click()
    await expect(page.getByText('Check-In gespeichert')).toBeVisible({ timeout: 10000 })
  })

  test('AC: zeigt eine ausklappbare Historie mit den gespeicherten Einträgen nach Datum', async ({ page }) => {
    // Ergänzt einen zweiten, festen Vergangenheits-Eintrag als Vorbedingung für die
    // Mini-Historie-Tests (idempotent per Upsert) — als Testschritt statt als Hook,
    // damit er garantiert innerhalb desselben ununterbrechbaren serial-Laufs passiert.
    await admin.from('wochen_check_ins').upsert(
      {
        user_id: qaUserId,
        woche_start: VERGANGENE_WOCHE,
        antworten: {
          highlights: 'QA-Seed: vergangene Woche',
          lowlights: '', lowlightsUrsache: '', naechsteWocheAnders: '',
          schlaf: 5, screentime: 5, energielevel: 5, achtsamkeit: 5, bewusstEssen: 5,
          sicherheitOhneTracking: 0, training: null, trainingGrund: '', sonstiges: '',
        },
      },
      { onConflict: 'user_id,woche_start' }
    )

    await loginAs(page, '/check-in')
    await page.getByText('Deine letzten Check-Ins').click()
    await expect(page.getByText('QA-Seed: vergangene Woche')).toHaveCount(0) // Inhalt erst nach Klick auf den Eintrag sichtbar
    const rows = page.locator('button', { hasText: /–/ })
    expect(await rows.count()).toBeGreaterThanOrEqual(2)
  })

  test('AC: Klick auf einen Historien-Eintrag lädt ihn ins Formular, wird zum Speichern-Ziel', async ({ page }) => {
    await loginAs(page, '/check-in')
    await page.getByText('Deine letzten Check-Ins').click()
    await page.getByRole('button', { name: /–/ }).nth(1).click() // zweiter Eintrag = die vergangene Woche
    await expect(page.getByLabel('Highlights der letzten Woche')).toHaveValue('QA-Seed: vergangene Woche')
    await expect(page.getByText(/^Vergangene Woche/)).toBeVisible()

    await page.getByLabel('Highlights der letzten Woche').fill('QA-Seed: vergangene Woche (editiert)')
    await page.getByRole('button', { name: 'Speichern' }).click()
    await expect(page.getByText('Check-In gespeichert')).toBeVisible({ timeout: 10000 })

    const { data, error } = await admin.from('wochen_check_ins').select('id, antworten').eq('user_id', qaUserId).eq('woche_start', VERGANGENE_WOCHE)
    expect(error).toBeNull()
    expect(data?.length).toBe(1) // aktualisiert, nicht dupliziert
    expect((data![0].antworten as { highlights: string }).highlights).toBe('QA-Seed: vergangene Woche (editiert)')
  })

  test('EDGE CASE: Reload nach Bearbeiten eines alten Eintrags bringt zurück zur aktuellen Woche', async ({ page }) => {
    await loginAs(page, '/check-in')
    await page.getByText('Deine letzten Check-Ins').click()
    await page.getByRole('button', { name: /–/ }).nth(1).click()
    await expect(page.getByText(/^Vergangene Woche/)).toBeVisible()

    await page.reload()
    await expect(page.getByText(/^Aktuelle Woche/)).toBeVisible()
  })
})

// ─── Gast-Verhalten ─────────────────────────────────────────────────────────

test.describe('Gast-Verhalten', () => {
  test('AC: Gast kann alle Felder genauso ausfüllen wie ein eingeloggter Nutzer', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/check-in')
    await page.getByLabel('Highlights der letzten Woche').fill('Gast-Eintrag')
    await expect(page.getByLabel('Highlights der letzten Woche')).toHaveValue('Gast-Eintrag')
    const slider = page.locator('#schlaf [role="slider"]')
    await slider.focus()
    await page.keyboard.press('ArrowRight')
    await page.getByRole('button', { name: '3x', exact: true }).click()
    await expect(page.getByText('Dein Körper ist dir wichtig — toll!')).toBeVisible()
  })

  test('AC: Gast sieht den vorgegebenen Hinweistext statt eines Speichern-Buttons', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/check-in')
    await expect(page.getByRole('button', { name: 'Speichern' })).toHaveCount(0)
    await expect(page.getByText('Eingetragene Werte werden nicht gespeichert. Bei Neuladen der Seite sind die eingetragenen Daten weg. Kopiere diese Seite in deine Notizen App oder schreib dir die Fragen in dein Notizbuch auf.')).toBeVisible()
  })

  test('AC: Gast lädt die Seite neu → alle Felder wieder leer', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/check-in')
    await page.getByLabel('Highlights der letzten Woche').fill('Wird beim Reload verschwinden')
    await page.reload()
    await expect(page.getByLabel('Highlights der letzten Woche')).toHaveValue('')
  })

  test('EDGE CASE: anonyme Gast-Session (user.is_anonymous) verhält sich wie ein Gast', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/analyse/start') // löst den bestehenden anonymen Login-Flow aus PROJ-19 aus
    await page.waitForTimeout(1500)
    await page.goto('/check-in')
    await expect(page.getByRole('button', { name: 'Speichern' })).toHaveCount(0)
    await expect(page.getByText('Eingetragene Werte werden nicht gespeichert.')).toBeVisible()
  })
})

// ─── Security ────────────────────────────────────────────────────────────

test.describe('Security', () => {
  test('AC: POST /api/check-in/wochen ohne Login gibt 401', async ({ page, context }) => {
    await context.clearCookies()
    const res = await page.request.post('/api/check-in/wochen', {
      data: { wocheStart: AKTUELLE_WOCHE, antworten: { highlights: '', lowlights: '', lowlightsUrsache: '', naechsteWocheAnders: '', schlaf: 5, screentime: 5, energielevel: 5, achtsamkeit: 5, bewusstEssen: 5, sicherheitOhneTracking: 0, training: null, trainingGrund: '', sonstiges: '' } },
    })
    expect(res.status()).toBe(401)
  })

  test('AC: anonyme Session kann nicht speichern (403)', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/analyse/start')
    await page.waitForTimeout(1500)
    const res = await page.request.post('/api/check-in/wochen', {
      data: { wocheStart: AKTUELLE_WOCHE, antworten: { highlights: '', lowlights: '', lowlightsUrsache: '', naechsteWocheAnders: '', schlaf: 5, screentime: 5, energielevel: 5, achtsamkeit: 5, bewusstEssen: 5, sicherheitOhneTracking: 0, training: null, trainingGrund: '', sonstiges: '' } },
    })
    expect(res.status()).toBe(403)
  })
})
