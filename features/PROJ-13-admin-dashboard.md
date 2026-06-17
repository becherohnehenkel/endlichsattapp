# PROJ-13: Admin-Dashboard

## Status: Deployed
**Created:** 2026-06-17
**Last Updated:** 2026-06-17
**Deployed:** 2026-06-17

## Deployment

- **Production:** satt.mehralsabnehmen.de (Vercel, auto-deploy via GitHub push)
- **Neue Routen:** `/admin`, `/admin/codes`, `POST /api/admin/codes`, `DELETE /api/admin/codes/[code]`
- **Keine DB-Migrationen:** Kein neues Schema — bestehende `invite_codes`-Tabelle aus PROJ-12

## Dependencies
- PROJ-1 (Supabase Infrastructure) — Datenbank für Codes und Profile
- PROJ-2 (User Authentication) — Admin-Auth via `ADMIN_EMAIL`-Env-Variable (bestehendes Muster)
- PROJ-8 (Rezeptbibliothek) — bestehende Rezept-Verwaltung unter `/admin/rezepte` wird verlinkt
- PROJ-12 (Invite-Codes) — `invite_codes`-Tabelle und `profiles.invite_code_redeemed_at` müssen existieren

---

## Kontext

Der Admin-Bereich existiert bereits als `/admin/rezepte` (Rezept-Verwaltung aus PROJ-8). Es gibt bisher keine Admin-Startseite — der Einstieg in den Admin-Bereich ist nicht strukturiert. PROJ-13 ergänzt:
1. Eine `/admin`-Startseite mit Navigation zu den Admin-Bereichen
2. Eine `/admin/codes`-Seite für Invite-Code-Verwaltung (generieren, kopieren, löschen)

Zielgruppe: ausschließlich der Product Owner (Solo-Admin) — kein Multi-Admin-Szenario.

---

## User Stories

**US-1:** Als Admin möchte ich eine Startseite unter `/admin` haben, von der aus ich direkt zur Rezept-Verwaltung und zur Code-Verwaltung navigieren kann, damit ich nicht URLs auswendig kennen muss.

**US-2:** Als Admin möchte ich auf `/admin/codes` alle Invite-Codes auf einen Blick sehen — mit Status, Einlöser-E-Mail und Datum — damit ich weiß wer bereits Zugang hat.

**US-3:** Als Admin möchte ich per Knopfdruck einen neuen 8-stelligen Code generieren und ihn direkt kopieren können, damit ich ihn schnell an eine Person weiterschicken kann.

**US-4:** Als Admin möchte ich uneingelöste Codes löschen können (z.B. wenn ein Code an die falsche Person geschickt wurde), damit ich die Kontrolle über die Vergabe behalte.

**US-5:** Als Admin möchte ich auf einen Blick sehen wie viele Codes insgesamt existieren und wie viele davon bereits eingelöst wurden, damit ich den Überblick über meine Beta-Nutzer habe.

---

## Acceptance Criteria

**Admin-Startseite (`/admin`)**
- [ ] Angenommen der Admin ist eingeloggt, wenn er `/admin` aufruft, dann sieht er zwei Navigationskarten: "Rezepte verwalten" (→ `/admin/rezepte`) und "Invite-Codes" (→ `/admin/codes`)
- [ ] Angenommen ein nicht-eingeloggter Nutzer `/admin` aufruft, dann wird er zu `/login` weitergeleitet
- [ ] Angenommen ein eingeloggter Nutzer ohne Admin-Rechte `/admin` aufruft, dann wird er zu `/admin/403` weitergeleitet

**Code-Übersicht (`/admin/codes`)**
- [ ] Angenommen der Admin ruft `/admin/codes` auf, dann sieht er eine Zusammenfassung "X von Y Codes eingelöst" sowie eine Tabelle aller Codes
- [ ] Angenommen Codes existieren, dann zeigt die Tabelle pro Zeile: Code-Text, Status (Verfügbar / Eingelöst), E-Mail des Einlösers (leer wenn noch nicht eingelöst), Datum der Einlösung (leer wenn noch nicht eingelöst)
- [ ] Angenommen noch keine Codes existieren, dann sieht der Admin einen leeren Zustand mit Hinweis "Noch keine Codes — generiere deinen ersten Code."

**Code generieren**
- [ ] Angenommen der Admin klickt auf "Neuen Code generieren", dann erscheint sofort ein neuer 8-stelliger alphanumerischer Code in der Tabelle (kein Seitenwechsel)
- [ ] Angenommen ein neuer Code generiert wurde, dann ist er in der Tabelle als "Verfügbar" markiert und hat einen Copy-Button
- [ ] Angenommen ein Code-Kollision tritt auf (selber Code existiert bereits), dann wird automatisch ein neuer Code generiert ohne Fehlermeldung für den Admin

**Code kopieren**
- [ ] Angenommen ein Code ist in der Tabelle sichtbar, wenn der Admin auf den Copy-Button klickt, dann wird der Code-Text in die Zwischenablage kopiert und der Button zeigt kurz "Kopiert ✓"

**Code löschen**
- [ ] Angenommen ein Code hat Status "Verfügbar" (noch nicht eingelöst), dann hat er einen Löschen-Button
- [ ] Angenommen der Admin klickt auf "Löschen", dann erscheint eine Bestätigung "Code löschen?" bevor der Code entfernt wird
- [ ] Angenommen der Admin bestätigt die Löschung, dann wird der Code aus der Tabelle entfernt
- [ ] Angenommen ein Code hat Status "Eingelöst", dann hat er keinen Löschen-Button (eingelöste Codes sind permanent)

---

## Out of Scope

- Codes per E-Mail direkt aus der App verschicken — Admin kopiert und verschickt manuell
- Codes deaktivieren ohne Löschen (z.B. temporär sperren) — löschen reicht für den Use Case
- Bulk-Generierung mehrerer Codes auf einmal — ein Code pro Klick ist ausreichend für die Beta
- Nutzerverwaltung (Nutzer löschen, Rollen vergeben) — kein Multi-Admin-Szenario
- Metriken/Statistiken über Nutzeraktivität (Anzahl Analysen, Scans etc.) — dafür gibt es die Supabase-Konsole
- Codes mit Ablaufdatum oder Zugangsstufen — PROJ-12-Entscheidung: dauerhafter Vollzugriff, einmalig
- Eingelöste Codes rückgängig machen (Zugang entziehen) — nur über direkte DB-Manipulation möglich
- Rezept-Verwaltung selbst (PROJ-8) — wird nur verlinkt, nicht verändert

---

## Edge Cases

- Admin generiert schnell mehrere Codes hintereinander → jeder Klick erzeugt genau einen Code, kein Doppel-Submit
- Code-Kollision (8 Zeichen, geringe aber reale Wahrscheinlichkeit bei vielen Codes) → serverseitig erneut versuchen, Admin merkt nichts
- Admin kopiert Code und schließt Tab → Code bleibt in der DB, kein Verlust
- Netzwerkfehler beim Generieren → Fehlermeldung, kein Code halbwegs in der DB
- Netzwerkfehler beim Löschen → Fehlermeldung, Code bleibt erhalten
- Admin löscht einen Code den gerade jemand einlöst → Race Condition: wer zuerst, gewinnt (DB-Constraint entscheidet)

---

## Decision Log

### Product Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| `/admin`-Startseite als reine Navigation, keine Metriken | Supabase-Konsole ist für Metriken ausreichend; einfache Implementierung | 2026-06-17 |
| 8 alphanumerische Zeichen (A-Z, a-z, 0-9) gemischt | Größerer Zeichenvorrat als nur Großbuchstaben → mehr Entropie; kurz genug zum Abtippen, Rate-Limit aus PROJ-12 schützt ohnehin gegen Brute-Force | 2026-06-17 |
| Nur uneingelöste Codes löschbar | Eingelöste Codes sind Audit-Trail — wer hatte wann Zugang muss nachvollziehbar bleiben | 2026-06-17 |
| Bestätigungsdialog vor Löschen | Verhindert versehentliches Löschen eines Codes der bereits verschickt aber noch nicht eingelöst wurde | 2026-06-17 |
| Copy-Button statt Auto-Copy nach Generierung | Admin kann viele Codes generieren und später gezielt kopieren | 2026-06-17 |

### Open Questions
- [x] Code-Format: 8 zufällige Zeichen aus `A-Za-z0-9` (Groß/Kleinbuchstaben + Ziffern gemischt), kein Trenner — z.B. `aB3kR7mX`. Entschieden 2026-06-17.
- [x] PROJ-12-Folgeänderung: `.toUpperCase()`-Normalisierung aus `POST /api/invite/redeem` entfernt (fix(PROJ-12)-Commit vom 2026-06-17). Codes sind jetzt case-sensitiv.

---

## Tech Design (Solution Architect)

### Komponentenstruktur

```
/admin  (Server Page — NEU)
+-- Admin-Startseite
    +-- Navigationskarte "Rezepte verwalten" → /admin/rezepte
    +-- Navigationskarte "Invite-Codes" → /admin/codes

/admin/codes  (Server Page — NEU)
+-- Zusammenfassung "X von Y Codes eingelöst"
+-- "Neuen Code generieren"-Button
+-- InviteCodesTable  (Client Component — NEU)
    +-- Tabellenkopf: Code | Status | E-Mail | Datum | Aktionen
    +-- Tabellenzeilen (eine pro Code)
    |   +-- Code-Text (Monospace-Schrift)
    |   +-- Status-Badge ("Verfügbar" / "Eingelöst")
    |   +-- E-Mail des Einlösers (oder — wenn noch nicht eingelöst)
    |   +-- Datum der Einlösung (oder —)
    |   +-- Copy-Button → kurzes "Kopiert ✓"-Feedback
    |   +-- Löschen-Button (nur bei "Verfügbar")
    +-- Lösch-Bestätigungsdialog (shadcn AlertDialog)
    +-- Leer-Zustand: "Noch keine Codes — generiere deinen ersten Code."
```

### Neue API-Routen

| Route | Methode | Zweck |
|-------|---------|-------|
| `POST /api/admin/codes` | NEU | Zufälligen 8-Zeichen-Code generieren und in DB speichern |
| `DELETE /api/admin/codes/[code]` | NEU | Code löschen — nur wenn noch nicht eingelöst |

Bestehende Routen bleiben unverändert. Die Codes-Seite liest Daten beim Page-Load server-seitig (Admin-Client); Mutationen (Generieren/Löschen) passieren über diese neuen Routen.

### Datenmodell

Kein neues Datenbankschema — alle Tabellen existieren bereits:

```
invite_codes (aus PROJ-12):
- code          → Primärschlüssel, wird in der Tabelle angezeigt
- redeemed_by   → UUID des Einlösers (NULL = Verfügbar)
- redeemed_at   → Zeitstempel der Einlösung
- created_at    → Zeitstempel der Erstellung

profiles (aus PROJ-1):
- id            → Verknüpfung mit invite_codes.redeemed_by
- email         → wird als "Eingelöst von"-Information angezeigt
```

Die Codes-Seite liest `invite_codes` mit einem JOIN auf `profiles` um die E-Mail des Einlösers zu ermitteln.

### Wie Generieren und Löschen funktionieren

**Generieren:** Admin klickt "Neuen Code generieren" → Frontend ruft `POST /api/admin/codes` → Server generiert 8 zufällige Zeichen aus `A-Za-z0-9` → prüft auf Kollision (bis zu 3 Versuche) → speichert in DB → Frontend aktualisiert die Liste (Next.js `router.refresh()`).

**Löschen:** Admin klickt "Löschen" → AlertDialog erscheint → Admin bestätigt → `DELETE /api/admin/codes/[code]` → Server prüft ob `redeemed_by IS NULL` → löscht → Liste wird aktualisiert. Falls Code inzwischen eingelöst wurde: Fehlermeldung "Code wurde bereits eingelöst und kann nicht mehr gelöscht werden."

### Tech-Entscheidungen

| Entscheidung | Begründung | Datum |
|---|---|---|
| Server Page für initialen Load, Client Component `InviteCodesTable` für Interaktionen | Codes werden server-seitig geladen (kein Client-State beim ersten Render); Interactive Teile (Copy-Feedback, Dialog) brauchen Client-Code | 2026-06-17 |
| `router.refresh()` nach Mutationen statt eigenem Client-State | Next.js lädt die Server Page neu → immer frische Daten ohne doppelte State-Verwaltung; passt zum bestehenden Muster im Admin-Bereich | 2026-06-17 |
| Admin-Client für alle Code-Operationen (kein direkter Supabase-Browser-Zugriff) | `invite_codes`-Tabelle hat keine RLS-Policies — nur Admin-Client darf schreiben/löschen; gleiche Sicherheitsarchitektur wie PROJ-12 | 2026-06-17 |
| shadcn `AlertDialog` für Lösch-Bestätigung | Bereits installiert; blockierender Modal ist das richtige UX-Pattern für destruktive Aktionen | 2026-06-17 |
| shadcn `Table` + `Badge` für die Code-Übersicht | Beide bereits installiert; keine neuen Abhängigkeiten nötig | 2026-06-17 |

### Neue Abhängigkeiten

Keine — alle benötigten shadcn-Komponenten (Table, Badge, AlertDialog, Button) sind bereits installiert.

---

## QA Test Results

**Datum:** 2026-06-17
**Tester:** QA Engineer (automatisiert)
**Status: APPROVED — Production-Ready**

### Unit Tests (`npm test`)

11 Tests in 2 Dateien — alle grün:

| Datei | Tests | Ergebnis |
|---|---|---|
| `src/app/api/admin/codes/route.test.ts` | 5 | ✅ alle bestanden |
| `src/app/api/admin/codes/[code]/route.test.ts` | 6 | ✅ alle bestanden |

Abgedeckte Szenarien: 403 unauthenticated, 403 non-admin, Code-Generierung (success), Kollision-Retry, erschöpfte Versuche → 500, Delete success, Delete 409 (already redeemed), Delete 404 (not found).

### E2E Tests (`npm run test:e2e`)

26 Tests (13 Chromium + 13 Mobile Chrome) — alle grün:

| Kategorie | Tests | Ergebnis |
|---|---|---|
| Zugriffskontrolle `/admin` | 4 | ✅ |
| Zugriffskontrolle `/admin/codes` | 4 | ✅ |
| API Security POST /api/admin/codes | 4 | ✅ |
| API Security DELETE /api/admin/codes/[code] | 4 | ✅ |
| Admin-Startseite Navigation | 2 | ✅ |
| Codes-Seite: Leer-Zustand | 2 | ✅ |
| Codes-Seite: Tabelle mit Daten | 2 | ✅ |
| Code generieren (API-Aufruf) | 2 | ✅ |
| Responsive (403-Seite Mobile) | 2 | ✅ |

### Acceptance Criteria

| Kriterium | Status |
|---|---|
| `/admin` Navigation (2 Karten) | ✅ |
| Unauthenticated → `/login` | ✅ |
| Nicht-Admin → `/admin/403` | ✅ |
| Übersicht "X von Y Codes eingelöst" | ✅ manuell verifiziert |
| Tabelle: Code, Status, E-Mail, Datum | ✅ manuell verifiziert |
| Leer-Zustand | ✅ |
| Code generieren → erscheint in Tabelle | ✅ manuell + E2E |
| Copy-Button "Kopiert ✓"-Feedback | ✅ manuell verifiziert |
| Löschen nur bei Verfügbar | ✅ manuell + Unit-Test 409 |
| Bestätigungsdialog vor Löschen | ✅ manuell verifiziert |
| Kollision-Retry (kein Admin-Fehler) | ✅ Unit-Test |
| API-Security (403 für Nicht-Admin) | ✅ E2E |

### Security Audit

- Admin-Check via `ADMIN_EMAIL` env var — konsistent in beiden Routen implementiert ✅
- Admin-Client umgeht RLS bewusst (korrekt für Admin-Use-Case) ✅
- Kein Nutzer-Input außer URL-Parameter `[code]` — keine SQL-Injection möglich (Supabase parameterisiert) ✅
- Delete-Route prüft `redeemed_by IS NULL` serverseitig — kein Client-seitiger Bypass möglich ✅

### Bugs gefunden

Keine Critical, High oder Medium Bugs.

**Production-Ready: JA**
