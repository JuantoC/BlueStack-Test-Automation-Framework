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
  "un agente necesita leer el ticket", "extraé los criterios de aceptación del NAA-XXXX".
  Esta skill es el punto de entrada de lectura para el sistema multi-agente de QA.
  jira-writer depende de sus outputs para el flujo de validación Dev_SAAS.
---

# jira-reader

Skill de **solo lectura** para el proyecto NAA. Provee contexto a jira-writer,
al agente test-engine del sistema QA, y a agentes externos.

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

> **Excepción obligatoria — status "Revisión":**
> Si el ticket tiene `status.name === "Revisión"`, incluir SIEMPRE el campo `comment`
> desde el primer request (OP-1-FULL). No aplicar lazy-loading.
> **Razón:** En estado "Revisión", el hilo de comentarios documenta el fix implementado
> por el dev, el feedback recibido y el estado final del trabajo. Es la fuente más rica
> de criterios de prueba.
> Leer los comentarios cronológicamente: entender qué se implementó, qué feedback hubo,
> qué quedó listo para validar.

> **Regla de escalación:** Intentar TA-4.1 con OP-1-LIGHT. Si la descripción
> tiene sección "Criterios de aceptación" o "Casos de prueba" → usar ese resultado,
> no pedir `comment`. Solo escalar a OP-1-FULL si la descripción no tiene criterios
> estructurados y se necesita inferir desde comentarios.

> **Campos custom del equipo Bluestack (Grupo B — NAA activo):**
> El proyecto NAA tiene campos custom de deploy. Usar siempre el Grupo B:
> - **Cambios SQL** → `customfield_10066`
> - **Cambios VFS** → `customfield_10069`
> - **Comentarios Deploy** → `customfield_10071` (notas y descripción del deploy)
> - **Cambios Librerías** → `customfield_10067`
> - **Cambios TLD** → `customfield_10068`
> - **Cambios Configuración** → `customfield_10070`
>
> IDs descubiertos vía GET /rest/api/3/field — 2026-04-15.
> Referencia completa (incluyendo Grupo A legacy): `.claude/skills/jira-writer/references/field-map.md` § "Campos de deploy".

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

### OP-6: Sintetizar y estructurar criterios de prueba

Esta operación transforma la información cruda del ticket en criterios de prueba estructurados
con `test_approach` concreto. Es la operación más crítica del pipeline.

```
Input:  issueKey
Output: lista de criterios de prueba estructurados con test_approach
Tool:   getJiraIssue
Campos: ["summary", "description", "comment", "customfield_10061", "customfield_10062",
         "customfield_10021", "customfield_10066", "customfield_10069", "customfield_10071"]
```

> Los campos `customfield_10066` (Cambios SQL), `customfield_10069` (Cambios VFS) y
> `customfield_10071` (Comentarios Deploy) son los campos de deploy del Grupo B activo.
> IDs confirmados el 2026-04-15. Ver `.claude/skills/jira-writer/references/field-map.md`
> para la tabla completa incluyendo Grupo A legacy.

**Principio central — derivación de criterios desde bugs:**

Un bug describe una condición fallida. El test correcto NO es "ejecutar el flujo y ver si pasa".
El test correcto es:
1. Reproducir exactamente la condición que reporta el bug
2. Assertar que el fix la corrige

Ejemplo:
- Bug: "Campo Tema no se marca rojo cuando está vacío al hacer clic en Generar"
- Test INCORRECTO: completar el flujo de creación de nota IA → si pasa, validado
- Test CORRECTO: abrir modal → dejar Tema vacío → clic Generar → assertar que Tema tiene estado de error en DOM

**Schema de output — cada criterio es un objeto:**

```json
{
  "criterion_id": 1,
  "description": "Descripción en lenguaje natural del criterio",
  "test_approach": {
    "precondition": "Estado inicial requerido antes de la acción",
    "action": "Acción específica a ejecutar",
    "assertion": "Qué debe ser verdad después de la acción (observable en DOM)"
  },
  "criterion_type": "field_validation | functional_flow | state_transition | error_handling | visual_check | responsive | performance",
  "automatable": true,
  "reason_if_not": null
}
```

**Criterion type taxonomy:**
- `field_validation` — validaciones de formulario: campos requeridos, formatos, longitud, estados de error
- `functional_flow` — flujo end-to-end completo (happy path funcional)
- `state_transition` — cambios de estado de objetos: guardado, publicación, archivado
- `error_handling` — manejo de errores: mensajes, fallbacks, recovery
- `visual_check` — estilos y layout — evaluar `automatable` via modelo de capacidades
- `responsive` — comportamiento por viewport/dispositivo — casi siempre `automatable: false`
- `performance` — velocidad y animaciones — siempre `automatable: false`

**Proceso de clasificación de automatable:**

Para cada criterio:
1. Formular el `test_approach` completo (precondition + action + assertion)
2. Preguntarse: "¿Puedo escribir esta assertion en Selenium verificando una propiedad DOM observable?"
3. Si la assertion requiere percepción humana, entorno físico específico, o no hay propiedad DOM → `automatable: false`
4. `reason_if_not` describe la razón fundamental (no keywords)

Referencia completa del modelo de capacidades: `.claude/pipelines/ticket-analyst/references/agent-capabilities.md` (referencia histórica — los agentes actuales están en `.claude/agents/`; ningún agente activo consume este archivo directamente)

**Fuentes en orden de precedencia:**
1. Lista explícita en descripción del ticket (bullets con pasos numerados)
2. Comentarios del dev describiendo qué cambio implementó
3. Derivación por lógica inversa del bug: condición fallida → test que verifica el fix
4. Ninguna de las anteriores → `criteria_source: "none"`, `acceptance_criteria: []`, `testable: false`

**Output estructurado:**
```json
{
  "ticket_key": "NAA-XXXX",
  "ticket_summary": "...",
  "criteria": [
    {
      "criterion_id": 1,
      "description": "El video se sube correctamente con formato MP4",
      "test_approach": {
        "precondition": "Usuario autenticado en el CMS con permisos de carga",
        "action": "Seleccionar archivo MP4 válido y ejecutar el flujo de subida completo",
        "assertion": "El video aparece en la grilla con estado 'publicado' y sin mensajes de error en DOM"
      },
      "criterion_type": "functional_flow",
      "automatable": true,
      "reason_if_not": null
    }
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
> El agente orquestador puede pasarlo directamente al wrapper `runSession` para poblar Allure.
> Este output permite mapear cada criterio con el test Selenium correspondiente en `/sessions`
> y enviar el resultado a jira-writer.

---

## Token Budget — campos por costo

En agentes automatizados el contexto es el recurso más escaso. Clasificar los
campos por costo antes de hacer cualquier llamada a Jira:

| Costo | Campos | Cuándo pedir |
|-------|--------|--------------|
| **Bajo** | `summary`, `status`, `issuetype`, `priority`, `assignee`, `customfield_10061`, `parent`, `fixVersions`, `labels` | Siempre (OP-1-LIGHT) |
| **Medio** | `description`, `reporter`, `issuelinks`, `customfield_10062`, `customfield_10021` | OP-1-LIGHT (incluidos) |
| **Alto** | `comment` | Solo si descripción no tiene criterios — OP-1-FULL |
| **Alto** | `attachment` | Solo en OP-6 completo o para metadata de adjuntos |
| **Muy alto** | `expand=changelog` / `expand=renderedFields` | Nunca en agente automatizado — solo discovery manual |

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

Cuando jira-reader es invocado por un agente orquestador (no por el usuario):

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

> **Nota:** Este schema describe el output de jira-reader en **invocación interactiva**
> (usuario → jira-reader directamente, o jira-reader siendo invocado por otro agente en forma puntual).
> Es diferente del schema del pipeline automatizado.
>
> El schema del pipeline (test-reporter → jira-writer, schema v3.1) está en:
> `wiki/qa/pipeline-integration-schema.md`
>
> En ese pipeline, jira-reader no es invocado directamente por test-reporter —
> jira-writer lo usa internamente cuando lo necesita (ej. OP-3 en Dev_SAAS).

Cuando jira-reader es invocado por otro agente en modo interactivo, el output sigue este schema:

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
- [`references/pipeline-schema.md`](references/pipeline-schema.md) → contrato de input/output para invocación desde agente automatizado