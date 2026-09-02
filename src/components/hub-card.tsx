import Link from 'next/link'
import { ChevronRight, type LucideIcon } from 'lucide-react'

export interface HubEntry {
  href: string
  title: string
  subtitle: string
  icon: LucideIcon
}

// PROJ-36: ursprünglich lokal im Ernährung-Hub definiert, mit PROJ-43 (Training-Hub)
// als zweitem Nutzer in eine gemeinsame Komponente ausgelagert.
export function HubCard({ href, title, subtitle, icon: Icon, nummer }: HubEntry & { nummer?: number }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:border-[#2E9E6B]/40 hover:bg-secondary/30 transition-colors"
    >
      <div className="relative shrink-0 w-10 h-10 rounded-xl bg-[#DFF0F2] flex items-center justify-center">
        <Icon className="h-5 w-5 text-[#2E9E6B]" />
        {nummer != null && (
          <span className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2E9E6B] text-[10px] font-bold text-white">
            {nummer}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </Link>
  )
}
