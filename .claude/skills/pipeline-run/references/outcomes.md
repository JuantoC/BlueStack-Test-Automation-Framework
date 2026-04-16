# Pipeline Run — Mapeo de outcomes a ciclos de aprendizaje

Cuando el orquestador retorna, leer el campo `outcome` del execution context y aplicar el ciclo correspondiente.

| `outcome` | Significado | Ciclo en PR-5 |
|---|---|---|
| `"success"` | Tests corrieron, pasaron o fallaron, y se reportó en Jira | Ciclo de éxito |
| `"no_sessions"` | No hay archivos `.test.ts` que cubran este flujo | Ciclo de brecha de cobertura |
| `"human_escalation"` | Ticket sin criterios de aceptación claros o criterios ambiguos | Ciclo de escalación humana |
| `"non_automatable"` | Criterios existen pero requieren validación manual irreducible | Ciclo no-automatizable |
| `"wrong_status"` | Ticket en estado Jira incorrecto para el ambiente solicitado | Informar y cerrar — sin ciclo de aprendizaje |
| `"error"` | Error de infraestructura (Docker, MCP, Jest) durante la ejecución | Ciclo de error |
| `"skipped"` | Pipeline ya fue ejecutado anteriormente (`already_reported: true`) | Informar al usuario el resultado previo — sin re-ejecución |

## Dónde leer el outcome

```
pipeline-logs/completed/<ticket_key>.json  →  campo: milestone_notes.outcome
pipeline-logs/active/<ticket_key>.json     →  si el orquestador falló antes de mover a completed/
```
