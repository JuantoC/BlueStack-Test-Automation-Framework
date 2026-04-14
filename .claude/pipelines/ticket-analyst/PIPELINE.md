---
name: ticket-analyst
phase: 1
invoked_by: qa-orchestrator
uses_skills: [jira-reader OP-1, OP-3, OP-6]
---

# ticket-analyst

**Responsabilidad única:** Dado un ticket key, leer su contenido completo, sintetizar los
criterios de prueba desde todas las fuentes disponibles, clasificar el módulo de cobertura
y producir el `ticket_analyst_output` completo para que test-engine pueda actuar.
No ejecuta tests, no escribe en Jira.

---

## Contexto del flujo QA — Máquina de estados Jira

Antes de actuar, ticket-analyst debe conocer en qué estado está el ticket para determinar
qué operaciones ejecutar y qué `action_type` asignar:

| Estado Jira | Significado | ¿ticket-analyst actúa? |
|-------------|-------------|------------------------|
| `Revisión` | El dev envió el ticket a QA para validación en Master | **SÍ** — este es el trigger principal |
| `Feedback` | QA ya mandó feedback; el dev está corrigiendo | No — esperar que vuelva a "Revisión" |
| `A Versionar` | QA aprobó el ticket en Master; esperando versionado a Dev_SAAS | No — QA ya hizo su trabajo |
| `Done` | Ticket versionado a rama local de Dev_SAAS | Solo si `requested_env = "dev_saas"` en el trigger |

> **Entornos del equipo Bluestack:**
> - **Master** (internamente "TESTING"): entorno de desarrollo activo donde se validan los tickets.
>   Los tickets en estado `Revisión` se validan aquí. Al aprobar → transición a `A Versionar`.
>   Al fallar → transición a `Feedback`.
> - **Dev_SAAS** (también llamado "Testing" por el equipo): entorno pre-productivo que replica
>   un cliente real. Los tickets pasan aquí cuando toda una versión se libera al ambiente.
>   El trigger es manual: Juanto indica qué versión se liberó. Se re-testean los mismos
>   casos validados en Master usando los test_cases del comentario master previo (OP-3).

---

## Input

Recibe del qa-orchestrator el Pipeline Context con el trigger ya resuelto:

```json
{
  "pipeline_id": "pipe-YYYYMMDD-NNN",
  "action": "analyze_ticket",
  "ticket_key": "NAA-XXXX",
  "requested_env": "master | dev_saas"
}
```

El `requested_env` determina si se invoca OP-3:
- `master` (o ausente) → flujo Master: sintetizar criteria + clasificar + construir test_hints
- `dev_saas` → flujo Dev_SAAS: además de lo anterior, extraer test_cases del comentario
  master previo con OP-3 para re-testear el mismo set

---

## Paso TA-1: Inicializar Pipeline Context

Verificar si existe `pipeline-logs/active/<TICKET_KEY>.json`.

- **Si NO existe:** crear el archivo con la estructura base del Pipeline Context (ver §7.2
  del architecture doc). Setear `current_stage: "ticket_analysis"`, `stage_status: "in_progress"`.
- **Si existe:** leerlo. Este es el mecanismo de resumption — el pipeline puede haber
  sido interrumpido. Ver TA-2 para la decisión de continuación.

Registrar en `step_log[]`:
```json
{ "stage": "ticket-analyst", "started_at": "<ISO>", "status": "in_progress" }
```

---

## Paso TA-2: Chequeo de idempotencia

Verificar si el Pipeline Context ya tiene `ticket_analyst_output` con datos.

- **Si `ticket_analyst_output` existe y está completo** (tiene `classification.module` y
  `criteria[]`): el análisis ya fue hecho en una ejecución anterior.
  Registrar en `step_log` `status: "skipped"` con razón `"análisis previo encontrado"`.
  Pasar el output existente directamente al orchestrator sin repetir las llamadas a Jira.

- **Si `ticket_analyst_output` es null o incompleto:** continuar con TA-3.

---

## Paso TA-3: Leer ticket con jira-reader OP-1 (lazy loading)

Usar siempre la estrategia de dos fases para preservar el contexto disponible.

### Fase 3A — OP-1-LIGHT (siempre ejecutar primero)

```json
["summary", "description", "status", "issuetype", "priority", "assignee",
 "reporter", "parent", "issuelinks", "customfield_10061",
 "customfield_10062", "customfield_10021", "labels", "fixVersions"]
```

Con el resultado de 3A intentar TA-4 paso 4.1 (extracción estructurada desde descripción).
**Si la descripción tiene sección "Criterios de aceptación" o "Casos de prueba"
con ≥ 1 ítem → no ejecutar Fase 3B. Pasar directo a TA-4.2 con lo extraído.**

### Fase 3B — OP-1-FULL (solo si 3A no produjo criterios)

Agregar `comment` y `attachment` únicamente cuando la descripción no tiene criterios
estructurados y se necesita inferir desde comentarios o campos custom:

```json
["comment", "attachment"]
```

> Lanzar como call separado al mismo ticket, no repetir todos los campos de 3A.
> Esto minimiza el tamaño de la respuesta y preserva contexto.

### Manejo de errores en 3A/3B

**Si el ticket no existe (404):** abortar con `stage_status: "error"`. Informar al orchestrator.

**Si la respuesta supera el límite de tokens:** el sistema guarda el resultado en disco.
Lanzar sub-agente Explore con la ruta del archivo — ver jira-reader §"Manejo de respuestas grandes".

Extraer y registrar en memoria de trabajo:
- `summary`, `status.name`, `issuetype.name`, `priority.name`
- `assignee.displayName`, `component_jira` (de `customfield_10061.value`)
- `parent.key`, `linkedIssues[]`, `fixVersions[].name`, `labels[]`
- `comments[]` completos (texto + autor + fecha)
- Campos custom de deploy/SQL/VFS si están disponibles

---

## Paso TA-4: Sintetizar criteria[] desde todo el contenido del ticket

Analizar TODO el contenido leído en TA-3 para construir los criterios de prueba.
Aplicar en orden de precedencia:

**4.1 — Extracción estructurada (source: "extracted"):**
- Buscar sección "Criterios de aceptación" en la descripción → extraer bullet list
- Buscar sección "Casos de prueba" en la descripción → extraer bullet list
- Si alguna de estas secciones existe y tiene ≥ 1 ítem → `source: "extracted"`, continuar con TA-5

**4.2 — Inferencia desde contexto (source: "inferred"):**
Si la extracción estructurada retornó vacío, inferir desde:
- Comentarios de devs/QA: detectar descripciones de comportamiento, pasos reproducibles,
  condiciones esperadas, fixes aplicados
- Campos custom: "deploy" (qué se desplegó), "cambios SQL" (impacto en BD), "cambios VFS"
  (archivos modificados) — analizar para entender el flujo funcional del ticket
- Título + Resumen Ejecutivo (`customfield_10062`): usar para entender el flujo principal
- Construir criterios accionables desde este contexto → `source: "inferred"`

**4.3 — Escalación por información insuficiente (source: "none"):**
Si después de 4.1 y 4.2 no se puede construir ≥ 1 criterio de prueba accionable:
```json
{
  "criteria": [],
  "source": "none",
  "testable": false,
  "human_escalation": true,
  "escalation_reason": "Ticket sin criterios de prueba ni descripción suficiente para inferir
    el flujo a validar. Para continuar, adjuntar al ticket: comportamiento esperado,
    pasos para reproducir, o criterios de aceptación explícitos."
}
```
Registrar en `step_log`, setear `human_escalation: true` en Pipeline Context y **detener** el pipeline.

---

## Paso TA-5: Extraer test_cases del comentario master (solo flujo Dev_SAAS)

**Condición de ejecución:** solo si `requested_env = "dev_saas"` en el input del trigger.

Invocar `jira-reader OP-3` sobre el `ticket_key` para extraer los `test_cases[]` del
comentario master más reciente escrito por Juanto ("Se valida sobre **Master** los cambios aplicados:").

**Si no existe comentario master previo:**
```json
{ "master_validation": null, "blocker": "No hay comentario master previo — Dev_SAAS requiere validación previa en Master" }
```
Abortar flujo Dev_SAAS. Informar al orchestrator.

**Si existe:** registrar en `master_validation`:
```json
{
  "comment_id": "XXXXX",
  "validated_by": "Juan Tomas Caldera",
  "validated_at": "<ISO>",
  "test_cases": [
    { "description": "...", "result": "✔" }
  ]
}
```

---

## Paso TA-6: Clasificar domain + module

Aplicar el algoritmo de 6 pasos (§6.2 del architecture doc):

**Paso 1 — component_jira exacto:**
Buscar `component_jira` en `component-to-module.json`
(`.claude/pipelines/ticket-analyst/references/component-to-module.json`).

| component_jira | module | domain | confidence |
|---|---|---|---|
| `AI` | `ai-post` | `post` | `high` |
| `Post` | `post` | `post` | `high` |
| `Video` | `video` | `video` | `high` |
| `Images` | `images` | `images` | `high` |
| `Auth` | `auth` | `auth` | `high` |
| `Editor` | `post` | `post` | `high` |
| `Tags` | `null` | `null` | — |
| `Planning` | `null` | `null` | — |
| `Admin` | `null` | `null` | — |

Si el módulo mapeado es `null` → `sessions_found = false` (Fase 5, test-generator). No escalar.

**Paso 2 — Si component_jira no está en el mapa:** intentar exact match en `test-map.json`
por nombre de módulo. Si hay hit → `confidence: "high"`.

**Paso 3 — Fuzzy match por keywords:**
Cruzar palabras del `summary` contra `keywords[]` de cada módulo en `test-map.json`.
- Intersección ≥ 2 palabras → `confidence: "medium"`
- Intersección = 1 palabra → `confidence: "low"` → ver TA-8
- Intersección = 0 → `sessions_found = false`

**Paso 4:** Verificar que los paths del módulo existen en disco.

**Paso 5:** Verificar que el módulo tiene `validated: true` en `test-map.json`.
Si `validated: false` → `dry_run: true` en Pipeline Context.

**Paso 6:** Si ningún match con confidence ≥ "medium" → `sessions_found: false`.
Informar al orchestrator para que invoque test-generator (Fase 5).

**Desempate:** Si múltiples módulos empatan en score, ganar el más específico
(ej: `ai-post` > `post`; criterio: componente Jira más específico).

---

## Paso TA-7: Determinar action_type y construir test_hints

**action_type** (ver también `classification-rules.md`):

| Condición | action_type |
|---|---|
| Ticket en `Revisión` sin comentario master previo | `regression_test` |
| Ticket en `Revisión` que viene de estado `Feedback` (historial del ticket) | `retest` |
| Ticket nuevo (Story/Feature) sin ningún comentario master | `new_feature` |
| `requested_env = "dev_saas"` | siempre `regression_test` (re-corre lo validado en Master) |

**Detectar "viene de Feedback":** verificar en los comentarios del ticket si existe un
comentario de jira-writer con texto "Se requiere corrección" o similar, o si el historial
de transiciones muestra un estado previo `Feedback`.

**test_hints[]:** construir desde `criteria[]` sintetizados en TA-4.
Cada criterio se transforma en un hint accionable para el test runner:
- Criterio: "El usuario puede publicar sin errores de validación"
- Hint: "Verificar que el flujo de publicación completa sin errores de validación"

Si `criteria` viene de `master_validation.test_cases` (flujo Dev_SAAS) → usar esas descripciones.

---

## Paso TA-8: Determinar confidence y confidence_reason

Asignar según el resultado de TA-6:

| Resultado del matching | confidence | confidence_reason |
|---|---|---|
| component_jira match directo | `high` | `"component_jira '<X>' matchea directamente en component-to-module.json → '<module>'"` |
| Exact module match | `high` | `"Módulo '<X>' encontrado por nombre exacto en test-map.json"` |
| Fuzzy ≥ 2 keywords | `medium` | `"Keyword intersection ≥2 entre summary y módulo '<X>': [kw1, kw2]"` |
| Fuzzy = 1 keyword | `low` | `"Solo 1 keyword en common: ['<kw>']. Clasificación insegura."` |

**Si `confidence = "low"`:**
- Setear `testable: false`
- Setear `human_escalation: true`
- Registrar en `escalation_reason`: "Clasificación de bajo confidence — no se ejecutan
  tests con match de 1 sola keyword. Revisar manualmente el módulo correcto."

---

## Paso TA-9: Escribir ticket_analyst_output en Pipeline Context

Leer el Pipeline Context desde `pipeline-logs/active/<TICKET_KEY>.json`, agregar
`ticket_analyst_output` completo y reescribir el archivo:

```json
"ticket_analyst_output": {
  "pipeline_id": "<pipeline_id>",
  "ticket_key": "NAA-XXXX",
  "summary": "<ticket summary>",
  "issue_type": "<issuetype.name>",
  "status": "<status.name>",
  "priority": "<priority.name>",
  "component_jira": "<customfield_10061.value>",
  "classification": {
    "domain": "post | video | images | auth | cross | stress | null",
    "module": "ai-post | post | video | images | auth | cross | stress | null",
    "action_type": "regression_test | retest | new_feature",
    "testable": true | false,
    "confidence": "high | medium | low",
    "confidence_reason": "<string explicativo>",
    "criteria_source": "extracted | inferred | none",
    "test_hints": ["..."]
  },
  "acceptance_criteria": ["<criteria[].description>"],
  "master_validation": { "<output de OP-3 si aplica, o null>" },
  "linked_tickets": ["NAA-XXXX"],
  "jira_metadata": {
    "jiraSummary":      "<summary>",
    "ticketType":       "<issuetype.name>",
    "ticketStatus":     "<status.name>",
    "assignee":         "<assignee.displayName>",
    "component":        "<customfield_10061.value>",
    "sprint":           "<customfield_10021.name | null>",
    "executiveSummary": "<customfield_10062 | null>",
    "parentKey":        "<parent.key | null>",
    "linkedIssues":     ["<issuelinks[].key>"],
    "fixVersion":       "<fixVersions[0].name | null>",
    "priority":         "<priority.name>",
    "jiraLabels":       ["<labels[]>"],
    "jiraAttachments":  ["<attachment[].filename>"]
  }
}
```

Actualizar también en el Pipeline Context:
- `stage: "ticket-analyst"`, `stage_status: "completed"`
- `step_log[]`: agregar entry con `completed_at` y `duration_ms`
- `human_escalation: true/false` según lo determinado

---

## Output del pipeline

El Pipeline Context en `pipeline-logs/active/<TICKET_KEY>.json` con:
- `ticket_analyst_output` completo
- `stage_status: "completed" | "failed" | "escalated"`

El orchestrator lee este archivo para decidir el siguiente sub-pipeline a invocar.

---

## Manejo de errores

| Error | Acción |
|-------|--------|
| Ticket no encontrado (404) | `stage_status: "error"`. Informar orchestrator. No continuar. |
| Respuesta MCP > límite de tokens | Sub-agente Explore para extraer campos. Ver jira-reader §overflow. |
| `criteria: []` tras TA-4.1 y TA-4.2 | `testable: false`, `human_escalation: true`, detener. Ver TA-4.3. |
| `confidence = "low"` | `testable: false`, `human_escalation: true`. No ejecutar tests. |
| component_jira mapeado a `null` | No es error — `sessions_found: false`, informar orchestrator (Fase 5). |
| Componente desconocido (no en component-to-module.json) | Intentar fuzzy por keywords. Si falla: `confidence: "low"`. |
| OP-3 sin comentario master (flujo dev_saas) | Abortar flujo Dev_SAAS. Informar orchestrator. Ticket bloqueado. |
| MCP 401/403 (token expirado) | Escalar inmediatamente. No reintentar. Token requiere renovación manual. |
| Pipeline Context corrupto / incompleto | Recrear estructura base y reiniciar desde TA-3. |

---

## Consideraciones GitHub Actions

- **Re-run safety:** TA-2 verifica idempotencia antes de llamar a Jira. Si el job se
  re-ejecuta, no se duplican las llamadas a la API.
- **Secrets:** El MCP Atlassian usa `JIRA_API_TOKEN` y `JIRA_USERNAME` del entorno.
  En GitHub Actions deben estar configurados como secrets del repo. No hardcodear.
- **Context window:** El ticket completo con comentarios puede ser verbose. Si se acerca
  al límite (80K tokens — ver §11.6 del architecture doc), usar el sub-agente Explore para
  extraer solo los campos necesarios en lugar de cargar el ticket completo en contexto.
- **Timeout:** Si jira-reader tarda más de 30s, el step de GitHub Actions puede expirar.
  Configurar `timeout-minutes: 3` en el step de ticket-analyst.
- **Audit trail:** El Pipeline Context escrito en TA-9 persiste en `pipeline-logs/active/`
  durante la ejecución y se mueve a `completed/` al finalizar el pipeline completo.

---

## Referencias

- [`references/component-to-module.json`](references/component-to-module.json) — mapeo component_jira → módulo interno
- [`references/classification-rules.md`](references/classification-rules.md) — reglas completas de clasificación, action_type, confidence y edge cases
- [`.claude/skills/jira-reader/SKILL.md`](../../skills/jira-reader/SKILL.md) — OPs disponibles y output schemas
- [`.claude/pipelines/test-engine/references/test-map.json`](../test-engine/references/test-map.json) — módulos con sessions disponibles
- [`docs/architecture/qa-automation-architecture.md`](../../../docs/architecture/qa-automation-architecture.md) — contrato arquitectónico completo (§3.3, §6.2, §6.3)