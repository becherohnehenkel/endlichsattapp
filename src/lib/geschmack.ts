// PROJ-33: Geschmacks-Score — geteilte Bewertungslogik (Domain-Regeln aus
// docs/geschmacks-score-prompt.md) zwischen dem gemeinsamen Analyse-Aufruf
// (src/app/api/analyse/confirm/route.ts, dort direkt in den Sättigungs-Prompt eingebettet)
// und den eigenständigen "Nochmal prüfen"/Rezept-Aufrufen hier. Die Regel-Prosa lebt nur
// einmal in GESCHMACK_PROMPT_RULES, damit beide Prompts nicht auseinanderdriften.

import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

export type GeschmackLabel = 'fad' | 'okay' | 'lecker' | 'richtig_gut'

export interface GeschmackResult {
  score: number
  label: GeschmackLabel
  verbesserungen: string[]
  unklarHinweis: string | null
}

export type GeschmackState =
  | ({ status: 'ok' } & GeschmackResult)
  | { status: 'error' }

// Label wird bewusst serverseitig aus dem Score abgeleitet statt Claude zu vertrauen (analog
// zur bestehenden "Nährwerte werden vom System berechnet"-Philosophie) — verhindert
// Inkonsistenzen wie score:72 mit label:"fad".
export function geschmackLabelFromScore(score: number): GeschmackLabel {
  if (score >= 85) return 'richtig_gut'
  if (score >= 70) return 'lecker'
  if (score >= 50) return 'okay'
  return 'fad'
}

export const GESCHMACK_PROMPT_RULES = `Bewerte zusätzlich, unabhängig von der Sättigung, wie ausgewogen das Gericht geschmacklich ist. Das Modell ist NICHT additiv über alle Komponenten — mehr Komponenten sind nicht automatisch leckerer. Bewertet wird Balance in der Basis plus Kontrast.

Basis (max. 60 Punkte, aus den Zutaten ableiten, nicht nur aus der Beschreibung):
- Salz (15P): gesalzene Zutaten, Käse, Sojasauce, Brühe, Wurst, Oliven, Feta …
- Fett (15P): Öl, Butter, Nüsse, Samen, Avocado, fetter Fisch, Käse, Sahne. <5g Fett gesamt = fehlt, 5–10g = schwach.
- Säure (15P): Zitrone/Limette, Essig, Tomaten, fermentiert (Joghurt, Sauerkraut, Kimchi), Wein, Senf, saure Früchte.
- Umami (15P): Tomatenmark, Pilze, gereifter Käse, Fleisch/Fisch, Sojasauce, Miso, geröstete Zwiebeln, Hefeflocken, Brühe.

Interaktionsregeln: Viel Umami (≥2 starke Quellen) → schwaches Salz zählt als vorhanden. Viel Fett (≥20g) → fehlende Säure kostet 5 Zusatzpunkte und wird IMMER als erster Verbesserungsvorschlag genannt. Süß als dominante Richtung (Frühstück/Bowl/Dessert) → Umami entfällt, Säure zählt doppelt.
Harte Regel: Fehlt eine Basis-Komponente komplett (nicht nur "unklar") → Gesamtscore auf max. 69 gedeckelt, unabhängig vom Rest.

Kontrast (max. 30 Punkte): mindestens ein Paar aus Textur (knusprig/bissfest auf weich/cremig), Temperatur (kalt auf warm) oder Süß-Salzig. Erstes vorhandenes Paar = 20P, jedes weitere = 5P (max. 30). Kein Paar = 0P, Kontrast wird dann zweiter Pflicht-Verbesserungsvorschlag.

Akzente (max. 10 Punkte, optional, NIE ein Mangel): Scharf, Bitter, Frische/Geruch — je 5P, gedeckelt bei 10. Fehlende Akzente NIEMALS als Mangel nennen, außer das Gericht ist komplett eindimensional (Basis + Kontrast beide schwach).

Umgang mit Unsicherheit: Wenn Säure/Temperatur/Salzmenge/Geruch nicht sicher aus den Zutaten ableitbar sind, mit halber Punktzahl für diese Komponente rechnen und in "unklar_hinweis" kurz und konkret erwähnen (z.B. "Hast du Zitrone drüber? Das würde den Score noch verbessern."). Max. 1 Satz, löst NIE eine Rückfrage aus — nur ein Hinweistext im Ergebnis.

Verbesserungsvorschläge: max. 2, additiv formuliert (was FEHLT bzw. was man DRAUF tun kann), NIE restriktiv, NIE moralisch, NIE die Wörter "gesund"/"ungesund". Reihenfolge: fehlende Basis zuerst, dann Kontrast. Score ≥ 85 → leeres Array (nur Bestätigung nötig, übernimmt das Frontend).`

export const GESCHMACK_JSON_FIELD = `"geschmack": {"score": 0-100, "verbesserungen": ["max. 2 additive Vorschläge, leer wenn score >= 85"], "unklar_hinweis": "kurzer Hinweis oder null"}`

const geschmackClaudeSchema = z.object({
  score: z.number().min(0).max(100),
  verbesserungen: z.array(z.string()).max(2),
  unklar_hinweis: z.string().nullable().optional(),
})

/** Validiert ein bereits vom Client geparstes Geschmack-JSON-Fragment (z.B. aus der Antwort
 *  des gemeinsamen Sättigungs-Aufrufs in confirm/route.ts). Gibt bei fehlendem/ungültigem
 *  Fragment `{ status: 'error' }` zurück — nie einen Wurf, damit der Rest der Analyse
 *  (Sättigung bzw. Rezept-Speichern) davon unberührt bleibt (Graceful Degradation, siehe
 *  PROJ-33 Decision Log). */
export function parseGeschmackFragment(raw: unknown): GeschmackState {
  const parsed = geschmackClaudeSchema.safeParse(raw)
  if (!parsed.success) return { status: 'error' }
  const { score, verbesserungen, unklar_hinweis } = parsed.data
  return {
    status: 'ok',
    score: Math.round(score),
    label: geschmackLabelFromScore(score),
    verbesserungen,
    unklarHinweis: unklar_hinweis ?? null,
  }
}

const STANDALONE_SYSTEM_PROMPT = `Du bist der Geschmacks-Assistent von Mehralsabnehmen. Du bewertest, wie ausgewogen ein Gericht geschmacklich ist — unabhängig von Sättigung oder Kalorien. Locker, direkt, nie Ernährungsberater-Sprech, nie die Wörter "gesund"/"ungesund".

${GESCHMACK_PROMPT_RULES}

Antworte AUSSCHLIESSLICH mit gültigem JSON ohne Text davor oder danach, in genau dieser Form:
{ ${GESCHMACK_JSON_FIELD} }`

/** Eigenständiger, schlanker Geschmack-Aufruf — für "Nochmal prüfen" (Mahlzeit + Rezept) und
 *  für die Rezept-Erstberechnung beim Speichern. Nutzt nur Zutaten (+ optional Anleitung),
 *  kein Foto (siehe PROJ-33 Decision Log: "Rezept-Input: Nur Zutaten + Anleitung, Foto
 *  optional" — dieselbe Vereinfachung gilt konsistent auch für den Mahlzeit-Retry-Pfad). */
export async function computeGeschmack(input: {
  zutatenliste: { name: string; amount: string }[]
  anleitung?: string | null
}): Promise<GeschmackState> {
  const zutatenBlock = input.zutatenliste.map(z => `- ${z.name}: ${z.amount}`).join('\n')
  const userMessage = [
    'Zutaten:',
    zutatenBlock,
    ...(input.anleitung ? ['', 'Zubereitung:', input.anleitung] : []),
  ].join('\n')

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: STANDALONE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })
    const block = response.content[0]
    if (block.type !== 'text') return { status: 'error' }
    const cleaned = block.text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '')
    const raw = JSON.parse(cleaned)
    return parseGeschmackFragment(raw.geschmack ?? raw)
  } catch {
    return { status: 'error' }
  }
}
