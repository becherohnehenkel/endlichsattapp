import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockAnalysisSingle = vi.fn()
const mockUpdateEq = vi.fn()
const mockComputeGeschmack = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockAnalysisSingle }) }),
      update: vi.fn().mockReturnValue({ eq: mockUpdateEq }),
    })),
  }),
}))

vi.mock('@/lib/geschmack', () => ({
  computeGeschmack: mockComputeGeschmack,
}))

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/analyse/geschmack-retry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/analyse/geschmack-retry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ analysisId: '550e8400-e29b-41d4-a716-446655440000' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 for an invalid analysisId', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ analysisId: 'not-a-uuid' }))
    expect(res.status).toBe(400)
  })

  // RLS filtert fremde/nicht existierende Analysen bereits heraus — leere Row = 404, egal ob
  // Grund "existiert nicht" oder "gehört einem anderen Nutzer" ist (kein Datenleck über den Statuscode).
  it('returns 404 when the analysis does not exist or belongs to another user (RLS-filtered)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockAnalysisSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ analysisId: '550e8400-e29b-41d4-a716-446655440000' }))
    expect(res.status).toBe(404)
  })

  it('recomputes geschmack from the stored ingredient list and persists it', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockAnalysisSingle.mockResolvedValue({
      data: { id: 'analysis-1', refined_ingredients: { ingredients: [{ name: 'Hähnchenbrust', amount: '200g' }] } },
      error: null,
    })
    const geschmackResult = { status: 'ok', score: 72, label: 'lecker', verbesserungen: [], unklarHinweis: null }
    mockComputeGeschmack.mockResolvedValue(geschmackResult)
    mockUpdateEq.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ analysisId: '550e8400-e29b-41d4-a716-446655440000' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.geschmack).toEqual(geschmackResult)
    expect(mockComputeGeschmack).toHaveBeenCalledWith({ zutatenliste: [{ name: 'Hähnchenbrust', amount: '200g' }] })
  })

  it('returns 500 when the DB update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockAnalysisSingle.mockResolvedValue({
      data: { id: 'analysis-1', refined_ingredients: { ingredients: [] } },
      error: null,
    })
    mockComputeGeschmack.mockResolvedValue({ status: 'error' })
    mockUpdateEq.mockResolvedValue({ error: { message: 'db error' } })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ analysisId: '550e8400-e29b-41d4-a716-446655440000' }))
    expect(res.status).toBe(500)
  })
})
