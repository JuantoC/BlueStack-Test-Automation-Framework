#!/usr/bin/env ts-node
import * as fs from "fs";
import { execSync } from "child_process";

function main() {
  const pendingPath = ".claude/pending-doc-updates.json";
  if (!fs.existsSync(pendingPath)) return;

  const pending = JSON.parse(fs.readFileSync(pendingPath, "utf-8"));
  if (pending.status !== "pending-review") return;

  // Generar el diff del último commit para Claude Code
  const diff = execSync("git diff HEAD~1 HEAD -- '*.ts' '*.tsx'").toString();
  if (!diff) return;

  // Crear prompt codificado para Claude Code
  const claudePrompt = `
## TAREA: Revisar documentación post-commit

Se realizó un commit con cambios en TypeScript. Necesito que:

1. Leas el siguiente diff:
\`\`\`diff
${diff.slice(0, 8000)} ${diff.length > 8000 ? "\n... [diff truncado, leé el archivo completo con git diff HEAD~1 HEAD]" : ""}
\`\`\`

2. Identifiques qué cambios afectan contratos públicos (firmas de funciones, 
   interfaces exportadas, tipos públicos)

3. Para cada cambio de contrato identificado:
   - Verificá si existe documentación .md relacionada en: ${pending.potentiallyStaleDocFiles.join(", ")}
   - Verificá si el JSDoc/TSDoc refleja el nuevo estado
   - Generá sugerencias concretas de actualización

4. Escribí las sugerencias en \`.claude/doc-update-suggestions.md\` con formato:
   - **Archivo**: path del .md o .ts
   - **Cambio detectado**: descripción
   - **Actualización sugerida**: contenido exacto propuesto
   - **Prioridad**: alta/media/baja

5. NO apliques los cambios automáticamente. Solo generá el reporte.

Archivos TS modificados: ${pending.changedTsFiles.join(", ")}
`.trim();

  fs.writeFileSync(".claude/pending-doc-review-prompt.md", claudePrompt);

  // Actualizar estado
  pending.status = "prompt-generated";
  fs.writeFileSync(pendingPath, JSON.stringify(pending, null, 2));

  console.log("📝 Post-commit: Prompt de revisión documental generado en .claude/pending-doc-review-prompt.md");
  console.log("   Ejecutá en Claude Code: 'Leé .claude/pending-doc-review-prompt.md y ejecutá la tarea'");
}

main();