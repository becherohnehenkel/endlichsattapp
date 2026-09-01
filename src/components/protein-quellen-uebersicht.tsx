interface ProteinStufe {
  prozent: number
  tierisch: string
  vegetarisch: string
  vegan: string
}

// PROJ-40, Arbeitspunkt "Proteine": Datenquelle exakt aus der vom Nutzer bereitgestellten
// Grafik übernommen (3 Prozent-Stufen × 3 Kategorien), siehe Spec.
const STUFEN: ProteinStufe[] = [
  {
    prozent: 40,
    tierisch: 'Thunfisch, magerer Fisch (Kabeljau), (Wild-/Rinder-/Hühner-)Filet',
    vegetarisch: 'Harzer Käse, Eiklar, Magerquark, Skyr',
    vegan: 'Seitan, Sojagranulat, Lupinen-Geschnetzeltes',
  },
  {
    prozent: 30,
    tierisch: 'Lachs, Rinderhack, Schweinefilet, Rehrücken',
    vegetarisch: 'Hüttenkäse, Parmesan, Vollei, Mozzarella, Handkäse',
    vegan: 'Tofu, Tempeh, Edamame, rote Linsen',
  },
  {
    prozent: 20,
    tierisch: 'Hering, Entenbrust, Lammkotelett, Ochsenschwanz',
    vegetarisch: 'Gouda (40 % Fett i. Tr.), Mozzarella, Feta, Vollmilch',
    vegan: 'Kichererbsen, Kürbiskerne, Nüsse, Quinoa',
  },
]

export function ProteinQuellenUebersicht() {
  return (
    <div className="space-y-3">
      {STUFEN.map(s => (
        <div key={s.prozent} className="rounded-xl bg-muted/40 p-3 space-y-1.5">
          <p className="text-xs font-semibold text-foreground">{s.prozent} % Proteinanteil</p>
          <div className="space-y-1 text-xs text-foreground/80 leading-relaxed">
            <p>🥩 <strong>Tierisch:</strong> {s.tierisch}</p>
            <p>🧀 <strong>Vegetarisch:</strong> {s.vegetarisch}</p>
            <p>🌱 <strong>Vegan:</strong> {s.vegan}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
