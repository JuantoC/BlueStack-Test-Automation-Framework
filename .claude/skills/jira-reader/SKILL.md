---
name: jira-reader
description: >
  Lee y consulta tickets de Jira del proyecto NAA en bluestack-cms.atlassian.net.
  Usar siempre que se necesite: buscar tickets por JQL, leer el detalle de un ticket,
  obtener sus comentarios, listar transiciones disponibles, buscar usuarios por nombre,
  extraer casos de prueba de un ticket para comparar con resultados de automatización,
  o reunir contexto antes de crear un ticket o escribir un comentario.
  Se activa con frases como: "buscá tickets de", "qué dice el NAA-XXXX", "leé el ticket",
  "cuáles son los comentarios de", "buscar por JQL", "dame el contexto del ticket",
  "encontrá tickets similares", "qué casos de prueba tiene el NAA-XXXX",
  "el pipeline necesita leer el ticket", "extraé los criterios de aceptación del NAA-XXXX".
  Esta skill es el punto de entrada de lectura para el sistema multi-agente de QA.
  jira-writer depende de sus outputs para el flujo de validación Dev_SAAS.
---

# jira-reader

Skill de **solo lectura** para el proyecto NAA. Provee contexto a jira-writer,
al pipeline automatizado de Selenium, y a agentes externos del sistema QA.

## Contexto fijo

- **Cloud ID:** `c303d73b-75df-492e-9e64-479b722035cf`
- **Proyecto:** `NAA` — `bluestack-cms.atlassian.net`
- **MCP:** configurado en `.mcp.json` (`@sooperset/mcp-atlassian`)
- **Juanto (accountId):** `712020:59e4ac7b-f44f-45cb-a444-44746cecec49`

---

## Operaciones disponibles

### OP-1: Leer ticket por key

```
Input:  issueKey (ej. NAA-4416)
Output: summary, description, status, issuetype, priority, assignee, reporter,
        parent/epic, customfield_10061 (Componente), customfield_10021 (Sprint),
        customfield_10062 (Resumen Ejecutivo), comments, issuelinks,
        fixVersions, labels, attachment
Tool:   getJiraIssue
```

Campos a solicitar siempre:
```json
["summary", "description", "status", "issuetype", "priority", "assignee",
 "reporter", "parent", "comment", "issuelinks", "customfield_10061",
 "customfield_10062", "customfield_10021", "labels", "fixVersions", "attachment"]
```

### OP-2: Buscar tickets por JQL

```
Input:  query JQL (string)
Output: lista de issues con sus campos clave
Tool:   searchJiraIssuesUsingJql
```

**JQL patterns frecuentes:**
```jql
-- Tickets QA de un componente
project = NAA AND issuetype in ("QA Bug - Front","QA Bug - Back") AND text ~ "Videos" ORDER BY created DESC

-- Tickets en estado A Versionar (listos para Dev_SAAS)
project = NAA AND status = "A Versionar" ORDER BY updated DESC

-- Buscar por comentario de validación
project = NAA AND comment ~ "Se valida sobre Master" ORDER BY updated DESC

-- Tickets de una épica
project = NAA AND parent = NAA-1977

-- Buscar por componente
project = NAA AND "Componente[Labels]" = "AI"

-- Tickets de una suite de automatización (por texto en descripción/comentario)
project = NAA AND comment ~ "sessions/UploadVideo.test.ts" ORDER BY updated DESC
```

### OP-3: Extraer casos de prueba del comentario master

Dado un ticket (generalmente en estado "A Versionar"), extraer los bullets de validación
del comentario master más reciente escrito por Juanto.

**Patrón a detectar:**
```
"Se valida sobre **Master** los cambios aplicados:"
seguido de bullet list con ✔ al final de cada ítem
```

**Output estructurado** (consumido por jira-writer MODO C y pipeline):
```json
{
  "ticket_key": "NAA-XXXX",
  "ticket_summary": "...",
  "validated_env": "master",
  "assignee": { "displayName": "...", "accountId": "..." },
  "test_cases": [
    { "description": "El error de parseo JSON no se presenta", "result": "✔" },
    { "description": "Con prompts complejos el parseo falla", "result": "✘" }
  ]
}
```

> Si hay múltiples comentarios de validación, usar el más reciente.
> Si no hay ninguno, informar al skill llamador — es un bloqueante para Dev_SAAS.

### OP-4: Listar transiciones disponibles

```
Input:  issueKey
Output: lista de { id, name } de transiciones
Tool:   getTransitionsForJiraIssue
```

Ver [`references/transitions.md`](references/transitions.md) para el mapa completo y el flujo QA estándar.

### OP-5: Lookup de usuario

```
Input:  nombre del usuario (string)
Output: accountId, displayName, emailAddress
Tool:   lookupJiraAccountId
```

### OP-6: Extraer definición de casos de prueba del ticket

Usado por el pipeline automatizado para comparar los casos definidos en el ticket
con los resultados de los tests de Selenium.

```
Input:  issueKey
Output: lista de criterios de aceptación extraídos de la descripción del ticket
Tool:   getJiraIssue (campos: description)
```

**Qué extraer de la descripción:**
- Sección "Criterios de aceptación" → bullet list
- Sección "Casos de prueba" si existe → bullet list

**Output estructurado:**
```json
{
  "ticket_key": "NAA-XXXX",
  "ticket_summary": "...",
  "criteria": [
    { "index": 1, "description": "El video se sube correctamente con formato MP4" },
    { "index": 2, "description": "El modal muestra el progreso de la subida" },
    { "index": 3, "description": "El video aparece en la grilla luego de la subida" }
  ],
  "source": "description_criteria",
  "jira_metadata": {
    "jiraSummary":      "ADMIN - Ecuavisa - pedido de fecha modificación en video",
    "ticketType":       "Story - Back",
    "ticketStatus":     "In Progress",
    "assignee":         "Paula Valentina Rodriguez Roberto",
    "component":        "Videos",
    "sprint":           "NUEVA FUNCIONALIDAD / MODULOS, 22/12/2025-31/12/2025",
    "executiveSummary": "Este es un resumen ejecutivo",
    "parentKey":        "NAA-1751",
    "linkedIssues":     ["NAA-4417", "NAA-4419", "NAA-4463", "NAA-4464", "NAA-4465", "NAA-4188"],
    "fixVersion":       "8.6.16.2.2",
    "priority":         "Medium",
    "jiraLabels":       ["Ecuavisa"],
    "jiraAttachments":  ["image-20260413-133249.png"]
  }
}
```

> `jira_metadata` sigue el contrato exacto de `TestMetadata` en `src/core/wrappers/testWrapper.ts`.
> El orquestador del pipeline puede pasarlo directamente al wrapper `runSession` para poblar Allure.
> Este output permite mapear cada criterio con el test Selenium correspondiente en `/sessions`
> y enviar el resultado a jira-writer.

---

## Modo automatizado (invocación desde pipeline)

Cuando jira-reader es invocado por el orquestador del pipeline (no por el usuario):

1. El orquestador envía un input estructurado con `operation` y `ticket_key`
2. jira-reader ejecuta la operación correspondiente
3. Retorna el output schema definido en el contrato multi-agente

**Operaciones soportadas en modo automatizado:**

| `operation` | OP equivalente | Uso típico |
|-------------|----------------|------------|
| `read_ticket` | OP-1 | Leer contexto completo del ticket |
| `extract_test_cases` | OP-3 | Obtener casos del comentario master para Dev_SAAS |
| `extract_criteria` | OP-6 | Obtener criterios de aceptación para mapear con tests |
| `search_jql` | OP-2 | Buscar tickets relacionados |
| `list_transitions` | OP-4 | Verificar transiciones disponibles antes de actuar |

Ver [`references/pipeline-schema.md`](references/pipeline-schema.md) para el contrato de input/output.

---

## Output contract (para integración multi-agente)

Cuando jira-reader es invocado por otro agente o pipeline, el output sigue este schema:

```json
{
  "schema_version": "2.0",
  "source_skill": "jira-reader",
  "operation": "read_ticket | search_jql | extract_test_cases | extract_criteria | list_transitions | lookup_user",
  "timestamp": "ISO-8601",
  "project": "NAA",
  "data": { }
}
```

El campo `data` contiene el payload específico de la operación (ver schemas de cada OP arriba).

---

## Referencias
- [`references/transitions.md`](references/transitions.md) → IDs y nombres de todas las transiciones del proyecto NAA, flujo QA estándar
- [`references/pipeline-schema.md`](references/pipeline-schema.md) → contrato de input/output para invocación desde pipeline