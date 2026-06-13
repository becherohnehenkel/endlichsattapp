#!/usr/bin/env node
/**
 * BLS Importer — Bundeslebensmittelschlüssel → Supabase
 * Liest JSON-Chunks aus tmp/bls-import/ und upserted sie in die bls_lebensmittel-Tabelle.
 *
 * Verwendung:
 *   node scripts/import-bls.mjs
 *
 * Vorher:
 *   python3 scripts/parse-bls.py /pfad/zur/BLS_Daten.xlsx
 *
 * Für Updates: Einfach erneut ausführen — upsert überschreibt vorhandene Einträge
 * anhand des bls_code (Primary Key).
 *
 * Umgebungsvariablen (aus .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.dirname(__dirname)
const importDir = path.join(projectRoot, 'tmp', 'bls-import')

// Lade .env.local manuell (kein dotenv nötig)
function loadEnv() {
  const envPath = path.join(projectRoot, '.env.local')
  if (!fs.existsSync(envPath)) throw new Error('.env.local nicht gefunden')
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...valueParts] = trimmed.split('=')
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim()
    }
  }
}

async function upsertChunk(supabaseUrl, serviceKey, rows) {
  const url = `${supabaseUrl}/rest/v1/bls_lebensmittel`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
}

async function main() {
  loadEnv()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt in .env.local')
  }

  if (!fs.existsSync(importDir)) {
    throw new Error(`Import-Verzeichnis nicht gefunden: ${importDir}\nBitte zuerst: python3 scripts/parse-bls.py /pfad/zur/BLS_Daten.xlsx`)
  }

  const metaPath = path.join(importDir, 'bls_meta.json')
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
  console.log(`BLS ${meta.bls_version} Import — ${meta.total_items} Lebensmittel in ${meta.total_chunks} Chunks`)
  console.log(`Geparsed: ${meta.parsed_at}  |  Quelle: ${meta.source_file}\n`)

  const chunkFiles = fs.readdirSync(importDir)
    .filter(f => f.startsWith('bls_chunk_') && f.endsWith('.json'))
    .sort()

  let totalInserted = 0
  const startTime = Date.now()

  for (const file of chunkFiles) {
    const chunkPath = path.join(importDir, file)
    const rows = JSON.parse(fs.readFileSync(chunkPath, 'utf-8'))

    process.stdout.write(`  ${file} (${rows.length} Zeilen) ... `)
    try {
      await upsertChunk(supabaseUrl, serviceKey, rows)
      totalInserted += rows.length
      console.log(`✓`)
    } catch (err) {
      console.log(`✗ FEHLER: ${err.message}`)
      process.exit(1)
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\n✓ Import abgeschlossen: ${totalInserted} Lebensmittel in ${elapsed}s`)
  console.log(`  Tabelle: bls_lebensmittel`)
  console.log(`  BLS-Version: ${meta.bls_version}`)
}

main().catch(err => {
  console.error('Fehler:', err.message)
  process.exit(1)
})
