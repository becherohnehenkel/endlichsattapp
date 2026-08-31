# PROJ-37: So geht abnehmen (inkl. Kcal-Rechner)

## Status: Planned
**Created:** 2026-08-31
**Last Updated:** 2026-08-31

## Dependencies
- Requires: PROJ-36 (Ernährung-Hub) — Zielseite `/ernaehrung/so-geht-abnehmen` existiert bereits als Platzhalter, wird hier mit echtem Inhalt befüllt
- Requires: PROJ-2 (User Authentication) — Unterscheidung eingeloggt/Gast für Speicherverhalten
- Requires: PROJ-19 (Gast-Modus) — Gäste dürfen den Rechner ohne Account nutzen
- Requires: PROJ-35 (Bottom-Navigation) — `/training` existiert bereits als Platzhalter-Route, Ziel des Krafttraining-Links

## User Stories
- Als eingeloggter Nutzer möchte ich meinen Kalorienbedarf berechnen und meine Eingaben gespeichert bekommen, damit ich sie beim nächsten Besuch nicht erneut eintippen muss.
- Als Gast möchte ich den Kalorienbedarf trotzdem berechnen können, ohne einen Account zu brauchen.
- Als Nutzer möchte ich zwischen drei Zielen (Fett verlieren, Gewicht halten, Muskeln aufbauen) wählen, damit ich direkt eine für mein Ziel passende Kalorienzahl sehe.
- Als eingeloggter Nutzer, dessen aktuelles Gewicht deutlich von meinem letzten gespeicherten Wert abweicht, möchte ich einen Hinweis bekommen, damit ich weiß, dass ich neu berechnen sollte.
- Als Nutzer möchte ich bei ungültigen Eingaben (z. B. Alter außerhalb des sinnvollen Bereichs) eine klare Fehlermeldung sehen, statt ein falsches Ergebnis zu bekommen.

## Out of Scope
- Tägliches Tracking/Fortschrittsanzeige gegen das berechnete Kalorienziel — explizites Non-Goal laut `docs/PRD.md` ("Kein Kalorienzählen oder Tracking von Tageskalorienzielen"), wird hier nicht gebaut
- Dritte Geschlechts-Option für die Formel — bewusst auf zwei Varianten beschränkt (siehe Product Decisions)
- Automatische zeitbasierte Erinnerung (z. B. "nach 30 Tagen neu berechnen") — nur die 5kg-Abweichungsprüfung beim Bearbeiten des Gewichtsfelds
- Eigener Trainingsplan-Inhalt hinter dem Krafttraining-Arbeitspunkt — der Verweis zeigt nur zum `/training`-Bereich (Platzhalter aus PROJ-35, eigener Inhalt folgt in einer späteren, noch nicht angelegten Spec), Trainingsinhalte selbst sind nicht Teil dieser Spec
- Schlaf-Tracking (Dauer/Qualität erfassen) — dieser Arbeitspunkt ist reine Aufklärung/Anleitung, kein Tracking-Tool

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Eingabe & Validierung
- [ ] Angenommen ein Nutzer öffnet den Kcal-Rechner, dann sieht er Eingabefelder für Gewicht (kg), Größe (cm), Alter (Jahre), Geschlecht (Männlich/Weiblich) und Aktivitätslevel (5 PAL-Stufen), sowie eine Ziel-Auswahl (Fett verlieren / Gewicht halten / Muskeln aufbauen).
- [ ] Angenommen ein Nutzer trägt ein Gewicht außerhalb von 30–300 kg ein, dann erscheint eine Inline-Fehlermeldung am Feld und der "Berechnen"-Button bleibt deaktiviert.
- [ ] Angenommen ein Nutzer trägt eine Größe außerhalb von 120–250 cm ein, dann erscheint eine Inline-Fehlermeldung am Feld und der "Berechnen"-Button bleibt deaktiviert.
- [ ] Angenommen ein Nutzer trägt ein Alter außerhalb von 14–100 Jahren ein, dann erscheint eine Inline-Fehlermeldung am Feld und der "Berechnen"-Button bleibt deaktiviert.
- [ ] Angenommen alle Felder sind gültig ausgefüllt, dann ist der "Berechnen"-Button aktiv.

### Berechnung
- [ ] Angenommen ein Nutzer klickt auf "Berechnen", dann wird der Grundumsatz per Mifflin-St-Jeor-Formel berechnet (Männer: 10×Gewicht + 6,25×Größe − 5×Alter + 5; Frauen: 10×Gewicht + 6,25×Größe − 5×Alter − 161) und mit dem gewählten PAL-Faktor multipliziert, um den Erhaltungsbedarf ("Gewicht halten") zu ermitteln.
- [ ] Angenommen das Ziel "Fett verlieren" ist gewählt, dann zeigt das Ergebnis 90 % des Erhaltungsbedarfs.
- [ ] Angenommen das Ziel "Gewicht halten" ist gewählt, dann zeigt das Ergebnis exakt den Erhaltungsbedarf (100 %).
- [ ] Angenommen das Ziel "Muskeln aufbauen" ist gewählt, dann zeigt das Ergebnis 110 % des Erhaltungsbedarfs.
- [ ] Angenommen ein Ergebnis wird angezeigt, dann ist die kcal-Zahl auf ganze Zahlen gerundet.

### Speichern (eingeloggte Nutzer)
- [ ] Angenommen ein eingeloggter Nutzer klickt auf "Berechnen", dann werden Gewicht, Größe, Alter, Geschlecht, Aktivitätslevel und Ziel automatisch gespeichert (kein separater Speichern-Schritt).
- [ ] Angenommen ein eingeloggter Nutzer mit gespeicherten Werten öffnet die Seite erneut, dann sind alle Felder mit den zuletzt gespeicherten Werten vorausgefüllt und das zuletzt berechnete Ergebnis wird sofort angezeigt (ohne erneuten Klick).
- [ ] Angenommen ein eingeloggter Nutzer ändert das Gewichtsfeld auf einen Wert, der um mindestens 5 kg vom zuletzt gespeicherten Gewicht abweicht, dann erscheint ein Hinweis, dass er neu berechnen sollte, damit die Werte übereinstimmen.
- [ ] Angenommen das Speichern schlägt fehl (z. B. Netzwerkfehler), dann wird das berechnete Ergebnis trotzdem angezeigt, zusätzlich erscheint ein Hinweis, dass das Speichern fehlgeschlagen ist.

### Gäste
- [ ] Angenommen ein Gast (keine Session oder anonym) öffnet den Kcal-Rechner, dann sind alle Felder leer, keine Werte werden vorausgefüllt.
- [ ] Angenommen ein Gast berechnet ein Ergebnis, dann wird nichts gespeichert — beim nächsten Besuch sind die Felder wieder leer.

### Seiten-Struktur "So geht abnehmen"
- [ ] Angenommen ein Nutzer öffnet `/ernaehrung/so-geht-abnehmen`, dann sieht er 5 Arbeitspunkte in dieser Reihenfolge, alle mit echtem Inhalt (keine Platzhalter mehr): 1. Kcal-Rechner, 2. Wöchentlich vs. Täglich, 3. Warum auf Proteine achten, 4. Krafttraining, 5. Schlaf/Erholung.
- [ ] Angenommen die Seite wird angezeigt, dann bleibt der bestehende Breadcrumb-Header ("Ernährung / So geht abnehmen") aus PROJ-36 erhalten.
- [ ] Angenommen die Seite wird angezeigt, dann folgen alle 5 Arbeitspunkte demselben Karten-/Fortschritts-Muster wie der bestehende "Wie esse ich richtig?"-Guide (nummeriert, "Verstanden"-Button, Fortschrittsbalken, lokal gespeicherter Fortschritt).

### Arbeitspunkt 2: Wöchentlich vs. Täglich
- [ ] Angenommen ein Nutzer öffnet diesen Arbeitspunkt, dann sieht er den Erklärtext: "Dein Körper rechnet nicht in Tagen, sondern in Wochen. Ein Tag über deinem Ziel bedeutet nicht, dass du 'versagt' hast — er wird einfach von den anderen sechs Tagen ausgeglichen. Schau auf den Wochendurchschnitt, nicht auf jeden einzelnen Tag."
- [ ] Angenommen der Arbeitspunkt wird angezeigt, dann zeigt er zwei CSS-gestylte Balken-Schaubilder mit je 7 Balken (repräsentativ für die 7 Wochentage):
  - Schaubild 1 "Wie ein starrer Plan aussieht": 7 gleich hohe Balken. Caption: "Jeden Tag exakt gleich."
  - Schaubild 2 "Wie es wirklich aussieht": 5 ungefähr gleich niedrige Balken, 1 etwas höherer, 1 etwas niedrigerer Balken. Caption: "Mal mehr, mal weniger — im Schnitt im Ziel."
- [ ] Angenommen die Schaubilder werden angezeigt, dann nutzen sie die bestehende App-Farbpalette (Primärgrün für reguläre Tage, warmer Akzent-Ton für den höheren Tag) — keine neuen Bild-Assets, reines CSS/HTML.

### Arbeitspunkt 3: Warum auf Proteine achten
- [ ] Angenommen ein Nutzer öffnet diesen Arbeitspunkt, dann sieht er den Erklärtext: "Protein hält dich länger satt als Kohlenhydrate oder Fett — und schützt beim Abnehmen deine Muskeln. Ohne genug Protein verlierst du beim Abnehmen nicht nur Fett, sondern auch Muskelmasse."
- [ ] Angenommen der Arbeitspunkt wird angezeigt, dann zeigt er den hervorgehobenen Richtwert "Mindestens 30g Protein pro Mahlzeit" in einer Info-Box (Stil konsistent mit bestehenden Info-Boxen, z. B. auf der Sättigungsmatrix-Seite).
- [ ] Angenommen der Arbeitspunkt wird angezeigt, dann listet er 3 Lebensmittel-Kategorien: Tierisch (mageres Fleisch, Fisch), Vegetarisch (magerer Käse, Milchprodukte), Vegan (Tofu, Erbsen, Linsen, Bohnen, Sojagranulat — mit Hinweis, dass diese zusätzlich Kohlenhydrate & Ballaststoffe enthalten).
- [ ] Angenommen der Arbeitspunkt wird angezeigt, dann enthält er kein Schaubild (reiner Text/Listen-Inhalt).

### Arbeitspunkt 4: Krafttraining
- [ ] Angenommen ein Nutzer öffnet diesen Arbeitspunkt, dann sieht er 4 nummerierte Gründe: (1) Muskeln erhalten im Kaloriendefizit, (2) Grundumsatz-Effekt, (3) Gesundes Altern (inkl. Kniebeuge-Analogie), (4) Körper formen.
- [ ] Angenommen der Arbeitspunkt wird angezeigt, dann zeigt er am Ende einen einzelnen, dezenten Text-Link "Trainingspläne findest du im Training-Bereich →", der zu `/training` führt — kein Button, keine weitere Erklärung, um nicht vom Ernährungs-Fokus abzulenken.

### Arbeitspunkt 5: Schlaf / Erholung
- [ ] Angenommen ein Nutzer öffnet diesen Arbeitspunkt, dann sieht er den Erklärtext zu Sättigungshormonen (Ghrelin/Leptin) und zur allgemeinen Erholungsfunktion von Schlaf (siehe Abschnitt "Content: Arbeitspunkte 2–5" für den finalen Wortlaut).
- [ ] Angenommen der Arbeitspunkt wird angezeigt, dann listet er 4 nummerierte Tipps für erholsamen Schlaf: (1) 3-2-1-Regel, (2) kühle Umgebung, (3) Dunkelheit, (4) Umgang mit kreisenden Gedanken (Atemübung, Zählen, Gedanken aufschreiben).
- [ ] Angenommen der Arbeitspunkt wird angezeigt, dann enthält er kein Schaubild (reiner Text/Listen-Inhalt).

## Edge Cases
- Gast berechnet mehrfach hintereinander mit unterschiedlichen Werten → jedes Mal ein frisches, unabhängiges Ergebnis, nichts wird gespeichert oder überschrieben.
- Eingeloggter Nutzer berechnet zum ersten Mal (keine vorher gespeicherten Werte) → Formular startet leer, kein 5kg-Hinweis möglich (kein Vergleichswert vorhanden).
- Nutzer wechselt nur das Ziel (z. B. Fett verlieren → Muskeln aufbauen), ohne Gewicht/Größe/Alter zu ändern → sofortige Neuberechnung, keine 5kg-Warnung (nur eine Gewichtsänderung löst die Warnung aus).
- Sehr extreme, aber technisch valide Eingaben (z. B. 300 kg + 120 cm) → Formel liefert trotzdem ein Ergebnis, keine zusätzliche Plausibilitätsprüfung über die harten Grenzen hinaus (bewusst einfach gehalten).

## Technical Requirements (optional)
- Security: Gespeicherte Biometrie-Daten sind personenbezogen — Zugriff ausschließlich auf die eigenen Daten des eingeloggten Nutzers (RLS), Details in `/architecture`/`/backend`.

## Content: Arbeitspunkte 2–5 (finaler Wortlaut)

### 2. Wöchentlich vs. Täglich
> Dein Körper rechnet nicht in Tagen, sondern in Wochen. Ein Tag über deinem Ziel bedeutet nicht, dass du "versagt" hast — er wird einfach von den anderen sechs Tagen ausgeglichen. Schau auf den Wochendurchschnitt, nicht auf jeden einzelnen Tag.

**Schaubild 1 — "Wie ein starrer Plan aussieht":** 7 gleich hohe Balken. Caption: *"Jeden Tag exakt gleich."*
**Schaubild 2 — "Wie es wirklich aussieht":** 5 ungefähr gleich niedrige Balken, 1 etwas höherer, 1 etwas niedrigerer Balken. Caption: *"Mal mehr, mal weniger — im Schnitt im Ziel."*

### 3. Warum auf Proteine achten
> Protein hält dich länger satt als Kohlenhydrate oder Fett — und schützt beim Abnehmen deine Muskeln. Ohne genug Protein verlierst du beim Abnehmen nicht nur Fett, sondern auch Muskelmasse.
>
> **Richtwert: mindestens 30g Protein pro Mahlzeit.**
>
> Woher bekommst du es?
> - 🥩 **Tierisch:** mageres Fleisch, Fisch
> - 🧀 **Vegetarisch:** magerer Käse, Milchprodukte
> - 🌱 **Vegan:** Tofu, Erbsen, Linsen, Bohnen, Sojagranulat *(enthalten zusätzlich Kohlenhydrate & Ballaststoffe)*

### 4. Krafttraining
> Warum Krafttraining beim Abnehmen hilft:
>
> **1. Muskeln erhalten** — Im Kaloriendefizit denkt dein Körper sonst: "Das brauche ich nicht, kostet nur Energie." Krafttraining signalisiert ihm: Diese Muskulatur wird gebraucht — die bleibt.
>
> **2. Grundumsatz** — Mehr Muskelmasse erhöht deinen Grundumsatz (nicht überbewerten, aber ein netter Nebeneffekt).
>
> **3. Gesund altern** — Jede Bewegung bleibt mit steigendem Alter leichter. Eine halbe Kniebeuge ist ein Toilettengang, den du mit 80 noch selbstständig schaffen willst.
>
> **4. Körper formen** — Kleidung sitzt leichter, du fühlst dich wohler in deiner Haut.

Am Ende: dezenter Text-Link *"Trainingspläne findest du im Training-Bereich →"* → `/training`.

### 5. Schlaf / Erholung
> Ein übermüdeter Körper hat mehr Hunger — Schlafmangel bringt deine Sättigungshormone durcheinander (mehr Ghrelin, weniger Leptin). Das Ergebnis: mehr Appetit, und unbewusst greifst du eher zu schnellen Kalorien wie Süßigkeiten und Snacks statt zu einer sättigenden Mahlzeit.
>
> Genauso wichtig: Schlaf ist die Zeit, in der dein Körper insgesamt zur Ruhe kommt — das System fährt herunter und erholt sich. Nur so kannst du jeden Tag die Leistung abrufen, die du abrufen möchtest.
>
> **So gestaltest du erholsamen Schlaf:**
>
> **1. 3-2-1-Regel** — 3h vorher nichts Schweres mehr essen, 2h vorher keine Arbeit/Aufregung/laute Musik mehr, 1h vorher keine Bildschirme mehr (blaues Licht vermeiden).
>
> **2. Kühle Umgebung** — hilft deinem Körper, besser zu entspannen.
>
> **3. Dunkelheit** — Rollladen, blickdichter Vorhang oder Schlafmaske.
>
> **4. Kreisende Gedanken?** — Langsam ein-, noch langsamer ausatmen, bis du einschläfst. Oder von 21 aufwärts endlos weiterzählen. Im Notfall: Gedanken mit Stift und Papier festhalten statt im Kopf zu wälzen.

## Open Questions
- [x] Exakte Copy/Reihenfolge der 4 übrigen Arbeitspunkte (Wöchentlich vs. Täglich, Proteine, Krafttraining, Schlaf/Erholung) → final erarbeitet im Refinement vom 2026-08-31, siehe Abschnitt "Content: Arbeitspunkte 2–5"

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Rechner bleibt zustandslos für Gäste, aber persistent für eingeloggte Nutzer | Nutzerwunsch: beide Zielgruppen bedienen, ohne Login-Zwang für die Grundfunktion | 2026-08-31 |
| Ziel (Fett verlieren/Halten/Muskeln aufbauen) wird mitgespeichert | Nutzerkorrektur — soll beim nächsten Besuch ebenfalls vorausgefüllt sein, nicht nur die Biometrie | 2026-08-31 |
| Autosave bei jeder Berechnung statt explizitem Speichern-Button | Einfachste UX, vom Nutzer bestätigt | 2026-08-31 |
| 5kg-Abweichungs-Hinweis beim Bearbeiten des Gewichtsfelds | Verhindert, dass gespeichertes Ergebnis und tatsächliches aktuelles Gewicht stillschweigend auseinanderlaufen | 2026-08-31 |
| Kein tägliches Tracking/Fortschritts-UI gegen das Kalorienziel | Explizites PRD-Non-Goal ("Kein Kalorienzählen oder Tracking von Tageskalorienzielen") — Rechner bleibt einmaliges, edukatives Tool | 2026-08-31 |
| Nur zwei Geschlechts-Optionen (Männlich/Weiblich) für die Formel | Mifflin-St-Jeor kennt rechnerisch nur diese zwei Varianten; bewusste Nutzerentscheidung gegen eine dritte Option | 2026-08-31 |
| 5 PAL-Stufen (1,2 / 1,375 / 1,55 / 1,725 / 1,9) | Gängige Standard-Skala, vom Nutzer bestätigt | 2026-08-31 |
| Wertebereiche: Gewicht 30–300 kg, Größe 120–250 cm, Alter 14–100 Jahre | Verhindert offensichtlich unsinnige Eingaben, vom Nutzer bestätigt | 2026-08-31 |
| Kcal-Rechner startet als einziger fertiger Arbeitspunkt, restliche 4 als Platzhalter | Content-Aufwand für die anderen 4 Themen folgt separat; der Rechner ist eigenständig wertstiftend und muss nicht darauf warten | 2026-08-31 |
| Refinement 2026-08-31: Copy für alle 4 übrigen Arbeitspunkte in gemeinsamer Runde final erarbeitet, direkt in dieselbe PROJ-37-Spec aufgenommen (kein separates PROJ) | Alle 5 Arbeitspunkte gehören zur selben Seite/demselben Feature; Aufteilung in eigene Specs hätte keinen Testbarkeits-/Deploybarkeits-Vorteil gebracht | 2026-08-31 |
| Arbeitspunkt 2 (Wöchentlich vs. Täglich) bekommt zwei CSS/HTML-Balkendiagramme statt Bild-Assets | Konsistent mit dem Rest der App (keine Illustrations-Assets irgendwo), bleibt responsiv, kein zusätzliches Laden | 2026-08-31 |
| Diagramme nutzen die bestehende App-Farbpalette statt neuer Farben | Visuelle Konsistenz mit dem Rest der App | 2026-08-31 |
| Arbeitspunkte 3 und 5 (Proteine, Schlaf) ohne Schaubild, nur Text/Listen | Nutzer-Entscheidung — bei diesen zwei Themen trägt eine Liste die Information klarer als eine Grafik | 2026-08-31 |
| Krafttraining-Arbeitspunkt verlinkt nur dezent (Text-Link, kein Button) auf `/training`, ohne weitere Erklärung dort | Nutzer will vermeiden, dass der Fokus vom Ernährungs-Bereich wegwandert — der Link soll auffindbar, aber nicht werblich sein | 2026-08-31 |

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
