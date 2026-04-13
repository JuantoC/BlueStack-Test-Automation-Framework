---
name: jira-reader
description: >
  Lee y consulta tickets de Jira del proyecto NAA en bluestack-cms.atlassian.net.
  Usar siempre que se necesite: buscar tickets por JQL, leer el detalle de un ticket,
  obtener sus comentarios, listar transiciones disponibles, buscar usuarios por nombre,
  o reunir contexto de tickets existentes antes de crear uno nuevo o escribir un comentario.
  Se activa con frases como: "buscá tickets de", "qué dice el NAA-XXXX", "leé el ticket",
  "cuáles son los comentarios de", "buscar por JQL", "dame el contexto del ticket",
  "encontrá tickets similares", "qué casos de prueba tiene el NAA-XXXX".
  Esta skill es el punto de entrada de lectura para el sistema multi-agente de QA.
  Otros skills (jira-writer) dependen de sus outputs.
---

# jira-reader

Skill de **solo lectura** para el proyecto NAA. Provee contexto a otros skills y a agentes
externos del sistema QA.

## Contexto fijo

- **Cloud ID:** `c303d73b-75df-492e-9e64-479b722035cf`
- **Proyecto:** `NAA` (Nuevo Administrador - AGIL)

---

## Operaciones disponibles

### OP-1: Leer ticket por key
```
Input:  issueKey (ej. NAA-4429)
Output: summary, description, status, issuetype, priority, assignee, reporter,
        parent/epic, customfield_10061 (Componente), comments, issuelinks
Tool:   getJiraIssue
```

Campos siempre a solicitar:
```
["summary", "description", "status", "issuetype", "priority", "assignee",
 "reporter", "parent", "comment", "issuelinks", "customfield_10061",
 "customfield_10062", "labels"]
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
project = NAA AND issuetype in ("QA Bug - Front","QA Bug - Back") AND text ~ "AI" ORDER BY created DESC

-- Tickets en estado A Versionar (listos para pre-prod)
project = NAA AND status = "A Versionar" ORDER BY updated DESC

-- Buscar comentarios con patrón dev_saas
project = NAA AND comment ~ "Dev-SAAS" ORDER BY updated DESC

-- Tickets de una épica
project = NAA AND parent = NAA-1977

-- Buscar por componente
project = NAA AND "Componente[Labels]" = "AI"
```

### OP-3: Extraer casos de prueba de un ticket
Dado un ticket (generalmente en estado "A Versionar"), extraer del historial de comentarios
todos los bullets de validación escritos por Juanto (accountId: `712020:59e4ac7b-f44f-45cb-a444-44746cecec49`).

**Patrón a detectar en los comentarios:**
```
"Se valida sobre **Master** los cambios aplicados:"
seguido de bullet list con ✔ al final de cada ítem
```

**Output estructurado** para uso por `jira-writer`:
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

### OP-4: Listar transiciones disponibles
```
Input:  issueKey
Output: lista de { id, name } de transiciones
Tool:   getTransitionsForJiraIssue
```

Ver referencia completa en `references/transitions.md`

### OP-5: Lookup de usuario
```
Input:  nombre del usuario (string)
Output: accountId, displayName, emailAddress
Tool:   lookupJiraAccountId
```

---

## Output contract (para integración multi-agente)

Cuando `jira-reader` es invocado por otro agente (ej. un agente de automatización),
el output debe seguir este schema JSON:

```json
{
  "schema_version": "1.0",
  "source_skill": "jira-reader",
  "operation": "read_ticket | search_jql | extract_test_cases | list_transitions | lookup_user",
  "timestamp": "ISO-8601",
  "project": "NAA",
  "data": { ... }   // payload específico de la operación
}
```

Este contrato permite que agentes de automatización de pruebas, generadores de reportes
u orquestadores consuman los resultados de forma predecible.

---

## Referencias
- `references/transitions.md` → IDs y nombres de todas las transiciones del proyecto NAA
