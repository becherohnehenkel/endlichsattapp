'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, X, Pencil, Check } from 'lucide-react'

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
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('')

  function startEdit(index: number) {
    setAdding(false)
    setEditingIndex(index)
    setEditName(items[index].name)
    setEditAmount(items[index].amount)
  }

  function saveEdit() {
    if (editingIndex === null) return
    setItems(prev =>
      prev.map((item, i) =>
        i === editingIndex
          ? { name: editName.trim() || item.name, amount: editAmount.trim() || item.amount, isAssumption: false }
          : item
      )
    )
    setEditingIndex(null)
  }

  function deleteItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
    if (editingIndex === index) setEditingIndex(null)
  }

  function addItem() {
    const name = newName.trim()
    const amount = newAmount.trim()
    if (!name) return
    setItems(prev => [...prev, { name, amount: amount || 'nach Bedarf', isAssumption: false }])
    setNewName('')
    setNewAmount('')
    setAdding(false)
  }

  function handleEditKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') saveEdit()
    if (e.key === 'Escape') setEditingIndex(null)
  }

  function handleAddKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') addItem()
    if (e.key === 'Escape') { setAdding(false); setNewName(''); setNewAmount('') }
  }

  const busy = editingIndex !== null || adding

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
                  onKeyDown={handleEditKey}
                  placeholder="Zutat"
                  className="h-8 text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Input
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    onKeyDown={handleEditKey}
                    placeholder="Menge (z.B. 200g, 1 EL)"
                    className="h-8 text-sm"
                  />
                  <Button size="sm" variant="secondary" className="shrink-0" onClick={saveEdit}>
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
                  {item.isAssumption && (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-200 bg-amber-50 shrink-0">
                      Annahme
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm text-muted-foreground">{item.amount}</span>
                  <button
                    onClick={() => startEdit(index)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                    aria-label={`${item.name} bearbeiten`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteItem(index)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                    aria-label={`${item.name} entfernen`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Inline add form */}
        {adding && (
          <div className="px-4 py-3 bg-muted/30 space-y-2">
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={handleAddKey}
              placeholder="Zutat (z.B. Feta)"
              className="h-8 text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Input
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
                onKeyDown={handleAddKey}
                placeholder="Menge (z.B. 50g)"
                className="h-8 text-sm"
              />
              <Button size="sm" onClick={addItem} disabled={!newName.trim()} className="shrink-0 bg-[#4A7C59] hover:bg-[#3d6849] text-white">
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add ingredient button */}
      {!adding && (
        <button
          onClick={() => { setEditingIndex(null); setAdding(true) }}
          className="w-full flex items-center justify-center gap-2 text-sm text-[#4A7C59] hover:text-[#3d6849] border border-dashed border-[#4A7C59]/40 hover:border-[#4A7C59] rounded-xl py-2.5 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Zutat hinzufügen
        </button>
      )}

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
        className="w-full bg-[#4A7C59] hover:bg-[#3d6849] text-white"
        disabled={busy || items.length === 0}
        onClick={() => onConfirm(items)}
      >
        Passt so →
      </Button>
    </div>
  )
}
