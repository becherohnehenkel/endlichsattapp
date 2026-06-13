import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  const admin = createAdminClient()
  const { data, error: dbError } = await admin
    .from('bls_lebensmittel')
    .select('bls_code, name_de, kcal_100g, protein_g_100g, fat_g_100g, carbs_g_100g, fiber_g_100g, sugar_g_100g')
    .ilike('name_de', `%${q}%`)
    .limit(8)

  if (dbError) return NextResponse.json({ results: [] })

  // Sort: prefix matches first, then alphabetical
  const lower = q.toLowerCase()
  const sorted = (data ?? []).sort((a, b) => {
    const aPrefix = a.name_de.toLowerCase().startsWith(lower) ? 0 : 1
    const bPrefix = b.name_de.toLowerCase().startsWith(lower) ? 0 : 1
    if (aPrefix !== bPrefix) return aPrefix - bPrefix
    return a.name_de.localeCompare(b.name_de, 'de')
  })

  const results = sorted.map(row => ({
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

  return NextResponse.json({ results })
}
