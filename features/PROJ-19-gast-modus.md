# PROJ-19: Gast-Modus (Anonyme Nutzung ohne Account)

## Status: In Progress
**Created:** 2026-07-07
**Last Updated:** 2026-07-07

## Dependencies
- Requires: PROJ-1 (Supabase Infrastructure) — anonyme Auth läuft über Supabase
- Requires: PROJ-2 (User Authentication) — Upgrade-Flow von anonym zu vollem Account
- Requires: PROJ-10 (Foto-Scan-Limit) — Gast-Limit nutzt dieselbe Infrastruktur; Free-Limit wird von 3 auf 5 angehoben
- Requires: PROJ-11 (Paywall) — Paywall greift erst nach Registrierung + Free-Limit-Erschöpfung

## User Stories
- Als Erstbesucher möchte ich die App sofort ausprobieren können, ohne mich registrieren zu müssen, damit ich erst sehe ob sie mir nützt.
- Als Gast möchte ich eine Mahlzeit analysieren und meinen Sättigungs-Score sehen, damit ich den Kern-Nutzen verstehe bevor ich einen Account erstelle.
- Als Gast möchte ich Rezepte durchstöbern und Art of Eating lesen, damit ich den Mehrwert der App erkenne.
- Als Gast, der 5 Foto-Analysen gemacht hat, möchte ich eine klare Einladung sehen mich zu registrieren — und meine bisherigen Analysen nicht verlieren.
- Als Gast, der sich registriert, möchte ich meine bisherigen Gast-Analysen in meiner neuen Historie sehen, damit der Übergang nahtlos ist.

## Out of Scope
- **Wochenrückblick für Gäste** — setzt persistente Historie voraus; bleibt hinter dem Account-Gate
- **Invite-Code-Einlösung für Gäste** — Codes sind an registrierte Accounts gebunden; Gäste werden zum Registrieren aufgefordert
- **Geräte-übergreifende Sync für Gäste** — anonyme Session ist browser-/gerätegebunden; kein Account = keine Cloud-Sync (by design)
- **Proaktive Registrierungs-Banner oder Pop-ups** — nur reaktive Conversion-Prompts, wenn der Gast auf eine Grenze stößt
- **Automatische Löschung alter Gast-Accounts** — Cleanup-Logik für inaktive anonyme Accounts ist ein technisches Wartungsfeature, kein Teil von PROJ-19
- **Gast-Zugang zu Admin-Routes** — `/admin` bleibt vollständig geschützt
- **Passwort-vergessen-Flow für Gäste** — Gäste haben kein Passwort; nur nach Registrierung relevant

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Automatischer Gast-Zugang

- [ ] Angenommen ein Besucher hat keinen Account und keine aktive Session, wenn er die App öffnet, dann kann er `/`, `/rezepte`, `/wie-esse-ich-richtig` ohne Anmeldung aufrufen.
- [ ] Angenommen ein Besucher startet seine erste Analyse (Foto oder Freitext), wenn er `/analyse` aufruft, dann wird im Hintergrund automatisch eine anonyme Supabase-Session erstellt — ohne sichtbare Aktion oder Prompt.
- [ ] Angenommen ein Gast hat eine aktive anonyme Session, wenn er den Browser schließt und auf demselben Gerät zurückkommt, dann ist seine Session noch aktiv und seine bisherigen Analysen sind erhalten.

### Foto-Scan-Limit für Gäste

- [ ] Angenommen ein Gast hat weniger als 5 Foto-Analysen gemacht, wenn er eine neue Foto-Analyse startet, dann läuft die Analyse normal durch.
- [ ] Angenommen ein Gast hat 5 Foto-Analysen erreicht, wenn er eine weitere Foto-Analyse starten möchte, dann erscheint ein Conversion-Prompt: *"Du hast 5 Foto-Analysen als Gast genutzt. Erstelle einen kostenlosen Account — und analysiere weiter."*
- [ ] Angenommen das Foto-Scan-Limit ist erreicht, wenn der Gast den Conversion-Prompt sieht, dann hat er direkt die Möglichkeit sich zu registrieren oder einzuloggen (kein separater Navigations-Schritt nötig).
- [ ] Angenommen ein Gast hat das Foto-Limit erreicht, wenn er stattdessen eine Freitext-Analyse startet, dann ist das weiterhin unbegrenzt möglich.

### Freitext-Analysen für Gäste

- [ ] Angenommen ein Gast nutzt die Freitext-Eingabe, wenn er beliebig viele Freitext-Analysen durchführt, dann gibt es kein Limit — die Analysen laufen durch.

### Navigation & Gast-Konto-Screen

- [ ] Angenommen ein Gast tippt auf den "Konto"-Tab in der Navigation, wenn er die Seite sieht, dann wird ein Conversion-Screen angezeigt mit: Wert-Versprechen ("Sichere deine Analysen, sieh deine Historie, erhalte deinen Wochenrückblick"), Button "Registrieren" und Link "Bereits einen Account? Einloggen".
- [ ] Angenommen ein Gast tippt auf den "Historie"-Tab, wenn er weitergeleitet wird, dann landet er auf dem `/konto`-Conversion-Screen mit kontextueller Nachricht: *"Erstelle einen kostenlosen Account um deine Analyse-Historie zu sehen."*
- [ ] Angenommen ein eingeloggter Nutzer tippt auf den "Konto"-Tab, wenn er die Seite sieht, dann wird die bestehende Konto-Übersicht (PROJ-14) wie bisher angezeigt — keine Änderung für eingeloggte Nutzer.
- [ ] Angenommen ein Gast navigiert durch die App, wenn er die Bottom-Navigation sieht, dann sind alle Tabs sichtbar (kein Ausblenden, kein Lock-Icon).

### Daten-Erhalt bei Registrierung

- [ ] Angenommen ein Gast registriert sich nach einer oder mehreren Analysen, wenn die Registrierung abgeschlossen ist, dann sind alle Gast-Analysen in seiner neuen Historie sichtbar — kein Datenverlust.
- [ ] Angenommen ein Gast loggt sich in einen bestehenden Account ein (statt neu zu registrieren), dann gehen die Gast-Analysen verloren — der bestehende Account-Datenstand bleibt erhalten. (Hinweis: technische Einschränkung von Supabase bei Identity-Merge.)

### Free-User-Limit (Änderung an PROJ-10)

- [ ] Angenommen ein registrierter Free-User hat weniger als 5 Foto-Analysen gemacht, wenn er eine neue startet, dann läuft sie normal durch.
- [ ] Angenommen ein registrierter Free-User erreicht 5 Foto-Analysen, wenn er eine weitere starten möchte, dann erscheint der bestehende Paywall-Screen (PROJ-11) — unverändert.

## Edge Cases

- **Gast löscht Cookies / Browser-Daten:** Anonyme Session geht verloren, Analysen sind nicht mehr zugänglich. Der Gast startet als neuer Gast. Keine Fehlermeldung — normales Verhalten (wie ein neuer Erstbesucher).
- **Gast nutzt anderes Gerät:** Neue anonyme Session, keine Synchronisation. By design — ohne Account kein Cloud-Sync.
- **Gast hat 5 Foto-Analysen gemacht und registriert sich:** Nach Registrierung startet der Free-Quota-Zähler frisch bei 0 (die Gast-Analysen zählen nicht gegen das neue Free-Limit). So hat der Nutzer einen positiven "Upgrade-Effekt".
- **Anonymous Sign-in schlägt fehl (Netzwerkfehler):** `/analyse` zeigt einen Fehler-Toast und verhindert den Start der Analyse. Keine kaputten Daten.
- **Gast versucht Invite-Code einzulösen:** Redirect zum Conversion-Screen mit Nachricht "Erstelle zuerst einen Account um den Einladungscode einzulösen."
- **Gast-Session läuft ab (Supabase Token-Expiry):** Token wird automatisch im Hintergrund refreshed (Standard-Supabase-Verhalten). Kein sichtbarer Effekt für den Nutzer.

## Technical Requirements
- Performance: Anonymous sign-in im Hintergrund < 500ms (kein sichtbares Laden)
- Security: Anonyme User sehen nur eigene Daten (RLS via `user_id` — wie bei regulären Usern)
- Keine neue DB-Tabelle nötig — anonyme User sind reguläre Supabase-User ohne E-Mail

## Open Questions
- [ ] Soll das Foto-Limit von 5 für Free-User (PROJ-10-Änderung) sofort beim Deploy von PROJ-19 live gehen, oder als separater Schritt? → Empfehlung: gleichzeitig, eine Änderung im Codebase.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Nur reaktive Conversion-Prompts, keine proaktiven Banner | Niederschwelliger Einstieg; Nutzer soll App erst erleben, nicht sofort bedrängt werden | 2026-07-07 |
| Freitext-Analysen unbegrenzt für Gäste | Geringere Token-Kosten als Foto; großzügiger Einstieg macht Foto-Feature als Upgrade-Argument spürbarer | 2026-07-07 |
| Foto-Limit auf 5 für Gäste UND Free-User | Konsistente Kommunikation ("5 kostenlose Foto-Analysen"); echter Upgrade-Anreiz ist Persistenz, nicht Scan-Anzahl | 2026-07-07 |
| `/konto`-Tab als Conversion-Screen für Gäste (nicht `/login`) | Nutzt bestehende Navigation; kein separater Onboarding-Screen nötig; einheitlicher Einstiegspunkt | 2026-07-07 |
| Alle Nav-Tabs für Gäste sichtbar (kein Ausblenden) | Zeigt den vollen Funktionsumfang; weckt Neugier; Lock-Icons wirken abschreckend | 2026-07-07 |
| Gast-Analysen bleiben bei Registrierung erhalten | Kritisch für UX: Datenverlust beim Sign-up würde Vertrauen zerstören; Supabase Anonymous Auth macht das möglich | 2026-07-07 |
| Beim Login in bestehenden Account: Gast-Daten gehen verloren | Technische Einschränkung von Supabase Identity-Merge; Aufwand für Edge-Case zu hoch für MVP | 2026-07-07 |
| Gast-Foto-Analysen zählen NICHT gegen neues Free-Limit nach Registrierung | Positiver "Upgrade-Effekt" als Registrierungs-Anreiz; Nutzer fühlt sich belohnt statt bestraft | 2026-07-07 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Supabase Anonymous Auth (`signInAnonymously()`) | Gibt anonymen Usern eine echte `user_id` — alle bestehenden DB-Flows (RLS, Scan-Limit, Analysen) laufen unverändert | 2026-07-07 |
| Anon-Session client-seitig anlegen (`AnonSignInInit`) | `signInAnonymously()` setzt Cookies → muss im Browser laufen; Server-Redirect wäre ein Round-Trip zu viel | 2026-07-07 |
| `/analyse` aus Middleware-Schutz entfernt | Seite muss ohne Session erreichbar sein, damit `AnonSignInInit` greift; Auth-Check passiert im Page-Server-Component | 2026-07-07 |
| `user.is_anonymous` als Typ-Unterscheidung | Supabase-User-Objekt enthält dieses Flag nativ — keine eigene DB-Spalte nötig | 2026-07-07 |
| `TOTAL_PHOTO_SCANS` 3 → 5 (eine Konstante) | PROJ-10-Limit-Erhöhung läuft im gleichen Deploy; Konstante muss mit dem DB-Default in `profiles` übereinstimmen | 2026-07-07 |
| `updateUser({ email, password })` für Upgrade-Flow | Behält dieselbe `user_id` → alle Gast-Analysen automatisch erhalten; `signUp()` würde neuen User anlegen | 2026-07-07 |
| `/konto`-Page doppelt genutzt (Gast + eingeloggt) | Kein separater Screen nötig; `user.is_anonymous` entscheidet clientseitig, welche View gerendert wird | 2026-07-07 |
| Paywall-Check für anonyme User übersprungen | Anonyme User haben kein Abo-Status in `profiles` → `getAccessStatus` würde `hasAccess: false` zurückgeben; Gäste brauchen eigene Logik | 2026-07-07 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponentenbaum

```
Middleware (vereinfacht)
  /analyse → nicht mehr geschützt (Gast darf rein)
  /historie → unauthentizierter Besucher → /konto?reason=historie
  /registrieren → anonyme User dürfen rein (kein Redirect zu /)

/analyse (Page)
  ├─ Kein User: AnonSignInInit (NEU) — ruft signInAnonymously(), dann router.refresh()
  └─ Mit User (anonym oder registriert):
       └─ MahlzeitInput (angepasst)
            ├─ TOTAL_PHOTO_SCANS = 5 (vorher 3)
            └─ scansRemaining === 0 + isAnonymous → GastFotoLimitBlock (inline)
                 ├─ Erklärungstext
                 ├─ Button "Jetzt registrieren" → /registrieren
                 └─ Link "Einloggen" → /login

/konto (Page — dual mode)
  ├─ Kein User oder is_anonymous → GastKontoView (NEU)
  │    ├─ Optionaler Kontext-Banner (reason=historie)
  │    ├─ 3 Wert-Bausteine (Analysen, Historie, Recap)
  │    ├─ Button "Kostenlos registrieren" → /registrieren
  │    └─ Link "Einloggen" → /login
  └─ Registrierter User → KontoView (unverändert)

/registrieren (Page + Form — angepasst)
  ├─ Anonyme User: nicht mehr zu / redirectet
  └─ RegistrierenForm (angepasst)
       ├─ isAnonymous = false → supabase.auth.signUp() (bisheriger Flow)
       └─ isAnonymous = true → supabase.auth.updateUser({ email, password })
            (gleiche user_id → alle Gast-Analysen erhalten)
```

### Neue Dateien
- `src/components/gast-konto-view.tsx` — Conversion-Screen für Gäste
- `src/components/anon-sign-in-init.tsx` — Silent anon sign-in + Skeleton

### Geänderte Dateien
- `middleware.ts` — /analyse nicht mehr geschützt; /historie → /konto?reason=historie für unauthentizierte
- `src/app/konto/page.tsx` — GastKontoView für anon/null user
- `src/app/analyse/page.tsx` — AnonSignInInit für kein User; Paywall-Skip für anon
- `src/app/historie/page.tsx` — anon user → redirect /konto?reason=historie
- `src/app/registrieren/page.tsx` — nur nicht-anonyme User zu / redirectet
- `src/components/registrieren-form.tsx` — updateUser-Upgrade-Pfad für isAnonymousUpgrade
- `src/components/mahlzeit-input.tsx` — TOTAL_PHOTO_SCANS 3→5; isAnonymous-Prop; Conversion-Block

### Neue Packages
Keine — Supabase SDK unterstützt `signInAnonymously()` und `updateUser()` bereits.

## Backend Implementation Notes

### Database Migrations (applied 2026-07-07)

**Migration 1 — `proj19_anon_profiles_support`**
- `profiles.email` changed to nullable (`DROP NOT NULL`)
- `handle_new_user()` trigger updated: `ON CONFLICT (id) DO NOTHING` to handle Supabase's double-fire behaviour for anonymous users
- `decrement_photo_scan()` updated: trial timer only fires when `email IS NOT NULL` — guests see conversion prompt, not trial countdown

**Migration 2 — `proj19_raise_photo_scan_limit_to_5`**
- `profiles.photo_scans_remaining` DEFAULT raised from 3 → 5
- Existing registered users: `SET photo_scans_remaining = LEAST(photo_scans_remaining + 2, 5)` (only email IS NOT NULL users)

**Migration 3 — `proj19_reset_scans_on_anon_upgrade`**
- New function `reset_scans_on_anon_upgrade()`: resets `photo_scans_remaining = 5` and `trial_ends_at = NULL` when `is_anonymous` changes true → false
- New trigger `on_anon_user_upgrade` on `auth.users AFTER UPDATE OF is_anonymous`
- Ensures guests start fresh quota after registering (positive "upgrade effect")

### TypeScript Types (updated 2026-07-07)
- `src/types/database.ts` → `profiles.email` changed to `string | null` in `Row`, `Insert`, and `Update` types

### Manual Setup Required
- **Enable Anonymous Auth in Supabase Dashboard**: Settings → Authentication → Sign In Methods → Enable "Allow anonymous sign-ins" (cannot be done via SQL/API)

## QA Test Results

**QA Datum:** 2026-07-07
**Tester:** QA Engineer (automated + manual)
**Status:** ❌ NOT READY — 3 High Bugs blockieren Deployment

### Übersicht

| Kategorie | Ergebnis |
|-----------|----------|
| Acceptance Criteria | 12/15 ✅, 3 ❌ (High Bugs) |
| E2E Tests | 25/28 ✅ (3 Failures = App-Bugs) |
| Unit Tests | 184/184 ✅ |
| Security Audit | ✅ Bestanden |
| Regression | ✅ Bestanden |

### Bugs

#### 🔴 High — Bug 1: Startseite `/` redirectet unauthentifizierte Besucher zu /login

**Datei:** [src/app/page.tsx](src/app/page.tsx) — Zeile 36
```
if (!session?.user) redirect('/login?redirectTo=/')
```
**Problem:** Neue Besucher, die die App-URL direkt aufrufen, sehen sofort die Login-Seite. Das Kernversprechen von PROJ-19 ("niederschwelliger Einstieg ohne Anmeldung") ist damit für den häufigsten Einstiegspunkt gebrochen.
**Erwartetes Verhalten:** `/` soll für unauthentifizierte Besucher zugänglich sein (AC-1a).
**Schritte:** Cookies löschen → `http://localhost:3000/` aufrufen → landet auf `/login` statt Startseite.
**Fix-Vorschlag:** Redirect-Check entfernen; für `!user`-Fall eine öffentliche Landingpage oder AnonSignInInit rendern.

#### 🔴 High — Bug 2: `/rezepte` redirectet unauthentifizierte Besucher zu /login

**Datei:** [src/app/rezepte/page.tsx](src/app/rezepte/page.tsx) — Zeile 11
```
if (!user) redirect('/login?redirectTo=%2Frezepte')
```
**Problem:** Gäste können Rezepte nicht browsen, obwohl dies laut Spec ohne Account möglich sein soll.
**Erwartetes Verhalten:** `/rezepte` soll für Gäste sichtbar sein (AC-1b).
**Fix-Vorschlag:** Redirect-Check für `!user` entfernen; Paywall-Check für anon user überspringen oder eigene Gast-View zeigen.

#### 🔴 High — Bug 3: `/wie-esse-ich-richtig` redirectet unauthentifizierte Besucher zu /login

**Datei:** [src/app/wie-esse-ich-richtig/page.tsx](src/app/wie-esse-ich-richtig/page.tsx) — Zeile 7
```
if (!user) redirect('/login')
```
**Problem:** Die Art-of-Eating-Inhalte sind für Gäste nicht zugänglich, obwohl die App-Vision Gäste genau über diese Inhalte konvertieren will.
**Erwartetes Verhalten:** `/wie-esse-ich-richtig` soll für Gäste zugänglich sein (AC-1c).
**Fix-Vorschlag:** Redirect-Check für `!user` entfernen; Inhalt ist vollständig statisch, kein Datenbankzugriff nötig.

### Manuell getestete Acceptance Criteria

Folgende ACs wurden manuell verifiziert und konnten nicht vollständig automatisiert werden:

| AC | Ergebnis | Hinweis |
|----|----------|---------|
| AC-2: Anon-Session im Hintergrund | ✅ Pass | `/analyse` ohne Session → Skeleton → signInAnonymously() → MahlzeitInput erscheint |
| AC-3: Session-Persistenz nach Browser-Neustart | ✅ Pass | Supabase-Token in localStorage bleibt erhalten |
| AC-4/5/6: Foto-Limit-Konversionsblock | ✅ Pass (manuell) | Conversion-Block mit "Jetzt registrieren" + "Einloggen" korrekt gerendert |
| AC-7: Freitext unbegrenzt | ✅ Pass | Freitext-Analyse läuft ohne Scan-Decrement |
| AC-14: Daten-Erhalt bei Registrierung | ✅ Pass | updateUser() behält user_id; Gast-Analysen in Historie nach Registrierung sichtbar |
| AC-15: Gast-Daten bei Login verloren | ✅ Dokumentiert | By design — Supabase Identity-Merge Einschränkung; Nutzer informiert |

### Security Audit

| Angriffsvektor | Ergebnis |
|----------------|----------|
| /admin ohne Session | ✅ Gesperrt (401 / Redirect) |
| POST /api/meal ohne Session | ✅ 401 Unauthorized |
| GET /api/recap/wochen ohne Session | ✅ 401 Unauthorized |
| Fremde Analyse-URL | ✅ Kein Datenleck (404 oder Redirect) |
| Anon User sieht nur eigene Daten (RLS) | ✅ Verifiziert — `user_id`-basierte RLS gilt für anon user identisch wie für reguläre User |
| XSS via Mahlzeit-Eingabe | ✅ Kein Risiko — Eingaben durch React escaped |

### E2E Tests

28 Tests in `tests/PROJ-19-gast-modus.spec.ts`:
- **25 passed** — Gast-Konto-Screen, /analyse-Zugang, /konto-Redirect, Nav-Regression, Security, Mobile
- **3 failed** — AC-1a/1b/1c (App-Bugs: /, /rezepte, /wie-esse-ich-richtig nicht für Gäste geöffnet)

### Nicht-getestete Akzeptanzkriterien

- **AC-3 (Session-Persistenz):** Schwer in E2E zu automatisieren; manuell verifiziert
- **AC-7 (Freitext unbegrenzt):** Erfordert echten AI-API-Call; manuell verifiziert
- **AC-14 (Daten-Erhalt):** Erfordert Datenbankzustand nach Registrierung; manuell verifiziert

### Produktionsbereitschaft

**❌ NICHT BEREIT** — 3 High Bugs müssen vor dem Deployment behoben werden:
1. `src/app/page.tsx` — Redirect-Check für unauthentifizierte Besucher entfernen
2. `src/app/rezepte/page.tsx` — Redirect-Check für unauthentifizierte Besucher entfernen
3. `src/app/wie-esse-ich-richtig/page.tsx` — Redirect-Check entfernen

## Deployment
_To be added by /deploy_
