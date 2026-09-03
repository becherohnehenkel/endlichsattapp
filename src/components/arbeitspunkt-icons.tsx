import { BicepsFlexed } from 'lucide-react'

// PROJ-37 (Refinement 2026-09-03): Vergleichsicons für die 4 Krafttraining-Gründe (klein/neutral
// → groß/hervorgehoben) sowie das Schlaf-Icon. Reine SVG/Lucide-Illustrationen, keine Bild-Assets.
// "Muskeln erhalten" nutzt bewusst das fertige Lucide-Icon "BicepsFlexed" statt eines
// Freihand-Entwurfs (siehe Spec-Decision-Log — mehrere Freihand-Versuche wurden verworfen).

const MUTED = '#B9BEB6'
const PRIMARY = '#2E9E6B'

export function MuskelnErhaltenIcons() {
  return (
    <div className="w-20 flex-shrink-0 flex items-center justify-center gap-1.5">
      <BicepsFlexed className="h-[22px] w-[22px] text-[#B9BEB6]" strokeWidth={2} />
      <span className="text-muted-foreground text-xs">→</span>
      <BicepsFlexed className="h-10 w-10 text-[#2E9E6B]" strokeWidth={2} />
    </div>
  )
}

export function GrundumsatzIcons() {
  return (
    <div className="w-20 flex-shrink-0 flex items-center justify-center gap-1.5">
      <svg width="14" height="24" viewBox="0 0 24 40">
        <path d="M12 6 C6 16 6 24 12 32 C18 24 18 16 12 6Z" fill={MUTED} />
      </svg>
      <span className="text-muted-foreground text-xs">→</span>
      <svg width="24" height="32" viewBox="0 0 34 46">
        <path d="M17 2 C6 16 5 28 17 42 C29 28 28 16 17 2Z" fill="#E8A33D" />
        <path d="M17 16 C11.5 23.5 11.5 30.5 17 36 C22.5 30.5 22.5 23.5 17 16Z" fill={PRIMARY} />
      </svg>
    </div>
  )
}

export function GesundAlternIcons() {
  return (
    <div className="w-20 flex-shrink-0 flex items-center justify-center gap-1.5">
      <svg width="24" height="24" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15" fill="none" stroke={MUTED} strokeWidth="2" />
        <circle cx="13" cy="16" r="1.4" fill={MUTED} />
        <circle cx="23" cy="16" r="1.4" fill={MUTED} />
        <path d="M12 24 h12" stroke={MUTED} strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="text-muted-foreground text-xs">→</span>
      <svg width="24" height="24" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15" fill="none" stroke={PRIMARY} strokeWidth="2" />
        <circle cx="13" cy="16" r="1.4" fill={PRIMARY} />
        <circle cx="23" cy="16" r="1.4" fill={PRIMARY} />
        <path d="M11 22 q7 7 14 0" stroke={PRIMARY} strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function KoerperFormenIcons() {
  return (
    <div className="w-20 flex-shrink-0 flex items-center justify-center gap-1.5">
      <svg width="16" height="28" viewBox="0 0 26 46">
        <circle cx="13" cy="6" r="4.2" fill={MUTED} />
        <path
          d="M6 16 C6 13 9 12 13 12 C17 12 20 13 20 16 L20 30 C20 32 19 33 17.5 33 L17.5 42 C17.5 43.5 16 44 15 44 C14 44 13.3 43.3 13.3 42.3 L13.3 33 L12.7 33 L12.7 42.3 C12.7 43.3 12 44 11 44 C10 44 8.5 43.5 8.5 42 L8.5 33 C7 33 6 32 6 30 Z"
          fill={MUTED}
        />
      </svg>
      <span className="text-muted-foreground text-xs">→</span>
      <svg width="16" height="28" viewBox="0 0 26 46">
        <circle cx="13" cy="6" r="4.2" fill={PRIMARY} />
        <path
          d="M5 16 C5 13 8 12 13 12 C18 12 21 13 21 16 L20 24 C22 26 21 30 18.5 32 L18.5 42 C18.5 43.5 17 44 15.5 44 C14.3 44 13.5 43.3 13.5 42.2 L13.5 33 L12.5 33 L12.5 42.2 C12.5 43.3 11.7 44 10.5 44 C9 44 7.5 43.5 7.5 42 L7.5 32 C5 30 4 26 6 24 Z"
          fill={PRIMARY}
        />
        <line x1="13" y1="18" x2="13" y2="30" stroke="#DFF0F2" strokeWidth="1.2" opacity="0.8" />
        <line x1="9" y1="21" x2="17" y2="21" stroke="#DFF0F2" strokeWidth="1" opacity="0.7" />
        <line x1="9" y1="25" x2="17" y2="25" stroke="#DFF0F2" strokeWidth="1" opacity="0.7" />
      </svg>
    </div>
  )
}

export function SchlafIcon() {
  return (
    <svg width="52" height="48" viewBox="0 0 56 52" className="flex-shrink-0">
      <circle cx="24" cy="30" r="16" fill="#DFF0F2" stroke={PRIMARY} strokeWidth="2" />
      <path d="M15 28 q4 3 8 0" stroke="#0E7C86" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M27 28 q4 3 8 0" stroke="#0E7C86" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <ellipse cx="24" cy="37" rx="2.6" ry="2" fill="#0E7C86" opacity="0.85" />
      <text x="36" y="20" fontSize="11" fill="#0E7C86" fontFamily="sans-serif" fontWeight="700">Z</text>
      <text x="43" y="14" fontSize="8.5" fill="#0E7C86" fontFamily="sans-serif" fontWeight="700">z</text>
      <text x="48" y="9" fontSize="6.5" fill="#0E7C86" fontFamily="sans-serif" fontWeight="700">z</text>
    </svg>
  )
}
