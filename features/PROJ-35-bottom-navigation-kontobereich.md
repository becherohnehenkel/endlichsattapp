# PROJ-35: Bottom-Navigation & Kontobereich-Neuordnung

## Status: Architected
**Created:** 2026-08-30
**Last Updated:** 2026-08-30

## Dependencies
- Requires: PROJ-2 (User Authentication) — Konto-Icon und Sichtbarkeit hängen an Login-Status
- Requires: PROJ-8 (Rezeptbibliothek) — `/ernaehrung` zeigt vorübergehend die bestehende Rezepte-Seite
- Requires: PROJ-13 (Admin-Dashboard) — Admin-Link wandert unter die Konto-Seite
- Requires: PROJ-19 (Gast-Modus) — Sichtbarkeitsregeln für Gäste bleiben unverändert
- Referenziert von: PROJ-36 (Ernährung), PROJ-37 (Analyse-Übersicht), PROJ-38 (Training), PROJ-39 (Check-In), PROJ-40 (Start-Neugliederung) — diese bauen auf den hier neu geschaffenen Routen auf

## User Stories
- Als eingeloggter Nutzer möchte ich über eine Navigation mit fünf klaren Hauptbereichen (Start, Ernährung, Analyse, Training, Check-In) navigieren, damit ich schnell zum gewünschten Bereich gelange.
- Als Nutzer (Desktop wie Mobile) möchte ich mein Konto jederzeit über ein Icon oben rechts erreichen, unabhängig von der Seite, auf der ich mich befinde.
- Als Admin-Nutzer möchte ich den Admin-Bereich über die Konto-Seite erreichen, statt ein eigenes Icon in der Hauptnavigation zu belegen.
- Als Gast (PROJ-19) möchte ich alle Nav-Tabs normal sehen und bei Konto/Historie zum bestehenden Conversion-Screen geleitet werden, wie bisher.
- Als Nutzer, der auf „Training" oder „Check-In" tippt, möchte ich eine erkennbare, bewusst leere Seite sehen statt eines 404-Fehlers.

## Out of Scope
- Inhalt der Ernährungs-Übersicht — deferred to PROJ-36
- Inhalt der Analyse-Übersicht (inkl. Historie-Einbindung) — deferred to PROJ-37
- Inhalt von Training — deferred to PROJ-38
- Inhalt von Check-In — deferred to PROJ-39
- Neugliederung der Start-Seite — deferred to PROJ-40
- `/historie` ist nach diesem Deploy übergangsweise nicht mehr direkt über die Navigation erreichbar (nur per URL), bis PROJ-37 sie in die Analyse-Übersicht einbindet

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Navigationsstruktur
- [ ] Angenommen ein eingeloggter Nutzer öffnet die App auf Mobile, dann zeigt die untere Leiste genau fünf Items in dieser Reihenfolge: Start, Ernährung, Analyse, Training, Check-In — ohne Konto oder Admin.
- [ ] Angenommen ein eingeloggter Nutzer öffnet die App auf Desktop, dann zeigt die obere Leiste dieselben fünf Items plus ein Konto-Icon rechtsbündig, getrennt vom Item-Loop.
- [ ] Angenommen ein Nutzer befindet sich auf einer der fünf Hauptseiten, dann ist das zugehörige Nav-Item visuell als aktiv hervorgehoben (Farbe/Fettung wie im bestehenden Muster).

### Konto & Admin
- [ ] Angenommen ein eingeloggter Nutzer öffnet die App auf Mobile, dann erscheint zusätzlich eine schmale obere Leiste mit Logo links und Konto-Icon rechts, unabhängig von der unteren Navigation.
- [ ] Angenommen ein Admin-Nutzer öffnet die Konto-Seite, dann sieht er dort zusätzlich einen „Admin"-Eintrag; Nicht-Admins sehen ihn nicht.
- [ ] Angenommen ein Nicht-Admin ruft `/admin` direkt per URL auf, dann sieht er weiterhin die bestehende 403-Seite (unverändert).

### Neue Routen
- [ ] Angenommen ein Nutzer tippt auf „Ernährung", dann landet er auf `/ernaehrung`, was vorübergehend 1:1 die bestehende Rezepte-Seite anzeigt (Alias, bis PROJ-36 die echte Übersicht liefert).
- [ ] Angenommen ein Nutzer tippt auf „Analyse", dann landet er unverändert auf der heutigen `/analyse`-Seite (bis PROJ-37 die Übersicht liefert).
- [ ] Angenommen ein Nutzer tippt auf „Training" oder „Check-In", dann landet er auf `/training` bzw. `/check-in` mit einer minimalen, bewusst leeren Seite („Bald verfügbar") statt einem Fehler.

### Gast-Modus
- [ ] Angenommen ein Gast (anonyme Session) navigiert durch die App, dann sind alle fünf Tabs plus Konto-Icon sichtbar und antippbar; Tippen auf Konto führt wie bisher zum Conversion-Screen.
- [ ] Angenommen ein Gast tippt auf „Training" oder „Check-In", dann sieht er die normale leere Platzhalterseite ohne Conversion-Screen (nicht kontobezogen).

## Edge Cases
- Direkter Aufruf von `/admin` durch Nicht-Admin: bestehende 403-Seite bleibt unverändert.
- Fenstergröße wechselt zwischen Mobile/Desktop-Breakpoint: beide Leisten blenden sich unabhängig per bestehendem Tailwind-`md:`-Muster ein/aus, kein Reload nötig.
- Netzwerkfehler beim Laden von `/ernaehrung` (Alias auf `/rezepte`): verhält sich exakt wie ein Fehler auf `/rezepte` selbst.
- Nicht eingeloggter Nutzer (kein Gast, keine Session): Navigation bleibt wie bisher komplett ausgeblendet (`shouldHideNav` greift weiterhin über `isLoggedIn`).

## Technical Requirements (optional)
- Icons aus `lucide-react`, konsistent mit bestehendem Set: Training = `Dumbbell`, Check-In = `ClipboardCheck`.
- Mobile Top-Bar respektiert `env(safe-area-inset-top)` analog zur bestehenden `env(safe-area-inset-bottom)`-Handhabung in der Bottom-Nav.

## Open Questions
- [x] Icon-Wahl für Training und Check-In — bestätigt: `Dumbbell` / `ClipboardCheck`.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Top-Nav bleibt Desktop-only, Bottom-Nav bleibt Mobile-only; beide teilen dieselbe Item-Liste | Bestehendes Muster im Code beibehalten, keine Divergenz einführen | 2026-08-30 |
| Mobile bekommt zusätzliche schmale Top-Leiste nur für Logo + Konto | Einzige Möglichkeit, „Konto immer oben rechts" auch auf Mobile umzusetzen, ohne die Bottom-Nav zu überladen | 2026-08-30 |
| Admin-Link wandert unter die Konto-Seite statt eigenes Icon | Nur für Admins relevant, verdient keinen eigenen Nav-Slot | 2026-08-30 |
| `/ernaehrung`, `/training`, `/check-in` als echte (Platzhalter-)Routen statt inaktive/ausgegraute Icons | Verhindert 404, hält Nav sofort vollständig funktionsfähig, auch bevor Folge-Specs (PROJ-36–39) gebaut sind | 2026-08-30 |
| `/historie` übergangsweise ohne Nav-Zugriff (nur URL) | Historie wird erst in PROJ-37 in die Analyse-Übersicht eingebettet; bewusst akzeptierte kurze Übergangslücke, da Folge-Spec direkt danach ansteht | 2026-08-30 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| `/ernaehrung` als eigene Seite mit demselben Inhalt wie `/rezepte`, statt HTTP-Redirect | Ein Redirect würde die URL zurück auf `/rezepte` springen lassen und die aktive Nav-Markierung brechen; eine eigene Seite hält URL und Nav-Status konsistent und lässt sich in PROJ-36 einfach mit echtem Inhalt austauschen | 2026-08-30 |
| Konto-Icon als eigene, wiederverwendbare Komponente (genutzt von Desktop-TopBar und neuer Mobile-Leiste) | Login-/Gast-Verhalten (Conversion-Screen für Gäste) soll nur an einer Stelle im Code existieren, nicht dupliziert werden | 2026-08-30 |
| `/training` und `/check-in` ohne Zugriffsbeschränkung in der Middleware | Keine sensiblen Daten auf den Platzhalterseiten; konsistent mit Spec-Vorgabe, dass Gäste alle Tabs uneingeschränkt sehen | 2026-08-30 |
| Kein Backend/API-Bedarf für dieses Feature | Reine Oberflächen- und Routing-Änderung, keine neuen Daten | 2026-08-30 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Component-Struktur
```
NavigationShell (bestehend, angepasst)
├── TopBar (nur Desktop, bestehend, angepasst)
│   ├── Logo
│   ├── 5 Nav-Items (Start, Ernährung, Analyse, Training, Check-In)
│   └── Konto-Icon (NEU: aus der Item-Liste rausgelöst, rechtsbündig)
├── MobileAccountBar (NEU, nur Mobile)
│   ├── Logo
│   └── Konto-Icon
└── BottomNav (nur Mobile, bestehend, angepasst)
    └── 5 Nav-Items (Start, Ernährung, Analyse, Training, Check-In)

Konto-Seite (bestehend, angepasst)
└── Admin-Eintrag (NEU: nur sichtbar wenn isAdmin)

Neue Seiten
├── /ernaehrung  — zeigt (vorerst) denselben Inhalt wie /rezepte
├── /training    — leere Platzhalterseite
└── /check-in    — leere Platzhalterseite
```

### Datenmodell
Keine neuen Datenbank-Tabellen oder -Felder. Liest ausschließlich bereits vorhandene Login-/Admin-Informationen.

### Backend-Bedarf
Keiner — reines Frontend-/Routing-Feature.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
