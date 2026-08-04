import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export interface AccessStatus {
  /**
   * "Volle Ausstattung": tägliche Foto-Analysen (5/Tag) + vollständige Rezeptbibliothek.
   * Freitext-Analyse ist davon NICHT betroffen — die ist immer und für jeden unbegrenzt.
   * Ist dieses Flag false, fällt der Nutzer auf ein reduziertes, aber nutzbares Niveau
   * zurück (Lifetime-Foto-Kontingent + gast-sichtbare Rezepte) — kein Rauswurf.
   */
  hasAccess: boolean
  /** Verbleibende Tage im 7-Tage-Trial, oder null wenn kein Trial läuft (abgelaufen, oder Abo/Invite aktiv) */
  trialDaysRemaining: number | null
  subscriptionStatus: string | null
  /** PROJ-12: true wenn der Nutzer einen Invite-Code eingelöst hat */
  hasInviteAccess: boolean
  /** PROJ-22: verbleibende Foto-Scans — mitgeliefert um doppelte DB-Abfrage auf /analyse zu vermeiden.
   *  Bedeutung hängt von hasAccess ab: bei true = heute noch übrig (täglicher Reset),
   *  bei false = insgesamt noch übrig (Lifetime-Kontingent, kein Reset). */
  photoScansRemaining: number
}

const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing']
const TRIAL_DAYS = 7

// Bestimmt, ob ein Nutzer "volle Ausstattung" hat (tägliche Foto-Scans + komplette
// Rezeptbibliothek). Freitext-Analyse ist davon unabhängig, immer unbegrenzt — taucht
// hier bewusst nicht auf (siehe PROJ-11-Refinement, 2026-07-23).
//
// Volle Ausstattung liegt vor, wenn EINES zutrifft:
//   - aktives Abo (subscription_status active/trialing)         — PROJ-11
//   - Invite-Code eingelöst (invite_code_redeemed_at != null)   — PROJ-12
//   - 7-Tage-Trial läuft noch (trial_ends_at in der Zukunft) — wird bei der
//     Registrierung gesetzt (reset_scans_on_anon_upgrade-Trigger), nicht mehr am
//     Scan-Verbrauch. Ein fehlender Wert (trial_ends_at = null) zählt bewusst NICHT
//     als aktiv (sicherer Default) — nach der Backfill-Migration sollte das bei
//     keinem registrierten Bestandskonto mehr vorkommen.
export async function getAccessStatus(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<AccessStatus> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('photo_scans_remaining, photo_scans_today_count, photo_scans_today_date, trial_ends_at, subscription_status, invite_code_redeemed_at')
    .eq('id', userId)
    .single()

  if (!profile) {
    return { hasAccess: false, trialDaysRemaining: null, subscriptionStatus: null, hasInviteAccess: false, photoScansRemaining: 0 }
  }

  const isSubscribed = profile.subscription_status != null &&
    ACTIVE_SUBSCRIPTION_STATUSES.includes(profile.subscription_status)

  const hasInviteAccess = profile.invite_code_redeemed_at != null

  const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null
  const trialActive = trialEndsAt !== null && trialEndsAt.getTime() > Date.now()

  const hasAccess = isSubscribed || hasInviteAccess || trialActive

  let trialDaysRemaining: number | null = null
  if (!isSubscribed && !hasInviteAccess && trialActive && trialEndsAt) {
    const msRemaining = trialEndsAt.getTime() - Date.now()
    trialDaysRemaining = Math.max(1, Math.min(TRIAL_DAYS, Math.ceil(msRemaining / (1000 * 60 * 60 * 24))))
  }

  // Foto-Kontingent: bei voller Ausstattung täglicher Zähler (5/Tag, Reset bei neuem
  // Tag, UTC — konsistent mit DB current_date), sonst Lifetime-Zähler (photo_scans_remaining),
  // exakt wie bei einem Gast. Muss zu decrement_photo_scan() in der DB passen.
  let photoScansRemaining: number
  if (hasAccess) {
    const todayStr = new Date().toISOString().split('T')[0]
    const isDailyReset = !profile.photo_scans_today_date || profile.photo_scans_today_date < todayStr
    photoScansRemaining = isDailyReset ? 5 : Math.max(0, 5 - (profile.photo_scans_today_count ?? 0))
  } else {
    photoScansRemaining = Math.max(0, profile.photo_scans_remaining ?? 0)
  }

  return { hasAccess, trialDaysRemaining, subscriptionStatus: profile.subscription_status, hasInviteAccess, photoScansRemaining }
}

// PROJ-31: Nutzer ohne volle Ausstattung dürfen bis zu 5 eigene Rezepte anlegen (Slot-Zähler,
// keine Lifetime-Kontingent — ein gelöschtes Rezept gibt den Platz zurück, siehe PROJ-30/31
// Decision Log). Nutzer MIT voller Ausstattung sind unbegrenzt. Gekoppelt an denselben
// hasAccess-Status wie das Foto-Scan-Limit, keine eigene Bezahllogik.
export const OWN_RECIPE_LIMIT = 5

export interface OwnRecipeLimitStatus {
  /** true = darf jetzt ein weiteres eigenes Rezept anlegen */
  allowed: boolean
  /** Aktuelle Anzahl eigener Rezepte des Nutzers */
  ownRecipeCount: number
  /** null = unbegrenzt (voller Zugriff) */
  limit: number | null
}

export async function getOwnRecipeLimitStatus(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<OwnRecipeLimitStatus> {
  const { hasAccess } = await getAccessStatus(supabase, userId)

  const { count } = await supabase
    .from('recipes')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', userId)

  const ownRecipeCount = count ?? 0

  if (hasAccess) {
    return { allowed: true, ownRecipeCount, limit: null }
  }
  return { allowed: ownRecipeCount < OWN_RECIPE_LIMIT, ownRecipeCount, limit: OWN_RECIPE_LIMIT }
}
