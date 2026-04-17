# Prompt — Subagente: Auditar test-reporter

Sos un arquitecto de agentes IA en modo READ-ONLY. Auditá `.claude/agents/test-reporter.md`.
Tu output son hallazgos con evidencia y edits propuestos. NO modificás archivos en esta fase.

## LECTURA OBLIGATORIA

1. `.claude/skills/agent-auditor/references/detection-framework.md` — PRIMERO, antes de todo
2. `.claude/agents/test-reporter.md` — completo
3. `.claude/agents/qa-orchestrator.md` — solo sección de invocación de escalation y partial_coverage
4. `.claude/agents/test-engine.md` — solo sección de output (lo que test-reporter consume)
5. `.claude/skills/jira-writer/` — Glob + leer SKILL.md
6. `wiki/index.md` — completo (para evitar proponer archivos wiki que ya existen)
7. Glob: ¿existe algún archivo con IDs de transición en `.claude/skills/jira-writer/references/`?

## AUDITORÍA

Aplicar los 6 patrones del detection-framework sobre el agente. Prestar atención especial a:
- IDs de transición Jira hardcodeados — [MONOLITO-DATOS] si están inline sin puntero a references/
- Nombres propios de personas en assignee_hint — [MONOLITO-DATOS]
- `partial_coverage` flag: ¿está en el "Input esperado"?

Luego:
1. Detección de modo escalation: ¿qué pasa si `escalation_mode` no existe (field ausente vs. false)?
2. `create_bug` en dev_saas: ¿jira-reader está disponible como skill desde un agente?
3. `is_pipeline_test` field: ¿se usa en jira-writer? Si no, proponer eliminación del contrato.
4. Verificar con Glob todos los paths referenciados en el archivo.

## OUTPUT

Mismo JSON que subagent-qa-orchestrator.md.