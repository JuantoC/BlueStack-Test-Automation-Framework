# test-engine Output Schema

> Fuente canónica del bloque `test_engine_output` que test-engine escribe en el Execution Context. Referenciada por `test-engine.md`, `test-reporter.md` y `qa-orchestrator.md`.

## Campo `test_engine_output` en el Execution Context

Escrito en `pipeline-logs/active/<TICKET_KEY>.json` al completar el paso TE-8.

```json
"test_engine_output": {
  "pipeline_id": "...",
  "ticket_key": "NAA-XXXX",
  "execution_id": "exec-YYYYMMDD-NNN",
  "executed_at": "<ISO-8601>",
  "mode_used": "discover_and_run | run_existing",
  "environment": "master | dev_saas | [cliente]",
  "grid": true,
  "headless": true,
  "sessions_found": true,
  "result": "passed | failed | error",
  "total_tests": 1,
  "passed": 1,
  "failed": 0,
  "results": [...],
  "failure_summary": null,
  "console_errors_detected": [],
  "jest_output_path": "pipeline-logs/results-NAA-XXXX-exec-NNN.json",
  "screenshots": [
    {
      "testName": "NombreDelTest",
      "path": "allure-results/attachments/<uuid>.png",
      "capturedAt": "<ISO-8601>"
    }
  ]
}
```

> El campo `environment` siempre refleja el valor del Pipeline Trigger (`master`, `dev_saas` o `[cliente]`). Nunca el valor interno de `TARGET_ENV` (ej: `testing`). El mapping `dev_saas → TARGET_ENV=testing` es exclusivo del comando Jest.

## Campo `matched_sessions[]` (resultado de TE-4/TE-5)

Resultado del discovery de sesiones antes de la ejecución. No persiste en el Execution Context pero define qué se pasa a Jest.

Fuente: `test-map.json` → verificación física en disco → lista final de paths a ejecutar.

## Schema del array `results[]`

Cada entrada corresponde a un `assertionResult` del JSON output de Jest:

```json
{
  "session_file": "sessions/post/NewAIPost.test.ts",
  "session_name": "NewAIPost",
  "status": "pass | fail | error",
  "duration_ms": 42000,
  "failure_messages": [],
  "mapped_to_hint": "Verificar que el prompt enviado se refleja en la nota generada"
}
```

| Campo | Descripción |
|-------|-------------|
| `session_file` | Path relativo del archivo `.test.ts` |
| `session_name` | Basename sin extensión |
| `status` | `"error"` = Jest no pudo correr el archivo; `"fail"` = assertion falló; `"pass"` = OK |
| `duration_ms` | Duración en ms del `assertionResult` |
| `failure_messages` | Array de mensajes de error (vacío si `status: "pass"`) |
| `mapped_to_hint` | `test_hint[i]` del ticket-analyst si existe; `null` si no |

## Campo `failure_summary`

Presente solo si `numFailedTests > 0`. `null` en caso de éxito.

```json
{
  "test_name": "<fullName del primer test fallido>",
  "error_message": "<primera línea de failureMessages[0]>",
  "source": "<primera línea del stack que contenga src/>",
  "stack": "<primeras 5 líneas del stack completo>"
}
```

## Campo `console_errors_detected`

Reservado en el schema. La lógica de captura no está implementada. Producir siempre `console_errors_detected: []` hasta confirmar el schema de Jest v29.7.0.

## Campo `screenshots[]`

Capturas generadas por Allure en `allure-results/attachments/` durante fallos Jest.

- Si no hay fallos → `screenshots: []`
- Si el directorio no existe o está vacío → `screenshots: []` (nunca error)
- Cada entrada: `{ testName, path, capturedAt }`

## Valores de `result`

| Valor | Condición |
|-------|-----------|
| `"passed"` | Todos los tests pasan |
| `"failed"` | Al menos 1 test falla (assertion failure) |
| `"error"` | Error de infra, compilación, o `sessions_found: false` |

Cuando `sessions_found: false`: `result: "error"`, `error_type: "no_sessions"`.

## Modos de operación

| Modo | Cuándo | Qué hace |
|------|--------|----------|
| `discover_and_run` | Default | Busca en `test-map.json`, verifica paths en disco, ejecuta |
| `run_existing` | Re-test (Orchestrator ya conoce los session paths) | Ejecuta sin discovery |

## Ver también

- `wiki/qa/execution-context-schema.md` — schema completo del Execution Context
- `wiki/qa/environments.md` — tabla de mapping `environment → TARGET_ENV`
- `docs/architecture/qa-pipeline/02-arquitectura-agentes.md` — §3.3 test-engine
