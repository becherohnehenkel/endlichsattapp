'use client'

import { Smartphone, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Startseite (Refinement 2026-09-04): dezentes Icon, das ein Overlay mit der
// Installationsanleitung (iOS/Android) öffnet — bewusst nur als Symbol sichtbar
// (kein Text-Button), damit es die Begrüßung nicht überladen.
export function PwaInstallHinweis() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Als App installieren"
          className="relative w-[38px] h-[38px] rounded-xl bg-[#DFF0F2] flex items-center justify-center flex-shrink-0 hover:brightness-95 transition-[filter]"
        >
          <Smartphone className="h-[18px] w-[18px] text-[#0E7C86]" />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#2E9E6B] border-2 border-background flex items-center justify-center">
            <Plus className="h-2.5 w-2.5 text-white" strokeWidth={3} />
          </span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>App installieren</DialogTitle>
          <DialogDescription>
            Installiere Mehralsabnehmen auf deinem Homescreen — schneller Zugriff, wie eine echte App.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Smartphone className="h-3.5 w-3.5 text-[#0E7C86]" />
              iPhone / iPad (Safari)
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Tippe unten auf das Teilen-Symbol.</li>
              <li>Scrolle im Menü zu &quot;Zum Home-Bildschirm&quot;.</li>
              <li>Tippe oben rechts auf &quot;Hinzufügen&quot;.</li>
            </ol>
          </div>

          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Smartphone className="h-3.5 w-3.5 text-[#0E7C86]" />
              Android (Chrome)
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Tippe oben rechts auf die drei Punkte.</li>
              <li>Wähle &quot;App installieren&quot; (oder &quot;Zum Startbildschirm hinzufügen&quot;).</li>
              <li>Bestätige mit &quot;Installieren&quot;.</li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button>Verstanden</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
