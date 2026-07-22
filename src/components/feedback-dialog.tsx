'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type PageType = 'mahlzeit_analyse' | 'mahlzeit_historie' | 'rezept'

interface FeedbackDialogProps {
  pageType: PageType
  /** meals.id (Mahlzeit) bzw. recipes.id (Rezept) — Ziel des Feedbacks */
  referenceId: string
  /** Vollständiger Analyse-Snapshot zum Meldezeitpunkt, siehe PROJ-26-Spec */
  snapshot: Record<string, unknown>
}

export default function FeedbackDialog({ pageType, referenceId, snapshot }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      // Dialog schließen ohne Absenden speichert nichts — Formular für den
      // nächsten Öffnen-Vorgang zurücksetzen.
      setMessage('')
      setError(null)
      setSuccess(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!message.trim()) {
      setError('Bitte gib eine Nachricht ein.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, pageType, referenceId, snapshot }),
      })
      if (!res.ok) {
        if (res.status === 429) {
          setError('Tageslimit erreicht — versuch es morgen wieder.')
        } else {
          setError('Fehler beim Senden. Bitte erneut versuchen.')
        }
        return
      }
      setSuccess(true)
      setMessage('')
    } catch {
      setError('Fehler beim Senden. Bitte erneut versuchen.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Feedback geben
        </button>
      </DialogTrigger>
      <DialogContent>
        {success ? (
          <div className="space-y-4 py-2 text-center">
            <p className="text-sm font-semibold text-foreground">Danke, wir schauen uns das an!</p>
            <Button size="sm" onClick={() => setOpen(false)}>Schließen</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Fehler melden</DialogTitle>
              <DialogDescription>
                Was stimmt hier nicht? Die Angaben dieser Seite werden automatisch mitgeschickt.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="z.B. Der Baustein „Biss“ wurde falsch bewertet…"
              autoFocus
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Wird gesendet…' : 'Absenden'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
