'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Pencil, Clock, ChefHat } from 'lucide-react'
import AdminDeleteButton from '@/app/admin/rezepte/admin-delete-button'
import RezeptTypFilter from '@/components/rezept-typ-filter'
import { matchesRecipeTypFilter, type RecipeTyp, type RecipeTypFilterValue } from '@/lib/recipe-typ'

export interface AdminRezeptListItem {
  id: string
  title: string
  imageUrl: string | null
  total_time_minutes: number
  recipeTyp: RecipeTyp
}

/**
 * PROJ-16 (Refinement 2026-09-03, Teil 6): ausgelagert aus admin/rezepte/page.tsx,
 * damit die Seite selbst ein reiner Server-Teil (Auth-Check + Datenladen) bleiben
 * kann und dieser Client-Teil die Filterung + Darstellung übernimmt.
 */
export default function AdminRezeptListe({ recipes }: { recipes: AdminRezeptListItem[] }) {
  const [typFilter, setTypFilter] = useState<RecipeTypFilterValue>('alle')

  const filtered = useMemo(
    () => recipes.filter(r => matchesRecipeTypFilter(r.recipeTyp, typFilter)),
    [recipes, typFilter]
  )

  if (recipes.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <ChefHat className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Noch keine Rezepte. Lege das erste an!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <RezeptTypFilter value={typFilter} onChange={setTypFilter} />

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ChefHat className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Keine Rezepte für diesen Filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((recipe) => (
            <div
              key={recipe.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {recipe.imageUrl ? (
                  <Image
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <ChefHat className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{recipe.title}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Clock className="h-3 w-3" />
                  <span>{recipe.total_time_minutes} Min.</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link href={`/admin/rezepte/${recipe.id}/bearbeiten`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <AdminDeleteButton recipeId={recipe.id} title={recipe.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
