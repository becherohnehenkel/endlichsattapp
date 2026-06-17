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
    expect(result).toEqual({ hasAccess: false, trialDaysRemaining: null, subscriptionStatus: null, hasInviteAccess: false })
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

  it('grants access while photo scans remain, even with no trial started yet', async () => {
    const result = await getAccessStatus(
      mockSupabase({ photo_scans_remaining: 2, trial_ends_at: null, subscription_status: null }),
      'user-1'
    )
    expect(result.hasAccess).toBe(true)
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
})
