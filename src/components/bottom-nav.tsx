'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, ChefHat, Clock, User, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: 'Start', icon: Home },
  { href: '/analyse', label: 'Analyse', icon: Plus },
  { href: '/rezepte', label: 'Rezepte', icon: ChefHat },
  { href: '/historie', label: 'Historie', icon: Clock },
  { href: '/konto', label: 'Konto', icon: User },
]

interface BottomNavProps {
  isAdmin: boolean
}

export function BottomNav({ isAdmin }: BottomNavProps) {
  const pathname = usePathname()

  const items = isAdmin
    ? [...NAV_ITEMS, { href: '/admin', label: 'Admin', icon: ShieldCheck }]
    : NAV_ITEMS

  return (
    <nav
      data-testid="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#DCEEF0]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[48px]',
                'transition-colors',
                isActive ? 'text-[#2E9E6B]' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className={cn('text-[10px]', isActive && 'font-semibold')}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
