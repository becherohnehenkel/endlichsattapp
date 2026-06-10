# PROJ-1: Supabase Infrastructure Setup

## Status: Planned
**Created:** 2026-06-10
**Last Updated:** 2026-06-10

## Dependencies
- None

## User Stories
- Als Entwickler möchte ich eine Supabase-Instanz in der EU-Region konfiguriert haben, damit alle Nutzerdaten DSGVO-konform in der EU gespeichert werden.
- Als Entwickler möchte ich eine Datenbankstruktur (Schema + RLS), damit jeder Nutzer ausschließlich auf seine eigenen Daten zugreifen kann.
- Als Entwickler möchte ich einen konfigurierten Supabase Storage Bucket, damit Mahlzeitenfotos effizient und sicher gespeichert werden können.
- Als Nutzer möchte ich sicher sein, dass meine Daten (Fotos, Analysen) nicht für andere Nutzer sichtbar sind.
- Als Entwickler möchte ich typisierte Umgebungsvariablen für die Supabase-Verbindung, damit andere Features darauf aufbauen können ohne Konfigurationsarbeit.

## Out of Scope
- Benutzer-Login und Registrierungsflow — das ist PROJ-2 (User Authentication)
- Erweitertes Nutzerprofil (Gewichtsziel, Allergien, Präferenzen) — deferred to P2
- E-Mail-Templates und Auth-Benachrichtigungen — Teil von PROJ-2
- Backup-Strategie und Disaster Recovery — Post-MVP
- Monitoring und Alerting — Post-MVP

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Datenbankstruktur
- [ ] Angenommen die Infrastruktur ist eingerichtet, wenn ein neuer Nutzer sich registriert, dann wird automatisch ein Eintrag in der `profiles`-Tabelle mit Name und E-Mail angelegt.
- [ ] Angenommen zwei verschiedene Nutzer existieren, wenn Nutzer A versucht auf die Mahlzeiten von Nutzer B zuzugreifen, dann wird der Zugriff durch RLS-Policies verweigert.
- [ ] Angenommen die RLS-Policies sind aktiv, wenn ein eingeloggter Nutzer seine Mahlzeiten abruft, dann erhält er ausschließlich seine eigenen Einträge.

### Storage
- [ ] Angenommen ein Nutzer lädt ein Foto hoch, wenn das Bild im Storage abgelegt wird, dann ist es nur über einen authentifizierten, nutzerspezifischen Pfad erreichbar (kein öffentlicher Direktzugriff).
- [ ] Angenommen der Storage Bucket ist konfiguriert, wenn ein unauthentifizierter Request auf ein Foto zugreift, dann wird der Zugriff verweigert (403).

### Umgebungsvariablen & Verbindung
- [ ] Angenommen die Umgebungsvariablen sind gesetzt, wenn die App startet, dann kann sie sich erfolgreich mit Supabase verbinden (kein Verbindungsfehler im Start-Log).
- [ ] Angenommen die Konfiguration ist vollständig, wenn ein anderer Skill (z.B. `/backend`) auf Supabase zugreift, dann sind `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` sowie `SUPABASE_SERVICE_ROLE_KEY` verfügbar.

### Region & DSGVO
- [ ] Angenommen das Supabase-Projekt ist erstellt, wenn man die Projekteinstellungen prüft, dann ist die Region `eu-central-1` (Frankfurt) konfiguriert.

## Edge Cases
- **Fehlende Umgebungsvariablen:** Wenn `.env.local` unvollständig ist, soll die App beim Start einen klaren Fehler ausgeben — kein stilles Scheitern.
- **RLS deaktiviert:** Kein Feature darf mit deaktiviertem RLS in Produktion gehen — das muss in der Supabase-Konfiguration erzwungen werden.
- **Storage-Bucket öffentlich:** Der Meal-Photos-Bucket muss explizit als privat konfiguriert sein — kein Versehentlich-öffentlich durch falsche Bucket-Policy.
- **Schema-Migration fehlgeschlagen:** Wenn eine Migration nur teilweise durchläuft, muss der Ausgangszustand wiederherstellbar sein (transaktionale Migrations).

## Technical Requirements
- **Region:** `eu-central-1` (Frankfurt) — keine Ausnahme
- **RLS:** Row Level Security auf allen Tabellen mit Nutzerdaten aktiviert
- **Storage:** Private Bucket, Zugriff nur über signierte URLs oder authentifizierte Requests
- **Foto-Komprimierung:** Bilder werden vor dem Upload client-seitig komprimiert (max. 1 MB, max. 1200px Breite) — Details in `/architecture`
- **Typsicherheit:** Supabase TypeScript-Typen werden aus dem Schema generiert (`supabase gen types`)

## Datenbankschema (Entwurf)

| Tabelle | Felder | Beschreibung |
|---------|--------|--------------|
| `profiles` | id (FK auth.users), name, email, created_at | Erweitertes Nutzerprofil, automatisch bei Registrierung angelegt |
| `meals` | id, user_id (FK), photo_storage_path (nullable), free_text (nullable), created_at | Eine Mahlzeiteingabe (Foto oder Text oder beides) |
| `meal_analyses` | id, meal_id (FK), refined_ingredients (JSONB), macros (JSONB), satiety_scores (JSONB), improvement (JSONB), created_at | KI-Analyse-Ergebnis zu einer Mahlzeit |

> Detaillierte Spalten, Constraints und Indizes werden in `/architecture` definiert.

## Open Questions
- [ ] Wird ein kostenpflichtiger Supabase-Plan benötigt (Pro), oder reicht der Free-Tier für den MVP-Launch?
- [ ] Sollen Mahlzeitenfotos nach einer bestimmten Zeit automatisch gelöscht werden (Storage-Cost-Management)?

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| EU-Region Frankfurt (eu-central-1) | App richtet sich an deutsche Nutzer; DSGVO-Konformität vereinfacht | 2026-06-10 |
| Fotos dauerhaft speichern | Grundlage für visuelles Tagebuch-Feature (PROJ-7) | 2026-06-10 |
| Kein erweitertes Nutzerprofil im MVP | App lernt Nutzer durch Mahlzeit-Historie kennen, nicht durch manuelle Eingaben | 2026-06-10 |
| Foto-Komprimierung client-seitig | Storage-Kosten minimieren; max. 1 MB pro Bild | 2026-06-10 |

### Technical Decisions
<!-- Added by /architecture -->

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
