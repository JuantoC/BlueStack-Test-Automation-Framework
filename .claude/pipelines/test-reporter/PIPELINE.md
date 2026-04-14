---
name: test-reporter
phase: 3
invoked_by: qa-orchestrator
uses_skills: [jira-writer MODO F]
---

# test-reporter

**Responsabilidad única:** Traducir el output del test-engine a acciones Jira usando
`jira-writer MODO F` como único punto de entrada. No lee tickets, no ejecuta tests.

---

## Input

Recibe el Pipeline Context completo — siempre leyendo desde disco el JSON actualizado
por test-engine en `pipeline-logs/completed/<TICKET_KEY>.json`.

Campos que consume:
```json
{
  "pipeline_id": "...",
  "ticket_analyst_output": {
    "ticket_key": "NAA-XXXX",
    "component_jira": "...",
    "classification": { "module": "...", "action_type": "..." },
    "jira_metadata": { "assignee": "...", "component": "...", "parentKey": "...", ... }
  },
  "test_engine_output": {
    "execution_id": "...",
    "environment": "master | dev_saas | testing | [cliente]",
    "result": "passed | failed",
    "total_tests": 1,
    "passed": 1,
    "failed": 0,
    "failure_summary": null,
    "console_errors_detected": []
  },
  "idempotency": {
    "already_reported": false,
    "last_comment_id": null
  }
}
```

---

## Paso TR-1: Chequeo de idempotencia

Antes de construir el payload, verificar `idempotency.already_reported`.

- Si `true` → **detener**. No llamar a jira-writer. Registrar en `test_reporter_output`:
  ```json
  { "status": "skipped", "reason": "already_reported=true — ejecución previa ya registrada en Jira" }
  ```
  Finalizar sin errores.

- Si `false` → continuar con TR-2.

---

## Paso TR-2: Determinar `operation` según entorno y resultado

| `environment` | `result` | `operation` | Acción Jira |
|---------------|----------|-------------|-------------|
| `master` | `passed` | `validate_master` | Comentario ✔ + transición `42` (A Versionar) |
| `master` | `failed` | `validate_master` | Comentario ✘ + transición `2` (FEEDBACK) |
| `dev_saas` | `passed` | `validate_devsaas` | Comentario ✔ + transición `31` (Done) |
| `dev_saas` | `failed` | `validate_devsaas` | Comentario ✘ + crear tickets por cada ✘ |
| `testing` | cualquiera | — | **No llamar a jira-writer.** Ver nota abajo. |
| `[cliente]` | `passed` | `validate_master` | Comentario ✔ con header de cliente |
| `[cliente]` | `failed` | `validate_master` | Comentario ✘ con header de cliente |

> **Entorno `testing`:** Es el entorno de desarrollo del framework (no de producción).
> Los resultados en testing son informativos, nunca transicionan el ticket.
> Si el test falla en testing por el bug reportado, eso confirma que el bug está activo —
> pero el comentario en Jira corresponde al equipo de desarrollo, no al pipeline.
> Registrar en `test_reporter_output.status: "skipped"` con razón `"environment=testing"`.

---

## Paso TR-3: Construir test_results[] desde test_engine_output

Para cada test ejecutado en `test_engine_output.results[]` (o desde el Jest JSON en
`pipeline-logs/results-<TICKET_KEY>-exec-<N>.json`):

```json
{
  "test_name": "<assertionResult.title>",
  "description": "<acceptance_criteria[i] o test_hint[i] del ticket-analyst>",
  "result": "✔ | ✘",
  "duration_ms": <assertionResult.duration>,
  "error_message": "<failureMessages[0] truncado a primera línea>",
  "stacktrace": "<primeras 5-8 líneas del stack, solo si result=✘>",
  "log_excerpt": "<console_errors_detected[], solo si hay errores>"
}
```

**Regla de descripción:** Si el test tiene un acceptance criterion que lo cubre (del ticket-analyst),
usarlo como `description`. Si no hay mapping, usar el `test_name` sin transformar.

---

## Paso TR-4: Construir el payload completo para jira-writer MODO F

```json
{
  "schema_version": "2.0",
  "source_agent": "test-reporter",
  "operation": "<determinado en TR-2>",
  "ticket_key": "<ticket_analyst_output.ticket_key>",
  "environment": "<test_engine_output.environment>",
  "environment_url": "<de .env: TESTING_URL | MASTER_URL | DEVSAAS_URL según environment>",
  "test_suite": "<nombre del archivo de session sin extensión>",
  "test_file": "<path relativo, ej: sessions/post/NewAIPost.test.ts>",
  "component": "<jira_metadata.component>",
  "assignee_hint": "<inferido de jira_metadata.assignee: 'frontend' | 'backend' | 'editor'>",
  "suite_summary": {
    "total": <total_tests>,
    "passed": <passed>,
    "failed": <failed>
  },
  "test_results": [<construidos en TR-3>],
  "idempotency": {
    "already_reported": <idempotency.already_reported>,
    "last_comment_id": <idempotency.last_comment_id>
  },
  "is_pipeline_test": false,
  "pipeline_id": "<pipeline_id del Pipeline Context>"
}
```

> `is_pipeline_test: true` solo durante Fase 0 (testing del pipeline mismo).
> En producción siempre `false`.

> **`assignee_hint`:** Inferir del nombre en `jira_metadata.assignee`:
> - "Paula" → `frontend`
> - "Verónica" → `backend`
> - "Claudia" → `editor`
> - Ambiguo → omitir (jira-writer preguntará)

---

## Paso TR-5: Llamar a jira-writer MODO F

Pasar el payload construido en TR-4. jira-writer maneja internamente:
- F1.5: idempotencia (segunda capa de seguridad)
- F2: routing a MODO B / C / D / A según `operation`
- F3: construcción del comentario ADF
- F5: output estructurado

---

## Paso TR-6: Escribir test_reporter_output en el Pipeline Context

Leer el Pipeline Context desde `pipeline-logs/completed/<TICKET_KEY>.json`, agregar
`test_reporter_output` con el resultado de jira-writer y reescribir el archivo completo:

```json
"test_reporter_output": {
  "executed_at": "<ISO timestamp>",
  "operation": "<operation usada>",
  "environment": "<environment>",
  "status": "success | partial | skipped | error",
  "actions_taken": [...],
  "errors": [],
  "comment_id": "<id del comentario posteado, o null>",
  "transition_applied": "<to_status, o null>"
}
```

Actualizar también `idempotency.already_reported: true` y
`idempotency.last_comment_id: <comment_id>` si se posteó comentario.

---

## Output del pipeline

El Pipeline Context final en `pipeline-logs/completed/<TICKET_KEY>.json` con:
- `stage: "test-reporter"`, `stage_status: "completed" | "failed" | "skipped"`
- `test_reporter_output` completo
- `idempotency.already_reported: true`

---

## Manejo de errores

| Error | Acción |
|-------|--------|
| jira-writer retorna `status: "error"` | Registrar en `test_reporter_output.errors[]`, marcar `stage_status: "failed"` |
| jira-writer retorna `status: "partial"` | Registrar acciones y errores, marcar `stage_status: "partial"` |
| Pipeline Context no encontrado en `completed/` | Fallar con error explícito — test-engine no completó |
| `test_engine_output: null` | Fallar con error — test-reporter no puede operar sin resultados de test |

---

## Consideraciones GitHub Actions

- **Re-run safety:** TR-1 verifica `already_reported` antes de cualquier acción. Si el job
  falló después de postear el comentario pero antes de escribir el Pipeline Context, jira-writer
  F1.5 actúa como segunda capa verificando `last_comment_id` contra la API de Jira.
- **Secrets:** `JIRA_API_TOKEN` y `JIRA_USERNAME` deben estar configurados como secrets del repo
  de GitHub Actions. El MCP los toma de variables de entorno — no hardcodear.
- **Timeout:** Si jira-writer tarda más de lo esperado (> 30s), el step de GitHub Actions puede
  expirar. Configurar `timeout-minutes: 5` en el step de test-reporter.
- **Audit trail:** El Pipeline Context escrito en TR-6 es el registro permanente del run.
  Commitear `pipeline-logs/completed/` al repo con el workflow para trazabilidad histórica.