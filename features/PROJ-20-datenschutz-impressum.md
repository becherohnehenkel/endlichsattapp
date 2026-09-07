# PROJ-20: Datenschutzerklärung & Impressum

## Status: Deployed (Refinement: Rechtstext-Aktualisierung & globaler Footer "Approved")
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
| Decision | Rationale | Date |
|----------|-----------|------|
| Neue Komponente `LegalFooter` wird im Root Layout (`src/app/layout.tsx`) gerendert, außerhalb von `NavigationShell` | Einzige Stelle, an der der Footer garantiert auf jeder Route erscheint, unabhängig von `NavigationShell`s bestehender `HIDDEN_PATHS`/`HIDDEN_PREFIXES`-Ausblendlogik | 2026-09-07 |
| Die Seiten-Ausblendliste (`HIDDEN_PATHS`/`HIDDEN_PREFIXES`) wird aus `NavigationShell` in einen gemeinsam nutzbaren Baustein ausgelagert | `LegalFooter` muss wissen, ob auf der aktuellen Route eine Bottom-Nav sichtbar ist, um sich mobil richtig darüber zu positionieren — ohne die Liste zu duplizieren | 2026-09-07 |
| Footer wird fixiert (angeheftet) dargestellt, nicht als klassischer Scroll-zum-Ende-Footer | Erfüllt die Anforderung "jederzeit angezeigt"; konsistent mit dem bereits bestehenden, ebenfalls fixierten Verhalten der Bottom-Navigation | 2026-09-07 |
| Die 3 bestehenden Einzel-Footer-Links in `login-form.tsx`, `konto-view.tsx`, `gast-konto-view.tsx` werden entfernt | Werden durch den neuen globalen Footer ersetzt; Beibehaltung würde zu einem doppelten Footer auf denselben Seiten führen | 2026-09-07 |
| Der Datenschutz-Hinweis im Registrierungsformular (`registrieren-form.tsx`) bleibt unverändert bestehen | Andere Funktion als der neue Footer — Einwilligungsformulierung im Moment der Dateneingabe, keine reine Navigationshilfe | 2026-09-07 |
| Zusätzlicher reservierter Bottom-Abstand für Seiteninhalt wird global eingeführt (nicht nur innerhalb von `NavigationShell`) | Der Footer erscheint jetzt auch auf den bisher navigationslosen Seiten (Login/Registrieren/Upgrade/Admin/Auth) — auch dort darf er keinen Inhalt verdecken | 2026-09-07 |

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

### A) Komponenten-Struktur (Visuell)

```
Root Layout (gilt für jede Seite der App, ausnahmslos)
├── NavigationShell (bestehend, unverändert in seiner Sichtbarkeitslogik)
│   ├── TopNav (auf den meisten Seiten)
│   ├── Seiteninhalt
│   └── BottomNav (auf den meisten Seiten, nur mobil)
│
└── LegalFooter (NEU — sitzt bewusst AUSSERHALB von NavigationShell)
    ├── Link "Impressum"
    ├── Trennzeichen "·"
    └── Link "Datenschutz"
```

**Warum außerhalb von NavigationShell?** NavigationShell blendet TopNav/BottomNav auf bestimmten Seiten komplett aus (`/login`, `/registrieren`, `/upgrade`, `/admin*`, `/auth*`). Der neue Footer soll aber laut Anforderung genau dort trotzdem erscheinen. Würde man ihn in NavigationShell einbauen, müsste man dieselbe Ausblend-Logik umgehen — sauberer ist es, den Footer eine Ebene höher, direkt im Root Layout, unabhängig zu platzieren.

**Positionierung (angeheftet, nicht Teil des normalen Seitenendes):** Da die Anforderung "jederzeit angezeigt" lautet (nicht "am Ende der Seite nach dem Scrollen"), wird der Footer wie die bestehende Bottom-Nav angeheftet (fixiert) dargestellt:
- Mobil, auf Seiten MIT sichtbarer Bottom-Nav: Footer sitzt direkt oberhalb der Bottom-Nav.
- Mobil, auf Seiten OHNE Bottom-Nav (Login/Registrieren/Upgrade/Admin/Auth): Footer sitzt ganz unten.
- Desktop (Bottom-Nav existiert grundsätzlich nicht): Footer sitzt immer ganz unten, mittig.

Damit der Footer weiß, ob auf der aktuellen Seite eine Bottom-Nav sichtbar ist (um sich richtig darüber zu positionieren), wird die bestehende Seiten-Ausblendliste aus NavigationShell in einen kleinen, gemeinsam nutzbaren Baustein ausgelagert — beide Komponenten greifen dann auf dieselbe Liste zu, statt sie zu duplizieren.

### B) Datenmodell (in Worten)

Kein neues Datenmodell nötig. Dieses Refinement ist reine Text- und Layout-Arbeit:
- Die Rechtstexte selbst (Datenschutzerklärung, Impressum) sind statischer Seiteninhalt, keine Datenbank-Daten.
- Der Footer verwaltet keinen eigenen Zustand — er zeigt lediglich zwei feste Links.

### C) Tech-Entscheidungen (Begründung für PM)

1. **Footer lebt im Root Layout, nicht in NavigationShell** — einziger Weg, ihn wirklich auf jeder Seite ohne Ausnahme zu zeigen, inklusive der aktuell navigationslosen Seiten.
2. **Angehefteter (fixierter) Footer statt klassischem Seitenende-Footer** — passend zur Nutzeranforderung "jederzeit angezeigt", konsistent mit dem bereits bestehenden Verhalten der Bottom-Navigation.
3. **Die 3 bestehenden Einzel-Footer-Links** (in `login-form.tsx`, `konto-view.tsx`, `gast-konto-view.tsx` — jeweils identische "Impressum · Datenschutz"-Zeile) **werden entfernt**, da der neue globale Footer sie ersetzt und ein doppelter Footer auf denselben Seiten verwirrend wäre.
4. **Der Datenschutz-Hinweis im Registrierungsformular bleibt bestehen** (der Satz "Mit der Registrierung akzeptierst du unsere Datenschutzerklärung" direkt vor dem Absenden-Button) — das ist inhaltlich eine Einwilligungs-Formulierung im Moment der Dateneingabe, keine reine Navigationshilfe, und hat daher eine andere Funktion als der neue Footer.
5. **Zusätzlicher reservierter Abstand am Seitenende** wird eingeführt, damit der neue, angeheftete Footer niemals Seiteninhalt verdeckt — analog zum bereits bestehenden reservierten Abstand für die Bottom-Navigation, jetzt aber auf wirklich allen Seiten (auch den bisher navigationslosen).
6. **Kein neues Paket nötig** — vollständig mit den bereits vorhandenen React/Tailwind/Next.js-Bausteinen umsetzbar.

### D) Abhängigkeiten (Pakete)
Keine neuen Pakete nötig.

## Implementation Notes (Frontend)

**Gebaut:**
- Neu: `src/lib/nav-visibility.ts` — exportiert `isBottomNavHidden(pathname)`, die bisher inline in `NavigationShell` liegende `HIDDEN_PATHS`/`HIDDEN_PREFIXES`-Liste ausgelagert, damit sowohl `NavigationShell` als auch der neue Footer dieselbe Quelle nutzen.
- Neu: `src/components/legal-footer.tsx` — `LegalFooter`-Komponente, angeheftet (`fixed`), zeigt "Impressum · Datenschutz". Positioniert sich mobil bei `bottom-16` (direkt über der Bottom-Nav), wenn `isBottomNavHidden(pathname)` false ist, sonst bei `bottom-0`; auf Desktop immer `bottom-0`.
- `src/app/layout.tsx`: `<LegalFooter />` als Geschwister-Element nach `<NavigationShell>` ergänzt — rendert dadurch unabhängig von NavigationShells Sichtbarkeitslogik auf wirklich jeder Route.
- `src/components/navigation-shell.tsx`: nutzt jetzt `isBottomNavHidden()` aus der neuen Lib statt eigener Konstanten; reservierter Bottom-Abstand für Seiteninhalt erhöht, um Platz für den neuen Footer zu schaffen — `pb-20 md:pb-0` → `pb-24 md:pb-7` (Seiten mit Bottom-Nav) bzw. neu `pb-7` für den bisher padding-losen Zweig (Seiten ohne Bottom-Nav wie Login/Registrieren/Upgrade/Admin/Auth).
- Die 3 identischen Einzel-Footer-Links entfernt aus `login-form.tsx`, `konto-view.tsx`, `gast-konto-view.tsx` (jeweils ersatzlos, kein Layout-Lücke sichtbar dank `space-y`-Container).
- `src/app/datenschutz/page.tsx` vollständig überarbeitet: neue Abschnitte für Eigene Rezepte, Trainingseinheiten, Gewichts-/Ernährungsziel-Daten (Kalorien-Rechner, Art. 9), Wochen-Check-In (Art. 9), Fehler-Feedback, Einladungscodes; neuer Abschnitt 3 "Besondere Kategorien personenbezogener Daten"; Open Food Facts + Google-Fonts-Self-Hosting-Hinweis in Abschnitt 4 ergänzt; neues Widerrufsrecht (Art. 7 Abs. 3) in Abschnitt 7; medizinischer Disclaimer im Intro; Datum auf September 2026 aktualisiert.
- `src/app/impressum/page.tsx`: Zitate aktualisiert — `§ 5 TMG` → `§ 5 DDG`, `§ 55 Abs. 2 RStV` → `§ 18 Abs. 2 MStV`. Alle übrigen Angaben (Anbieter, Kontakt, USt-IdNr, EU-Streitschlichtung) unverändert.
- `npm run build`, gezieltes `eslint` auf alle geänderten Dateien, `npm test` (490/490) fehlerfrei. Ein `react/no-unescaped-entities`-Lint-Fehler (Anführungszeichen um "Inter") behoben durch `&bdquo;…&ldquo;`-Entities, konsistent mit bereits bestehender Konvention im Projekt (z. B. `admin-delete-button.tsx`).
- Live-Verifikation im Dev-Server (Playwright/Browser-Tool): Footer erscheint korrekt auf Startseite, `/login` (Bottom-Nav ausgeblendet), `/admin` (Ladezustand), `/datenschutz`, `/impressum` — jeweils ohne Überlappung mit Bottom-Nav (mobil 375px) oder Seiteninhalt, kein horizontales Scrollen, keine Konsolenfehler. Footer-Links funktional getestet (Klick von `/impressum` → `/datenschutz`). Beide Rechtstext-Seiten inhaltlich vollständig gegen die Acceptance Criteria geprüft (Textinhalt per `get_page_text` verifiziert).

**Bewusst nicht gebaut (kein Backend nötig):**
- Diese Refinement ist reine Text-/Layout-Arbeit ohne Datenbankzugriff — kein `/backend`-Durchlauf nötig, weiter direkt mit `/qa`.
- Die Einwilligungs-Checkbox-Mechanik (Consent-UI, Speicherung, Sperr-Logik) ist bewusst nicht Teil dieser Implementierung — vollständig PROJ-52 vorbehalten (siehe Out of Scope in der Spec).

## QA Test Results

**Tested:** 2026-09-07
**Tested by:** QA Engineer (Claude)

### Acceptance Criteria Status

**Inhalt der Rechtstexte**
- [x] Impressum zeigt Name/Adresse/Kontakt/USt-IdNr + § 5 DDG + § 18 Abs. 2 MStV — PASS
- [x] Datenschutzerklärung deckt alle Datenkategorien bis PROJ-51 ab — PASS
- [x] Gewicht/Alter/Geschlecht/Größe/Kalorienziel + alle 6 Check-In-Metriken als Art.-9-Daten benannt, Verweis auf gesonderte Einwilligung — PASS
- [x] Open Food Facts als nicht-personenbezogener Datenfluss dokumentiert — PASS
- [x] Google Fonts Self-Hosting-Hinweis vorhanden — PASS
- [x] Medizinischer Disclaimer vorhanden — PASS
- [x] `/impressum` und `/datenschutz` ohne Login erreichbar — PASS

**Globaler Footer**
- [x] Footer mit Impressum/Datenschutz erscheint ausnahmslos auf jeder Seite, auch `/login`, `/registrieren`, `/upgrade`, `/admin*`, `/auth*` — PASS
- [x] Mobil (< 768px): Footer sitzt als schmale Zeile oberhalb der Bottom-Navigation, keine Überlappung, kein zusätzliches Scrollen — PASS (per Bounding-Box-Test verifiziert)
- [x] Desktop (≥ 768px): Footer als reguläre, unten mittig zentrierte Fußzeile — PASS
- [x] Footer-Links navigieren korrekt zu `/impressum` bzw. `/datenschutz`, unabhängig vom Login-Status — PASS
- [x] Alte, seitenspezifische Einzel-Links (Login/Konto/Gast-Konto) nicht dupliziert — PASS (Link-Count-Test: genau 1× "Impressum" auf Gast-Konto-Seite)

**Ergebnis: 12/12 Acceptance Criteria bestanden.**

### Security Audit (Red Team)
- **Auth-Bypass:** `/admin` bleibt ohne Session korrekt zu `/login` umgeleitet — der neue Footer hat keinerlei Auth-Logik und beeinflusst bestehende Middleware-/Redirect-Checks nicht (rein additive UI-Komponente, kein State, keine Datenabfrage).
- **Kein neuer Angriffsvektor:** Footer und Rechtstext-Seiten enthalten ausschließlich statischen Text und zwei feste `next/link`-Links — keine Nutzereingabe, kein API-Aufruf, keine XSS-/Injection-Fläche.
- **Keine sensiblen Daten im Footer:** Footer ist zustandslos (keine Session-/Nutzerdaten im Markup oder in der Netzwerk-Payload).
- **Konsolenfehler:** keine, auf allen getesteten Seiten (Startseite, `/login`, `/admin`, `/datenschutz`, `/impressum`).

### Regressionstest
- `npm test` (Vitest): **490/490 bestanden**, keine Regressionen.
- Neue Suite `tests/PROJ-20-datenschutz-impressum.spec.ts` (isoliert): **19/19 bestanden** (Footer-Sichtbarkeit auf 5 Seitentypen, Footer-Positionierung mobil via Bounding-Box, Link-Navigation, Datenschutz-/Impressum-Inhalt).
- Breiter Regressionslauf über alle Seiten, die `NavigationShell`, `login-form.tsx`, `konto-view.tsx` oder `gast-konto-view.tsx` nutzen — `tests/PROJ-2-user-authentication.spec.ts`, `tests/PROJ-14-konto-widerruf.spec.ts`, `tests/PROJ-19-gast-modus.spec.ts`, `tests/PROJ-35-bottom-navigation-kontobereich.spec.ts`, `tests/PROJ-15-pwa-native-navigation.spec.ts`, `tests/PROJ-36-ernaehrung-hub.spec.ts`: **122/125 bestanden, 3 skipped** (vorbestehende Skips, unabhängig von dieser Änderung), **0 Fehlschläge**.
- `npm run build` und gezieltes `eslint` auf alle geänderten/neuen Dateien: fehlerfrei (ein `react/no-unescaped-entities`-Fehler während der Implementierung behoben, siehe Implementation Notes).
- Visuelle Prüfung mobil (375px): kompletter Seiteninhalt der Datenschutzerklärung bis zum Seitenende ("9. Aktualität", "→ Impressum") sauber oberhalb von Footer + Bottom-Nav sichtbar, keine Überlappung, kein abgeschnittener Text.

### Bugs Found
Keine Bugs gefunden — weder Critical, High, Medium noch Low.

### Summary
- Acceptance Criteria: 12/12 PASS
- Bugs: 0
- Security: keine Findings; Feature ist rein additiv und zustandslos, kein neuer Angriffsvektor
- Regressionen: keine (490 Unit-/Integrationstests, 141 E2E-Tests über PROJ-2/14/15/19/20/35/36 hinweg)
- Hinweis (kein Bug, sondern rechtliche Empfehlung — bereits in den Open Questions der Spec dokumentiert): eine anwaltliche Prüfung der finalen Texte vor breiter Bewerbung wird weiterhin empfohlen.

**Production Ready: YES**

## Deployment
_To be added by /deploy_
