'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  berechneKcal,
  istGewichtGueltig,
  istGroesseGueltig,
  istAlterGueltig,
  istGewichtDeutlichAbgewichen,
  PAL_FAKTOREN,
  PAL_LABELS,
  ZIEL_LABELS,
  GEWICHT_MIN_KG,
  GEWICHT_MAX_KG,
  GROESSE_MIN_CM,
  GROESSE_MAX_CM,
  ALTER_MIN_JAHRE,
  ALTER_MAX_JAHRE,
  type Geschlecht,
  type Aktivitaetslevel,
  type Ziel,
  type KcalRechnerErgebnis,
} from '@/lib/kcal-rechner'

export interface KcalRechnerGespeicherteWerte {
  gewichtKg: number
  groesseCm: number
  alterJahre: number
  geschlecht: Geschlecht
  aktivitaetslevel: Aktivitaetslevel
  ziel: Ziel
}

interface KcalRechnerProps {
  kannSpeichern: boolean
  gespeicherteWerte: KcalRechnerGespeicherteWerte | null
  onBerechnet?: () => void
}

const AKTIVITAETSLEVEL_OPTIONEN = Object.keys(PAL_FAKTOREN) as Aktivitaetslevel[]
const ZIEL_OPTIONEN = Object.keys(ZIEL_LABELS) as Ziel[]

export function KcalRechner({ kannSpeichern, gespeicherteWerte, onBerechnet }: KcalRechnerProps) {
  const [gewicht, setGewicht] = useState(gespeicherteWerte?.gewichtKg?.toString() ?? '')
  const [groesse, setGroesse] = useState(gespeicherteWerte?.groesseCm?.toString() ?? '')
  const [alter, setAlter] = useState(gespeicherteWerte?.alterJahre?.toString() ?? '')
  const [geschlecht, setGeschlecht] = useState<Geschlecht | ''>(gespeicherteWerte?.geschlecht ?? '')
  const [aktivitaetslevel, setAktivitaetslevel] = useState<Aktivitaetslevel | ''>(gespeicherteWerte?.aktivitaetslevel ?? '')
  const [ziel, setZiel] = useState<Ziel | ''>(gespeicherteWerte?.ziel ?? '')

  // PROJ-37: Bei vorhandenen gespeicherten Werten wird das Ergebnis sofort angezeigt
  // (deterministisch aus den gespeicherten Eingaben berechnet) — kein erneuter Klick nötig.
  const [ergebnis, setErgebnis] = useState<KcalRechnerErgebnis | null>(
    gespeicherteWerte ? berechneKcal(gespeicherteWerte) : null
  )
  const [speicherFehler, setSpeicherFehler] = useState(false)
  const [wirdGespeichert, setWirdGespeichert] = useState(false)
  const [letztesGespeichertesGewicht, setLetztesGespeichertesGewicht] = useState(gespeicherteWerte?.gewichtKg ?? null)

  const gewichtNum = parseFloat(gewicht)
  const groesseNum = parseFloat(groesse)
  const alterNum = parseInt(alter, 10)

  const gewichtFehler = gewicht !== '' && !istGewichtGueltig(gewichtNum)
  const groesseFehler = groesse !== '' && !istGroesseGueltig(groesseNum)
  const alterFehler = alter !== '' && !istAlterGueltig(alterNum)

  const alleFelderAusgefuellt =
    gewicht !== '' && groesse !== '' && alter !== '' && geschlecht !== '' && aktivitaetslevel !== '' && ziel !== ''
  const alleFelderGueltig =
    istGewichtGueltig(gewichtNum) && istGroesseGueltig(groesseNum) && istAlterGueltig(alterNum)
  const berechnenAktiv = alleFelderAusgefuellt && alleFelderGueltig

  const zeigtAbweichungsHinweis =
    letztesGespeichertesGewicht !== null &&
    gewicht !== '' &&
    istGewichtGueltig(gewichtNum) &&
    istGewichtDeutlichAbgewichen(gewichtNum, letztesGespeichertesGewicht) &&
    ergebnis !== null

  async function handleBerechnen() {
    if (!berechnenAktiv || !geschlecht || !aktivitaetslevel || !ziel) return

    const neuesErgebnis = berechneKcal({
      gewichtKg: gewichtNum,
      groesseCm: groesseNum,
      alterJahre: alterNum,
      geschlecht,
      aktivitaetslevel,
      ziel,
    })
    setErgebnis(neuesErgebnis)
    setSpeicherFehler(false)
    onBerechnet?.()

    if (!kannSpeichern) return

    setWirdGespeichert(true)
    try {
      const res = await fetch('/api/kcal-rechner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gewichtKg: gewichtNum,
          groesseCm: groesseNum,
          alterJahre: alterNum,
          geschlecht,
          aktivitaetslevel,
          ziel,
        }),
      })
      if (!res.ok) throw new Error('Speichern fehlgeschlagen')
      setLetztesGespeichertesGewicht(gewichtNum)
    } catch {
      setSpeicherFehler(true)
    } finally {
      setWirdGespeichert(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="kcal-gewicht">Gewicht (kg)</Label>
          <Input
            id="kcal-gewicht"
            type="number"
            inputMode="decimal"
            value={gewicht}
            onChange={(e) => setGewicht(e.target.value)}
            aria-invalid={gewichtFehler}
          />
          {gewichtFehler && (
            <p className="text-xs text-destructive">{GEWICHT_MIN_KG}–{GEWICHT_MAX_KG} kg</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kcal-groesse">Größe (cm)</Label>
          <Input
            id="kcal-groesse"
            type="number"
            inputMode="decimal"
            value={groesse}
            onChange={(e) => setGroesse(e.target.value)}
            aria-invalid={groesseFehler}
          />
          {groesseFehler && (
            <p className="text-xs text-destructive">{GROESSE_MIN_CM}–{GROESSE_MAX_CM} cm</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="kcal-alter">Alter (Jahre)</Label>
        <Input
          id="kcal-alter"
          type="number"
          inputMode="numeric"
          value={alter}
          onChange={(e) => setAlter(e.target.value)}
          aria-invalid={alterFehler}
          className="max-w-[140px]"
        />
        {alterFehler && (
          <p className="text-xs text-destructive">{ALTER_MIN_JAHRE}–{ALTER_MAX_JAHRE} Jahre</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Geschlecht (für die Formel)</Label>
        <RadioGroup
          value={geschlecht}
          onValueChange={(v) => setGeschlecht(v as Geschlecht)}
          className="flex gap-4"
        >
          <label htmlFor="geschlecht-maennlich" className="flex items-center gap-2 text-sm cursor-pointer">
            <RadioGroupItem value="maennlich" id="geschlecht-maennlich" />
            Männlich
          </label>
          <label htmlFor="geschlecht-weiblich" className="flex items-center gap-2 text-sm cursor-pointer">
            <RadioGroupItem value="weiblich" id="geschlecht-weiblich" />
            Weiblich
          </label>
        </RadioGroup>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="kcal-aktivitaet">Aktivitätslevel</Label>
        <Select value={aktivitaetslevel} onValueChange={(v) => setAktivitaetslevel(v as Aktivitaetslevel)}>
          <SelectTrigger id="kcal-aktivitaet">
            <SelectValue placeholder="Auswählen…" />
          </SelectTrigger>
          <SelectContent>
            {AKTIVITAETSLEVEL_OPTIONEN.map((level) => (
              <SelectItem key={level} value={level}>
                {PAL_LABELS[level]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Ziel</Label>
        <div className="grid grid-cols-3 gap-2">
          {ZIEL_OPTIONEN.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setZiel(option)}
              className={`rounded-xl border px-2 py-2.5 text-xs font-medium text-center transition-colors ${
                ziel === option
                  ? 'border-[#2E9E6B] bg-[#DFF0F2] text-[#2E9E6B]'
                  : 'border-border text-muted-foreground hover:bg-muted/40'
              }`}
            >
              {ZIEL_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleBerechnen} disabled={!berechnenAktiv || wirdGespeichert} className="w-full">
        Berechnen
      </Button>

      {ergebnis && (
        <div className="rounded-2xl border border-[#2E9E6B]/30 bg-[#DFF0F2] p-4 space-y-1 text-center">
          <p className="text-xs text-[#2E9E6B]/80">Dein Kalorienbedarf</p>
          <p className="text-2xl font-bold text-[#0E7C86]">{ergebnis.zielKcal} kcal</p>
          <p className="text-xs text-[#2E9E6B]/70">Erhaltungsbedarf: {ergebnis.erhaltungsbedarf} kcal</p>
          <p className="text-xs text-[#2E9E6B]/70">Mindestens {ergebnis.eiweissMindestG}g Eiweiß/Tag</p>
          <p className="text-xs text-[#2E9E6B]/70">Optimal {ergebnis.eiweissOptimalG}g Eiweiß/Tag</p>
        </div>
      )}

      {zeigtAbweichungsHinweis && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
          <p className="text-xs text-amber-800 leading-relaxed">
            ⚖️ Dein Gewicht hat sich um mehr als 5 kg verändert — neu berechnen, damit dein Ergebnis stimmt.
          </p>
        </div>
      )}

      {speicherFehler && (
        <p className="text-xs text-destructive">
          Speichern fehlgeschlagen — dein Ergebnis stimmt trotzdem, versuch&apos;s gleich nochmal.
        </p>
      )}
    </div>
  )
}
