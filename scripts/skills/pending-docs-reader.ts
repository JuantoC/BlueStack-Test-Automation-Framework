// scripts/skills/pending-docs-reader.ts
//
// Lee .claude/pending-doc-updates.json y reporta los commits pendientes de
// revisión documental con sus archivos afectados y mensajes de commit.
// Output: JSON a stdout.
//
// Uso:
//   tsx scripts/skills/pending-docs-reader.ts
//   tsx scripts/skills/pending-docs-reader.ts --status pending
//   tsx scripts/skills/pending-docs-reader.ts --status all
//
// Exit 0 siempre — si no hay entradas, retorna { pendingCount: 0, entries: [], filesByPriority: [] }.

import { execSync } from "child_process";
import * as fs from "fs";

type CommitStatus = "pending" | "prompt-generated" | "reviewed";

interface PendingCommit {
  hash: string;
  timestamp: string;
  changedFiles: string[];
  status: CommitStatus;
}

interface PendingDocsFile {
  pendingCommits: PendingCommit[];
}

interface EnrichedEntry {
  hash: string;
  timestamp: string;
  status: CommitStatus;
  changedFiles: string[];
  commitMessage: string;
}

interface PendingDocsReport {
  pendingCount: number;
  entries: EnrichedEntry[];
  filesByPriority: string[];
}

const PENDING_FILE = ".claude/pending-doc-updates.json";

function parseArgs(): { status: string } {
  const args = process.argv.slice(2);
  const statusIdx = args.indexOf("--status");
  return {
    status: statusIdx !== -1 && args[statusIdx + 1] ? args[statusIdx + 1] : "pending",
  };
}

function getCommitMessage(hash: string): string {
  if (hash === "__PENDING__") return "(pendiente de commit)";
  try {
    return execSync(`git log --format="%s" -1 ${hash}`, { encoding: "utf-8" }).trim();
  } catch {
    return "(hash no encontrado en el repo)";
  }
}

function countOccurrences(arr: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of arr) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }
  return counts;
}

function main(): void {
  if (!fs.existsSync(PENDING_FILE)) {
    const empty: PendingDocsReport = { pendingCount: 0, entries: [], filesByPriority: [] };
    process.stdout.write(JSON.stringify(empty, null, 2) + "\n");
    return;
  }

  const raw = fs.readFileSync(PENDING_FILE, "utf-8");
  let data: PendingDocsFile;
  try {
    data = JSON.parse(raw) as PendingDocsFile;
  } catch {
    process.stderr.write(`Error parseando ${PENDING_FILE}\n`);
    process.exit(1);
  }

  const { status } = parseArgs();

  // Filtrar por status solicitado
  const PENDING_STATUSES: CommitStatus[] = ["pending", "prompt-generated"];

  const filtered = data.pendingCommits.filter((c) => {
    if (status === "all") return true;
    if (status === "pending") return PENDING_STATUSES.includes(c.status);
    return c.status === status;
  });

  // Enriquecer con mensaje de commit
  const entries: EnrichedEntry[] = filtered.map((c) => ({
    hash: c.hash,
    timestamp: c.timestamp,
    status: c.status,
    changedFiles: c.changedFiles,
    commitMessage: getCommitMessage(c.hash),
  }));

  // Calcular filesByPriority: archivos ordenados por frecuencia de aparición
  const allFiles = entries.flatMap((e) => e.changedFiles);
  const counts = countOccurrences(allFiles);
  const filesByPriority = [...new Set(allFiles)].sort(
    (a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0)
  );

  const report: PendingDocsReport = {
    pendingCount: entries.length,
    entries,
    filesByPriority,
  };

  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
}

main();
