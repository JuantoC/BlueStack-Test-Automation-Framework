---
last-updated: 2026-04-17
---

# Execution Context — Resumption y Stage Routing

> Mecánica de recuperación de estado cuando el pipeline se interrumpe. Consumida por qa-orchestrator en runtime.

---

## Cuándo aplica

Al iniciar ORC-1, el orchestrator verifica si existe un Execution Context previo en:
- `pipeline-logs/active/<ticket_key>.json` — pipeline en curso
- `pipeline-logs/completed/<ticket_key>.json` — pipeline finalizado

Si existe → cargar el context y aplicar la tabla de stage routing. Si no existe → crear un context nuevo (ORC-1.3).

---

## Tabla de stage routing (ORC-1.2)

| `stage` del context | Condición adicional | Acción |
|---------------------|--------------------|----|
| `"ticket_analysis"` | `ticket_analyst_output` tiene `testability_summary`, `acceptance_criteria[]` y `classification` completos | Saltar a **ORC-3** (test-engine) |
| `"test_execution"` | `test_engine_output` tiene `result`, `results[]`, `total_tests`, `passed` y `failed` con valores completos | Saltar a **ORC-5** (test-reporter) |
| `"test_execution"` | `test_engine_output` null o incompleto (crash mid-write) | Reiniciar desde **ORC-3** (re-ejecutar test-engine) |
| `"test_generation"` | `test_generator_output` tiene `status`, `test_path`, `dry_run_result` | Evaluar en **ORC-4.2** y continuar |
| `"test_generation"` | `test_generator_output` null o incompleto | Reiniciar desde **ORC-4.1** (re-invocar test-generator) |
| `"reporting"` | `test_reporter_output` null | Saltar a **ORC-5** (retry test-reporter) |
| cualquier otro | — | Reiniciar desde **ORC-2** (seguro) |

---

## Guard de idempotencia

Antes de aplicar stage routing, verificar si el pipeline ya finalizó:

```json
{ "status": "skipped", "reason": "pipeline_already_finalized", "outcome": "<outcome>" }
```

**Excepción:** Si `requested_by == "manual"` → ignorar el guard y re-procesar igualmente.

---

## Campos del Execution Context relacionados

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `stage` | string | Stage actual: `"init"`, `"ticket_analysis"`, `"test_execution"`, `"test_generation"`, `"reporting"`, `"done"` |
| `stage_status` | string | `"in_progress"`, `"completed"`, `"failed"`, `"skipped"` |
| `escalation_mode` | boolean | `true` si el pipeline está en modo escalación |
| `step_log` | array | Log de pasos completados (append-only) |
| `error_log` | array | Errores capturados durante la ejecución |
| `ticket_analyst_output` | object \| null | Output completo de ticket-analyst, o null si aún no completó |
| `test_engine_output` | object \| null | Output completo de test-engine, o null |
| `test_generator_output` | object \| null | Output completo de test-generator, o null |
| `test_reporter_output` | object \| null | Output completo de test-reporter, o null |

---

## Schema completo del Execution Context

Ver [wiki/qa/execution-context-schema.md](execution-context-schema.md) para el schema completo incluyendo todos los campos.

---

## Referencias

- `.claude/agents/qa-orchestrator.md` — ORC-1.2 (stage routing), ORC-1.3 (creación), ORC-6 (finalización)
- [wiki/qa/execution-context-schema.md](execution-context-schema.md) — schema y persistencia
- [wiki/qa/pipeline-routing.md](pipeline-routing.md) — routing por testability_summary.action (ORC-2.5)
