// scripts/sync-test-map.ts
// Detecta drift entre sessions/ en disco y test-map.json.
// Uso: ./node_modules/.bin/tsx scripts/sync-test-map.ts
import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

const TEST_MAP_PATH = ".claude/pipelines/test-engine/references/test-map.json";

interface TestMapModule {
  sessions: string[];
  paths: string[];
  page_objects: string[];
  keywords: string[];
  component_jira: string | null;
  validated: boolean;
}

interface TestMap {
  version: string;
  last_updated: string;
  modules: Record<string, TestMapModule>;
}

async function main() {
  // 1. Leer test-map.json
  if (!fs.existsSync(TEST_MAP_PATH)) {
    console.error(`❌ test-map.json no encontrado en: ${TEST_MAP_PATH}`);
    process.exit(1);
  }

  const testMap: TestMap = JSON.parse(fs.readFileSync(TEST_MAP_PATH, "utf-8"));

  // 2. Obtener paths registrados en test-map.json
  const registeredPaths = new Set<string>();
  for (const mod of Object.values(testMap.modules)) {
    for (const p of mod.paths) {
      registeredPaths.add(p);
    }
  }

  // 3. Obtener todos los .test.ts en sessions/ en disco
  const sessionsOnDisk = await glob("sessions/**/*.test.ts");
  const sessionsOnDiskNormalized = new Set(sessionsOnDisk.map(p => p.replace(/\\/g, "/")));

  // 4. Detectar sessions en disco que NO están en test-map.json
  const missing: string[] = [];
  for (const diskPath of sessionsOnDiskNormalized) {
    if (!registeredPaths.has(diskPath)) {
      missing.push(diskPath);
    }
  }

  // 5. Detectar paths en test-map.json que NO existen en disco
  const stale: string[] = [];
  for (const registeredPath of registeredPaths) {
    if (!fs.existsSync(registeredPath)) {
      stale.push(registeredPath);
    }
  }

  // 6. Reporte
  const hasDrift = missing.length > 0 || stale.length > 0;

  console.log("\n📋 sync-test-map — Drift Report");
  console.log(`   test-map.json v${testMap.version} (last_updated: ${testMap.last_updated})`);
  console.log(`   Sessions en disco:      ${sessionsOnDiskNormalized.size}`);
  console.log(`   Paths en test-map.json: ${registeredPaths.size}\n`);

  if (missing.length > 0) {
    console.log(`⚠️  Sessions en disco SIN registrar en test-map.json (agregar manualmente):`);
    missing.forEach(p => console.log(`   + ${p}`));
    console.log();
  }

  if (stale.length > 0) {
    console.log(`❌ Paths en test-map.json que NO existen en disco (limpiar):`);
    stale.forEach(p => console.log(`   - ${p}`));
    console.log();
  }

  if (!hasDrift) {
    console.log(`✅ Sin drift. test-map.json está sincronizado con sessions/.\n`);
  }

  if (hasDrift) process.exit(1);
}

main();
