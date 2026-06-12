'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export interface IngredientItem {
  name: string
  amount: string
  isAssumption?: boolean
}

interface ZutatenlisteBestaetigungProps {
  ingredients: IngredientItem[]
  assumptions: string[]
  onConfirm: (ingredients: IngredientItem[]) => void
}

export default function ZutatenlisteBestaetigung({
  ingredients: initialIngredients,
  assumptions,
  onConfirm,
}: ZutatenlisteBestaetigungProps) {
  const [items, setItems] = useState<IngredientItem[]>(initialIngredients)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editAmount, setEditAmount] = useState('')

  function startEdit(index: number) {
    setEditingIndex(index)
    setEditName(items[index].name)
    setEditAmount(items[index].amount)
  }

  function saveEdit() {
    if (editingIndex === null) return
    setItems(prev =>
      prev.map((item, i) =>
        i === editingIndex
          ? {
              name: editName.trim() || item.name,
              amount: editAmount.trim() || item.amount,
              isAssumption: false,
            }
          : item
      )
    )
    setEditingIndex(null)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') saveEdit()
    if (e.key === 'Escape') setEditingIndex(null)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="font-medium text-foreground">Hab ich das richtig verstanden?</p>
        <p className="text-sm text-muted-foreground">
          Schau kurz drüber — du kannst noch korrigieren bevor ich rechne.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
        {items.map((item, index) => (
          <div key={index} className="px-4 py-3">
            {editingIndex === index ? (
              <div className="space-y-2">
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Zutat"
                  className="h-8 text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Input
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Menge (z.B. 200g, 1 EL)"
                    className="h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="shrink-0"
                    onClick={saveEdit}
                  >
                    Fertig
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
                  {item.isAssumption && (
                    <Badge
                      variant="outline"
                      className="text-xs text-amber-600 border-amber-200 bg-amber-50 shrink-0"
                    >
                      Annahme
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-muted-foreground">{item.amount}</span>
                  <button
                    onClick={() => startEdit(index)}
                    className="text-muted-foreground hover:text-foreground transition-colors rounded p-0.5"
                    aria-label={`${item.name} bearbeiten`}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {assumptions.length > 0 && (
        <Alert>
          <AlertDescription className="text-sm">
            <span className="font-medium">Ich habe angenommen: </span>
            {assumptions.join(' · ')}
          </AlertDescription>
        </Alert>
      )}

      <Button
        size="lg"
        className="w-full"
        disabled={editingIndex !== null}
        onClick={() => onConfirm(items)}
      >
        Passt so →
      </Button>
    </div>
  )
}
