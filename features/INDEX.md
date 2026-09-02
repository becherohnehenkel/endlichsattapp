# Feature Index

> Central tracking for all features. Updated by skills automatically.

## Status Legend
- **Roadmap** - `/init` done, feature identified in feature map, no spec file yet
- **Planned** - `/write-spec` done, full spec written, architecture not yet designed
- **Architected** - `/architecture` done, tech design approved, ready to build
- **In Progress** - `/frontend` or `/backend` active or completed, not yet in QA
- **In Review** - `/qa` active, testing in progress
- **Approved** - `/qa` passed, no critical/high bugs, ready to deploy
- **Deployed** - `/deploy` done, live in production

## Features

| ID | Feature | Priority | Status | Abhängigkeiten | Spec |
|----|---------|----------|--------|----------------|------|
| PROJ-1 | Supabase Infrastructure Setup | P0 | Deployed | — | [Spec](PROJ-1-supabase-infrastructure.md) |
| PROJ-2 | User Authentication | P0 | Deployed | PROJ-1 | [Spec](PROJ-2-user-authentication.md) |
| PROJ-3 | Mahlzeit-Input (Foto & Freitext) | P0 | Deployed | PROJ-1, PROJ-2 | [Spec](PROJ-3-mahlzeit-input.md) |
| PROJ-4 | KI-Analyse-Agent (Rückfragen + BLS + Makros) (Refinement: Schritt-0-Klassifikation "Complete") | P0 | Deployed | PROJ-3, Sättigungsmatrix verifiziert | [Spec](PROJ-4-ki-analyse-agent.md) |
| PROJ-5 | Sättigungs-Einschätzung & Verbesserungsvorschlag (Refinement: Drei-Säulen-Modell "Complete") | P0 | Deployed | PROJ-4 | [Spec](PROJ-5-saettigungs-einschaetzung.md) |
| PROJ-6 | Mahlzeit-Historie | P1 | Deployed | PROJ-1, PROJ-2, PROJ-4, PROJ-5 | [Spec](PROJ-6-mahlzeit-historie.md) |
| PROJ-7 | Ernährungs-Tagebuch & Inspiration | P2 | Roadmap | PROJ-6 | — |
| PROJ-8 | Rezeptbibliothek (Refinement: Drei-Säulen-Modell "Complete") | P1 | Deployed | PROJ-1, PROJ-2, PROJ-4, PROJ-5 | [Spec](PROJ-8-rezeptbibliothek.md) |
| PROJ-9 | Rezept-Zutat: Anzeigename + OFF-Fallback | P1 | Deployed | PROJ-8 | [Spec](PROJ-9-rezept-zutat-datenquellen.md) |
| PROJ-10 | Foto-Scan-Limit pro Nutzer | P1 | Deployed | PROJ-1, PROJ-2 | [Spec](PROJ-10-foto-scan-limit.md) |
| PROJ-11 | Paywall (Refinement: Trial-Trigger-Fix + Rückfall-Modell statt harter Sperre) | P2 | Deployed | PROJ-1, PROJ-2, PROJ-8, PROJ-10, PROJ-19 | [Spec](PROJ-11-paywall.md) |
| PROJ-12 | Invite-Codes | P2 | Deployed | PROJ-11 | [Spec](PROJ-12-invite-codes.md) |
| PROJ-13 | Admin-Dashboard | P2 | Deployed | PROJ-8, PROJ-12 | [Spec](PROJ-13-admin-dashboard.md) |
| PROJ-14 | Kontoübersicht & Widerrufsbutton | P1 | Deployed | PROJ-2, PROJ-11 | [Spec](PROJ-14-konto-widerruf.md) |
| PROJ-15 | PWA & Native Navigation | P1 | Deployed | PROJ-2, PROJ-13 | [Spec](PROJ-15-pwa-native-navigation.md) |

| PROJ-16 | Beilagen-Kontext (Refinement: Komponente & Snack "Complete") | P1 | Deployed | PROJ-8, PROJ-4, PROJ-5 | [Spec](PROJ-16-beilagen-kontext.md) |
| PROJ-17 | Wöchentlicher Sättigungs-Recap | P2 | Deployed | PROJ-4, PROJ-5, PROJ-6 | [Spec](PROJ-17-woechentlicher-saettigungs-recap.md) |
| PROJ-18 | Token-Optimierung Foto-Analyse | P1 | Deployed | PROJ-3, PROJ-4 | [Spec](PROJ-18-token-optimierung-foto-analyse.md) |
| PROJ-19 | Gast-Modus (Anonyme Nutzung ohne Account) | P1 | Deployed | PROJ-1, PROJ-2, PROJ-10, PROJ-11 | [Spec](PROJ-19-gast-modus.md) |
| PROJ-20 | Datenschutzerklärung & Impressum | P1 | Deployed | PROJ-2, PROJ-19 | [Spec](PROJ-20-datenschutz-impressum.md) |
| PROJ-21 | Foto-Qualität in der App-Anzeige | P1 | Deployed | PROJ-3, PROJ-18 | [Spec](PROJ-21-foto-qualitaet-anzeige.md) |
| PROJ-22 | App-Performance & Perceived Speed | P1 | Deployed | PROJ-1–PROJ-21 | [Spec](PROJ-22-app-performance.md) |
| PROJ-23 | Prompt Caching für Analyse-Routen | P2 | Planned | PROJ-4, PROJ-5 | [Spec](PROJ-23-prompt-caching.md) |
| PROJ-24 | Zutaten-Reihenfolge & Gruppierung im Rezept-Editor (+ Markdown-Formatierung Zubereitung) | P2 | Deployed | PROJ-8 | [Spec](PROJ-24-rezept-zutaten-gruppierung.md) |
| PROJ-25 | KI-Hinweis auf Ergebnisseiten | P1 | Deployed | PROJ-4, PROJ-5, PROJ-8 | [Spec](PROJ-25-ki-hinweis-ergebnisseiten.md) |
| PROJ-26 | Fehler-Feedback zu KI-Ergebnissen | P2 | Deployed | PROJ-25, PROJ-4, PROJ-5, PROJ-8, PROJ-19 | [Spec](PROJ-26-fehler-feedback-ki-ergebnisse.md) |
| PROJ-27 | Getrennte Test- und Produktions-Landschaften (Staging-Umgebung) | P2 | Planned | PROJ-1, PROJ-11 | [Spec](PROJ-27-staging-umgebung.md) |
| PROJ-28 | Zutatenliste-Transparenz auf Ergebnis- und Historie-Seite | P1 | Deployed | PROJ-4, PROJ-6 | [Spec](PROJ-28-zutatenliste-transparenz.md) |
| PROJ-29 | Nährwert-Verbesserungen im Rezept-Editor (Zutatensuche + Live-Counter) | P2 | Deployed | PROJ-8, PROJ-9 | [Spec](PROJ-29-rezept-editor-naehrwerte.md) |
| PROJ-30 | Rezept-Eigentümerschaft & Filter (offiziell vs. eigene Rezepte) | P1 | Deployed | PROJ-8 | [Spec](PROJ-30-rezept-eigentuemerschaft-filter.md) |
| PROJ-31 | Nutzer legen eigene Rezepte an | P1 | Deployed | PROJ-30 | [Spec](PROJ-31-nutzer-eigene-rezepte.md) |
| PROJ-32 | Rezept aus gescannter Mahlzeit anlegen ("wie gescannt" / "mit mehr Sättigung") | P1 | Deployed | PROJ-30, PROJ-31, PROJ-4, PROJ-5 | [Spec](PROJ-32-rezept-aus-mahlzeit.md) |
| PROJ-33 | Geschmacks-Score (zweite Sektion der "Complete"-Umstrukturierung) | P1 | Deployed | PROJ-3, PROJ-4, PROJ-5, PROJ-16, PROJ-8 | [Spec](PROJ-33-geschmacks-score.md) |
| PROJ-34 | Art of Eating (dritte Sektion der "Complete"-Umstrukturierung) | P1 | Deployed | PROJ-3, PROJ-4, PROJ-5, PROJ-16 | [Spec](PROJ-34-art-of-eating.md) |
| PROJ-35 | Bottom-Navigation & Kontobereich-Neuordnung | P1 | Deployed | PROJ-2, PROJ-8, PROJ-13, PROJ-19 | [Spec](PROJ-35-bottom-navigation-kontobereich.md) |
| PROJ-36 | Ernährung-Hub (Übersichtsseite) | P1 | Deployed | PROJ-35, PROJ-8 | [Spec](PROJ-36-ernaehrung-hub.md) |
| PROJ-37 | So geht abnehmen (inkl. Kcal-Rechner) | P1 | Deployed | PROJ-36 | [Spec](PROJ-37-so-geht-abnehmen.md) |
| PROJ-38 | Emotionales Essen (Refinement: Onboarding, Timer, Atemübung, Reiz-Ampel "Complete") | P2 | Deployed | PROJ-36 | [Spec](PROJ-38-emotionales-essen.md) |
| PROJ-39 | Heißhunger | P2 | Deployed | PROJ-36, PROJ-38 | [Spec](PROJ-39-heisshunger.md) |
| PROJ-40 | Kalorien | P2 | Deployed | PROJ-36, PROJ-37 | [Spec](PROJ-40-kalorien.md) |
| PROJ-41 | Kalorien zählen | P2 | Deployed | PROJ-36, PROJ-37, PROJ-40 | [Spec](PROJ-41-kalorien-zaehlen.md) |
| PROJ-42 | Analyse-Übersichtsseite | P1 | Deployed | PROJ-2, PROJ-4, PROJ-5, PROJ-6, PROJ-8, PROJ-17, PROJ-19, PROJ-35, PROJ-37 | [Spec](PROJ-42-analyse-uebersichtsseite.md) |
| PROJ-43 | Training-Übersicht (Krafttraining-Basics) | P1 | Deployed | PROJ-35, PROJ-19 | [Spec](PROJ-43-training-uebersicht.md) |

<!-- Add features above this line -->

## Next Available ID: PROJ-44

## Empfohlene Build-Reihenfolge

1. **PROJ-1** — Infrastruktur zuerst, alles andere hängt davon ab
2. **PROJ-2** — Auth, bevor User-Daten gespeichert werden
3. **PROJ-3** — Input-UI, bevor der Agent gebaut wird
4. **PROJ-4** — KI-Agent (erst starten, wenn Sättigungsmatrix verifiziert ist!)
5. **PROJ-5** — Sättigungs-Output baut auf PROJ-4 auf
6. **PROJ-6** — Historie als P1 nach dem MVP
7. **PROJ-7** — Tagebuch als nice-to-have in einer späteren Iteration
8. **PROJ-10** — Scan-Limit, bevor die Paywall kommt (einfacher, eigenständiger Baustein)
9. **PROJ-11** — Paywall (Stripe), baut auf dem Scan-Limit-Konzept auf ("langfristig" laut Product Owner)
10. **PROJ-12** — Invite-Codes als Bypass für die Paywall (Freunde/Familie zum Testen)
11. **PROJ-13** — Admin-Dashboard (Code-Generierung + Link zur bestehenden Rezept-Verwaltung), zuletzt da rein additiv
