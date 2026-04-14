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
        customfield_10062 (Resumen Ejecutivo), issuelinks, fixVersions, labels
Tool:   getJiraIssue
```

#### OP-1-LIGHT (default — siempre usar primero)

Campos baratos. No incluye `comment` ni `attachment`.
Usar para: clasificación inicial, lectura rápida, chequeos de estado.

```json
["summary", "description", "status", "issuetype", "priority", "assignee",
 "reporter", "parent", "issuelinks", "customfield_10061",
 "customfield_10062", "customfield_10021", "labels", "fixVersions"]
```

#### OP-1-FULL (solo cuando OP-1-LIGHT no alcanza)

Agrega `comment` y `attachment`. Usar únicamente si la descripción no tiene
criterios de aceptación y se necesita inferir desde comentarios, o si se
necesita metadata de adjuntos para OP-6.

```json
["summary", "description", "status", "issuetype", "priority", "assignee",
 "reporter", "parent", "comment", "issuelinks", "customfield_10061",
 "customfield_10062", "customfield_10021", "labels", "fixVersions", "attachment"]
```

> **Regla de escalación:** Intentar TA-4.1 con OP-1-LIGHT. Si la descripción
> tiene sección "Criterios de aceptación" o "Casos de prueba" → usar ese resultado,
> no pedir `comment`. Solo escalar a OP-1-FULL si la descripción no tiene criterios
> estructurados y se necesita inferir desde comentarios.

> **Campos custom del equipo Bluestack** (IDs pendientes de discovery):
> El proyecto NAA tiene campos custom creados por el equipo:
> - **"deploy"** → descripción de los cambios desplegados en el ticket
> - **"cambios SQL"** → scripts de base de datos asociados al ticket
> - **"cambios VFS"** → archivos de configuración o assets modificados
>
> Para descubrir los IDs exactos: llamar `getJiraIssue` sobre un ticket con esos campos
> completados (sin filtrar `fields`) y listar todos los `customfield_XXXXX` retornados.
> Una vez conocidos, agregar sus IDs al array `fields` de OP-1 y OP-6.
> Mientras no se descubran, incluir en el array el campo `"*all"` cuando se necesite
> inferir criterios desde esos campos específicos.

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

### OP-6: Sintetizar criterios de prueba desde el ticket completo

Usado por el pipeline automatizado para producir los casos de prueba a ejecutar.
**Siempre leer TODO el contenido del ticket** — muchos tickets tienen información clave
en comentarios y campos custom, no solo en la descripción.

```
Input:  issueKey
Output: lista de criterios de prueba sintetizados desde TODO el contenido del ticket
Tool:   getJiraIssue
Campos: ["summary", "description", "comment", "customfield_10061", "customfield_10062",
         "customfield_10021", "customfield_deploy", "customfield_sql_changes",
         "customfield_vfs_changes"]
```

> Los IDs exactos de los campos custom "deploy", "cambios SQL" y "cambios VFS" deben
> descubrirse ejecutando OP-1 sobre un ticket real y observando todos los `customfield_*`
> retornados. Usar `getJiraIssue` sin filtrar campos en esa discovery run.

**Estrategia de extracción (en orden de precedencia):**

1. **Sección "Criterios de aceptación"** en descripción → `source: "extracted"`
2. **Sección "Casos de prueba"** en descripción (si existe) → `source: "extracted"`
3. **Comentarios de devs/QA** con comportamiento descrito o pasos reproducibles → `source: "inferred"`
4. **Campos custom:** deploy (qué cambios se desplegaron), cambios SQL (impacto en BD),
   cambios VFS (archivos de configuración/assets modificados) → `source: "inferred"`
5. **Título + Resumen Ejecutivo** (`customfield_10062`) para entender el flujo principal → `source: "inferred"`

**Si ninguna fuente produce ≥ 1 criterio accionable:**
- Retornar `criteria: []`, `source: "none"`
- El pipeline debe marcar `testable: false`, `human_escalation: true`
- Mensaje de escalación: "Ticket sin criterios de prueba ni descripción suficiente para inferir
  el flujo. Adjuntar: comportamiento esperado, pasos para reproducir, o criterios de aceptación."

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
  "source": "extracted | inferred | none",
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

## Token Budget — campos por costo

En pipelines automatizados el contexto es el recurso más escaso. Clasificar los
campos por costo antes de hacer cualquier llamada a Jira:

| Costo | Campos | Cuándo pedir |
|-------|--------|--------------|
| **Bajo** | `summary`, `status`, `issuetype`, `priority`, `assignee`, `customfield_10061`, `parent`, `fixVersions`, `labels` | Siempre (OP-1-LIGHT) |
| **Medio** | `description`, `reporter`, `issuelinks`, `customfield_10062`, `customfield_10021` | OP-1-LIGHT (incluidos) |
| **Alto** | `comment` | Solo si descripción no tiene criterios — OP-1-FULL |
| **Alto** | `attachment` | Solo en OP-6 completo o para metadata de adjuntos |
| **Muy alto** | `expand=changelog` / `expand=renderedFields` | Nunca en pipeline — solo discovery manual |

**Regla para OP-2 (JQL search):**
Cuando se hace una búsqueda exploratoria (¿qué tickets existen de este componente?),
pedir solo campos baratos. Nunca pedir `comment` en una búsqueda JQL.

```json
// OP-2 exploración — campos mínimos
["summary", "status", "issuetype", "customfield_10061", "priority", "fixVersions"]
```

**Regla para OP-2 con resultados amplios (>5 tickets esperados):**
Usar `maxResults: 5` en la primera búsqueda. Si se necesita más, refinar el JQL
antes de aumentar el límite. Nunca hacer `maxResults: 20` sin filtro de componente.

---

## Manejo de respuestas grandes (overflow de tokens)

### Cuándo ocurre

Cuando `getJiraIssue` devuelve un error del tipo:

```
Error: result (XX,XXX characters) exceeds maximum allowed tokens.
Output has been saved to /home/jutoc/.claude/projects/.../{uuid}/tool-results/mcp-...-getJiraIssue-{timestamp}.txt
```

Esto pasa cuando el ticket tiene mucho historial de cambios (`changelog`), attachments,
comentarios extensos, o cuando se usan flags de expansión (`expand=changelog,renderedFields,...`).
El caso real que originó esta regla fue **NAA-4037** con 81.577 caracteres.

### Regla 1 — Prevención (90% de los casos)

Para **OP-1 a OP-6**, nunca usar el parámetro `expand`. Solo pedir los campos necesarios
via el array `fields`. Esto evita el problema en la mayoría de tickets normales.

```
✅ Correcto: fields = ["summary", "status", "assignee", ...]
❌ Incorrecto: expand = "changelog,renderedFields,names,schema,versionedRepresentations"
```

### Regla 2 — Detección y respuesta cuando ocurre

Cuando el error aparece de todas formas:

1. **Extraer el path del archivo** del mensaje de error — siempre termina en `getJiraIssue-{timestamp}.txt`
2. **Lanzar un sub-agente** (tipo `Explore` para análisis, tipo general para extracción estructurada)
3. **El sub-agente lee el archivo en chunks** usando `Read` con `offset` y `limit` hasta llegar al EOF
4. **Devolver solo los campos necesarios** — no el archivo completo

### Procedimiento de lanzamiento del sub-agente

```
Agent({
  subagent_type: "Explore",  // o general-purpose si necesita lógica de extracción compleja
  description: "Extraer campos de ticket Jira desde archivo de respuesta grande",
  prompt: `
    Lee el archivo en {FILE_PATH} completo en chunks usando Read con offset/limit incremental
    hasta llegar al final (el archivo puede tener +80k caracteres).
    
    Extrae SOLAMENTE estos campos del JSON del ticket:
    - summary, status.name, issuetype.name, priority.name
    - assignee.displayName, assignee.accountId
    - parent.key
    - customfield_10061 (Componente)
    - customfield_10021 (Sprint)
    - customfield_10062 (Resumen Ejecutivo)
    - fixVersions[].name
    - labels[]
    - issuelinks[].outwardIssue.key y inwardIssue.key
    - attachment[].filename
    
    Retorná un JSON con exactamente esos campos y sus valores actuales del ticket.
    No incluyas el changelog ni los renderedFields.
    Leé el archivo ENTERO antes de responder.
  `
})
```

> El sub-agente corre en contexto aislado — el archivo completo no contamina el contexto principal.

### Regla 3 — Cuándo sí usar expansión completa (y esperar el overflow)

Solo cuando el objetivo **explícito** es extraer metadata completa del ticket para construir
`jira_metadata` (OP-6 con `expand`). En ese caso, planificar el sub-agente desde el inicio:

```
Paso 1: Llamar getJiraIssue con expand=changelog,renderedFields,names,schema,...
Paso 2: Esperar el error de overflow — es el comportamiento esperado
Paso 3: Extraer el file_path del mensaje de error
Paso 4: Lanzar sub-agente Explore con el prompt de extracción estructurada
Paso 5: Usar el output del sub-agente como jira_metadata
```

No reintentar `getJiraIssue` sin el `expand` después del overflow — lanzar el sub-agente directamente.

### Campos que típicamente causan overflow

| Causa | Señal | Mitigación |
|-------|-------|------------|
| Historial largo (`changelog`) | Ticket con >30 transiciones/ediciones | Nunca incluir `expand=changelog` salvo que sea necesario |
| Descripción larga (ADF) | Pedidos con specs extensas | `responseContentFormat: "markdown"` en vez de `"adf"` |
| Muchos comentarios | Tickets de soporte con conversaciones largas | Separar `comment` en llamada aparte si es el único campo necesario |
| Attachments con metadata | Tickets con muchos adjuntos y sus metadatos | No pedir `attachment` salvo en OP-6 completo |

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