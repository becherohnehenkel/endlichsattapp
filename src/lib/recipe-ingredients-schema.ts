import { z } from 'zod'

const ZutatItemSchema = z.object({
  item_type: z.literal('zutat'),
  name: z.string().min(1),
  amount: z.number().positive(),
  unit: z.string().min(1),
  sort_order: z.number().int().optional().default(0),
  macros_per_100g: z.record(z.string(), z.number()).nullable().optional(),
})

const GruppeItemSchema = z.object({
  item_type: z.literal('gruppe'),
  label: z.string().trim().min(1, 'Gruppen-Überschrift darf nicht leer sein').max(40, 'Max. 40 Zeichen'),
  sort_order: z.number().int().optional().default(0),
})

export const RecipeIngredientItemSchema = z.discriminatedUnion('item_type', [ZutatItemSchema, GruppeItemSchema])
export type RecipeIngredientItem = z.infer<typeof RecipeIngredientItemSchema>
export type ZutatItem = z.infer<typeof ZutatItemSchema>

/** Eine Gruppen-Überschrift ohne mindestens eine nachfolgende Zutat (bis zur nächsten Überschrift/Listenende) gilt als leer. */
function hasEmptyGroup(items: RecipeIngredientItem[]): boolean {
  const sorted = [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].item_type !== 'gruppe') continue
    const rest = sorted.slice(i + 1)
    const nextHeaderOffset = rest.findIndex(it => it.item_type === 'gruppe')
    const groupItems = nextHeaderOffset === -1 ? rest : rest.slice(0, nextHeaderOffset)
    if (!groupItems.some(it => it.item_type === 'zutat')) return true
  }
  return false
}

export const RecipeIngredientsSchema = z
  .array(RecipeIngredientItemSchema)
  .min(1, 'Mindestens eine Zutat erforderlich')
  .refine(items => items.some(i => i.item_type === 'zutat'), {
    message: 'Mindestens eine Zutat erforderlich',
  })
  .refine(items => !hasEmptyGroup(items), {
    message: 'Gruppen dürfen keine leeren Abschnitte haben',
  })

export function isZutat(item: RecipeIngredientItem): item is ZutatItem {
  return item.item_type === 'zutat'
}
