// Deterministic satiation matrix for recipes — no AI call needed.
// Rules are based on macro thresholds (protein, fiber, energy density) and ingredient
// keyword/gram analysis.
//
// Refinement 2026-08-11 ("Complete"-Umstrukturierung): 6 Bausteine → 3 Säulen (Protein,
// Ballaststoffe, Volumen). Geschmack, Biss und Art of Eating sind jetzt eigenständige,
// künftige Features (siehe docs/saettigungsmatrix.md Abschnitt 7) und nicht mehr Teil
// dieser Bewertung. Die drei verbleibenden Säulen-Schlüssel ("proteine", "ballaststoffe",
// "volumen") behalten ihre bisherigen Namen bei — nur die Objekt-Form ist jetzt ein
// Drei-Schlüssel- statt Sechs-Schlüssel-Objekt. Das ist absichtlich: ältere, bereits
// gespeicherte Bewertungen (mit "geschmack"/"biss"/"art_of_eating") bleiben dadurch von
// neuen ("nur proteine/ballaststoffe/volumen") allein am Schlüsselbestand unterscheidbar,
// ohne eine neue Wrapper-Struktur einführen zu müssen.

import { toGrams } from '@/lib/units'

export type SaeulenRating = 'gut' | 'mittel' | 'gering' | 'ungenuegend'

export interface SaeuleBewertung {
  rating: SaeulenRating
  erklaerung: string
}

export interface RezeptSaettigungsMatrix {
  saeulen: {
    proteine: SaeuleBewertung
    ballaststoffe: SaeuleBewertung
    volumen: SaeuleBewertung
  }
  gesamtbewertung: 'sehr_saettigend' | 'maessig_saettigend' | 'wenig_saettigend'
}

// Ordinal ranking für den Vergleich zweier Stufen (niedrigerer Index = schlechter)
const RATING_ORDER: SaeulenRating[] = ['ungenuegend', 'gering', 'mittel', 'gut']
function worseOf(a: SaeulenRating, b: SaeulenRating): SaeulenRating {
  return RATING_ORDER.indexOf(a) <= RATING_ORDER.indexOf(b) ? a : b
}

// ── Volumen: Gemüse/Salat/Pilze mit echtem Wasseranteil ────────────────────────
// Kartoffeln, Mais und Hülsenfrüchte zählen bewusst NICHT (punkten bereits bei
// Protein/Ballaststoffe) — siehe docs/saettigungsmatrix.md Abschnitt 3c.
// Bugfix (2026-08-11, gefunden vom Nutzer live in Produktion): "Spitzkohl" fehlte in der
// Liste — 300g/Portion wurden dadurch als 0g Gemüse gewertet. Bei der Gelegenheit um weitere
// gängige Kohlsorten und andere häufig fehlende Gemüsearten ergänzt, statt nur den einen
// gemeldeten Fall zu flicken.
const VOLUMEN_KEYWORDS = [
  'salat', 'blattsalat', 'feldsalat', 'rucola', 'spinat', 'kopfsalat', 'eisberg', 'romanasalat',
  'gurke', 'zucchini', 'brokkoli', 'blumenkohl',
  'weißkohl', 'rotkohl', 'grünkohl', 'spitzkohl', 'wirsing', 'kohlrabi', 'chinakohl', 'rosenkohl',
  'lauch', 'porree',
  'champignon', 'pilze', 'tomate', 'paprika', 'karotte', 'möhre', 'fenchel', 'sellerie',
  'heidelbeere', 'blaubeere', 'erdbeere', 'himbeere', 'brombeere', 'beere', 'wassermelone',
  'radieschen', 'sauerkraut', 'kürbis', 'aubergine', 'spargel', 'mangold', 'rettich',
]

const VOLUMEN_EXCLUSION_TERMS = [
  'pulver', 'extrakt', 'mark',
  'öl', 'essig', 'gewürz', 'gewürzmischung', 'mehl', 'stärke', 'sirup',
  'getrocknet', 'gerebelt', 'gemahlen', 'rosenscharf', 'edelsüß', 'geräuchert',
  // Kleine Aromaten — auch in realistischen Mengen kein Magendehnungs-Effekt
  'knoblauch', 'zwiebel', 'schalotte', 'ingwer', 'chili',
  // Samen/Kerne statt der eigentlichen Gemüsefrucht — kalorien-/nährstoffdicht, kein
  // Magendehnungs-Volumen (analog zur Kleine-Aromaten-Logik oben). Kollidiert sonst als
  // Teilstring mit dem neuen "kürbis"-Keyword (z.B. "Kürbiskerne").
  'kürbiskern',
]

function isVolumenZutat(name: string): boolean {
  if (VOLUMEN_EXCLUSION_TERMS.some(ex => name.includes(ex))) return false
  return VOLUMEN_KEYWORDS.some(kw => name.includes(kw))
}

export function calculateRezeptMatrix(
  ingredients: { name: string; amount: number; unit: string }[],
  macros: Record<string, number> | null,
  servings: number,
): RezeptSaettigungsMatrix {
  // Normalize macro key names (API format vs. manual insert format) — macros sind bereits
  // pro Portion (calculateMacrosPerServing dividiert schon durch servings).
  const proteinProPortion = macros?.protein_g ?? 0
  const ballaststoffeProPortion = macros?.ballaststoffe_g ?? macros?.fiber_g ?? 0
  const kcalProPortion = macros?.kcal ?? 0

  // ── Proteine ───────────────────────────────────────────────────────────────
  const protG = Math.round(proteinProPortion)
  const proteine: SaeuleBewertung =
    protG >= 30
      ? { rating: 'gut', erklaerung: `${protG}g Protein pro Portion — starkes Sättigungssignal über GLP-1 und PYY.` }
      : protG >= 20
      ? { rating: 'mittel', erklaerung: `${protG}g Protein pro Portion. Solide — eine etwas größere Proteinquelle würde noch mehr rausholen.` }
      : protG >= 10
      ? { rating: 'gering', erklaerung: `${protG}g Protein pro Portion. Noch ausbaufähig — eine Ei-, Quark- oder Hülsenfrucht-Ergänzung würde helfen.` }
      : { rating: 'ungenuegend', erklaerung: `Nur ${protG}g Protein pro Portion. Proteine sind knapp — das verkürzt die Sättigungsdauer deutlich.` }

  // ── Ballaststoffe ──────────────────────────────────────────────────────────
  const fiberG = Math.round(ballaststoffeProPortion)
  const ballaststoffe: SaeuleBewertung =
    fiberG >= 10
      ? { rating: 'gut', erklaerung: `${fiberG}g Ballaststoffe pro Portion — verlangsamen die Verdauung und strecken das Sättigungsfenster deutlich.` }
      : fiberG >= 5
      ? { rating: 'mittel', erklaerung: `${fiberG}g Ballaststoffe pro Portion. Gut — noch mehr Gemüse, Hülsenfrüchte oder Vollkorn würde die Sättigungsdauer weiter verlängern.` }
      : fiberG >= 3
      ? { rating: 'gering', erklaerung: `${fiberG}g Ballaststoffe pro Portion. Noch ausbaufähig — mehr Gemüse oder Hülsenfrüchte würden hier viel bewirken.` }
      : { rating: 'ungenuegend', erklaerung: `Nur ${fiberG}g Ballaststoffe pro Portion. Mehr Gemüse, Hülsenfrüchte oder Vollkornprodukte würden hier viel bewirken.` }

  // ── Volumen: Energiedichte + Gemüsemenge, schlechtere der beiden entscheidet ─
  const gramsPerIngredient = ingredients.map(ing => ({
    name: ing.name.toLowerCase(),
    grams: toGrams(ing.amount, ing.unit, ing.name),
  }))
  const totalGramsWholeRecipe = gramsPerIngredient.reduce((sum, i) => sum + (i.grams ?? 0), 0)
  const totalGramsProPortion = servings > 0 ? totalGramsWholeRecipe / servings : 0

  const energiedichte = totalGramsProPortion > 0 ? kcalProPortion / totalGramsProPortion : 0
  const energiedichteRating: SaeulenRating =
    energiedichte > 0 && energiedichte < 1.0 ? 'gut'
    : energiedichte < 1.5 ? 'mittel'
    : energiedichte < 2.25 ? 'gering'
    : 'ungenuegend'

  const gemueseGrammeWholeRecipe = gramsPerIngredient
    .filter(i => isVolumenZutat(i.name))
    .reduce((sum, i) => sum + (i.grams ?? 0), 0)
  const gemueseGrammeProPortion = servings > 0 ? gemueseGrammeWholeRecipe / servings : 0
  const gemueseRating: SaeulenRating =
    gemueseGrammeProPortion >= 200 ? 'gut'
    : gemueseGrammeProPortion >= 100 ? 'mittel'
    : 'ungenuegend'

  const volumenRating = worseOf(energiedichteRating, gemueseRating)
  const gemueseGRund = Math.round(gemueseGrammeProPortion)
  const volumen: SaeuleBewertung = {
    rating: volumenRating,
    erklaerung:
      volumenRating === 'gut'
        ? `Ca. ${gemueseGRund}g Gemüse pro Portion bei moderater Energiedichte — füllt den Magen ohne viele Kalorien zu liefern.`
        : volumenRating === 'mittel'
        ? `Ca. ${gemueseGRund}g Gemüse pro Portion. Etwas mehr wasserreiches Gemüse würde den Füllungseffekt weiter verstärken.`
        : energiedichteRating === 'ungenuegend'
        ? `Energiedicht bei wenig Eigenvolumen (ca. ${gemueseGRund}g Gemüse pro Portion). Eine volumenreiche Ergänzung (Salat, Gemüse) würde hier viel bewirken.`
        : `Wenig Eigenvolumen (ca. ${gemueseGRund}g Gemüse pro Portion). Mehr Gemüse oder Beeren würden das Magenvolumen erhöhen, ohne viele Kalorien beizusteuern.`,
  }

  // ── Gesamtbewertung: Mehrheitsprinzip über die drei Säulen ──────────────────
  const saeulen = { proteine, ballaststoffe, volumen }
  const gutCount = Object.values(saeulen).filter(s => s.rating === 'gut').length
  const gesamtbewertung =
    gutCount === 3 ? 'sehr_saettigend'
    : gutCount === 2 ? 'maessig_saettigend'
    : 'wenig_saettigend'

  return { saeulen, gesamtbewertung }
}
