const FILLED_COUNT: Record<string, number> = { gut: 3, mittel: 2, schwach: 1 }

interface RatingRingProps {
  rating: string
  size?: number
}

/**
 * Segmented 3-part ring around a pillar emoji — fills 1/2/3 segments for
 * schwach/mittel/gut. Renders in `currentColor`, so wrap in an element with
 * the pillar's text-color class (e.g. `ratingConfig(rating).text`).
 */
export default function RatingRing({ rating, size = 44 }: RatingRingProps) {
  const filled = FILLED_COUNT[rating] ?? 0
  const stroke = size <= 32 ? 3 : 5
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const gapDeg = 22
  const segDeg = 120 - gapDeg

  const segments = [0, 1, 2].map(i => {
    const startAngle = -90 + i * 120 + gapDeg / 2
    const endAngle = startAngle + segDeg
    const toXY = (deg: number): [number, number] => {
      const rad = (deg * Math.PI) / 180
      return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
    }
    const [x1, y1] = toXY(startAngle)
    const [x2, y2] = toXY(endAngle)
    return { d: `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`, isFilled: i < filled }
  })

  return (
    <svg width={size} height={size} className="absolute inset-0" aria-hidden="true">
      {segments.map((s, i) => (
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
