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
| PROJ-4 | KI-Analyse-Agent (Rückfragen + BLS + Makros) | P0 | Deployed | PROJ-3, Sättigungsmatrix verifiziert | [Spec](PROJ-4-ki-analyse-agent.md) |
| PROJ-5 | Sättigungs-Einschätzung & Verbesserungsvorschlag | P0 | Deployed | PROJ-4 | [Spec](PROJ-5-saettigungs-einschaetzung.md) |
| PROJ-6 | Mahlzeit-Historie | P1 | Deployed | PROJ-1, PROJ-2, PROJ-4, PROJ-5 | [Spec](PROJ-6-mahlzeit-historie.md) |
| PROJ-7 | Ernährungs-Tagebuch & Inspiration | P2 | Roadmap | PROJ-6 | — |

<!-- Add features above this line -->

## Next Available ID: PROJ-8

## Empfohlene Build-Reihenfolge

1. **PROJ-1** — Infrastruktur zuerst, alles andere hängt davon ab
2. **PROJ-2** — Auth, bevor User-Daten gespeichert werden
3. **PROJ-3** — Input-UI, bevor der Agent gebaut wird
4. **PROJ-4** — KI-Agent (erst starten, wenn Sättigungsmatrix verifiziert ist!)
5. **PROJ-5** — Sättigungs-Output baut auf PROJ-4 auf
6. **PROJ-6** — Historie als P1 nach dem MVP
7. **PROJ-7** — Tagebuch als nice-to-have in einer späteren Iteration
