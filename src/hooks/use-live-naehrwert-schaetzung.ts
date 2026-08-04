import { useEffect, useRef, useState } from 'react'
import type { NutritionPer100g } from '@/lib/nutrition'

export type SchaetzStatus = 'loading' | 'found' | 'not_found'

export interface SchaetzResult {
  per100g: NutritionPer100g | null
  status: SchaetzStatus
}

interface Row {
  id: string
  name: string
  linkedMacros: NutritionPer100g | null
}

const DEBOUNCE_MS = 500

async function estimateOne(name: string): Promise<SchaetzResult> {
  try {
    const blsRes = await fetch(`/api/admin/bls-search?q=${encodeURIComponent(name)}`)
    const blsData = await blsRes.json()
    const blsFirst = blsData.results?.[0]
    if (blsFirst) return { per100g: blsFirst.per100g, status: 'found' }
  } catch {
    // fällt durch zu OFF
  }
  try {
    const offRes = await fetch(`/api/admin/off-search?q=${encodeURIComponent(name)}`)
    const offData = await offRes.json()
    const offFirst = offData.results?.[0]
    if (offFirst) return { per100g: offFirst.per100g, status: 'found' }
  } catch {
    // fällt durch zu "kein Treffer"
  }
  return { per100g: null, status: 'not_found' }
}

/**
 * PROJ-29: Schätzt im Hintergrund Nährwerte für Zutaten, die noch nicht mit BLS/OFF
 * verknüpft sind (nur Freitext-Name), damit der Live-Nährwert-Counter auch unverknüpfte
 * Zutaten einbezieht. Läuft debounced (eine gemeinsame Wartezeit für alle gleichzeitig
 * geänderten Zeilen statt pro Zeile einzeln), cached bereits geschätzte Namen, und verwirft
 * veraltete Antworten, wenn sich die Eingabe seither erneut geändert hat.
 */
export function useLiveNaehrwertSchaetzung(rows: Row[]): Record<string, SchaetzResult> {
  const [estimates, setEstimates] = useState<Record<string, SchaetzResult>>({})
  const cacheRef = useRef<Record<string, SchaetzResult>>({})
  const lastEstimatedNameRef = useRef<Record<string, string>>({})
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const generationRef = useRef(0)

  // Stabile Signatur: der Effect soll nur neu laufen, wenn sich Zeilen, Namen oder
  // Verknüpfungsstatus tatsächlich geändert haben — nicht bei jedem Formular-Re-Render.
  const signature = rows
    .map(r => `${r.id}:${r.linkedMacros ? 'linked' : r.name.trim().toLowerCase()}`)
    .join('|')

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const myGeneration = ++generationRef.current

    setEstimates(prev => {
      const next: Record<string, SchaetzResult> = {}
      for (const row of rows) {
        if (row.linkedMacros) continue
        const name = row.name.trim()
        if (name.length < 2) continue
        const key = name.toLowerCase()
        if (lastEstimatedNameRef.current[row.id] === key && prev[row.id]) {
          next[row.id] = prev[row.id]
        } else {
          next[row.id] = { per100g: null, status: 'loading' }
        }
      }
      return next
    })

    const targets = rows.filter(r => !r.linkedMacros && r.name.trim().length >= 2)
    if (targets.length === 0) return

    timerRef.current = setTimeout(async () => {
      const results = await Promise.all(
        targets.map(async (row) => {
          const key = row.name.trim().toLowerCase()
          const cached = cacheRef.current[key]
          const result = cached ?? await estimateOne(row.name.trim())
          cacheRef.current[key] = result
          return { id: row.id, key, result }
        })
      )
      if (generationRef.current !== myGeneration) return // veraltet — eine neuere Änderung hat diesen Durchlauf überholt
      setEstimates(prev => {
        const next = { ...prev }
        for (const { id, result } of results) next[id] = result
        return next
      })
      for (const { id, key } of results) lastEstimatedNameRef.current[id] = key
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])

  return estimates
}
