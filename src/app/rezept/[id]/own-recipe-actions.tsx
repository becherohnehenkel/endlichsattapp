'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Pencil, Trash2 } from 'lucide-react'

interface OwnRecipeActionsProps {
  recipeId: string
  title: string
}

export default function OwnRecipeActions({ recipeId, title }: OwnRecipeActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch(`/api/rezepte/${recipeId}`, { method: 'DELETE' })
      router.push('/ernaehrung/rezepte')
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex gap-3">
      <Button asChild variant="outline" className="flex-1">
        <Link href={`/rezept/${recipeId}/bearbeiten`}>
          <Pencil className="h-4 w-4" />
          Bearbeiten
        </Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="flex-1 text-destructive hover:text-destructive" disabled={deleting}>
            <Trash2 className="h-4 w-4" />
            Löschen
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rezept löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              &bdquo;{title}&ldquo; wird unwiderruflich gelöscht — inklusive Bild und allen Zutaten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
