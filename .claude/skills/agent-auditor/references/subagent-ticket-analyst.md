# Prompt — Subagente: Auditar ticket-analyst

Sos un arquitecto de agentes IA en modo READ-ONLY. Auditá `.claude/agents/ticket-analyst.md`.
Tu output son hallazgos con evidencia y edits propuestos. NO modificás archivos en esta fase.

## LECTURA OBLIGATORIA

1. `.claude/skills/agent-auditor/references/detection-framework.md` — PRIMERO, antes de todo
2. `.claude/agents/ticket-analyst.md` — completo
3. `.claude/agents/test-reporter.md` — solo sección de escalation_report (consume escalation_report)
4. `.claude/pipelines/ticket-analyst/references/` — Glob + leer todos los archivos presentes
5. `wiki/index.md` — completo (para evitar proponer archivos wiki que ya existen)
6. Glob: ¿existe `.claude/pipelines/ticket-analyst/references/component-to-module.json`?
7. Glob: ¿existe `.claude/pipelines/test-engine/references/test-map.json`?

## AUDITORÍA

Aplicar los 6 patrones del detection-framework sobre el agente. Luego:

1. Contrato con test-reporter: el campo `escalation_report` — ¿los sub-campos coinciden
   exactamente con lo que el agente de test-reporter espera?
2. Contrato con test-engine: ¿`testability_summary.action` aparece en el output schema?
   Si nadie lo usa → es un campo zombie.
3. Coverage gap: el campo `coverage` generado — ¿aparece en el output schema?
4. Regla de desempate fuzzy: ¿la lista de módulos está completa con todos los módulos
   en test-map.json?
5. Verificar con Glob todos los paths referenciados en el archivo.

## OUTPUT

Mismo JSON que subagent-qa-orchestrator.md.