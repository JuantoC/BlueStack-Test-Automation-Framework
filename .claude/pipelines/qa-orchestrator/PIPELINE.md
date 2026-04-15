---
phase: 4
uses_skills: []
invoked_by: "usuario | CronCreate | poll-jira.ts"
---

> **DEPRECATED — Referencia histórica v3.0**  
> Este archivo fue el prompt de invocación en el modelo pipelines-as-prompts.  
> El agente vigente está en `.claude/agents/qa-orchestrator.md`.  
> Este documento se conserva como referencia de la lógica interna del agente.

# Pipeline: qa-orchestrator

**Responsabilidad:** Recibir el trigger, verificar idempotencia, invocar los sub-pipelines en
secuencia (ticket-analyst → test-engine → test-reporter), manejar errores por stage y registrar
el Pipeline Execution Record final.

**No hace:** No lee tickets directamente, no ejecuta tests, no escribe en Jira.
Solo coordina — delega todo a los sub-pipelines.

---

## Input — Trigger Event

```json
{
  "action": "process_ticket",
  "ticket_key": "NAA-XXXX",
  "environment": "master | dev_saas",
  "requested_by": "manual | poll | ci"
}
```

| Campo | Descripción |
|-------|-------------|
| `ticket_key` | Key del ticket Jira a procesar (ej. NAA-4467) |
| `environment` | Ambiente de validación. Default: `"master"` |
| `requested_by` | Origen del trigger. Default: `"manual"` |

---

## ORC-1: Inicialización

### ORC-1.1 — Generar pipeline_id

Formato: `pipe-YYYYMMDD-NNN` donde NNN es secuencial por día.

Para obtener el siguiente número: listar `pipeline-logs/completed/` y `pipeline-logs/active/`
y contar los pipeline contexts del día actual. Ejemplo: si hay 3 del 20260414 → siguiente es `pipe-20260414-004`.

### ORC-1.2 — Verificar idempotencia

Buscar `pipeline-logs/completed/<ticket_key>.json`. Si existe:
- Leer el campo `idempotency.already_reported`.
- Si `already_reported: true` → **ABORT**. Retornar:
  ```json
  { "status": "skipped", "reason": "already_reported", "comment_id": "<last_comment_id>" }
  ```
- Si `already_reported: false` y `stage_status != "completed"` → el pipeline anterior se
  interrumpió. Cargar ese context y retomarlo desde el stage correspondiente (ver ORC-1.3).

Buscar también `pipeline-logs/active/<ticket_key>.json`. Si existe → pipeline en curso para
este ticket. Abortar para evitar ejecución paralela.

### ORC-1.3 — Cargar o crear Pipeline Context

**Si existe un context previo incompleto** (completed con `stage_status != "completed"`):
- Cargar el JSON.
- Identificar el `current_stage` incompleto.
- Continuar desde el siguiente stage (skip los ya completados).

**Si no existe ningún context** → crear en `pipeline-logs/active/<ticket_key>.json`:

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

Persistir a disco antes de continuar.

---

## ORC-2: Invocar ticket-analyst

**Referencia:** `.claude/pipelines/ticket-analyst/PIPELINE.md`

El orchestrator no reproduce la lógica interna de ticket-analyst. Solo:

1. Leer `.claude/pipelines/ticket-analyst/PIPELINE.md` completo.
2. Ejecutar los pasos TA-1 a TA-9 sobre `ticket_key` y `environment`.
3. El pipeline context activo (`active/<ticket_key>.json`) se actualiza en TA-9.
4. Registrar en `step_log`:
   ```json
   { "stage": "ticket-analyst", "started_at": "<ISO>", "completed_at": "<ISO>", "status": "completed", "duration_ms": null }
   ```

**Si ticket-analyst produce `testable: false`:**
- Registrar `stage_status: "escalated"` en el context.
- Ir a **ORC-6 (Finalizar)** con outcome `"escalated"`.
- No invocar test-engine.

**Si ticket-analyst produce `confidence: "low"`:**
- Idem — escalar sin proceder.

Persistir el context después de completar ORC-2.

---

## ORC-2.5: Routing granular basado en testability_summary

Leer `ticket_analyst_output.testability_summary.action` del Pipeline Context:

| action | Decisión |
|---|---|
| `"full_run"` | Continuar a ORC-3 (test-engine completo, todos los criterios) |
| `"partial_run_and_escalate"` | Continuar a ORC-3 solo con criterios `automatable: true && covered_by_existing_session: true`. Después de ORC-5, agregar al comentario Jira una sección de escalación para los criterios no automatizables |
| `"generate_tests"` | Saltar a test-generator (Fase 5). Log: "criterios automatable pero sin cobertura en sessions existentes" |
| `"escalate_all"` | Saltar ORC-3 y ORC-5. Escribir comentario Jira explicando por qué no se puede automatizar, con lista de criterios y `reason_if_not` por cada uno. `stage = "escalated_human"` |

**Para `"escalate_all"`, el comentario Jira debe incluir:**
- Título: "⚠️ Validación requiere revisión manual"
- Por cada criterio: descripción + reason_if_not
- Instrucciones: qué debe validar el QA manualmente

**Para `"partial_run_and_escalate"`, la sección adicional en el comentario tras los resultados de tests:**
- Título: "⚠️ Criterios pendientes de validación manual"
- Lista de criterios no automatizables con su reason_if_not

Persistir el context después de completar ORC-2.5.

---

## ORC-3: Invocar test-engine

**Referencia:** `.claude/pipelines/test-engine/PIPELINE.md`

Precondición: `ticket_analyst_output.classification.testable == true`.

1. Leer `.claude/pipelines/test-engine/PIPELINE.md` completo.
2. Ejecutar los pasos TE-1 a TE-8. El `ticket_analyst_output` del context activo
   es el input para TE-3 (determinar módulo y sessions).
3. El context activo se actualiza en TE-8 con `test_engine_output`.
4. Registrar en `step_log`:
   ```json
   { "stage": "test-engine", "started_at": "<ISO>", "completed_at": "<ISO>", "status": "completed | failed", "duration_ms": <ms> }
   ```

Persistir el context después de completar ORC-3.

---

## ORC-4: Decidir rama

Leer `test_engine_output.sessions_found` del context activo:

| `sessions_found` | Acción |
|-----------------|--------|
| `true` | → **ORC-5** (test-reporter) |
| `false` | → **ORC-6** con `outcome: "no_sessions"` (Fase 5 pendiente: test-generator) |

Si `sessions_found: false`: registrar en el context:
```json
{ "stage": "test-engine", "status": "skipped", "notes": "sessions_found: false — test-generator pendiente (Fase 5)" }
```

---

## ORC-5: Invocar test-reporter

**Referencia:** `.claude/pipelines/test-reporter/PIPELINE.md`

Precondición: `test_engine_output.sessions_found == true`.

1. Leer `.claude/pipelines/test-reporter/PIPELINE.md` completo.
2. Ejecutar los pasos TR-1 a TR-6. El `test_engine_output` del context activo
   es el input para TR-2 en adelante.
3. El context activo se actualiza en TR-6 con `test_reporter_output`.
4. Registrar en `step_log`:
   ```json
   { "stage": "test-reporter", "started_at": "<ISO>", "completed_at": "<ISO>", "status": "completed | error" }
   ```

Persistir el context después de completar ORC-5.

---

## ORC-6: Finalizar

### ORC-6.1 — Actualizar campos de cierre en el context

```json
{
  "stage": "done",
  "stage_status": "completed",
  "idempotency": {
    "last_comment_id": "<comment_id de test_reporter_output>",
    "already_reported": true
  }
}
```

Para outcome de escalación o sin sessions, usar el `stage_status` correspondiente según la tabla:

| `final_status` | Descripción |
|---|---|
| `"done"` | Todos los criterios automatizables pasaron |
| `"partial_validated"` | Criterios automatable pasaron + criterios no automatable escalados a humano |
| `"failed"` | Tests fallaron |
| `"escalated_human"` | Ningún criterio automatizable (`escalate_all`) |
| `"no_sessions"` | Módulo sin sessions |

Mantener `already_reported: false` para todos los outcomes de escalación o sin sessions.

### ORC-6.2 — Mover context de active/ a completed/

1. Escribir el context final en `pipeline-logs/completed/<ticket_key>.json`.
2. Eliminar `pipeline-logs/active/<ticket_key>.json`.

### ORC-6.3 — Pipeline Execution Record

Agregar `milestone_notes` al context antes de cerrarlo:

```json
"milestone_notes": {
  "pipeline_id": "<pipeline_id>",
  "ticket_key": "<ticket_key>",
  "outcome": "success | failed | escalated | no_sessions | error",
  "executed_at": "<ISO>",
  "stages_completed": ["ticket-analyst", "test-engine", "test-reporter"],
  "total_duration_note": "Ver step_log para tiempos por stage"
}
```

---

## Manejo de errores por stage

| Stage | Error | Acción |
|-------|-------|--------|
| ticket-analyst | MCP Jira no responde | Registrar en `error_log`, abortar, marcar `stage_status: "error"` |
| ticket-analyst | Ticket no existe | Registrar error, abortar con mensaje claro |
| test-engine | Docker Grid no disponible (curl falla) | Registrar error, abortar — no reintentar automáticamente |
| test-engine | Jest falla con error de infraestructura (no de test) | Registrar en `error_log`, marcar `result: "error"`, continuar a test-reporter |
| test-reporter | addCommentToJiraIssue falla | Reintentar 1 vez. Si falla de nuevo → marcar `status: "error"`, no transicionar |
| test-reporter | transitionJiraIssue falla | Registrar en `error_log`, dejar comentario ya posteado, marcar `transition_applied: null` |
| Cualquiera | Error no esperado | Registrar en `error_log`, mover context a `completed/` con `stage_status: "error"` |
| ORC-2.5 (`escalate_all`) | Sin criterios automatizables | Escribir comentario Jira, marcar `stage = "escalated_human"`, ir a ORC-6 |
| ORC-2.5 (`generate_tests`) | Sin cobertura en sessions existentes | Registrar en `step_log`, saltar a test-generator (Fase 5) |

Estructura de `error_log`:
```json
"error_log": [
  {
    "stage": "test-engine",
    "timestamp": "<ISO>",
    "error_type": "DockerNotAvailable",
    "message": "curl http://localhost:4444/status returned connection refused",
    "action_taken": "aborted"
  }
]
```

---

## Trigger manual

Para invocar el orchestrator directamente desde conversación:

```
Ejecutar el qa-orchestrator para el ticket NAA-XXXX en ambiente master.
```

O con payload explícito:

```json
{
  "action": "process_ticket",
  "ticket_key": "NAA-XXXX",
  "environment": "master",
  "requested_by": "manual"
}
```

El orchestrator leerá este documento (PIPELINE.md) e iniciará desde ORC-1.

### Retomar pipeline interrumpido

Si existe `pipeline-logs/completed/NAA-XXXX.json` con `stage_status != "completed"`:
```
Retomar el pipeline para NAA-XXXX desde donde quedó.
```

El orchestrator detecta el stage incompleto en ORC-1.2 y retoma desde el siguiente stage.

---

## Nuevos valores de stage (introducidos en ORC-2.5)

- `"escalated_human"`: ticket con criterios no automatizables, comentario enviado a Jira
- `"partial_validated"`: tests automatable pasaron, criterios no automatable escalados a humano

---

## Flujo resumido

```
Trigger
  │
  ▼
ORC-1: Inicialización
  │  Generar pipeline_id
  │  Verificar idempotencia → si already_reported: abort
  │  Crear/cargar Pipeline Context en active/
  │
  ▼
ORC-2: ticket-analyst
  │  Lee ticket, clasifica, extrae criterios
  │  Si testable: false → ORC-6 (escalated)
  │
  ▼
ORC-3: test-engine
  │  Descubre sessions, ejecuta Jest
  │
  ▼
ORC-4: Decisión
  │  sessions_found: false → ORC-6 (no_sessions)
  │  sessions_found: true  → ORC-5
  │
  ▼
ORC-5: test-reporter
  │  Construye comentario ADF, llama jira-writer
  │  Aplica transición de estado en Jira
  │
  ▼
ORC-6: Finalizar
     Actualiza context (already_reported: true)
     Mueve active/ → completed/
     Registra Pipeline Execution Record
```