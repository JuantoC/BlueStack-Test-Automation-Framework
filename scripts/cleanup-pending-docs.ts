#!/usr/bin/env tsx
/**
 * cleanup-pending-docs.ts
 *
 * Archiva y elimina entradas `reviewed` con más de 30 días de antigüedad
 * del archivo `.claude/pending-doc-updates.json`.
 *
 * Uso:
 *   ./node_modules/.bin/tsx scripts/cleanup-pending-docs.ts
 *   ./node_modules/.bin/tsx scripts/cleanup-pending-docs.ts --dry-run
 *   ./node_modules/.bin/tsx scripts/cleanup-pending-docs.ts --days 60
 */

import * as fs from 'fs';
import * as path from 'path';

const PENDING_PATH = path.resolve('.claude/pending-doc-updates.json');
const ARCHIVE_PATH = path.resolve('.claude/pending-doc-updates.archive.json');
const DEFAULT_MAX_AGE_DAYS = 7;

interface PendingEntry {
  hash: string;
  timestamp: string;
  changedFiles: string[];
  status: 'pending' | 'prompt-generated' | 'reviewed';
}

interface PendingData {
  pendingCommits: PendingEntry[];
}

interface ArchiveData {
  archivedEntries: (PendingEntry & { archivedAt: string })[];
}

function parseArgs(): { dryRun: boolean; maxAgeDays: number } {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const daysIdx = args.indexOf('--days');
  const maxAgeDays = daysIdx !== -1 ? parseInt(args[daysIdx + 1], 10) : DEFAULT_MAX_AGE_DAYS;
  return { dryRun, maxAgeDays };
}

function readJson<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

function main(): void {
  const { dryRun, maxAgeDays } = parseArgs();

  if (!fs.existsSync(PENDING_PATH)) {
    console.log('✅ No existe pending-doc-updates.json — nada que limpiar.');
    process.exit(0);
  }

  const data = readJson<PendingData>(PENDING_PATH, { pendingCommits: [] });
  const now = new Date();
  const cutoff = new Date(now.getTime() - maxAgeDays * 24 * 60 * 60 * 1000);

  const toArchive: PendingEntry[] = [];
  const toKeep: PendingEntry[] = [];

  for (const entry of data.pendingCommits) {
    if (entry.status !== 'reviewed') {
      toKeep.push(entry);
      continue;
    }
    const ts = new Date(entry.timestamp);
    if (ts < cutoff) {
      toArchive.push(entry);
    } else {
      toKeep.push(entry);
    }
  }

  if (toArchive.length === 0) {
    console.log(`✅ No hay entradas reviewed con más de ${maxAgeDays} días. Nada que archivar.`);
    process.exit(0);
  }

  console.log(`\n📦 Entradas a archivar (reviewed + > ${maxAgeDays} días): ${toArchive.length}`);
  for (const e of toArchive) {
    const age = Math.floor((now.getTime() - new Date(e.timestamp).getTime()) / (1000 * 60 * 60 * 24));
    console.log(`   · ${e.hash} — ${e.timestamp} (${age} días)`);
  }

  if (dryRun) {
    console.log('\n[--dry-run] No se escribió ningún archivo.');
    process.exit(0);
  }

  // Append to archive
  const archiveData = readJson<ArchiveData>(ARCHIVE_PATH, { archivedEntries: [] });
  const archivedAt = now.toISOString();
  for (const e of toArchive) {
    archiveData.archivedEntries.push({ ...e, archivedAt });
  }
  fs.writeFileSync(ARCHIVE_PATH, JSON.stringify(archiveData, null, 2) + '\n', 'utf-8');

  // Update pending file
  data.pendingCommits = toKeep;
  fs.writeFileSync(PENDING_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8');

  console.log(`\n✅ ${toArchive.length} entrada(s) movidas a ${ARCHIVE_PATH}`);
  console.log(`   ${toKeep.length} entradas restantes en ${PENDING_PATH}`);
}

main();
