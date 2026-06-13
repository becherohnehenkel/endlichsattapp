import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  const apiKey = process.env.USDA_API_KEY
  if (!apiKey) return NextResponse.json({ results: [] })

  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(q)}&api_key=${apiKey}&pageSize=6&dataType=Foundation,SR%20Legacy`
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return NextResponse.json({ results: [] })

    const data = await res.json()
    type FoodNutrient = { nutrientName: string; value: number; unitName: string }
    type FoodItem = { fdcId: number; description: string; foodNutrients: FoodNutrient[] }

    const results = (data.foods ?? []).map((food: FoodItem) => {
      const n: FoodNutrient[] = food.foodNutrients ?? []
      const get = (kw: string) =>
        n.find(x => x.nutrientName?.toLowerCase().includes(kw.toLowerCase()))?.value ?? 0
      const kcal = n.find(
        x => x.nutrientName?.toLowerCase().includes('energy') && x.unitName === 'KCAL'
      )?.value ?? get('energy')
      return {
        fdcId: food.fdcId,
        description: food.description,
        per100g: {
          kcal: Math.round(Number(kcal)),
          protein_g: Math.round(Number(get('protein')) * 10) / 10,
          carbs_g: Math.round(Number(get('carbohydrate')) * 10) / 10,
          sugar_g: Math.round(Number(get('sugars')) * 10) / 10,
          fat_g: Math.round(Number(get('total lipid')) * 10) / 10,
          fiber_g: Math.round(Number(get('fiber')) * 10) / 10,
        },
      }
    })

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
