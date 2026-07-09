# PROJ-21: Foto-Qualität in der App-Anzeige

## Status: Deployed
**Created:** 2026-07-07
**Last Updated:** 2026-07-07

## Dependencies
- Requires: PROJ-3 (Mahlzeit-Input) — Foto-Upload-Flow
- Requires: PROJ-18 (Token-Optimierung) — Thumbnail für Claude API

## Problem
Nach abgeschlossener Analyse wurde `photo_fullsize_path` (1200px, max 1MB) aus dem Supabase Storage gelöscht. Zurück blieb nur das 100px-Thumbnail (`photo_thumbnail_path`), das für die KI-Analyse (PROJ-18) optimiert war. Das führte zu verpixelten Fotos in der App:

- Analyse-Detailseite: Foto in `aspect-video` full-width (~350px) → 100px gestreckt = matschig
- Homepage-Teaser: 48px Vorschau → grenzwertig auf Retina-Displays

## Lösung
Löschung von `photo_fullsize_path` in `confirm/route.ts` entfernt (Beilagen-Branch + Standard-Branch). Die Fullsize bleibt permanent gespeichert.

**Token-Nutzung unverändert:** `start/route.ts` lädt die Fullsize, verkleinert sie serverseitig auf 768px und schickt NUR die verkleinerte Version an Claude. Das Behalten der Originaldatei im Storage hat keinen Einfluss auf Token-Kosten.

Die Detailseite (`mahlzeit/[id]/page.tsx`) bevorzugt `photo_fullsize_path` über `photo_thumbnail_path` — diese Logik war schon korrekt, hat nur nie gegriffen weil das Feld immer null war.

## Geänderte Dateien
- `src/app/api/analyse/confirm/route.ts` — 2 Lösch-Blöcke entfernt (je 3 Zeilen)

## Deployment

**Deployed:** 2026-07-07
**Production URL:** https://app.mehralsabnehmen.de
**Git Tag:** v1.21.0-PROJ-21
