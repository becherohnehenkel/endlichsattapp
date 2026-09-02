'use client'

import { usePathname } from 'next/navigation'
import { TopNav } from './top-nav'
import { BottomNav } from './bottom-nav'

const HIDDEN_PATHS = ['/login', '/registrieren', '/upgrade']
const HIDDEN_PREFIXES = ['/admin', '/auth']

interface NavigationShellProps {
  children: React.ReactNode
}

// Nav ist unabhängig vom Session-Zustand sichtbar (Fix: Gäste ohne anonyme Session — die
// erst client-seitig beim Besuch von /analyse/start entsteht, siehe PROJ-19 — sahen sonst
// gar keine Navigation, z. B. direkt auf der Startseite). BottomNav/TopNav selbst zeigen
// für Gast und eingeloggten Nutzer ohnehin identische Inhalte (kein Lock-Icon, siehe PROJ-35).
export function NavigationShell({ children }: NavigationShellProps) {
  const pathname = usePathname()

  const shouldHideNav =
    HIDDEN_PATHS.includes(pathname) ||
    HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (shouldHideNav) {
    return <>{children}</>
  }

  return (
    <>
      <TopNav />
      <div className="md:pt-14 pb-20 md:pb-0">
        {children}
      </div>
      <BottomNav />
    </>
  )
}
