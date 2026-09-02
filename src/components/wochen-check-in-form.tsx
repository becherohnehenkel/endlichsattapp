'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface SliderFrageProps {
  id: string
  frage: string
  min: number
  max: number
  minLabel: string
  maxLabel: string
  midLabel?: string
  value: number
  onChange: (value: number) => void
  hinweis?: string
}

function SliderFrage({ id, frage, min, max, minLabel, maxLabel, midLabel, value, onChange, hinweis }: SliderFrageProps) {
  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="text-sm font-medium text-foreground leading-relaxed">{frage}</Label>
      <Slider
        id={id}
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={v => onChange(v[0])}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{minLabel}</span>
        {midLabel && <span>{midLabel}</span>}
        <span>{maxLabel}</span>
      </div>
      {hinweis && (
        <p className="text-xs text-[#0E7C86] bg-[#DFF0F2] rounded-lg px-3 py-2 leading-relaxed">{hinweis}</p>
      )}
    </div>
  )
}

interface TextFrageProps {
  id: string
  frage: string
  value: string
  onChange: (value: string) => void
}

function TextFrage({ id, frage, value, onChange }: TextFrageProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground leading-relaxed">{frage}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={3}
        className="resize-none"
      />
    </div>
  )
}

const TRAINING_OPTIONEN = [0, 1, 2, 3] as const
const TRAINING_FEEDBACK: Record<number, string> = {
  1: 'Super!',
  2: 'WOW — richtig gut!',
  3: 'Dein Körper ist dir wichtig — toll!',
}

interface Antworten {
  highlights: string
  lowlights: string
  lowlightsUrsache: string
  naechsteWocheAnders: string
  schlaf: number
  screentime: number
  energielevel: number
  achtsamkeit: number
  bewusstEssen: number
  sicherheitOhneTracking: number
  training: number | null
  trainingGrund: string
  sonstiges: string
}

const initialAntworten: Antworten = {
  highlights: '',
  lowlights: '',
  lowlightsUrsache: '',
  naechsteWocheAnders: '',
  schlaf: 5,
  screentime: 5,
  energielevel: 5,
  achtsamkeit: 5,
  bewusstEssen: 5,
  sicherheitOhneTracking: 0,
  training: null,
  trainingGrund: '',
  sonstiges: '',
}

export function WochenCheckInForm() {
  const [antworten, setAntworten] = useState<Antworten>(initialAntworten)

  function set<K extends keyof Antworten>(key: K, value: Antworten[K]) {
    setAntworten(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Deine Erfolgskontrolle</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Wir Menschen tun uns schwer, Fortschritt über einen langen Zeitraum zu sehen. Deshalb lohnt es sich, dir von Woche zu Woche 10 Minuten Zeit zu nehmen: Was war letzte Woche los? Wie soll es nächste Woche weitergehen? Investier diese 10 Minuten in dich.
        </p>
      </div>

      <div className="space-y-6">
        <TextFrage
          id="highlights"
          frage="Highlights der letzten Woche"
          value={antworten.highlights}
          onChange={v => set('highlights', v)}
        />
        <TextFrage
          id="lowlights"
          frage="Lowlights der letzten Woche"
          value={antworten.lowlights}
          onChange={v => set('lowlights', v)}
        />
        <TextFrage
          id="lowlights-ursache"
          frage="Wie könntest du weniger Lowlights haben? Woran hat es konkret gelegen?"
          value={antworten.lowlightsUrsache}
          onChange={v => set('lowlightsUrsache', v)}
        />
        <TextFrage
          id="naechste-woche-anders"
          frage="Das mache ich nächste Woche anders"
          value={antworten.naechsteWocheAnders}
          onChange={v => set('naechsteWocheAnders', v)}
        />

        <SliderFrage
          id="schlaf"
          frage="Wie war dein Schlaf letzte Woche?"
          min={1}
          max={10}
          minLabel="1 Schlecht"
          maxLabel="10 Sehr erholsam"
          value={antworten.schlaf}
          onChange={v => set('schlaf', v)}
        />
        <SliderFrage
          id="screentime"
          frage="Wie war deine Screentime letzte Woche?"
          min={0}
          max={10}
          minLabel="0 Min"
          maxLabel=">10 Std."
          value={antworten.screentime}
          onChange={v => set('screentime', v)}
        />
        <SliderFrage
          id="energielevel"
          frage="Wie war dein Energielevel?"
          min={0}
          max={10}
          minLabel="0 Krank"
          maxLabel="10 Bäume ausreißen"
          value={antworten.energielevel}
          onChange={v => set('energielevel', v)}
        />
        <SliderFrage
          id="achtsamkeit"
          frage="Wie sehr hast du auf deine Ernährung geachtet?"
          min={0}
          max={10}
          minLabel="0 Gar nicht"
          maxLabel="10 Alles getrackt"
          value={antworten.achtsamkeit}
          onChange={v => set('achtsamkeit', v)}
        />
        <SliderFrage
          id="bewusst-essen"
          frage="Wie schwer war es für dich, bewusst zu essen?"
          min={0}
          max={10}
          minLabel="0 Sehr schwer"
          midLabel="5 Immer mal wieder"
          maxLabel="10 Total einfach"
          value={antworten.bewusstEssen}
          onChange={v => set('bewusstEssen', v)}
        />
        <SliderFrage
          id="sicherheit-ohne-tracking"
          frage="Wie sicher fühlst du dich, wenn du nächste Woche nicht mehr trackst?"
          min={0}
          max={10}
          minLabel="0 Unsicher"
          midLabel="5 Könnte klappen"
          maxLabel="10 Bin bereit"
          value={antworten.sicherheitOhneTracking}
          onChange={v => set('sicherheitOhneTracking', v)}
          hinweis={
            antworten.sicherheitOhneTracking >= 5
              ? 'Dann tracke an normalen Arbeitstagen nicht — deine Routine sitzt schon.'
              : undefined
          }
        />

        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground leading-relaxed">Hast du dein Training machen können?</Label>
          <div className="grid grid-cols-4 gap-2">
            {TRAINING_OPTIONEN.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => set('training', option)}
                aria-pressed={antworten.training === option}
                className={cn(
                  'h-11 rounded-xl border text-sm font-medium transition-colors',
                  antworten.training === option
                    ? 'border-[#2E9E6B] bg-[#2E9E6B] text-white'
                    : 'border-border bg-card text-foreground hover:bg-muted/50'
                )}
              >
                {option}x
              </button>
            ))}
          </div>
          {antworten.training !== null && antworten.training > 0 && (
            <p className="text-xs text-[#0E7C86] bg-[#DFF0F2] rounded-lg px-3 py-2 leading-relaxed">
              {TRAINING_FEEDBACK[antworten.training]}
            </p>
          )}
          {antworten.training === 0 && (
            <TextFrage
              id="training-grund"
              frage="Woran hat es gelegen? Wie stellst du sicher, dass es nächstes Mal klappt?"
              value={antworten.trainingGrund}
              onChange={v => set('trainingGrund', v)}
            />
          )}
        </div>

        <TextFrage
          id="sonstiges"
          frage="Etwas vergessen? Was war sonst noch wichtig?"
          value={antworten.sonstiges}
          onChange={v => set('sonstiges', v)}
        />
      </div>
    </div>
  )
}
