import { Meh, Smile } from 'lucide-react'

// PROJ-41, Arbeitspunkt "Das Aufhören": Jetzt-vs-Zukunft-Vergleich mit vorhandenen
// Gesichts-Icons (neutral/grau vs. lächelnd/grün) statt einer Custom-Illustration.
export function JetztZukunftVergleich() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/40 p-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Meh className="h-7 w-7 text-muted-foreground" />
        </span>
        <p className="text-xs font-medium text-foreground">So isst du jetzt</p>
      </div>
      <div className="flex flex-col items-center gap-2 rounded-xl bg-[#DFF0F2] p-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2E9E6B]/15">
          <Smile className="h-7 w-7 text-[#2E9E6B]" />
        </span>
        <p className="text-xs font-medium text-[#2E9E6B]">So wirst du in Zukunft essen</p>
      </div>
    </div>
  )
}
