'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray, Controller, type Control, type UseFormRegister, type FieldErrors } from 'react-hook-form'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, Upload, ChefHat, GripVertical, Heading } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import ZutatInputMitQuelle from '@/components/zutat-input-mit-quelle'
import BildCropper from '@/components/bild-cropper'
import type { NutritionPer100g } from '@/lib/nutrition'

interface ZutatenZeile {
  itemType: 'zutat' | 'gruppe'
  name: string
  amount: string
  unit: string
  groupLabel: string
}

export interface RezeptFormularValues {
  title: string
  servings: string
  cook_time_minutes: string
  total_time_minutes: string
  instructions: string
  ingredient_tags: string
  cuisine_tags: string
  ingredients: ZutatenZeile[]
  image_path?: string
}

/** Eine Gruppen-Überschrift ohne mindestens eine nachfolgende Zutat (bis zur nächsten Überschrift/Listenende) gilt als leer. */
function findEmptyGroupLabel(items: ZutatenZeile[]): string | null {
  for (let i = 0; i < items.length; i++) {
    if (items[i].itemType !== 'gruppe') continue
    const rest = items.slice(i + 1)
    const nextHeaderOffset = rest.findIndex(it => it.itemType === 'gruppe')
    const groupItems = nextHeaderOffset === -1 ? rest : rest.slice(0, nextHeaderOffset)
    if (!groupItems.some(it => it.itemType === 'zutat')) {
      return items[i].groupLabel.trim() || '(ohne Titel)'
    }
  }
  return null
}

function SortableZutatZeile({
  id,
  index,
  control,
  register,
  macros,
  onSelectSource,
  onClearMacros,
  onRemove,
  disableRemove,
}: {
  id: string
  index: number
  control: Control<RezeptFormularValues>
  register: UseFormRegister<RezeptFormularValues>
  macros: NutritionPer100g | null
  onSelectSource: (per100g: NutritionPer100g) => void
  onClearMacros: () => void
  onRemove: () => void
  disableRemove: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-2 items-start ${isDragging ? 'opacity-50 z-10' : ''}`}
    >
      <button
        type="button"
        aria-label="Zutat verschieben"
        className="mt-2 flex-shrink-0 touch-none text-muted-foreground/60 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Controller
        control={control}
        name={`ingredients.${index}.name`}
        render={({ field: f }) => (
          <ZutatInputMitQuelle
            value={f.value}
            onChange={f.onChange}
            onBlur={f.onBlur}
            onSelectSource={onSelectSource}
            onClearMacros={onClearMacros}
            linkedMacros={macros}
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
        onClick={onRemove}
        disabled={disableRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

function SortableGruppenZeile({
  id,
  index,
  register,
  errors,
  onRemove,
}: {
  id: string
  index: number
  register: UseFormRegister<RezeptFormularValues>
  errors: FieldErrors<RezeptFormularValues>
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const errorMessage = errors.ingredients?.[index]?.groupLabel?.message

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-2 items-center rounded-lg border border-dashed border-border bg-muted/30 px-2 py-1.5 ${isDragging ? 'opacity-50 z-10' : ''}`}
    >
      <button
        type="button"
        aria-label="Gruppe verschieben"
        className="flex-shrink-0 touch-none text-muted-foreground/60 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 space-y-1">
        <Input
          placeholder="z.B. Für das Dressing"
          maxLength={40}
          className="h-8 text-sm font-medium bg-transparent border-none px-1 focus-visible:ring-1"
          {...register(`ingredients.${index}.groupLabel`, {
            required: 'Pflichtfeld',
            maxLength: { value: 40, message: 'Max. 40 Zeichen' },
          })}
        />
        {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="flex-shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

type RecipeTyp = 'vollstaendig' | 'beilage' | 'grundlage'

interface RezeptFormularProps {
  defaultValues?: Partial<RezeptFormularValues>
  recipeId?: string
  existingImageUrl?: string | null
  defaultIngredientMacros?: (NutritionPer100g | null)[]
  defaultRecipeTyp?: 'beilage' | 'grundlage' | null
  defaultIsGuestVisible?: boolean
  mode: 'create' | 'edit'
}

export default function RezeptFormular({
  defaultValues,
  recipeId,
  existingImageUrl,
  defaultIngredientMacros,
  defaultRecipeTyp,
  defaultIsGuestVisible = false,
  mode,
}: RezeptFormularProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [recipeTyp, setRecipeTyp] = useState<RecipeTyp>(
    defaultRecipeTyp === 'beilage' ? 'beilage' : defaultRecipeTyp === 'grundlage' ? 'grundlage' : 'vollstaendig'
  )
  const [isGuestVisible, setIsGuestVisible] = useState(defaultIsGuestVisible)
  const [imagePreview, setImagePreview] = useState<string | null>(existingImageUrl ?? null)
  const [uploadedPath, setUploadedPath] = useState<string | null>(defaultValues?.image_path ?? null)
  // Raw local blob URL shown in the cropper (before upload)
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null)
  const [cropMode, setCropMode] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { register, control, handleSubmit, formState: { errors } } = useForm<RezeptFormularValues>({
    defaultValues: {
      title: '',
      servings: '2',
      cook_time_minutes: '20',
      total_time_minutes: '30',
      instructions: '',
      ingredient_tags: '',
      cuisine_tags: '',
      ingredients: [{ itemType: 'zutat', name: '', amount: '', unit: 'g', groupLabel: '' }],
      ...defaultValues,
    },
  })

  const { fields, append, remove, move } = useFieldArray({ control, name: 'ingredients' })

  // Nährwert-Quelle pro Zutat, verknüpft über die stabile Feld-ID (nicht die Array-Position) —
  // so bleibt die Verknüpfung beim Umsortieren korrekt an der jeweiligen Zutat.
  const [ingredientMacros, setIngredientMacros] = useState<Record<string, NutritionPer100g | null>>(
    () => Object.fromEntries(fields.map((f, i) => [f.id, defaultIngredientMacros?.[i] ?? null]))
  )

  const zutatCount = fields.filter(f => f.itemType === 'zutat').length

  const dragSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  function handleIngredientDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = fields.findIndex(f => f.id === active.id)
    const newIndex = fields.findIndex(f => f.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    move(oldIndex, newIndex)
  }

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

    // Leere Zutaten-Zeilen (kein Name eingetragen) rausfiltern, Gruppen-Überschriften immer behalten —
    // dabei die Zuordnung zur stabilen Feld-ID für die Makro-Verknüpfung mitführen.
    const filteredItems = values.ingredients
      .map((item, idx) => ({ item, fieldId: fields[idx]?.id }))
      .filter(({ item }) => item.itemType === 'gruppe' || item.name.trim())

    const emptyGroupLabel = findEmptyGroupLabel(filteredItems.map(({ item }) => item))
    if (emptyGroupLabel) {
      setSubmitError(`Gruppe „${emptyGroupLabel}" hat keine Zutaten`)
      return
    }

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
        ingredients: filteredItems.map(({ item, fieldId }, idx) =>
          item.itemType === 'gruppe'
            ? {
                item_type: 'gruppe' as const,
                label: item.groupLabel.trim(),
                sort_order: idx,
              }
            : {
                item_type: 'zutat' as const,
                name: item.name.trim(),
                amount: parseFloat(item.amount) || 0,
                unit: item.unit.trim() || 'Stück',
                sort_order: idx,
                macros_per_100g: (fieldId ? ingredientMacros[fieldId] : null) ?? null,
              }
        ),
        image_path: uploadedPath ?? undefined,
        recipe_typ: recipeTyp === 'vollstaendig' ? null : recipeTyp,
        is_guest_visible: isGuestVisible,
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
        // API liefert bei Zod-Validierungsfehlern ein Objekt (fieldErrors/formErrors) statt eines Strings
        const message = typeof data.error === 'string'
          ? data.error
          : Object.values(data.error?.fieldErrors ?? {}).flat().join(', ') || 'Speichern fehlgeschlagen'
        throw new Error(message)
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
        <DndContext sensors={dragSensors} collisionDetection={closestCenter} onDragEnd={handleIngredientDragEnd}>
          <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {fields.map((field, index) =>
                field.itemType === 'gruppe' ? (
                  <SortableGruppenZeile
                    key={field.id}
                    id={field.id}
                    index={index}
                    register={register}
                    errors={errors}
                    onRemove={() => remove(index)}
                  />
                ) : (
                  <SortableZutatZeile
                    key={field.id}
                    id={field.id}
                    index={index}
                    control={control}
                    register={register}
                    macros={ingredientMacros[field.id] ?? null}
                    onSelectSource={(per100g) => setIngredientMacros(prev => ({ ...prev, [field.id]: per100g }))}
                    onClearMacros={() => setIngredientMacros(prev => ({ ...prev, [field.id]: null }))}
                    onRemove={() => {
                      remove(index)
                      setIngredientMacros(prev => {
                        const next = { ...prev }
                        delete next[field.id]
                        return next
                      })
                    }}
                    disableRemove={zutatCount <= 1}
                  />
                )
              )}
            </div>
          </SortableContext>
        </DndContext>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ itemType: 'zutat', name: '', amount: '', unit: 'g', groupLabel: '' })}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            Zutat hinzufügen
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ itemType: 'gruppe', name: '', amount: '', unit: '', groupLabel: '' })}
            className="flex-1"
          >
            <Heading className="h-4 w-4 mr-2" />
            Gruppe hinzufügen
          </Button>
        </div>
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

      <Separator />

      {/* Rezept-Typ */}
      <div className="space-y-3">
        <Label>Rezept-Typ</Label>
        <RadioGroup
          value={recipeTyp}
          onValueChange={(v) => setRecipeTyp(v as RecipeTyp)}
          className="space-y-2"
        >
          {([
            { value: 'vollstaendig', label: 'Vollständiges Gericht', desc: 'Kann als alleinige Mahlzeit gegessen werden' },
            { value: 'beilage',      label: 'Beilage',               desc: 'Salat, Rohkost, Gemüsebeilage, Dips' },
            { value: 'grundlage',    label: 'Grundlagen-Rezept',     desc: 'Brot, Brühe, Sauce, Teig' },
          ] as { value: RecipeTyp; label: string; desc: string }[]).map(opt => (
            <label
              key={opt.value}
              htmlFor={`typ-${opt.value}`}
              className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                recipeTyp === opt.value
                  ? 'border-[#4A7C59] bg-[#E8F0EB]'
                  : 'border-border hover:bg-muted/40'
              }`}
            >
              <RadioGroupItem value={opt.value} id={`typ-${opt.value}`} className="mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-medium text-sm block">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.desc}</span>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      {/* Gast-Freischaltung */}
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="is-guest-visible" className="text-sm font-medium cursor-pointer">
            Für Gäste freischalten
          </Label>
          <p className="text-xs text-muted-foreground">
            Gäste ohne Account können dieses Rezept vollständig lesen
          </p>
        </div>
        <Switch
          id="is-guest-visible"
          checked={isGuestVisible}
          onCheckedChange={setIsGuestVisible}
        />
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
