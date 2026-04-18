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
  "escalation_mode": false,
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

## Agent Execution Record — `step_log[]`, `error_log[]`, `milestone_notes`

### `step_log[]` — entradas por stage

El qa-orchestrator escribe una entrada en `step_log[]` al completar cada stage. Formato de cada entrada:

```json
{ "stage": "ticket-analyst", "started_at": "<ISO>", "completed_at": "<ISO>", "status": "completed" }
```

Para `test-engine`:
```json
{ "stage": "test-engine", "started_at": "<ISO>", "completed_at": "<ISO>", "status": "completed | failed", "duration_ms": "<ms>" }
```

Para `test-generator`:
```json
{ "stage": "test-generator", "started_at": "<ISO>", "completed_at": "<ISO>", "status": "completed | failed", "dry_run": "<dry_run_result>" }
```

Para `test-reporter`:
```json
{ "stage": "test-reporter", "started_at": "<ISO>", "completed_at": "<ISO>", "status": "completed | error" }
```

Para el nodo de routing (ORC-2.5):
```json
{ "stage": "routing", "action_evaluated": "<action>", "routing_decision": "<ORC-X>", "timestamp": "<ISO>" }
```

### `error_log[]` — errores de runtime

Errores no bloqueantes (ej. fallo al acceder a URL de validación externa) se registran aquí sin detener el pipeline. Formato:

```json
{ "stage": "<stage>", "timestamp": "<ISO>", "error": "<descripción>" }
```

### `milestone_notes` — resumen de cierre

Escrito por el qa-orchestrator en ORC-6.3 antes de mover el context a `completed/`:

```json
{
  "pipeline_id": "<pipeline_id>",
  "ticket_key": "<ticket_key>",
  "outcome": "success | failed | escalated | no_sessions | auto_generated | auto_generated_dry_run_failed | error",
  "executed_at": "<ISO>",
  "stages_completed": ["ticket-analyst", "test-engine", "test-reporter"],
  "total_duration_note": "Ver step_log para tiempos por stage"
}
```

Valores de `outcome`:

| Valor | Descripción |
|-------|-------------|
| `success` | Pipeline completó y reportó en Jira |
| `failed` | Algún test falló y se reportó con ✘ |
| `escalated` | Criterios no automatizables — se posteó comentario de escalación |
| `no_sessions` | No se encontraron sessions y test-generator no pudo crearlas |
| `auto_generated` | Test generado automáticamente y ejecutado |
| `auto_generated_dry_run_failed` | Test generado pero no compiló — requiere revisión manual |
| `error` | Error técnico del pipeline |

---

## Idempotencia y flags de control

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `already_reported` | boolean | `true` si el comentario ya fue posteado en Jira (modo normal o escalación) |
| `last_comment_id` | string \| null | ID del comentario Jira posteado, o `null` si aún no se posteó |
| `escalation_mode` | boolean | `true` cuando todos los criterios son non-automatable o sessions_found es false. Lo setea qa-orchestrator en ORC-2.5/ORC-3 antes de invocar test-reporter. test-reporter lee este campo para elegir entre flujo normal (TR-1→TR-6) y flujo de escalación (TR-E). |

**Ciclo de vida:**
- **ORC-1.3 (qa-orchestrator):** inicializa ambos campos en `false` / `null` al crear el Execution Context.
- **TR-1 / TR-E.1 (test-reporter):** verifica `already_reported` antes de actuar. Si es `true` → `status: "skipped"`.
- **TR-6 / TR-E.4 (test-reporter):** tras postear exitosamente → `already_reported: true`, `last_comment_id: "<id>"`.

---
_Migrado desde `docs/architecture/qa-pipeline/05-contratos-y-persistencia.md` §7.2 — el original queda como historial._
