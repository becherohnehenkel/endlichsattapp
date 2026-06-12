# PROJ-1: Supabase Infrastructure Setup

## Status: Deployed
**Created:** 2026-06-10
**Last Updated:** 2026-06-12
**Deployed:** 2026-06-12 — https://endlichsattapp.vercel.app

## Implementation Notes
- `src/lib/supabase/client.ts` — Browser-Client (createBrowserClient via @supabase/ssr)
- `src/lib/supabase/server.ts` — Server-Client mit Cookie-Handling für App Router
- `src/lib/supabase/admin.ts` — Service-Role-Client (nur serverseitig, umgeht RLS)
- `middleware.ts` — Session-Refresh + Route-Protection (/analyse, /historie geschützt)
- `src/types/database.ts` — Auto-generierte TypeScript-Typen aus Supabase Schema
- `src/lib/env.ts` — Startup-Validierung der Umgebungsvariablen
- Datenbank-Migrationen angewendet: `profiles`, `meals`, `meal_analyses` + RLS + Trigger
- Storage-Bucket `meal-photos` erstellt (privat, 1 MB Limit, nur authentifizierte Pfade)
- Alter Placeholder `src/lib/supabase.ts` gelöscht

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
- **Foto-Komprimierung:** Vollbild vor Upload client-seitig komprimiert (max. 1 MB, max. 1200px Breite) für die KI-Analyse; zusätzlich Thumbnail (~50px) generiert und dauerhaft gespeichert — Details in `/architecture`
- **Vollbild-Löschung:** Vollbild wird nach abgeschlossener KI-Analyse automatisch gelöscht; nur das Thumbnail bleibt im Storage
- **Typsicherheit:** Supabase TypeScript-Typen werden aus dem Schema generiert (`supabase gen types`)

## Datenbankschema (Entwurf)

| Tabelle | Felder | Beschreibung |
|---------|--------|--------------|
| `profiles` | id (FK auth.users), name, email, created_at | Erweitertes Nutzerprofil, automatisch bei Registrierung angelegt |
| `meals` | id, user_id (FK), photo_storage_path (nullable), free_text (nullable), created_at | Eine Mahlzeiteingabe (Foto oder Text oder beides) |
| `meal_analyses` | id, meal_id (FK), refined_ingredients (JSONB), macros (JSONB), satiety_scores (JSONB), improvement (JSONB), created_at | KI-Analyse-Ergebnis zu einer Mahlzeit |

> Detaillierte Spalten, Constraints und Indizes werden in `/architecture` definiert.

## Open Questions
- [x] Wird ein kostenpflichtiger Supabase-Plan benötigt (Pro), oder reicht der Free-Tier für den MVP-Launch? → Free-Tier reicht für den MVP.
- [x] Sollen Mahlzeitenfotos nach einer bestimmten Zeit automatisch gelöscht werden? → Vollbild wird direkt nach abgeschlossener KI-Analyse gelöscht. Ein Thumbnail (~50px, <15 KB) wird dauerhaft gespeichert für die visuelle Wiedererkennung in der Historie.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| EU-Region Frankfurt (eu-central-1) | App richtet sich an deutsche Nutzer; DSGVO-Konformität vereinfacht | 2026-06-10 |
| Vollbild nach Analyse löschen, Thumbnail dauerhaft | Vollbild nur für KI-Analyse nötig; Thumbnail (<15 KB) reicht für Tagebuch-Ansicht; Free-Tier bleibt damit ausreichend | 2026-06-10 |
| Kein erweitertes Nutzerprofil im MVP | App lernt Nutzer durch Mahlzeit-Historie kennen, nicht durch manuelle Eingaben | 2026-06-10 |
| Foto-Komprimierung client-seitig | Storage-Kosten minimieren; max. 1 MB pro Bild | 2026-06-10 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| `@supabase/ssr` zusätzlich zu `@supabase/supabase-js` | Next.js App Router braucht separaten SSR-Client für Session-Cookie-Handling in Server Components — Standard-Client allein reicht nicht | 2026-06-10 |
| Zwei Supabase-Clients (browser + server) | Browser-Client mit Anon Key für React-Komponenten; Server-Client mit Session-Cookie für Server Components und API Routes — strikte Trennung von öffentlichen und serverseitigen Operationen | 2026-06-10 |
| Status-Feld auf `meals`-Tabelle (`pending/analysing/completed/failed`) | Frontend braucht einen zuverlässigen Zustand um Lade-States zu zeigen; besser als zu prüfen ob `meal_analyses`-Eintrag existiert | 2026-06-10 |
| Storage-Pfade als `[user_id]/fullsize/[meal_id]` und `[user_id]/thumbnails/[meal_id]` | Nutzer-ID als Ordner-Prefix ermöglicht einfache RLS-Policy ("nur eigene Pfade"); klare Trennung von temporären und dauerhaften Dateien | 2026-06-10 |
| Foto-Komprimierung und Thumbnail-Generierung im Browser (client-seitig) | Reduziert Upload-Größe und Storage-Kosten bevor Daten den Server erreichen; kein Server-Round-Trip für Bildverarbeitung nötig | 2026-06-10 |
| `meal_analyses` als JSON-Blöcke (JSONB) statt einzelner Spalten | Analyse-Output ist komplex und verschachtelt (6 Bausteine, Deltas, Datenquellen pro Zutat); JSONB ist flexibler als 20+ Einzelspalten und trotzdem abfragbar | 2026-06-10 |
| Datenquellen-Nachweis als Feld in `meal_analyses` | Nutzer soll pro Zutat sehen woher der Nährwert kommt (Open Food Facts / USDA / Schätzung) — muss persistiert werden | 2026-06-10 |

---

## Tech Design (Solution Architect)

### System-Übersicht

```
Supabase Projekt (eu-central-1 Frankfurt)
├── Authentication
│   ├── Email/Password Provider
│   └── Trigger → erstellt automatisch einen profiles-Eintrag bei Registrierung
├── Datenbank (PostgreSQL)
│   ├── profiles         ← Nutzerprofil (Name, E-Mail)
│   ├── meals            ← Mahlzeit-Eingaben (Foto-Pfad, Text, Status)
│   └── meal_analyses    ← KI-Analyse-Ergebnisse (Zutaten, Makros, Scores)
│       (alle drei Tabellen mit RLS gesichert)
└── Storage
    └── meal-photos (privater Bucket)
        ├── [user_id]/fullsize/[meal_id]    ← temporär, nach Analyse gelöscht
        └── [user_id]/thumbnails/[meal_id]  ← dauerhaft, <15 KB

Next.js App (src/)
├── lib/supabase/
│   ├── client.ts    ← Browser-Client (für React-Komponenten)
│   └── server.ts    ← Server-Client (für Server Components & API Routes)
├── middleware.ts    ← Session-Refresh bei jedem Request
├── types/
│   └── database.ts  ← automatisch generierte TypeScript-Typen
└── .env.local       ← 3 Umgebungsvariablen (URL, Anon Key, Service Role Key)
```

### Datenmodell

**`profiles`** — automatisch bei Registrierung angelegt
- Nutzer-ID (verknüpft mit Auth-System), Name, E-Mail, Registrierungsdatum

**`meals`** — ein Eintrag pro gestartete Analyse
- ID, Nutzer-ID, Pfad Vollbild (temporär), Pfad Thumbnail (dauerhaft), Freitext (optional)
- **Status**: `pending` → `analysing` → `completed` → `failed`

**`meal_analyses`** — KI-Ergebnis, 1:1 zu einer Mahlzeit
- Verfeinerte Zutatenliste (JSONB), Nährwerte (JSONB), Sättigungs-Scores (JSONB), Verbesserungsvorschläge + Delta (JSONB), Datenquellen pro Zutat (JSONB)

### Sicherheitsmodell (RLS)
Grundregel auf allen Tabellen: **Nutzer sieht nur eigene Daten.**
Storage: Pfade beginnen immer mit `[user_id]/` — RLS-Policy prüft automatisch den Ordner-Prefix.

### Foto-Lebenszyklus
```
Foto ausgewählt → Browser komprimiert (max. 1 MB, 1200px) + Thumbnail (~50px)
→ Beide in Storage hochgeladen
→ KI-Analyse liest Vollbild
→ Analyse abgeschlossen → Vollbild gelöscht, Thumbnail bleibt
```

### Umgebungsvariablen
```
NEXT_PUBLIC_SUPABASE_URL        (öffentlich)
NEXT_PUBLIC_SUPABASE_ANON_KEY   (öffentlich)
SUPABASE_SERVICE_ROLE_KEY       (nur serverseitig — nie im Browser)
```

### Neue Abhängigkeit
- `@supabase/ssr` — Next.js App Router Session-Cookie-Handling

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
