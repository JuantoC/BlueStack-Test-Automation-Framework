// scripts/validate-ssot.ts
import { Project } from "ts-morph";
import * as fs from "fs";
import { glob } from "glob";

interface Violation {
  rule: string;
  file: string;
  description: string;
  severity: "error" | "warning";
}

const violations: Violation[] = [];

// Regla 1: Detectar lógica funcional en .md
// Los bloques de código ilustrativos en README y archivos de documentación son válidos.
// Solo se marca como violación si el patrón aparece FUERA de bloques de código (```)
// en archivos que NO son READMEs ni reportes de auditoría.
async function checkMdLogic() {
  const mdFiles = await glob("**/*.md", {
    ignore: [
      "node_modules/**",
      ".git/**",
      "docs/audit/**",
      "docs/generated/**",      // auto-generado por pipelines — no evaluar contra NO-LOGIC-IN-MD
      "**/README.md",           // READMEs son documentación — los code blocks son ilustrativos
      "**/*REPORT*.md",         // reportes de auditoría — los code blocks son descriptivos
      ".claude/**",             // instrucciones al agente — no describen el sistema
    ]
  });

  // Patrones que indican lógica normativa fuera de bloques de código
  const normativePatterns = [
    /^(?!```).*\binterface\s+\w+\s*\{/gm,   // interface fuera de code block
    /^(?!```).*\btype\s+\w+\s*=/gm,          // type alias fuera de code block
    /^(?!```).*\bfunction\s+\w+\s*\(/gm,     // function fuera de code block
  ];

  for (const file of mdFiles) {
    const content = fs.readFileSync(file, "utf-8");
    // Eliminar bloques de código e inline code spans para no detectar ejemplos ilustrativos
    const contentWithoutCodeBlocks = content
      .replace(/```[\s\S]*?```/g, "")   // triple-backtick blocks
      .replace(/`[^`\n]+`/g, "");       // inline code spans
    for (const pattern of normativePatterns) {
      if (pattern.test(contentWithoutCodeBlocks)) {
        violations.push({
          rule: "NO-LOGIC-IN-MD",
          file,
          description: "Archivo .md contiene lógica funcional o definiciones de tipos fuera de bloques de código",
          severity: "error",
        });
        break;
      }
    }
  }
}

// Regla 2: Detectar JSDoc desincronizado con firmas
function checkJsDocSync() {
  const project = new Project({ tsConfigFilePath: "./tsconfig.json" });

  for (const sourceFile of project.getSourceFiles()) {
    if (sourceFile.getFilePath().includes("node_modules")) continue;

    for (const fn of [...sourceFile.getFunctions(), ...sourceFile.getClasses().flatMap(c => c.getMethods())]) {
      const jsDocs = "getJsDocs" in fn ? fn.getJsDocs() : [];
      const params = "getParameters" in fn ? fn.getParameters().map(p => p.getName()) : [];

      for (const doc of jsDocs) {
        const docParamTags = doc.getTags()
          .filter(t => t.getTagName() === "param");

        for (const tag of docParamTags) {
          const tagText = tag.getText();
          const paramNameMatch = tagText.match(/@param\s+(?:\{[^}]+\}\s+)?(\w+)/);
          if (paramNameMatch) {
            const docParamName = paramNameMatch[1];
            if (!params.includes(docParamName) && docParamName !== "options") {
              violations.push({
                rule: "JSDOC-PARAM-MISMATCH",
                file: sourceFile.getFilePath(),
                description: `@param '${docParamName}' no existe en la firma de '${("getName" in fn) ? fn.getName() : "anonymous"}'`,
                severity: "warning",
              });
            }
          }
        }
      }
    }
  }
}

// Regla 3: Detectar skills que referencian .md como fuente LÓGICA primaria.
// Uso válido: leer README.md / CLAUDE.md para contexto DESPUÉS de leer el código.
// Uso válido: skills que auditan o generan .md como objeto de trabajo (audit-docs, generate-readme, validate-ssot).
// Violación real: skill que usa un .md externo para decidir el comportamiento SIN leer el código primero.
async function checkSkillDependencies() {
  const skillFiles = await glob(".claude/skills/**/*.md", {
    ignore: [".claude/skills/**-workspace/**"],
  });

  // Skills cuyo propósito ES operar sobre .md — no es violación
  const mdOperatorSkills = [
    "validate-ssot",
    "generate-readme",
    "sync-docs",
    "sanitize-docs",
  ];

  // Archivos .md de contexto cuya lectura es válida como input contextual.
  // También excluye referencias a recursos bundled dentro del propio directorio
  // de la skill: agents/, references/, assets/, scripts/.
  const contextMdPattern =
    /\b(README|CLAUDE|SKILL|pending-doc)\b.*?\.md|(agents|references|assets|scripts)\/[\w.\-/]+\.md/i;

  // Patrón de violación real: referencia a un .md de lógica como fuente primaria
  // antes de leer código TypeScript, excluyendo contexto y skills operadores
  const primaryInputPattern = /\b(leé|lee|read|parsear|parsea|procesar|procesa)\s+.*?\.md/gi;

  for (const file of skillFiles) {
    // Excluir skills que operan sobre .md por diseño
    if (mdOperatorSkills.some(name => file.includes(name))) continue;

    const content = fs.readFileSync(file, "utf-8");

    // Resetear lastIndex antes de cada test (los regex con /g son stateful)
    primaryInputPattern.lastIndex = 0;
    const matches = content.match(primaryInputPattern) ?? [];

    // Filtrar matches que son solo lectura de contexto válido
    const realViolations = matches.filter(m => !contextMdPattern.test(m));

    if (realViolations.length > 0) {
      violations.push({
        rule: "SKILL-MD-PRIMARY-INPUT",
        file,
        description: `Skill referencia .md como input primario en lugar del código TypeScript: ${realViolations[0]}`,
        severity: "error",
      });
    }
  }
}

async function main() {
  await checkMdLogic();
  checkJsDocSync();
  await checkSkillDependencies();

  const errors = violations.filter(v => v.severity === "error");
  const warnings = violations.filter(v => v.severity === "warning");

  console.log(`\n📋 SSoT Validation Report`);
  console.log(`   Errors: ${errors.length} | Warnings: ${warnings.length}\n`);

  if (violations.length > 0) {
    violations.forEach(v => {
      const icon = v.severity === "error" ? "❌" : "⚠️";
      console.log(`${icon} [${v.rule}] ${v.file}`);
      console.log(`   ${v.description}\n`);
    });
  }

  // Escribir reporte
  fs.writeFileSync("docs/generated/ssot-violations.json", JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { errors: errors.length, warnings: warnings.length },
    violations,
  }, null, 2));

  if (errors.length > 0) process.exit(1);
}

main();