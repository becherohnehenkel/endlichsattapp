import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

const PAGE_SIZE = 20
// PROJ-29: Sortierung (Präfix-Treffer zuerst) passiert in JS, nicht per SQL ORDER BY —
// dafür muss der komplette Kandidaten-Pool vor dem Sortieren vorliegen. 300 ist eine
// großzügige, aber feste Obergrenze, damit ein sehr generischer Suchbegriff (z.B. "milch")
// keine unbegrenzt große Antwort von der Datenbank anfordert.
const CANDIDATE_POOL_LIMIT = 300

export async function GET(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ results: [], total: 0 })

  const offset = Math.max(0, Number(searchParams.get('offset') ?? 0) || 0)

  const admin = createAdminClient()
  const { data, count, error: dbError } = await admin
    .from('bls_lebensmittel')
    .select('bls_code, name_de, kcal_100g, protein_g_100g, fat_g_100g, carbs_g_100g, fiber_g_100g, sugar_g_100g', { count: 'exact' })
    .ilike('name_de', `%${q}%`)
    .limit(CANDIDATE_POOL_LIMIT)

  if (dbError) return NextResponse.json({ results: [], total: 0 })

  // Sort: prefix matches first, then alphabetical
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

  // `count` reflects the true total in the DB (may exceed the candidate pool we sorted/paged
  // over) — cap it at the pool size so "X von Y" never promises more than "Weitere laden" can
  // actually deliver.
  const total = Math.min(count ?? sorted.length, CANDIDATE_POOL_LIMIT)

  return NextResponse.json({ results, total })
}
