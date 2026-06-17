import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export interface AccessStatus {
  /** Darf der Nutzer Freitext-Analyse + Rezeptbibliothek nutzen? */
  hasAccess: boolean
  /** Verbleibende Tage im 7-Tage-Übergangsfenster, oder null wenn kein Trial läuft (noch nicht gestartet, abgelaufen, oder Abo aktiv) */
  trialDaysRemaining: number | null
  subscriptionStatus: string | null
  /** PROJ-12: true wenn der Nutzer einen Invite-Code eingelöst hat */
  hasInviteAccess: boolean
}

const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing']
const TRIAL_DAYS = 7

// Bestimmt ob ein Nutzer Zugriff auf Freitext-Analyse + Rezeptbibliothek hat.
// Zugriff ist erlaubt wenn EINES zutrifft:
//   - aktives Abo (subscription_status active/trialing)         — PROJ-11
//   - Invite-Code eingelöst (invite_code_redeemed_at != null)  — PROJ-12
//   - noch Foto-Scans übrig (PROJ-10) — trial_ends_at ist dann immer noch null
//   - Übergangsfenster läuft noch (trial_ends_at in der Zukunft)
export async function getAccessStatus(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<AccessStatus> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('photo_scans_remaining, trial_ends_at, subscription_status, invite_code_redeemed_at')
    .eq('id', userId)
    .single()

  if (!profile) {
    return { hasAccess: false, trialDaysRemaining: null, subscriptionStatus: null, hasInviteAccess: false }
  }

  const isSubscribed = profile.subscription_status != null &&
    ACTIVE_SUBSCRIPTION_STATUSES.includes(profile.subscription_status)

  const hasInviteAccess = profile.invite_code_redeemed_at != null

  const stillHasFreeScans = profile.photo_scans_remaining > 0

  const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null
  const trialActive = trialEndsAt === null || trialEndsAt.getTime() > Date.now()

  const hasAccess = isSubscribed || hasInviteAccess || stillHasFreeScans || trialActive

  let trialDaysRemaining: number | null = null
  if (!isSubscribed && !hasInviteAccess && trialEndsAt && trialActive) {
    const msRemaining = trialEndsAt.getTime() - Date.now()
    trialDaysRemaining = Math.max(1, Math.min(TRIAL_DAYS, Math.ceil(msRemaining / (1000 * 60 * 60 * 24))))
  }

  return { hasAccess, trialDaysRemaining, subscriptionStatus: profile.subscription_status, hasInviteAccess }
}
