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
async function checkMdLogic() {
  const mdFiles = await glob("**/*.md", {
    ignore: ["node_modules/**", ".git/**", "docs/audit/**"]
  });

  const logicPatterns = [
    /```(typescript|javascript|ts|js)\n[\s\S]{100,}?```/g, // bloques de código largos
    /\b(if|else|switch|return|throw|async|await|Promise)\s*[\(\{]/g,
    /interface\s+\w+\s*\{/g,
    /type\s+\w+\s*=/g,
    /function\s+\w+\s*\(/g,
  ];

  for (const file of mdFiles) {
    const content = fs.readFileSync(file, "utf-8");
    for (const pattern of logicPatterns) {
      if (pattern.test(content)) {
        violations.push({
          rule: "NO-LOGIC-IN-MD",
          file,
          description: "Archivo .md contiene lógica funcional o definiciones de tipos",
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

// Regla 3: Detectar skills que referencian .md como fuente primaria
async function checkSkillDependencies() {
  const skillFiles = await glob(".claude/skills/**/*.md");
  const primaryInputPattern = /\b(leé|lee|read|parsear|parsea|procesar|procesa)\s+.*?\.md/gi;

  for (const file of skillFiles) {
    const content = fs.readFileSync(file, "utf-8");
    if (primaryInputPattern.test(content)) {
      violations.push({
        rule: "SKILL-MD-PRIMARY-INPUT",
        file,
        description: "Skill referencia .md como input primario en lugar del código TypeScript",
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
  fs.writeFileSync("docs/audit/ssot-violations.json", JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { errors: errors.length, warnings: warnings.length },
    violations,
  }, null, 2));

  if (errors.length > 0) process.exit(1);
}

main();