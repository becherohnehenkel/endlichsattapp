import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LoginHinweisProps {
  icon: LucideIcon
  text: string
  reason: string
}

// PROJ-42: ursprünglich als "AnalyseLoginHinweis" nur für die Analyse-Übersicht gebaut,
// mit PROJ-44 (Trainingspläne) als zweitem Nutzer in einen generischen Namen umbenannt —
// gemeinsame Login-Hinweis-Karte für jede Stelle, die einen Account voraussetzt.
export function LoginHinweis({ icon: Icon, text, reason }: LoginHinweisProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center text-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#DFF0F2] flex items-center justify-center">
        <Icon className="h-5 w-5 text-[#2E9E6B]" />
      </div>
      <p className="text-sm text-muted-foreground max-w-[26ch]">{text}</p>
      <Link href={`/konto?reason=${reason}`}>
        <Button size="sm" variant="outline" className="rounded-lg">Anmelden</Button>
      </Link>
    </div>
  )
}
