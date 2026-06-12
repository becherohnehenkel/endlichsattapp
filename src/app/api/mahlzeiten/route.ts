import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)
  const offset = parseInt(searchParams.get('offset') ?? '0')

  const { data: meals, error } = await supabase
    .from('meals')
    .select(`
      id,
      free_text,
      photo_thumbnail_path,
      created_at,
      meal_analyses (
        satiety_scores_before
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })

  type RawMeal = {
    id: string
    free_text: string | null
    photo_thumbnail_path: string | null
    created_at: string
    meal_analyses: { satiety_scores_before: { overall: string } | null }[] | null
  }

  const mealsWithUrls = await Promise.all(
    ((meals ?? []) as unknown as RawMeal[]).map(async (meal) => {
      let thumbnailUrl: string | null = null
      if (meal.photo_thumbnail_path) {
        const { data } = await supabase.storage
          .from('meal-photos')
          .createSignedUrl(meal.photo_thumbnail_path, 3600)
        thumbnailUrl = data?.signedUrl ?? null
      }
      return {
        id: meal.id,
        freeText: meal.free_text,
        thumbnailUrl,
        createdAt: meal.created_at,
        gesamtbewertung: meal.meal_analyses?.[0]?.satiety_scores_before?.overall ?? null,
      }
    })
  )

  return NextResponse.json({ meals: mealsWithUrls, hasMore: meals?.length === limit })
}
