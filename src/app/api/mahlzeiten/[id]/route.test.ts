import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockSelectSingle = vi.fn()
const mockDeleteEq = vi.fn()
const mockStorageRemove = vi.fn()

const mockSupabase = {
  auth: { getUser: mockGetUser },
  from: vi.fn(),
  storage: {
    from: vi.fn().mockReturnValue({
      remove: mockStorageRemove,
    }),
  },
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}))

function makeDeleteRequest(id: string) {
  return {
    request: new Request(`http://localhost/api/mahlzeiten/${id}`, { method: 'DELETE' }),
    params: Promise.resolve({ id }),
  }
}

describe('DELETE /api/mahlzeiten/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStorageRemove.mockResolvedValue({ error: null })
  })

  function setupFromChain(
    selectResult: { data: unknown; error?: unknown },
    deleteResult: { error: null | { message: string } }
  ) {
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(selectResult),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(deleteResult),
        }),
      })
  }

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { DELETE } = await import('./route')
    const { request, params } = makeDeleteRequest('meal-1')
    const res = await DELETE(request, { params })
    expect(res.status).toBe(401)
  })

  it('returns 404 when meal not found or not owned by user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
      }),
    })
    const { DELETE } = await import('./route')
    const { request, params } = makeDeleteRequest('meal-1')
    const res = await DELETE(request, { params })
    expect(res.status).toBe(404)
  })

  it('deletes meal without photos successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    setupFromChain(
      { data: { id: 'meal-1', user_id: 'user-1', photo_thumbnail_path: null, photo_fullsize_path: null } },
      { error: null }
    )
    const { DELETE } = await import('./route')
    const { request, params } = makeDeleteRequest('meal-1')
    const res = await DELETE(request, { params })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(mockStorageRemove).not.toHaveBeenCalled()
  })

  it('removes storage files before deleting meal when photos exist', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    setupFromChain(
      {
        data: {
          id: 'meal-1',
          user_id: 'user-1',
          photo_thumbnail_path: 'user-1/thumbs/photo.jpg',
          photo_fullsize_path: 'user-1/photos/photo.jpg',
        },
      },
      { error: null }
    )
    const { DELETE } = await import('./route')
    const { request, params } = makeDeleteRequest('meal-1')
    const res = await DELETE(request, { params })
    expect(res.status).toBe(200)
    expect(mockStorageRemove).toHaveBeenCalledWith(['user-1/thumbs/photo.jpg', 'user-1/photos/photo.jpg'])
  })

  it('returns 500 when DB delete fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    setupFromChain(
      { data: { id: 'meal-1', user_id: 'user-1', photo_thumbnail_path: null, photo_fullsize_path: null } },
      { error: { message: 'constraint violation' } }
    )
    const { DELETE } = await import('./route')
    const { request, params } = makeDeleteRequest('meal-1')
    const res = await DELETE(request, { params })
    expect(res.status).toBe(500)
  })

  it('only removes non-null photo paths from storage', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    setupFromChain(
      {
        data: {
          id: 'meal-1',
          user_id: 'user-1',
          photo_thumbnail_path: 'user-1/thumbs/photo.jpg',
          photo_fullsize_path: null,
        },
      },
      { error: null }
    )
    const { DELETE } = await import('./route')
    const { request, params } = makeDeleteRequest('meal-1')
    await DELETE(request, { params })
    expect(mockStorageRemove).toHaveBeenCalledWith(['user-1/thumbs/photo.jpg'])
  })
})
