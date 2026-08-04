import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
}))

const mockUpload = vi.fn()
const adminStorageFrom = vi.fn().mockReturnValue({ upload: mockUpload })
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockReturnValue({ storage: { from: adminStorageFrom } }),
}))

// Vitests jsdom-Umgebung stellt eine eigene File/FormData-Implementierung bereit, die mit der
// (Node/undici-basierten) FormData-Auswertung in echten Request-Objekten kollidiert
// ("webidl.is.File" schlägt fehl). Umgeht das, indem `request.formData()` direkt gemockt wird,
// statt eine echte FormData über den Request-Konstruktor zu bauen — die Route interessiert nur
// `.get('file')`, `.type`, `.size` und `.arrayBuffer()`.
const SMALL_FILE = new Uint8Array([120])

function makeFakeFile(bytes: Uint8Array, type: string) {
  return {
    type,
    size: bytes.byteLength,
    arrayBuffer: async () => bytes.buffer,
  } as unknown as File
}

function makeRequest(file: File | null) {
  return {
    formData: async () => ({
      get: (key: string) => (key === 'file' ? file : null),
    }),
  } as unknown as Request
}

describe('POST /api/rezepte/bild', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpload.mockResolvedValue({ error: null })
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest(makeFakeFile(SMALL_FILE, 'image/jpeg')))
    expect(res.status).toBe(401)
  })

  it('returns 403 for an anonymous (guest) user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'guest-1', is_anonymous: true } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest(makeFakeFile(SMALL_FILE, 'image/jpeg')))
    expect(res.status).toBe(403)
  })

  it('returns 400 when no file is provided', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest(null))
    expect(res.status).toBe(400)
  })

  it('rejects an unsupported file type', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest(makeFakeFile(SMALL_FILE, 'image/gif')))
    expect(res.status).toBe(400)
  })

  it('rejects a file larger than 5 MB', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const bigContent = new Uint8Array(5 * 1024 * 1024 + 1)
    const { POST } = await import('./route')
    const res = await POST(makeRequest(makeFakeFile(bigContent, 'image/jpeg')))
    expect(res.status).toBe(400)
  })

  it('uploads a valid image via the admin storage client and returns its path/URL', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest(makeFakeFile(SMALL_FILE, 'image/jpeg')))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.path).toMatch(/\.jpg$/)
    expect(data.imageUrl).toContain('recipe-images')
    expect(adminStorageFrom).toHaveBeenCalledWith('recipe-images')
  })

  it('returns 500 when the storage upload fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    mockUpload.mockResolvedValue({ error: { message: 'upload failed' } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest(makeFakeFile(SMALL_FILE, 'image/jpeg')))
    expect(res.status).toBe(500)
  })
})
