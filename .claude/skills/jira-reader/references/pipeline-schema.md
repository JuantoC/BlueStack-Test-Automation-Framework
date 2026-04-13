# Pipeline Schema — Contrato de lectura automatizada

## Contexto

Este schema define cómo el pipeline automatizado invoca `jira-reader` para obtener
contexto de tickets antes de que `jira-writer` ejecute operaciones de escritura.

El flujo típico del orquestador:
```
1. jira-reader OP-6 → extraer criterios del ticket
2. Selenium runner → ejecutar tests
3. jira-reader OP-3 → extraer casos del comentario master (si es Dev_SAAS)
4. jira-writer MODO F → procesar resultados y actualizar Jira
```

---

## Input (pipeline → jira-reader)

```json
{
  "schema_version": "2.0",
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

---

## Output (jira-reader → pipeline)

### OP-6 / extract_criteria

```json
{
  "schema_version": "2.0",
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

### OP-3 / extract_test_cases

```json
{
  "schema_version": "2.0",
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

### OP-1 / read_ticket

```json
{
  "schema_version": "2.0",
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

## Ejemplo de flujo completo de orquestador

### Etapa 1: Obtener criterios del ticket antes de ejecutar tests

**Input al orquestador:**
```json
{ "ticket_key": "NAA-4416", "action": "run_and_validate" }
```

**Orquestador llama a jira-reader:**
```json
{
  "schema_version": "2.0",
  "source_agent": "selenium-orchestrator",
  "operation": "extract_criteria",
  "ticket_key": "NAA-4416"
}
```

**jira-reader responde** con los criterios de aceptación del ticket.

### Etapa 2: Mapear criterios con tests de Selenium

El orquestador mapea cada criterio con el test en `/sessions` que lo cubre.

### Etapa 3: Ejecutar los tests y colectar resultados

El Selenium runner ejecuta la suite y devuelve `test_results[]` con ✔/✘ por cada criterio.

### Etapa 4: Enviar resultados a jira-writer

Ver `jira-writer/references/pipeline-schema.md` para el Input Schema de jira-writer.