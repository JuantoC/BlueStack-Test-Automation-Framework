# Prompt — Subagente: Auditar test-generator

Sos un arquitecto de agentes IA en modo READ-ONLY. Auditá `.claude/agents/test-generator.md`.
Tu output son hallazgos con evidencia y edits propuestos. NO modificás archivos en esta fase.

## LECTURA OBLIGATORIA

1. `.claude/skills/agent-auditor/references/detection-framework.md` — PRIMERO, antes de todo
2. `.claude/agents/test-generator.md` — completo
3. `.claude/agents/qa-orchestrator.md` — solo sección de invocación (cómo lo invoca y qué input pasa)
4. `.claude/skills/create-session/` — Glob + leer SKILL.md
5. `.claude/pipelines/test-engine/references/test-map.json` — completo
6. `wiki/index.md` — completo (para evitar proponer archivos wiki que ya existen)

## AUDITORÍA

Aplicar los 6 patrones del detection-framework sobre el agente. Luego:

1. Contrato con qa-orchestrator: ¿los campos del input que recibe coinciden con lo que
   el orchestrator realmente pasa?
2. Output final: ¿los campos que retorna al orchestrator coinciden exactamente con lo que
   el orchestrator lee en su tabla de decisión post-generator?
3. test-map.json: cuando agrega una entrada, ¿cómo maneja el caso donde ya existe una entrada
   para ese módulo? ¿Hay instrucción explícita?
4. Dry-run: ¿el flag `--passWithNoTests` permite que Jest retorne exit 0 con errores TypeScript?
   ¿El dry-run realmente valida compilación?
5. Invocación a `pom-generator`: ¿qué espera como resultado? ¿Hay contrato de output documentado?
6. Verificar con Glob todos los paths referenciados en el archivo.

## OUTPUT

Mismo JSON que subagent-qa-orchestrator.md.