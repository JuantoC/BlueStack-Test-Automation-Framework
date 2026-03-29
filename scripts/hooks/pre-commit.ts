#!/usr/bin/env ts-node
import { execSync } from "child_process";
import { Project } from "ts-morph";
import * as fs from "fs";

interface ChangedFile {
  path: string;
  status: "M" | "A" | "D";
}

function getStagedChanges(): ChangedFile[] {
  const output = execSync("git diff --cached --name-status").toString();
  return output.trim().split("\n")
    .filter(Boolean)
    .map(line => {
      const [status, path] = line.split("\t");
      return { status: status as "M" | "A" | "D", path };
    });
}

function detectContractChanges(files: ChangedFile[]): string[] {
  const tsFiles = files.filter(f => f.path.endsWith(".ts") || f.path.endsWith(".tsx"));
  if (tsFiles.length === 0) return [];

  const project = new Project({ tsConfigFilePath: "./tsconfig.json" });
  const affectedDocs: string[] = [];

  for (const { path } of tsFiles) {
    const sourceFile = project.getSourceFile(path);
    if (!sourceFile) continue;

    // Detectar si cambió la firma pública de funciones/tipos
    const exportedDeclarations = sourceFile.getExportedDeclarations();
    for (const [name] of exportedDeclarations) {
      // Buscar si existe .md que referencie este símbolo
      const potentialDocs = [
        `docs/guides/${path.replace("src/", "").replace(".ts", ".md")}`,
        `docs/api/${name.toLowerCase()}.md`,
      ];
      for (const docPath of potentialDocs) {
        if (fs.existsSync(docPath)) affectedDocs.push(docPath);
      }
    }
  }

  return [...new Set(affectedDocs)];
}

function main() {
  const changes = getStagedChanges();
  const tsChanges = changes.filter(f =>
    f.path.endsWith(".ts") || f.path.endsWith(".tsx")
  );

  if (tsChanges.length === 0) {
    console.log("✅ No TypeScript changes detected. Hook passed.");
    process.exit(0);
  }

  const affectedDocs = detectContractChanges(tsChanges);

  // Escribir pendientes para post-commit
  const pending = {
    timestamp: new Date().toISOString(),
    changedTsFiles: tsChanges.map(f => f.path),
    potentiallyStaleDocFiles: affectedDocs,
    status: "pending-review",
  };
  fs.writeFileSync(".claude/pending-doc-updates.json", JSON.stringify(pending, null, 2));

  if (affectedDocs.length > 0) {
    console.warn(`⚠️  DOC-SYNC WARNING: Los siguientes .md pueden estar desactualizados:`);
    affectedDocs.forEach(d => console.warn(`   - ${d}`));
    console.warn(`   Revisá con: claude-code run skill:sync-docs`);
    console.warn(`   O continuá el commit y resolvé después (pendiente en .claude/pending-doc-updates.json)`);
    // No bloquear el commit, solo advertir
  }

  process.exit(0); // exit 0 = no bloquear; cambiar a 1 para bloquear
}

main();