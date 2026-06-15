import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import type { NutritionPer100g } from '@/lib/nutrition'

interface OFFProduct {
  product_name?: string
  nutriments?: Record<string, number>
}

interface OFFResult {
  product_name: string
  per100g: NutritionPer100g
}

async function searchOFF(query: string, base: string): Promise<OFFResult[]> {
  const url = `${base}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=5&fields=product_name,nutriments`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'endlichsatt/1.0 (satiety analysis app)' },
    signal: AbortSignal.timeout(6000),
  })
  if (!res.ok) return []
  const data = await res.json().catch(() => null)
  if (!data || !Array.isArray(data.products)) return []

  return (data.products as OFFProduct[])
    .filter(p => p?.nutriments)
    .map(p => {
      const n = p.nutriments!
      return {
        product_name: p.product_name?.trim() || query,
        per100g: {
          kcal:      Math.round(Number(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0)),
          protein_g: Math.round(Number(n['proteins_100g'] ?? n['proteins'] ?? 0) * 10) / 10,
          carbs_g:   Math.round(Number(n['carbohydrates_100g'] ?? n['carbohydrates'] ?? 0) * 10) / 10,
          sugar_g:   Math.round(Number(n['sugars_100g'] ?? n['sugars'] ?? 0) * 10) / 10,
          fat_g:     Math.round(Number(n['fat_100g'] ?? n['fat'] ?? 0) * 10) / 10,
          fiber_g:   Math.round(Number(n['fiber_100g'] ?? n['fiber'] ?? 0) * 10) / 10,
        },
      }
    })
    .filter(r => r.per100g.kcal > 0 || r.per100g.protein_g > 0)
}

export async function GET(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  try {
    let results = await searchOFF(q, 'https://de.openfoodfacts.org')
    if (results.length === 0) {
      results = await searchOFF(q, 'https://world.openfoodfacts.org')
    }
    return NextResponse.json({ results: results.slice(0, 5) })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
