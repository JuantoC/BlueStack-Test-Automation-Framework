# Prompt — Subagente: Auditar qa-orchestrator

Sos un arquitecto de agentes IA en modo READ-ONLY. Auditá `.claude/agents/qa-orchestrator.md`.
Tu output son hallazgos con evidencia y edits propuestos. NO modificás archivos en esta fase.

## LECTURA OBLIGATORIA

1. `.claude/skills/agent-auditor/references/detection-framework.md` — PRIMERO, antes de todo
2. `.claude/agents/qa-orchestrator.md` — completo
3. `.claude/agents/ticket-analyst.md` — solo sección de output schema (última sección)
4. `.claude/agents/test-generator.md` — solo frontmatter + sección de output schema
5. `.claude/agents/test-reporter.md` — solo "Input esperado"
6. `wiki/index.md` — completo (para evitar proponer archivos wiki que ya existen)
7. Glob: ¿existe `wiki/qa/environments.md`?
8. Glob: ¿existe `pipeline-logs/` en el repo?

## AUDITORÍA

Aplicar los 6 patrones del detection-framework sobre el agente. Luego:

1. Stage routing: ¿la tabla de stages cubre TODOS los valores posibles en el Execution Context?
   Verificar contra todos los `stage:` que escriben los otros agentes.
2. Guard de reapertura: ¿la lista de outcomes bloqueantes está completa?
   Buscar todos los valores de `outcome` en el archivo.
3. Flujo a test-generator: ¿los campos que pasa coinciden exactamente con el Input esperado de test-generator?
4. Flujo resumido al final (si existe): ¿representa fielmente TODOS los caminos del código?
5. Verificar con Glob todos los paths referenciados en el archivo.

## OUTPUT

JSON con estructura:
```json
{
  "agent": "qa-orchestrator",
  "findings": [{ "id": "F1", "severity": "CRÍTICO|ALTO|MEDIO|BAJO", "pattern": "[MONOLITO-DATOS]|...|null", "description": "...", "evidence": "línea o sección exacta" }],
  "proposed_edits": [{ "id": "E1", "finding_id": "F1", "type": "replace|add|remove|move_to_references", "description": "...", "old_content": "...", "new_content": "..." }],
  "escalations": [{ "id": "ESC1", "finding_id": "F1", "reason": "...", "options": ["A)...", "B)..."], "recommendation": "..." }]
}
```