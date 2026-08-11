// Refinement 2026-08-11 ("Complete"-Umstrukturierung): unterstützt jetzt sowohl das alte
// Drei-Stufen-Vokabular (gut/mittel/schwach — historische Mahlzeit-Analysen) als auch das
// neue Vier-Stufen-Vokabular (gut/mittel/gering/ungenuegend — neue Analysen + Rezepte).
// `segments` steuert, welches Ringsegment-Layout gezeichnet wird; `rating` bestimmt nur noch,
// wie viele Segmente gefüllt sind.
const FILLED_COUNT_3: Record<string, number> = { gut: 3, mittel: 2, schwach: 1 }
const FILLED_COUNT_4: Record<string, number> = { gut: 4, mittel: 3, gering: 2, ungenuegend: 1 }

interface RatingRingProps {
  rating: string
  size?: number
  /** 3 = altes Drei-Stufen-Vokabular (Default, rückwärtskompatibel), 4 = neues Vier-Stufen-Vokabular */
  segments?: 3 | 4
}

/**
 * Segmented ring around a pillar emoji — fills N/3 or N/4 segments depending on `segments`.
 * Renders in `currentColor`, so wrap in an element with the pillar's text-color class
 * (e.g. `ratingConfig(rating).text`).
 */
export default function RatingRing({ rating, size = 44, segments = 3 }: RatingRingProps) {
  const filledCount = segments === 4 ? (FILLED_COUNT_4[rating] ?? 0) : (FILLED_COUNT_3[rating] ?? 0)
  const stroke = size <= 32 ? 3 : 5
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const segAngle = 360 / segments
  const gapDeg = segments === 4 ? 16 : 22
  const segDeg = segAngle - gapDeg

  const segs = Array.from({ length: segments }, (_, i) => {
    const startAngle = -90 + i * segAngle + gapDeg / 2
    const endAngle = startAngle + segDeg
    const toXY = (deg: number): [number, number] => {
      const rad = (deg * Math.PI) / 180
      return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
    }
    const [x1, y1] = toXY(startAngle)
    const [x2, y2] = toXY(endAngle)
    return { d: `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`, isFilled: i < filledCount }
  })

  return (
    <svg width={size} height={size} className="absolute inset-0" aria-hidden="true">
      {segs.map((s, i) => (
        <path
          key={i}
          d={s.d}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={s.isFilled ? 'stroke-current' : 'stroke-border'}
        />
      ))}
    </svg>
  )
}
