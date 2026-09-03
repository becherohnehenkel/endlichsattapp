// PROJ-45 (Refinement 2026-09-03): geteilte Werte-Liste für die nicht-lineare
// Screentime-Minuten-Skala — von Formular (Slider-Index) UND API-Route (Server-Validierung)
// genutzt, damit beide Seiten garantiert dieselben erlaubten Werte kennen.
export const SCREENTIME_MINUTEN_SCHRITTE: readonly number[] = [
  0, 15, 30, 45, 60,
  90, 120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450, 480, 510, 540, 570, 600,
]
