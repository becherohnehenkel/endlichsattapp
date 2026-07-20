# Design System — endlichsatt

> Palette aktualisiert am 2026-07-20 auf Basis des Claude-Design-Projekts
> "Sättigungsmatrix Design System" (`tokens/colors.css`) — bewusste Entscheidung
> des Product Owners, siehe Chat-Historie. Löst die vorherige grün/cremefarbene
> Palette ab.

## Farben

| Token | Hex | Verwendung |
|-------|-----|------------|
| Primary | `#2E9E6B` | Buttons, Links, Akzente |
| Primary Hover | `#268a5c` | Hover-States auf Primary |
| Secondary / Accent | `#DFF0F2` | Helle Hintergründe, Sekundär-Buttons |
| Accent Strong | `#0E7C86` | Teaser-Text, betonte Akzentfarbe |
| Background | `#F2F9FA` | Seitenbackground |
| Surface | `#FFFFFF` | Cards, Modals |
| Text Primary | `#0B2C30` | Überschriften, Body |
| Text Muted | `#456A6E` | Subtexte, Labels |
| Border | `#DCEEF0` | Rahmen, Trennlinien |
| Warning | `#D97706` | Hinweise, kritische Rückfragen |
| Success | `#2E9E6B` | Positive Einschätzungen |

Rating-Farben (gut/mittel/schwach) bleiben vorerst auf den bestehenden
Tailwind-Klassen (`emerald`/`amber`/`red`) — nicht Teil dieser Palette-Umstellung.

## Typografie

- **Font:** Inter (Google Fonts)
- **Überschriften:** `font-semibold`, tight tracking
- **Body:** `font-normal`, `leading-relaxed`
- **Hinweis-Texte:** `text-sm text-muted`

## Komponenten-Basis

shadcn/ui — keine Custom-Varianten der Basis-Komponenten.

## Ton & Feeling

Warm, nicht klinisch. Keine Neon-Farben, keine Fitness-App-Ästhetik.
Eher: Kochbuch trifft modernes SaaS-Dashboard.
