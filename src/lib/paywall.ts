import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export interface AccessStatus {
  /** Darf der Nutzer Freitext-Analyse + Rezeptbibliothek nutzen? */
  hasAccess: boolean
  /** Verbleibende Tage im 7-Tage-Übergangsfenster, oder null wenn kein Trial läuft (noch nicht gestartet, abgelaufen, oder Abo aktiv) */
  trialDaysRemaining: number | null
  subscriptionStatus: string | null
}

const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing']
const TRIAL_DAYS = 7

// PROJ-11: Bestimmt ob ein Nutzer Zugriff auf Freitext-Analyse + Rezeptbibliothek hat.
// Zugriff ist erlaubt wenn EINES zutrifft:
//   - aktives Abo (subscription_status active/trialing)
//   - noch Foto-Scans übrig (PROJ-10) — trial_ends_at ist dann immer noch null
//   - Übergangsfenster läuft noch (trial_ends_at in der Zukunft)
// PROJ-12 (Invite-Codes) wird hier eine weitere Bedingung ergänzen, sobald es existiert.
export async function getAccessStatus(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<AccessStatus> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('photo_scans_remaining, trial_ends_at, subscription_status')
    .eq('id', userId)
    .single()

  if (!profile) {
    // Profil nicht lesbar -> defensiv sperren statt fälschlich freizugeben
    return { hasAccess: false, trialDaysRemaining: null, subscriptionStatus: null }
  }

  const isSubscribed = profile.subscription_status != null &&
    ACTIVE_SUBSCRIPTION_STATUSES.includes(profile.subscription_status)

  const stillHasFreeScans = profile.photo_scans_remaining > 0

  const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null
  const trialActive = trialEndsAt === null || trialEndsAt.getTime() > Date.now()

  const hasAccess = isSubscribed || stillHasFreeScans || trialActive

  let trialDaysRemaining: number | null = null
  if (!isSubscribed && trialEndsAt && trialActive) {
    const msRemaining = trialEndsAt.getTime() - Date.now()
    trialDaysRemaining = Math.max(1, Math.min(TRIAL_DAYS, Math.ceil(msRemaining / (1000 * 60 * 60 * 24))))
  }

  return { hasAccess, trialDaysRemaining, subscriptionStatus: profile.subscription_status }
}
