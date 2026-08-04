import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PAGE_SIZE = 20
// PROJ-29 (übernommen von /api/admin/bls-search): Sortierung (Präfix-Treffer zuerst) passiert
// in JS, nicht per SQL ORDER BY — dafür muss der komplette Kandidaten-Pool vor dem Sortieren
// vorliegen. 300 ist eine großzügige, aber feste Obergrenze.
const CANDIDATE_POOL_LIMIT = 300

// PROJ-32 (Bugfix): eigenständiger, nicht-admin-exklusiver Endpunkt für die Zutatensuche im
// Nutzer-Rezept-Formular — `/api/admin/bls-search` blieb bewusst admin-exklusiv (siehe PROJ-31),
// wurde aber unverändert auch von der Nutzer-Variante des Formulars angesprochen und lieferte
// dort seit PROJ-31 durchgehend 403 (live Zutatensuche + Nährwert-Counter faktisch tot für
// reguläre Nutzer). `bls_lebensmittel` hat eine öffentliche RLS-SELECT-Policy — der reguläre,
// RLS-respektierende Client reicht hier aus, kein Service-Role-Client nötig.
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  if (user.is_anonymous) return NextResponse.json({ error: 'Bitte zuerst registrieren' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ results: [], total: 0 })

  const offset = Math.max(0, Number(searchParams.get('offset') ?? 0) || 0)

  const { data, count, error: dbError } = await supabase
    .from('bls_lebensmittel')
    .select('bls_code, name_de, kcal_100g, protein_g_100g, fat_g_100g, carbs_g_100g, fiber_g_100g, sugar_g_100g', { count: 'exact' })
    .ilike('name_de', `%${q}%`)
    .limit(CANDIDATE_POOL_LIMIT)

  if (dbError) return NextResponse.json({ results: [], total: 0 })

  const lower = q.toLowerCase()
  const sorted = (data ?? []).sort((a, b) => {
    const aPrefix = a.name_de.toLowerCase().startsWith(lower) ? 0 : 1
    const bPrefix = b.name_de.toLowerCase().startsWith(lower) ? 0 : 1
    if (aPrefix !== bPrefix) return aPrefix - bPrefix
    return a.name_de.localeCompare(b.name_de, 'de')
  })

  const page = sorted.slice(offset, offset + PAGE_SIZE)

  const results = page.map(row => ({
    bls_code: row.bls_code,
    name_de: row.name_de,
    per100g: {
      kcal:      Math.round(Number(row.kcal_100g ?? 0)),
      protein_g: Math.round(Number(row.protein_g_100g ?? 0) * 10) / 10,
      carbs_g:   Math.round(Number(row.carbs_g_100g ?? 0) * 10) / 10,
      sugar_g:   Math.round(Number(row.sugar_g_100g ?? 0) * 10) / 10,
      fat_g:     Math.round(Number(row.fat_g_100g ?? 0) * 10) / 10,
      fiber_g:   Math.round(Number(row.fiber_g_100g ?? 0) * 10) / 10,
    },
  }))

  const total = Math.min(count ?? sorted.length, CANDIDATE_POOL_LIMIT)

  return NextResponse.json({ results, total })
}
