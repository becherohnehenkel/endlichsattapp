import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLiveNaehrwertSchaetzung } from './use-live-naehrwert-schaetzung'

const per100g = { kcal: 100, protein_g: 10, carbs_g: 10, sugar_g: 5, fat_g: 5, fiber_g: 2 }

function jsonResponse(body: unknown) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response)
}

describe('useLiveNaehrwertSchaetzung', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('shows "loading" immediately, then "found" with the BLS result after the debounce', async () => {
    const mockFetch = vi.fn((url: string) => {
      if (url.includes('bls-search')) return jsonResponse({ results: [{ bls_code: 'x', name_de: 'Quinoa', per100g }] })
      return jsonResponse({ results: [] })
    })
    vi.stubGlobal('fetch', mockFetch)

    const { result } = renderHook(
      ({ rows }) => useLiveNaehrwertSchaetzung(rows),
      { initialProps: { rows: [{ id: 'a', name: 'Quinoa', linkedMacros: null }] } }
    )

    expect(result.current.a?.status).toBe('loading')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    expect(result.current.a).toEqual({ per100g, status: 'found' })
    // Findet einen BLS-Treffer → OFF darf gar nicht erst angefragt werden
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect((mockFetch.mock.calls[0][0] as string)).toContain('bls-search')
  })

  it('falls back to OFF when BLS has no match', async () => {
    const mockFetch = vi.fn((url: string) => {
      if (url.includes('bls-search')) return jsonResponse({ results: [] })
      return jsonResponse({ results: [{ product_name: 'Quinoa Bio', per100g }] })
    })
    vi.stubGlobal('fetch', mockFetch)

    const { result } = renderHook(
      ({ rows }) => useLiveNaehrwertSchaetzung(rows),
      { initialProps: { rows: [{ id: 'a', name: 'Quinoa', linkedMacros: null }] } }
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    expect(result.current.a).toEqual({ per100g, status: 'found' })
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('marks the ingredient as not_found when neither BLS nor OFF has a match', async () => {
    vi.stubGlobal('fetch', vi.fn(() => jsonResponse({ results: [] })))

    const { result } = renderHook(
      ({ rows }) => useLiveNaehrwertSchaetzung(rows),
      { initialProps: { rows: [{ id: 'a', name: 'Mysteriöse Zutat', linkedMacros: null }] } }
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    expect(result.current.a).toEqual({ per100g: null, status: 'not_found' })
  })

  it('never fetches for an already-linked ingredient', async () => {
    const mockFetch = vi.fn(() => jsonResponse({ results: [] }))
    vi.stubGlobal('fetch', mockFetch)

    const { result } = renderHook(
      ({ rows }) => useLiveNaehrwertSchaetzung(rows),
      { initialProps: { rows: [{ id: 'a', name: 'Quinoa', linkedMacros: per100g }] } }
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    expect(result.current.a).toBeUndefined()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('only fetches for the final name when the user types quickly before the debounce fires', async () => {
    const mockFetch = vi.fn((_url: string) => jsonResponse({ results: [{ bls_code: 'x', name_de: 'Apfel', per100g }] }))
    vi.stubGlobal('fetch', mockFetch)

    const { rerender } = renderHook(
      ({ rows }) => useLiveNaehrwertSchaetzung(rows),
      { initialProps: { rows: [{ id: 'a', name: 'Ap', linkedMacros: null }] } }
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200) // vor Ablauf der 500ms erneut geändert
    })
    rerender({ rows: [{ id: 'a', name: 'Apfel', linkedMacros: null }] })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect((mockFetch.mock.calls[0][0] as string)).toContain('Apfel')
  })

  it('discards a stale in-flight response when the ingredient changed again in the meantime', async () => {
    let resolveApfel: (v: unknown) => void = () => {}
    const apfelPromise = new Promise((resolve) => { resolveApfel = resolve })

    const mockFetch = vi.fn((url: string) => {
      if (url.includes('Apfel')) return apfelPromise.then(() => ({ ok: true, json: () => Promise.resolve({ results: [{ bls_code: 'a', name_de: 'Apfel', per100g }] }) } as Response))
      if (url.includes('Birne')) return jsonResponse({ results: [{ bls_code: 'b', name_de: 'Birne', per100g: { ...per100g, kcal: 55 } }] })
      return jsonResponse({ results: [] })
    })
    vi.stubGlobal('fetch', mockFetch)

    const { result, rerender } = renderHook(
      ({ rows }) => useLiveNaehrwertSchaetzung(rows),
      { initialProps: { rows: [{ id: 'a', name: 'Apfel', linkedMacros: null }] } }
    )

    // Debounce für "Apfel" abgelaufen, fetch() hängt noch (Promise offen)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    // Zutat wird auf "Birne" geändert, bevor die Apfel-Antwort ankommt
    rerender({ rows: [{ id: 'a', name: 'Birne', linkedMacros: null }] })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })
    expect(result.current.a).toEqual({ per100g: { ...per100g, kcal: 55 }, status: 'found' })

    // Jetzt erst löst die veraltete Apfel-Antwort auf — darf "Birne" nicht überschreiben
    await act(async () => {
      resolveApfel(undefined)
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(result.current.a).toEqual({ per100g: { ...per100g, kcal: 55 }, status: 'found' })
  })

  it('reuses a previously resolved name from cache instead of fetching again', async () => {
    const mockFetch = vi.fn(() => jsonResponse({ results: [{ bls_code: 'h', name_de: 'Hafer', per100g }] }))
    vi.stubGlobal('fetch', mockFetch)

    const { rerender } = renderHook(
      ({ rows }) => useLiveNaehrwertSchaetzung(rows),
      { initialProps: { rows: [{ id: 'a', name: 'Hafer', linkedMacros: null }] } }
    )
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })
    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Zweite Zeile mit demselben (bereits aufgelösten) Namen kommt dazu
    rerender({
      rows: [
        { id: 'a', name: 'Hafer', linkedMacros: null },
        { id: 'b', name: 'Hafer', linkedMacros: null },
      ],
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    // Kein zusätzlicher Netzwerk-Aufruf — beide Zeilen bedienen sich aus dem Cache
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('removes an ingredient from the estimates when its row is deleted', async () => {
    vi.stubGlobal('fetch', vi.fn(() => jsonResponse({ results: [{ bls_code: 'x', name_de: 'Quinoa', per100g }] })))

    const { result, rerender } = renderHook(
      ({ rows }) => useLiveNaehrwertSchaetzung(rows),
      { initialProps: { rows: [{ id: 'a', name: 'Quinoa', linkedMacros: null }] } }
    )
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })
    expect(result.current.a?.status).toBe('found')

    rerender({ rows: [] })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })
    expect(result.current.a).toBeUndefined()
  })
})
