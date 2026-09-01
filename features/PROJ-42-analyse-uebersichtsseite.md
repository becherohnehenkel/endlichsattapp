# PROJ-42: Analyse-Übersichtsseite

## Status: Planned
**Created:** 2026-09-01
**Last Updated:** 2026-09-01

## Dependencies
- PROJ-2 (User Authentication) — Login-Status steuert, was in Sektion 2/3 sichtbar ist
- PROJ-4 (KI-Analyse-Agent) — liefert die Mahlzeit-Typ-Klassifikation (Mahlzeit/Komponente/Snack), die für die Zähl-Logik in Sektion 2 gebraucht wird
- PROJ-5 (Sättigungs-Einschätzung) — Analyse-Ergebnis, auf das Sektion 1 verlinkt
- PROJ-6 (Mahlzeit-Historie) — Inhalt zieht vollständig in Sektion 3 um, `/historie` als eigene Route entfällt
- PROJ-8 (Rezeptbibliothek) — bestehende Rezept-Vorschlag-Funktion (`RezeptVorschlaege`), auf die der Sektion-1-Text verweist
- PROJ-17 (Wöchentlicher Sättigungs-Recap) — Wochenrecap-Komponente wird in Sektion 3 eingebettet
- PROJ-19 (Gast-Modus) — bestimmt, was Gäste in Sektion 2/3 sehen
- PROJ-35 (Bottom-Navigation) — "Analyse"-Tab zeigt künftig auf diese Seite statt direkt auf den Input-Flow
- PROJ-37 (So geht abnehmen / Kcal-Rechner) — liefert `profiles.kcal_ziel` für die optionale kcal-Anzeige in Sektion 2

## User Stories
- Als eingeloggter Nutzer möchte ich beim Öffnen von "Analyse" zuerst eine Übersicht sehen, damit ich entscheiden kann, ob ich eine neue Mahlzeit analysiere, meinen heutigen Fortschritt checke oder in meiner Historie stöbere — statt direkt in den Analyse-Flow geworfen zu werden.
- Als Nutzer möchte ich auf einen Blick sehen, wie viele Mahlzeiten ich heute schon analysiert habe und wie viele noch offen sind, damit ich meinen Tag grob im Blick behalte, ohne mich mit Kalorien beschäftigen zu müssen.
- Als Nutzer, der es genauer wissen will, möchte ich optional sehen können, wie viele Kalorien mir laut meinem berechneten Ziel heute noch offenstehen.
- Als Nutzer möchte ich eine kurze Analyse der letzten Tage sehen — was ich gegessen habe, was meine Favoriten sind und wo ich noch nachbessern kann — damit ich Muster in meiner Ernährung erkenne.
- Als Gast (ohne Login) möchte ich weiterhin eine neue Mahlzeit analysieren können, aber verstehen, dass ich mich anmelden muss, um Tagesfortschritt und Historie zu sehen.

## Out of Scope
- Tatsächliche Trainingseinheiten- und Check-In-Funktionalität (Erfassung, Speicherung, Analyse) — nur der Platzhalter-Tab und die strukturelle Vorbereitung sind Teil dieser Spec; die eigentlichen Features bekommen eigene, spätere PROJ-IDs.
- Echtes "Favorit markieren"-Feature für Rezepte/Mahlzeiten — "Favoriten" im Sektion-3-Text meint die bestehende PROJ-17-Zutaten-Häufigkeitsanalyse, kein neues Speichern-Feature.
- Aktives Kalorien-Tracking mit Erinnerungen/Warnungen — die optionale kcal-Restanzeige ist eine rein passive, standardmäßig ausgeblendete Anzeige (siehe Decision Log), kein aktives Tracking-System.
- Änderungen an der Berechnung von `kcal_ziel` selbst — wird unverändert aus PROJ-37 übernommen.
- Mahlzeiten-pro-Tag-Einstellung für Gäste — nur für eingeloggte Nutzer verfügbar (liegt in `profiles`).
- Kalender-/Filteransicht der Historie, Suche, Export — bleiben laut PROJ-6 Out-of-Scope, werden hier nicht nachgerüstet.
- Startseiten-Restrukturierung über das Entfernen des "Mahlzeit analysieren"-Buttons hinaus — größere Homepage-Änderungen bleiben einem separaten Feature vorbehalten.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Seitenstruktur & Routing
- [ ] Angenommen ein Nutzer (eingeloggt oder Gast) navigiert über die Bottom-Navigation zu "Analyse", wenn die Seite lädt, dann zeigt `/analyse` die neue Übersichtsseite (nicht mehr direkt den Analyse-Flow)
- [ ] Angenommen ein Nutzer klickt auf die Sektion-1-Karte "Ernährungsanalyse starten", wenn die Karte angeklickt wird, dann navigiert der Nutzer zu `/analyse/start`, wo der bestehende Analyse-Flow (bisher unter `/analyse`) unverändert läuft
- [ ] Angenommen ein Nutzer ruft die alte URL `/historie` direkt auf, wenn die Seite lädt, dann wird er auf `/analyse` weitergeleitet

### Sektion 1 — Ernährungsanalyse starten
- [ ] Angenommen die Übersichtsseite wird angezeigt, wenn sie lädt, dann erscheint als erste Sektion eine Karte mit Überschrift "Ernährungsanalyse starten" und dem vorgegebenen Text, die zu `/analyse/start` verlinkt
- [ ] Angenommen ein Gast (kein Login) besucht die Seite, wenn Sektion 1 angezeigt wird, dann ist sie identisch nutzbar wie für eingeloggte Nutzer (keine Einschränkung)

### Sektion 2 — Tagesübersicht
- [ ] Angenommen ein eingeloggter Nutzer hat heute bereits 2 von 3 (Standard-Ziel) Mahlzeiten vom Typ "Mahlzeit" analysiert, wenn Sektion 2 angezeigt wird, dann zeigt sie "2 von 3 abgeschlossen" (oder gleichwertige Formulierung) sowie "1 Mahlzeit offen"
- [ ] Angenommen ein eingeloggter Nutzer hat in seinem Konto ein individuelles Tagesziel (z. B. 4) eingestellt, wenn Sektion 2 angezeigt wird, dann wird gegen dieses individuelle Ziel gezählt, nicht gegen den Standardwert 3
- [ ] Angenommen ein eingeloggter Nutzer hat heute Komponenten oder Snacks (aber keine vollständige Mahlzeit) analysiert, wenn Sektion 2 angezeigt wird, dann zählen diese Analysen NICHT zum Fortschritt (nur Typ "Mahlzeit" zählt)
- [ ] Angenommen ein eingeloggter Nutzer klickt auf den kcal-Ein-/Ausblend-Button, wenn er zum ersten Mal geklickt wird, dann erscheint die Restkalorien-Anzeige ("noch X kcal übrig heute", berechnet aus `profiles.kcal_ziel` minus Summe der heute analysierten "Mahlzeit"-kcal); ein erneuter Klick blendet sie wieder aus
- [ ] Angenommen ein eingeloggter Nutzer hat noch nie den Kcal-Rechner (PROJ-37) genutzt, wenn er den kcal-Button anklickt, dann erscheint statt einer Zahl ein Hinweis, den Kcal-Rechner unter "So geht abnehmen" zuerst auszufüllen
- [ ] Angenommen ein Gast (kein Login) besucht die Seite, wenn Sektion 2 angezeigt wird, dann erscheint statt der Tagesübersicht eine Login-Hinweis-Karte
- [ ] Angenommen ein eingeloggter Nutzer hat heute noch keine Mahlzeit analysiert, wenn Sektion 2 angezeigt wird, dann zeigt sie "0 von Y abgeschlossen"

### Sektion 3 — Historie der letzten Tage
- [ ] Angenommen die Übersichtsseite wird angezeigt, wenn Sektion 3 lädt, dann erscheinen 3 Kategorie-Tabs: "Analysierte Mahlzeiten" (aktiv/ausgewählt), "Trainingseinheiten" und "Check-Ins" (beide sichtbar, aber deaktiviert mit "Bald verfügbar"-Hinweis)
- [ ] Angenommen der Tab "Analysierte Mahlzeiten" ist aktiv, wenn er angezeigt wird, dann erscheinen darunter der bestehende Wochen-Rückblick (PROJ-17) sowie die chronologische Mahlzeiten-Timeline (PROJ-6), inhaltlich unverändert zur bisherigen `/historie`-Seite
- [ ] Angenommen ein Nutzer klickt auf "Trainingseinheiten" oder "Check-Ins", wenn der Tab angeklickt wird, dann bleibt der Inhaltsbereich auf einem "Bald verfügbar"-Hinweis (kein Fehler, keine Navigation)
- [ ] Angenommen ein Gast (kein Login) besucht die Seite, wenn Sektion 3 angezeigt wird, dann erscheint dieselbe Login-Aufforderung wie bisher bei `/historie` (siehe PROJ-6)
- [ ] Angenommen ein eingeloggter Nutzer hat noch keine Mahlzeit analysiert, wenn Sektion 3 / Tab "Analysierte Mahlzeiten" angezeigt wird, dann erscheint der bestehende freundliche Empty-State aus PROJ-6

### Startseite
- [ ] Angenommen ein Nutzer besucht die Startseite, wenn sie lädt, dann ist der bisherige "Mahlzeit analysieren"-Button aus dem Hero-Bereich entfernt

## Edge Cases
- Tageswechsel um Mitternacht während der Nutzer die Seite offen hat: Fortschritt aktualisiert sich nicht automatisch live, sondern erst bei erneutem Laden der Seite — kein Live-Polling nötig.
- Nutzer ändert das Tagesziel in den Kontoeinstellungen mitten am Tag: die Sektion-2-Anzeige verwendet beim nächsten Laden sofort den neuen Wert, bereits gezählte Analysen bleiben unverändert.
- Nutzer hat `kcal_ziel` nie berechnet (nie den Kcal-Rechner ausgefüllt): kcal-Button zeigt einen Hinweis statt einer Zahl (siehe Acceptance Criteria).
- Negative Restkalorien (mehr gegessen als das Ziel): werden neutral angezeigt (z. B. "0 kcal übrig" oder ein dezenter Hinweis), keine Warnfarbe/Alarmierung — passend zum Non-Goal, kein aktives Warnsystem zu bauen.
- Alte Lesezeichen/Links auf `/historie`: werden auf `/analyse` weitergeleitet (siehe Acceptance Criteria).
- Nutzer mit sehr vielen Mahlzeiten an einem Tag (z. B. 6 "Mahlzeit"-Analysen bei Ziel 3): Fortschrittsanzeige zeigt eine sinnvolle Übererfüllungs-Darstellung (z. B. "Alle erledigt ✓") statt eines verwirrenden "6 von 3" — exakte Darstellung klärt `/frontend`.

## Technical Requirements (optional)
- Neue Spalte in `profiles` für das individuelle Tagesziel (z. B. `mahlzeiten_pro_tag`, Default 3) — Details zu Architektur/Migration bei `/architecture`
- Tageszählung: `meals` gefiltert auf den heutigen Kalendertag (lokale Zeitzone des Nutzers) + Klassifikation = "Mahlzeit" (nicht Komponente/Snack)
- kcal-Restberechnung: `profiles.kcal_ziel` minus Summe der `meal_analyses.macros_before.kcal` aller heutigen "Mahlzeit"-Analysen — folgt demselben Join-Muster wie die bestehende PROJ-17-Wochenauswertung
- `/historie` wird zu einem Redirect auf `/analyse` (kein separates Seiten-Rendering mehr)
- Bestehende Komponenten `MahlzeitHistorie` und `WochenRecapSektion` werden in die neue Seite eingebettet/wiederverwendet, nicht neu gebaut

## Content: Finaler Wortlaut

**H1 der Übersichtsseite:** "Lerne deine Ernährung kennen"

**Sektion 1 — Karten-Überschrift:** "Ernährungsanalyse starten"
**Sektion 1 — Text:**
"Springe direkt ins Tool, das deinen Teller analysiert und dir zeigt, wie sättigend deine Mahlzeit wirklich ist — inklusive konkreter Tipps, wie du sie verbessern kannst. Passend zu den erkannten Hauptzutaten bekommst du außerdem ein echtes Rezept zum Ausprobieren vorgeschlagen."

**Sektion 2 — Überschrift:** "Das hast du bereits gegessen"
**Sektion 2 — Text:**
"Hier siehst du, was du heute schon gegessen hast und was noch vor dir liegt — ganz ohne Kalorien-Gerede, denn vollwertige Mahlzeiten bringen dich ans Ziel. Willst du die Zahlen trotzdem sehen, kannst du sie unten ein- und ausblenden."

**Sektion 3 — Überschrift:** "Die letzten Tage auf deinem Teller"
**Sektion 3 — Text:**
"Eine kurze Analyse der letzten Tage: was du gegessen hast, was deine Favoriten sind und wo noch Luft nach oben ist."

## Open Questions
- [ ] Exakte Darstellung bei Übererfüllung des Tagesziels (z. B. 4 von 3) — wird bei `/frontend` entschieden
- [ ] Sollen die Trainingseinheiten-/Check-In-Tabs beim Klick einen Toast/Tooltip zeigen oder nur visuell deaktiviert sein? — Detail für `/frontend`

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| `/analyse` wird zum Hub, bestehender Analyse-Flow zieht auf `/analyse/start` um | Ermöglicht eine echte Übersichtsseite hinter dem Bottom-Nav-Tab "Analyse", ohne die Nav-Aktiv-Erkennung zu brechen (`/analyse/*` bleibt als "Analyse" erkannt) | 2026-09-01 |
| Optionale, standardmäßig ausgeblendete kcal-Restanzeige als bewusste Ausnahme vom PRD-Non-Goal "Kein Tracking von Tageskalorienzielen" | Nutzerwunsch nach einer Opt-in-Möglichkeit für Nutzer, die es genauer wissen wollen — bleibt passiv (keine Erinnerungen/Warnungen), damit der Geist des Non-Goals (kein aktives Kalorienzählen) erhalten bleibt | 2026-09-01 |
| Neue Konto-Einstellung "Mahlzeiten pro Tag" (Default 3) statt fixem Wert oder Ableitung aus PROJ-37 | Nutzerwunsch nach individueller Einstellbarkeit; einfacher und unabhängiger als eine Ableitung aus dem Mahlzeiten-Planer | 2026-09-01 |
| Nur Typ "Mahlzeit" zählt zum Tagesfortschritt, Komponenten/Snacks nicht | Entspricht dem Alltagsverständnis von "Frühstück/Mittag/Abend" und verhindert, dass ein Snack das Tagesziel künstlich aufbläht | 2026-09-01 |
| Sektion 2 nur für eingeloggte Nutzer (Gäste sehen Login-Hinweis-Karte) | Tagesziel liegt in `profiles`, ist also login-gebunden; konsistent mit PROJ-6, das ebenfalls Login verlangt | 2026-09-01 |
| Inhalt von `/historie` (PROJ-6 + PROJ-17) zieht komplett in Sektion 3 um, `/historie` als Route entfällt (Redirect) | Nutzerwunsch: ein zentraler Ort für Analyse-Historie statt zwei getrennter, nur teilweise erreichbarer Seiten (`/historie` war seit PROJ-35 nicht mehr aus der Nav erreichbar) | 2026-09-01 |
| "Favoriten" im Sektion-3-Text = bestehende PROJ-17-Top-Zutaten-Häufigkeit, kein neues Speichern-Feature | Vermeidet Scope-Explosion; die bestehende Wochen-Zutaten-Analyse deckt die Nutzerintention ("was esse ich am häufigsten") bereits ab | 2026-09-01 |
| 3-Kategorien-Struktur in Sektion 3 ("Analysierte Mahlzeiten" aktiv, "Trainingseinheiten"/"Check-Ins" als "bald verfügbar") bewusst so gebaut, dass zukünftige Trainings-/Check-In-Features als gleichwertige Kategorien samt eigenem Wochen-Rückblick andocken können | Nutzer plant, Sport- und Check-In-Tracking künftig hier einzugliedern — die Struktur soll das jetzt schon vorbereiten, ohne die eigentliche Funktionalität vorwegzunehmen | 2026-09-01 |
| Startseiten-Button "Mahlzeit analysieren" wird komplett entfernt (nicht umgebogen) | "Analyse" ist jetzt ein vollwertiger Bottom-Nav-Tab; ein zusätzlicher Startseiten-Direkteinstieg wäre redundant | 2026-09-01 |
| Alte `/historie`-URL leitet auf `/analyse` weiter statt 404 | Verhindert kaputte Lesezeichen/Links, geringer Zusatzaufwand | 2026-09-01 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
