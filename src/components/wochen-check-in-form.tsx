'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

export interface WochenCheckInAntworten {
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

export interface WochenCheckInEintrag {
  wocheStart: string
  antworten: WochenCheckInAntworten
  updatedAt: string
}

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

const LEERE_ANTWORTEN: WochenCheckInAntworten = {
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

function formatWochenLabel(wocheStart: string): string {
  const start = new Date(`${wocheStart}T00:00:00Z`)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
  return `${fmt(start)} – ${fmt(end)}`
}

function formatZuletztAktualisiert(updatedAt: string): string {
  const tage = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24))
  if (tage <= 0) return 'Heute aktualisiert'
  if (tage === 1) return 'Vor 1 Tag aktualisiert'
  return `Vor ${tage} Tagen aktualisiert`
}

interface WochenCheckInFormProps {
  isGuest: boolean
  aktuelleWoche: string
  initialEintrag: WochenCheckInEintrag | null
  historie: WochenCheckInEintrag[]
}

// PROJ-45: Formular für den Wochen-Check-In. Speichern läuft immer über denselben
// Upsert-Mechanismus (Wochenstart als Ziel) — egal ob die aktuelle Woche zum ersten Mal
// gespeichert, ergänzt, oder ein vergangener Eintrag aus der Mini-Historie bearbeitet wird.
// Gäste sehen statt des Buttons nur den Hinweis, dass nichts gespeichert wird — kein
// Login-Vorschlag, sie können die Felder trotzdem vollständig ausfüllen.
export function WochenCheckInForm({ isGuest, aktuelleWoche, initialEintrag, historie }: WochenCheckInFormProps) {
  const [antworten, setAntwortenState] = useState<WochenCheckInAntworten>(initialEintrag?.antworten ?? LEERE_ANTWORTEN)
  const [zielWoche, setZielWoche] = useState(initialEintrag?.wocheStart ?? aktuelleWoche)
  const [zuletztAktualisiert, setZuletztAktualisiert] = useState(initialEintrag?.updatedAt ?? null)
  const [historieOffen, setHistorieOffen] = useState(false)
  const [speichern, setSpeichern] = useState(false)
  const [fehler, setFehler] = useState(false)
  const [erfolg, setErfolg] = useState(false)

  function set<K extends keyof WochenCheckInAntworten>(key: K, value: WochenCheckInAntworten[K]) {
    setAntwortenState(prev => ({ ...prev, [key]: value }))
    setErfolg(false)
  }

  function ladeEintrag(eintrag: WochenCheckInEintrag) {
    setAntwortenState(eintrag.antworten)
    setZielWoche(eintrag.wocheStart)
    setZuletztAktualisiert(eintrag.updatedAt)
    setErfolg(false)
    setFehler(false)
  }

  async function handleSpeichern() {
    setSpeichern(true)
    setFehler(false)
    try {
      const res = await fetch('/api/check-in/wochen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wocheStart: zielWoche, antworten }),
      })
      if (!res.ok) throw new Error()
      setErfolg(true)
      setZuletztAktualisiert(new Date().toISOString())
    } catch {
      setFehler(true)
    } finally {
      setSpeichern(false)
    }
  }

  const istAktuelleWoche = zielWoche === aktuelleWoche

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Deine Erfolgskontrolle</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Wir Menschen tun uns schwer, Fortschritt über einen langen Zeitraum zu sehen. Deshalb lohnt es sich, dir von Woche zu Woche 10 Minuten Zeit zu nehmen: Was war letzte Woche los? Wie soll es nächste Woche weitergehen? Investier diese 10 Minuten in dich.
        </p>
        {!isGuest && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs font-medium text-muted-foreground bg-muted/60 rounded-full px-2.5 py-1">
              {istAktuelleWoche ? 'Aktuelle Woche' : 'Vergangene Woche'} · {formatWochenLabel(zielWoche)}
            </span>
            {zuletztAktualisiert && (
              <span className="text-xs text-muted-foreground">{formatZuletztAktualisiert(zuletztAktualisiert)}</span>
            )}
          </div>
        )}
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

      {!isGuest && (
        <div className="space-y-2">
          {historie.length > 0 ? (
            <Collapsible open={historieOffen} onOpenChange={setHistorieOffen}>
              <CollapsibleTrigger className="flex items-center gap-1.5 text-sm font-medium text-[#2E9E6B] hover:underline">
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', historieOffen && 'rotate-180')} />
                Deine letzten Check-Ins
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden">
                  {historie.map(eintrag => (
                    <button
                      key={eintrag.wocheStart}
                      type="button"
                      onClick={() => ladeEintrag(eintrag)}
                      className={cn(
                        'w-full text-left px-4 py-3 flex items-center justify-between gap-2 hover:bg-muted/50 transition-colors',
                        eintrag.wocheStart === zielWoche && 'bg-[#DFF0F2]'
                      )}
                    >
                      <span className="text-sm font-medium text-foreground">{formatWochenLabel(eintrag.wocheStart)}</span>
                      <span className="text-xs text-muted-foreground">{formatZuletztAktualisiert(eintrag.updatedAt)}</span>
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <p className="text-xs text-muted-foreground">Noch keine Check-Ins gespeichert — dein erster ist nur einen Klick entfernt.</p>
          )}
        </div>
      )}

      {isGuest ? (
        <p className="text-xs text-muted-foreground bg-muted/40 rounded-xl px-4 py-3 leading-relaxed">
          Eingetragene Werte werden nicht gespeichert. Bei Neuladen der Seite sind die eingetragenen Daten weg. Kopiere diese Seite in deine Notizen App oder schreib dir die Fragen in dein Notizbuch auf.
        </p>
      ) : (
        <div className="space-y-2">
          {fehler && (
            <Alert variant="destructive">
              <AlertDescription>Speichern fehlgeschlagen. Bitte erneut versuchen.</AlertDescription>
            </Alert>
          )}
          {erfolg && (
            <Alert>
              <AlertDescription>Check-In gespeichert ✓</AlertDescription>
            </Alert>
          )}
          <Button className="w-full h-12" onClick={handleSpeichern} disabled={speichern}>
            {speichern ? 'Wird gespeichert…' : 'Speichern'}
          </Button>
        </div>
      )}
    </div>
  )
}
