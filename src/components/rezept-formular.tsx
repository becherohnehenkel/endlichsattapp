'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, Upload, ChefHat } from 'lucide-react'
import UsdaIngredientInput from '@/components/usda-ingredient-input'
import BildCropper from '@/components/bild-cropper'
import type { NutritionPer100g } from '@/lib/nutrition'

interface IngredientRow {
  name: string
  amount: string
  unit: string
}

export interface RezeptFormularValues {
  title: string
  servings: string
  cook_time_minutes: string
  total_time_minutes: string
  instructions: string
  ingredient_tags: string
  cuisine_tags: string
  ingredients: IngredientRow[]
  image_path?: string
}

interface RezeptFormularProps {
  defaultValues?: Partial<RezeptFormularValues>
  recipeId?: string
  existingImageUrl?: string | null
  mode: 'create' | 'edit'
}

export default function RezeptFormular({
  defaultValues,
  recipeId,
  existingImageUrl,
  mode,
}: RezeptFormularProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imagePreview, setImagePreview] = useState<string | null>(existingImageUrl ?? null)
  const [uploadedPath, setUploadedPath] = useState<string | null>(defaultValues?.image_path ?? null)
  // Raw local blob URL shown in the cropper (before upload)
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null)
  const [cropMode, setCropMode] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [ingredientMacros, setIngredientMacros] = useState<(NutritionPer100g | null)[]>(
    () => (defaultValues?.ingredients ?? [{ name: '', amount: '', unit: 'g' }]).map(() => null)
  )

  const { register, control, handleSubmit, formState: { errors } } = useForm<RezeptFormularValues>({
    defaultValues: {
      title: '',
      servings: '2',
      cook_time_minutes: '20',
      total_time_minutes: '30',
      instructions: '',
      ingredient_tags: '',
      cuisine_tags: '',
      ingredients: [{ name: '', amount: '', unit: 'g' }],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'ingredients' })

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageError(null)
    // Create local blob URL for crop preview — no upload yet
    const localUrl = URL.createObjectURL(file)
    setRawImageSrc(localUrl)
    setCropMode(true)
    // Reset the input so the same file can be re-selected
    e.target.value = ''
  }

  async function handleCropConfirm(blob: Blob) {
    setImageUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', blob, 'crop.jpg')
      const res = await fetch('/api/admin/rezepte/bild', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload fehlgeschlagen')
      setUploadedPath(data.path)
      setImagePreview(data.imageUrl)
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Upload fehlgeschlagen')
    } finally {
      if (rawImageSrc) URL.revokeObjectURL(rawImageSrc)
      setRawImageSrc(null)
      setCropMode(false)
      setImageUploading(false)
    }
  }

  function handleCropCancel() {
    if (rawImageSrc) URL.revokeObjectURL(rawImageSrc)
    setRawImageSrc(null)
    setCropMode(false)
  }

  async function onSubmit(values: RezeptFormularValues) {
    setSubmitError(null)
    setSubmitting(true)
    try {
      const payload = {
        title: values.title.trim(),
        servings: parseInt(values.servings),
        cook_time_minutes: parseInt(values.cook_time_minutes),
        total_time_minutes: parseInt(values.total_time_minutes),
        instructions: values.instructions.trim(),
        ingredient_tags: values.ingredient_tags
          .split(',')
          .map(t => t.trim().toLowerCase())
          .filter(Boolean),
        cuisine_tags: values.cuisine_tags
          .split(',')
          .map(t => t.trim().toLowerCase())
          .filter(Boolean),
        ingredients: values.ingredients
          .filter(i => i.name.trim())
          .map((i, idx) => ({
            name: i.name.trim(),
            amount: parseFloat(i.amount) || 0,
            unit: i.unit.trim() || 'Stück',
            sort_order: idx,
            macros_per_100g: ingredientMacros[idx] ?? null,
          })),
        image_path: uploadedPath ?? undefined,
      }

      const url = mode === 'edit' ? `/api/admin/rezepte/${recipeId}` : '/api/admin/rezepte'
      const method = mode === 'edit' ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Speichern fehlgeschlagen')
      }
      router.push('/admin/rezepte')
      router.refresh()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Titel */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Titel *</Label>
        <Input
          id="title"
          {...register('title', { required: 'Pflichtfeld' })}
          placeholder="z.B. Hähnchen mit Reis"
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      {/* Zeiten + Portionen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="servings">Portionen</Label>
          <Input id="servings" type="number" min="1" {...register('servings', { required: true })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cook_time_minutes">Kochzeit (Min.)</Label>
          <Input id="cook_time_minutes" type="number" min="0" {...register('cook_time_minutes', { required: true })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="total_time_minutes">Gesamt (Min.)</Label>
          <Input id="total_time_minutes" type="number" min="1" {...register('total_time_minutes', { required: true })} />
        </div>
      </div>

      <Separator />

      {/* Zutaten */}
      <div className="space-y-3">
        <Label>Zutaten *</Label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-start">
            <Controller
              control={control}
              name={`ingredients.${index}.name`}
              render={({ field: f }) => (
                <UsdaIngredientInput
                  value={f.value}
                  onChange={f.onChange}
                  onBlur={f.onBlur}
                  onSelectUsda={(result) => {
                    f.onChange(result.name_de)
                    setIngredientMacros(prev => {
                      const next = [...prev]
                      next[index] = result.per100g
                      return next
                    })
                  }}
                  onClearMacros={() => {
                    setIngredientMacros(prev => {
                      const next = [...prev]
                      next[index] = null
                      return next
                    })
                  }}
                  linkedMacros={ingredientMacros[index] ?? null}
                />
              )}
            />
            <Input
              placeholder="Menge"
              className="w-20"
              type="number"
              step="0.1"
              min="0"
              {...register(`ingredients.${index}.amount`)}
            />
            <Input
              placeholder="Einheit"
              className="w-20"
              {...register(`ingredients.${index}.unit`)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="flex-shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => {
                remove(index)
                setIngredientMacros(prev => prev.filter((_, i) => i !== index))
              }}
              disabled={fields.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            append({ name: '', amount: '', unit: 'g' })
            setIngredientMacros(prev => [...prev, null])
          }}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Zutat hinzufügen
        </Button>
      </div>

      <Separator />

      {/* Tags */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="ingredient_tags">
            Zutaten-Tags *
            <span className="ml-2 text-xs text-muted-foreground font-normal">kommagetrennt, z.B. hähnchen, reis, sojasauce</span>
          </Label>
          <Input
            id="ingredient_tags"
            {...register('ingredient_tags', { required: 'Mindestens ein Tag' })}
            placeholder="hähnchen, reis, sojasauce"
          />
          {errors.ingredient_tags && (
            <p className="text-xs text-destructive">{errors.ingredient_tags.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cuisine_tags">
            Küchen-Tags
            <span className="ml-2 text-xs text-muted-foreground font-normal">kommagetrennt, z.B. asiatisch, vegetarisch</span>
          </Label>
          <Input
            id="cuisine_tags"
            {...register('cuisine_tags')}
            placeholder="asiatisch, vegetarisch"
          />
        </div>
      </div>

      <Separator />

      {/* Zubereitung */}
      <div className="space-y-1.5">
        <Label htmlFor="instructions">Zubereitung *</Label>
        <Textarea
          id="instructions"
          rows={8}
          {...register('instructions', { required: 'Pflichtfeld' })}
          placeholder="Schritt für Schritt Anleitung…"
          className="resize-none"
        />
        {errors.instructions && <p className="text-xs text-destructive">{errors.instructions.message}</p>}
      </div>

      <Separator />

      {/* Bild */}
      <div className="space-y-3">
        <Label>Bild (optional)</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleImageChange}
        />

        {/* Crop mode */}
        {cropMode && rawImageSrc && (
          <BildCropper
            imageSrc={rawImageSrc}
            onConfirm={handleCropConfirm}
            onCancel={handleCropCancel}
          />
        )}

        {/* Uploading indicator */}
        {imageUploading && (
          <div className="w-full aspect-square rounded-xl border border-border bg-muted/40 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Wird hochgeladen…</p>
          </div>
        )}

        {/* Preview of confirmed image */}
        {!cropMode && !imageUploading && imagePreview && (
          <div className="space-y-2">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-muted">
              <Image
                src={imagePreview}
                alt="Vorschau"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Bild ersetzen
            </Button>
          </div>
        )}

        {/* Upload button (no image yet) */}
        {!cropMode && !imageUploading && !imagePreview && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Upload className="h-6 w-6" />
            <span className="text-sm">Bild hochladen (JPEG/PNG/WebP, max. 5 MB)</span>
            <ChefHat className="h-4 w-4 opacity-40" />
          </button>
        )}

        {imageError && <p className="text-xs text-destructive">{imageError}</p>}
      </div>

      {submitError && (
        <p className="text-sm text-destructive rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
          {submitError}
        </p>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Abbrechen
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-[#4A7C59] hover:bg-[#3d6849] text-white"
          disabled={submitting || imageUploading || cropMode}
        >
          {submitting ? 'Wird gespeichert…' : mode === 'edit' ? 'Speichern' : 'Rezept anlegen'}
        </Button>
      </div>
    </form>
  )
}
