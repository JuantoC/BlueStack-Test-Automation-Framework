import { Project } from "ts-morph";
import * as fs from "fs";
import { glob } from "glob";

interface AuditEntry {
  file: string;
  type: "contextual-valid" | "embedded-logic" | "skill-dependency" | "jsdoc-mismatch";
  details: string;
  risk: "low" | "medium" | "high";
}

async function auditRepository(): Promise<void> {
  const entries: AuditEntry[] = [];

  // 1. Clasificar todos los .md
  const mdFiles = await glob("**/*.md", { ignore: ["node_modules/**"] });
  for (const f of mdFiles) {
    const content = fs.readFileSync(f, "utf-8");
    const hasLogic = /```(ts|js|typescript|javascript)[\s\S]*?```/.test(content)
      || /\b(if|switch|return|function|const|let|var|=>)\b/.test(content);
    const isSkillDep = f.startsWith(".claude/skills/");
    entries.push({
      file: f,
      type: hasLogic ? "embedded-logic" : isSkillDep ? "skill-dependency" : "contextual-valid",
      details: hasLogic ? "Contains imperative logic or code blocks" : "Descriptive content",
      risk: hasLogic ? "high" : isSkillDep ? "medium" : "low",
    });
  }

  // 2. Analizar skills que consumen .md como fuente primaria
  const skillFiles = await glob(".claude/skills/**/*.md");
  for (const sf of skillFiles) {
    const content = fs.readFileSync(sf, "utf-8");
    const mdRefs = content.match(/\[.*?\]\(.*?\.md\)/g) || [];
    if (mdRefs.length > 0) {
      entries.push({
        file: sf,
        type: "skill-dependency",
        details: `References .md as primary input: ${mdRefs.join(", ")}`,
        risk: "high",
      });
    }
  }

  // 3. Detectar inconsistencias JSDoc vs tipos TS
  const project = new Project({ tsConfigFilePath: "./tsconfig.json" });
  for (const sourceFile of project.getSourceFiles()) {
    const fns = sourceFile.getFunctions();
    for (const fn of fns) {
      const jsdoc = fn.getJsDocs();
      const params = fn.getParameters().map(p => p.getName());
      for (const doc of jsdoc) {
        const docParams = doc.getTags()
          .filter(t => t.getTagName() === "param")
          .map(t => t.getText().split(" ")[1]);
        const missing = docParams.filter(p => !params.includes(p));
        if (missing.length > 0) {
          entries.push({
            file: sourceFile.getFilePath(),
            type: "jsdoc-mismatch",
            details: `Documented params not in signature: ${missing.join(", ")} in ${fn.getName()}`,
            risk: "medium",
          });
        }
      }
    }
  }

  // Output
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      total: entries.length,
      byType: entries.reduce((acc, e) => {
        acc[e.type] = (acc[e.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    },
    entries,
  };

  fs.writeFileSync("docs/audit/doc-audit.json", JSON.stringify(report, null, 2));
  console.log("Audit complete → docs/audit/doc-audit.json");
}

auditRepository();