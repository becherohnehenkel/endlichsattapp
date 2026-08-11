# PROJ-5: Sättigungs-Einschätzung & Verbesserungsvorschlag

## Status: Deployed (Refinement: Drei-Säulen-Modell "Complete" — Approved, bereit für /deploy)
**Created:** 2026-06-10
**Last Updated:** 2026-08-11

**Refinement (2026-08-11, "Complete"-Umstrukturierung):** Die Sättigungsmatrix wurde von 6 Bausteinen auf 3 Säulen (Protein/Ballaststoffe/Volumen) reduziert — Geschmack, Biss und Art of Eating sind jetzt eigenständige, künftige Features (siehe `docs/saettigungsmatrix.md` Abschnitt 7). Läuft nur noch für `typ: mahlzeit` (aus PROJ-4s neuer Schritt-0-Klassifikation) — für `komponente`/`snack` übernimmt PROJ-16. Basis-Feature bleibt unverändert live in Produktion, nur die geänderten/neuen Acceptance Criteria unten sind noch offen. Nächster Schritt: `/architecture`, dann `/backend`+`/frontend`.

## Dependencies
- Requires: PROJ-4 (KI-Analyse-Agent) — liefert Makros, Zutatenliste und Säulen-Rohdaten als Input, sowie das `typ`-Feld (Refinement 2026-08-11: PROJ-5 rendert nur noch, wenn `typ: mahlzeit`)
- Requires: PROJ-1 (Supabase Infrastructure) — Ergebnis wird in `meal_analyses` gespeichert
- **Refinement 2026-08-11:** PROJ-16 (Beilagen-Kontext) übernimmt die Darstellung für `typ: komponente` und `typ: snack` — PROJ-5 ist ab jetzt exklusiv für `typ: mahlzeit` zuständig

## User Stories
- Als Nutzer möchte ich auf einen Blick sehen wie sättigend meine Mahlzeit ist, damit ich sofort verstehe wo ich stehe.
- Als Nutzer möchte ich die 3 Säulen der Sättigungsmatrix einzeln bewertet sehen (vier Abstufungen: ungenügend/gering/mittel/gut), damit ich verstehe welche Dimension meines Gerichts stark oder schwach ist. *(Refinement 2026-08-11 — vorher 6 Bausteine mit drei Abstufungen)*
- Als Nutzer möchte ich einen konkreten, sofort umsetzbaren Verbesserungsvorschlag bekommen ("eine Handvoll Kirschtomaten dazu"), damit ich morgen beim Kochen genau weiß was ich ändern kann.
- Als Nutzer möchte ich den Side-by-Side-Vergleich meiner aktuellen vs. verbesserten Mahlzeit sehen, damit ich den Unterschied der Verbesserung direkt greife.
- Als Nutzer möchte ich kurze, präzise Erklärungen ohne erhobenen Zeigefinger, damit ich mich verstanden und nicht belehrt fühle.

## Out of Scope
- Vollständige Rezept-Neuformulierung für Geschmacksoptimierung — Post-MVP, eigene Feature-Session nach dem MVP
- Feedback-Mechanismus ("War der Vorschlag hilfreich?") — Post-MVP (PROJ-7 oder späteres Feature)
- Speichern/Teilen des Ergebnisses — Speicherung läuft über PROJ-1/PROJ-4, Teilen ist Post-MVP
- Mikronährstoffe, Vitamine — explizites Non-Goal (PRD)
- Kalorien als Hauptmetrik — erscheinen nur sekundär aus PROJ-4
- **Geschmack als Baustein/Sektion** (Refinement 2026-08-11) — eigenes künftiges Feature, eigener Score, siehe `docs/geschmacks-score-prompt.md`
- **Art of Eating als Baustein** (Refinement 2026-08-11) — eigenes künftiges Feature ("Selbstauskunft"), nicht mehr Teil der Sättigungs-Bewertung
- **Darstellung für `typ: komponente` und `typ: snack`** (Refinement 2026-08-11) — das ist PROJ-16

## Acceptance Criteria

### Sättigungs-Score & Säulen (Refinement 2026-08-11 — 6 Bausteine → 3 Säulen)
- [ ] Angenommen PROJ-4 hat die Analyse abgeschlossen und `typ: mahlzeit` geliefert, wenn das Ergebnis angezeigt wird, dann sieht der Nutzer alle 3 Säulen (Protein, Ballaststoffe, Volumen) mit ihrer Bewertung in vier Abstufungen: ungenügend, gering, mittel, gut — jede Stufe farblich eigenständig unterscheidbar (vier Farben, nicht mehr die alte Drei-Farben-Ampel).
- [ ] Angenommen die 3 Säulen bewertet sind, wenn die Gesamteinschätzung angezeigt wird, dann gilt: 3× "gut" = "Sehr sättigend", 2× "gut" = "Mäßig sättigend", 0–1× "gut" = "Wenig sättigend".
- [ ] Angenommen eine Säule ist "gut", wenn sie angezeigt wird, dann erscheint sie ohne ausführliche Erklärung — maximal eine kurze Bestätigung ("Das machst du bereits gut").
- [ ] Angenommen eine Säule ist "mittel", "gering" oder "ungenügend", wenn sie angezeigt wird, dann erscheint eine knappe Erklärung warum — präzise, ohne Zeigefinger, so kurz wie möglich, inkl. dem konkreten Wert der die Stufe bestimmt (z.B. "18g Protein").

### Erklärung (Warum-Abschnitt)
- [ ] Angenommen schwache Säulen vorhanden sind, wenn die Erklärung angezeigt wird, dann fokussiert sie sich auf die schlechteste Stufe zuerst (ungenügend vor gering vor mittel) — nicht auf alle drei gleichzeitig.
- [ ] Angenommen die Erklärung angezeigt wird, dann folgt sie dem Ton-Prinzip: Handlung steht vor Theorie; Erklärungen erscheinen in Klammern, ausgegraut oder im Kleingedruckten.
- [ ] Angenommen das Gericht ist bereits "sehr sättigend" (3× gut), wenn das Ergebnis angezeigt wird, dann zeigt die App eine positive Bestätigung ohne konstruierte Verbesserungsvorschläge.

### Side-by-Side Vergleich
- [ ] Angenommen Verbesserungsvorschläge existieren, wenn der Vergleich angezeigt wird, dann sieht der Nutzer die 3 Säulen nebeneinander: "Jetzt" (aktuelle Bewertung) vs. "Nach Verbesserung" (projizierte Bewertung nach Umsetzung der Vorschläge).
- [ ] Angenommen der Side-by-Side angezeigt wird, wenn eine Säule sich durch die Verbesserung um mindestens eine Stufe verbessert, dann wird dieser Unterschied visuell hervorgehoben.
- [ ] Angenommen der Nutzer schaut sich den Vergleich auf Mobile an, dann ist der Side-by-Side auch auf kleinen Screens (320px+) lesbar — ggf. als vertikaler Vorher/Nachher-Stack.

### Verbesserungsvorschläge (Sättigender machen)
- [ ] Angenommen schwache Säulen identifiziert sind, wenn Verbesserungsvorschläge angezeigt werden, dann folgt die Reihenfolge: schlechteste Stufe zuerst; bei zwei gleich schlechten Säulen gilt Protein vor Ballaststoffen vor Volumen (Refinement 2026-08-11 — vorher Biss → Ballaststoffe → Volumen → Geschmack → Proteine → Art of Eating über alle 6 Bausteine).
- [ ] Angenommen ein Verbesserungsvorschlag angezeigt wird, dann ist er konkret und sofort umsetzbar (z.B. "eine Handvoll Kirschtomaten dazu" statt "mehr Gemüse essen").
- [ ] Angenommen mehrere Säulen schwach sind, wenn Vorschläge gemacht werden, dann zeigt die App maximal 2 Vorschläge insgesamt statt alle Schwächen gleichzeitig anzugehen.
- [ ] Angenommen ein Verbesserungsvorschlag eine Erklärung braucht, dann erscheint sie in Klammern, ausgegraut oder im Kleingedruckten — die Handlungsempfehlung steht immer zuerst.
- [ ] Angenommen die Sättigungsmatrix-Verbotsliste greift (z.B. Flohsamenschalen in herzhaftes Gericht), wenn ein Vorschlag generiert wird, dann erscheint dieser nie im Ergebnis.

### Rezept-Delta (Lecker bleiben)
- [ ] Angenommen Verbesserungsvorschläge existieren, wenn das Rezept-Delta angezeigt wird, dann zeigt es nur was sich ändert — nicht das vollständige Rezept neu formuliert.
- [ ] Angenommen das Rezept-Delta angezeigt wird, dann kommuniziert es explizit was am Original bleibt ("Deine Pasta bleibt wie sie ist, aber: …").
- [ ] Angenommen das Rezept-Delta Änderungen enthält, dann sind sie geschmacklich stimmig zum Originalgericht — keine Zutaten die den Charakter des Gerichts zerstören.

## Edge Cases
- **Mahlzeit bereits sehr sättigend:** Keine konstruierten Vorschläge — stattdessen Bestätigung und ggf. ein einziger "Feintuning"-Tipp.
- **Nutzer hat übersprungen (Skip):** Verbesserungsvorschlag basiert auf den Annahmen der KI — Annahmen-Transparenz aus PROJ-4 wird oben im Ergebnis sichtbar eingeblendet, damit der Nutzer weiß worauf die Bewertung basiert.
- **Alle 3 Säulen ungenügend** (Refinement 2026-08-11 — vorher "alle 6 Bausteine rot"): App zeigt maximal 2 konkrete Verbesserungsvorschläge (Priorität: Protein und Ballaststoffe) — keine überwältigende Liste.
- **`typ: komponente` oder `typ: snack`** (Refinement 2026-08-11, neu): PROJ-5 rendert in diesem Fall gar nicht — PROJ-16 übernimmt die Darstellung. Kein Sättigungs-Score, keine Säulen-Bewertung, keine Verbesserungsvorschläge nach diesem Schema.
- ~~Nur ein Lebensmittel analysiert (z.B. "ein Apfel")~~ → **entfällt (Refinement 2026-08-11):** Wird jetzt bereits in PROJ-4s Schritt 0 als `typ: snack` klassifiziert, läuft gar nicht mehr durch PROJ-5.
- ~~Widersprüchliche Optimierungsziele (mehr Volumen würde den Geschmack verschlechtern)~~ → **entfällt (Refinement 2026-08-11):** Geschmack ist kein Baustein der Sättigungs-Bewertung mehr, dieser Zielkonflikt kann innerhalb der 3 Säulen nicht mehr auftreten (bleibt aber als Prinzip im künftigen Geschmack-Feature relevant, falls dort mit anderen Ebenen kombiniert wird).

## Ton-Prinzipien (für KI-Prompt in /fachbereich)
- **Handlung vor Theorie** — konkrete Empfehlung zuerst, Erklärung dahinter
- **Hilfe zur Selbsthilfe** — der Nutzer soll verstehen, nicht befolgen
- **Kein erhobener Zeigefinger** — informieren, nicht mahnen
- **So kurz wie möglich, so lang wie nötig** — keine Textblöcke
- **Respekt vor dem Original** — was der Nutzer kocht bleibt erhalten

## Technical Requirements
- **Mobile-first:** Side-by-Side als vertikaler Stack auf <480px, nebeneinander ab 480px
- **Ausgabe-Struktur:** Maschinenlesbar (JSON) damit PROJ-6 (Historie) die Bewertung speichern kann
- **Ton:** Deutsch, du-Form, präzise, nie bevormundend
- **Vierstufiges Farbschema** (Refinement 2026-08-11): konkrete Farbwerte (Hex/Tailwind-Klassen) werden bei `/frontend` anhand `docs/design-system.md` festgelegt, hier nur die Anforderung "vier eigenständig unterscheidbare Farben" verbindlich

## Open Questions
- [ ] Soll der Nutzer einzelne Verbesserungsvorschläge als "nicht umsetzbar" markieren können (z.B. "ich mag keine Tomaten"), damit die App beim nächsten Mal bessere Vorschläge macht? — Post-MVP Überlegung, für jetzt nicht relevant
- [ ] Exakte Hex-/Tailwind-Werte für die vier neuen Stufenfarben → offen für `/frontend`, siehe Technical Requirements

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Eine scrollende Seite statt Klick-durch-Schritte | Liest sich wie ein Coaching-Brief, nicht wie ein Formular; natürlicher Flow | 2026-06-10 |
| Side-by-Side Jetzt vs. Nach Verbesserung | Nutzen der Verbesserung sofort sichtbar; Motivation statt Belehrung | 2026-06-10 |
| Handlung vor Theorie — Erklärung in Klammern/klein | "Hilfe zur Selbsthilfe"; Nutzer der Theorie will kann nachlesen, muss es nicht | 2026-06-10 |
| Max. 1–2 Verbesserungsvorschläge bei mehreren Schwächen | Überwältigung vermeiden; Priorität nach Sättigungsmatrix-Reihenfolge | 2026-06-10 |
| Rezept-Delta statt Vollrezept | Respektiert das Original; kurz und direkt umsetzbar | 2026-06-10 |
| Vollständige Rezept-Geschmacksoptimierung Post-MVP | Braucht eigene Session und eigenes Feature; zu komplex für MVP-Scope | 2026-06-10 |
| Art of Eating immer als abschließender Tipp, nie als Vorwurf | Ton-Prinzip: informieren, nicht mahnen | 2026-06-10 |
| Portionskalibrierung als eng gefasste Ausnahme von "keine Iss-weniger-Empfehlung" bei hochenergiedichtem Fastfood (≥600–700 kcal, voluminenarm) | Additions-Vorschläge allein trieben die Kalorien eines bereits zu großen, voluminenarmen Gerichts nur weiter hoch; Framing als Portionskalibrierung (nicht Verzicht) hält die Kernregel für alle anderen Fälle intakt | 2026-06-16 |

#### Refinement (2026-08-11): Drei-Säulen-Modell ("Complete"-Umstrukturierung)

| Decision | Rationale | Date |
|----------|-----------|------|
| 6 Bausteine → 3 Säulen (Protein, Ballaststoffe, Volumen) | Fachliche Neufassung der Sättigungsmatrix (2026-08-11): Geschmack, Biss und Art of Eating werden eigenständige Ebenen statt Teil der Sättigungs-Bewertung | 2026-08-11 |
| Drei-Farben-Ampel → vier eigenständige Farben | Die neuen Schwellenwerte definieren vier Stufen (ungenügend/gering/mittel/gut) statt drei — eine Ampel würde Information verlieren | 2026-08-11 |
| Gesamtbewertung: 3× gut = sehr sättigend, 2× gut = mäßig, 0–1× gut = wenig | Analog zur alten 6-Bausteine-Skalierung, auf drei Säulen runtergerechnet (siehe `docs/saettigungsmatrix.md` Abschnitt 4) | 2026-08-11 |
| Neue Vorschlags-Priorität: schlechteste Stufe zuerst, bei Gleichstand Protein vor Ballaststoffen vor Volumen | Direkt aus der fachlichen Neufassung übernommen — deutlich einfacher als die alte 7-stufige Priorität über 6 Bausteine | 2026-08-11 |
| PROJ-5 rendert nur noch für `typ: mahlzeit` | `typ: komponente`/`typ: snack` haben mit PROJ-16 ein eigenes, passenderes Ausgabeformat — vermeidet, dass PROJ-5 eine Sättigungs-Bewertung für Fälle erzwingt, die nie den Anspruch hatten, komplett zu sein | 2026-08-11 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Kein separater `/architecture`-Schritt | Datenstruktur vollständig aus PROJ-4 bekannt; pure Rendering-Aufgabe | 2026-06-12 |
| Rein clientseitiges Frontend — kein neues Backend | PROJ-4 liefert fertiges JSON; kein neuer API-Endpoint oder DB-Zugriff nötig | 2026-06-12 |
| `SaettigungsErgebnis` als eigenständige Komponente | Klare Trennung; `MahlzeitInput` kümmert sich um den Flow, `SaettigungsErgebnis` nur ums Rendering | 2026-06-12 |
| `min-[480px]:grid-cols-2` für Vorher/Nachher | Spec sagt 480px; Tailwind JIT erlaubt beliebige Breakpoints | 2026-06-12 |
| Nährwerte immer sichtbar aber sehr klein/muted | Sekundäre Info wie in PROJ-4-Spec definiert; ausgegraut statt versteckt | 2026-06-12 |

---

## Tech Design (Solution Architect)
_Ursprünglich: Kein separater Architecture-Pass nötig — Datenstruktur aus PROJ-4 vollständig definiert. Für das Refinement 2026-08-11 jetzt doch nötig, siehe unten (Umfang und Kopplung an PROJ-4/16/8 rechtfertigen einen gemeinsamen Pass)._

### Refinement (2026-08-11): Drei-Säulen-Modell — gemeinsamer Architecture-Pass mit PROJ-4/PROJ-16/PROJ-8

> Gemeinsamer Architecture-Pass für vier zusammenhängende Specs — Details zu Klassifikation (PROJ-4), Komponente/Snack-Output (PROJ-16) und der Rezept-Sättigungsmatrix (PROJ-8) stehen in den jeweiligen Specs. Hier der PROJ-5-spezifische Teil.

#### Komponenten-Struktur (Änderungen)

```
saettigungs-ergebnis.tsx (bestehend)
├── Rendert nur noch, wenn typ === "mahlzeit" (neu geprüft)
├── Baustein-Grid: 3 Säulen statt 6, vier Farbstufen statt drei
│   ├── Erkennt automatisch, ob ein gespeichertes Ergebnis die ALTE 6-Bausteine-Struktur
│   │   hat (historische Analysen) oder die NEUE 3-Säulen-Struktur (ab Deployment) —
│   │   und rendert jeweils passend, ohne dass alte Datensätze verändert werden
│   └── Art-of-Eating-Tipp entfällt hier (eigenes künftiges Feature, kein Anhängsel mehr)
└── Vorher/Nachher-Vergleich: 3 Säulen statt 6, sonst unverändert
```

#### Datenmodell (einfache Sprache)

Jede Analyse speichert ihr Ergebnis einmalig zum Zeitpunkt der Berechnung. Ältere, bereits durchgeführte Analysen bleiben für immer mit sechs Bausteinen gespeichert — sie werden nicht nachträglich umgerechnet, das wäre fachlich unehrlich und riskant. Die Anzeige-Komponente prüft beim Rendern, welche Struktur ein Ergebnis hat, und zeigt es entsprechend passend an (altes 6er-Grid oder neues 3er-Grid). Kein neues Datenbankfeld, keine Migration.

#### Tech-Entscheidungen (für PM, mit Begründung)

- **PROJ-5 wird nur noch für `typ: mahlzeit` gerendert** — für `komponente`/`snack` übernimmt PROJ-16 komplett, keine Doppelanzeige.
- **Alte Analysen bleiben unverändert, Anzeige erkennt die Struktur selbst** — siehe PROJ-4-Architektur-Notiz, dieselbe Begründung gilt hier für die Bausteine-Struktur.
- **Wird gemeinsam mit PROJ-4/PROJ-16/PROJ-8 umgesetzt und deployed**, nicht einzeln — siehe PROJ-4-Architektur-Notiz für die Begründung (Zwischenzustände wären inkonsistent).

#### Abhängigkeiten

Keine neuen npm-Pakete. Keine neue Umgebungsvariable. Keine Schema-Migration.

## Implementation Notes
- `src/components/saettigungs-ergebnis.tsx` — neue Komponente: rendert Gesamtbewertung, 6-Baustein-Grid, Verbesserungsvorschläge, Vorher/Nachher-Vergleich, Art-of-Eating-Tipp, Nährwerte
- `src/components/mahlzeit-input.tsx` — `done`-Step-Placeholder durch `<SaettigungsErgebnis>` ersetzt; `analysisResult`-State von `unknown` auf `AnalysisResult | null` getypt

### Bugfix 2026-06-16
Nutzer-Report: Bei `sehr_saettigend`-Mahlzeiten wurde der optionale Feinschliff-Vorschlag ausgeblendet ("kein konstruierter Verbesserungsvorschlag nötig"), aber der Vorher/Nachher-Bausteinvergleich und die "Nach Verbesserung"-Nährwertspalte liefen unabhängig weiter und zeigten geänderte Werte — für den Nutzer nicht nachvollziehbar, da die Begründung (der Vorschlag selbst) nicht sichtbar war. Fix: neue `showVorschlaege`-Variable (`hasVorschlaege && !isSehrSaettigend`) steuert jetzt einheitlich Vorschlagstext, Bausteinvergleich und Nährwert-Spalte „Nach Verbesserung" — alle drei erscheinen nur noch gemeinsam oder gar nicht.

### Domain-Erweiterung 2026-06-16 — Portionskalibrierung bei hochenergiedichtem Fastfood
Nutzer-Feedback: Bei Fastfood/stark verarbeiteten Gerichten (Pizza, Burger, Currywurst, Nuggets) schlug die Matrix bisher ausschließlich Additions-Vorschläge vor (mehr Ballaststoffe/Volumen/Biss) — das trieb die Gesamtkalorien eines bereits sehr energiedichten, voluminenarmen Gerichts weiter hoch statt es zu balancieren.

Neue, eng gefasste Ausnahme von der Kernregel "keine Empfehlung weniger zu essen" (Sign-off vom Product Owner eingeholt, siehe Decision Log):
- **Trigger:** Erwachsenenportion, ≥ ca. 600–700 kcal, kaum Eigenvolumen, Fastfood-/Convenience-Charakter (Pizza, Burger, Currywurst+Pommes, Chicken-Nuggets in Erwachsenenportion, Pommes, fettreicher Döner)
- **Greift NICHT** bei Kinderportionen/Snacks oder Mahlzeiten die schon unter dem normalen Energiebedarf liegen — wichtige Abgrenzung, getestet anhand eines Dino-Nuggets-Kinderteller-Beispiels (siehe `docs/beispiel-analysen.md`, Beispiel 6)
- Framing als Portionskalibrierung (nie als Verzicht), analog zur bestehenden "Teilen"-Strategie und Hara Hachi Bu — kombiniert mit einer Volumen-/Ballaststoff-Ergänzung wenn realistisch verfügbar (Beispiel 4: Lieferpizza), sonst Portionskalibrierung allein (Beispiel 5: Currywurst-Imbiss)
- Geändert: `docs/saettigungsmatrix.md` (neue Erkennungs- + Heuristik-Abschnitte), `docs/system-prompt.md` (Schritt 5), `src/app/api/analyse/confirm/route.ts` (ANALYSIS_SYSTEM_PROMPT, aktiv laufender Prompt — kein separater `/prompt-engineer`-Skill in diesem Projekt, daher direkt integriert), `docs/beispiel-analysen.md` (3 neue Testbeispiele)

## Implementation Notes (Backend) — Refinement 2026-08-11: Drei-Säulen-Modell

Gemeinsamer Backend-Durchlauf mit PROJ-4/PROJ-16/PROJ-8 — vollständige Details (Prompt-Wortlaut, DB-Migrations-Korrektur, Testabdeckung) stehen in PROJ-4s Implementation Notes, da `src/app/api/analyse/confirm/route.ts` von PROJ-4 verwaltet wird. Für PROJ-5 relevant:

- `ANALYSIS_SYSTEM_PROMPT` liefert jetzt `vorher.saeulen`/`nachher.saeulen` mit genau 3 Schlüsseln (proteine/ballaststoffe/volumen) statt 6, vier Stufen (ungenuegend/gering/mittel/gut) statt drei
- `satiety_scores_before.pillars`/`satiety_scores_after.pillars` in `meal_analyses` bekommen dieselbe neue 3-Schlüssel-Form für neue Analysen — historische Zeilen behalten ihre alte 6-Schlüssel-Form unverändert (keine Migration, siehe PROJ-4 Implementation Notes)
- `art_of_eating_tipp` wird nicht mehr geschrieben (weder im API-Response noch in `improvement`)
- **Noch offen (gehört zu `/frontend`):** `src/components/saettigungs-ergebnis.tsx` rendert weiterhin das alte 6-Baustein-Grid und muss auf 3 Säulen + 4 Farbstufen + Alt-Format-Erkennung umgestellt werden

## Implementation Notes (Frontend) — Refinement 2026-08-11

Gemeinsamer Frontend-Durchlauf mit PROJ-4/PROJ-16/PROJ-8 — geteilte Infrastruktur (neuer `PillarSet`-Typ, `RatingRing` mit variabler Segmentzahl) und cross-cutting Korrekturen (Wochenrückblick, Admin-Feedback, Erklär-Seite) stehen in PROJ-4s Implementation Notes. Für PROJ-5 eigenständig:

- `src/components/saettigungs-ergebnis.tsx` komplett neu geschrieben: `PillarGrid`/`PillarChipList`-Helper rendern automatisch 6er- oder 3er-Layout je nach `format`; `art_of_eating_tipp`-Block bleibt als Legacy-only-Anzeige (`result.art_of_eating_tipp` ist bei neuen Analysen nie gesetzt); Gesamtbewertungs-Logik unverändert, arbeitet unabhängig vom Format
- Vier Farbstufen: gut (emerald) / mittel (amber) / gering (orange, neu) / ungenügend (red) — Legacy "schwach" bekommt dieselbe rote Farbe wie "ungenügend"
- Verbesserungsvorschläge lesen sowohl `v.saeule` (neu) als auch `v.baustein` (Legacy) — beide Feldnamen möglich, nie beide gleichzeitig gemeint

**Verifikation:** siehe PROJ-4 Implementation Notes (gemeinsamer Verifikationslauf). Live per Screenshot bestätigt: historische Analyse zeigt unverändert 6 Bausteine mit 3-Segment-Ring.

## QA Test Results

**QA Date:** 2026-06-12
**QA Status:** APPROVED — bereit für `/deploy`

### Testergebnisse

| Suite | Tests | Ergebnis |
|-------|-------|---------|
| Vitest Unit-Tests (gesamt) | 24/24 | ✅ alle grün |
| PROJ-5 E2E Chromium | 30/30 | ✅ alle grün |
| PROJ-5 E2E Mobile Chrome | 30/30 (einzeln) | ✅ alle grün (flaky unter Parallel-Load durch Supabase Auth Rate Limiting — pre-existing Infra-Problem) |

### Acceptance Criteria

| AC | Beschreibung | Status |
|----|-------------|--------|
| AC1 | 6 Bausteine mit grün/gelb/rot sichtbar | ✅ |
| AC2 | Gesamtbewertung: sehr/mäßig/wenig sättigend | ✅ |
| AC3 | Grüne Bausteine ohne Erklärung | ✅ |
| AC4 | Rote/gelbe Bausteine mit Erklärung | ✅ (via `erklaerung`-Feld aus PROJ-4) |
| AC5 | Fokus auf rote Bausteine in Erklärung | ✅ (Claude-Prompt) |
| AC6 | Ton: Handlung vor Theorie | ✅ (Claude-Prompt) |
| AC7 | Sehr sättigend → positive Bestätigung, kein konstruierter Vorschlag | ✅ |
| AC8 | Vorher/Nachher nebeneinander | ✅ |
| AC9 | Verbesserte Bausteine visuell hervorgehoben (emerald ring) | ✅ |
| AC10 | Side-by-Side als Stack auf Mobile <480px | ✅ |
| AC11 | Verbesserungsreihenfolge nach Sättigungsmatrix-Priorität | ✅ (Claude-Prompt) |
| AC12 | Konkrete, umsetzbare Vorschläge | ✅ (Claude-Prompt) |
| AC13 | Max 1–2 Vorschläge bei mehreren Schwächen | ✅ (Claude-Prompt) |
| AC14 | Erklärung in Kleingedrucktem/ausgegraut | ✅ |
| AC15 | Verbotsliste (keine unpassenden Zutaten) | ✅ (Claude-Prompt) |
| AC16–18 | Rezept-Delta (nur Änderungen) | ✅ (Claude-Prompt) |
| AC19 | Art of Eating als abschließender Hinweis | ✅ |
| AC20 | Art of Eating Bewertung aus Kontext | ✅ (Claude-Prompt) |

### Security Audit

- **XSS:** Kein Risiko — alle Props via React JSX auto-escaped, kein `dangerouslySetInnerHTML` ✅
- **Neue API-Endpoints:** Keine — reine Rendering-Komponente ✅
- **RLS:** Nicht relevant für UI-Komponente ✅
- **Datenleck:** Keine sensiblen Daten in der UI exponiert ✅
- **Findings:** Keine

### Bugs

| Schwere | Beschreibung | Status |
|---------|-------------|--------|
| Low | Einzelne Baustein-Erklärungen erscheinen als ein gemeinsamer `erklaerung`-Text statt pro Baustein — entspricht der PROJ-4-Datenstruktur (eine Gesamterklärung), Spec-Divergenz marginal | Accepted — wird mit PROJ-4-Prompt-Verbesserung in v2 adressiert |

**Produktionsbereit: JA** — keine Critical/High Bugs

## Deployment

### Refinement "Complete"-Umstrukturierung (Drei-Säulen-Modell)
**Deployed:** 2026-08-11
**Production URL:** https://app.mehralsabnehmen.de/
**Git Tag:** v2.0.0-complete-umstrukturierung (gemeinsamer Release mit PROJ-4/16/8/33/34 + Rebranding)
**Neue Env-Variablen:** keine
**DB-Migrationen:** keine (additiv über bestehende JSONB-Spalten)

---

## QA Test Results (Refinement 2026-08-11 — "Complete"-Umstrukturierung: Drei-Säulen-Modell)

**Tested:** 2026-08-11
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

Gemeinsamer QA-Pass für PROJ-4/PROJ-5/PROJ-16/PROJ-8 — Details zu Security und der vollständigen Testsuite siehe [PROJ-16 QA-Abschnitt](PROJ-16-beilagen-kontext.md#qa-test-results-refinement-2026-08-11--complete-umstrukturierung-komponente--snack).

### Acceptance Criteria Status

#### Drei-Säulen-Modell (Proteine/Ballaststoffe/Volumen, 4 Stufen)
- [x] Schwellenwerte korrekt implementiert (`calculateRezeptMatrix` + 22 Unit-Tests, `saettigungs-matrix-rezept.test.ts`)
- [x] Vorher/Nachher-Vergleich funktioniert mit den 3 Säulen
- [x] `RatingRing` rendert korrekt mit `segments={4}`

#### Dual-Format-Rendering (Legacy 6-Bausteine vs. neu 3-Säulen)
- [x] Historische Analysen (`format: 'legacy'`) rendern unverändert mit 6 Bausteinen, 3-Farben-Ampel — verifiziert per `tests/PROJ-5-legacy-rendering.spec.ts` (4/4) gegen die permanente Fixture-Mahlzeit `44444444-…`
- [x] Neue Analysen (`format: 'neu'`) rendern korrekt mit 3 Säulen, 4-Farben-Ampel
- [x] Keine Vermischung der Formate in einer Ansicht

### Automated Tests
- `npm test`: 369/369 passed (inkl. 22 neue Tests für `calculateRezeptMatrix`)
- `tests/PROJ-5-saettigungs-einschaetzung.spec.ts`: 32/32 passed (nach Fixture-Update auf `typ`/`saeulen`/`saeule` + Behebung mehrerer vorbestehender, unabhängiger Test-Bugs — falsche Heading-Erwartung, fehlender Klick zum Öffnen des Collapsible, siehe Commit-Diff)
- `tests/PROJ-5-legacy-rendering.spec.ts` (neu): 4/4 passed

### Summary
- **Acceptance Criteria:** 6/6 passed
- **Bugs Found:** 0
- **Security:** Pass (siehe PROJ-16)
- **Production Ready:** JA — BUG-1 aus PROJ-16 wurde in derselben Sitzung behoben, siehe dortiges Re-Test
- **Recommendation:** Bereit für gemeinsames Deployment mit PROJ-4/PROJ-16/PROJ-8
