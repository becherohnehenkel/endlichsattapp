import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminForbiddenPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl mb-4">🔒</p>
      <h1 className="text-xl font-semibold text-foreground mb-2">Kein Zugriff</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Diese Seite ist nur für Administratoren zugänglich.
      </p>
      <Link href="/">
        <Button variant="outline">Zur Startseite</Button>
      </Link>
    </div>
  )
}
