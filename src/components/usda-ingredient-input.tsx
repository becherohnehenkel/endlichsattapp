'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { NutritionPer100g } from '@/lib/nutrition'

interface BlsResult {
  bls_code: string
  name_de: string
  per100g: NutritionPer100g
}

interface UsdaIngredientInputProps {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  onSelectUsda: (result: BlsResult) => void
  onClearMacros: () => void
  linkedMacros: NutritionPer100g | null
  placeholder?: string
}

export default function UsdaIngredientInput({
  value,
  onChange,
  onBlur,
  onSelectUsda,
  onClearMacros,
  linkedMacros,
  placeholder = 'Name',
}: UsdaIngredientInputProps) {
  const [results, setResults] = useState<BlsResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/bls-search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results ?? [])
      setOpen((data.results ?? []).length > 0)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    onChange(val)
    if (linkedMacros) onClearMacros()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 350)
  }

  function handleSelect(result: BlsResult) {
    onChange(result.name_de)
    onSelectUsda(result)
    setOpen(false)
    setResults([])
  }

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative flex-1">
      <Input
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={linkedMacros ? 'pr-12' : ''}
      />

      {linkedMacros && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-1 py-0.5 pointer-events-none">
          ✓ BLS
        </span>
      )}

      {loading && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 rounded-lg border border-border bg-card shadow-md px-3 py-2 text-xs text-muted-foreground">
          Suche…
        </div>
      )}

      {open && results.length > 0 && (
        <ul className="absolute z-20 top-full mt-1 left-0 right-0 rounded-lg border border-border bg-card shadow-md overflow-hidden">
          {results.map((r) => (
            <li key={r.bls_code}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-muted/60 transition-colors border-b border-border/50 last:border-0"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(r) }}
              >
                <p className="text-xs font-medium text-foreground line-clamp-1">{r.name_de}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {r.per100g.kcal} kcal · {r.per100g.protein_g}g Protein · {r.per100g.fat_g}g Fett <span className="text-muted-foreground/50">pro 100g</span>
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
