'use client'

import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'
import FotoUploadZone from '@/components/foto-upload-zone'
import ZutatenlisteBestaetigung, { type IngredientItem } from '@/components/zutatenliste-bestaetigung'
import SaettigungsErgebnis, { type AnalysisResult } from '@/components/saettigungs-ergebnis'
import Link from 'next/link'
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
  /** PROJ-10: verbleibende Foto-Scans des Nutzers — muss serverseitig in profiles.photo_scans_remaining gespiegelt sein */
  photoScansRemaining: number
  /** PROJ-11: verbleibende Tage im Übergangsfenster, oder null wenn kein Trial läuft (siehe getAccessStatus()) */
  trialDaysRemaining: number | null
  /** PROJ-19: true für anonyme Gast-User — zeigt Conversion-Prompt statt Paywall bei Limit */
  isAnonymous?: boolean
}

// PROJ-10 / PROJ-19: muss mit dem DEFAULT in der profiles.photo_scans_remaining-Migration übereinstimmen
const TOTAL_PHOTO_SCANS = 5

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

export default function MahlzeitInput({ userId, photoScansRemaining, trialDaysRemaining, isAnonymous = false }: MahlzeitInputProps) {
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [freitext, setFreitext] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  // Lokale Kopie, damit wir nach einem erfolgreichen Foto-Scan (oder dem seltenen
  // Race Case "im anderen Tab aufgebraucht") sofort nachziehen können, ohne die Seite neu zu laden.
  const [scansRemaining, setScansRemaining] = useState(photoScansRemaining)

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
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [analysisId, setAnalysisId] = useState<string | null>(null)

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
      const mealData = await mealRes.json().catch(() => null)
      if (!mealRes.ok) {
        // PROJ-10: seltener Race Case — Foto-Scans wurden zwischen Seitenaufruf und
        // Absenden in einem anderen Tab/Gerät aufgebraucht. UI sofort nachziehen.
        if (mealData?.code === 'PHOTO_SCAN_LIMIT_REACHED') setScansRemaining(0)
        throw new Error(mealData?.error ?? 'Mahlzeit konnte nicht gespeichert werden.')
      }
      setMealId(mealData.id)
      if (foto) setScansRemaining(r => Math.max(0, r - 1))

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
        setApiError('Zutaten konnten nicht erkannt werden. Bitte beschreibe deine Mahlzeit im Textfeld und versuche es erneut.')
        setStep('input')
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
      setAnalysisId(data.analysisId ?? null)
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
    setAnalysisId(null)
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
            <p className="text-sm text-muted-foreground">Bundeslebensmittelschlüssel (BLS) wird durchsucht.</p>
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

  // ─── Done / Sättigungs-Ergebnis ────────────────────────────

  if (step === 'done' && analysisResult) {
    return (
      <div>
        <div className="px-4 pt-3 pb-0 flex justify-start">
          <Link href="/" className="text-sm text-[#2E9E6B] flex items-center gap-1 hover:underline">
            ← Zur Übersicht
          </Link>
        </div>
        <SaettigungsErgebnis
          result={analysisResult}
          assumptions={assumptions}
          onReset={resetForm}
          analysisId={analysisId ?? undefined}
          photoUrl={fotoPreview}
        />
      </div>
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

      {scansRemaining > 0 ? (
        <div className="space-y-1.5">
          <FotoUploadZone
            file={foto}
            preview={fotoPreview}
            onFileChange={handleFotoChange}
            onRemove={handleFotoRemove}
          />
          <p className="text-xs text-muted-foreground">
            {isAnonymous
              ? `Noch ${scansRemaining} von ${TOTAL_PHOTO_SCANS} Foto-Scans übrig`
              : `Heute noch ${scansRemaining} von ${TOTAL_PHOTO_SCANS} Foto-Scans`}
          </p>
        </div>
      ) : isAnonymous ? (
        // PROJ-19: Conversion-Prompt für Gäste statt Paywall
        <div className="rounded-xl border border-[#2E9E6B]/20 bg-[#DFF0F2] p-4 space-y-3">
          <p className="text-sm font-medium text-[#0B2C30]">
            📸 Du hast alle {TOTAL_PHOTO_SCANS} Foto-Analysen als Gast genutzt.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Erstelle einen kostenlosen Account — und analysiere weiter. Deine bisherigen Analysen bleiben erhalten.
          </p>
          <div className="space-y-2 pt-1">
            <Button asChild size="sm" className="w-full">
              <Link href="/registrieren">Jetzt registrieren</Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Bereits einen Account?{' '}
              <Link href="/login" className="text-[#2E9E6B] hover:underline">Einloggen</Link>
            </p>
          </div>
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            📸 Deine Foto-Scans für heute sind aufgebraucht. Morgen hast du wieder 5 neue. Beschreib deine Mahlzeit einfach unten.
          </AlertDescription>
        </Alert>
      )}

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
