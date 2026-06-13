// Deterministic satiation matrix for recipes — no AI call needed.
// Rules are based on macro thresholds (protein, fiber) and ingredient keyword analysis.

export type BausteinRating = 'gut' | 'mittel' | 'schwach' | 'nicht_bewertet'

export interface BausteinBewertung {
  rating: BausteinRating
  erklaerung: string
}

export interface RezeptSaettigungsMatrix {
  bausteine: {
    geschmack: BausteinBewertung
    biss: BausteinBewertung
    ballaststoffe: BausteinBewertung
    proteine: BausteinBewertung
    volumen: BausteinBewertung
    art_of_eating: BausteinBewertung
  }
  gesamtbewertung: 'sehr_saettigend' | 'maessig_saettigend' | 'wenig_saettigend'
}

// ── Biss ──────────────────────────────────────────────────────────────────────
// Only whole foods with real chewing resistance count.
const BISS_KEYWORDS = [
  'nuss', 'nüsse', 'mandel', 'mandeln', 'walnuss', 'cashew', 'erdnuss', 'haselnuss', 'pistazien',
  'kerne', 'kürbiskern', 'sonnenblumenkern', 'pinienkern', 'sesam', 'chia', 'leinsamen', 'chiasamen',
  'granola', 'müsli', 'knäckebrot', 'crouton',
  'karotte', 'möhre', 'gurke', 'paprika', 'apfel', 'sellerie', 'fenchel', 'kohlrabi', 'radieschen',
  'quinoa',
  'bohne', 'linse', 'kichererbse', 'erbse',
]

// Spices, powders, extracts, purees and other processed forms that look like
// Biss keywords but provide zero chewing resistance.
const BISS_EXCLUSION_TERMS = [
  'pulver', 'extrakt', 'püree', 'mus', 'paste', 'pesto', 'mark',
  'öl', 'essig', 'sauce', 'soße', 'saft', 'sirup', 'fond', 'brühe', 'bouillon',
  'gewürz', 'gewürzmischung', 'mehl', 'stärke',
  'getrocknet', 'gerebelt', 'gemahlen',
  // Paprika spice quality descriptors (indicate the powdered spice, not the vegetable)
  'rosenscharf', 'edelsüß', 'geräuchert',
]

// ── Volumen ───────────────────────────────────────────────────────────────────
// High-water, low-calorie whole foods only. Concentrated pastes and small
// aromatics (garlic, ginger, chili) are explicitly excluded.
const VOLUMEN_KEYWORDS = [
  'salat', 'blattsalat', 'feldsalat', 'rucola', 'spinat', 'kopfsalat', 'eisberg', 'romanasalat',
  'gurke', 'zucchini', 'brokkoli', 'blumenkohl', 'weißkohl', 'rotkohl', 'grünkohl', 'lauch', 'porree',
  'champignon', 'pilze', 'tomate', 'paprika', 'karotte', 'möhre', 'fenchel', 'staudensellerie', 'bleichsellerie',
  'heidelbeere', 'blaubeere', 'erdbeere', 'himbeere', 'brombeere', 'beere', 'wassermelone',
  'quark', 'joghurt', 'skyr', 'magerquark',
]

const VOLUMEN_EXCLUSION_TERMS = [
  // Concentrated/powdered forms that lose volume
  'pulver', 'extrakt', 'mark',
  'öl', 'essig', 'gewürz', 'gewürzmischung', 'mehl', 'stärke', 'sirup',
  'getrocknet', 'gerebelt', 'gemahlen', 'rosenscharf', 'edelsüß', 'geräuchert',
  // Small aromatics — meaningful volume only in unrealistically large amounts
  'knoblauch', 'zwiebel', 'schalotte', 'ingwer', 'chili',
]

// ── Geschmack ─────────────────────────────────────────────────────────────────
const GESCHMACK_KEYWORDS = [
  'öl', 'olivenöl', 'rapsöl', 'butter', 'sahne', 'schmand', 'crème fraîche',
  'avocado', 'käse', 'parmesan', 'feta', 'mozzarella', 'gouda', 'cheddar', 'frischkäse', 'hüttenkäse',
  'kokosmilch', 'kokoscreme', 'mandelmus', 'erdnussmus', 'sesam', 'tahini', 'pesto',
  'bacon', 'speck', 'schinken', 'lachs', 'thunfisch',
  'knoblauch', 'ingwer', 'chili', 'curry', 'paprika', 'paprikapulver', 'muskat', 'zimt', 'kreuzkümmel', 'gewürze',
  'zitrone', 'limette', 'balsamico', 'sojasauce', 'worcester', 'senf', 'dressing', 'soße', 'sauce',
  'tomatenmark', 'ajvar', 'miso',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchingIngredients(names: string[], keywords: string[], exclusions: string[] = []): string[] {
  return names.filter(name => {
    if (exclusions.some(ex => name.includes(ex))) return false
    return keywords.some(kw => name.includes(kw))
  })
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Returns a short display name: strips trailing qualifiers and caps length.
function displayName(ingredientName: string): string {
  const short = ingredientName.split(/[,/(]/)[0].trim()
  return capitalize(short)
}

export function calculateRezeptMatrix(
  ingredients: { name: string }[],
  macros: Record<string, number> | null,
): RezeptSaettigungsMatrix {
  const names = ingredients.map(i => i.name.toLowerCase())

  // Normalize macro key names (API format vs. manual insert format)
  const protein = macros?.protein_g ?? 0
  const fiber = macros?.ballaststoffe_g ?? macros?.fiber_g ?? 0

  // ── Proteine ─────────────────────────────────────────────────────────────
  const protG = Math.round(protein)
  const proteine: BausteinBewertung = protG >= 20
    ? { rating: 'gut', erklaerung: `${protG}g Protein pro Portion — starkes Sättigungssignal über GLP-1 und PYY. Sehr gut.` }
    : protG >= 10
    ? { rating: 'mittel', erklaerung: `${protG}g Protein pro Portion. Solide, aber noch etwas Luft nach oben — eine Ei-, Quark- oder Hülsenfrucht-Ergänzung würde helfen.` }
    : { rating: 'schwach', erklaerung: `Nur ${protG}g Protein pro Portion. Proteine sind knapp — das verkürzt die Sättigungsdauer deutlich.` }

  // ── Ballaststoffe ─────────────────────────────────────────────────────────
  const fiberG = Math.round(fiber)
  const ballaststoffe: BausteinBewertung = fiberG >= 10
    ? { rating: 'gut', erklaerung: `${fiberG}g Ballaststoffe pro Portion — verlangsamen die Verdauung und strecken das Sättigungsfenster deutlich.` }
    : fiberG >= 5
    ? { rating: 'mittel', erklaerung: `${fiberG}g Ballaststoffe pro Portion. Gut, aber mehr Gemüse, Hülsenfrüchte oder Vollkorn würde die Sättigungsdauer weiter verlängern.` }
    : { rating: 'schwach', erklaerung: `Nur ${fiberG}g Ballaststoffe pro Portion. Mehr Gemüse, Hülsenfrüchte oder Vollkornprodukte würden hier viel bewirken.` }

  // ── Biss ─────────────────────────────────────────────────────────────────
  const bissMatches = matchingIngredients(names, BISS_KEYWORDS, BISS_EXCLUSION_TERMS)
  const biss: BausteinBewertung = bissMatches.length >= 2
    ? {
        rating: 'gut',
        erklaerung: `${displayName(bissMatches[0])} und ${displayName(bissMatches[1])} sorgen für echten Kauaufwand — das aktiviert Sättigungssignale deutlich früher als weiches Essen.`,
      }
    : bissMatches.length === 1
    ? {
        rating: 'mittel',
        erklaerung: `${displayName(bissMatches[0])} liefert Biss, aber ein zweites Element (z.B. Kerne, Nüsse oder Rohkost) würde den Effekt deutlich verstärken.`,
      }
    : {
        rating: 'schwach',
        erklaerung: `Keine knusprigen oder festen Zutaten erkannt. Nüsse, Kerne oder etwas Rohkost würden das Sättigungssignal beim Kauen verbessern.`,
      }

  // ── Volumen ───────────────────────────────────────────────────────────────
  const volumenMatches = matchingIngredients(names, VOLUMEN_KEYWORDS, VOLUMEN_EXCLUSION_TERMS)
  const volumen: BausteinBewertung = volumenMatches.length >= 2
    ? {
        rating: 'gut',
        erklaerung: `${displayName(volumenMatches[0])} und ${displayName(volumenMatches[1])} sind volumenreich — sie füllen den Magen ohne viele Kalorien zu liefern.`,
      }
    : volumenMatches.length === 1
    ? {
        rating: 'mittel',
        erklaerung: `${displayName(volumenMatches[0])} bringt Volumen. Ein zweites wasserreiches Element (z.B. Gurke, Tomaten, Beeren) würde den Füllungseffekt verstärken.`,
      }
    : {
        rating: 'schwach',
        erklaerung: `Wenige wasserreiche Zutaten erkannt. Mehr Gemüse oder Beeren würden das Magenvolumen erhöhen ohne viele Kalorien beizusteuern.`,
      }

  // ── Geschmack ─────────────────────────────────────────────────────────────
  const geschmackMatches = matchingIngredients(names, GESCHMACK_KEYWORDS)
  const geschmack: BausteinBewertung = geschmackMatches.length >= 3
    ? {
        rating: 'gut',
        erklaerung: `Gute Geschmackstiefe durch ${geschmackMatches.slice(0, 3).map(n => displayName(n)).join(', ')}. Fett, Würze und Aromen machen das Gericht wirklich befriedigend.`,
      }
    : geschmackMatches.length >= 1
    ? {
        rating: 'mittel',
        erklaerung: `${geschmackMatches.map(n => displayName(n)).join(', ')} ${geschmackMatches.length === 1 ? 'gibt' : 'geben'} Geschmack. Etwas mehr Säure, Würze oder Fett könnte das Gericht noch befriedigender machen.`,
      }
    : {
        rating: 'schwach',
        erklaerung: `Wenige Geschmacksträger erkannt. Fett (z.B. Öl, Käse, Avocado), Säure oder Gewürze helfen, dass ein Gericht wirklich sättigt — nicht nur kalorisch.`,
      }

  // ── Art of Eating — always nicht_bewertet for recipes ────────────────────
  const art_of_eating: BausteinBewertung = {
    rating: 'nicht_bewertet',
    erklaerung: 'Wie du isst, lässt sich nicht aus den Zutaten ablesen. Langsames Kauen ohne Ablenkung verstärkt das Sättigungsgefühl bei jeder Mahlzeit.',
  }

  // ── Gesamtbewertung (5 ratable pillars, art_of_eating excluded) ───────────
  const ratables = [proteine, ballaststoffe, biss, volumen, geschmack]
  const gutCount = ratables.filter(b => b.rating === 'gut').length
  const gesamtbewertung = gutCount >= 4
    ? 'sehr_saettigend'
    : gutCount >= 2
    ? 'maessig_saettigend'
    : 'wenig_saettigend'

  return {
    bausteine: { geschmack, biss, ballaststoffe, proteine, volumen, art_of_eating },
    gesamtbewertung,
  }
}
