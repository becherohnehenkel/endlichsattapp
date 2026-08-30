'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, ChefHat, Dumbbell, ClipboardCheck, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: 'Startseite', icon: Home },
  { href: '/ernaehrung', label: 'Ernährung', icon: ChefHat },
  { href: '/analyse', label: 'Analyse', icon: Plus },
  { href: '/training', label: 'Training', icon: Dumbbell },
  { href: '/check-in', label: 'Check-In', icon: ClipboardCheck },
]

export function TopNav() {
  const pathname = usePathname()
  const isKontoActive = pathname.startsWith('/konto')

  return (
    <header data-testid="top-nav" className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#DCEEF0] h-14">
      <div className="max-w-5xl mx-auto w-full px-6 flex items-center justify-between">
        <Link href="/" className="font-semibold text-[#2E9E6B] text-lg tracking-tight">
          Mehralsabnehmen
        </Link>
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-[#DFF0F2] text-[#2E9E6B] font-medium'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              )
            })}
          </nav>
          <div className="w-px h-6 bg-[#DCEEF0]" />
          <Link
            href="/konto"
            aria-label="Konto"
            className={cn(
              'p-1.5 rounded-md transition-colors',
              isKontoActive
                ? 'bg-[#DFF0F2] text-[#2E9E6B]'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            )}
          >
            <User size={18} />
          </Link>
        </div>
      </div>
    </header>
  )
}
