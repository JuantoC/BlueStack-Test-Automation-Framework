---
last-updated: 2026-04-17
---

# Pipeline Outcomes — Valores de `outcome`

> Resumen de referencia. Fuente canónica: `.claude/skills/pipeline-run/SKILL.md §PR-5` y `references/outcomes.md`.

El campo `milestone_notes.outcome` en el Execution Context determina qué ciclo de aprendizaje ejecuta `pipeline-run` al finalizar.

```
pipeline-logs/completed/<ticket_key>.json  →  milestone_notes.outcome
pipeline-logs/active/<ticket_key>.json     →  si el orquestador falló antes de completar
```

---

## Enum de outcomes y ciclos

### `"success"` — Ciclo de éxito
→ SKILL.md §PR-5

Tests corrieron y el orquestador completó el pipeline (pasaron o fallaron con comentario en Jira).

**Campos usados del Execution Context:**
- `milestone_notes.total_tests`, `milestone_notes.passed`, `milestone_notes.failed`
- `milestone_notes.last_comment_id`

**Acción:** Mostrar resumen, ejecutar PR-6 (captura de aprendizajes).

---

### `"no_sessions"` — Ciclo de brecha de cobertura
→ SKILL.md §PR-5

No existen archivos `.test.ts` que cubran el módulo/componente del ticket.

**Campos usados del Execution Context:**
- `ticket_analyst_output.classification.module`
- `ticket_analyst_output.classification.component`
- `ticket_analyst_output.acceptance_criteria[].description`

**Acción:** Preguntar al usuario si generar tests. Si confirma → activar skill `create-session` con los criterios. Ejecutar PR-6 siempre.

---

### `"human_escalation"` — Ciclo de escalación humana
→ SKILL.md §PR-5

El orquestador no pudo procesar el ticket por criterios ambiguos, incompletos o sin criterios de aceptación claros.

**Campos usados del Execution Context:**
- `escalation_report` (impreso por el orquestador)

**Acción:** Ofrecer 3 opciones al usuario: proveer criterios correctos, validar manualmente, o saltear. Si provee criterios → guardar `reference_<modulo>_<tema>.md`. Ejecutar PR-6 siempre.

---

### `"non_automatable"` — Ciclo no-automatizable
→ SKILL.md §PR-5

Los criterios existen y son claros, pero requieren validación manual irreducible (CKEditor plugins, interacciones físicas, etc.).

**Campos usados del Execution Context:**
- `escalation_report.reason`

**Acción:** Mostrar razón. Preguntar si registrar como patrón conocido. Si confirma → guardar `reference_non_automatable_<pattern>.md`. Ejecutar PR-6 siempre.

---

### `"error"` — Ciclo de error
→ SKILL.md §PR-5

Error de infraestructura durante la ejecución (Docker Grid caído, MCP Jira falla, Jest explota).

**Campos usados del Execution Context:**
- `error_log[-1].stage`
- `error_log[-1].error_type`
- `error_log[-1].message`

**Acción:** Mostrar stage y error. Para pasos de resolución según `error_type` → ver `.claude/skills/pipeline-run/references/errors.md`. Ejecutar PR-6 siempre.

---

### `"wrong_status"` — Ticket en estado incorrecto
→ SKILL.md §PR-5

El ticket Jira está en un estado que no corresponde al ambiente solicitado.

**Campos usados del Execution Context:**
- `stage_status: "skipped"`
- `reason` con el estado actual del ticket y el ambiente

**Acción:** Informar al usuario. No ejecutar PR-6.

---

### `"skipped"` — Ya procesado
→ SKILL.md §PR-5

El pipeline detectó `already_reported: true` — este ticket ya fue procesado anteriormente.

**Acción:** Informar al usuario con instrucción para forzar re-ejecución eliminando el archivo en `pipeline-logs/completed/`. No ejecutar PR-6.

---

## Cuándo se ejecuta PR-6 (cierre universal)

| Outcome | ¿Ejecuta PR-6? |
|---|---|
| `success` | ✅ siempre |
| `no_sessions` | ✅ siempre |
| `human_escalation` | ✅ siempre |
| `non_automatable` | ✅ siempre |
| `error` | ✅ siempre |
| `wrong_status` | ❌ no |
| `skipped` | ❌ no |

---

## Quién escribe el `outcome`

`qa-orchestrator` escribe `milestone_notes.outcome` en ORC-6. `test-reporter` no establece el outcome directamente — escribe `test_reporter_output.status` y el orquestador traduce ese resultado al outcome final.

---

## Referencias

- `.claude/skills/pipeline-run/SKILL.md §PR-5` — ciclos de aprendizaje por outcome
- `.claude/skills/pipeline-run/references/outcomes.md` — tabla compacta outcome → ciclo
- [wiki/qa/execution-context-schema.md](execution-context-schema.md) — schema completo del Execution Context
- [wiki/qa/context-resumption.md](context-resumption.md) — stage routing y campos del context
