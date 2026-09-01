'use client'

import { useEffect, useRef, useState } from 'react'

interface BewegungsOption {
  id: string
  emoji: string
  label: string
  sekunden: number
}

const OPTIONEN: BewegungsOption[] = [
  { id: 'kniebeugen', emoji: '🏋️', label: 'Kniebeugen', sekunden: 60 },
  { id: 'liegestuetze', emoji: '💪', label: 'Liegestütze', sekunden: 60 },
  { id: 'plank', emoji: '🧘', label: 'Plank', sekunden: 60 },
  { id: 'block', emoji: '🚶', label: 'Runde um den Block', sekunden: 600 },
]

function formatZeit(sekunden: number): string {
  const m = Math.floor(sekunden / 60)
  const s = sekunden % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function BewegungsTimer() {
  const [rest, setRest] = useState<Record<string, number>>({})
  const intervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({})

  useEffect(() => {
    const intervals = intervalsRef.current
    return () => {
      Object.values(intervals).forEach(clearInterval)
    }
  }, [])

  function start(opt: BewegungsOption) {
    if (intervalsRef.current[opt.id]) return
    setRest(r => ({ ...r, [opt.id]: opt.sekunden }))
    intervalsRef.current[opt.id] = setInterval(() => {
      setRest(r => {
        const naechster = (r[opt.id] ?? 1) - 1
        if (naechster <= 0) {
          clearInterval(intervalsRef.current[opt.id])
          delete intervalsRef.current[opt.id]
          return { ...r, [opt.id]: 0 }
        }
        return { ...r, [opt.id]: naechster }
      })
    }, 1000)
  }

  function reset(opt: BewegungsOption) {
    if (intervalsRef.current[opt.id]) {
      clearInterval(intervalsRef.current[opt.id])
      delete intervalsRef.current[opt.id]
    }
    setRest(r => {
      const { [opt.id]: _entfernt, ...rest2 } = r
      return rest2
    })
  }

  return (
    <div className="space-y-2">
      {OPTIONEN.map(opt => {
        const laeuft = opt.id in rest && rest[opt.id] > 0
        const fertig = rest[opt.id] === 0
        return (
          <div key={opt.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 p-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-base flex-shrink-0">{opt.emoji}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">{opt.label}</p>
                <p className="text-[10px] text-muted-foreground">{formatZeit(opt.sekunden)} Min.</p>
              </div>
            </div>
            {fertig ? (
              <button
                type="button"
                onClick={() => reset(opt)}
                className="flex-shrink-0 text-xs font-medium text-[#2E9E6B]"
              >
                ✅ Fertig
              </button>
            ) : laeuft ? (
              <button
                type="button"
                onClick={() => reset(opt)}
                className="flex-shrink-0 min-w-[44px] text-right text-xs font-semibold text-[#0E7C86] tabular-nums"
              >
                {formatZeit(rest[opt.id])}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => start(opt)}
                className="flex-shrink-0 rounded-full bg-[#2E9E6B] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#278a5c]"
              >
                ▶ Start
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
