# Contratos de Comunicación Inter-Agente y Persistencia — QA Automation Pipeline
> Parte de: [docs/architecture/qa-pipeline/INDEX.md](INDEX.md)

## 7. Contratos de Comunicación Inter-Agente

### 7.1 Schema de mensajes

Todos los mensajes inter-agente incluyen `pipeline_id` (campo legacy de v3.0 — identifica la ejecución) como campo de trazabilidad. No hay un envelope separado — el `pipeline_id` viaja como campo del payload directo.

```json
{
  "pipeline_id":  "pipe-20260413-001",
  "source_agent": "qa-orchestrator | ticket-analyst | test-engine | test-reporter | test-generator",
  "operation":    "string",
  "ticket_key":   "NAA-XXXX",
  "timestamp":    "ISO-8601",
  "schema_version": "3.0"
}
```

> **schema_version "3.1":** Cuando el payload de test-reporter → jira-writer incluye el campo `attachments[]`, se debe enviar `"schema_version": "3.1"`. El campo es opcional — si está ausente el comportamiento es idéntico a v3.0. Ver `docs/architecture/qa-pipeline/11-multimedia-attachments.md`.

El `pipeline_id` vincula todos los mensajes de un mismo flujo para trazabilidad en `pipeline-logs/`.

> **v2.0 → v3.0:** El envelope separado con `payload: {}` fue eliminado. El `pipeline_id` se agrega como campo directo en todos los schemas existentes. Esto simplifica la implementación sin perder trazabilidad.

### 7.2 Execution Context (estado compartido)

El Orchestrator mantiene este objeto en memoria y lo persiste a disco en cada transición de stage. Si el pipeline se interrumpe, puede retomarse desde el último stage completado.

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

> **Nota:** `pipeline_id` es un campo legacy de v3.0 que se mantiene por trazabilidad. Los campos `ticket_analyst_output`, `test_engine_output` y `test_reporter_output` se populan con el output JSON de cada sub-agente al completar su stage.

**Persistencia del Execution Context:**
```
pipeline-logs/active/<ticket_key>.json      ← se sobreescribe en cada transición de stage
pipeline-logs/completed/<ticket_key>.json   ← se mueve aquí al completar o escalar
```

> **Naming convention:** El archivo se nombra por `ticket_key` (ej. `NAA-4429.json`), no por `pipeline_id`. Esto permite lookup directo por ticket sin conocer el `pipeline_id` de antemano.

**Mecanismo de resumption:** Al iniciar, el Orchestrator verifica si existe `pipeline-logs/completed/<ticket_key>.json` o `pipeline-logs/active/<ticket_key>.json`. Si existe:
- `current_stage = "test_execution"` y `test_execution.suite_summary.total > 0` → saltar a test-reporter.
- `current_stage = "ticket_analysis"` → empezar desde test-engine.
- `current_stage = "reporting"` con `report_result.status = null` → reintentar test-reporter.

**Mecanismo de idempotencia:** Antes de invocar test-reporter, el Orchestrator verifica `idempotency.already_reported`. Si es `true`, skip (el comentario ya fue posteado). Después de postear, almacena `last_comment_id` y setea `already_reported: true`.

### 7.3 Manejo de errores

| Error | Agente que lo detecta | Acción |
|-------|----------------------|--------|
| Ticket no encontrado | ticket-analyst | Abortar + informar Orchestrator |
| Ticket sin criterios en descripción (OP-6 `criteria: []`) | ticket-analyst | Leer ticket COMPLETO (comments + campos custom + título). Inferir desde contexto. Si inferencia produce ≥ 1 criterio: continuar con `source: "inferred"`. Si falla: `testable: false` + escalación explícita pidiendo al equipo descripción del flujo + pasos a reproducir. |
| Ticket no testable (diseño/UX) | ticket-analyst | `testable: false` → Orchestrator escala |
| `confidence = "low"` en matching | ticket-analyst | `testable: false` → escalar, no ejecutar con baja confianza |
| `sessions_found = false` | test-engine | Señalar al Orchestrator → invocar test-generator |
| Tests no compilan (error TS) | test-engine | Abortar + devolver logs TypeScript |
| Selenium timeout / crash | test-engine | Reintentar 1 vez. Si falla: `status: error` en `test_results[]` |
| Jest no encontró el test | test-engine | Verificar nombre exacto del archivo (PascalCase.test.ts) |
| `jest --json` produce output vacío o malformado | test-engine | Verificar existencia y tamaño del outputFile antes de parsear |
| Docker Selenium Grid no disponible | test-engine | Verificar grid antes de Jest. Abortar + escalar si no responde |
| jira-writer `status: "partial"` | test-reporter | Registrar `errors[]` en Agent Execution Record. Escalar acciones fallidas. |
| jira-writer `status: "error"` | test-reporter | Retry con backoff, máximo 3 intentos. Si persiste: agregar a `failed-reports.json` + escalar |
| MCP Atlassian token expirado (401/403) | ticket-analyst / test-reporter | Escalar inmediatamente. No reintentar — el token no se autorenueva |
| Falta `prerelease_version` en `validate_devsaas` | test-reporter | Bloquear — pedir versión |
| ADF inválido (campo es string) | test-reporter | BLOQUEAR — reconstruir como ADF JSON |
| No existe comentario Master previo para Dev_SAAS | test-reporter | Abortar flujo Dev_SAAS |
| Context window cercano al límite (§11.6) | qa-orchestrator | Dividir ejecución. Ver §11.6. |
| `test-map.json` no encontrado | test-engine | Abortar + escalar. Verificar existencia en Fase 0 checklist. |

---

## 8. Agent Execution Record

### 8.1 Schema del Agent Execution Record

```json
{
  "pipeline_id": "pipe-20260413-001",
  "schema_version": "3.0",
  "started_at": "2026-04-13T14:30:00Z",
  "completed_at": "2026-04-13T14:32:45Z",
  "duration_ms": 165000,
  "trigger": {
    "type": "manual",
    "ticket_key": "NAA-4429",
    "requested_env": "master"
  },
  "stages": {
    "ticket_analysis": {
      "status": "completed",
      "duration_ms": 8000,
      "module_matched": "ai-post",
      "confidence": "high",
      "testable": true
    },
    "test_execution": {
      "status": "completed",
      "duration_ms": 142000,
      "mode_used": "discover_and_run",
      "sessions_run": ["NewAIPost"],
      "passed": 1,
      "failed": 0,
      "screenshot_paths": [],
      "screenshots": [
        {
          "testName": "<testName>",
          "path": "allure-results/attachments/<uuid>.png",
          "capturedAt": "<ISO-8601>"
        }
      ]
    },
    "reporting": {
      "status": "completed",
      "duration_ms": 15000,
      "env": "master",
      "comment_posted": true,
      "comment_id": "10045",
      "transition_applied": "42",
      "attachment_results": [
        {
          "label": "Screenshot_X",
          "attachmentId": "string",
          "filename": "string",
          "contentUrl": "string",
          "status": "uploaded | failed",
          "error": "string (solo si failed)"
        }
      ]
    }
  },
  "step_log": [
    { "stage": "ticket_analysis", "started_at": "...", "completed_at": "...", "duration_ms": 8000, "status": "completed", "notes": "" },
    { "stage": "test_execution",   "started_at": "...", "completed_at": "...", "duration_ms": 142000, "status": "completed", "notes": "" },
    { "stage": "reporting",        "started_at": "...", "completed_at": "...", "duration_ms": 15000, "status": "completed", "notes": "" }
  ],
  "final_status": "completed_all_pass | completed_with_failures | error | escalated",
  "human_escalation": false,
  "auto_generated_tests": false,
  "dry_run": false,
  "error_log": []
}
```

### 8.2 Almacenamiento

```
pipeline-logs/
├── active/
│   └── <ticket_key>.json            ← Execution Context mientras está corriendo (ej. NAA-4429.json)
├── completed/
│   └── <ticket_key>.json            ← Agent Execution Record al completar
├── screenshots/
│   └── {ticket_key}-{exec_id}-{test}.png  ← Solo si IS_PIPELINE=true y hay fallos
├── failed-reports.json              ← Payloads que no llegaron a Jira (DLQ mínimo)
└── .gitkeep

> `screenshot_paths` en `test_execution`: array de paths relativos a `pipeline-logs/screenshots/`. Solo se popula cuando `IS_PIPELINE=true` y al menos un test falla. En ejecuciones locales (sin IS_PIPELINE) el array queda vacío.
```

> **Sin SQLite.** El volumen actual (decenas de pipelines/semana) no justifica una base de datos. Los archivos JSON son suficientes y más simples de debuggear. Revisar si el volumen justifica SQLite cuando se superen 500 pipeline runs.

### 8.3 Resumption (recuperación de estado)

Ver §7.2 para el mecanismo completo. El Orchestrator siempre persiste el Execution Context antes de invocar cada sub-agente. Si Claude Code se cierra inesperadamente, la próxima invocación sobre el mismo ticket puede retomar desde el último stage completado usando el contexto activo.
