#!/usr/bin/env python3
"""
BLS Parser — Bundeslebensmittelschlüssel 4.0
Parst das offizielle BLS-Excel und erstellt JSON-Chunks für den Import.

Verwendung:
  python3 scripts/parse-bls.py /pfad/zur/BLS_4_0_Daten_2025_DE.xlsx

Output:
  tmp/bls-import/bls_chunk_NNN.json  (je 500 Zeilen)
  tmp/bls-import/bls_meta.json       (Versionsinformationen)

Nach dem Parsen: node scripts/import-bls.mjs
"""

import sys
import json
import os
from datetime import datetime

try:
    import openpyxl
except ImportError:
    print("Fehler: openpyxl nicht installiert. Bitte: pip install openpyxl")
    sys.exit(1)

if len(sys.argv) < 2:
    print("Verwendung: python3 scripts/parse-bls.py /pfad/zur/BLS_Daten.xlsx")
    print("Tipp: BLS 4.0 als ZIP herunterladen von https://blsdb.de/")
    sys.exit(1)

xlsx_path = sys.argv[1]
bls_version = sys.argv[2] if len(sys.argv) > 2 else "4.0"

output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tmp", "bls-import")
os.makedirs(output_dir, exist_ok=True)

print(f"Lese {xlsx_path} ...")
wb = openpyxl.load_workbook(xlsx_path, read_only=True)
ws = wb.active
rows = list(ws.iter_rows(values_only=True))
header = rows[0]

# Spaltenindizes für die wichtigsten Makros (0-basiert)
KEY_COLS = {
    'kcal_100g':       6,   # ENERCC
    'protein_g_100g': 12,   # PROT625
    'fat_g_100g':     15,   # FAT
    'carbs_g_100g':   18,   # CHO
    'fiber_g_100g':   21,   # FIBT
    'sugar_g_100g':  219,   # SUGAR
}

# Alle Nährwert-Spalten (Werte, ohne Datenherkunft/Referenz-Spalten)
nutrient_cols = []
for i, h in enumerate(header):
    if h and i >= 3:
        h_str = str(h)
        if 'Datenherkunft' not in h_str and 'Referenz' not in h_str:
            short = h_str.split(' ')[0]
            nutrient_cols.append((i, short))

print(f"  Nährwert-Spalten gefunden: {len(nutrient_cols)}")

def safe_num(v):
    """Converts to float or None. Non-numeric strings like '<LOD>' become None."""
    if v is None or str(v).strip() == '':
        return None
    try:
        return float(v)
    except (ValueError, TypeError):
        return None

items = []
skipped = 0
for row in rows[1:]:
    code = row[0]
    name_de = row[1]
    name_en = row[2]
    if not code or not name_de:
        skipped += 1
        continue

    naehrwerte = {}
    for col_idx, short_code in nutrient_cols:
        v = safe_num(row[col_idx])
        if v is not None:
            naehrwerte[short_code] = v

    items.append({
        'bls_code':        str(code).strip(),
        'name_de':         str(name_de).strip(),
        'name_en':         str(name_en).strip() if name_en else None,
        'kcal_100g':       safe_num(row[KEY_COLS['kcal_100g']]),
        'protein_g_100g':  safe_num(row[KEY_COLS['protein_g_100g']]),
        'fat_g_100g':      safe_num(row[KEY_COLS['fat_g_100g']]),
        'carbs_g_100g':    safe_num(row[KEY_COLS['carbs_g_100g']]),
        'fiber_g_100g':    safe_num(row[KEY_COLS['fiber_g_100g']]),
        'sugar_g_100g':    safe_num(row[KEY_COLS['sugar_g_100g']]),
        'naehrwerte':      naehrwerte,
        'bls_version':     bls_version,
    })

print(f"  Lebensmittel geparst: {len(items)}  (übersprungen: {skipped})")

# Chunks à 500 Zeilen
chunk_size = 500
chunks = [items[i:i+chunk_size] for i in range(0, len(items), chunk_size)]

for i, chunk in enumerate(chunks):
    path = os.path.join(output_dir, f"bls_chunk_{i:03d}.json")
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(chunk, f, ensure_ascii=False)

# Meta-Datei für den Import-Script
meta = {
    'bls_version': bls_version,
    'total_items': len(items),
    'total_chunks': len(chunks),
    'chunk_size': chunk_size,
    'parsed_at': datetime.utcnow().isoformat() + 'Z',
    'source_file': os.path.basename(xlsx_path),
}
with open(os.path.join(output_dir, 'bls_meta.json'), 'w', encoding='utf-8') as f:
    json.dump(meta, f, indent=2, ensure_ascii=False)

print(f"\nFertig! {len(chunks)} Chunks gespeichert in {output_dir}/")
print(f"Nächster Schritt: node scripts/import-bls.mjs")
