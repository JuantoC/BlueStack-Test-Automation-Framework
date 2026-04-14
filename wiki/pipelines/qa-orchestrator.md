---
source: docs/qa-automation-architecture.md
last-updated: 2026-04-13
---

# QA Automation Pipeline — Arquitectura Multi-Agente

**Proyecto:** Bluestack CMS QA Automation  
**Autor:** Juan Caldera  
**Fecha:** Abril 2026  
**Versión:** 2.0 — Diseño técnico real con contexto del repositorio

---

## 1. Visión General

El objetivo es construir un pipeline automatizado de extremo a extremo que conecte dos sistemas actualmente aislados:

- **Pata A — Test Automation Framework:** TypeScript 5 + Selenium WebDriver 4.38 + Jest 29 + Allure 3, arquitectura POM con Facade Pattern. Repositorio existente con 14 tests en `sessions/` y skills de Claude Code operativas. ESM (`"type": "module"`), entorno WSL2, `NODE_OPTIONS='--experimental-vm-modules'` obligatorio.
- **Pata B — Jira (proyecto NAA):** Skills `jira-reader` y `jira-writer` operativas en Claude Code, conectadas vía MCP (`@sooperset/mcp-atlassian`) a `bluestack-cms.atlassian.net`. Toda escritura en formato ADF obligatorio.

El pipeline cierra el ciclo completo: **ticket → interpretación → pruebas → feedback → resolución**.

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  JIRA NAA   │────▶│  qa-orchestrator  │────▶│  Test Framework  │────▶│  JIRA NAA    │
│  (evento)   │     │  (pipeline Claude)│     │  sessions/*.ts   │     │  (feedback)  │
└─────────────┘     └──────────────────┘     └──────────────────┘     └──────────────┘
      ▲                                                                       │
      └───────────────────────────────────────────────────────────────────────┘
```

**Restricción de arquitectura:** Todo el pipeline corre dentro de Claude Code. No hay procesos externos autónomos. Claude usa el `Bash` tool para ejecutar Jest, los MCP tools de Atlassian para leer/escribir en Jira, y sus tools de filesystem para manipular el repositorio.

---

## 2. Estado Actual del Sistema

Antes de definir qué hay que construir, es crítico entender qué ya existe y está operativo.

### 2.1 Piezas existentes y listas

| Pieza | Ubicación | Estado |
|-------|-----------|--------|
| `jira-reader` | `.claude/skills/jira-reader/` | ✅ Operativo |
| `jira-writer` | `.claude/skills/jira-writer/` | ✅ Operativo |
| `create-session` | `.claude/skills/create-session/` | ✅ Operativo |
| `pom-generator` | `.claude/skills/pom-generator/` | ✅ Operativo |
| 14 tests en `sessions/` | `sessions/{auth,post,video,images,cross,stress,debug}/` | ✅ Ejecutables |
| MCP Atlassian | `.mcp.json` | ✅ Configurado |
| Cloud ID Jira | `c303d73b-75df-492e-9e64-479b722035cf` | ✅ Fijo |

### 2.2 Piezas que hay que construir

| Pieza | Ubicación | Fase | Estado |
|-------|-----------|------|--------|
| `test-map.json` | `.claude/pipelines/test-engine/references/` | 0 | ✅ Creado |
| `component-to-module.json` | `.claude/pipelines/ticket-analyst/references/` | 0 | ✅ Creado |
| `classification-rules.md` | `.claude/pipelines/ticket-analyst/references/` | 1 | ✅ Creado |
| Pipeline `ticket-analyst` | `.claude/pipelines/ticket-analyst/PIPELINE.md` | 1 | ✅ **Fase 1 completada** |
| Pipeline `test-engine` | `.claude/pipelines/test-engine/PIPELINE.md` | 2 | ✅ **Fase 2 completada** |
| Pipeline `test-reporter` | `.claude/pipelines/test-reporter/PIPELINE.md` | 3 | ✅ Creado |
| Pipeline `qa-orchestrator` | `.claude/pipelines/qa-orchestrator/` | 4 | Pendiente |
| Script de polling | `.claude/pipelines/qa-orchestrator/scripts/poll-jira.ts` | 4 | Pendiente |

### 2.3 Skills existentes que el pipeline reutiliza

El pipeline **no reinventa** las siguientes capacidades — las delega a skills ya operativos:

- **Generación de tests nuevos** → `create-session` (skill ya existente)
- **Generación de Page Objects nuevos** → `pom-generator` (skill ya existente)
- **Lectura de tickets Jira** → `jira-reader` (skill ya existente)
- **Escritura en Jira** → `jira-writer` (skill ya existente)

---

## 3. Arquitectura de Agentes

### 3.1 Principio de diseño

Cada pipeline tiene **una responsabilidad única**, un **contrato de entrada/salida** definido, y **no conoce la implementación interna de los otros pipelines**. Se comunican por mensajes estructurados en JSON. Todos los pipelines viven en `.claude/pipelines/` (no en `.claude/skills/`) porque son invocados exclusivamente por otros pipelines o por el orchestrator — nunca directamente por el usuario en conversación.

### 3.2 Mapa de pipelines

```
                    ┌──────────────────────────┐
                    │      qa-orchestrator      │
                    │  (pipeline principal)     │
                    │  Coordina el flujo,       │
                    │  decide qué sub-pipelines │
                    │  invocar y en qué orden   │
                    └──────────┬───────────────┘
                               │
            ┌──────────────────┼──────────────────────┐
            │                  │                      │
            ▼                  ▼                      ▼
   ┌─────────────────┐ ┌──────────────────┐  ┌──────────────────────┐
   │  ticket-analyst │ │   test-engine    │  │   test-reporter      │
   │                 │ │                  │  │                      │
   │  Lee ticket,    │ │  Mapea sessions, │  │  Escribe feedback,   │
   │  clasifica,     │ │  ejecuta Jest,   │  │  transiciona estado, │
   │  extrae hints   │ │  parsea output   │  │  crea tickets nuevos │
   └─────────────────┘ └──────────────────┘  └──────────────────────┘
            │                  │                      │
            ▼                  ▼                      ▼
   ┌─────────────┐    ┌──────────────────┐    ┌─────────────────────┐
   │ jira-reader │    │  sessions/*.ts   │    │ jira-writer         │
   │ (skill MCP) │    │  Jest + Selenium │    │ (skill MCP + ADF)   │
   └─────────────┘    └──────────────────┘    └─────────────────────┘
```

### 3.3 Definición de cada pipeline

---

#### qa-orchestrator (pipeline principal)

**Responsabilidad:** Recibir el trigger, decidir el flujo, invocar sub-pipelines en secuencia, manejar errores y decidir escalaciones.

**No hace:** No lee tickets directamente, no ejecuta tests, no escribe en Jira. Solo coordina.

**Input:** Trigger event normalizado (ver sección 4).  
**Output:** Pipeline Execution Record final (ver sección 8).

**Decisiones que toma:**
- ¿El trigger es un ticket específico, un polling sweep, o un CI hook?
- ¿Qué tipo de flujo aplica? (ver sección 5)
- ¿El resultado del test-engine requiere feedback positivo o negativo?
- ¿Hay que crear tickets nuevos por fallos detectados en Dev_SAAS?
- ¿Se debe escalar (notificar humano) porque el pipeline no puede resolver?

---

#### ticket-analyst (sub-pipeline de análisis)

**Responsabilidad:** Dado un ticket key, leer todo su contenido y producir un análisis estructurado.

**Usa:** `jira-reader` OP-1, OP-2, OP-3.

**Input:**
```json
{
  "action": "analyze_ticket",
  "ticket_key": "NAA-XXXX"
}
```

**Output:**
```json
{
  "ticket_key": "NAA-4429",
  "summary": "CREACION NOTA IA - No respeta el prompt inyectado",
  "issue_type": "QA Bug - Front",
  "status": "En desarrollo",
  "priority": "Medium",
  "component_jira": "AI",
  "epic_key": "NAA-1977",
  "assignee": {
    "displayName": "Paula Rodriguez",
    "accountId": "633b5c898b75455be4580f5b"
  },
  "classification": {
    "domain": "post",
    "module": "ai-post",
    "action_type": "regression_test",
    "testable": true,
    "test_hints": [
      "Verificar que el prompt enviado se refleja en la nota generada",
      "Verificar que no se genera contenido genérico ignorando el prompt"
    ]
  },
  "acceptance_criteria": [
    "La nota generada contiene el tema del prompt",
    "No se muestra contenido default de IA"
  ],
  "linked_tickets": ["NAA-4400"],
  "previous_validation_comments": [],
  "jira_metadata": {
    "jiraSummary":      "CREACION NOTA IA - No respeta el prompt inyectado",
    "ticketType":       "QA Bug - Front",
    "ticketStatus":     "En desarrollo",
    "assignee":         "Paula Rodriguez",
    "component":        "AI",
    "sprint":           "NUEVA FUNCIONALIDAD / MODULOS, 22/12/2025-31/12/2025",
    "executiveSummary": "...",
    "parentKey":        "NAA-1977",
    "linkedIssues":     ["NAA-4400"],
    "fixVersion":       "8.6.16.X",
    "priority":         "Medium",
    "jiraLabels":       [],
    "jiraAttachments":  []
  }
}
```

> `jira_metadata` sigue el contrato exacto de `TestMetadata` (`src/core/wrappers/testWrapper.ts`).
> Se propaga sin transformación hasta `runSession()` para poblar Allure.
> Los campos de nivel superior (`issue_type`, `status`, etc.) se mantienen para routing interno del pipeline.

**Lógica interna:**
1. Leer ticket con `jira-reader OP-1` (contexto general: status, assignee, epic, component).
2. Extraer los criterios de aceptación del ticket con **`jira-reader OP-6`** (`extract_criteria`). Esta operación devuelve los criterios indexados listos para mapear tests.
3. Si es flujo Dev_SAAS (o si el ticket ya tiene comentario Master previo), extraer los test_cases con `jira-reader OP-3` (`extract_test_cases`).
4. Clasificar el `domain` y `module` usando el `component_jira` y las keywords del summary (ver `references/module-map.json`).
5. Determinar `testable` por heurística: QA Bug Front/Back → `true` por defecto; tickets de diseño/UX sin criterios → `false`.
6. Construir `test_hints` directamente desde los `criteria[]` devueltos por OP-6, no inferirlos manualmente.

---

#### test-engine (sub-pipeline de ejecución)

**Responsabilidad:** Recibir la clasificación del ticket-analyst, encontrar o generar tests, ejecutarlos y devolver resultados estructurados.

**Usa:** Filesystem del repositorio, Bash tool para ejecutar Jest, `create-session` (si modo `generate_and_run`), `pom-generator` (si el módulo no tiene POM).

**Input:**
```json
{
  "action": "run_tests",
  "ticket_key": "NAA-4429",
  "classification": {
    "domain": "post",
    "module": "ai-post",
    "action_type": "regression_test"
  },
  "test_hints": [
    "Verificar que el prompt enviado se refleja en la nota generada"
  ],
  "acceptance_criteria": [
    "La nota generada contiene el tema del prompt"
  ],
  "mode": "discover_and_run | run_existing | generate_and_run",
  "jira_metadata": {
    "jiraSummary":  "CREACION NOTA IA - No respeta el prompt inyectado",
    "ticketType":   "QA Bug - Front",
    "ticketStatus": "En desarrollo",
    "assignee":     "Paula Rodriguez",
    "component":    "AI",
    "sprint":       "NUEVA FUNCIONALIDAD / MODULOS, ...",
    "parentKey":    "NAA-1977",
    "linkedIssues": ["NAA-4400"],
    "fixVersion":   "8.6.16.X",
    "priority":     "Medium",
    "jiraLabels":   [],
    "jiraAttachments": []
  }
}
```

> `jira_metadata` viene del ticket-analyst output sin modificación. El test-engine lo
> inyecta en el `metadata` argument de `runSession()` al ejecutar cada session, para que
> Allure registre la trazabilidad completa Jira → Test Report.

**Output:**
```json
{
  "ticket_key": "NAA-4429",
  "execution_id": "exec-20260413-001",
  "mode_used": "discover_and_run",
  "environment": "grid",
  "results": [
    {
      "session_file": "sessions/post/NewAIPost.test.ts",
      "session_name": "NewAIPost",
      "status": "pass | fail | error | skip",
      "duration_ms": 42000,
      "assertion_detail": null,
      "mapped_to_hint": "Verificar que el prompt enviado se refleja en la nota generada"
    }
  ],
  "summary": {
    "total": 1,
    "passed": 1,
    "failed": 0,
    "errors": 0,
    "skipped": 0
  },
  "jest_output_path": "pipeline-logs/results-NAA-4429-exec-001.json"
}
```

**Tres modos de operación:**

| Modo | Cuándo | Qué hace |
|------|--------|----------|
| `discover_and_run` | Hay sessions que matchean el módulo en `test-map.json`. | Busca, ejecuta, parsea. |
| `run_existing` | El Orchestrator sabe exactamente qué sessions correr (re-test). | Ejecuta sin buscar. |
| `generate_and_run` | No hay sessions para este módulo. | Invoca `create-session` con los hints. Si no hay POM, invoca `pom-generator` primero. |

**Comando de ejecución Jest (siempre esta forma):**
```bash
NODE_OPTIONS='--experimental-vm-modules' USE_GRID=true IS_HEADLESS=true node node_modules/.bin/jest NewAIPost --json --outputFile=pipeline-logs/results-NAA-4429-exec-001.json
```

> ⚠ `NODE_OPTIONS='--experimental-vm-modules'` es siempre obligatorio (ESM en WSL2).  
> ⚠ Usar `USE_GRID=true IS_HEADLESS=true` para ejecución en pipeline (sin UI).  
> ⚠ `--json --outputFile=<path>` para capturar resultados estructurados.

---

#### test-reporter (sub-pipeline de feedback)

**Responsabilidad:** Recibir resultados del test-engine y traducirlos a acciones Jira: comentario de validación, transición de estado, tickets nuevos por fallos en Dev_SAAS.

**Usa:** `jira-writer` Modos B, C, D. Todo contenido en formato ADF.

**Input (pipeline → jira-writer) — schema v2.0:**
```json
{
  "schema_version": "2.0",
  "source_agent": "selenium-runner",
  "operation": "validate_master",
  "ticket_key": "NAA-4429",
  "environment": "master",
  "environment_url": "https://master.d1c5iid93veq15.amplifyapp.com",
  "test_suite": "NewAIPost",
  "test_file": "sessions/post/NewAIPost.test.ts",
  "component": "AI",
  "assignee_hint": "frontend",
  "suite_summary": {
    "total": 2,
    "passed": 1,
    "failed": 1
  },
  "test_results": [
    {
      "test_name": "should generate note matching user prompt",
      "description": "El prompt enviado se refleja en la nota generada",
      "result": "✔",
      "duration_ms": 38000
    },
    {
      "test_name": "should not generate generic AI content",
      "description": "No se genera contenido genérico ignorando el prompt",
      "result": "✘",
      "duration_ms": 42000,
      "error_message": "AssertionError: nota generada no contiene el tema del prompt",
      "stacktrace": "AssertionError: Expected note to contain 'cumbre'\n  at NewAIPost.test.ts:48",
      "log_excerpt": "[WARN] assertValueEquals failed — got generic AI content"
    }
  ]
}
```

**Valores posibles de `operation`:**

| `operation` | Qué hace jira-writer | Cuándo usarlo |
|-------------|---------------------|---------------|
| `validate_master` | Comenta resultado + transiciona (Modo B) | Validación inicial en Master |
| `validate_devsaas` | Lee casos master (OP-3), comenta Dev_SAAS + crea bugs si ✘ (Modo C→D) | Pre-liberación en Dev_SAAS |
| `create_bug` | Crea un QA Bug ticket desde los datos del test fallido (Modo A) | Reporte directo de fallo |
| `add_observation` | Agrega comentario informativo sin cambiar estado | Observaciones sin acción |

**Campos opcionales que enriquecen los artefactos Jira:**
- `environment_url` → se incluye en descripción de bugs
- `prerelease_version` → requerido cuando `operation = "validate_devsaas"`
- `test_file` → permite al desarrollador ir al test fallido directamente
- `log_excerpt` → se incluye en "Otra información" del bug
- `stacktrace` → se trunca a 5-8 líneas en el bug para legibilidad
- `jira_metadata` → objeto con trazabilidad completa del ticket Jira hacia Allure (ver abajo)

**`jira_metadata` en el payload del test-reporter:**
```json
"jira_metadata": {
  "jiraSummary":      "CREACION NOTA IA - No respeta el prompt inyectado",
  "ticketType":       "QA Bug - Front",
  "ticketStatus":     "En desarrollo",
  "assignee":         "Paula Rodriguez",
  "component":        "AI",
  "sprint":           "NUEVA FUNCIONALIDAD / MODULOS, ...",
  "executiveSummary": "...",
  "parentKey":        "NAA-1977",
  "linkedIssues":     ["NAA-4400"],
  "fixVersion":       "8.6.16.X",
  "priority":         "Medium",
  "jiraLabels":       [],
  "jiraAttachments":  []
}
```
> Viene del ticket-analyst sin transformación. jira-writer lo incluye en el Allure attachment
> del reporte de ejecución para mantener la trazabilidad ticket → test report completa.

**Output (jira-writer → pipeline) — schema v2.0:**
```json
{
  "schema_version": "2.0",
  "skill": "jira-writer",
  "status": "success | partial | error",
  "operation": "validate_master",
  "ticket_key": "NAA-4429",
  "actions_taken": [
    {
      "action": "comment_posted",
      "ticket": "NAA-4429",
      "comment_id": "..."
    },
    {
      "action": "transition_applied",
      "ticket": "NAA-4429",
      "from_status": "Revisión",
      "to_status": "FEEDBACK",
      "transition_id": "2"
    }
  ],
  "errors": []
}
```

**Mapeo resultado → acciones Jira:**

| Resultado | `operation` → jira-writer | Transición | Tickets nuevos |
|-----------|---------------------------|------------|----------------|
| Todos ✔, env=master | `validate_master` | `42` → A Versionar | — |
| Algún ✘, env=master | `validate_master` | `2` → FEEDBACK | — |
| Todos ✔, env=dev_saas | `validate_devsaas` | `31` → Done | — |
| Algún ✘, env=dev_saas | `validate_devsaas` | Sin transición (ya en A Versionar) | 1 ticket por cada ✘ |

**Nota sobre Dev_SAAS en pipeline:** Los resultados pueden diferir del comentario Master. Un caso que pasó en Master puede fallar en Dev_SAAS. El pipeline actualiza ✔/✘ por bullet con el resultado real de la ejecución. Ver `jira-writer/references/devsaas-flow.md` para el flujo completo.

> ⚠ **ADF obligatorio:** Todos los campos rich text (`description`, `comment`) son objetos ADF JSON con `contentFormat: "adf"`. Nunca strings markdown. Ver `jira-writer/references/adf-format-guide.md`.

---

## 4. Sistema de Triggers (Eventos)

### 4.1 Tipos de trigger

| # | Trigger | Origen | Prioridad |
|---|---------|--------|-----------|
| T1 | **Manual prompt** | Usuario en Claude Code | Fase 0 |
| T2 | **Polling sweep** | Script `poll-jira.ts` invocado vía cron | Fase 4 |
| T3 | **Scheduled via CronCreate** | Claude Code `CronCreate` tool | Fase 4 |
| T4 | **CI hook** | Push al repo → GitHub Actions → invoca Claude | Fase 6 |
| T5 | **Jira webhook** | Jira Cloud → endpoint receptor → Claude | Fase 6 |

> **Restricción WSL2:** Los triggers T4 y T5 requieren infraestructura externa (servidor accesible desde internet). Diferir a fases finales. Las fases iniciales (1-4) operan con triggers manuales y polling local.

### 4.2 Schema del evento trigger

Independientemente del origen, todo trigger se normaliza antes de llegar al Orchestrator:

```json
{
  "event_id": "evt-20260413-001",
  "timestamp": "2026-04-13T14:30:00Z",
  "trigger_type": "manual | polling | scheduled | ci_hook | webhook",
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

### 4.3 JQL queries del polling

```typescript
// .claude/pipelines/qa-orchestrator/scripts/poll-jira.ts
// Consultas JQL para detectar tickets que requieren validación

const JQL_QUERIES = {
  // Tickets en "Revisión" = QA debe actuar AHORA (primera validación o re-test en Master)
  ready_for_qa_review:   `project = NAA AND status = "Revisión" AND updated >= -2h ORDER BY updated DESC`,
  // Tickets que volvieron a "Revisión" desde "Feedback" = dev corrigió, QA re-valida
  retest_after_feedback: `project = NAA AND status changed to "Revisión" after -2h AND status WAS "Feedback"`,
  // Nuevos QA Bugs abiertos (para priorización)
  new_qa_bugs:           `project = NAA AND issuetype in ("QA Bug - Front","QA Bug - Back") AND status = "Abierto" AND created >= -24h`,
  // Sweep Dev_SAAS: todos los tickets "Done" de la versión que acaba de liberarse al entorno pre-prod
  // Trigger: manual — Juanto indica qué versión se liberó
  devsaas_by_version:    `project = NAA AND status = "Done" AND fixVersion = "{VERSION}" ORDER BY updated DESC`
  // NOTA: "A Versionar" NO es trigger para QA. QA ya aprobó ese ticket. Solo queda
  //       esperar que el equipo versione los commits a la rama local de Dev_SAAS.
};
```

---

## 5. Flujos de Ejecución

### 5.1 Flujo Principal — Validación en Master

Trigger: T1 (manual) o T2/T3 cuando un ticket está en estado **"Revisión"**
(el dev envió el ticket a QA para validación en Master).
`"A Versionar"` NO es trigger — ese estado indica que QA ya aprobó el ticket.

```
Trigger
  │
  ▼
qa-orchestrator recibe el evento
  │
  ├──▶ ticket-analyst
  │       jira-reader OP-1  → contexto del ticket (status, assignee, component)
  │       jira-reader OP-6  → extraer criteria[] indexados del ticket
  │       Construir classification: { domain, module, testable }
  │       Construir test_hints desde criteria[]
  │       Output: { module, testable, criteria[], test_hints[] }
  │
  ▼
  ¿testable = true?
  │              │
 SÍ             NO
  │              └──▶ Postear comentario en Jira
  │                   "Requiere validación manual"
  │                   Escalación = true
  │
  ├──▶ test-engine (mode: discover_and_run, env: master)
  │       Test Discoverer → buscar en test-map.json por module
  │       Test Runner → Jest con --json --outputFile
  │       Result Parser → { test_results[], suite_summary, test_file }
  │
  ├──▶ test-reporter (operation: validate_master)
  │       Construir payload schema v2.0 para jira-writer
  │       jira-writer MODO B: comentario ADF + transición
  │       Transicionar: 42 (A Versionar) si todo ✔ | 2 (FEEDBACK) si algún ✘
  │       Procesar output jira-writer: { status, actions_taken[], errors[] }
  │
  ▼
DONE — guardar Pipeline Execution Record en pipeline-logs/
```

### 5.2 Flujo de Re-test (post-FEEDBACK)

Trigger: T1 (manual) o T2 cuando un dev comenta "corregido" en un ticket FEEDBACK.

```
Trigger
  │
  ▼
qa-orchestrator
  │
  ├──▶ ticket-analyst
  │       Leer ticket (ya tiene comentario de validación previo)
  │       jira-reader OP-3 extrae los test_cases del comentario anterior
  │       Output: classification + test_cases previos conocidos
  │
  ├──▶ test-engine (mode: run_existing)
  │       Ejecutar las mismas sessions que se ejecutaron antes
  │       (sin discovery — ya se sabe cuáles son)
  │
  ├──▶ test-reporter (env: master)
  │       Nuevo comentario de validación en el mismo ticket
  │       Transicionar según resultado
  │
  ▼
DONE
```

### 5.3 Flujo Dev_SAAS (pre-liberación)

Trigger: T1 (manual) cuando un lote de tickets está listo para pre-prod.

```
Trigger (con metadata: requested_env = "dev_saas", version = "8.6.16.X")
  │
  ▼
qa-orchestrator
  │
  ├──▶ ticket-analyst
  │       jira-reader OP-1  → verificar que el ticket está en "A Versionar"
  │       jira-reader OP-3  → extraer test_cases del comentario Master previo
  │       (obligatorio — sin comentario Master no se puede proceder con Dev_SAAS)
  │
  ├──▶ test-engine (mode: run_existing, env: dev_saas)
  │       Ejecutar las mismas sessions con TESTING_URL apuntando a Dev_SAAS
  │       Los resultados pueden diferir del Master (eso es normal y esperado)
  │
  ├──▶ test-reporter (operation: validate_devsaas, prerelease_version: "8.6.16.X")
  │       Construir payload v2.0 con test_results[] actualizados (✔/✘ real)
  │       jira-writer MODO C: comentario Dev_SAAS con bullets del Master + resultados reales
  │       Si todo ✔: transición Done (31)
  │       Si hay ✘: jira-writer MODO D por cada ✘ — crear ticket nuevo + link "Relates"
  │                 stacktrace y log_excerpt del test fallido van en la descripción del bug
  │
  ▼
DONE
```

### 5.4 Flujo de Generación de Tests Nuevos

Trigger: test-engine determina que el módulo no tiene sessions mapeadas.

```
test-engine recibe: module = "tags" (no existe en test-map.json)
  │
  ├──▶ Test Discoverer → busca sessions/ → no encuentra match
  │       Escala al Orchestrator: generate_and_run requerido
  │
  ├──▶ Orchestrator verifica: ¿existe POM para el módulo?
  │       Si NO: invocar pom-generator con los hints del ticket
  │              POM generado → src/pages/{module}_page/
  │
  ├──▶ test-engine (mode: generate_and_run)
  │       Invocar create-session con:
  │         - test_hints como base del flujo
  │         - acceptance_criteria como assertions
  │         - POM del módulo como referencia
  │       Session generada → sessions/{domain}/NewXxx.test.ts
  │
  ├──▶ test-engine ejecuta la session generada
  │       Si compila y corre: parsear resultados
  │       Si errores de setup (POM faltante, locators): escalar a humano
  │
  ├──▶ test-reporter (si resultados confiables)
  │       Postear comentario con flag: auto_generated: true
  │
  ├──▶ Orchestrator actualiza test-map.json
  │       Agregar nuevo módulo con la session generada
  │
  ▼
DONE — Session queda en el repo para futura reutilización
```

---

## 6. Mapeo Módulo → Sessions (test-map.json)

Este archivo es la fuente de verdad para el Test Discoverer. Mapea los módulos funcionales del CMS a los archivos de test existentes en `sessions/`.

### 6.1 test-map.json (con sessions reales del repo)

```json
{
  "version": "1.0",
  "last_updated": "2026-04-13",
  "modules": {
    "post": {
      "sessions": ["NewPost", "NewListicle", "NewLiveBlog", "MassPublishNotes"],
      "paths": [
        "sessions/post/NewPost.test.ts",
        "sessions/post/NewListicle.test.ts",
        "sessions/post/NewLiveBlog.test.ts",
        "sessions/post/MassPublishNotes.test.ts"
      ],
      "page_objects": ["src/pages/post_page/"],
      "keywords": ["nota", "post", "listicle", "liveblog", "editor", "publicar", "borrador", "contenido", "nota IA"],
      "component_jira": "Post"
    },
    "ai-post": {
      "sessions": ["NewAIPost"],
      "paths": ["sessions/post/NewAIPost.test.ts"],
      "page_objects": ["src/pages/post_page/ai_note/"],
      "keywords": ["nota IA", "AI", "prompt", "generación IA", "AI_POST", "inteligencia artificial", "IA genera"],
      "component_jira": "AI"
    },
    "video": {
      "sessions": ["NewYoutubeVideo", "NewEmbeddedVideo", "MassPublishVideos"],
      "paths": [
        "sessions/video/NewYoutubeVideo.test.ts",
        "sessions/video/NewEmbeddedVideo.test.ts",
        "sessions/video/MassPublishVideos.test.ts"
      ],
      "page_objects": ["src/pages/videos_page/"],
      "keywords": ["video", "youtube", "embedded", "subir video", "iframe", "reproductor"],
      "component_jira": "Video"
    },
    "images": {
      "sessions": ["MassPublishImages"],
      "paths": ["sessions/images/MassPublishImages.test.ts"],
      "page_objects": ["src/pages/images_pages/"],
      "keywords": ["imagen", "image", "subir imagen", "imágenes", "gallery", "foto"],
      "component_jira": "Images"
    },
    "auth": {
      "sessions": ["FailedLogin"],
      "paths": ["sessions/auth/FailedLogin.test.ts"],
      "page_objects": ["src/pages/login_page/"],
      "keywords": ["login", "auth", "autenticación", "credenciales", "two-factor", "2FA"],
      "component_jira": "Auth"
    },
    "cross": {
      "sessions": ["PostAndVideo"],
      "paths": ["sessions/cross/PostAndVideo.test.ts"],
      "page_objects": ["src/pages/post_page/", "src/pages/videos_page/"],
      "keywords": ["cross-component", "post y video", "flujo completo", "integración"],
      "component_jira": null
    }
  }
}
```

**Ubicación:** `.claude/pipelines/test-engine/references/test-map.json`

### 6.2 Estrategia de matching del Test Discoverer

```
Input: classification.module = "ai-post"
       classification.domain  = "post"
       summary keywords       = ["nota", "IA", "prompt"]

Paso 1: Exact module match en test-map.json
        → Hit: "ai-post"

Paso 2: Verificar que los paths existen en disco
        → sessions/post/NewAIPost.test.ts ✔

Paso 3: Si no hay exact match → fuzzy match por keywords
        → Buscar en todos los modules cuáles tienen keywords que intersecten

Paso 4: Si no hay match → escalar a Orchestrator: mode = "generate_and_run"
```

### 6.3 Mapeo Componente Jira → Módulo interno

```json
{
  "AI": "ai-post",
  "Post": "post",
  "Video": "video",
  "Images": "images",
  "Auth": "auth",
  "Editor": "post",
  "Tags": null,
  "Planning": null,
  "Admin": null
}
```

Los módulos con `null` no tienen tests aún — siempre irán a `generate_and_run`.

**Ubicación:** `.claude/pipelines/ticket-analyst/references/component-to-module.json`

---

## 7. Contratos de Comunicación Inter-Pipeline

### 7.1 Envelope de mensajes

```json
{
  "schema_version": "2.0",
  "source_agent": "qa-orchestrator | ticket-analyst | test-engine | test-reporter | selenium-runner",
  "operation": "string",
  "ticket_key": "NAA-XXXX",
  "correlation_id": "evt-20260413-001",
  "timestamp": "ISO-8601",
  "payload": { }
}
```

El `correlation_id` vincula todos los mensajes de un mismo flujo para trazabilidad en `pipeline-logs/`.

> El schema v2.0 usa `source_agent` (no `from_pipeline`) y `operation` (no `action`) para alinear con los contratos definidos en `jira-reader/references/pipeline-schema.md` y `jira-writer/references/pipeline-schema.md`.

### 7.2 Pipeline Context (estado compartido)

El Orchestrator mantiene este objeto que se enriquece a medida que avanza el pipeline:

```json
{
  "pipeline_id": "pipe-20260413-001",
  "schema_version": "2.0",
  "trigger_event": { },
  "ticket_analysis": {
    "criteria": [],
    "test_hints": [],
    "module": null,
    "testable": null,
    "previous_test_cases": [],
    "jira_metadata": {
      "jiraSummary":      null,
      "ticketType":       null,
      "ticketStatus":     null,
      "assignee":         null,
      "component":        null,
      "sprint":           null,
      "executiveSummary": null,
      "parentKey":        null,
      "linkedIssues":     [],
      "fixVersion":       null,
      "priority":         null,
      "jiraLabels":       [],
      "jiraAttachments":  []
    }
  },
  "test_execution": {
    "suite_summary": { "total": 0, "passed": 0, "failed": 0 },
    "test_results": [],
    "test_file": null,
    "environment_url": null
  },
  "report_result": {
    "status": null,
    "actions_taken": [],
    "errors": []
  },
  "current_stage": "ticket_analysis | test_execution | reporting | done | error",
  "error_log": [],
  "human_escalation": false,
  "auto_generated_tests": false
}
```

### 7.3 Manejo de errores

| Error | Pipeline que lo detecta | Acción |
|-------|------------------------|--------|
| Ticket no encontrado | ticket-analyst | Abortar + informar al Orchestrator |
| Ticket sin criterios en descripción (OP-6 `criteria: []`) | ticket-analyst | Leer ticket completo (comments + campos custom + título). Inferir desde contexto. Si criteria ≥ 1: continuar con `source: "inferred"`. Si falla: `testable: false` + escalación pidiendo más info al equipo. |
| Ticket no testable (manual/diseño) | ticket-analyst | `testable: false` → Orchestrator escala |
| Módulo sin tests ni POM | test-engine | Señalar `generate_and_run` al Orchestrator |
| Tests no compilan (error TS) | test-engine | Abortar + devolver logs de error de TypeScript |
| Selenium timeout / crash | test-engine | Reintentar 1 vez. Si falla: `status: error` en `test_results[]` |
| Jest no encontró el test | test-engine | Verificar nombre exacto del archivo (`PascalCase.test.ts`) |
| jira-writer devuelve `status: "partial"` | test-reporter | Registrar `errors[]` en el Pipeline Execution Record. Escalar acciones que fallaron. |
| jira-writer devuelve `status: "error"` | test-reporter | Retry con backoff, máximo 3 intentos. Si persiste: escalar a humano. |
| Falta `prerelease_version` en `validate_devsaas` | test-reporter | Bloquear — pedir versión antes de continuar (jira-writer pregunta solo en modo manual) |
| ADF inválido (campo es string) | test-reporter | **BLOQUEAR** — reconstruir como ADF JSON antes de enviar |
| No existe comentario Master previo para Dev_SAAS | test-reporter | Abortar flujo Dev_SAAS — OP-3 requiere ese comentario como base |

---

## 8. Modelo de Datos — Pipeline Execution Record

Cada ejecución queda registrada en `pipeline-logs/` para trazabilidad.

```json
{
  "pipeline_id": "pipe-20260413-001",
  "started_at": "2026-04-13T14:30:00Z",
  "completed_at": "2026-04-13T14:32:45Z",
  "duration_ms": 165000,
  "trigger": {
    "type": "manual",
    "ticket_key": "NAA-4429",
    "requested_env": "master"
  },
  "stages": {
    "ticket_analysis": {
      "status": "completed",
      "duration_ms": 8000,
      "module_matched": "ai-post",
      "testable": true
    },
    "test_execution": {
      "status": "completed",
      "duration_ms": 142000,
      "mode_used": "discover_and_run",
      "sessions_run": ["NewAIPost"],
      "passed": 1,
      "failed": 0
    },
    "reporting": {
      "status": "completed",
      "duration_ms": 15000,
      "env": "master",
      "comment_posted": true,
      "transition_applied": "42"
    }
  },
  "final_status": "completed_all_pass | completed_with_failures | error | escalated",
  "human_escalation": false,
  "auto_generated_tests": false
}
```

**Almacenamiento:**
- **Fase 1-4:** Archivos JSON en `pipeline-logs/pipe-{date}-{id}.json`.
- **Fase 5+:** SQLite local (`pipeline-logs/history.db`) si se necesitan queries históricas.

---

## 9. Implementación Técnica — Fases

### Fase 0 — Prerequisitos (puede hacerse hoy)

**Objetivo:** Asegurar que las piezas existentes están listas y crear los archivos de configuración base.

**Checklist:**
- [ ] Verificar `jira-reader` end-to-end: invocar sobre un ticket real de NAA.
- [ ] Verificar `jira-writer` end-to-end: postear comentario de prueba en un ticket no-productivo.
- [ ] Crear `pipeline-logs/` con `.gitkeep` (para logs de ejecución).
- [ ] Crear `.claude/pipelines/test-engine/references/test-map.json` con el contenido de la sección 6.1.
- [ ] Crear `.claude/pipelines/ticket-analyst/references/component-to-module.json` con el mapeo de sección 6.3.
- [ ] Elegir un ticket real de NAA como caso de prueba del pipeline completo.

**Entregables de la Fase 0:**
```
.claude/pipelines/
├── test-engine/
│   └── references/
│       └── test-map.json           ← NUEVO (ver sección 6.1)
└── ticket-analyst/
    └── references/
        └── component-to-module.json ← NUEVO (ver sección 6.3)
pipeline-logs/
└── .gitkeep                         ← NUEVO
```

---

### Fase 1 — Ticket Analyst Pipeline ✅ COMPLETADA

**Objetivo:** Dado un ticket key, producir el JSON de análisis completo.

**Entregables creados:**

1. **`.claude/pipelines/ticket-analyst/PIPELINE.md`** — pasos TA-1 a TA-9, contratos de
   input/output, manejo de errores, consideraciones GitHub Actions, máquina de estados Jira.

2. **`.claude/pipelines/ticket-analyst/references/classification-rules.md`** — reglas de
   clasificación completas: mapeo component_jira, algoritmo de confidence (6 pasos),
   reglas de action_type, edge cases (componente null, ticket sin descripción, etc.).

**Correcciones aplicadas respecto al diseño original:**
- Trigger corregido: `"Revisión"` (no `"A Versionar"`) es el estado que activa QA en Master
- OP-6 extendido: sintetiza criteria desde TODO el contenido del ticket (descripción + comentarios + campos custom deploy/SQL/VFS), no solo desde la sección formal
- Inferencia de criteria: si no hay sección formalizada, construir desde contexto; escalar si es imposible
- Flujo Dev_SAAS corregido: trigger = versión liberada manualmente + JQL de tickets en `Done`

**Validación pendiente (milestone completo: 3 tickets E2E):**
- Ticket AI (NAA-4429 ya ejecutado en Fase 0 — usar como referencia)
- 2 tickets adicionales de componentes distintos (Post/Video/Images)
- Verificar `classification.module`, `confidence`, `criteria_source` correctos en cada uno

**Trigger de prueba (manual):**
```
Usuario en Claude Code: "Analizá el ticket NAA-XXXX y dame el JSON de análisis"
Claude ejecuta ticket-analyst pipeline con ticket_key: NAA-XXXX
```

---

### Fase 2 — Test Engine: Discovery + Runner (semanas 2-4)

**Objetivo:** Dado el output del ticket-analyst, encontrar y ejecutar sessions existentes.

**Entregables:**

1. **Pipeline `test-engine`** (`.claude/pipelines/test-engine/PIPELINE.md`):
   - Test Discoverer: cómo leer `test-map.json` y buscar por module.
   - Test Runner: comando exacto de Jest con todos los flags requeridos.
   - Result Parser: cómo interpretar el JSON output de Jest.
   - Lógica de los tres modos: `discover_and_run`, `run_existing`, `generate_and_run`.

2. **Formato del JSON output de Jest** (para el Result Parser):
   Jest con `--json` produce un archivo con estructura:
   ```json
   {
     "numPassedTests": 1,
     "numFailedTests": 0,
     "testResults": [
       {
         "testFilePath": "...",
         "status": "passed | failed",
         "testResults": [
           {
             "fullName": "NewAIPost",
             "status": "passed | failed",
             "duration": 42000,
             "failureMessages": []
           }
         ]
       }
     ]
   }
   ```

3. **Validación:**
   - Ejecutar el flujo ticket-analyst → test-engine sobre tickets con sessions existentes.
   - Verificar que el JSON de resultados es correcto.
   - Verificar que errores de infra (Selenium timeout) se distinguen de errores de aplicación.

---

### Fase 3 — Test Reporter (semanas 4-5)

**Objetivo:** Dado el output del test-engine, escribir feedback correcto en Jira.

**Entregables:**

1. **Pipeline `test-reporter`** (`.claude/pipelines/test-reporter/PIPELINE.md`):
   - Mapeo de resultados `pass/fail` al formato de comentario `jira-writer`.
   - Construcción del input para `jira-writer` Modo B (master) y Modo C (dev_saas).
   - Lógica de transición: cuándo usar `42` vs `2` vs `31`.
   - Para Dev_SAAS con fallos: invocar `jira-writer` Modo D por cada ✘.
   - ADF construction: el reporter construye el body ADF antes de pasarlo a jira-writer.

2. **Validación:**
   - Verificar que los comentarios generados son idénticos en formato a los escritos manualmente.
   - Verificar que las transiciones se ejecutan correctamente.
   - Probar el flujo Dev_SAAS con un ticket que tiene errores (Modo D).

---

### Fase 4 — Orchestrator + Polling (semanas 5-7)

**Objetivo:** Conectar todo. Un único punto de entrada que ejecuta el pipeline completo.

**Entregables:**

1. **Pipeline `qa-orchestrator`** (`.claude/pipelines/qa-orchestrator/PIPELINE.md`):
   - Instrucciones para recibir un trigger event normalizado.
   - Secuencia de invocación: ticket-analyst → test-engine → test-reporter.
   - Lógica de decisión por tipo de flujo (sección 5).
   - Manejo de escalaciones.
   - Registro del Pipeline Execution Record en `pipeline-logs/`.

2. **Script de polling** (`.claude/pipelines/qa-orchestrator/scripts/poll-jira.ts`):
   - Ejecutable con `tsx` (disponible en el proyecto).
   - Usa los JQL queries de la sección 4.3.
   - Para cada ticket encontrado: genera el trigger event y lo muestra al usuario.
   - El script no invoca Claude directamente — produce los trigger events para que el usuario (o un cron externo) los pase al Orchestrator.
   
   ```bash
   # Ejecución manual del script de polling:
   ./node_modules/.bin/tsx .claude/pipelines/qa-orchestrator/scripts/poll-jira.ts
   ```

3. **Validación end-to-end:**
   - Ejecutar el pipeline completo sobre un ticket real con trigger manual.
   - Flujo: trigger → ticket-analyst → test-engine → test-reporter → Jira actualizado.
   - Verificar Pipeline Execution Record en `pipeline-logs/`.

**Milestone de Fase 4:** Pipeline ejecutable de extremo a extremo con trigger manual para tickets que tienen sessions existentes.

---

### Fase 5 — Test Generator (semanas 7-9)

**Objetivo:** Cuando no hay sessions para un módulo, generarlas automáticamente.

**Entregables:**

1. **Extensión del test-engine** para modo `generate_and_run`:
   - Invocar `create-session` skill con los `test_hints` como descripción del flujo.
   - Invocar `pom-generator` si el módulo no tiene Page Objects existentes.
   - Guardar la session generada en `sessions/{domain}/` con nombre `PascalCase.test.ts`.
   - Actualizar `test-map.json` con el nuevo módulo y path.
   - Marcar el resultado con `auto_generated: true` en el Pipeline Execution Record.

2. **Convenciones para tests generados:**
   - Usar `runSession()` como punto de entrada (obligatorio).
   - Imports al final del archivo con extensión `.js`.
   - `description()` Allure con el `summary` y los `test_hints` del ticket.
   - `log.info("✅ ...")` como cierre exitoso.
   - Tests generados van a `sessions/{domain}/AutoGenerated_{Ticket}.test.ts`.
   - Flag `auto_generated: true` como comentario al inicio del archivo para identificación futura.
   - **Pasar `jira_metadata` al tercer argumento de `runSession()`** para poblar Allure con trazabilidad completa:
     ```typescript
     runSession("AutoGenerated NAA-XXXX — Nombre del flujo", async ({ driver, opts, log }) => {
       // lógica generada
     }, {
       issueId: "NAA-XXXX",
       epic:    "Módulo",
       // ...campos Allure clásicos...
       // ...campos Jira extraídos del ticket-analyst:
       jiraSummary:  "...",
       ticketType:   "QA Bug - Front",
       ticketStatus: "En desarrollo",
       component:    "AI",
       sprint:       "...",
       parentKey:    "NAA-XXXX",
       linkedIssues: ["NAA-YYYY"],
       fixVersion:   "8.6.16.X",
       priority:     "Medium"
     });
     ```

3. **Validación:**
   - Generar sessions para 3 módulos que no tienen tests (ej: Tags, Planning).
   - Verificar que los archivos generados compilan (`npx tsc --noEmit`).
   - Verificar que ejecutan sin errores de setup.

**Milestone de Fase 5:** Pipeline capaz de generar tests para módulos sin cobertura.

---

### Fase 6 — Automatización Continua (semanas 9-12)

**Objetivo:** Eliminar la necesidad de trigger manual para el flujo estándar.

**Opción A — Scheduled triggers via Claude Code:**
- Usar `CronCreate` de Claude Code para programar invocaciones periódicas del Orchestrator.
- El Orchestrator corre el polling sweep automáticamente.
- Requiere que Claude Code esté activo en el momento de la ejecución.

**Opción B — Jira Webhooks (requiere servidor externo):**
```
Jira Webhook → POST https://{servidor}/api/jira-event
                     │
                     ▼
              Endpoint receptor (Node.js/Express)
                     │
                     ▼
              Invoca Claude Code CLI con el trigger event
```

Configuración del webhook en Jira Cloud:
- URL: `https://{servidor}/api/jira-event`
- Eventos: `issue_updated`, `comment_created`
- Filtro JQL: `project = NAA AND issuetype in ("QA Bug - Front","QA Bug - Back")`

> **Nota WSL2:** Los webhooks requieren un servidor con IP pública. En desarrollo local se puede usar `ngrok` o similar para exponer el puerto. Para producción, requiere infraestructura dedicada.

---

## 10. Estructura de Archivos del Sistema

```
.claude/
├── pipelines/
│   ├── sync-docs/              ← (existente)
│   ├── validate-ssot/          ← (existente)
│   │
│   ├── ticket-analyst/         ← NUEVO — Fase 1
│   │   ├── PIPELINE.md
│   │   └── references/
│   │       ├── component-to-module.json
│   │       └── classification-rules.md
│   │
│   ├── test-engine/            ← NUEVO — Fase 2
│   │   ├── PIPELINE.md
│   │   └── references/
│   │       └── test-map.json
│   │
│   ├── test-reporter/          ← NUEVO — Fase 3
│   │   ├── PIPELINE.md
│   │   └── references/
│   │       └── result-to-comment-map.md
│   │
│   └── qa-orchestrator/        ← NUEVO — Fase 4
│       ├── PIPELINE.md
│       └── scripts/
│           └── poll-jira.ts
│
├── skills/
│   ├── jira-reader/            ← (existente, sin modificar)
│   ├── jira-writer/            ← (existente, sin modificar)
│   ├── create-session/         ← (existente, sin modificar)
│   └── pom-generator/          ← (existente, sin modificar)
│
pipeline-logs/                  ← NUEVO — directorio de trazabilidad
└── .gitkeep
```

---

## 11. Consideraciones Específicas del Entorno

### 11.1 ESM + WSL2

Todo comando Jest en el pipeline debe seguir la forma:
```bash
NODE_OPTIONS='--experimental-vm-modules' USE_GRID=true IS_HEADLESS=true node node_modules/.bin/jest {TestName} --json --outputFile={path}
```

- `NODE_OPTIONS='--experimental-vm-modules'` → obligatorio por ESM en WSL2.
- `USE_GRID=true IS_HEADLESS=true` → para ejecución en pipeline sin UI.
- `--json --outputFile=pipeline-logs/results-{ticket}-{exec}.json` → para parsear resultados.
- `{TestName}` → nombre del archivo sin extensión y sin path (Jest filtra por regex en el nombre).

### 11.2 ADF en todas las escrituras Jira

El test-reporter **nunca** pasa strings markdown a `jira-writer`. Todo body es un objeto ADF JSON:
```json
{
  "type": "doc",
  "version": 1,
  "content": [
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Se valida sobre " },
        { "type": "text", "text": "Master", "marks": [{ "type": "strong" }] },
        { "type": "text", "text": " los cambios aplicados:" }
      ]
    },
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "Caso de prueba... ✔" }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

Ver `.claude/skills/jira-writer/references/adf-format-guide.md` para la referencia completa.

### 11.3 Naming de sessions

Los tests siguen la convención `PascalCase.test.ts`. Para el Test Runner, el `{TestName}` que se pasa a Jest es el nombre del archivo sin extensión:

| Session file | TestName para Jest |
|---|---|
| `sessions/post/NewAIPost.test.ts` | `NewAIPost` |
| `sessions/video/NewYoutubeVideo.test.ts` | `NewYoutubeVideo` |
| `sessions/post/NewListicle.test.ts` | `NewListicle` |

### 11.4 Variables de entorno

El pipeline necesita que el `.env` del repo esté configurado. Para Dev_SAAS, el test-engine cambia `TESTING_URL` al ambiente pre-productivo antes de ejecutar.

| Variable | Valor para pipeline |
|---|---|
| `USE_GRID` | `true` |
| `IS_HEADLESS` | `true` |
| `TESTING_URL` | URL del ambiente a probar (master o dev_saas) |
| `MAX_INSTANCES` | `1` (una sesión por vez en pipeline) |

---

## 12. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Tests generados con assertions débiles (falsos positivos) | Feedback incorrecto a devs | `auto_generated: true` en el resultado. Human review obligatorio antes de usarlos como fuente de verdad. |
| Rate limits de Jira API vía MCP | Pipeline se corta en reporting | Retry con backoff en test-reporter, máximo 3 intentos. |
| Selenium flaky tests (timeouts, elementos no encontrados) | Falsos negativos | El retry con exponential backoff ya está en `src/core/wrappers/`. Reintentar el test una vez. Si sigue fallando, reportar como `error` (no `fail`) para que el Orchestrator lo distinga. |
| `test-map.json` desactualizado | Sessions no se descubren | El Test Discoverer también hace fuzzy match por keywords como fallback. Regla: cada vez que se agrega una nueva session al repo, actualizar `test-map.json`. |
| Ticket con descripción ambigua | ticket-analyst no puede clasificar | `testable: false` → escalación. El pipeline postea en Jira un comentario pidiendo más contexto. |
| ADF mal construido en el reporter | Jira rechaza la escritura | El reporter valida el objeto ADF antes de enviarlo. Si el campo no tiene `"type": "doc", "version": 1`, bloquear y reconstruir. |
| Módulo sin POM ni tests | test-engine en `generate_and_run` con infraestructura faltante | pom-generator primero, luego create-session. Si el módulo es demasiado complejo para generación automática, escalar a humano. |

---

## 13. Métricas de Éxito

| Métrica | Cómo se mide | Target Fase 4 |
|---------|-------------|---------------|
| Tiempo ticket → feedback en Jira | Timestamp del trigger vs timestamp del comentario | < 10 min para sessions existentes |
| Tasa de clasificación correcta del ticket-analyst | Revisión manual de N pipelines ejecutados | > 85% módulos clasificados correctamente |
| Tasa de discovery | Tickets que matchearon session existente vs. que requirieron generación | > 65% discovery rate (6 módulos de 9 tienen sessions) |
| Falsos positivos/negativos | Revisión manual post-pipeline | < 10% resultados incorrectos |
| Pipelines sin intervención humana | Pipelines completados vs. escalados | > 70% automáticos en flujo Master |
| Coverage del test-map | Módulos con sessions / módulos con tickets QA activos | Incremento medible en cada Fase 5 |

---

## 14. Resumen de Implementación

```
Fase     Entregable                                  Dependencia previa
────────────────────────────────────────────────────────────────────────────
0        test-map.json + directorios base             —
1        Pipeline ticket-analyst                      jira-reader ✅
2        Pipeline test-engine (discovery + runner)    test-map.json
3        Pipeline test-reporter                       jira-writer ✅
4        Pipeline qa-orchestrator + poll-jira.ts      Fases 1-3
5        Extensión generate_and_run en test-engine    create-session ✅
                                                      pom-generator ✅
6        Automatización continua (cron / webhooks)    Fase 4 validada
```

**Primer milestone funcional (Fase 4):** Pipeline ejecutable de extremo a extremo con trigger manual, para tickets con sessions existentes. Tiempo estimado: 7 semanas.

**Segundo milestone (Fase 5):** Pipeline capaz de generar tests para módulos sin cobertura.

**Tercer milestone (Fase 6):** Pipeline completamente autónomo sin intervención manual para el flujo estándar.

---

## Apéndice A — Glosario

| Término | Definición |
|---------|-----------|
| Pipeline | Archivo `.claude/pipelines/X/PIPELINE.md` invocado por Claude para ejecutar una secuencia de pasos |
| Session | Test E2E en `sessions/{domain}/PascalCase.test.ts` — unidad ejecutable del framework |
| Trigger | Evento normalizado que inicia el qa-orchestrator |
| Test hint | Descripción en lenguaje natural de qué debería probarse, inferida del ticket |
| Discovery | Proceso de encontrar sessions existentes que corresponden a un módulo del ticket |
| Escalación | Derivación a humano cuando el pipeline no puede resolver |
| Pipeline Context | Estado acumulado durante la ejecución del qa-orchestrator |
| Module | Agrupación funcional del CMS con sessions asociadas (ej: `ai-post`, `video`) |
| ADF | Atlassian Document Format — formato JSON obligatorio para todo contenido rich text en Jira |

## Apéndice B — Account IDs de referencia

| Persona | Account ID | Rol |
|---------|-----------|-----|
| Juanto (Juan Caldera) | `712020:59e4ac7b-f44f-45cb-a444-44746cecec49` | QA / Reporter default |
| Paula Rodriguez | `633b5c898b75455be4580f5b` | Dev Frontend |
| Verónica Tarletta | `5c51d02898c1ac41b4329be3` | Dev Backend |
| Claudia Tobares | `5c1d65c775b0e95216e8e175` | Dev Editor (CKEditor) |

## Apéndice C — Jira Cloud ID y transiciones

- **Cloud ID:** `c303d73b-75df-492e-9e64-479b722035cf`
- **Proyecto:** `NAA` (Nuevo Administrador - AGIL)
- **Base URL:** `https://bluestack-cms.atlassian.net`

| transition.id | Destino | Cuándo usarlo en el pipeline |
|---|---|---|
| `2` | FEEDBACK | Validación Master con algún ✘ |
| `31` | Done | Validación Dev_SAAS toda ✔ |
| `42` | A Versionar | Validación Master toda ✔ |

Referencia completa de transiciones: `.claude/skills/jira-reader/references/transitions.md`

## Apéndice D — Referencia cruzada de skills existentes

| Pipeline paso | Skill que usa | Operación | Ubicación |
|---|---|---|---|
| ticket-analyst: contexto del ticket | `jira-reader` | OP-1 `read_ticket` | `.claude/skills/jira-reader/` |
| ticket-analyst: buscar tickets por JQL | `jira-reader` | OP-2 `search_jql` | `.claude/skills/jira-reader/` |
| ticket-analyst: extraer test_cases del Master | `jira-reader` | OP-3 `extract_test_cases` | `.claude/skills/jira-reader/` |
| ticket-analyst: extraer criterios para mapear tests | `jira-reader` | **OP-6 `extract_criteria`** | `.claude/skills/jira-reader/` |
| test-engine genera session nueva | `create-session` | — | `.claude/skills/create-session/` |
| test-engine genera POM faltante | `pom-generator` | — | `.claude/skills/pom-generator/` |
| test-reporter valida en Master | `jira-writer` | `validate_master` (Modo B) | `.claude/skills/jira-writer/` |
| test-reporter valida en Dev_SAAS | `jira-writer` | `validate_devsaas` (Modo C→D) | `.claude/skills/jira-writer/` |
| test-reporter crea bug por fallo | `jira-writer` | `create_bug` (Modo A) | `.claude/skills/jira-writer/` |

### Contratos de integración (pipeline-schema.md)

Los contratos v2.0 completos viven en:
- Input/Output de `jira-reader` hacia el pipeline → `.claude/skills/jira-reader/references/pipeline-schema.md`
- Input/Output de `jira-writer` hacia el pipeline → `.claude/skills/jira-writer/references/pipeline-schema.md`
- Flujo completo Dev_SAAS con ejemplos reales → `.claude/skills/jira-writer/references/devsaas-flow.md`

> **Nota sobre MODO F:** El `jira-reader/references/pipeline-schema.md` hace referencia a un "MODO F" de jira-writer como punto de entrada unificado para el pipeline. Actualmente jira-writer maneja cada operación por separado (`validate_master`, `validate_devsaas`, etc.). Si se decide implementar MODO F como modo unificado, deberá documentarse en `jira-writer/SKILL.md` antes de comenzar la Fase 3.
