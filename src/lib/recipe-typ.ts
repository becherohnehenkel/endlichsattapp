/**
 * PROJ-16 (Refinement 2026-09-03): Zentrale Werte-Liste für recipe_typ.
 * Vorher in 7 Dateien einzeln dupliziert — hier die eine Quelle für Werte + Labels.
 */

/** Gespeicherte DB-Werte, wenn recipe_typ nicht null ist. */
export const RECIPE_TYP_DB_VALUES = ['beilage', 'grundlage', 'snack'] as const
export type RecipeTypDb = (typeof RECIPE_TYP_DB_VALUES)[number]

/** Wie in der DB gespeichert: null = vollständiges Gericht. */
export type RecipeTyp = RecipeTypDb | null

/** Formular-Auswahlwert — "vollstaendig" ist hier ein expliziter Radio-Wert, wird aber als null gespeichert. */
export type RecipeTypFormular = 'vollstaendig' | RecipeTypDb

export const RECIPE_TYP_FORMULAR_OPTIONEN: { value: RecipeTypFormular; label: string; desc: string }[] = [
  { value: 'vollstaendig', label: 'Vollständiges Gericht', desc: 'Kann als alleinige Mahlzeit gegessen werden' },
  { value: 'beilage', label: 'Beilage', desc: 'Salat, Rohkost, Gemüsebeilage, Dips' },
  { value: 'grundlage', label: 'Grundlagen-Rezept', desc: 'Brot, Brühe, Sauce, Teig' },
  { value: 'snack', label: 'Snack', desc: 'Energiebällchen, Studentenfutter, kleine Zwischenmahlzeit' },
]

/** Kontext-Hinweis auf der Rezept-Detailseite (ersetzt die normale Sättigungs-Bewertung). */
export const RECIPE_TYP_KONTEXT_HINWEIS: Record<RecipeTypDb, { badge: string; text: string }> = {
  beilage: {
    badge: 'Als Beilage gedacht',
    text: 'Als Beilage top — allein noch keine vollständige Mahlzeit. Kombiniere es mit einer Proteinquelle (Quark, Ei, Fleisch) und ggf. Brot oder Stärke.',
  },
  grundlage: {
    badge: 'Grundlagen-Rezept',
    text: 'Baustein für andere Gerichte — als alleinige Mahlzeit nicht vollständig. Dieses Rezept entfaltet seinen Wert in Kombination mit weiteren Komponenten.',
  },
  snack: {
    badge: 'Snack',
    text: 'Ein Snack für zwischendurch — muss keine vollständige Mahlzeit sein.',
  },
}

/** Filter-Werte für Rezeptübersicht & Adminseite (Refinement 2026-09-03, Teil 6). */
export type RecipeTypFilterValue = 'alle' | 'mahlzeiten' | RecipeTypDb

export const RECIPE_TYP_FILTER_OPTIONEN: { value: RecipeTypFilterValue; label: string }[] = [
  { value: 'alle', label: 'Alle' },
  { value: 'mahlzeiten', label: 'Mahlzeiten' },
  { value: 'beilage', label: 'Beilagen' },
  { value: 'grundlage', label: 'Grundrezepte' },
  { value: 'snack', label: 'Snacks' },
]

/** true, wenn ein Rezept mit `recipeTyp` zum gewählten Filter passt. */
export function matchesRecipeTypFilter(recipeTyp: RecipeTyp, filter: RecipeTypFilterValue): boolean {
  if (filter === 'alle') return true
  if (filter === 'mahlzeiten') return recipeTyp === null
  return recipeTyp === filter
}
