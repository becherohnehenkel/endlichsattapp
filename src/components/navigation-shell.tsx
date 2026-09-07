'use client'

import { usePathname } from 'next/navigation'
import { TopNav } from './top-nav'
import { BottomNav } from './bottom-nav'
import { isBottomNavHidden } from '@/lib/nav-visibility'

interface NavigationShellProps {
  children: React.ReactNode
}

// Nav ist unabhängig vom Session-Zustand sichtbar (Fix: Gäste ohne anonyme Session — die
// erst client-seitig beim Besuch von /analyse/start entsteht, siehe PROJ-19 — sahen sonst
// gar keine Navigation, z. B. direkt auf der Startseite). BottomNav/TopNav selbst zeigen
// für Gast und eingeloggten Nutzer ohnehin identische Inhalte (kein Lock-Icon, siehe PROJ-35).
export function NavigationShell({ children }: NavigationShellProps) {
  const pathname = usePathname()

  const shouldHideNav = isBottomNavHidden(pathname)

  // pb-7/md:pb-7 reservieren jeweils Platz für den global gerenderten LegalFooter
  // (PROJ-20-Refinement), der außerhalb dieser Komponente in src/app/layout.tsx sitzt.
  if (shouldHideNav) {
    return <div className="pb-7">{children}</div>
  }

  return (
    <>
      <TopNav />
      <div className="md:pt-14 pb-24 md:pb-7">
        {children}
      </div>
      <BottomNav />
    </>
  )
}
