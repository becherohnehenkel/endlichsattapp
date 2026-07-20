'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Copy, Check, Trash2, Plus } from 'lucide-react'

interface InviteCode {
  code: string
  redeemed_by: string | null
  redeemed_at: string | null
  redeemer_email: string | null
}

interface InviteCodesTableProps {
  codes: InviteCode[]
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-muted-foreground hover:text-foreground"
      onClick={handleCopy}
      title="Code kopieren"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-[#2E9E6B]" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  )
}

function DeleteButton({ code, onDeleted }: { code: string; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/codes/${code}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Fehler beim Löschen.')
        return
      }
      onDeleted()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          disabled={deleting}
          title="Code löschen"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Code löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Der Code <span className="font-mono font-medium">{code}</span> wird unwiderruflich gelöscht.
            {error && <span className="block mt-2 text-destructive">{error}</span>}
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
  )
}

export default function InviteCodesTable({ codes: initialCodes }: InviteCodesTableProps) {
  const [codes, setCodes] = useState(initialCodes)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  async function handleGenerate() {
    setGenerating(true)
    setGenerateError(null)
    try {
      const res = await fetch('/api/admin/codes', { method: 'POST' })
      if (!res.ok) {
        setGenerateError('Fehler beim Generieren. Bitte erneut versuchen.')
        return
      }
      const { code } = await res.json() as { code: string }
      setCodes(prev => [{ code, redeemed_by: null, redeemed_at: null, redeemer_email: null }, ...prev])
    } finally {
      setGenerating(false)
    }
  }

  const redeemed = codes.filter(c => c.redeemed_by !== null).length
  const total = codes.length

  return (
    <div className="space-y-4">
      {/* Zusammenfassung + Generieren-Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total === 0
            ? 'Noch keine Codes'
            : `${redeemed} von ${total} ${total === 1 ? 'Code' : 'Codes'} eingelöst`}
        </p>
        <Button
          size="sm"
          onClick={handleGenerate}
          disabled={generating}
        >
          <Plus className="h-4 w-4 mr-1" />
          {generating ? 'Wird generiert…' : 'Neuen Code generieren'}
        </Button>
      </div>

      {generateError && (
        <p className="text-sm text-destructive">{generateError}</p>
      )}

      {/* Tabelle oder Leer-Zustand */}
      {codes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">Noch keine Codes — generiere deinen ersten Code.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Code</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs hidden sm:table-cell">E-Mail</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs hidden sm:table-cell">Eingelöst am</th>
                <th className="px-2 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {codes.map((c) => {
                const isRedeemed = c.redeemed_by !== null
                return (
                  <tr key={c.code} className="bg-card">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm tracking-wide">{c.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      {isRedeemed ? (
                        <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                          Eingelöst
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-[#2E9E6B] border-[#2E9E6B]/30">
                          Verfügbar
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                      {c.redeemer_email ?? '—'}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                      {c.redeemed_at
                        ? new Date(c.redeemed_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-0.5">
                        <CopyButton code={c.code} />
                        {!isRedeemed && (
                          <DeleteButton
                            code={c.code}
                            onDeleted={() => setCodes(prev => prev.filter(x => x.code !== c.code))}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
