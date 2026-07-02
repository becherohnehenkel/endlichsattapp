'use client'

import { usePathname } from 'next/navigation'
import { TopNav } from './top-nav'
import { BottomNav } from './bottom-nav'

const HIDDEN_PATHS = ['/login', '/registrieren', '/upgrade']
const HIDDEN_PREFIXES = ['/admin', '/auth']

interface NavigationShellProps {
  isAdmin: boolean
  isLoggedIn: boolean
  children: React.ReactNode
}

export function NavigationShell({ isAdmin, isLoggedIn, children }: NavigationShellProps) {
  const pathname = usePathname()

  const shouldHideNav =
    !isLoggedIn ||
    HIDDEN_PATHS.includes(pathname) ||
    HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (shouldHideNav) {
    return <>{children}</>
  }

  return (
    <>
      <TopNav isAdmin={isAdmin} />
      <div className="md:pt-14 pb-20 md:pb-0">
        {children}
      </div>
      <BottomNav isAdmin={isAdmin} />
    </>
  )
}
