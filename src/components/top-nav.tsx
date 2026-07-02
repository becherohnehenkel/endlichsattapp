'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, ChefHat, Clock, User, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: 'Startseite', icon: Home },
  { href: '/analyse', label: 'Analyse', icon: Plus },
  { href: '/rezepte', label: 'Rezepte', icon: ChefHat },
  { href: '/historie', label: 'Historie', icon: Clock },
  { href: '/konto', label: 'Konto', icon: User },
]

interface TopNavProps {
  isAdmin: boolean
}

export function TopNav({ isAdmin }: TopNavProps) {
  const pathname = usePathname()

  const items = isAdmin
    ? [...NAV_ITEMS, { href: '/admin', label: 'Admin', icon: ShieldCheck }]
    : NAV_ITEMS

  return (
    <header data-testid="top-nav" className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5DDD0] h-14">
      <div className="max-w-5xl mx-auto w-full px-6 flex items-center justify-between">
        <Link href="/" className="font-semibold text-[#4A7C59] text-lg tracking-tight">
          endlichsatt
        </Link>
        <nav className="flex items-center gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-[#E8F0EB] text-[#4A7C59] font-medium'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
