import type { RezeptFormularValues } from '@/components/rezept-formular'

export type MahlzeitRezeptVariante = 'wie-gescannt' | 'mehr-saettigung'

interface MahlzeitZutat {
  name: string
  grams: number
}

interface MahlzeitVorschlag {
  aktion: string
}

interface BuildRezeptVorbefuellungInput {
  freeText: string | null
  createdAt: string
  /** 'beilage' oder null/'standard' — direkt aus meal_analyses.analysis_typ */
  analysisTyp: string | null
  ingredients: MahlzeitZutat[]
  /** Nur bei variante 'mehr-saettigung' und nicht-Beilage relevant */
  vorschlaege: MahlzeitVorschlag[]
  variante: MahlzeitRezeptVariante
}

export interface RezeptVorbefuellung {
  defaultValues: Partial<RezeptFormularValues>
  recipeTyp: 'beilage' | null
}

// PROJ-32: Mahlzeit-Analyse erfasst nie echte Zubereitungsschritte (nur was gegessen wurde) —
// der Platzhaltertext füllt das Pflichtfeld, bleibt aber immer änderbar (siehe Spec-Entscheidung).
const ZUBEREITUNG_PLATZHALTER = 'Zutaten nach Belieben zubereiten.'

function formatDatumKurz(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}

/** Baut die Formular-Vorbefüllung für "Rezept aus Mahlzeit" — reine Transformation ohne
 *  Seiteneffekte, damit sie unabhängig von der Datenquelle (Server-Component-Fetch) testbar ist. */
export function buildRezeptVorbefuellung({
  freeText,
  createdAt,
  analysisTyp,
  ingredients,
  vorschlaege,
  variante,
}: BuildRezeptVorbefuellungInput): RezeptVorbefuellung {
  const istBeilage = analysisTyp === 'beilage'

  const title = freeText?.trim() || `Mahlzeit vom ${formatDatumKurz(createdAt)}`

  const zutatenZeilen: RezeptFormularValues['ingredients'] = ingredients.map(z => ({
    itemType: 'zutat' as const,
    name: z.name,
    amount: String(z.grams),
    unit: 'g',
    groupLabel: '',
  }))

  // "Mit mehr Sättigung" nur bei vollständigen Mahlzeiten sinnvoll (siehe Spec) — bei Beilagen
  // (oder falls die Variante trotzdem per URL erzwungen wird) werden keine Vorschlags-Zeilen
  // angehängt, das Ergebnis entspricht dann "Wie gescannt".
  const vorschlagsZeilen: RezeptFormularValues['ingredients'] =
    variante === 'mehr-saettigung' && !istBeilage
      ? vorschlaege.map(v => ({
          itemType: 'zutat' as const,
          name: v.aktion,
          amount: '',
          unit: '',
          groupLabel: '',
        }))
      : []

  const ingredientTags = [...new Set(ingredients.map(z => z.name.trim().toLowerCase()).filter(Boolean))].join(', ')

  return {
    defaultValues: {
      title,
      servings: '1',
      instructions: ZUBEREITUNG_PLATZHALTER,
      ingredient_tags: ingredientTags,
      ingredients: [...zutatenZeilen, ...vorschlagsZeilen],
    },
    recipeTyp: istBeilage ? 'beilage' : null,
  }
}
