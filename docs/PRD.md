# Product Requirements Document — endlichsatt

## Vision

endlichsatt ist eine Web-App, die Nutzern hilft zu verstehen, warum bestimmte Mahlzeiten nicht sättigen — und wie man sie konkret verbessert. Anhand eines Fotos oder einer Freitexteingabe analysiert die App die Nährwerte über den Bundeslebensmittelschlüssel (BLS) und bewertet das Gericht mit einer proprietären Sättigungsmatrix. endlichsatt ist das, was nach dem Kalorienzählen kommt.

## Target Users

**Gesundheitsbewusste Erwachsene (25–45 Jahre)**, die:
- Gewicht verlieren oder ihr Gewicht halten wollen
- bereits wissen, was gesund ist, aber trotzdem oft schnell wieder Hunger haben
- frustriert vom Kalorienzählen sind und etwas Tieferes verstehen wollen
- nach Orientierung suchen, nicht nach Verboten

**Pain Point:** "Ich esse vermeintlich gesund, bin aber zwei Stunden später schon wieder hungrig — und weiß nicht warum."

## Core Features (Roadmap)

| Priority | ID | Feature | Status |
|----------|----|---------|--------|
| P0 (MVP) | PROJ-1 | Supabase Infrastructure Setup | Planned |
| P0 (MVP) | PROJ-2 | User Authentication | Planned |
| P0 (MVP) | PROJ-3 | Mahlzeit-Input (Foto & Freitext) | Planned |
| P0 (MVP) | PROJ-4 | KI-Analyse-Agent (Rückfragen + BLS + Makros) | Planned |
| P0 (MVP) | PROJ-5 | Sättigungs-Einschätzung & Verbesserungsvorschlag | Planned |
| P1 | PROJ-6 | Mahlzeit-Historie | Roadmap |
| P2 | PROJ-7 | Ernährungs-Tagebuch & Inspiration | Roadmap |

## Success Metrics

- **Wiederkehrrate:** >40 % der Nutzer analysieren mindestens 3 Mahlzeiten
- **Analyse-Abschlussrate:** >70 % der gestarteten Analysen werden vollständig durchgeführt
- **Nutzerzufriedenheit:** Verbesserungsvorschläge werden als "umsetzbar" bewertet (Feedback-Mechanismus in v2)

## Constraints

- Solo-Entwickler-Projekt
- Tech-Stack: Next.js 16, Supabase, Claude API (Anthropic)
- BLS-Datenbank muss als Referenzquelle integriert oder abgefragt werden
- Design-System: siehe `docs/design-system.md`
- Sättigungsmatrix: siehe `docs/saettigungsmatrix.md` (muss vor PROJ-4 befüllt sein)
- **PROJ-4 und PROJ-5 dürfen erst implementiert werden, nachdem die Sättigungsmatrix vom Nutzer verifiziert wurde**
- **Mobile-first:** Alle Screens müssen vollständig auf Mobilgeräten nutzbar sein (kein separates Mobile-Feature, sondern durchgängige Anforderung)

## Non-Goals (diese Version)

- Kein Kalorienzählen oder Tracking von Tageskalorienzielen
- Keine Mahlzeit-Planung oder Einkaufslisten
- Kein Sport- oder Workout-Tracking
- Keine Community-Features oder Social Sharing
- Kein Barcode-Scanner
- Keine mobile App (Web first)
