import { z } from 'zod'

// Grobzügige Obergrenze für den Snapshot-Payload — legitime Analyse-Daten (Zutatenliste,
// 6 Bausteine, Nährwerte, Vorschläge) bleiben weit darunter, verhindert aber Missbrauch
// durch übermäßig große, künstlich aufgeblähte Payloads.
const MAX_SNAPSHOT_BYTES = 20_000

export const FeedbackSchema = z.object({
  message: z.string().trim().min(1, 'Nachricht darf nicht leer sein').max(500, 'Maximal 500 Zeichen'),
  pageType: z.enum(['mahlzeit_analyse', 'mahlzeit_historie', 'rezept']),
  referenceId: z.string().uuid('Ungültige Referenz-ID'),
  // Struktur variiert je nach pageType (Mahlzeit- vs. Rezept-Analyse) — bewusst als
  // opaker Datenblock validiert, nicht feldweise (siehe Tech Design PROJ-26).
  snapshot: z.record(z.string(), z.unknown())
    .refine(val => JSON.stringify(val).length <= MAX_SNAPSHOT_BYTES, 'Snapshot zu groß'),
})

export type FeedbackInput = z.infer<typeof FeedbackSchema>
