'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { NutritionPer100g } from '@/lib/nutrition'

interface BlsResult {
  bls_code: string
  name_de: string
  per100g: NutritionPer100g
}

interface OffResult {
  product_name: string
  per100g: NutritionPer100g
}

interface ZutatInputMitQuelleProps {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  onSelectSource: (per100g: NutritionPer100g) => void
  onClearMacros: () => void
  linkedMacros: NutritionPer100g | null
  placeholder?: string
}

function MacroLine({ per100g }: { per100g: NutritionPer100g }) {
  return (
    <p className="text-[10px] text-muted-foreground mt-0.5">
      {per100g.kcal} kcal · {per100g.protein_g}g Protein · {per100g.fat_g}g Fett{' '}
      <span className="text-muted-foreground/50">pro 100g</span>
    </p>
  )
}

export default function ZutatInputMitQuelle({
  value,
  onChange,
  onBlur,
  onSelectSource,
  onClearMacros,
  linkedMacros,
  placeholder = 'Name',
}: ZutatInputMitQuelleProps) {
  const [blsResults, setBlsResults] = useState<BlsResult[]>([])
  const [blsOpen, setBlsOpen] = useState(false)
  const [blsLoading, setBlsLoading] = useState(false)

  const [offResults, setOffResults] = useState<OffResult[]>([])
  const [offOpen, setOffOpen] = useState(false)
  const [offLoading, setOffLoading] = useState(false)
  const [offError, setOffError] = useState<string | null>(null)
  // Show "Nicht im BLS?" button only after a search that returned 0 BLS results
  const [showOffButton, setShowOffButton] = useState(false)

  const [isPinned, setIsPinned] = useState(() => linkedMacros !== null)
  const [source, setSource] = useState<'bls' | 'off' | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Tracks the query used for the OFF button so it matches what was last searched
  const lastQueryRef = useRef<string>('')

  const searchBls = useCallback(async (q: string) => {
    if (q.length < 2) {
      setBlsResults([])
      setBlsOpen(false)
      setShowOffButton(false)
      return
    }
    setBlsLoading(true)
    try {
      const res = await fetch(`/api/admin/bls-search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      const results: BlsResult[] = data.results ?? []
      setBlsResults(results)
      setBlsOpen(results.length > 0)
      setShowOffButton(results.length === 0)
      lastQueryRef.current = q
    } catch {
      setBlsResults([])
      setShowOffButton(false)
    } finally {
      setBlsLoading(false)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    onChange(val)

    // If user clears the field completely, unpin
    if (val.length === 0 && isPinned) {
      setIsPinned(false)
      setSource(null)
      onClearMacros()
    }

    // If pinned: only update display name, no macro clearing, no BLS search
    if (isPinned) return

    if (linkedMacros) onClearMacros()

    setOffResults([])
    setOffOpen(false)
    setOffError(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchBls(val), 350)
  }

  function handleSelectBls(result: BlsResult) {
    onChange(result.name_de)
    onSelectSource(result.per100g)
    setIsPinned(true)
    setSource('bls')
    setBlsOpen(false)
    setBlsResults([])
    setShowOffButton(false)
    setOffOpen(false)
    setOffResults([])
  }

  async function handleOffSearch() {
    const q = lastQueryRef.current || value
    if (!q || q.length < 2) return

    setOffLoading(true)
    setOffError(null)
    setOffOpen(false)
    setOffResults([])
    try {
      const res = await fetch(`/api/admin/off-search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      const results: OffResult[] = data.results ?? []
      setOffResults(results)
      setOffOpen(true)
      if (results.length === 0) setOffError('Kein Eintrag gefunden — Makros werden zur Laufzeit geschätzt')
    } catch {
      setOffError('Suche fehlgeschlagen — bitte erneut versuchen')
    } finally {
      setOffLoading(false)
    }
  }

  function handleSelectOff(result: OffResult) {
    onChange(result.product_name)
    onSelectSource(result.per100g)
    setIsPinned(true)
    setSource('off')
    setOffOpen(false)
    setOffResults([])
    setShowOffButton(false)
    setBlsOpen(false)
  }

  function handleClearPin() {
    setIsPinned(false)
    setSource(null)
    onClearMacros()
    setShowOffButton(false)
    setOffOpen(false)
    setOffResults([])
    setOffError(null)
  }

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setBlsOpen(false)
        setOffOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const badgeColor = source === 'off'
    ? 'text-blue-700 bg-blue-50 border-blue-200'
    : source === 'bls'
      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
      : 'text-muted-foreground bg-muted border-border'

  return (
    <div ref={containerRef} className="relative flex-1">
      <Input
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={isPinned ? 'pr-16' : ''}
      />

      {/* Quelle-Badge mit ✕ */}
      {isPinned && (
        <span className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-medium border rounded px-1 py-0.5 ${badgeColor}`}>
          ✓{source ? ` ${source === 'off' ? 'OFF' : 'BLS'}` : ''}
          <button
            type="button"
            onClick={handleClearPin}
            className="ml-0.5 hover:opacity-60 transition-opacity"
            aria-label="Verknüpfung lösen"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      )}

      {/* BLS-Suchindikator */}
      {blsLoading && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 rounded-lg border border-border bg-card shadow-md px-3 py-2 text-xs text-muted-foreground">
          Suche…
        </div>
      )}

      {/* BLS-Dropdown */}
      {blsOpen && blsResults.length > 0 && (
        <ul className="absolute z-20 top-full mt-1 left-0 right-0 rounded-lg border border-border bg-card shadow-md overflow-hidden">
          {blsResults.map((r) => (
            <li key={r.bls_code}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-muted/60 transition-colors border-b border-border/50 last:border-0"
                onMouseDown={(e) => { e.preventDefault(); handleSelectBls(r) }}
              >
                <p className="text-xs font-medium text-foreground line-clamp-1">{r.name_de}</p>
                <MacroLine per100g={r.per100g} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* "Nicht im BLS?"-Button + OFF-Bereich */}
      {!blsOpen && !blsLoading && showOffButton && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 rounded-lg border border-border bg-card shadow-md overflow-hidden">
          {/* OFF-Button */}
          {!offOpen && !offLoading && !offError && (
            <button
              type="button"
              className="w-full text-left px-3 py-2.5 text-xs text-[#4A7C59] font-medium hover:bg-muted/40 transition-colors"
              onMouseDown={(e) => { e.preventDefault(); handleOffSearch() }}
            >
              Nicht im BLS? Open Food Facts durchsuchen →
            </button>
          )}

          {/* OFF lädt */}
          {offLoading && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Open Food Facts wird durchsucht…
            </div>
          )}

          {/* OFF-Ergebnisse */}
          {offOpen && offResults.length > 0 && (
            <>
              <div className="px-3 py-1.5 bg-blue-50 border-b border-blue-100">
                <span className="text-[10px] font-medium text-blue-600 uppercase tracking-wide">Open Food Facts</span>
              </div>
              {offResults.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-muted/60 transition-colors border-b border-border/50 last:border-0"
                  onMouseDown={(e) => { e.preventDefault(); handleSelectOff(r) }}
                >
                  <p className="text-xs font-medium text-foreground line-clamp-1">{r.product_name}</p>
                  <MacroLine per100g={r.per100g} />
                </button>
              ))}
            </>
          )}

          {/* OFF: kein Ergebnis */}
          {offError && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              {offError}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
