---
last-updated: 2026-04-17
---

# Execution Context — Schema y Persistencia

> Fuente canónica del estado compartido del pipeline QA. Consumida por agentes en runtime.

## Schema

El Orchestrator mantiene este objeto en memoria y lo persiste a disco en cada transición de stage.

```json
{
  "pipeline_id": "pipe-YYYYMMDD-NNN",
  "schema_version": "3.0",
  "created_at": "<ISO-8601>",
  "environment": "<environment del trigger>",
  "stage": "init",
  "stage_status": "in_progress",
  "idempotency": {
    "last_comment_id": null,
    "already_reported": false
  },
  "step_log": [],
  "ticket_analyst_output": null,
  "test_engine_output": null,
  "test_reporter_output": null
}
```

> `pipeline_id` es un campo legacy de v3.0 que se mantiene por trazabilidad. Los campos `*_output` se populan con el output JSON de cada sub-agente al completar su stage.

## Persistencia

```
pipeline-logs/active/<ticket_key>.json      ← se sobreescribe en cada transición de stage
pipeline-logs/completed/<ticket_key>.json   ← se mueve aquí al completar o escalar
```

El archivo se nombra por `ticket_key` (ej. `NAA-4429.json`), no por `pipeline_id`. Esto permite lookup directo por ticket sin conocer el `pipeline_id`.

## Resumption (recuperación de estado)

Al iniciar, el Orchestrator verifica si existe `pipeline-logs/completed/<ticket_key>.json` o `pipeline-logs/active/<ticket_key>.json`. Si existe:

- `current_stage = "test_execution"` y `test_execution.suite_summary.total > 0` → saltar a test-reporter.
- `current_stage = "ticket_analysis"` → empezar desde test-engine.
- `current_stage = "reporting"` con `report_result.status = null` → reintentar test-reporter.

## Idempotencia

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `already_reported` | boolean | `true` si el comentario ya fue posteado en Jira (modo normal o escalación) |
| `last_comment_id` | string \| null | ID del comentario Jira posteado, o `null` si aún no se posteó |

**Ciclo de vida:**
- **ORC-1.3 (qa-orchestrator):** inicializa ambos campos en `false` / `null` al crear el Execution Context.
- **TR-1 / TR-E.1 (test-reporter):** verifica `already_reported` antes de actuar. Si es `true` → `status: "skipped"`.
- **TR-6 / TR-E.4 (test-reporter):** tras postear exitosamente → `already_reported: true`, `last_comment_id: "<id>"`.

---
_Migrado desde `docs/architecture/qa-pipeline/05-contratos-y-persistencia.md` §7.2 — el original queda como historial._
