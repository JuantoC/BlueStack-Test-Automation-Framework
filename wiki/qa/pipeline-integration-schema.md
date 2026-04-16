---
last-updated: 2026-04-16
---

# Pipeline Integration Schema — Contrato test-reporter ↔ jira-writer

## Contexto

Define el contrato de comunicación entre el agente `test-reporter` y la skill `jira-writer`.

**Modelo de agentes actual:**
- `qa-orchestrator` coordina invocando subagentes via `Agent({ subagent_type: "..." })`
- `ticket-analyst` lee Jira directamente via MCP (`mcp__claude_ai_Atlassian__getJiraIssue`)
- `test-engine` ejecuta Jest y escribe resultados en el Execution Context
- `test-reporter` es el **único punto de integración** con las skills Jira — llama a `jira-writer` via `Skill()`
- `jira-writer` maneja internamente `jira-reader` cuando lo necesita (ej. OP-3 en Dev_SAAS)

```
Execution Context (pipeline-logs/active/<ticket>.json)
        ↓
  test-reporter (lee context, construye payload)
        ↓
  Skill({ skill: "jira-writer", args: JSON.stringify(payload) })
        ↓
  jira-writer (postea comentario ADF, transiciona, crea bugs)
        ↓
  Output → test-reporter escribe test_reporter_output en context
```

---

## Input: test-reporter → jira-writer

### Campos obligatorios

```json
{
  "schema_version": "3.0",
  "source_agent": "test-reporter",
  "operation": "validate_master",
  "ticket_key": "NAA-XXXX",
  "environment": "master",
  "test_results": [
    {
      "test_name": "should upload video successfully",
      "description": "El video se sube correctamente con formato MP4",
      "result": "✔"
    }
  ]
}
```

### Campos opcionales (enriquecen los artefactos Jira)

```json
{
  "environment_url": "https://master.d1c5iid93veq15.amplifyapp.com",
  "prerelease_version": "8.6.16.1.5",
  "test_suite": "UploadVideo",
  "test_file": "sessions/UploadVideo.test.ts",
  "suite_summary": { "total": 5, "passed": 4, "failed": 1 },
  "assignee_hint": "frontend",
  "component": "Videos",
  "pipeline_id": "pipe-20260416-001",
  "is_pipeline_test": false,
  "idempotency": {
    "already_reported": false,
    "last_comment_id": null
  },
  "jira_metadata": {
    "jiraSummary": "...",
    "ticketType": "Story - Back",
    "ticketStatus": "Revisión",
    "assignee": "Paula Valentina Rodriguez Roberto",
    "component": "Videos",
    "parentKey": "NAA-1751"
  }
}
```

> `jira_metadata` es provisto por `ticket_analyst_output.jira_metadata` del Execution Context y sigue el contrato exacto de `TestMetadata` en `src/core/wrappers/testWrapper.ts`.

### test_result con error

```json
{
  "test_name": "should show upload progress modal",
  "description": "El modal muestra el progreso de la subida",
  "result": "✘",
  "duration_ms": 15234,
  "error_message": "TimeoutError: Element not interactable",
  "stacktrace": "TimeoutError: Waiting for element to be visible\n  at UploadVideoModal.waitForProgressBar (UploadVideoModal.ts:45)",
  "log_excerpt": "[WARN] waitForElement timeout after 10000ms — selector: .upload-progress-bar"
}
```

---

## Valores de `operation`

| Valor | Qué hace jira-writer | Flujo en SKILL.md |
|-------|----------------------|-------------------|
| `validate_master` | Comenta resultado de validación en Master + transiciona | MODO B |
| `validate_devsaas` | Lee casos del master (jira-reader OP-3 interno), comenta Dev_SAAS + transiciona o crea bugs | MODO C → MODO D |
| `escalation_comment` | Postea comentario ADF de escalación, sin transición | MODO G |
| `create_bug` | Crea un QA Bug ticket desde los datos del test fallido | MODO A |

---

## Valores de `environment`

| Valor | Descripción |
|-------|-------------|
| `master` | Entorno de desarrollo (`.amplifyapp.com`) |
| `dev_saas` | Pre-productivo. **Requiere `prerelease_version`** en el payload. |
| `[nombre-cliente]` | Entorno dedicado a un cliente. Usar el nombre literal. |

> `environment` en el payload refleja siempre el valor del Pipeline Trigger, nunca el `TARGET_ENV` interno de Jest.

---

## Valores de `assignee_hint`

| Valor | Assignee resuelto | accountId |
|-------|-------------------|-----------|
| `frontend` | Paula Rodriguez | `633b5c898b75455be4580f5b` |
| `backend` | Verónica Tarletta | `5c51d02898c1ac41b4329be3` |
| `editor` | Claudia Tobares | `5c1d65c775b0e95216e8e175` |
| omitido | Inferir del componente o preguntar | — |

---

## Output: jira-writer → test-reporter

```json
{
  "schema_version": "3.0",
  "skill": "jira-writer",
  "status": "success",
  "operation": "validate_master",
  "ticket_key": "NAA-XXXX",
  "actions_taken": [
    { "action": "comment_posted", "ticket": "NAA-XXXX", "comment_id": "12345" },
    { "action": "transition_applied", "ticket": "NAA-XXXX", "from_status": "Revisión", "to_status": "A Versionar", "transition_id": "42" }
  ],
  "errors": []
}
```

---

## Ejemplo de flujo completo — validate_master

```json
// test-reporter construye y envía:
{
  "schema_version": "3.0",
  "source_agent": "test-reporter",
  "operation": "validate_master",
  "ticket_key": "NAA-4416",
  "environment": "master",
  "test_suite": "UploadVideo",
  "test_file": "sessions/video/UploadVideo.test.ts",
  "component": "Videos",
  "assignee_hint": "frontend",
  "pipeline_id": "pipe-20260416-001",
  "suite_summary": { "total": 3, "passed": 2, "failed": 1 },
  "test_results": [
    { "test_name": "should upload MP4 video successfully", "description": "El video se sube correctamente con formato MP4", "result": "✔" },
    { "test_name": "should show upload progress modal", "description": "El modal de upload muestra el progreso correctamente", "result": "✘", "error_message": "TimeoutError: el progress bar no aparece dentro de los 10s esperados" }
  ]
}
```

---

## Payload de escalación — MODO G

Cuando `escalation_mode: true` en el Execution Context, test-reporter construye este payload:

```json
{
  "schema_version": "3.0",
  "source_agent": "test-reporter",
  "operation": "escalation_comment",
  "ticket_key": "NAA-XXXX",
  "environment": "master",
  "escalation_reason": "No fue posible extraer criterios automatizables del ticket.",
  "outcome": "human_escalation",
  "criteria_attempted": [],
  "manual_test_guide": [],
  "idempotency": { "already_reported": false, "last_comment_id": null },
  "pipeline_id": "pipe-20260416-001"
}
```

---

## Notas de implementación

- test-reporter pasa el payload completo de una vez — jira-writer no hace callbacks para pedir más datos (excepto si `prerelease_version` falta en `validate_devsaas`, donde aborta con error)
- El campo `test_file` permite al developer ir directamente al test fallido en el repo
- El campo `log_excerpt` se incluye en la descripción de bugs bajo "Otra información"
- Los stacktraces se truncan a las primeras 5-8 líneas para mantener el ticket legible
- La MCP para Jira está configurada en `.mcp.json` del repositorio (`@sooperset/mcp-atlassian`)

### Mapping de customfields de deploy

Para el mapping completo de los campos custom de deploy (Cambios SQL, Cambios Librerías, Cambios TLD, Cambios VFS, Cambios Configuración, Comentarios Deploy) incluyendo los dos grupos históricos (Grupo A legacy `customfield_10036-10041` y Grupo B NAA activo `customfield_10066-10071`), ver:

→ `.claude/skills/jira-writer/references/field-map.md` — sección "Campos de deploy (dos grupos históricos)"

> Regla: siempre usar el Grupo B (`customfield_10066-10071`) en tickets nuevos. El Grupo A es legacy.

---

## Idempotencia del Execution Context

El Execution Context incluye el campo `idempotency` para evitar que el pipeline postee comentarios duplicados ante reinicios o errores parciales.

```json
"idempotency": {
  "already_reported": false,
  "last_comment_id": null
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `already_reported` | boolean | `true` si el comentario ya fue posteado en Jira (modo normal o escalación) |
| `last_comment_id` | string \| null | ID del comentario Jira posteado, o `null` si aún no se posteó |

**Ciclo de vida:**
- **ORC-1.3 (qa-orchestrator):** inicializa ambos campos en `false` / `null` al crear el Execution Context.
- **TR-1 / TR-E.1 (test-reporter):** verifica `already_reported` antes de actuar. Si es `true` → `status: "skipped"`.
- **TR-6 / TR-E.4 (test-reporter):** tras postear exitosamente → `already_reported: true`, `last_comment_id: "<id>"`.

> Fuente de verdad: `.claude/agents/qa-orchestrator.md` (ORC-1.3) y `.claude/agents/test-reporter.md` (TR-1, TR-6, TR-E).
