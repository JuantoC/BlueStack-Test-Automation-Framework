# qa-orchestrator Trigger Schema

> Fuente canónica del schema de entrada del qa-orchestrator y del payload de error estándar. Referenciada por `qa-orchestrator.md` y `docs/architecture/qa-pipeline/03-triggers-y-flujos.md`.

## Pipeline Trigger (input del qa-orchestrator)

Schema que recibe el qa-orchestrator cuando es invocado:

```json
{
  "action": "process_ticket",
  "ticket_key": "NAA-XXXX",
  "environment": "master | dev_saas",
  "requested_by": "manual | poll | ci",
  "prerelease_version": null
}
```

| Campo | Descripción |
|-------|-------------|
| `action` | Siempre `"process_ticket"` para flujos normales |
| `ticket_key` | Key del ticket Jira a procesar (ej. NAA-4467) |
| `environment` | Ambiente de validación. Default: `"master"`. Si se omite, se deriva desde el estado del ticket (ver tabla abajo) |
| `requested_by` | Origen del trigger. Default: `"manual"`. Valores: `"manual"` \| `"poll"` \| `"ci"` |
| `prerelease_version` | Versión de preliberación. **Obligatorio** si `environment: "dev_saas"`. Formato: `"8.6.16.1.5"` |

**Trigger manual desde conversación:**
```
Ejecutar el qa-orchestrator para el ticket NAA-XXXX en ambiente master.
```

## Derivación automática de `environment`

Cuando el input no incluye `environment` (o es null/vacío), el orchestrator lee el estado del ticket vía MCP y aplica:

| Estado Jira del ticket | `environment` derivado |
|------------------------|------------------------|
| `Revisión` | `"master"` |
| `Done` | `"dev_saas"` |
| Cualquier otro | **Error — abortar** |

## Error Response Payload (schema estándar de abort)

Usado en todos los puntos de abort del orchestrator (ORC-1.0, ORC-1.0b y otros). El mismo schema se repite en todas las salidas de error:

```json
{
  "stage": "done",
  "stage_status": "error",
  "outcome": "<código de outcome>",
  "reason": "<mensaje descriptivo>"
}
```

| Campo | Descripción |
|-------|-------------|
| `stage` | Siempre `"done"` en el payload de abort |
| `stage_status` | Siempre `"error"` |
| `outcome` | Código de resultado (ver tabla abajo) |
| `reason` | Descripción legible del motivo |

### Valores de `outcome` en errores de abort

| `outcome` | Cuándo se produce |
|-----------|-------------------|
| `"wrong_status"` | Estado del ticket no permite derivar el ambiente automáticamente |
| `"missing_env_config"` | `CLIENTE_BASE_URL` no configurada en `.env` para ambiente `[cliente]` |
| `"already_reported"` | `already_reported: true` y `requested_by != "manual"` |
| `"pipeline_already_finalized"` | Context con `stage: "done"` y outcome terminal, trigger no manual |
| `"human_escalation"` | Ticket no testable o confidence baja |
| `"non_automatable"` | Todos los criterios son no automatizables |
| `"no_sessions"` | `sessions_found: false` y test-generator no habilitado aún |
| `"auto_generated_dry_run_failed"` | Dry-run del test generado falló |

## Trigger Event Schema (sistema de eventos — §4.2)

Schema completo del evento tal como lo define el sistema de polling/CI:

```json
{
  "event_id": "evt-YYYYMMDD-NNN",
  "timestamp": "<ISO-8601>",
  "trigger_type": "manual | polling | cron | ci_hook",
  "event_type": "test_request | status_change | dev_comment | scheduled_sweep",
  "ticket_key": "NAA-4429",
  "metadata": {
    "from_status": "En desarrollo",
    "to_status": "A Versionar",
    "actor": "Paula Rodriguez",
    "requested_env": "master | dev_saas",
    "comment_id": null
  }
}
```

> Este schema es del sistema de triggers externo (T2/T3/T4/T5). El Pipeline Trigger (sección superior) es el schema simplificado que el orchestrator recibe como input directo.

## Ver también

- `wiki/qa/environments.md` — tabla de equivalencias ambiente ↔ Jira ↔ TARGET_ENV
- `wiki/qa/execution-context-schema.md` — schema del Execution Context que el orchestrator inicializa
- `docs/architecture/qa-pipeline/03-triggers-y-flujos.md` — tipos de trigger y flujos de ejecución
