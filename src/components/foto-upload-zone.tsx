'use client'

import { useRef, useState } from 'react'
import { ImageIcon, X } from 'lucide-react'

interface FotoUploadZoneProps {
  file: File | null
  preview: string | null
  onFileChange: (file: File) => void
  onRemove: () => void
  disabled?: boolean
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 10

export default function FotoUploadZone({
  file: _file,
  preview,
  onFileChange,
  onRemove,
  disabled = false,
}: FotoUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validateAndAccept(candidate: File) {
    setError(null)
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      setError('Nur JPEG, PNG oder WEBP erlaubt.')
      return
    }
    if (candidate.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Bild darf maximal ${MAX_SIZE_MB} MB groß sein.`)
      return
    }
    onFileChange(candidate)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) validateAndAccept(f)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f) validateAndAccept(f)
  }

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="Mahlzeit Vorschau" className="w-full max-h-64 object-cover" />
        {!disabled && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Foto entfernen"
            className="absolute top-2 right-2 bg-background/90 rounded-full p-1.5 shadow-sm border border-border"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        )}
        {!disabled && (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-2 right-2 bg-background/90 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm border border-border"
            >
              Foto ersetzen
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInputChange}
            />
          </>
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Foto aufnehmen"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={e => !disabled && e.key === 'Enter' && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        className={[
          'flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed transition-colors',
          disabled
            ? 'opacity-50 cursor-not-allowed border-border bg-card'
            : dragActive
            ? 'border-primary bg-secondary/50 cursor-pointer'
            : 'border-border bg-card hover:border-primary/50 hover:bg-secondary/30 cursor-pointer',
        ].join(' ')}
      >
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground text-sm">Foto aufnehmen oder hochladen</p>
          <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WEBP — max. 10 MB</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  )
}
