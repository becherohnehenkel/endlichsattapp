import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { computeGeschmack } from '@/lib/geschmack'

// PROJ-33: schlanker Zweit-Pfad für den "Nochmal prüfen"-Button — fragt NUR den Geschmack-Teil
// neu an (kein erneuter Sättigungs-Call), auf Basis der bereits gespeicherten Zutatenliste.
// Braucht deshalb nur die Analyse-ID, keine erneute Zutatenliste vom Client (siehe PROJ-33
// Tech Design).

const schema = z.object({ analysisId: z.string().uuid() })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Ungültiges JSON' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe' }, { status: 400 })
  }

  // RLS ("Users can view own meal analyses") filtert fremde Analysen bereits auf DB-Ebene heraus —
  // eine leere Row bedeutet hier automatisch "nicht gefunden oder nicht meins", nie ein Datenleck.
  const { data: analysis } = await supabase
    .from('meal_analyses')
    .select('id, refined_ingredients')
    .eq('id', parsed.data.analysisId)
    .single()

  if (!analysis) return NextResponse.json({ error: 'Analyse nicht gefunden' }, { status: 404 })

  const refined = analysis.refined_ingredients as { ingredients?: { name: string; amount: string }[] } | null
  const zutatenliste = refined?.ingredients ?? []

  const geschmack = await computeGeschmack({ zutatenliste })

  const { error: updateError } = await supabase
    .from('meal_analyses')
    .update({ geschmack_score: geschmack as unknown as import('@/types/database').Json })
    .eq('id', analysis.id)

  if (updateError) {
    console.error('[analyse/geschmack-retry] DB update error:', updateError)
    return NextResponse.json({ error: 'Ergebnis konnte nicht gespeichert werden.' }, { status: 500 })
  }

  return NextResponse.json({ geschmack })
}
