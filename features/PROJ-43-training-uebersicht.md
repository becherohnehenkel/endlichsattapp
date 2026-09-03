# PROJ-43: Training-Übersicht (Krafttraining-Basics)

## Status: Deployed
**Created:** 2026-09-02
**Last Updated:** 2026-09-02

## Dependencies
- PROJ-35 (Bottom-Navigation & Kontobereich-Neuordnung) — `/training` existiert bereits als Nav-Tab und Platzhalterseite, wird hier mit echtem Inhalt befüllt
- PROJ-19 (Gast-Modus) — bestimmt, dass die Seite ohne Login voll nutzbar ist

## User Stories
- Als Nutzer, der noch nie Krafttraining gemacht hat, möchte ich die wichtigsten Grundbegriffe und Regeln kompakt erklärt bekommen, damit ich mich beim ersten Mal im Studio nicht verloren fühle.
- Als Nutzer möchte ich verstehen, warum Krafttraining beim Abnehmen hilft, damit ich es nicht als optional abtue.
- Als Nutzer, der direkt loslegen will, möchte ich zu einem von drei fertigen Trainingsplänen springen können, ohne selbst einen zusammenstellen zu müssen.
- Als Nutzer, der die Grundlagen schon kennt, möchte ich meinen Fortschritt (welche Punkte ich schon verstanden habe) im Blick behalten.
- Als Gast (ohne Login) möchte ich die Grundlagen und Pläne genauso lesen können wie ein eingeloggter Nutzer.

## Out of Scope
- Die eigentlichen Trainingsplan-Detailseiten mit Übungsanzeige und Gewicht-Eingabe — eigenes Feature PROJ-44 (folgt direkt danach)
- Jegliches Speichern/Tracken von Trainingsdaten — lebt vollständig in PROJ-44, hier ist alles reiner, statischer Lerninhalt
- Personalisierte Trainingsplan-Empfehlung (z. B. basierend auf Zielen/Erfahrung) — es gibt genau 3 feste, für alle Nutzer gleiche Pläne
- Verknüpfung mit dem "Trainingseinheiten"-Tab der Analyse-Übersicht (PROJ-42) — der bleibt Platzhalter, bis PROJ-44 echte Trainingseinheiten liefert
- Video-Anleitungen oder Bilder zu den Übungen — reiner Text für MVP

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Seitenstruktur
- [ ] Angenommen ein Nutzer öffnet `/training`, wenn die Seite lädt, dann zeigt sie die Überschrift "Krafttraining: Die Basics für deinen Start" und den vorgegebenen Intro-Text (nicht mehr den "Bald verfügbar"-Platzhalter)
- [ ] Angenommen die Seite ist geladen, wenn sie angezeigt wird, dann erscheinen die 5 Grundlagen-Arbeitspunkte oberhalb und die 3 Plan-Karten unterhalb, in dieser Reihenfolge

### Grundlagen-Arbeitspunkte
- [ ] Angenommen die Seite lädt, wenn die 5 Arbeitspunkte angezeigt werden, dann erscheinen sie in der Reihenfolge "Warum Krafttraining?", "Was bedeutet was?", "Warm-Up", "Das richtige Gewicht", "Richtig steigern", alle zunächst eingeklappt
- [ ] Angenommen die Seite lädt, wenn ~700ms vergangen sind, dann öffnet sich der erste Arbeitspunkt ("Warum Krafttraining?") automatisch, sofern der Nutzer nicht vorher selbst interagiert hat
- [ ] Angenommen ein Nutzer markiert einen Punkt als "Verstanden", wenn er das tut, dann aktualisiert sich der Fortschrittsbalken ("X von 5 abgeschlossen") und der Zustand bleibt nach einem Reload erhalten (lokal gespeichert, geräte-/browsergebunden)
- [ ] Angenommen alle 5 Punkte sind als "Verstanden" markiert, wenn die Seite angezeigt wird, dann erscheint der bestehende "Alles durch"-Hinweis (wie bei den anderen Guides)

### Plan-Karten
- [ ] Angenommen die Seite lädt, wenn die 3 Plan-Karten angezeigt werden, dann zeigen sie "Zu Hause ohne Equipment", "Zu Hause mit Widerstandsbändern" und "Fitnessstudio" in dieser Reihenfolge, jeweils mit kurzer Unterzeile
- [ ] Angenommen ein Nutzer klickt auf eine Plan-Karte, wenn er das tut, dann navigiert er zur zugehörigen Detailseite (Route wird in PROJ-44 gebaut — bis dahin ist ein 404 auf der Zielroute erwartet und akzeptiert)

### Gast-Zugriff
- [ ] Angenommen ein Gast (kein Login) besucht `/training`, wenn die Seite lädt, dann ist sie identisch nutzbar wie für eingeloggte Nutzer (Grundlagen lesen, "Verstanden" markieren, Plan-Karten sehen) — keine Einschränkung

## Edge Cases
- Nutzer klickt auf eine Plan-Karte, bevor PROJ-44 deployed ist: führt zu einem 404 auf der Zielroute — akzeptiert, da PROJ-44 als nächstes Feature direkt danach folgt.
- Nutzer löscht Browser-Daten oder wechselt das Gerät: "Verstanden"-Fortschritt geht verloren bzw. ist nicht synchron — konsistent mit dem bestehenden Verhalten aller anderen Guides (kein Server-Sync).
- Nutzer markiert Punkte in beliebiger Reihenfolge (nicht 1→5): funktioniert wie bei den bestehenden Guides, keine erzwungene Reihenfolge.
- Sehr schmale Mobile-Viewports (375px): Grundlagen-Text und Plan-Karten müssen ohne horizontales Scrollen lesbar bleiben (siehe PROJ-42-Refinement zu Tab-Label-Overlap als aktuelle Erinnerung, dieselbe Sorgfalt gilt hier).

## Technical Requirements (optional)
- Kein Backend nötig — reiner statischer Content, keine neue Datenbank-Spalte, keine neue API-Route
- Bestehende `ArbeitspunkteListe`-Komponente wiederverwenden (gleiches Muster wie alle Ernährung-Guides), inkl. `ersterPunktOnboarding={{ autoOpenNachMs: 700 }}`
- Plan-Karten im bestehenden `HubCard`-Stil (Icon, Titel, Unterzeile, Chevron — siehe `src/app/ernaehrung/page.tsx`)

## Content: Finaler Wortlaut

**H1:** "Krafttraining: Die Basics für deinen Start"

**Intro-Text:**
"Du musst kein Gym-Profi werden, um von Krafttraining zu profitieren. Aber ein paar Basics solltest du kennen, bevor du dich das erste Mal an eine Hantel stellst – damit du weißt, was du tust, warum du es tust und dich im Studio nicht verloren fühlst.

Hier findest du alles Wichtige kompakt erklärt: von den Begriffen über das Aufwärmen bis zur Frage, wann du mehr Gewicht auflegen solltest. Kein Fachchinesisch, keine Überforderung – nur das, was du wirklich brauchst.

Ganz unten findest du drei fertige Trainingspläne, mit denen du direkt loslegen kannst."

**Arbeitspunkt 1 — "Warum Krafttraining?"**
"Muskeln sind dein Stoffwechsel-Booster: Mehr Muskelmasse verbrennt mehr Energie – auch im Sitzen. Beim Abnehmen sorgt Krafttraining dafür, dass du Fett verlierst statt Muskeln. Dazu: stabilere Gelenke, aufrechte Haltung, mehr Kraft im Alltag (Einkäufe, Kinder, Umzugskartons). Und es funktioniert in jedem Alter."

**Arbeitspunkt 2 — "Was bedeutet was?"**
- Wiederholung (Wdh): Eine komplette Ausführung der Übung. Einmal Gewicht hoch und runter = 1 Wdh.
- Satz: Mehrere Wiederholungen am Stück. „3 Sätze à 10 Wdh" = 10 Wiederholungen, Pause, nochmal, Pause, nochmal.
- Kg: Das Zusatzgewicht, das du bewegst.
- Pause: Erholung zwischen den Sätzen, meist 1–3 Minuten. Ja, rumstehen gehört dazu.
- Stange/Gerät: Eine Langhantel wiegt meist 20 kg (kleinere 15 oder 10 kg) – steht oft drauf, sonst Personal fragen. Bei Geräten steht das Steckgewicht auf den Platten; das Eigengewicht des Geräts zählt da nicht mit, du orientierst dich einfach an den Zahlen am Gerät.

**Arbeitspunkt 3 — "Warm-Up"**
"5–10 Minuten locker bewegen (Radergometer, Rudern, zügig gehen), dann die erste Übung mit sehr leichtem Gewicht 1–2 Sätze „üben". Warum: Der Körper kommt auf Betriebstemperatur, Gelenke und Sehnen werden vorbereitet, du verletzt dich seltener – und die Bewegung sitzt, bevor Gewicht draufkommt."

**Arbeitspunkt 4 — "Das richtige Gewicht"**
"Faustregel: Die letzten 2–3 Wiederholungen eines Satzes sollen anstrengend sein, aber sauber machbar. Wenn du bei Wdh 10 noch plaudern könntest → zu leicht. Wenn die Technik zusammenbricht oder du bei Wdh 6 stecken bleibst → zu schwer. Am Anfang lieber zu leicht starten und Technik lernen – das Ego bleibt in der Umkleide."

**Arbeitspunkt 5 — "Richtig steigern"**
"Steigere erst, wenn du alle geplanten Wiederholungen in allen Sätzen sauber schaffst – idealerweise zweimal hintereinander. Dann in kleinen Schritten: 2,5 kg bei großen Übungen (Beine, Rücken), 1–2,5 kg oder eine Wiederholung mehr bei kleinen (Arme, Schultern). Geht das Gewicht nicht rauf, steigere Wiederholungen. Fortschritt ist nicht linear – Wochen ohne Steigerung sind normal, kein Grund zur Panik."

**Plan-Karten:**
1. Titel: "Zu Hause ohne Equipment" — Unterzeile: "Bodyweight, ganz ohne Geräte"
2. Titel: "Zu Hause mit Widerstandsbändern" — Unterzeile: "Mehr Widerstand, bleibt flexibel"
3. Titel: "Fitnessstudio" — Unterzeile: "Mit Hanteln und Kabelzug"

_(Unterzeilen 1 und 3 wurden in `/frontend` gegenüber dem ursprünglichen Vorschlag gekürzt — sie wurden auf 375px-Mobile-Viewports abgeschnitten, siehe die zugrunde liegende `HubCard`-Komponente mit `truncate`.)_

## Open Questions
- [ ] Exakte Icons für die 3 Plan-Karten — wird bei `/frontend` entschieden (analog zur bestehenden Icon-Auswahl im Ernährung-Hub)
- [ ] Zielrouten der Plan-Karten (`/training/[slug]`) — Benennung wird bei `/architecture` von PROJ-44 festgelegt, hier nur als Platzhalter-Link vorgesehen

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Feature in zwei Specs gesplittet: Hub (PROJ-43, dieses Dokument) ohne Backend-Bedarf, Trainingspläne + Gewicht-Logging (PROJ-44) mit Backend-Bedarf | Folgt demselben Muster wie Ernährung (PROJ-36 Hub vs. PROJ-37 ff. Guides) — Hub ist eigenständig test- und deploybar, Pläne bringen echten Backend-Scope (neue Tabelle, API, RLS) mit | 2026-09-02 |
| Grundlagen-Arbeitspunkte nutzen dieselbe `ArbeitspunkteListe`-Komponente mit Auto-Open des ersten Punkts | Konsistentes Erstbesucher-Verhalten über alle Guides hinweg (Ernährung + jetzt Training), kein neues UI-Muster nötig | 2026-09-02 |
| Seite bleibt für Gäste voll nutzbar, keine Login-Pflicht | Konsistent mit allen Ernährung-Guides — reiner Lerninhalt, kein Grund für eine Zugriffsbeschränkung | 2026-09-02 |
| "Feld zum Gewicht eintragen" bewusste Ausnahme vom PRD-Non-Goal "Kein Sport-/Workout-Tracking" — für Gäste zustandslos (Hinweis, dass Daten beim Verlassen/Neuladen verloren gehen), für eingeloggte Nutzer dauerhaft gespeichert pro Trainings-Durchlauf | Nutzerwunsch nach echtem Workout-Log für eingeloggte Nutzer, das später den "Trainingseinheiten"-Tab der Analyse-Übersicht (PROJ-42) mit echten Daten füllt — analog zur bewussten Kalorien-Ausnahme in PROJ-42, hier aber mit echter Persistenz. Betrifft primär PROJ-44 (dort technisch umgesetzt), hier als Kontext für die Plan-Karten-Verlinkung festgehalten | 2026-09-02 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Bestehende `ArbeitspunkteListe`-Komponente wiederverwenden statt neu bauen | Identisches Verhalten (Fortschrittsbalken, "Verstanden"-Haken, Auto-Open) wie bei allen Ernährung-Guides, kein Zusatzaufwand | 2026-09-02 |
| Das "Icon + Titel + Unterzeile"-Kartenmuster (bisher nur lokal in `src/app/ernaehrung/page.tsx` definiert) wird in eine gemeinsame, wiederverwendbare Komponente ausgelagert | Wird jetzt zum zweiten Mal gebraucht (Ernährung-Hub + Training-Hub) — vermeidet doppelten Code an zwei Stellen | 2026-09-02 |
| Kein Backend | Reiner Lerninhalt, keine Speicherung über den bestehenden lokalen "Verstanden"-Mechanismus hinaus | 2026-09-02 |
| Plan-Karten verlinken bewusst auf Routen, die erst mit PROJ-44 entstehen | Kurzzeitiger 404 zwischen den beiden Deploys akzeptiert, da PROJ-44 als direkt nächstes Feature folgt | 2026-09-02 |
| Keine neuen npm-Pakete | Alles läuft über bereits installierte shadcn/ui-Komponenten und bestehende Projekt-Komponenten | 2026-09-02 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Komponenten-Struktur (Visuell)

```
/training (Hub-Seite, ersetzt Platzhalter)
├── H1 "Krafttraining: Die Basics für deinen Start" + Intro-Text
├── ArbeitspunkteListe (bestehende Komponente, unverändert wiederverwendet)
│   └── 5 Grundlagen-Punkte: Warum Krafttraining? / Was bedeutet was? /
│       Warm-Up / Das richtige Gewicht / Richtig steigern
├── Trennlinie
└── 3 Plan-Karten (Icon + Titel + Unterzeile + Chevron)
    ├── Zu Hause ohne Equipment        → Zielroute folgt in PROJ-44
    ├── Zu Hause mit Widerstandsbändern → Zielroute folgt in PROJ-44
    └── Fitnessstudio                  → Zielroute folgt in PROJ-44
```

### B) Datenmodell (in Worten)
Keins nötig. Reiner statischer Inhalt. Der "Verstanden"-Fortschritt der 5 Punkte wird lokal im Browser gespeichert — exakt derselbe Mechanismus, den alle Ernährung-Guides schon nutzen, keine neue Speicherform.

### C) Tech-Entscheidungen (Begründung)

1. **Bestehende `ArbeitspunkteListe`-Komponente wiederverwenden** statt neu zu bauen — identisches Verhalten wie bei allen Ernährung-Guides, kein Zusatzaufwand.
2. **Karten-Muster wird in eine gemeinsame Komponente ausgelagert:** wird jetzt zum zweiten Mal gebraucht, vermeidet doppelten Code an zwei Stellen.
3. **Kein Backend** — reiner Lerninhalt, keine Speicherung über den bestehenden "Verstanden"-Mechanismus hinaus.
4. **Plan-Karten verlinken bewusst auf Routen, die erst mit PROJ-44 entstehen** — ein kurzzeitiger 404 zwischen den beiden Deploys ist akzeptiert, da PROJ-44 als direkt nächstes Feature folgt.

### D) Abhängigkeiten (Pakete)
Keine neuen Pakete.

## Implementation Notes (Frontend)
- `HubCard` (bisher lokal in `src/app/ernaehrung/page.tsx`) nach `src/components/hub-card.tsx` ausgelagert und dort importiert — jetzt gemeinsam von Ernährung- und Training-Hub genutzt, keine Logik geändert.
- Neue Komponente `src/components/training-guide.tsx`: H1 + 3-Absatz-Intro, `ArbeitspunkteListe` mit den 5 Grundlagen-Punkten (`ersterPunktOnboarding={{ autoOpenNachMs: 700 }}`, gleiches Muster wie alle Ernährung-Guides), Trennlinie, 3 Plan-Karten (`HubCard`).
- `src/app/training/page.tsx` ersetzt den "Bald verfügbar"-Platzhalter durch `<TrainingGuide />`, Header (Titel + Konto-Icon) unverändert übernommen.
- Icons für die 3 Plan-Karten gewählt: `Home` (ohne Equipment), `Zap` (Widerstandsbänder), `Dumbbell` (Fitnessstudio).
- Plan-Karten-Unterzeilen 1 und 3 gegenüber dem ursprünglichen Vorschlag gekürzt (375px-Mobile-Overlap durch `truncate` in `HubCard`, siehe Content-Sektion oben) — vor dem Ausliefern per Mobile-Screenshot verifiziert, kein Abschneiden mehr.
- Zielrouten der Plan-Karten (`/training/zuhause-ohne-equipment`, `/training/zuhause-mit-baendern`, `/training/fitnessstudio`) existieren noch nicht — 404 bis PROJ-44 deployed ist, wie in der Spec akzeptiert.
- Regressionstest: `PROJ-35-bottom-navigation-kontobereich.spec.ts` prüfte bisher, dass `/training` "Bald verfügbar" zeigt — auf den neuen Training-Hub-Inhalt aktualisiert (1 Test). `PROJ-36-ernaehrung-hub.spec.ts` läuft nach der `HubCard`-Auslagerung unverändert durch (18/19 grün, 1 vorbestehender, unabhängiger Befund aus der PROJ-42-QA).
- `npm run build`, `npm run lint`, `npm test` (423/423) fehlerfrei. Manuell verifiziert: Desktop- und Mobile-Screenshot (kein horizontales Scrollen bei 375px), zweiter Arbeitspunkt („Was bedeutet was?") mit Begriffs-Liste korrekt aufklappbar, "Verstanden"-Fortschritt aktualisiert den Balken.
- Kein Backend nötig — Frontend ist für PROJ-43 vollständig.

## QA Test Results

**Tested:** 2026-09-02
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Seitenstruktur
- [x] Überschrift "Krafttraining: Die Basics für deinen Start" + Intro-Text sichtbar
- [x] 5 Grundlagen-Punkte oberhalb, 3 Plan-Karten unterhalb, in korrekter Reihenfolge
- [x] Fortschrittsbalken startet bei "0 von 5 abgeschlossen"
- [x] Alle Arbeitspunkte starten eingeklappt
- [x] Erster Arbeitspunkt öffnet sich automatisch (~700ms)

#### Grundlagen-Arbeitspunkte (Inhalte)
- [x] "Warum Krafttraining?" zeigt die Stoffwechsel-Erklärung
- [x] "Was bedeutet was?" zeigt alle 5 Begriffe (Wdh, Satz, Kg, Pause, Stange/Gerät)
- [x] "Warm-Up" zeigt die 5–10-Minuten-Erklärung
- [x] "Das richtige Gewicht" zeigt die Faustregel
- [x] "Richtig steigern" zeigt die Steigerungs-Schritte

#### Ein-/Ausklappen & Fortschritt
- [x] Aufklappen eines Punkts lässt andere unberührt
- [x] "Verstanden" aktualisiert den Fortschrittsbalken und bleibt nach Reload erhalten (lokal gespeichert)
- [x] Alle 5 Punkte "Verstanden" → "Alles durch ✓"-Hinweis erscheint

#### Plan-Karten
- [x] Alle 3 Karten mit Titel + Unterzeile sichtbar (Zu Hause ohne Equipment / mit Widerstandsbändern / Fitnessstudio)
- [x] Karten verlinken auf die korrekten (noch nicht gebauten) Zielrouten — 404 bestätigt und akzeptiert bis PROJ-44

#### Gast-Zugriff
- [x] Gast (keine Session) kann die Seite vollständig lesen, Arbeitspunkte aufklappen, Plan-Karten sehen — keine Einschränkung

### Edge Cases Status
- [x] Sehr schmale Mobile-Viewports (375px): kein horizontales Scrollen, alle Texte lesbar — inkl. Plan-Karten-Unterzeilen (2 davon während `/frontend` gekürzt, siehe Implementation Notes)
- [x] 768px (Tablet): ebenfalls kein horizontales Scrollen
- [x] Klick auf Plan-Karte vor PROJ-44-Deploy: führt zu 404 wie in der Spec akzeptiert
- [x] "Verstanden"-Reihenfolge beliebig (nicht zwingend 1→5): funktioniert wie erwartet (bestehendes `ArbeitspunkteListe`-Verhalten)

### Security Audit Results
- [x] Seite lädt ohne Authentifizierung, wie spezifiziert — kein versehentlicher Login-Zwang
- [x] Keine API-Aufrufe von der Seite (verifiziert: 0 Netzwerk-Requests an `/api/*`) — reiner statischer/lokaler Inhalt, keine Angriffsfläche über den Server hinaus
- [x] Keine Nutzereingabe auf der Seite (nur Lesen + "Verstanden"-Klick) — kein XSS-Vektor
- [x] "Verstanden"-Fortschritt liegt ausschließlich in `localStorage`, geräte-lokal, keine PII, kein Cross-User-Zugriff möglich
- [x] Keine Konsolenfehler beim Laden

### Regression Testing
- [x] `PROJ-35-bottom-navigation-kontobereich.spec.ts`: 11/12 grün (1 vorbestehender, unabhängiger Befund aus der PROJ-42-QA — `/ernaehrung`-Alias, nicht durch PROJ-43 verursacht)
- [x] `PROJ-36-ernaehrung-hub.spec.ts`: 18/19 grün (derselbe vorbestehende Befund) — bestätigt, dass die `HubCard`-Auslagerung den Ernährung-Hub nicht beeinträchtigt hat
- [x] `npm test` (423/423) unverändert grün

### Bugs Found
Keine.

### Summary
- **Acceptance Criteria:** 17/17 bestanden
- **Neue Tests:** `tests/PROJ-43-training-uebersicht.spec.ts` (16 E2E-Tests, chromium + Mobile Chrome grün)
- **Bugs Found:** 0
- **Security:** Pass — minimale Angriffsfläche (kein Backend, keine Eingabe, keine Auth-Pflicht wie spezifiziert)
- **Production Ready:** YES
- **Recommendation:** Deploy

## Deployment
- **Production URL:** https://app.mehralsabnehmen.de/training
- **Deployed:** 2026-09-02 (Vercel auto-deploy via Push zu `main`, commits `f290968`..`6fd8630`)
- **Verified in Produktion:** Nutzer hat die Live-Seite geprüft, alles grün ("Alles auf Grün").
- **Umfang dieses Deploys:** vollständige PROJ-43-Implementierung — Training-Hub unter `/training` (ersetzt den bisherigen Platzhalter): 5 Grundlagen-Arbeitspunkte zum Krafttraining (bestehende `ArbeitspunkteListe`-Komponente, Auto-Open, Fortschrittsbalken), 3 Plan-Karten (Zu Hause ohne Equipment / mit Widerstandsbändern / Fitnessstudio), deren Zielrouten erst mit PROJ-44 entstehen (bis dahin 404, wie spezifiziert). `HubCard` aus dem Ernährung-Hub in eine gemeinsame Komponente ausgelagert. Kein Backend.
