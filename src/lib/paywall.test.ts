import { describe, it, expect, vi } from 'vitest'
import { getAccessStatus } from './paywall'

function mockSupabase(profile: Record<string, unknown> | null) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: profile }),
        }),
      }),
    }),
  } as any
}

describe('getAccessStatus', () => {
  it('denies access defensively when the profile cannot be read', async () => {
    const result = await getAccessStatus(mockSupabase(null), 'user-1')
    expect(result).toEqual({ hasAccess: false, trialDaysRemaining: null, subscriptionStatus: null, hasInviteAccess: false, photoScansRemaining: 0 })
  })

  it('grants access with an active subscription, no trial countdown shown', async () => {
    const result = await getAccessStatus(
      mockSupabase({ photo_scans_remaining: 0, trial_ends_at: null, subscription_status: 'active' }),
      'user-1'
    )
    expect(result.hasAccess).toBe(true)
    expect(result.trialDaysRemaining).toBeNull()
  })

  it('grants access while a "trialing" subscription is active', async () => {
    const result = await getAccessStatus(
      mockSupabase({ photo_scans_remaining: 0, trial_ends_at: null, subscription_status: 'trialing' }),
      'user-1'
    )
    expect(result.hasAccess).toBe(true)
  })

  it('denies access when no trial has ever been granted (trial_ends_at null) — remaining lifetime photo scans no longer grant access', async () => {
    // PROJ-11 Refinement (2026-07-23): photo_scans_remaining used to short-circuit
    // hasAccess to true, which was the root cause of the trial mechanism never
    // actually gating anyone. Now trial_ends_at is the only trial-related signal.
    const result = await getAccessStatus(
      mockSupabase({ photo_scans_remaining: 2, trial_ends_at: null, subscription_status: null }),
      'user-1'
    )
    expect(result.hasAccess).toBe(false)
    expect(result.trialDaysRemaining).toBeNull()
  })

  it('grants access during the 7-day trial window and reports days remaining', async () => {
    const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 1000).toISOString()
    const result = await getAccessStatus(
      mockSupabase({ photo_scans_remaining: 0, trial_ends_at: trialEndsAt, subscription_status: null }),
      'user-1'
    )
    expect(result.hasAccess).toBe(true)
    expect(result.trialDaysRemaining).toBe(4)
  })

  it('denies access once the trial window has expired with no subscription', async () => {
    const trialEndsAt = new Date(Date.now() - 60 * 1000).toISOString()
    const result = await getAccessStatus(
      mockSupabase({ photo_scans_remaining: 0, trial_ends_at: trialEndsAt, subscription_status: null }),
      'user-1'
    )
    expect(result.hasAccess).toBe(false)
    expect(result.trialDaysRemaining).toBeNull()
  })

  it('denies access when the subscription was canceled and the trial already expired', async () => {
    const trialEndsAt = new Date(Date.now() - 60 * 1000).toISOString()
    const result = await getAccessStatus(
      mockSupabase({ photo_scans_remaining: 0, trial_ends_at: trialEndsAt, subscription_status: 'canceled' }),
      'user-1'
    )
    expect(result.hasAccess).toBe(false)
  })

  describe('photoScansRemaining — daily vs. lifetime counter depending on hasAccess', () => {
    it('reports the daily counter (reset today) while full access applies', async () => {
      const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      const result = await getAccessStatus(
        mockSupabase({ photo_scans_remaining: 1, trial_ends_at: trialEndsAt, subscription_status: null, photo_scans_today_count: 2, photo_scans_today_date: '2000-01-01' }),
        'user-1'
      )
      expect(result.hasAccess).toBe(true)
      // photo_scans_today_date is stale (year 2000) -> counts as a fresh day -> full 5
      expect(result.photoScansRemaining).toBe(5)
    })

    it('reports the daily counter reduced by today\'s usage while full access applies', async () => {
      const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      const todayStr = new Date().toISOString().split('T')[0]
      const result = await getAccessStatus(
        mockSupabase({ photo_scans_remaining: 1, trial_ends_at: trialEndsAt, subscription_status: null, photo_scans_today_count: 3, photo_scans_today_date: todayStr }),
        'user-1'
      )
      expect(result.hasAccess).toBe(true)
      expect(result.photoScansRemaining).toBe(2)
    })

    it('reports the lifetime counter (photo_scans_remaining), ignoring the daily counter, once full access is lost', async () => {
      const trialEndsAt = new Date(Date.now() - 60 * 1000).toISOString()
      const result = await getAccessStatus(
        mockSupabase({ photo_scans_remaining: 3, trial_ends_at: trialEndsAt, subscription_status: null, photo_scans_today_count: 0, photo_scans_today_date: null }),
        'user-1'
      )
      expect(result.hasAccess).toBe(false)
      expect(result.photoScansRemaining).toBe(3)
    })

    it('never returns a negative lifetime count', async () => {
      const trialEndsAt = new Date(Date.now() - 60 * 1000).toISOString()
      const result = await getAccessStatus(
        mockSupabase({ photo_scans_remaining: -1, trial_ends_at: trialEndsAt, subscription_status: null }),
        'user-1'
      )
      expect(result.photoScansRemaining).toBe(0)
    })
  })
})
