'use client'

import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'
import FotoUploadZone from '@/components/foto-upload-zone'
import ZutatenlisteBestaetigung, { type IngredientItem } from '@/components/zutatenliste-bestaetigung'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

type Step = 'input' | 'uploading' | 'questions' | 'analysing' | 'confirming' | 'calculating' | 'done'

interface Question {
  id: string
  text: string
}

interface MahlzeitInputProps {
  userId: string
}

async function generateThumbnail(source: Blob, size: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(source)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas not available')); return }
      const min = Math.min(img.width, img.height)
      const sx = (img.width - min) / 2
      const sy = (img.height - min) / 2
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
      URL.revokeObjectURL(url)
      canvas.toBlob(blob => {
        if (blob) resolve(blob)
        else reject(new Error('Thumbnail-Generierung fehlgeschlagen'))
      }, 'image/jpeg', 0.85)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Bild konnte nicht geladen werden')) }
    img.src = url
  })
}

export default function MahlzeitInput({ userId }: MahlzeitInputProps) {
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [freitext, setFreitext] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const [step, setStep] = useState<Step>('input')
  const [loadingMessage, setLoadingMessage] = useState('')
  const [apiError, setApiError] = useState<string | null>(null)

  const [mealId, setMealId] = useState<string | null>(null)
  const [currentRound, setCurrentRound] = useState(0)
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([])
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({})
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [assumptions, setAssumptions] = useState<string[]>([])
  const [ingredients, setIngredients] = useState<IngredientItem[]>([])
  const [analysisResult, setAnalysisResult] = useState<unknown>(null)

  function handleFotoChange(file: File) {
    if (fotoPreview) URL.revokeObjectURL(fotoPreview)
    setFoto(file)
    setFotoPreview(URL.createObjectURL(file))
    setValidationError(null)
  }

  function handleFotoRemove() {
    if (fotoPreview) URL.revokeObjectURL(fotoPreview)
    setFoto(null)
    setFotoPreview(null)
  }

  async function handleAnalysieren() {
    const trimmedText = freitext.trim()
    if (!foto && !trimmedText) {
      setValidationError('Bitte mindestens ein Foto oder eine Beschreibung eingeben.')
      return
    }
    setValidationError(null)
    setApiError(null)
    setLoadingMessage(foto ? 'Foto wird hochgeladen…' : 'Wird vorbereitet…')
    setStep('uploading')

    try {
      let photoPath: string | null = null
      let thumbPath: string | null = null

      if (foto) {
        const compressed = await imageCompression(foto, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        })
        const thumb = await generateThumbnail(compressed, 100)

        const supabase = createClient()
        const uuid = crypto.randomUUID()

        const { error: photoError } = await supabase.storage
          .from('meal-photos')
          .upload(`${userId}/${uuid}.jpg`, compressed, { contentType: 'image/jpeg', upsert: false })
        if (photoError) throw new Error('Foto-Upload fehlgeschlagen. Bitte erneut versuchen.')

        const { error: thumbError } = await supabase.storage
          .from('meal-photos')
          .upload(`${userId}/thumbs/${uuid}.jpg`, thumb, { contentType: 'image/jpeg', upsert: false })
        if (thumbError) throw new Error('Thumbnail-Upload fehlgeschlagen.')

        photoPath = `${userId}/${uuid}.jpg`
        thumbPath = `${userId}/thumbs/${uuid}.jpg`
      }

      const mealRes = await fetch('/api/meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoPath, thumbPath, freeText: trimmedText || null }),
      })
      if (!mealRes.ok) throw new Error('Mahlzeit konnte nicht gespeichert werden.')
      const mealData = await mealRes.json()
      setMealId(mealData.id)

      await startAnalysis(mealData.id)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten.')
      setStep('input')
    }
  }

  async function startAnalysis(id: string) {
    setLoadingMessage('Analyse wird gestartet…')
    const res = await fetch('/api/analyse/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mealId: id }),
    })
    if (!res.ok) throw new Error('Analyse konnte nicht gestartet werden.')
    const data = await res.json()

    if (data.ready) {
      await runCompleteAnalysis(id)
    } else {
      setCurrentQuestions(data.questions)
      setCurrentAnswers({})
      setCurrentRound(1)
      setStep('questions')
    }
  }

  async function handleWeiter() {
    if (!mealId) return
    setQuestionsLoading(true)
    setApiError(null)
    try {
      const answers = currentQuestions.map(q => ({
        questionId: q.id,
        text: currentAnswers[q.id] ?? '',
      }))
      const res = await fetch('/api/analyse/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealId, round: currentRound, answers, skipped: false }),
      })
      if (!res.ok) throw new Error('Antworten konnten nicht gesendet werden.')
      const data = await res.json()

      if (data.ready) {
        setStep('analysing')
        await runCompleteAnalysis(mealId)
      } else {
        setCurrentQuestions(data.questions)
        setCurrentAnswers({})
        setCurrentRound(r => r + 1)
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.')
    } finally {
      setQuestionsLoading(false)
    }
  }

  async function handleUeberspringen() {
    if (!mealId) return
    setQuestionsLoading(true)
    setApiError(null)
    try {
      const res = await fetch('/api/analyse/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealId, round: currentRound, answers: [], skipped: true }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.assumptions) setAssumptions(data.assumptions)
      setStep('analysing')
      await runCompleteAnalysis(mealId)
    } catch {
      setApiError('Ein Fehler ist aufgetreten.')
    } finally {
      setQuestionsLoading(false)
    }
  }

  async function runCompleteAnalysis(id: string) {
    setStep('analysing')
    setApiError(null)
    try {
      const res = await fetch('/api/analyse/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealId: id }),
      })
      if (!res.ok) throw new Error('Analyse konnte nicht abgeschlossen werden.')
      const data = await res.json()
      if (data.ingredients?.length > 0) {
        setIngredients(data.ingredients)
        if (data.assumptions) setAssumptions(data.assumptions)
        setStep('confirming')
      } else {
        setStep('done')
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.')
      setStep('input')
    }
  }

  async function handleConfirm(confirmedIngredients: IngredientItem[]) {
    if (!mealId) return
    setApiError(null)
    setStep('calculating')
    try {
      const res = await fetch('/api/analyse/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealId, ingredients: confirmedIngredients }),
      })
      if (!res.ok) throw new Error('Nährstoffberechnung fehlgeschlagen. Bitte erneut versuchen.')
      const data = await res.json()
      setAnalysisResult(data.result)
      setStep('done')
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.')
      setStep('confirming')
    }
  }

  function resetForm() {
    if (fotoPreview) URL.revokeObjectURL(fotoPreview)
    setFoto(null)
    setFotoPreview(null)
    setFreitext('')
    setValidationError(null)
    setApiError(null)
    setMealId(null)
    setCurrentRound(0)
    setCurrentQuestions([])
    setCurrentAnswers({})
    setAssumptions([])
    setIngredients([])
    setAnalysisResult(null)
    setStep('input')
  }

  // ─── Loading screens ───────────────────────────────────────

  if (step === 'uploading') {
    return (
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
            <span className="text-3xl animate-pulse">🍽️</span>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">{loadingMessage}</p>
            <p className="text-sm text-muted-foreground">Einen Moment bitte.</p>
          </div>
          <div className="space-y-2 px-4">
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-2 w-2/3 rounded-full mx-auto" />
          </div>
        </div>
      </main>
    )
  }

  if (step === 'analysing') {
    return (
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
            <span className="text-3xl animate-pulse">🔍</span>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">Analyse läuft…</p>
            <p className="text-sm text-muted-foreground">endlichsatt rechnet, was wirklich sättigt.</p>
          </div>
          <div className="space-y-2 px-4">
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-2 w-4/5 rounded-full mx-auto" />
            <Skeleton className="h-2 w-1/2 rounded-full mx-auto" />
          </div>
        </div>
      </main>
    )
  }

  if (step === 'confirming') {
    return (
      <main className="px-4 py-6 max-w-sm mx-auto space-y-6">
        <ZutatenlisteBestaetigung
          ingredients={ingredients}
          assumptions={assumptions}
          onConfirm={handleConfirm}
        />
        {apiError && (
          <Alert variant="destructive">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}
      </main>
    )
  }

  if (step === 'calculating') {
    return (
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
            <span className="text-3xl animate-pulse">⚗️</span>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">Nährstoffe werden berechnet…</p>
            <p className="text-sm text-muted-foreground">Open Food Facts & USDA werden abgefragt.</p>
          </div>
          <div className="space-y-2 px-4">
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-2 w-4/5 rounded-full mx-auto" />
            <Skeleton className="h-2 w-1/2 rounded-full mx-auto" />
          </div>
        </div>
      </main>
    )
  }

  // ─── Rückfragen-Flow ───────────────────────────────────────

  if (step === 'questions') {
    return (
      <main className="px-4 py-6 max-w-sm mx-auto space-y-6">
        <div className="space-y-1">
          <Badge variant="secondary" className="text-xs">
            Kurze Rückfrage · Runde {currentRound} von 3
          </Badge>
          <p className="text-sm text-muted-foreground mt-1">
            Damit die Analyse so genau wie möglich wird.
          </p>
        </div>

        <div className="space-y-5">
          {currentQuestions.map(q => (
            <div key={q.id} className="space-y-2">
              <label className="text-sm font-medium text-foreground leading-relaxed block">
                {q.text}
              </label>
              <Textarea
                rows={3}
                placeholder="Deine Antwort…"
                className="resize-none"
                disabled={questionsLoading}
                value={currentAnswers[q.id] ?? ''}
                onChange={e =>
                  setCurrentAnswers(prev => ({ ...prev, [q.id]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>

        {apiError && (
          <Alert variant="destructive">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full"
            disabled={questionsLoading}
            onClick={handleWeiter}
          >
            {questionsLoading ? 'Wird gesendet…' : 'Weiter →'}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="w-full text-muted-foreground"
            disabled={questionsLoading}
            onClick={handleUeberspringen}
          >
            Überspringen
          </Button>
        </div>
      </main>
    )
  }

  // ─── Done / Ergebnis-Platzhalter ───────────────────────────

  if (step === 'done') {
    return (
      <main className="px-4 py-6 max-w-sm mx-auto space-y-4">
        {assumptions.length > 0 && (
          <Alert>
            <AlertDescription className="text-sm">
              <span className="font-medium">Ich habe angenommen: </span>
              {assumptions.join(', ')}
            </AlertDescription>
          </Alert>
        )}
        <div className="rounded-xl border border-border bg-card p-8 text-center space-y-2">
          <p className="text-2xl">📊</p>
          <p className="font-medium text-foreground">Deine Sättigungs-Analyse</p>
          <p className="text-sm text-muted-foreground">Hier erscheint dein Ergebnis.</p>
          <p className="text-xs text-muted-foreground/50 mt-4">(PROJ-5 füllt diesen Bereich)</p>
        </div>
        <Button variant="outline" size="lg" className="w-full" onClick={resetForm}>
          Neue Mahlzeit analysieren
        </Button>
      </main>
    )
  }

  // ─── Input-Formular ────────────────────────────────────────

  const charCount = freitext.length
  const showCounter = charCount >= 800

  return (
    <main className="px-4 py-6 max-w-sm mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Was hast du gegessen?
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Foto, Text oder beides — je mehr, desto genauer die Analyse.
        </p>
      </div>

      <FotoUploadZone
        file={foto}
        preview={fotoPreview}
        onFileChange={handleFotoChange}
        onRemove={handleFotoRemove}
      />

      <div className="space-y-1.5">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-foreground">Beschreibung</span>
          <span className="text-xs text-muted-foreground">optional</span>
        </div>
        <Textarea
          id="freitext"
          placeholder="z.B. Hähnchenbrust mit Reis, in 2 EL Olivenöl angebraten, dazu Gurkensalat mit Essig und Öl"
          rows={4}
          maxLength={1000}
          className="resize-none"
          value={freitext}
          onChange={e => {
            setFreitext(e.target.value)
            if (validationError) setValidationError(null)
          }}
        />
        {showCounter && (
          <p className={`text-xs text-right ${charCount >= 1000 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {charCount}/1000
          </p>
        )}
      </div>

      {validationError && (
        <p className="text-sm text-destructive">{validationError}</p>
      )}

      {apiError && (
        <Alert variant="destructive">
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <Button size="lg" className="w-full" onClick={handleAnalysieren}>
        Analysieren →
      </Button>
    </main>
  )
}
