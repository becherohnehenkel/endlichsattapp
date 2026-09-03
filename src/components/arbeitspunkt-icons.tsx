import type { ReactNode } from 'react'
import { BicepsFlexed, Snowflake, Moon, LoaderPinwheel } from 'lucide-react'

// PROJ-37 (Refinement 2026-09-03): Vergleichsicons für die 4 Krafttraining-Gründe (klein/neutral
// → groß/hervorgehoben) sowie das Schlaf-Icon. Reine SVG/Lucide-Illustrationen, keine Bild-Assets.
// "Muskeln erhalten" nutzt bewusst das fertige Lucide-Icon "BicepsFlexed" statt eines
// Freihand-Entwurfs (siehe Spec-Decision-Log — mehrere Freihand-Versuche wurden verworfen).
//
// PROJ-37 (Refinement 2026-09-03, Icon-Layout-Feinschliff): Icons vergrößert und über
// `IconCompare` spaltenbündig (Desktop/Tablet) bzw. optisch zentriert (Mobile) ausgerichtet
// — siehe `so-geht-abnehmen-guide.tsx` für das umgebende Grid. Das kleine Icon + Pfeil hängt
// bei BEIDEN Breakpoints per `absolute` als kompakte Anmerkung links vom großen Icon: eine
// geometrisch mittige Box (klein+Pfeil+groß als ein Block) wirkt durch das unterschiedliche
// visuelle Gewicht der beiden Icon-Größen nach rechts verschoben — erst wenn das GROSSE Icon
// allein die Mitte definiert, sitzt es exakt zentriert. Das gilt nicht nur auf Mobile, sondern
// auch auf Desktop/Tablet für die Spaltenbündigkeit: die 4 Icon-Paare haben unterschiedlich
// breite kleine Icons (16–26px), eine als GANZES zentrierte Reihe hätte die großen Icons daher
// um bis zu 5px gegeneinander verschoben — per Playwright-Bounding-Box-Test abgesichert.

const MUTED = '#B9BEB6'
const PRIMARY = '#2E9E6B'

function IconCompare({ small, large }: { small: ReactNode; large: ReactNode }) {
  return (
    <div className="relative flex items-center justify-center">
      <span className="absolute right-full mr-1.5 flex items-center gap-1.5">
        {small}
        <span className="text-muted-foreground text-xs">→</span>
      </span>
      {large}
    </div>
  )
}

export function MuskelnErhaltenIcons() {
  return (
    <IconCompare
      small={<BicepsFlexed className="h-[26px] w-[26px] text-[#B9BEB6]" strokeWidth={2} />}
      large={<BicepsFlexed className="h-[50px] w-[50px] text-[#2E9E6B]" strokeWidth={2} />}
    />
  )
}

export function GrundumsatzIcons() {
  return (
    <IconCompare
      small={
        <svg width="16" height="26" viewBox="0 0 24 40">
          <path d="M12 6 C6 16 6 24 12 32 C18 24 18 16 12 6Z" fill={MUTED} />
        </svg>
      }
      large={
        <svg width="36" height="48" viewBox="0 0 34 46">
          <path d="M17 2 C6 16 5 28 17 42 C29 28 28 16 17 2Z" fill="#E8A33D" />
          <path d="M17 16 C11.5 23.5 11.5 30.5 17 36 C22.5 30.5 22.5 23.5 17 16Z" fill={PRIMARY} />
        </svg>
      }
    />
  )
}

export function GesundAlternIcons() {
  return (
    <IconCompare
      small={
        <svg width="26" height="26" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke={MUTED} strokeWidth="2" />
          <circle cx="13" cy="16" r="1.4" fill={MUTED} />
          <circle cx="23" cy="16" r="1.4" fill={MUTED} />
          <path d="M12 24 h12" stroke={MUTED} strokeWidth="2" strokeLinecap="round" />
        </svg>
      }
      large={
        <svg width="48" height="48" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke={PRIMARY} strokeWidth="2" />
          <circle cx="13" cy="16" r="1.4" fill={PRIMARY} />
          <circle cx="23" cy="16" r="1.4" fill={PRIMARY} />
          <path d="M11 22 q7 7 14 0" stroke={PRIMARY} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      }
    />
  )
}

export function KoerperFormenIcons() {
  return (
    <IconCompare
      small={
        <svg width="15" height="26" viewBox="0 0 26 46">
          <circle cx="13" cy="6" r="4.2" fill={MUTED} />
          <path
            d="M6 16 C6 13 9 12 13 12 C17 12 20 13 20 16 L20 30 C20 32 19 33 17.5 33 L17.5 42 C17.5 43.5 16 44 15 44 C14 44 13.3 43.3 13.3 42.3 L13.3 33 L12.7 33 L12.7 42.3 C12.7 43.3 12 44 11 44 C10 44 8.5 43.5 8.5 42 L8.5 33 C7 33 6 32 6 30 Z"
            fill={MUTED}
          />
        </svg>
      }
      large={
        <svg width="27" height="48" viewBox="0 0 26 46">
          <circle cx="13" cy="6" r="4.2" fill={PRIMARY} />
          <path
            d="M5 16 C5 13 8 12 13 12 C18 12 21 13 21 16 L20 24 C22 26 21 30 18.5 32 L18.5 42 C18.5 43.5 17 44 15.5 44 C14.3 44 13.5 43.3 13.5 42.2 L13.5 33 L12.5 33 L12.5 42.2 C12.5 43.3 11.7 44 10.5 44 C9 44 7.5 43.5 7.5 42 L7.5 32 C5 30 4 26 6 24 Z"
            fill={PRIMARY}
          />
          <line x1="13" y1="18" x2="13" y2="30" stroke="#DFF0F2" strokeWidth="1.2" opacity="0.8" />
          <line x1="9" y1="21" x2="17" y2="21" stroke="#DFF0F2" strokeWidth="1" opacity="0.7" />
          <line x1="9" y1="25" x2="17" y2="25" stroke="#DFF0F2" strokeWidth="1" opacity="0.7" />
        </svg>
      }
    />
  )
}

export function SchlafIcon() {
  return (
    <svg width="76" height="70" viewBox="0 0 56 52" className="flex-shrink-0">
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

// PROJ-37 (Refinement 2026-09-03, Icon-Layout-Feinschliff): kombinierte Übersicht der 4
// Schlaf-Tipps. "3-2-1" gibt es nicht als Lucide-Icon — als fette Zahlen-Kachel im selben
// Kachel-Stil wie die übrigen 3 Icons (Snowflake/Moon/LoaderPinwheel, alle aus lucide-react
// wie "Muskeln erhalten", damit es einheitlich aussieht).
export function SchlafTippsIconLeiste() {
  const tiles: { icon: ReactNode; label: string }[] = [
    { icon: <span className="text-[13px] font-extrabold tracking-tight text-[#0E7C86]">3·2·1</span>, label: '3-2-1-Regel' },
    { icon: <Snowflake className="h-6 w-6 text-[#0E7C86]" strokeWidth={2} />, label: 'Kühle Umgebung' },
    { icon: <Moon className="h-6 w-6 text-[#0E7C86]" strokeWidth={2} />, label: 'Dunkelheit' },
    { icon: <LoaderPinwheel className="h-6 w-6 text-[#0E7C86]" strokeWidth={2} />, label: 'Kreisende Gedanken' },
  ]
  return (
    <div className="flex justify-between gap-2 rounded-xl bg-[#DFF0F2] px-3 py-4">
      {tiles.map(({ icon, label }) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#0E7C86]/15 bg-white">
            {icon}
          </div>
          <span className="text-center text-[9.5px] font-semibold leading-tight text-[#0E7C86]">{label}</span>
        </div>
      ))}
    </div>
  )
}
