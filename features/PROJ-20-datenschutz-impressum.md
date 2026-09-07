# PROJ-20: Datenschutzerklärung & Impressum

## Status: Deployed (Refinement: Rechtstext-Aktualisierung & globaler Footer "Planned")
**Created:** 2026-07-07
**Last Updated:** 2026-09-07

## Dependencies
- Requires: PROJ-2 (User Authentication) — Registrierungsseite erhält Datenschutz-Hinweis
- Requires: PROJ-19 (Gast-Modus) — Gast-Konto-Screen erhält Footer-Links
- Verwandt (kein Blocker): PROJ-52 (Explizite Einwilligung für gesundheitsnahe Daten) — wird als eigene Spec direkt im Anschluss behandelt. Der hier aktualisierte Datenschutztext beschreibt bereits die Art.-9-Einordnung und verweist auf den gesonderten Einwilligungsmechanismus aus PROJ-52; die eigentliche Checkbox-Mechanik wird dort gebaut, nicht hier.

**Bewusste Abgrenzung zu PROJ-52:** Dieses Refinement liefert ausschließlich aktualisierte Rechtstexte (Datenschutz + Impressum) und den global sichtbaren Footer. Es führt keine neue Einwilligungs-Logik, keine neue Datenbank-Spalte und keine neue Checkbox ein — das ist vollständig PROJ-52 vorbehalten (siehe Out of Scope).

## User Stories
- Als Nutzer möchte ich jederzeit das Impressum finden, damit ich weiß, wer hinter der App steckt.
- Als Nutzer möchte ich die Datenschutzerklärung lesen können, damit ich verstehe, welche Daten verarbeitet werden und welche Rechte ich habe — inklusive aller seit Juli 2026 neu hinzugekommenen Funktionen (Training, Wochen-Check-In, eigene Rezepte, Kalorien-Rechner).
- Als Nutzer möchte ich auf jeder Seite der App — unabhängig davon, ob ich eingeloggt, Gast oder auf einer Auth-/Zahlungs-/Admin-Seite bin — ohne Suchen einen Link zu Impressum und Datenschutz finden.
- Als neuer Nutzer möchte ich beim Registrieren auf die Datenschutzerklärung hingewiesen werden, bevor ich meine Daten eingebe.

## Out of Scope
- Die Einwilligungs-Checkbox-Mechanik für gesundheitsnahe Daten (Registrierung, Gast-Ersteingabe, Nachtrag für Bestandsnutzer, Sperre bei Ablehnung) — vollständig PROJ-52.
- Löschung oder Anonymisierung bestehender Gewichts-/Check-In-Altdaten bei Ablehnung der Einwilligung — Entscheidung aus dem PROJ-52-Interview: Altdaten bleiben erhalten, keine automatische Löschung (Nutzer kann selbst über die bestehende Konto-Löschung aus PROJ-14 löschen).
- Versand einer Sammel-E-Mail an Bestandsnutzer zur nachträglichen Einwilligung — bewusst nicht gewählt (siehe Decision Log), stattdessen einmaliger In-App-Nachtrag bei nächstem Zugriff (Teil von PROJ-52).
- Mehrsprachigkeit der Rechtstexte (nur Deutsch, wie bisher) — App richtet sich ausschließlich an den deutschsprachigen Raum.
- Individuelle Cookie-Consent-Banner-Logik — entfällt weiterhin, da ausschließlich technisch notwendige Session-Cookies verwendet werden (keine Änderung ggü. Juli-Stand, bestätigt durch Code-Prüfung: kein Analytics-/Tracking-Code vorhanden).
- Änderung der Anbieter-Rechtsform (Einzelperson bleibt Einzelperson) — Nutzerbestätigung, keine Firmengründung erfolgt.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Inhalt der Rechtstexte
- [ ] Angenommen ein Nutzer navigiert zu `/impressum`, dann sieht er Name, Adresse, Kontaktdaten, USt-IdNr und Angaben gemäß § 5 DDG sowie den Verantwortlichkeits-Hinweis gemäß § 18 Abs. 2 MStV (aktualisierte Normen, siehe Decision Log).
- [ ] Angenommen ein Nutzer navigiert zu `/datenschutz`, dann sieht er eine vollständige, aktuelle DSGVO-konforme Datenschutzerklärung, die alle bis PROJ-51 deployten Datenkategorien abdeckt (Account, Mahlzeit-Analysen inkl. Rückfrage-Konversationen, eigene Rezepte, Trainingseinheiten, Wochen-Check-Ins, Fehler-Feedback, Invite-Codes, Zahlungsdaten, Gewicht/Alter/Geschlecht/Größe/Kalorienziel) und alle aktuellen Drittanbieter (Supabase, Anthropic, Stripe, Vercel, Open Food Facts, Google Fonts).
- [ ] Angenommen die Datenschutzerklärung beschreibt Gewicht, Alter, Geschlecht, Größe, Kalorienziel sowie alle 6 Wochen-Check-In-Metriken (Schlaf, Screentime, Energielevel, Ernährungs-Achtsamkeit, bewusstes Essen, Tracking-Bereitschaft), dann werden diese explizit als besondere Kategorie personenbezogener Daten (Art. 9 DSGVO) benannt, mit Verweis auf die gesonderte ausdrückliche Einwilligung (Umsetzung: PROJ-52).
- [ ] Angenommen die Datenschutzerklärung beschreibt die Anfrage an Open Food Facts (Zutatensuche, PROJ-9), dann wird klargestellt, dass dabei ausschließlich der Suchbegriff (kein Personenbezug) an einen öffentlichen, gemeinnützigen Dienst übermittelt wird.
- [ ] Angenommen die Datenschutzerklärung erwähnt Google Fonts, dann wird klargestellt, dass Schriftarten zur Build-Zeit selbst gehostet werden (`next/font/google`) und zur Laufzeit keine Verbindung zu Google-Servern aufgebaut wird.
- [ ] Angenommen ein Nutzer liest die Datenschutzerklärung, dann findet er einen klaren Hinweis, dass die App keine medizinische Beratung, Diagnose oder Behandlung darstellt.
- [ ] Angenommen ein Nutzer ruft `/impressum` oder `/datenschutz` auf, dann sind diese Seiten ohne Login zugänglich.

### Globaler Footer
- [ ] Angenommen ein Nutzer befindet sich auf irgendeiner Seite der App — inklusive `/login`, `/registrieren`, `/upgrade`, `/admin*` und `/auth*`, auf denen die reguläre Navigation ausgeblendet ist — dann sieht er unten mittig einen Footer mit Links zu „Impressum" und „Datenschutz".
- [ ] Angenommen ein Nutzer befindet sich auf einer mobilen Ansicht (< 768px) auf einer Seite mit sichtbarer Bottom-Navigation, dann erscheint der neue Footer als schmale Zeile oberhalb der Bottom-Navigation, ohne diese zu überlappen oder zusätzliches Scrollen zu erzwingen.
- [ ] Angenommen ein Nutzer befindet sich auf einer Desktop-Ansicht (≥ 768px), dann erscheint der Footer als reguläre, unten mittig zentrierte Fußzeile am Seitenende.
- [ ] Angenommen ein Nutzer klickt im Footer auf „Impressum" oder „Datenschutz", dann wird die jeweilige Seite geöffnet, unabhängig vom Login-Status (eingeloggt, Gast, nicht eingeloggt).
- [ ] Angenommen die bestehenden, seitenspezifischen Datenschutz-/Impressum-Links (Registrierungsformular-Hinweis, Konto-Ansicht, Gast-Konto-Ansicht) existieren bereits, dann werden sie durch den neuen globalen Footer nicht dupliziert dargestellt (alte Einzel-Links werden entfernt oder bewusst beibehalten, siehe Implementation Notes).

## Edge Cases
- Sehr kleine Bildschirme (375px): Footer-Text („Impressum" / „Datenschutz") muss auf einer Zeile bleiben, ohne die Bottom-Navigation-Icons zu verdecken oder selbst umzubrechen.
- PWA-Standalone-Modus (installierte App, PROJ-15): Footer muss auch dort sichtbar sein, inklusive korrektem `env(safe-area-inset-bottom)`-Abstand wie bei der bestehenden Bottom-Nav.
- Admin-Bereich (`/admin*`): Footer erscheint trotz komplett eigenem Layout ohne reguläre Nutzer-Navigation (bewusste Nutzerentscheidung: „wirklich überall, ausnahmslos").
- Auth-Callback-Seiten (`/auth*`, z. B. E-Mail-Bestätigung): Footer erscheint auch auf diesen kurzlebigen Zwischenseiten.
- Gast ohne Login: sieht denselben Footer wie eingeloggte Nutzer, keine unterschiedliche Behandlung.
- Layout-Verschiebung: das bestehende `pb-20` (Content-Abstand zur Bottom-Nav in `navigation-shell.tsx`) muss um die zusätzliche Footer-Höhe erweitert werden, damit Seiteninhalt nicht vom neuen Footer verdeckt wird.

## Technical Requirements (optional)
- Kein neues Backend, keine neue Datenbank-Tabelle oder -Spalte für dieses Refinement (reine Text- und Layout-Änderung).
- Footer muss unabhängig von `NavigationShell`s bestehender Ausblend-Logik (`HIDDEN_PATHS`/`HIDDEN_PREFIXES`) gerendert werden, da er laut Anforderung auf exakt den Seiten sichtbar sein muss, auf denen die reguläre Navigation aktuell versteckt ist — vermutlich Platzierung im Root-Layout (`src/app/layout.tsx`) statt in `NavigationShell` (finale Entscheidung: `/architecture`).
- Mobile-first, wie alle anderen Bereiche der App.

## Open Questions
- [ ] Anwaltliche Prüfung der finalen Texte vor Veröffentlichung empfohlen — insbesondere die Art.-9-Einordnung der Gewichts-/Check-In-Daten und die aktualisierten Impressum-Zitate (§ 5 DDG, § 18 Abs. 2 MStV). Diese Spec liefert einen nach bestem Wissen korrekten, aber nicht anwaltlich geprüften Text.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Anbieter-Angaben bleiben unverändert (Lukas Beck, Einzelperson, Schulterblatt 122, 20357 Hamburg) | Nutzerbestätigung — keine Änderung der Rechtsform seit Juli 2026 | 2026-09-07 |
| Gewicht/Alter/Geschlecht/Größe/Kalorienziel sowie alle 6 Wochen-Check-In-Metriken werden als besondere Kategorie personenbezogener Daten (Art. 9 DSGVO) behandelt, nicht als gewöhnliche personenbezogene Daten (Art. 6) | Nutzerentscheidung nach Abwägung — bewusst die rechtlich vorsichtigere Einordnung gewählt, obwohl vergleichbare Ernährungs-/Fitness-Apps (MyFitnessPal, Yazio, Lifesum, Noom) diese Daten laut gängiger Praxis meist unter Art. 6 verarbeiten. Zieht einen gesonderten Einwilligungsmechanismus nach sich (PROJ-52) | 2026-09-07 |
| Einwilligungs-Mechanik (Checkbox-Logik, Speicherung, Nachtrag für Bestandsnutzer) wird als eigene Spec PROJ-52 ausgelagert, nicht Teil von PROJ-20 | Single-Responsibility — eigenständig testbar/deploybar, klar getrennt von der reinen Text-/Footer-Aktualisierung | 2026-09-07 |
| Footer erscheint ausnahmslos auf allen Seiten, inklusive `/admin*` und `/auth*` | Explizite Nutzeranforderung „jederzeit und auf allen Seiten", bewusst ohne Ausnahme für interne Admin-Seiten | 2026-09-07 |
| Footer wird auf Mobilgeräten als schmale Zeile oberhalb der bestehenden Bottom-Navigation dargestellt, nicht als eigener Vollbild-Footer | Vermeidet Überlappung mit der fixierten Bottom-Nav (Start/Ernährung/Analyse/Training/Check-In) und zusätzliches Scrollen | 2026-09-07 |
| Kein Rückwirkungs-/E-Mail-Kampagnen-Ansatz für Bestandsnutzer-Einwilligung, stattdessen einmaliger In-App-Nachtrag beim nächsten Zugriff auf Kalorien-Rechner oder Check-In | Einfachere technische Umsetzung ohne zusätzliche E-Mail-Infrastruktur, gleichzeitig rechtlich saubere Lösung (keine Weiterverarbeitung ohne Einwilligung) | 2026-09-07 |
| Bei Ablehnung der Einwilligung: betroffene Funktion (Kalorien-Rechner bzw. Check-In) wird gesperrt, bereits gespeicherte Altdaten werden NICHT automatisch gelöscht | Nutzerentscheidung — vermeidet destruktive automatische Löschung; Nutzer kann Altdaten jederzeit selbst über die bestehende Konto-Löschung (PROJ-14) entfernen | 2026-09-07 |
| Datenkategorien-Liste in der Datenschutzerklärung wird um alle seit Juli 2026 deployten Features erweitert (Training, Wochen-Check-In, eigene Rezepte, Fehler-Feedback, Invite-Codes) | Vollständigkeitspflicht nach Art. 13/14 DSGVO — die bisherige Fassung war seit PROJ-21–PROJ-51 veraltet | 2026-09-07 |
| Open Food Facts (PROJ-9) wird als neuer, nicht-personenbezogener Drittanbieter-Datenfluss dokumentiert | Code-Prüfung bestätigt: nur Suchbegriff wird übermittelt, kein Personenbezug — Transparenz trotzdem sinnvoll | 2026-09-07 |
| Google Fonts wird mit dem Hinweis auf Self-Hosting (`next/font/google`, keine Laufzeit-Verbindung zu Google) dokumentiert | Vermeidet einen falschen Eindruck einer Drittanbieter-Datenübertragung, die technisch nicht stattfindet | 2026-09-07 |

### Technical Decisions
<!-- Added by /architecture -->

## Bisheriger Stand (vor diesem Refinement, Stand Juli 2026)

Zur Orientierung für die Umsetzung — das ist der Stand, der durch dieses Refinement ersetzt/erweitert wird:

### Impressum (`/impressum`)
- Anbieter: Lukas Beck, Schulterblatt 122, 20357 Hamburg
- Kontakt: +49 (0) 173 347 0405 / lukas@onlineernaehrungsberater.de
- USt-IdNr: DE 428402078
- Verantwortlicher: Lukas Beck (§ 55 Abs. 2 RStV) → wird auf § 18 Abs. 2 MStV aktualisiert
- EU-Streitschlichtungshinweis (kein Pflichtverfahren)

### Datenschutzerklärung (`/datenschutz`)
- Verantwortlicher: Lukas Beck
- Verarbeitete Daten (Stand Juli 2026, unvollständig ggü. heute): Account-Daten, Mahlzeit-Analysen (Text + Fotos), Gast-Sessions, Zahlungsdaten, Server-Logs
- Drittanbieter: Supabase (DB/Auth/Storage), Anthropic (KI-Analyse), Stripe (Zahlung), Vercel (Hosting) — alle mit SCCs
- Cookies: nur technisch notwendige Session-Cookies, kein Tracking
- Speicherdauer: bis Account-Löschung; gesetzliche Aufbewahrungspflichten vorbehalten
- Nutzerrechte: Art. 15–21 DSGVO
- Beschwerderecht: HmbBfDI Hamburg
- Letzte Aktualisierung: Juli 2026 → wird auf September 2026 aktualisiert

### Bisherige Footer-/Link-Platzierung (Einzellösungen statt globalem Footer)
- `registrieren-form.tsx` — Datenschutz-Hinweis vor dem Submit-Button
- `login-form.tsx` — Footer mit Impressum + Datenschutz
- `konto-view.tsx` — Footer nach "Abmelden"
- `gast-konto-view.tsx` — Footer unter dem CTA

## Tech Design (Solution Architect)
_To be added by /architecture_

## Implementation Notes (Frontend)
_To be added by /frontend_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
