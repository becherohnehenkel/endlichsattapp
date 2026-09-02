'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, UserRound } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface TrainingSubHeaderProps {
  title: string
}

// PROJ-44: gemeinsamer Header für Trainingsplan-Detailseiten, analog zu
// ErnaehrungSubHeader (PROJ-36) und AnalyseSubHeader (PROJ-42).
export function TrainingSubHeader({ title }: TrainingSubHeaderProps) {
  const router = useRouter()

  return (
    <header className="md:hidden sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center gap-2">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Zurück"
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0 -ml-1 p-1"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/training">Training</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate block font-semibold text-foreground">
              {title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Link
        href="/konto"
        aria-label="Konto"
        className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted shrink-0"
      >
        <UserRound className="h-4 w-4" />
      </Link>
    </header>
  )
}
