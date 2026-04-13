# Pipeline Schema — Contrato de integración automatizada

## Contexto

Define el contrato de comunicación entre el pipeline de pruebas automatizadas
(framework Selenium en `/sessions`) y las skills `jira-writer` / `jira-reader`.

El pipeline consiste en un agente orquestador que:
1. Recibe el evento de fin de suite de tests
2. Construye el payload de input
3. Invoca `jira-reader` (para leer contexto del ticket) y/o `jira-writer` (para escribir)
4. Recibe el output estructurado y registra el resultado

---

## Input Schema (pipeline → jira-writer)

### Campos obligatorios

```json
{
  "schema_version": "2.0",
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
  "suite_summary": {
    "total": 5,
    "passed": 4,
    "failed": 1
  },
  "assignee_hint": "frontend",
  "component": "Videos",
  "epic_key": "NAA-XXXX",
  "jira_metadata": {
    "jiraSummary":      "ADMIN - Ecuavisa - pedido de fecha modificación en video",
    "ticketType":       "Story - Back",
    "ticketStatus":     "In Progress",
    "assignee":         "Paula Valentina Rodriguez Roberto",
    "component":        "Videos",
    "sprint":           "NUEVA FUNCIONALIDAD / MODULOS, 22/12/2025-31/12/2025",
    "executiveSummary": "Este es un resumen ejecutivo",
    "parentKey":        "NAA-1751",
    "linkedIssues":     ["NAA-4417", "NAA-4419", "NAA-4463"],
    "fixVersion":       "8.6.16.2.2",
    "priority":         "Medium",
    "jiraLabels":       ["Ecuavisa"],
    "jiraAttachments":  ["image-20260413-133249.png"]
  }
}
```

> `jira_metadata` es provisto por `jira-reader OP-6` y sigue el contrato exacto de
> `TestMetadata` en `src/core/wrappers/testWrapper.ts`. El orquestador lo pasa al
> pipeline para que los tests lo inyecten en Allure vía `runSession`.
```

### test_result con error (campos adicionales cuando result = "✘")

```json
{
  "test_name": "should show upload progress modal",
  "description": "El modal muestra el progreso de la subida",
  "result": "✘",
  "duration_ms": 15234,
  "error_message": "TimeoutError: Element not interactable — el progress bar no aparece dentro de los 10s esperados",
  "stacktrace": "TimeoutError: Waiting for element to be visible\n  at UploadVideoModal.waitForProgressBar (UploadVideoModal.ts:45)\n  at UploadVideoModal.uploadAndVerify (UploadVideoModal.ts:67)",
  "screenshot_path": "/tmp/screenshots/upload_modal_failure.png",
  "log_excerpt": "[WARN] waitForElement timeout after 10000ms — selector: .upload-progress-bar\n[ERROR] Test failed: El modal muestra el progreso de la subida"
}
```

---

## Valores posibles de `operation`

| Valor | Qué hace jira-writer | Flujo en SKILL.md |
|-------|----------------------|-------------------|
| `validate_master` | Comenta resultado de validación en Master + transiciona | MODO B |
| `validate_devsaas` | Lee casos del master (jira-reader OP-3), comenta Dev_SAAS + transiciona o crea bugs | MODO C → MODO D |
| `create_bug` | Crea un QA Bug ticket desde los datos del test fallido | MODO A |
| `add_observation` | Agrega un comentario informativo sin cambiar el estado del ticket | — |

## Valores posibles de `environment`

| Valor | Descripción |
|-------|-------------|
| `master` | Entorno de desarrollo (`.amplifyapp.com`) |
| `dev_saas` | Pre-productivo. Requiere `prerelease_version`. |
| `[nombre-cliente]` | Entorno dedicado a un cliente. Usar el nombre literal. |

---

## Valores posibles de `assignee_hint`

| Valor | Assignee resuelto | accountId |
|-------|-------------------|-----------|
| `frontend` | Paula Rodriguez | `633b5c898b75455be4580f5b` |
| `backend` | Verónica Tarletta | `5c51d02898c1ac41b4329be3` |
| `editor` | Claudia Tobares | `5c1d65c775b0e95216e8e175` |
| omitido | Inferir del componente o preguntar | — |

---

## Output Schema (jira-writer → pipeline)

El skill SIEMPRE devuelve un objeto de respuesta al terminar, incluso en caso de error parcial.

### Éxito total

```json
{
  "schema_version": "2.0",
  "skill": "jira-writer",
  "status": "success",
  "operation": "validate_master",
  "ticket_key": "NAA-XXXX",
  "actions_taken": [
    {
      "action": "comment_posted",
      "ticket": "NAA-XXXX",
      "comment_id": "12345"
    },
    {
      "action": "transition_applied",
      "ticket": "NAA-XXXX",
      "from_status": "Revisión",
      "to_status": "A Versionar",
      "transition_id": "42"
    }
  ],
  "errors": []
}
```

### Éxito parcial (algunos bugs creados, algunos fallaron)

```json
{
  "schema_version": "2.0",
  "skill": "jira-writer",
  "status": "partial",
  "operation": "validate_devsaas",
  "ticket_key": "NAA-XXXX",
  "actions_taken": [
    {
      "action": "comment_posted",
      "ticket": "NAA-XXXX"
    },
    {
      "action": "bug_created",
      "ticket": "NAA-4460",
      "from_test": "should show upload progress modal",
      "link": "https://bluestack-cms.atlassian.net/browse/NAA-4460"
    }
  ],
  "errors": [
    {
      "action": "link_tickets",
      "error": "No se pudo crear el link Relates — ticket NAA-XXXX no encontrado"
    }
  ]
}
```

### Error (campos obligatorios faltantes)

```json
{
  "schema_version": "2.0",
  "skill": "jira-writer",
  "status": "error",
  "operation": null,
  "ticket_key": null,
  "actions_taken": [],
  "errors": [
    {
      "field": "ticket_key",
      "error": "Campo obligatorio faltante en el payload"
    },
    {
      "field": "test_results",
      "error": "Array vacío — no hay resultados que procesar"
    }
  ]
}
```

---

## Ejemplo completo de invocación

### Input: pipeline envía resultados de suite de Upload de Videos

```json
{
  "schema_version": "2.0",
  "source_agent": "selenium-runner",
  "operation": "validate_master",
  "ticket_key": "NAA-4416",
  "environment": "master",
  "environment_url": "https://master.d1c5iid93veq15.amplifyapp.com/videos",
  "test_suite": "UploadVideo",
  "test_file": "sessions/UploadVideo.test.ts",
  "component": "Videos",
  "assignee_hint": "frontend",
  "suite_summary": {
    "total": 3,
    "passed": 2,
    "failed": 1
  },
  "test_results": [
    {
      "test_name": "should upload MP4 video successfully",
      "description": "El video se sube correctamente con formato MP4",
      "result": "✔",
      "duration_ms": 8423
    },
    {
      "test_name": "should upload MOV video successfully",
      "description": "El video se sube correctamente con formato MOV",
      "result": "✔",
      "duration_ms": 9102
    },
    {
      "test_name": "should show upload progress modal",
      "description": "El modal de upload muestra el progreso correctamente",
      "result": "✘",
      "duration_ms": 15234,
      "error_message": "TimeoutError: el progress bar no aparece dentro de los 10s esperados",
      "stacktrace": "TimeoutError: Waiting for element\n  at UploadVideoModal.waitForProgressBar (UploadVideoModal.ts:45)",
      "log_excerpt": "[WARN] waitForElement timeout after 10000ms — selector: .upload-progress-bar"
    }
  ]
}
```

### Output esperado

```json
{
  "schema_version": "2.0",
  "skill": "jira-writer",
  "status": "success",
  "operation": "validate_master",
  "ticket_key": "NAA-4416",
  "actions_taken": [
    {
      "action": "comment_posted",
      "ticket": "NAA-4416"
    },
    {
      "action": "transition_applied",
      "ticket": "NAA-4416",
      "to_status": "FEEDBACK",
      "transition_id": "2"
    }
  ],
  "errors": []
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
