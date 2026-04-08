// scripts/skills/commit-parser.ts
//
// Parsea el git log del autor del proyecto y genera bullets orientados a negocio
// según la tabla de traducción de la skill commit-report. Output: JSON array a stdout.
//
// Uso:
//   tsx scripts/skills/commit-parser.ts --days 7
//   tsx scripts/skills/commit-parser.ts --since 2026-04-01 --until 2026-04-07
//   tsx scripts/skills/commit-parser.ts --author jtcaldera-bluestack --days 1
//
// Exit 0 siempre — si no hay commits, retorna array vacío.

import { execSync } from "child_process";

interface ParsedCommit {
  hash: string;
  date: string;
  type: string;
  module: string;
  title: string;
  body: string;
  businessBullet: string;
}

// Tabla de traducción codificada desde commit-report/SKILL.md
type BulletFn = (module: string, title: string) => string;

interface TranslationRule {
  test: (type: string, title: string) => boolean;
  bullet: BulletFn;
}

const TRANSLATION_RULES: TranslationRule[] = [
  {
    test: (t) => t === "feat",
    bullet: (m, d) => `Ampliación de cobertura automatizada hacia ${m}: ${d}`,
  },
  {
    test: (t) => t === "fix",
    bullet: (m, d) => `Corrección de estabilidad en ${m}: ${d}`,
  },
  {
    test: (t) => t === "refactor",
    bullet: (m, d) => `Reducción de deuda técnica en ${m}: ${d}`,
  },
  {
    test: (t) => t === "test",
    bullet: (m) => `Mejora de cobertura de tests en ${m}`,
  },
  {
    test: (t) => t === "docs",
    bullet: (m) => `Actualización de documentación técnica en ${m}`,
  },
  {
    test: (t, d) => t === "chore" && /docker|grid|ci/i.test(d),
    bullet: () => "Mejora de infraestructura de ejecución y CI/CD",
  },
  {
    test: (t, d) => /add.*skill|claude\.md|rules/i.test(d),
    bullet: () => "Mejora de configuración del agente IA de desarrollo",
  },
  {
    test: (_, d) => /factory|faker|dynamic.data/i.test(d),
    bullet: (m) => `Generación de datos dinámicos en ${m}, eliminando dependencias estáticas`,
  },
  {
    test: (_, d) => /toast|banner|modal/i.test(d),
    bullet: (m) => `Implementación del sistema de validación de resultados en ${m}`,
  },
  {
    test: (t) => t === "chore",
    bullet: (_, d) => `Mantenimiento de entorno: ${d}`,
  },
];

function parseArgs(): {
  author: string;
  days: number;
  since: string | undefined;
  until: string | undefined;
} {
  const args = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const i = args.indexOf(flag);
    return i !== -1 && args[i + 1] ? args[i + 1] : undefined;
  };
  return {
    author: get("--author") ?? "jtcaldera-bluestack",
    days: parseInt(get("--days") ?? "7", 10),
    since: get("--since"),
    until: get("--until"),
  };
}

function parseConventionalTitle(raw: string): {
  type: string;
  module: string;
  description: string;
} {
  // Conventional commits: type(scope): description  o  type: description
  const match = raw.match(/^(\w+)(?:\(([^)]+)\))?(?:!)?\s*:\s*(.+)$/);
  if (match) {
    return {
      type: match[1],
      module: match[2] ?? "general",
      description: match[3],
    };
  }
  return { type: "other", module: "general", description: raw };
}

function translateToBusinessBullet(type: string, module: string, description: string): string {
  const rule = TRANSLATION_RULES.find((r) => r.test(type, description));
  if (rule) return rule.bullet(module, description);
  return `[REVISAR]: ${description}`;
}

function main(): void {
  const { author, days, since, until } = parseArgs();

  const sinceFlag = since ? `--since="${since}"` : `--since="${days} days ago"`;
  const untilFlag = until ? `--until="${until}"` : "";

  // Formato: hash <TAB> date <TAB> subject
  // Usar %x09 (tab) como separador — poco probable en mensajes de commit
  const cmd = [
    "git log",
    `--author="${author}"`,
    sinceFlag,
    untilFlag,
    "--format=%H%x09%ad%x09%s",
    "--date=format:%Y-%m-%d",
  ]
    .filter(Boolean)
    .join(" ");

  let output: string;
  try {
    output = execSync(cmd, { encoding: "utf-8" });
  } catch (err) {
    process.stderr.write(`Error ejecutando git log: ${String(err)}\n`);
    process.stdout.write("[]\n");
    return;
  }

  const commits: ParsedCommit[] = [];
  const lines = output.trim().split("\n").filter(Boolean);

  for (const line of lines) {
    const parts = line.split("\t");
    if (parts.length < 3) continue;

    const hash = parts[0].trim();
    const date = parts[1].trim();
    const rawTitle = parts.slice(2).join("\t").trim();

    // Obtener body del commit por separado (puede estar vacío)
    let body = "";
    try {
      body = execSync(`git log --format="%b" -1 ${hash}`, { encoding: "utf-8" }).trim();
    } catch {
      // ignorar — el body es opcional
    }

    const { type, module, description } = parseConventionalTitle(rawTitle);
    const businessBullet = translateToBusinessBullet(type, module, description);

    commits.push({ hash, date, type, module, title: description, body, businessBullet });
  }

  process.stdout.write(JSON.stringify(commits, null, 2) + "\n");
}

main();
