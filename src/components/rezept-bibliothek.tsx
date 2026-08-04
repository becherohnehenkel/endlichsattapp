'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Clock, ChefHat, Search, Lock, Plus } from 'lucide-react'

export interface RezeptListItem {
  id: string
  title: string
  imageUrl: string | null
  total_time_minutes: number
  cuisine_tags: string[]
  is_guest_visible: boolean
  /** PROJ-30: true = eigenes (privates) Rezept des aktuellen Nutzers, false = offizielles Rezept */
  isOwn: boolean
}

type OwnerFilter = 'alle' | 'lukas' | 'eigene'

export default function RezeptBibliothek({
  rezepte,
  restricted = false,
  showEigeneFilter = false,
}: {
  rezepte: RezeptListItem[]
  restricted?: boolean
  /** PROJ-30: nur für eingeloggte (nicht-anonyme) Nutzer — Gäste können keine eigenen Rezepte haben */
  showEigeneFilter?: boolean
}) {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>('alle')

  // All unique cuisine tags across all recipes
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    rezepte.forEach(r => r.cuisine_tags.forEach(t => tags.add(t)))
    return [...tags].sort((a, b) => a.localeCompare(b, 'de'))
  }, [rezepte])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return rezepte.filter(r => {
      const matchesQuery = !q || r.title.toLowerCase().includes(q)
      const matchesTag = !activeTag || r.cuisine_tags.includes(activeTag)
      const matchesOwner =
        ownerFilter === 'alle' ? true :
        ownerFilter === 'lukas' ? !r.isOwn :
        r.isOwn
      return matchesQuery && matchesTag && matchesOwner
    })
  }, [rezepte, query, activeTag, ownerFilter])

  return (
    <div className="max-w-sm mx-auto px-4 py-5 space-y-4">

      {/* PROJ-30: Eigentümer-Filter */}
      {showEigeneFilter && (
        <div className="flex gap-2">
          {([
            ['alle', 'Alle Rezepte'],
            ['lukas', "Lukas' Rezepte"],
            ['eigene', 'Eigene Rezepte'],
          ] as [OwnerFilter, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setOwnerFilter(value)}
              className={`flex-1 text-xs px-2 py-1.5 rounded-lg border transition-colors ${
                ownerFilter === value
                  ? 'bg-[#2E9E6B] text-white border-[#2E9E6B]'
                  : 'bg-background text-muted-foreground border-border hover:border-[#2E9E6B]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* PROJ-31 (BUG-1-Fix, 2026-08-04): Einstiegspunkt für eigene Rezepte — sichtbar im
          "Eigene Rezepte"- UND im "Alle Rezepte"-Filter (so von der Spec-Acceptance-Criteria
          verlangt), nicht in "Lukas' Rezepte". Der Klick führt immer zu /rezept/neu — die Seite
          selbst entscheidet anhand des 5-Rezepte-Limits, ob das Formular oder ein
          Upgrade-Hinweis angezeigt wird. */}
      {showEigeneFilter && (ownerFilter === 'eigene' || ownerFilter === 'alle') && (
        <Link
          href="/rezept/neu"
          className="flex items-center justify-center gap-1.5 w-full text-sm font-medium text-white bg-[#2E9E6B] hover:bg-[#278a5c] rounded-lg px-3 py-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Eigenes Rezept anlegen
        </Link>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Rezept suchen…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Cuisine tag filter */}
      {allTags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTag(null)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              !activeTag
                ? 'bg-[#2E9E6B] text-white border-[#2E9E6B]'
                : 'bg-background text-muted-foreground border-border hover:border-[#2E9E6B]'
            }`}
          >
            Alle
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-xs px-3 py-1 rounded-full border capitalize transition-colors ${
                activeTag === tag
                  ? 'bg-[#2E9E6B] text-white border-[#2E9E6B]'
                  : 'bg-background text-muted-foreground border-border hover:border-[#2E9E6B]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? 'Rezept' : 'Rezepte'}
      </p>

      {/* Recipe grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <ChefHat className="h-8 w-8 text-muted-foreground mx-auto" />
          {ownerFilter === 'eigene' && !query && !activeTag ? (
            <>
              <p className="text-sm text-muted-foreground">Du hast noch keine eigenen Rezepte</p>
              <Link href="/rezept/neu" className="text-xs text-[#2E9E6B] hover:underline font-medium">
                Jetzt erstes Rezept anlegen →
              </Link>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Keine Rezepte gefunden</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(rezept => {
            // PROJ-30: eigene Rezepte dürfen nie gesperrt wirken — der Nutzer hat sie
            // selbst angelegt, unabhängig vom Zugriffsstatus (is_guest_visible gilt nur
            // für offizielle Rezepte und ist bei eigenen Rezepten immer false)
            const locked = restricted && !rezept.is_guest_visible && !rezept.isOwn
            return (
              <Link
                key={rezept.id}
                href={`/rezept/${rezept.id}`}
                className={`group rounded-xl border bg-card overflow-hidden transition-colors ${
                  locked
                    ? 'border-border opacity-60'
                    : 'border-border hover:border-[#2E9E6B]'
                }`}
              >
                {/* Image */}
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {rezept.imageUrl ? (
                    <Image
                      src={rezept.imageUrl}
                      alt={rezept.title}
                      fill
                      className={`object-cover transition-transform duration-300 ${locked ? '' : 'group-hover:scale-105'}`}
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  {locked && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-2.5 space-y-1.5">
                  <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
                    {rezept.title}
                  </p>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span className="text-[10px]">{rezept.total_time_minutes} Min.</span>
                  </div>
                  {rezept.cuisine_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rezept.cuisine_tags.slice(0, 2).map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[9px] px-1.5 py-0 capitalize"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
