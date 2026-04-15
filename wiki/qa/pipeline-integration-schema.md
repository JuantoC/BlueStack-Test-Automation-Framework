---
source: .claude/skills/jira-reader/references/pipeline-schema.md + .claude/skills/jira-writer/references/pipeline-schema.md
last-updated: 2026-04-15
---

# Pipeline Integration Schema — Contrato completo

Documenta el contrato entre el agente test-reporter y las skills jira-reader/jira-writer.

## Contexto

Define el contrato de comunicación entre el agente automatizado de pruebas y las skills `jira-reader` / `jira-writer`.

El qa-orchestrator invoca `jira-reader` y `jira-writer` como pasos distintos del mismo agente:

```
1. jira-reader OP-6 → extraer criterios del ticket
2. Selenium runner → ejecutar tests
3. jira-reader OP-3 → extraer casos del comentario master (si es Dev_SAAS)
4. jira-writer MODO F → procesar resultados y actualizar Jira
```

---

## Input: qa-orchestrator → jira-reader

```json
{
  "schema_version": "3.0",
  "source_agent": "selenium-orchestrator",
  "operation": "extract_criteria",
  "ticket_key": "NAA-XXXX"
}
```

### Operaciones soportadas

| `operation` | OP equivalente | Cuándo el orquestador la necesita |
|-------------|----------------|----------------------------------|
| `read_ticket` | OP-1 | Leer contexto completo antes de cualquier acción |
| `extract_test_cases` | OP-3 | Antes de `validate_devsaas` — necesita casos del master |
| `extract_criteria` | OP-6 | Antes de ejecutar los tests — necesita criterios del ticket |
| `search_jql` | OP-2 | Buscar tickets relacionados por componente o suite |
| `list_transitions` | OP-4 | Verificar transiciones disponibles para el ticket |

### Output: jira-reader → qa-orchestrator

**OP-6 / extract_criteria**
```json
{
  "schema_version": "3.0",
  "source_skill": "jira-reader",
  "operation": "extract_criteria",
  "timestamp": "2026-04-13T10:30:00Z",
  "project": "NAA",
  "data": {
    "ticket_key": "NAA-XXXX",
    "ticket_summary": "VIDEOS - El sistema de upload de videos no notifica el progreso",
    "criteria": [
      { "index": 1, "description": "El video se sube correctamente con formato MP4" },
      { "index": 2, "description": "El modal muestra el progreso de la subida" },
      { "index": 3, "description": "El video aparece en la grilla luego de la subida" }
    ],
    "source": "description_criteria",
    "component": "Videos",
    "assignee": {
      "displayName": "Paula Valentina Rodriguez Roberto",
      "accountId": "633b5c898b75455be4580f5b"
    },
    "epic_key": "NAA-1234"
  }
}
```

**OP-3 / extract_test_cases**
```json
{
  "schema_version": "3.0",
  "source_skill": "jira-reader",
  "operation": "extract_test_cases",
  "timestamp": "2026-04-13T10:30:00Z",
  "project": "NAA",
  "data": {
    "ticket_key": "NAA-XXXX",
    "ticket_summary": "...",
    "validated_env": "master",
    "assignee": { "displayName": "...", "accountId": "..." },
    "test_cases": [
      { "description": "El video se sube correctamente con formato MP4", "result": "✔" },
      { "description": "El modal muestra el progreso de la subida", "result": "✔" }
    ]
  }
}
```

**OP-1 / read_ticket**
```json
{
  "schema_version": "3.0",
  "source_skill": "jira-reader",
  "operation": "read_ticket",
  "timestamp": "2026-04-13T10:30:00Z",
  "project": "NAA",
  "data": {
    "ticket_key": "NAA-XXXX",
    "summary": "...",
    "status": "Revisión",
    "issuetype": "QA Bug - Front",
    "priority": "Medium",
    "assignee": { "displayName": "...", "accountId": "..." },
    "component": "Videos",
    "epic_key": "NAA-YYYY",
    "comments_count": 3,
    "issuelinks": []
  }
}
```

---

## Input: qa-orchestrator → jira-writer

### Campos obligatorios

```json
{
  "schema_version": "3.0",
  "source_agent": "selenium-runner",
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
  "epic_key": "NAA-XXXX",
  "jira_metadata": {
    "jiraSummary": "...",
    "ticketType": "Story - Back",
    "ticketStatus": "In Progress",
    "assignee": "...",
    "component": "Videos",
    "parentKey": "NAA-1751"
  }
}
```

> `jira_metadata` es provisto por `jira-reader OP-6` y sigue el contrato exacto de
> `TestMetadata` en `src/core/wrappers/testWrapper.ts`.

### test_result con error

```json
{
  "test_name": "should show upload progress modal",
  "description": "El modal muestra el progreso de la subida",
  "result": "✘",
  "duration_ms": 15234,
  "error_message": "TimeoutError: Element not interactable",
  "stacktrace": "TimeoutError: Waiting for element to be visible\n  at UploadVideoModal.waitForProgressBar (UploadVideoModal.ts:45)",
  "screenshot_path": "/tmp/screenshots/upload_modal_failure.png",
  "log_excerpt": "[WARN] waitForElement timeout after 10000ms — selector: .upload-progress-bar"
}
```

### Valores de `operation`

| Valor | Qué hace jira-writer | Flujo en SKILL.md |
|-------|----------------------|-------------------|
| `validate_master` | Comenta resultado de validación en Master + transiciona | MODO B |
| `validate_devsaas` | Lee casos del master (jira-reader OP-3), comenta Dev_SAAS + transiciona o crea bugs | MODO C → MODO D |
| `create_bug` | Crea un QA Bug ticket desde los datos del test fallido | MODO A |
| `add_observation` | Agrega un comentario informativo sin cambiar el estado del ticket | — |

### Valores de `environment`

| Valor | Descripción |
|-------|-------------|
| `master` | Entorno de desarrollo (`.amplifyapp.com`) |
| `dev_saas` | Pre-productivo. Requiere `prerelease_version`. |
| `[nombre-cliente]` | Entorno dedicado a un cliente. Usar el nombre literal. |

### Valores de `assignee_hint`

| Valor | Assignee resuelto | accountId |
|-------|-------------------|-----------|
| `frontend` | Paula Rodriguez | `633b5c898b75455be4580f5b` |
| `backend` | Verónica Tarletta | `5c51d02898c1ac41b4329be3` |
| `editor` | Claudia Tobares | `5c1d65c775b0e95216e8e175` |
| omitido | Inferir del componente o preguntar | — |

### Output: jira-writer → qa-orchestrator

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

## Ejemplo de flujo completo del orquestador

### Etapa 1: Obtener criterios del ticket antes de ejecutar tests

```json
// Input al orquestador
{ "ticket_key": "NAA-4416", "action": "run_and_validate" }

// Orquestador llama a jira-reader
{ "schema_version": "3.0", "source_agent": "selenium-orchestrator", "operation": "extract_criteria", "ticket_key": "NAA-4416" }
```

### Etapa 2-3: Mapear criterios y ejecutar tests

El orquestador mapea cada criterio con el test en `/sessions` que lo cubre, ejecuta la suite y colecta `test_results[]` con ✔/✘ por cada criterio.

### Etapa 4: Enviar resultados a jira-writer

```json
{
  "schema_version": "3.0",
  "source_agent": "selenium-runner",
  "operation": "validate_master",
  "ticket_key": "NAA-4416",
  "environment": "master",
  "test_suite": "UploadVideo",
  "test_file": "sessions/UploadVideo.test.ts",
  "component": "Videos",
  "assignee_hint": "frontend",
  "suite_summary": { "total": 3, "passed": 2, "failed": 1 },
  "test_results": [
    { "test_name": "should upload MP4 video successfully", "description": "El video se sube correctamente con formato MP4", "result": "✔" },
    { "test_name": "should show upload progress modal", "description": "El modal de upload muestra el progreso correctamente", "result": "✘", "error_message": "TimeoutError: el progress bar no aparece dentro de los 10s esperados" }
  ]
}
```

---

## Notas de implementación

- El orquestador debe pasar el payload completo de una vez — el skill no llama de vuelta para pedir más datos
  (excepto si `prerelease_version` falta en `validate_devsaas`, donde sí pregunta antes de proceder)
- El campo `test_file` permite al developer ir directamente al test fallido en el repo
- El campo `log_excerpt` se incluye en la descripción de bugs bajo "Otra información"
- Los stacktraces se truncan a las primeras 5-8 líneas para mantener el ticket legible
- La MCP para Jira está configurada en `.mcp.json` del repositorio (`@sooperset/mcp-atlassian`)

---

## Idempotencia del Execution Context

El Execution Context incluye el campo `idempotency` para evitar que el pipeline
postee comentarios duplicados en Jira ante reinicios o errores parciales.

### Estructura

```json
"idempotency": {
  "already_reported": false,
  "last_comment_id": null
}
```

### Comportamiento

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `already_reported` | boolean | `true` si el comentario de validación ya fue posteado en Jira |
| `last_comment_id` | string \| null | ID del comentario Jira posteado, o `null` si aún no se posteó |

### Ciclo de vida

- **ORC-1.3 (qa-orchestrator):** inicializa ambos campos en `false` / `null` al crear el Execution Context.
- **TR-1 (test-reporter):** verifica `already_reported` antes de actuar. Si es `true` → `status: "skipped"` sin llamar a Jira.
- **TR-6 (test-reporter):** tras postear exitosamente → `already_reported: true`, `last_comment_id: "<id>"`.

> Fuente de verdad: `.claude/agents/qa-orchestrator.md` (ORC-1.3) y `.claude/agents/test-reporter.md` (TR-1, TR-6).
