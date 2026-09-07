'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isBottomNavHidden } from '@/lib/nav-visibility'
import { cn } from '@/lib/utils'

// Sitzt bewusst außerhalb von NavigationShell (siehe PROJ-20-Refinement), damit er auf
// wirklich jeder Seite erscheint — auch dort, wo NavigationShell TopNav/BottomNav komplett
// ausblendet (Login, Registrieren, Upgrade, Admin, Auth). Mobil stapelt er sich direkt über
// der BottomNav (wenn sichtbar) statt sie zu überlappen; auf Seiten ohne BottomNav sowie auf
// Desktop sitzt er ganz unten.
export function LegalFooter() {
  const pathname = usePathname()
  const bottomNavVisible = !isBottomNavHidden(pathname)

  return (
    <footer
      data-testid="legal-footer"
      className={cn(
        'fixed left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-[#DCEEF0]',
        bottomNavVisible ? 'bottom-16 md:bottom-0' : 'bottom-0'
      )}
      style={{ paddingBottom: bottomNavVisible ? undefined : 'env(safe-area-inset-bottom)' }}
    >
      <p className="text-center text-[11px] text-muted-foreground py-1.5 space-x-2">
        <Link href="/impressum" className="hover:underline">Impressum</Link>
        <span aria-hidden="true">·</span>
        <Link href="/datenschutz" className="hover:underline">Datenschutz</Link>
      </p>
    </footer>
  )
}
