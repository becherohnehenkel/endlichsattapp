import { ClipboardCheck } from 'lucide-react'
import { formatWochenLabel } from '@/lib/format-wochen-check-in'

export interface CheckInEntry {
  id: string
  wocheStart: string
}

export default function CheckInEintrag({ wocheStart }: CheckInEntry) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card">
      <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="font-medium text-foreground text-sm">{formatWochenLabel(wocheStart)}</p>
    </div>
  )
}
