import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// PROJ-52: zentrale Prüf-Funktion für die Art.-9-Einwilligung (Kalorien-Rechner +
// Wochen-Check-In). Wird sowohl von den betroffenen Server-Komponenten (Seiten, die
// Gewichts-/Check-In-Daten lesen) als auch von den entsprechenden API-Routen genutzt —
// eine einzige Quelle der Wahrheit, damit keine Stelle vergessen oder abweichend geprüft wird.
export async function hatGesundheitsdatenEinwilligung(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('gesundheitsdaten_einwilligung_at')
    .eq('id', userId)
    .maybeSingle()

  return data?.gesundheitsdaten_einwilligung_at != null
}
