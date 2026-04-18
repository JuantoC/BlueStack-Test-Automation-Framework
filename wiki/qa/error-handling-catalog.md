# Error Handling Catalog — QA Pipeline

> Fuente canónica del catálogo de errores del pipeline QA. Referenciada por `qa-orchestrator.md`, `test-engine.md`, `test-reporter.md` y `.claude/skills/pipeline-run/`.

## Errores por agente (fuente: §7.3 contratos inter-agente)

| Error | Agente que lo detecta | Acción |
|-------|----------------------|--------|
| Ticket no encontrado | ticket-analyst | Abortar + informar Orchestrator |
| Ticket sin criterios en descripción (`criteria: []`) | ticket-analyst | Leer ticket COMPLETO (comments + campos custom + título). Inferir desde contexto. Si inferencia produce ≥ 1 criterio: continuar con `source: "inferred"`. Si falla: `testable: false` + escalación explícita pidiendo al equipo descripción del flujo + pasos a reproducir |
| Ticket no testable (diseño/UX) | ticket-analyst | `testable: false` → Orchestrator escala |
| `confidence = "low"` en matching | ticket-analyst | `testable: false` → escalar, no ejecutar con baja confianza |
| `sessions_found = false` | test-engine | Señalar al Orchestrator → invocar test-generator |
| Tests no compilan (error TS) | test-engine | Abortar + devolver logs TypeScript |
| Selenium timeout / crash | test-engine | Reintentar 1 vez. Si falla: `status: error` en `test_results[]` |
| Jest no encontró el test | test-engine | Verificar nombre exacto del archivo (PascalCase.test.ts) |
| `jest --json` produce output vacío o malformado | test-engine | Verificar existencia y tamaño del outputFile antes de parsear |
| Docker Selenium Grid no disponible | test-engine | Verificar grid antes de Jest. Abortar + escalar si no responde |
| jira-writer `status: "partial"` | test-reporter | Registrar `errors[]` en Agent Execution Record. Escalar acciones fallidas |
| jira-writer `status: "error"` | test-reporter | Retry con backoff, máximo 3 intentos. Si persiste: agregar a `failed-reports.json` + escalar |
| MCP Atlassian token expirado (401/403) | ticket-analyst / test-reporter | Escalar inmediatamente. No reintentar — el token no se autorenueva |
| Falta `prerelease_version` en `validate_devsaas` | test-reporter | Bloquear — pedir versión |
| ADF inválido (campo es string) | test-reporter | BLOQUEAR — reconstruir como ADF JSON |
| No existe comentario Master previo para Dev_SAAS | test-reporter | Abortar flujo Dev_SAAS |
| Context window cercano al límite | qa-orchestrator | Dividir ejecución. Ver §11.6 en docs/architecture/qa-pipeline/ |
| `test-map.json` no encontrado | test-engine | Abortar + escalar. Verificar existencia en Fase 0 checklist |

## Errores de test-engine (tabla interna del agente)

| Error | `result` | `error_type` | Acción |
|-------|----------|--------------|--------|
| Grid no disponible | `"error"` | `"infra"` | Escribir output, `stage_status: failed`, detener |
| Session no existe en disco | — | — | Remover de lista; si vacía → `sessions_found: false` |
| Jest falla por error de sintaxis | `"error"` | `"app"` | Capturar stderr, escribir en `failure_summary` |
| Jest retorna `numFailedTests > 0` | `"failed"` | `"app"` | Parsear y escribir `failure_summary` |
| `outputFile` no creado tras ejecución | `"error"` | `"infra"` | Jest no corrió — reportar con stderr |
| Execution Context no encontrado | — | — | Fallar con error explícito |
| `CLIENTE_BASE_URL` ausente o comentada en `.env` con `environment=[cliente]` | `"error"` | `"infra"` | Abortar antes de ejecutar Jest |

> **Distinción infra vs. app:** `ECONNREFUSED` / timeout de Selenium = `error_type: "infra"`. Assertion failure o excepción en test = `error_type: "app"`.

## Guía de resolución por `error_type` (fuente: pipeline-run skill)

| `error_type` | Causa probable | Guía |
|---|---|---|
| `DockerNotAvailable` | Docker Grid no levantado | Ejecutar `docker compose up -d --wait`. Verificar con `docker ps`. |
| `JiraConnectionError` | MCP Atlassian no responde | Verificar con `atlassianUserInfo`. Si falla, reiniciar sesión de Claude. |
| `TestTimeout` | Docker Grid sobrecargado o test colgado | Esperar 2-3 minutos y reintentar. Si persiste, revisar `docker logs selenium-hub`. |
| `SessionFileError` | Archivo `.test.ts` con error de sintaxis o import | Verificar imports con extensión `.js` (requisito ESM). |
| `GridNodeUnavailable` | No hay nodos disponibles en el Grid | Escalar nodos: `docker compose scale chrome=3`. |

## Dead Letter Queue

Payloads que no llegaron a Jira se almacenan en `pipeline-logs/failed-reports.json` para reintento manual.

## Ver también

- `wiki/core/docker-grid.md` — setup y diagnóstico del Selenium Grid en WSL2
- `wiki/qa/execution-context-schema.md` — campos `error_log` y `step_log` en el context
- `docs/architecture/qa-pipeline/05-contratos-y-persistencia.md` — §7.3 manejo de errores completo
