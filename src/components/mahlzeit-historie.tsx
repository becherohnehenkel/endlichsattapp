'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import MahlzeitKarte, { type MealEntry } from '@/components/mahlzeit-karte'
import WochenRecapSektion from '@/components/wochen-recap-sektion'
import { Plus } from 'lucide-react'

export default function MahlzeitHistorie() {
  // Display oldest-first (ascending) — API returns newest-first, so reverse
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [serverOffset, setServerOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInitial() {
      try {
        const res = await fetch('/api/mahlzeiten?limit=20&offset=0')
        if (!res.ok) throw new Error()
        const data: { meals: MealEntry[]; hasMore: boolean } = await res.json()
        setMeals([...data.meals].reverse())
        setHasMore(data.hasMore)
        setServerOffset(data.meals.length)
      } catch {
        setLoadError('Deine Mahlzeiten konnten nicht geladen werden.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchInitial()
  }, [])

  async function loadMore() {
    setIsLoadingMore(true)
    setLoadError(null)
    try {
      const res = await fetch(`/api/mahlzeiten?limit=20&offset=${serverOffset}`)
      if (!res.ok) throw new Error()
      const data: { meals: MealEntry[]; hasMore: boolean } = await res.json()
      const olderBatch = [...data.meals].reverse()
      setMeals(prev => [...olderBatch, ...prev])
      setHasMore(data.hasMore)
      setServerOffset(prev => prev + data.meals.length)
    } catch {
      setLoadError('Ältere Einträge konnten nicht geladen werden.')
    } finally {
      setIsLoadingMore(false)
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteId) return
    const idToDelete = deleteId
    setDeleteId(null)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/mahlzeiten/${idToDelete}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setMeals(prev => prev.filter(m => m.id !== idToDelete))
    } catch {
      setDeleteError('Löschen fehlgeschlagen. Bitte erneut versuchen.')
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-57px)] pb-28">
      <WochenRecapSektion />

      {isLoading && (
        <div className="px-4 py-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load older entries */}
      {!isLoading && hasMore && (
        <div className="flex justify-center pt-4 pb-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="text-muted-foreground text-xs"
          >
            {isLoadingMore ? 'Lade…' : '↑ Ältere Einträge laden'}
          </Button>
        </div>
      )}

      {loadError && (
        <div className="px-4 py-2">
          <Alert variant="destructive">
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && meals.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="text-5xl mb-4">🍽️</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Deine erste Analyse wartet</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">
            Was hast du heute gegessen? Foto hochladen oder kurz beschreiben — fertig.
          </p>
          <Link href="/analyse">
            <Button className="bg-[#4A7C59] hover:bg-[#3d6849] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Mahlzeit analysieren
            </Button>
          </Link>
        </div>
      )}

      {/* Timeline */}
      {!isLoading && meals.length > 0 && (
        <div className="divide-y divide-border">
          {meals.map((meal) => (
            <MahlzeitKarte key={meal.id} {...meal} onDelete={(id) => setDeleteId(id)} />
          ))}
        </div>
      )}

      {/* Fixed "Neue Mahlzeit" button — only when list has entries */}
      {!isLoading && meals.length > 0 && (
        <div className="fixed bottom-6 right-4 z-10">
          <Link href="/analyse">
            <Button
              size="lg"
              className="rounded-full shadow-lg bg-[#4A7C59] hover:bg-[#3d6849] text-white h-14 px-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              Neue Mahlzeit
            </Button>
          </Link>
        </div>
      )}

      {/* Delete error */}
      {deleteError && (
        <div className="fixed bottom-28 inset-x-4 z-20">
          <Alert variant="destructive">
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Confirm delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mahlzeit löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Mahlzeit und ihre Analyse werden unwiderruflich gelöscht. Foto und Daten werden entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
