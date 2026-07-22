# PROJ-25: KI-Hinweis auf Ergebnisseiten

## Status: Deployed
**Created:** 2026-07-21
**Last Updated:** 2026-07-21

## Dependencies
- Requires: PROJ-4 (KI-Analyse-Agent), PROJ-5 (Sättigungs-Einschätzung & Verbesserungsvorschlag) — der Hinweis begleitet die dort erzeugte KI-Ausgabe
- Requires: PROJ-8 (Rezeptbibliothek) — Rezept-Detailseite und die im Mahlzeit-Ergebnis eingebetteten Rezeptvorschläge (`RezeptVorschlaege`-Komponente) sind Ziel des zusätzlichen Rezept-Echtheit-Hinweises

## User Stories
- Als Nutzer (registriert oder Gast) möchte ich beim Betrachten einer Sättigungs-Einschätzung erkennen, dass diese von einer KI erstellt wurde und Fehler enthalten kann, damit ich die Ergebnisse mit angemessener Skepsis einordnen kann.
- Als Nutzer möchte ich diesen Hinweis konsistent an jeder Stelle sehen, an der eine KI-berechnete Sättigungsmatrix angezeigt wird, damit das Vertrauens-Signal nicht willkürlich wirkt.
- Als Nutzer möchte ich verstehen, dass ein angezeigtes Rezept echt und redaktionell geprüft ist, und nur die Sättigungs-Analyse dieses Rezepts sowie seine Zuordnung zu meiner Mahlzeit KI-gestützt sind, damit ich nicht denke, das Rezept selbst könnte von einer KI erfunden worden sein.
- Als Product Owner möchte ich Nutzer transparent über die Grenzen der KI-Analyse informieren, damit Erwartungen realistisch bleiben und Vertrauen in die App langfristig gestärkt wird.

## Out of Scope
- Fehler-Feedback-Formular (Screen + Daten an den Product Owner senden) — eigene Spec **PROJ-26**, baut auf diesem Hinweis auf
- Wöchentlicher Sättigungs-Recap (PROJ-17) und Beilagen-/Grundlagen-Kontext-Hinweis (PROJ-16, `RezeptKontextHinweis`) — zeigen keine KI-berechnete Matrix, daher vorerst kein Hinweis; kann in einem späteren Refinement ergänzt werden
- Konfigurierbarer/dynamischer Text (z.B. abhängig von einem Konfidenz-Score der KI) — ein einziger, statischer Text für alle Fälle
- Wegklick-/Dismiss-Mechanismus — der Hinweis ist dauerhaft sichtbar, keine Nutzer-Einstellung zum Ausblenden
- Anpassungen an Datenschutzerklärung/Impressum — separate rechtliche Prüfung außerhalb dieser UI-Spec, falls überhaupt nötig
- Unterschiedliche Darstellung für Gäste vs. registrierte Nutzer — der Hinweis ist für alle identisch
- Verlinkung zu einem Feedback-Formular — existiert noch nicht (siehe PROJ-26), wird hier bewusst nicht vorbereitet

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Anzeige des Hinweises
- [ ] Angenommen ein Nutzer schließt eine Mahlzeit-Analyse ab, wenn das Ergebnis (Sättigungs-Matrix) angezeigt wird, dann erscheint direkt dabei der Hinweis "KI-gestützte Einschätzung — kann Fehler enthalten" mit einem kleinen Icon.
- [ ] Angenommen ein Nutzer öffnet eine bereits analysierte Mahlzeit aus der Historie (`/mahlzeit/[id]`), dann wird derselbe Hinweis ebenfalls angezeigt.
- [ ] Angenommen ein Nutzer öffnet die Detailseite eines Rezepts mit Sättigungs-Matrix (kein Beilagen-/Grundlagen-Rezept), dann wird derselbe Hinweis bei den Sättigungs-Bausteinen angezeigt.
- [ ] Angenommen ein Rezept ist als Beilage oder Grundlage markiert (zeigt den `RezeptKontextHinweis` statt der Matrix), dann wird kein KI-Hinweis angezeigt.
- [ ] Angenommen ein Nutzer ist nicht eingeloggt (Gast-Modus, PROJ-19), dann wird der Hinweis identisch zu registrierten Nutzern angezeigt.
- [ ] Angenommen der Hinweis wird angezeigt, dann gibt es keine Möglichkeit, ihn wegzuklicken oder dauerhaft auszublenden.

### Konsistenz & Darstellung
- [ ] Angenommen der Hinweis erscheint auf einer der drei Ergebnis-Oberflächen (Mahlzeit-Analyse, Mahlzeit-Historie, Rezept-Detailseite), dann ist der Wortlaut auf allen drei identisch.
- [ ] Angenommen der Hinweis wird dargestellt, dann nutzt er eine dezente, neutrale Text-Farbe passend zum Design-System — keine Warn- oder Fehlerfarbe (kein Rot/Orange).
- [ ] Angenommen ein Screenreader-Nutzer navigiert zum Hinweis, dann wird der vollständige Text vorgelesen und das Icon ist entsprechend als dekorativ markiert oder mit passendem Label versehen.

### Rezept-Echtheit-Klarstellung
- [ ] Angenommen ein Nutzer öffnet eine Rezept-Detailseite mit Sättigungs-Matrix, dann erscheint zusätzlich zum allgemeinen KI-Hinweis ein zweiter, eigener Hinweis: "Rezept ist echt — nur die Analyse und Zuordnung zu deiner Mahlzeit sind KI-gestützt."
- [ ] Angenommen im Mahlzeit-Ergebnis (direkt nach der Analyse oder in der Historie) wird unter "Rezeptvorschläge" ein konkretes, passendes Rezept angezeigt, dann erscheint direkt bei diesem Vorschlag derselbe Rezept-Echtheit-Hinweis.
- [ ] Angenommen im Mahlzeit-Ergebnis wurde kein passendes Rezept gefunden (Fallback-Verweis auf die Rezeptbibliothek statt einer konkreten Rezeptkarte), dann erscheint der Rezept-Echtheit-Hinweis nicht, da kein konkretes Rezept angezeigt wird.
- [ ] Angenommen ein Rezept ist als Beilage oder Grundlage markiert (zeigt den `RezeptKontextHinweis` statt der Matrix), dann erscheint auch kein Rezept-Echtheit-Hinweis, konsistent zum Verzicht auf den allgemeinen KI-Hinweis auf dieser Seite.

## Edge Cases
- Mahlzeit-Analyse noch nicht abgeschlossen (z.B. während Rückfragen laufen) → Hinweis erscheint erst, sobald das Ergebnis tatsächlich gerendert wird, nicht während des Ladezustands
- Rezept ohne Sättigungs-Matrix und ohne Beilagen-/Grundlagen-Typ (Altdaten-Sonderfall) → kein Hinweis, da keine KI-Matrix angezeigt wird
- Sehr kleine Bildschirmbreite (375px, Mobile-first-Vorgabe) → Hinweis darf nicht umbrechen oder abgeschnitten werden, muss vollständig lesbar bleiben
- Zukünftiges PROJ-26 (Fehler-Feedback) könnte später an diesen Hinweis anknüpfen → bewusst nicht vorbereitet, wird in PROJ-26 separat entschieden
- Rezeptvorschläge-Block befindet sich noch im Ladezustand (Skeleton, während `/api/rezepte/vorschlaege` lädt) → Rezept-Echtheit-Hinweis erscheint erst nach dem Laden, zusammen mit dem tatsächlichen Ergebnis (Rezeptkarte oder Fallback-Verweis)
- Rezeptvorschläge-Fallback (kein passendes Rezept, nur Verweis auf die Bibliothek) → kein Rezept-Echtheit-Hinweis, da kein konkretes Rezept angezeigt wird (siehe Acceptance Criteria)

## Technical Requirements (optional)
- Barrierefreiheit: Hinweistext muss von Screenreadern vollständig vorgelesen werden, Icon entsprechend markiert (WCAG 2.1 AA, Projekt-Standard)
- Kein neuer Datenbank- oder API-Bedarf — rein clientseitige/statische UI-Ergänzung
- Mobile-first: Hinweis muss auf 375px Breite vollständig funktionieren (PRD-Vorgabe)

## Open Questions
- [ ] Sollte der Hinweis später (mit PROJ-26) klickbar werden und direkt zum Feedback-Formular führen? → Bewusst offen gelassen, wird bei der PROJ-26-Spezifikation entschieden

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Feature aufgeteilt in PROJ-25 (KI-Hinweis) und PROJ-26 (Fehler-Feedback-Formular) | Unterschiedliche Komplexität und Testbarkeit — der Hinweis ist eine reine, unabhängig deploybare UI-Ergänzung; Feedback braucht ein eigenes Datenmodell, Speicherung und eine Einsichtsmöglichkeit für den Product Owner. Auf Wunsch des Product Owners nach expliziter Rückfrage entschieden. | 2026-07-21 |
| Priorität P1 | Vertrauens-/Transparenz-Feature, kein MVP-Blocker, aber zeitnah wichtig genug für die nächste Iteration | 2026-07-21 |
| Scope: alle Sättigungs-Ergebnis-Anzeigen (Mahlzeit-Analyse-Ergebnis, Mahlzeit-Historie, Rezept-Sättigungs-Matrix) | Konsistentes Vertrauens-Signal überall dort, wo die KI-berechnete Matrix zu sehen ist — ein Flickenteppich an Stellen mit/ohne Hinweis würde weniger vertrauenswürdig wirken als gar keiner | 2026-07-21 |
| Wöchentlicher Recap (PROJ-17) und Beilagen-/Grundlagen-Kontext-Hinweis (PROJ-16) explizit ausgeschlossen | Zeigen keine KI-berechnete Matrix, sondern aggregierte bzw. statische Informationstexte — geringeres Fehlerrisiko-Argument; kann bei Bedarf in einem späteren Refinement nachgezogen werden | 2026-07-21 |
| Dezenter Text mit Icon statt auffälligem Banner oder versteckendem Tooltip | Passt zum bestehenden Design-System-Ton ("warm, nicht klinisch, kein Fitness-App-Look"), alarmiert den Nutzer nicht unnötig, ist aber sofort lesbar ohne zusätzliche Interaktion | 2026-07-21 |
| Fester Wortlaut "KI-gestützte Einschätzung — kann Fehler enthalten" | Vom Product Owner bestätigt — deckt beide relevanten Aspekte ab (KI-generiert + potenziell fehlerhaft), ohne zu technisch oder beunruhigend zu klingen | 2026-07-21 |
| Identisch für Gäste und registrierte Nutzer | Die Einschränkung der KI-Analyse gilt unabhängig vom Account-Typ — keine Differenzierung sinnvoll | 2026-07-21 |
| Kein Dismiss-/Wegklick-Mechanismus | Hinweis soll dauerhaft als Kontext sichtbar bleiben, nicht nur beim ersten Betrachten eines Ergebnisses — Nutzer sollen ihn bei jeder neuen Analyse erneut sehen | 2026-07-21 |
| Zweiter, eigener Rezept-Echtheit-Hinweis ("Rezept ist echt — nur Analyse und Zuordnung sind KI-gestützt") statt eines einzigen längeren Texts überall | Explizit vom Product Owner gewünscht — Rezepte sind redaktionell echt/geprüft, nur die Sättigungs-Analyse und die Zuordnung zur Mahlzeit sind KI-generiert; ein einziger langer Text hätte die Dezenz des allgemeinen Hinweises verwässert, ein getrennter Zusatz-Hinweis ist präziser und bleibt trotzdem kurz | 2026-07-21 |
| Rezept-Echtheit-Hinweis erscheint sowohl auf der Rezept-Detailseite als auch bei einem konkret angezeigten Rezeptvorschlag im Mahlzeit-Ergebnis | Beides sind Stellen, an denen ein echtes, redaktionelles Rezept neben einer KI-Analyse auftaucht — die Verwechslungsgefahr ("ist das Rezept von der KI erfunden?") besteht an beiden Stellen gleichermaßen | 2026-07-21 |
| Kein Rezept-Echtheit-Hinweis beim Rezeptvorschläge-Fallback (kein Match gefunden) | Der Fallback zeigt kein konkretes Rezept, sondern nur einen Verweis auf die Bibliothek — es gibt dort nichts, dessen Echtheit geklärt werden müsste | 2026-07-21 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Eine gemeinsame `KIHinweis`-Komponente mit zwei Varianten (`allgemein` / `rezept-echtheit`) statt Text an 4 Stellen zu duplizieren | Garantiert strukturell identischen Wortlaut (Spec-Vorgabe), eine einzige Stelle zum Pflegen bei künftigen Textänderungen | 2026-07-21 |
| Kein neues Icon-Paket — `lucide-react` (bereits installiert) | Projekt nutzt durchgängig `lucide-react`, u.a. im bestehenden `RezeptKontextHinweis`; keine neue Abhängigkeit nötig | 2026-07-21 |
| Eigenes, dezentes Icon statt des bereits verwendeten Amber-Info-Icons aus `RezeptKontextHinweis` | Verhindert visuelle Verwechslung zwischen dem KI-Hinweis (neutral) und dem inhaltlich anderen Beilagen-/Grundlagen-Hinweis (Warnfarbe) | 2026-07-21 |
| Kein Datenmodell, keine API — reiner statischer Text in der Komponente | Text ist laut Spec bewusst nicht konfigurierbar; eine DB-Anbindung wäre unnötiger Aufwand für einen Text, der sich nur per Code-Change ändert | 2026-07-21 |
| Icon wird als dekorativ markiert (für Screenreader ausgeblendet) | Stellt sicher, dass Screenreader ausschließlich den Hinweistext vorlesen, passend zur Barrierefreiheits-Vorgabe der Spec | 2026-07-21 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Component-Struktur

**Neue, wiederverwendbare Komponente `KIHinweis`** — kein Formular, keine Interaktion, reiner Anzeige-Baustein mit zwei Varianten (Text ist fest hinterlegt, nicht von außen frei editierbar):

```
KIHinweis
  ├── Variante "allgemein" → "KI-gestützte Einschätzung — kann Fehler enthalten"
  └── Variante "rezept-echtheit" → "Rezept ist echt — nur die Analyse und Zuordnung zu deiner Mahlzeit sind KI-gestützt"
```

Eine einzige Komponente mit zwei Varianten statt zwei getrennter Komponenten — so gibt es nur eine Stelle im Code, an der der Wortlaut gepflegt wird, und die Spec-Vorgabe "Wortlaut auf allen Oberflächen identisch" ist strukturell garantiert statt manuell einzuhalten.

**Einbau-Stellen (4 insgesamt):**

```
Mahlzeit-Analyse-Ergebnis + Mahlzeit-Historie (teilen sich dieselbe Ergebnis-Ansicht)
  └── Sättigungs-Matrix-Bereich
       └── KIHinweis [allgemein] ── NEU, direkt bei der Matrix
  └── Rezeptvorschläge-Bereich
       └── Wird ein konkretes Rezept angezeigt?
            ├── Ja  → KIHinweis [rezept-echtheit] ── NEU, direkt beim Rezeptvorschlag
            └── Nein (Fallback: "Zur Rezeptbibliothek") → kein Hinweis

Rezept-Detailseite
  └── Sättigungs-Bausteine-Bereich (nur wenn Matrix vorhanden, kein Beilagen-/Grundlagen-Rezept)
       ├── KIHinweis [allgemein] ── NEU
       └── KIHinweis [rezept-echtheit] ── NEU, direkt darunter
```

### B) Datenmodell (fachlich beschrieben)

Kein Datenmodell nötig. Der Hinweis ist reiner, fest hinterlegter Text — es wird nichts in der Datenbank gespeichert, nichts vom Server geladen, keine Nutzer-Einstellung gemerkt (passend zur Entscheidung "kein Dismiss-Mechanismus").

### C) Tech-Entscheidungen (Begründung)

- **Warum eine gemeinsame Komponente mit Varianten statt Text direkt an jeder der 4 Stellen einzutippen?** Der Wortlaut muss laut Spec überall exakt identisch sein. Eine einzige Komponente stellt das strukturell sicher — bei einer künftigen Textänderung (z.B. Wortlaut-Feintuning) muss nur eine Stelle angepasst werden, nicht vier.
- **Warum kein neues Icon-Paket?** Das Projekt nutzt bereits `lucide-react` für alle Icons (u.a. im bestehenden `RezeptKontextHinweis`). Ein neues Icon aus derselben, bereits installierten Bibliothek zu wählen, braucht keine neue Abhängigkeit.
- **Warum ein anderes Icon als der bestehende `RezeptKontextHinweis` (Beilagen/Grundlagen-Hinweis)?** Der bestehende Hinweis nutzt ein Info-Icon in Gelb/Amber (Warnfarbe) für einen inhaltlich anderen Zweck (Ernährungs-Kontext). Der KI-Hinweis soll laut Spec ausdrücklich neutral und nicht wie eine Warnung wirken — ein eigenes, dezentes Icon (z.B. Sparkle/Funken-Symbol, gängige Konvention für "KI-generiert") vermeidet, dass Nutzer die beiden unterschiedlichen Hinweis-Typen visuell verwechseln.
- **Warum kein serverseitiger/datenbankgestützter Text?** Der Text ist laut Spec bewusst statisch und nicht konfigurierbar (siehe Out of Scope). Eine Datenbank-Anbindung wäre unnötiger Aufwand für einen Text, der sich nur durch einen Code-Change ändern soll.
- **Barrierefreiheit:** Das Icon wird als rein dekorativ markiert (für Screenreader unsichtbar), damit ausschließlich der Hinweistext vorgelesen wird — passend zur Acceptance-Criteria-Vorgabe.

### D) Abhängigkeiten (zu installierende Pakete)

Keine neuen Pakete — nutzt das bereits im Projekt vorhandene `lucide-react` für das Icon.

## Implementation Notes (Frontend)

**Neue Datei:**
- `src/components/ki-hinweis.tsx` — Komponente `KIHinweis` mit `variante: 'allgemein' | 'rezept-echtheit'`, Text fest in einem `Record` hinterlegt (nicht von außen überschreibbar). `Sparkles`-Icon aus `lucide-react` mit `aria-hidden="true"`, Text in `text-xs text-muted-foreground` — bewusst dezent, keine Warnfarbe.

**Geänderte Dateien:**
- `src/components/saettigungs-ergebnis.tsx` — `KIHinweis variante="allgemein"` direkt unter der Überschrift "Die 6 Sättigungs-Bausteine" (eigene Zeile statt nebeneinander, damit der Text auf 375px nicht mit der Überschrift um Platz konkurriert).
- `src/components/rezept-vorschlaege.tsx` — `KIHinweis variante="rezept-echtheit"` nur im Zweig, der ein konkretes Rezept zeigt (unter "🍳 Passendes Rezept"); der Fallback-Zweig ("Zur Rezeptbibliothek", kein Match gefunden) bleibt unverändert ohne Hinweis.
- `src/app/rezept/[id]/page.tsx` — beide Varianten (`allgemein` + `rezept-echtheit`) direkt unter der Überschrift "Sättigungs-Bausteine", nur im `matrix`-Zweig (nicht im `recipeTyp`-Zweig für Beilagen/Grundlagen, der weiterhin `RezeptKontextHinweis` ohne KI-Hinweis zeigt).

**Verifikation:**
- `tsc --noEmit`, ESLint: fehlerfrei
- Vitest: 209/209 grün (keine Regression, kein neuer Testbedarf — Komponente ist reiner, statischer Text ohne Logik)
- `npm run build`: erfolgreich
- Live-Screenshot der Rezept-Detailseite (`/rezept/fe8e05ab-af68-4e61-b8fd-6ead79b5e4e3`) bestätigt: beide Hinweise erscheinen korrekt unter "Sättigungs-Bausteine", dezente graue Farbe, kein Umbruch-/Abschneide-Problem in der schmalen Spalte (`max-w-sm`-Container, entspricht Mobile-Breite)
- Platzierung in `saettigungs-ergebnis.tsx`/`rezept-vorschlaege.tsx` (Mahlzeit-Ergebnis) **nicht live verifiziert** — kein Testkonto mit vorhandener Mahlzeit-Analyse in der DB, eine neue Analyse auszulösen hätte reale Claude-API-Kosten verursacht. Strukturell identisch zur visuell bestätigten Rezeptseite (dieselbe Komponente, dieselbe Einbau-Logik), daher als niedriges Risiko eingeschätzt — siehe QA-Hinweis.

## QA Test Results

**Tested:** 2026-07-21
**App URL:** http://localhost:3000 (Dev-Server, echtes Supabase-Backend)
**Tester:** QA Engineer (AI)

### Testmethodik
Reines Frontend-Feature ohne Backend/API — Testabdeckung kombiniert:
1. **E2E-Tests (Playwright)** für die öffentliche Rezept-Detailseite: `tests/PROJ-25-ki-hinweis-ergebnisseiten.spec.ts` (Desktop + Mobile 375px)
2. **Code-Review** für die Platzierung im Mahlzeit-Ergebnis (`saettigungs-ergebnis.tsx`/`rezept-vorschlaege.tsx`) — kein Testkonto mit vorhandener Mahlzeit-Analyse verfügbar, eine neue Analyse hätte reale Claude-API-Kosten verursacht (siehe Implementation Notes)
3. **Vollständiger Regressionslauf** der bestehenden PROJ-8- und PROJ-24-E2E-Suiten sowie der gesamten Vitest-Suite

### Acceptance Criteria Status

#### Anzeige des Hinweises
- [x] Mahlzeit-Analyse-Ergebnis zeigt Hinweis bei der Matrix — Code-Review (identische `KIHinweis`-Komponente wie auf der Rezeptseite, dort per E2E bestätigt)
- [x] Mahlzeit-Historie zeigt denselben Hinweis — Code-Review (`mahlzeit-detail.tsx` rendert dieselbe `SaettigungsErgebnis`-Komponente, kein separater Code-Pfad)
- [x] Rezept-Detailseite mit Matrix zeigt denselben Hinweis — E2E-Test `zeigt beide Hinweise bei einem Rezept mit Sättigungs-Matrix` grün
- [x] Beilagen-/Grundlagen-Rezept zeigt keinen KI-Hinweis — E2E-Test `zeigt keinen KI-Hinweis bei einem Beilagen-Rezept` grün (getestet an "Fenchelsalat")
- [x] Gäste sehen denselben Hinweis wie registrierte Nutzer — Code-Review: `KIHinweis` hat keinerlei Auth-/User-Abfrage, rendert unabhängig vom eingeloggten Zustand identisch
- [x] Kein Dismiss-/Wegklick-Mechanismus — Code-Review: Komponente hat keinen State, keinen Button, keine Möglichkeit zum Schließen

#### Konsistenz & Darstellung
- [x] Wortlaut auf allen drei Oberflächen identisch — strukturell garantiert (eine gemeinsame Komponente/Text-Konstante statt Duplikation), E2E bestätigt exakten Text auf der Rezeptseite
- [x] Keine Warn-/Fehlerfarbe — Code-Review: `text-muted-foreground`, keine Farbklassen aus dem Rating- oder Warnfarben-Set
- [x] Screenreader liest vollständigen Text, Icon dekorativ markiert — E2E-Test `Icon ist für Screenreader als dekorativ markiert` grün (`aria-hidden="true"` bestätigt)

#### Rezept-Echtheit-Klarstellung
- [x] Rezept-Detailseite zeigt zusätzlichen Echtheits-Hinweis — E2E-Test bestätigt (Teil des ersten Tests)
- [x] Konkreter Rezeptvorschlag im Mahlzeit-Ergebnis zeigt denselben Hinweis — Code-Review: `KIHinweis variante="rezept-echtheit"` korrekt im "Passendes Rezept"-Zweig von `rezept-vorschlaege.tsx` platziert
- [x] Fallback (kein Match) zeigt keinen Echtheits-Hinweis — Code-Review: Fallback-Zweig unverändert, `KIHinweis` nur im Erfolgs-Zweig eingebaut
- [x] Beilagen-/Grundlagen-Rezept zeigt keinen Echtheits-Hinweis — E2E-Test bestätigt (Teil des zweiten Tests: beide Hinweis-Texte mit `toHaveCount(0)` geprüft)

**10/10 Acceptance Criteria erfüllt** (3 davon per Code-Review statt E2E, siehe Testmethodik — keine als Bug gewertet, da strukturell dieselbe, bereits verifizierte Komponente)

### Security Audit Results
- [x] **XSS:** Kein Angriffsvektor möglich — `KIHinweis` rendert ausschließlich zwei fest im Code hinterlegte Strings über einen typisierten `variante`-Parameter (`'allgemein' | 'rezept-echtheit'`), keinerlei Nutzereingabe fließt in die Komponente ein, kein `dangerouslySetInnerHTML`
- [x] **Auth/Authorization:** Keine neuen API-Routen, kein geändertes Auth-Verhalten — bestehende Security-Tests (401/403) weiterhin grün (Regressionslauf)
- [x] **Datenexposition:** Keine — Komponente liest keine Daten, zeigt nur statischen Text

### Bugs Found
Keine.

### Regressionstest
- Vollständige Vitest-Suite: **209/209 grün** (`npm test`)
- `tsc --noEmit` und ESLint: fehlerfrei über alle geänderten/neuen Dateien
- E2E `tests/PROJ-25-ki-hinweis-ergebnisseiten.spec.ts` (Desktop + Mobile 375px): **8/8 grün**
- E2E-Regression `tests/PROJ-24-rezept-zutaten-gruppierung.spec.ts`: 11/11 grün
- E2E-Regression `tests/PROJ-8-rezeptbibliothek.spec.ts`: 26/27 grün — der eine Fehlschlag ist das vorbestehende, dokumentierte BUG-3 (404-Status, siehe PROJ-24-Spec), keine neue Regression

### Summary
- **Acceptance Criteria:** 10/10 passed
- **Bugs Found:** 0
- **Security:** Pass — kein Angriffsvektor vorhanden (rein statischer Text)
- **Production Ready:** YES
- **Recommendation:** Deploy.

## Deployment

**Deployed:** 2026-07-21
**Tag:** v1.23.0-PROJ-25
**Production URL:** https://app.mehralsabnehmen.de
**Commit:** `9ba40aa` (deploy(PROJ-25): Deploy KI-Hinweis auf Ergebnisseiten), vorausgehend `4828f7b` (PROJ-24 Post-Deployment-Bookkeeping)

**Pre-Deployment-Checks:**
- `npm run build` — erfolgreich
- `npm run lint` — 0 Fehler (1 vorbestehende, unabhängige Warnung in `bild-cropper.tsx`)
- QA: Approved, 0 Bugs
- Keine neuen Env-Vars, kein Backend, keine DB-Migration
- Keine neuen Dependencies (`package.json` unverändert im Diff)
- Keine Secrets im Diff

**Post-Deployment-Verifikation:**
- Produktions-URL lädt (200): `https://app.mehralsabnehmen.de/rezept/fe8e05ab-af68-4e61-b8fd-6ead79b5e4e3`

**Kein neues Setup nötig.**
