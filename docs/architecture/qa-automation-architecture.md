# QA Automation Pipeline — Arquitectura Multi-Agente

**Proyecto:** Bluestack CMS QA Automation  
**Autor:** Juan Caldera  
**Versión:** 3.0 — Post-auditoría 2026-04-13  
**Documento previo:** v2.0 (reemplazado por este)

---

## META: Estado del Documento

### Qué cambió de v2.0 a v3.0

| # | Cambio | Sección afectada |
|---|--------|-----------------|
| 1 | test-generator extraído como pipeline separado | §3.2, §15 Fase 5 |
| 2 | poll-jira.ts gap resuelto con CronCreate explícito | §4.4 |
| 3 | Envelope de mensajes eliminado; pipeline_id en payloads directos | §7.1 |
| 4 | Idempotencia agregada al Pipeline Context | §7.2 |
| 5 | step_log[] agregado al Pipeline Execution Record | §8.1 |
| 6 | Sección de Seguridad y Credenciales creada | §9 |
| 7 | Sección de Observabilidad creada | §10 |
| 8 | 11.5 (TESTING_URL Dev_SAAS) y 11.6 (context window budget) agregadas | §11 |
| 9 | Tabla de errores ampliada con 6 casos críticos | §7.3 |
| 10 | Account IDs removidos del Apéndice B → archivo no versionado | §9.3 |
| 11 | SQLite eliminado — JSON files únicamente | §8.2 |
| 12 | confidence_score en fuzzy matching | §6.2 |
| 13 | sync-test-map.ts documentado | §6.4 |
| 14 | Fase 5 agrega dry_run obligatorio antes de postear en Jira | §15 Fase 5 |
| 15 | Fase 6 reducida a GitHub Actions schedule (webhooks eliminados del alcance) | §15 Fase 6 |
| 16 | Métricas ampliadas: token cost, P95, test-map drift | §13 |
| 17 | Flowchart de fases completo | §15 |

---

### Decisiones Abiertas — Resolver antes de la fase indicada

*No hay decisiones abiertas pendientes.*

---

### Decisiones Resueltas — DECISION-01

#### DECISION-01 — MODO F en jira-writer ✅ Resuelta 2026-04-14

**Decisión tomada: Opción A — MODO F unificado.**

**Motivación:** Robustez a largo plazo para un pipeline corriendo en GitHub Actions de forma
continua. Un único punto de entrada en jira-writer simplifica el contrato inter-pipeline,
centraliza la lógica de idempotencia y reduce la superficie de fallo cuando el job se re-ejecuta.

**Implementación:**
- `jira-writer/SKILL.md` ya contenía MODO F como routing layer — se enriqueció con:
  - F1.5: chequeo de idempotencia explícito (re-run safe)
  - F2.1: tabla de entornos incluyendo `testing`
  - F6: escritura de `test_reporter_output` en Pipeline Context
- `.claude/pipelines/test-reporter/PIPELINE.md` creado (Fase 3 desbloqueada)
- `jira-reader/references/pipeline-schema.md` ya referenciaba MODO F correctamente — sin cambios necesarios

**Fase 3 puede arrancar directamente.**

---

### Decisiones Resueltas en v3.0

| ID | Decisión | Resolución |
|----|----------|-----------|
| D-01 | MODO F en jira-writer | Opción A: MODO F unificado implementado. test-reporter usa un único payload; jira-writer enruta internamente. Ver sección DECISION-01 arriba. |
| D-02 | Trigger automático poll-jira.ts | Usar `CronCreate` de Claude Code para Fases 4-5. GitHub Actions schedule para Fase 6. |
| D-03 | Envelope de mensajes inter-pipeline | Eliminado. `pipeline_id` se agrega como campo en payloads directos existentes. |
| D-04 | Idempotencia de escrituras en Jira | `last_comment_id` en Pipeline Context. Verificar antes de postear. |
| D-05 | SQLite para histórico | Eliminado. JSON files en `pipeline-logs/` son suficientes para el volumen actual. |
| D-06 | test-generator como pipeline separado | Sí. Extraído de test-engine. Fase 5 es test-generator, no extensión de test-engine. |
| D-07 | Tests auto-generados → postear en Jira directamente | No. Dry_run obligatorio hasta validación manual. |
| D-08 | Account IDs en documento versionado | Mover a `.claude/references/team-accounts.md` (en .gitignore). |
| D-09 | Context window budget | Límite operativo: 80K tokens activos por pipeline run. Ver §11.6. |
| D-10 | Phase 6 scope | Solo GitHub Actions schedule. Jira webhooks fuera de alcance por ahora. |

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

**Restricción de arquitectura:** Todo el pipeline corre dentro de Claude Code. No hay procesos externos autónomos hasta Fase 6. Claude usa el `Bash` tool para ejecutar Jest, los MCP tools de Atlassian para leer/escribir en Jira, y sus tools de filesystem para manipular el repositorio.

**Advertencia (experimental):** Esta arquitectura — pipelines complejos corriendo íntegramente en Claude Code CLI — no tiene casos documentados en producción a Abril 2026. Es el approach correcto para un equipo de 1 persona con entorno WSL2. Para Fase 6+, parte de la arquitectura migrará a GitHub Actions.

---

## 2. Estado Actual del Sistema

### 2.1 Piezas existentes y listas

| Pieza | Ubicación | Estado |
|-------|-----------|--------|
| `jira-reader` | `.claude/skills/jira-reader/` | ✅ Operativo |
| `jira-writer` | `.claude/skills/jira-writer/` | ✅ Operativo |
| `create-session` | `.claude/skills/create-session/` | ✅ Operativo |
| `pom-generator` | `.claude/skills/pom-generator/` | ✅ Operativo |
| 14 tests en `sessions/` | `sessions/{auth,post,video,images,cross,stress,debug}/` | ✅ Ejecutables |
| MCP Atlassian | `.mcp.json` | ✅ Configurado |

### 2.2 Piezas que hay que construir

| Pieza | Ubicación propuesta | Fase |
|-------|--------------------|----|
| `test-map.json` | `.claude/pipelines/test-engine/references/` | 0 |
| `component-to-module.json` | `.claude/pipelines/ticket-analyst/references/` | 0 |
| `sync-test-map.ts` | `scripts/` | 0 |
| Pipeline `ticket-analyst` | `.claude/pipelines/ticket-analyst/` | 1 |
| Pipeline `test-engine` | `.claude/pipelines/test-engine/` | 2 |
| Pipeline `test-reporter` | `.claude/pipelines/test-reporter/` | 3 |
| Pipeline `qa-orchestrator` | `.claude/pipelines/qa-orchestrator/` | 4 |
| Script `poll-jira.ts` | `.claude/pipelines/qa-orchestrator/scripts/` | 4 |
| Pipeline `test-generator` | `.claude/pipelines/test-generator/` | 5 |
| `failed-reports.json` | `pipeline-logs/` | 4 |

### 2.3 Skills existentes que el pipeline reutiliza

- **Generación de tests nuevos** → `create-session` (skill existente, invocada por test-generator)
- **Generación de Page Objects nuevos** → `pom-generator` (skill existente, invocada por test-generator)
- **Lectura de tickets Jira** → `jira-reader` (skill existente, invocada por ticket-analyst)
- **Escritura en Jira** → `jira-writer` (skill existente, invocada por test-reporter)

---

## 3. Arquitectura de Agentes

### 3.1 Principio de diseño

Cada pipeline tiene **una responsabilidad única**, un **contrato de entrada/salida** definido, y **no conoce la implementación interna de los otros pipelines**. Se comunican por mensajes estructurados en JSON con `pipeline_id` como campo de trazabilidad. Todos los pipelines viven en `.claude/pipelines/` porque son invocados exclusivamente por otros pipelines o por el orchestrator — nunca directamente por el usuario en conversación.

### 3.2 Mapa de pipelines (5 pipelines)

```
                    ┌──────────────────────────────┐
                    │        qa-orchestrator        │
                    │  Coordina el flujo, decide    │
                    │  qué sub-pipelines invocar    │
                    │  y en qué orden               │
                    └──────────┬────────────────────┘
                               │
            ┌──────────────────┼──────────────────────┬────────────────────┐
            │                  │                      │                    │
            ▼                  ▼                      ▼                    ▼
   ┌─────────────────┐ ┌──────────────┐  ┌──────────────────┐  ┌─────────────────┐
   │  ticket-analyst │ │  test-engine │  │  test-reporter   │  │  test-generator │
   │                 │ │              │  │                  │  │                 │
   │  Lee ticket,    │ │  Descubre    │  │  Escribe Jira:   │  │  Crea sessions  │
   │  clasifica,     │ │  y ejecuta   │  │  comentario,     │  │  y POMs nuevos  │
   │  extrae hints   │ │  sessions    │  │  transición,     │  │  cuando no hay  │
   │                 │ │  existentes  │  │  bugs nuevos     │  │  cobertura      │
   └────────┬────────┘ └──────┬───────┘  └────────┬─────────┘  └────────┬────────┘
            │                 │                   │                     │
            ▼                 ▼                   ▼                     ▼
   ┌─────────────┐    ┌──────────────────┐  ┌─────────────────┐  ┌──────────────────┐
   │ jira-reader │    │  sessions/*.ts   │  │  jira-writer    │  │ create-session   │
   │ (skill MCP) │    │  Jest + Selenium │  │  (skill MCP+ADF)│  │ pom-generator    │
   └─────────────┘    └──────────────────┘  └─────────────────┘  └──────────────────┘
```

> **test-engine** opera solo en modo `discover_and_run` y `run_existing`. No genera tests.  
> **test-generator** es el pipeline responsable de `generate_and_run`. Se invoca desde qa-orchestrator cuando test-engine no encuentra sessions para el módulo.

### 3.3 Definición de cada pipeline

---

#### qa-orchestrator (pipeline principal)

**Responsabilidad:** Recibir el trigger, decidir el flujo, invocar sub-pipelines en secuencia, manejar errores, decidir escalaciones, registrar el Pipeline Execution Record.

**No hace:** No lee tickets directamente, no ejecuta tests, no escribe en Jira. Solo coordina.

**Input:** Trigger event normalizado (ver §4.2).  
**Output:** Pipeline Execution Record final (ver §8.1).

**Decisiones que toma:**
- ¿El trigger corresponde a ticket específico, polling sweep, o CI hook?
- ¿Qué tipo de flujo aplica? (§5)
- ¿El módulo tiene sessions → test-engine, o no → test-generator primero?
- ¿El resultado del test-engine requiere feedback positivo o negativo?
- ¿Hay que crear tickets nuevos por fallos en Dev_SAAS?
- ¿Se debe escalar a humano?
- ¿Ya existe un comentario de esta ejecución en Jira? (idempotencia — ver §7.2)

---

#### ticket-analyst (sub-pipeline de análisis)

**Responsabilidad:** Dado un ticket key, leer todo su contenido y producir un análisis estructurado.

**Usa:** `jira-reader` OP-1, OP-2, OP-3, OP-6.

**Input:**
```json
{
  "pipeline_id": "pipe-20260413-001",
  "action": "analyze_ticket",
  "ticket_key": "NAA-XXXX"
}
```

**Output:**
```json
{
  "pipeline_id": "pipe-20260413-001",
  "ticket_key": "NAA-4429",
  "summary": "CREACION NOTA IA - No respeta el prompt inyectado",
  "issue_type": "QA Bug - Front",
  "status": "En desarrollo",
  "priority": "Medium",
  "component_jira": "AI",
  "classification": {
    "domain": "post",
    "module": "ai-post",
    "action_type": "regression_test",
    "testable": true,
    "confidence": "high | medium | low",
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
> `classification.confidence` indica certeza del matching: "high" = component_jira match directo; "medium" = keyword intersection ≥2; "low" = 1 keyword o inferencia.

**Lógica interna:**
1. Leer ticket completo con `jira-reader OP-1` — siempre incluir `comment` y campos custom
   (Componente, Resumen Ejecutivo, Sprint, deploy, cambios SQL, cambios VFS).
2. Sintetizar `criteria[]` desde TODO el contenido del ticket (en orden de precedencia):
   - Sección "Criterios de aceptación" en descripción → `source: "extracted"`
   - Sección "Casos de prueba" en descripción → `source: "extracted"`
   - Comentarios de devs/QA con comportamiento descrito → `source: "inferred"`
   - Campos custom: deploy (cambios desplegados), cambios SQL (impacto BD), cambios VFS → `source: "inferred"`
   - Título + Resumen Ejecutivo → `source: "inferred"`
   - Si ninguna fuente produce ≥ 1 criterio accionable → `criteria: []`, `source: "none"`,
     `testable: false`, `human_escalation: true`, pedir al equipo descripción del flujo a probar.
3. Si `requested_env = "dev_saas"` en el trigger: extraer `test_cases` del comentario master
   previo con `jira-reader OP-3` (re-test del mismo set validado en Master).
4. Clasificar `domain` y `module`: primero por `component_jira` exacto (§6.3), luego por keywords (§6.2).
5. Determinar `testable`: QA Bug Front/Back con `criteria[]` ≥ 1 → `true`;
   tickets de diseño/UX sin criterios inferibles → `false`.
6. Determinar `action_type` según estado del ticket: ver §classification-rules (archivo de referencia).
7. Construir `test_hints` desde `criteria[]`.
8. Determinar `confidence` y `confidence_reason`; si `confidence = "low"` → `testable: false` + escalación.

---

#### test-engine (sub-pipeline de ejecución — solo discovery y runner)

**Responsabilidad:** Dado el output del ticket-analyst, encontrar sessions existentes, ejecutarlas y devolver resultados estructurados. **No genera tests nuevos.**

**Usa:** Filesystem del repositorio, Bash tool para ejecutar Jest, `test-map.json`.

**Input:**
```json
{
  "pipeline_id": "pipe-20260413-001",
  "action": "run_tests",
  "ticket_key": "NAA-4429",
  "classification": {
    "domain": "post",
    "module": "ai-post",
    "action_type": "regression_test"
  },
  "test_hints": ["Verificar que el prompt enviado se refleja en la nota generada"],
  "acceptance_criteria": ["La nota generada contiene el tema del prompt"],
  "mode": "discover_and_run | run_existing",
  "jira_metadata": { }
}
```

**Output (schema unificado v2 — compatible GitHub Actions + test-reporter TR-3):**
```json
{
  "pipeline_id": "pipe-20260413-001",
  "ticket_key": "NAA-4429",
  "execution_id": "exec-20260413-001",
  "executed_at": "2026-04-14T11:39:34.000-03:00",
  "mode_used": "discover_and_run",
  "environment": "master | dev_saas | testing",
  "grid": true,
  "headless": true,
  "sessions_found": true,
  "result": "passed | failed | error",
  "total_tests": 1,
  "passed": 1,
  "failed": 0,
  "results": [
    {
      "session_file": "sessions/post/NewAIPost.test.ts",
      "session_name": "NewAIPost",
      "status": "pass | fail | error",
      "duration_ms": 42000,
      "failure_messages": [],
      "mapped_to_hint": "Verificar que el prompt enviado se refleja en la nota generada"
    }
  ],
  "failure_summary": null,
  "console_errors_detected": [],
  "jest_output_path": "pipeline-logs/results-NAA-4429-exec-001.json"
}
```

> Cuando `sessions_found = false`, el orchestrator invoca `test-generator` (no test-engine).

**Dos modos de operación:**

| Modo | Cuándo | Qué hace |
|------|--------|----------|
| `discover_and_run` | Default. | Busca en `test-map.json` por module, verifica paths en disco, ejecuta. |
| `run_existing` | Re-test (Orchestrator ya sabe qué sessions correr). | Ejecuta sin discovery. |

**Comando de ejecución Jest:**
```bash
NODE_OPTIONS='--experimental-vm-modules' USE_GRID=true IS_HEADLESS=true node node_modules/.bin/jest NewAIPost --json --outputFile=pipeline-logs/results-NAA-4429-exec-001.json
```

---

#### test-reporter (sub-pipeline de feedback)

**Responsabilidad:** Recibir resultados del test-engine y traducirlos a acciones Jira: comentario de validación, transición de estado, tickets nuevos por fallos en Dev_SAAS.

**Usa:** `jira-writer` Modos B, C, D. Todo contenido en formato ADF.

> ⚠️ Ver **DECISION-01** (§META) antes de implementar este pipeline. La estructura de calls a jira-writer depende de si se implementa MODO F o no.

**Input (pipeline → jira-writer) — schema v2.0:**  
Ver `.claude/skills/jira-writer/references/pipeline-schema.md` para el schema completo.

**Mapeo resultado → acciones Jira:**

| Resultado | `operation` → jira-writer | Transición | Tickets nuevos |
|-----------|---------------------------|------------|----------------|
| Todos ✔, env=master | `validate_master` | `42` → A Versionar | — |
| Algún ✘, env=master | `validate_master` | `2` → FEEDBACK | — |
| Todos ✔, env=dev_saas | `validate_devsaas` | `31` → Done | — |
| Algún ✘, env=dev_saas | `validate_devsaas` | Sin transición | 1 ticket por cada ✘ |

---

#### test-generator (sub-pipeline de generación — Fase 5)

**Responsabilidad:** Cuando no hay sessions para un módulo, generarlas usando `create-session` y `pom-generator`. **Modo dry_run obligatorio en primera ejecución** — no postea en Jira hasta validación humana.

**Usa:** `create-session`, `pom-generator`, filesystem del repositorio.

**Input:**
```json
{
  "pipeline_id": "pipe-20260413-001",
  "action": "generate_tests",
  "ticket_key": "NAA-XXXX",
  "module": "tags",
  "test_hints": ["Crear un tag nuevo", "Verificar que aparece en la lista"],
  "acceptance_criteria": ["El tag creado aparece en la grilla"],
  "jira_metadata": { }
}
```

**Output:**
```json
{
  "pipeline_id": "pipe-20260413-001",
  "generated_session": "sessions/tags/AutoGenerated_NAA-XXXX.test.ts",
  "generated_pom": "src/pages/tags_page/",
  "compiles": true,
  "dry_run": true,
  "dry_run_results": {
    "total": 1, "passed": 1, "failed": 0
  },
  "ready_for_pipeline": false,
  "validation_required": "Test auto-generado. Revisar manualmente antes de habilitar en pipeline."
}
```

**Regla de habilitación:** Un test generado por este pipeline entra en `test-map.json` (y por ende puede ser ejecutado por test-engine) **solo después** de que sea commiteado con `[validated]` en el mensaje de commit. El Orchestrator verifica esta condición antes de invocar test-engine sobre módulos generados.

---

## 4. Sistema de Triggers

### 4.1 Tipos de trigger

| # | Trigger | Origen | Fase |
|---|---------|--------|------|
| T1 | **Manual prompt** | Usuario en Claude Code | Fase 0 |
| T2 | **Polling sweep manual** | `poll-jira.ts` invocado manualmente | Fase 4 |
| T3 | **CronCreate** | Claude Code `CronCreate` tool (sesión activa requerida) | Fase 4 |
| T4 | **GitHub Actions schedule** | `.github/workflows/qa-pipeline.yml` | Fase 6 |
| T5 | **CI hook (PR merge)** | GitHub Actions → workflow en PR merge | Fase 6 |

> **Triggers T4 y T5 requieren GitHub Actions.** Difieren a Fase 6. No dependen de sesión local de Claude Code activa.
>
> **Jira webhooks eliminados del alcance:** Requieren servidor externo con IP pública. No se implementarán hasta que el equipo crezca y haya infraestructura dedicada.

### 4.2 Schema del evento trigger

```json
{
  "event_id": "evt-20260413-001",
  "timestamp": "2026-04-13T14:30:00Z",
  "trigger_type": "manual | polling | cron | ci_hook",
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
const JQL_QUERIES = {
  // Tickets en "Revisión" = QA debe actuar AHORA (primera validación o re-test en Master)
  ready_for_qa_review:   `project = NAA AND status = "Revisión" AND updated >= -2h ORDER BY updated DESC`,
  // Tickets que volvieron a "Revisión" desde "Feedback" = dev corrigió, QA re-valida
  retest_after_feedback: `project = NAA AND status changed to "Revisión" after -2h AND status WAS "Feedback"`,
  // Nuevos QA Bugs abiertos (para priorización, no ejecuta tests automáticamente)
  new_qa_bugs:           `project = NAA AND issuetype in ("QA Bug - Front","QA Bug - Back") AND status = "Abierto" AND created >= -24h`,
  // Sweep Dev_SAAS: todos los tickets "Done" de la versión que acaba de liberarse al entorno pre-prod
  // Trigger: manual — Juanto informa qué versión se liberó al ambiente Dev_SAAS
  devsaas_by_version:    `project = NAA AND status = "Done" AND fixVersion = "{VERSION}" ORDER BY updated DESC`
  // NOTA: "A Versionar" NO es trigger para QA.
  // Ese estado indica que QA YA aprobó el ticket en Master y está esperando que el equipo
  // versione los commits a la rama local de Dev_SAAS. No hay acción QA en ese estado.
};
```

### 4.4 Implementación concreta: T3 con CronCreate

El script `poll-jira.ts` produce los trigger events pero no invoca Claude directamente. El puente es `CronCreate` de Claude Code:

```
CronCreate configuración:
  schedule: "*/30 * * * *"   (cada 30 minutos)
  prompt:   "Correr poll-jira.ts. Para cada ticket encontrado, invocar qa-orchestrator
             con el trigger event correspondiente. Registrar resultados en pipeline-logs/."
```

**Limitaciones de CronCreate para T3:**
- Requiere que la sesión de Claude Code esté activa en el momento de ejecución.
- No es alta disponibilidad — si la sesión se cierra, el cron no dispara.
- Correcto para Fases 4-5 (entorno de desarrollo). Para Fase 6 se migra a GitHub Actions.

---

## 5. Flujos de Ejecución

### 5.1 Flujo Principal — Validación en Master

Trigger: T1 (manual) o T2/T3 cuando un ticket está en estado **"Revisión"**
(el dev envió el ticket a QA para que lo valide en el entorno Master/desarrollo).

```
Trigger
  │
  ▼
qa-orchestrator — inicializa Pipeline Context (pipeline_id nuevo)
  │               verifica idempotencia: ¿ya existe comentario para este pipeline_id?
  │               si SÍ → abortar (ya procesado)
  │
  ├──▶ ticket-analyst
  │       jira-reader OP-1  → ticket completo (incluye comments + campos custom)
  │       Sintetizar criteria[] desde TODO el contenido del ticket
  │       si criteria = [] → testable: false → escalación (pedir más info al equipo)
  │       Clasificar: domain, module, confidence
  │       si confidence = "low" → testable: false → escalación
  │
  ▼
  ¿testable = true?
  │              │
 SÍ             NO
  │              └──▶ jira-writer add_observation: "Requiere validación manual"
  │                   Escalación = true → Pipeline Execution Record
  │
  ├──▶ test-engine (mode: discover_and_run, env: master)
  │       Buscar module en test-map.json
  │       Verificar confidence_score ≥ 2 keywords (si fuzzy match)
  │       si sessions_found = false → señalar al Orchestrator
  │
  ▼
  ¿sessions_found?
  │              │
 SÍ             NO — Fase 5
  │              └──▶ invocar test-generator (dry_run)
  │                   Escalar para validación manual
  │
  ├──▶ test-reporter (operation: validate_master)
  │       Construir payload v2.0 para jira-writer
  │       jira-writer: comentario ADF + transición
  │       Guardar last_comment_id en Pipeline Context
  │
  ▼
DONE — guardar Pipeline Execution Record en pipeline-logs/completed/
```

### 5.2 Flujo de Re-test (post-FEEDBACK)

Trigger: T1 (manual) o T2/T3 cuando un ticket vuelve a estado **"Revisión"** desde **"Feedback"**
(el dev corrigió los problemas reportados por QA y lo reenvía para re-validación).
El `action_type` en este caso es `retest` — se identifica porque el ticket tiene comentario
master previo de QA en su historial.

```
qa-orchestrator
  ├──▶ ticket-analyst
  │       jira-reader OP-3 → extraer test_cases del comentario anterior
  │       Output: classification + test_cases previos
  │
  ├──▶ test-engine (mode: run_existing)
  │       Ejecutar las mismas sessions (sin discovery)
  │
  ├──▶ test-reporter (env: master)
  │       Nuevo comentario en el mismo ticket
  │
  ▼
DONE
```

### 5.3 Flujo Dev_SAAS (pre-liberación)

Trigger: T1 (manual) cuando un lote de tickets está listo para pre-prod.

```
Trigger (metadata: requested_env = "dev_saas", version = "8.6.16.X")
  │
  ▼
qa-orchestrator
  ├──▶ ticket-analyst
  │       jira-reader OP-1 → verificar ticket en "A Versionar"
  │       jira-reader OP-3 → extraer test_cases del comentario Master
  │       (BLOQUEAR si no hay comentario Master previo)
  │
  ├──▶ test-engine (mode: run_existing, env: dev_saas)
  │       TESTING_URL → URL de Dev_SAAS (ver §11.5)
  │       Ejecutar mismas sessions con ambiente diferente
  │
  ├──▶ test-reporter (operation: validate_devsaas, prerelease_version: "8.6.16.X")
  │       jira-writer MODO C: comentario Dev_SAAS con bullets ✔/✘ reales
  │       Si todo ✔: transición Done (31)
  │       Si hay ✘: jira-writer MODO D × cada ✘ → crear ticket + link "Relates"
  │
  ▼
DONE
```

### 5.4 Flujo de Generación de Tests Nuevos (Fase 5 — dry_run obligatorio)

Trigger: test-engine detecta `sessions_found = false` para el módulo.

```
Orchestrator recibe: sessions_found = false para module = "tags"
  │
  ├──▶ test-generator
  │       ¿Existe POM para el módulo? (buscar src/pages/tags_page/)
  │       si NO: invocar pom-generator → src/pages/tags_page/
  │       invocar create-session con test_hints + acceptance_criteria + POM
  │       Session generada → sessions/tags/AutoGenerated_NAA-XXXX.test.ts
  │       Ejecutar en dry_run: Jest corre pero resultados NO van a Jira
  │       Si compila y corre: reportar resultado al Orchestrator
  │       Si errores de setup: escalar a humano
  │
  ├──▶ Orchestrator
  │       Pipeline Execution Record: auto_generated_tests = true, dry_run = true
  │       Actualizar test-map.json con módulo provisional (marcado como "unvalidated")
  │       Escalar: notificar que hay tests pendientes de revisión manual
  │
  ▼
DONE — Session queda en repo con flag auto_generated. NO postea en Jira.
       Se habilita para el pipeline cuando [validated] aparece en el commit.
```

---

## 6. Mapeo Módulo → Sessions (test-map.json)

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
      "keywords": ["nota", "post", "listicle", "liveblog", "editor", "publicar", "borrador", "contenido", "imagen de portada", "imagen destacada"],
      "component_jira": "Post",
      "validated": true
    },
    "ai-post": {
      "sessions": ["NewAIPost"],
      "paths": ["sessions/post/NewAIPost.test.ts"],
      "page_objects": ["src/pages/post_page/AIPost/"],
      "keywords": ["nota IA", "AI", "prompt", "generación IA", "AI_POST", "inteligencia artificial", "IA genera"],
      "component_jira": "AI",
      "validated": true
    },
    "video": {
      "sessions": ["NewYoutubeVideo", "NewEmbeddedVideo", "MassPublishVideos"],
      "paths": [
        "sessions/video/NewYoutubeVideo.test.ts",
        "sessions/video/NewEmbeddedVideo.test.ts",
        "sessions/video/MassPublishVideos.test.ts"
      ],
      "page_objects": ["src/pages/videos_page/"],
      "keywords": ["video", "youtube", "embedded", "subir video", "iframe", "reproductor", "upload video"],
      "component_jira": "Video",
      "validated": true
    },
    "images": {
      "sessions": ["MassPublishImages"],
      "paths": ["sessions/images/MassPublishImages.test.ts"],
      "page_objects": ["src/pages/images_pages/"],
      "keywords": ["imagen", "image", "subir imagen", "imágenes", "gallery", "foto"],
      "component_jira": "Images",
      "validated": true
    },
    "auth": {
      "sessions": ["FailedLogin"],
      "paths": ["sessions/auth/FailedLogin.test.ts"],
      "page_objects": ["src/pages/login_page/"],
      "keywords": ["login", "auth", "autenticación", "credenciales", "two-factor", "2FA"],
      "component_jira": "Auth",
      "validated": true
    },
    "cross": {
      "sessions": ["PostAndVideo"],
      "paths": ["sessions/cross/PostAndVideo.test.ts"],
      "page_objects": ["src/pages/post_page/", "src/pages/videos_page/"],
      "keywords": ["cross-component", "post y video", "flujo completo", "integración"],
      "component_jira": null,
      "validated": true
    }
  }
}
```

> **Campo `validated`:** `true` = session revisada manualmente y confiable para el pipeline. `false` (o ausente) = session auto-generada pendiente de validación → dry_run only.

**Ubicación:** `.claude/pipelines/test-engine/references/test-map.json`

### 6.2 Estrategia de matching del Test Discoverer

```
Input: classification.module = "ai-post"
       classification.domain  = "post"
       component_jira         = "AI"
       summary keywords       = ["nota", "IA", "prompt"]

Paso 1: Lookup por component_jira en component-to-module.json
        → "AI" → "ai-post"  [PRECEDENCIA MÁXIMA]
        → confidence = "high"

Paso 2: Si no hay match por component → exact module match en test-map.json
        → Hit en "ai-post"
        → confidence = "high"

Paso 3: Si no hay exact match → fuzzy match por keywords
        → Buscar módulos donde keywords ∩ summary_keywords ≥ 2
        → Si score ≥ 2: confidence = "medium"
        → Si score = 1: confidence = "low" → NO ejecutar → escalar

Paso 4: Verificar que los paths existen en disco
        → sessions/post/NewAIPost.test.ts ✔

Paso 5: Verificar que el módulo tiene validated = true en test-map.json
        → Si validated = false → dry_run only

Paso 6: Si no hay match con confidence ≥ "medium" → sessions_found = false
        → Orchestrator invoca test-generator
```

**Regla de desempate:** Si keyword intersection matchea múltiples módulos con el mismo score, el desempate es el módulo cuyo `component_jira` es más específico (menos genérico). Ejemplo: match en `video` y `ai-post` → gana `ai-post` porque AI es más específico que Video.

### 6.3 Mapeo Componente Jira → Módulo interno

```json
{
  "AI":       "ai-post",
  "Post":     "post",
  "Video":    "video",
  "Images":   "images",
  "Auth":     "auth",
  "Editor":   "post",
  "Tags":     null,
  "Planning": null,
  "Admin":    null
}
```

Los módulos con `null` → siempre `sessions_found = false` → test-generator (Fase 5).

**Ubicación:** `.claude/pipelines/ticket-analyst/references/component-to-module.json`

### 6.4 Mantenimiento: sync-test-map.ts

El archivo `test-map.json` es una fuente de verdad manual con riesgo de desactualización. El script `scripts/sync-test-map.ts` mitiga esto:

```bash
# Detectar drift entre sessions/ en disco y test-map.json
./node_modules/.bin/tsx scripts/sync-test-map.ts
```

**Qué hace:**
1. Corre `node node_modules/.bin/jest --listTests` para obtener todos los archivos de test del repo.
2. Compara contra los `paths` registrados en `test-map.json`.
3. Imprime:
   - Tests en `sessions/` que NO están en `test-map.json` (drift detectado → agregar manualmente)
   - Paths en `test-map.json` que NO existen en disco (tests eliminados → limpiar)

**Cuándo correrlo:** Al agregar o eliminar cualquier session. Parte del checklist de Fase 0 y de cada review antes de un release del pipeline.

---

## 7. Contratos de Comunicación Inter-Pipeline

### 7.1 Schema de mensajes

Todos los mensajes inter-pipeline incluyen `pipeline_id` como campo de trazabilidad. No hay un envelope separado — el `pipeline_id` viaja como campo del payload directo.

```json
{
  "pipeline_id":  "pipe-20260413-001",
  "source_agent": "qa-orchestrator | ticket-analyst | test-engine | test-reporter | test-generator",
  "operation":    "string",
  "ticket_key":   "NAA-XXXX",
  "timestamp":    "ISO-8601",
  "schema_version": "2.0"
}
```

El `pipeline_id` vincula todos los mensajes de un mismo flujo para trazabilidad en `pipeline-logs/`.

> **v2.0 → v3.0:** El envelope separado con `payload: {}` fue eliminado. El `pipeline_id` se agrega como campo directo en todos los schemas existentes. Esto simplifica la implementación sin perder trazabilidad.

### 7.2 Pipeline Context (estado compartido)

El Orchestrator mantiene este objeto en memoria y lo persiste a disco en cada transición de stage. Si el pipeline se interrumpe, puede retomarse desde el último stage completado.

```json
{
  "pipeline_id": "pipe-20260413-001",
  "schema_version": "2.0",
  "trigger_event": { },
  "idempotency": {
    "last_comment_id":    null,
    "last_transition_id": null,
    "already_reported":   false
  },
  "ticket_analysis": {
    "criteria":             [],
    "test_hints":           [],
    "module":               null,
    "confidence":           null,
    "testable":             null,
    "previous_test_cases":  [],
    "jira_metadata":        { }
  },
  "test_execution": {
    "sessions_found":  false,
    "suite_summary":   { "total": 0, "passed": 0, "failed": 0 },
    "test_results":    [],
    "test_file":       null,
    "environment_url": null
  },
  "report_result": {
    "status":       null,
    "actions_taken": [],
    "errors":        []
  },
  "current_stage":        "ticket_analysis | test_execution | reporting | done | error",
  "step_log": [
    {
      "stage":       "ticket_analysis",
      "started_at":  "ISO-8601",
      "completed_at": "ISO-8601",
      "duration_ms":  0,
      "status":       "completed | failed | skipped",
      "notes":        ""
    }
  ],
  "error_log":            [],
  "human_escalation":     false,
  "auto_generated_tests": false,
  "dry_run":              false
}
```

**Persistencia del Pipeline Context:**
```
pipeline-logs/active/pipe-{id}-context.json     ← se sobreescribe en cada transición de stage
pipeline-logs/completed/pipe-{id}-final.json    ← se mueve aquí al completar o escalar
```

**Mecanismo de resumption:** Al iniciar, el Orchestrator verifica si existe `pipe-{ticket_key}-active-context.json`. Si existe:
- `current_stage = "test_execution"` y `test_execution.suite_summary.total > 0` → saltar a test-reporter.
- `current_stage = "ticket_analysis"` → empezar desde test-engine.
- `current_stage = "reporting"` con `report_result.status = null` → reintentar test-reporter.

**Mecanismo de idempotencia:** Antes de invocar test-reporter, el Orchestrator verifica `idempotency.already_reported`. Si es `true`, skip (el comentario ya fue posteado). Después de postear, almacena `last_comment_id` y setea `already_reported: true`.

### 7.3 Manejo de errores

| Error | Pipeline que lo detecta | Acción |
|-------|------------------------|--------|
| Ticket no encontrado | ticket-analyst | Abortar + informar Orchestrator |
| Ticket sin criterios en descripción (OP-6 `criteria: []`) | ticket-analyst | Leer ticket COMPLETO (comments + campos custom + título). Inferir desde contexto. Si inferencia produce ≥ 1 criterio: continuar con `source: "inferred"`. Si falla: `testable: false` + escalación explícita pidiendo al equipo descripción del flujo + pasos a reproducir. |
| Ticket no testable (diseño/UX) | ticket-analyst | `testable: false` → Orchestrator escala |
| `confidence = "low"` en matching | ticket-analyst | `testable: false` → escalar, no ejecutar con baja confianza |
| `sessions_found = false` | test-engine | Señalar al Orchestrator → invocar test-generator |
| Tests no compilan (error TS) | test-engine | Abortar + devolver logs TypeScript |
| Selenium timeout / crash | test-engine | Reintentar 1 vez. Si falla: `status: error` en `test_results[]` |
| Jest no encontró el test | test-engine | Verificar nombre exacto del archivo (PascalCase.test.ts) |
| `jest --json` produce output vacío o malformado | test-engine | Verificar existencia y tamaño del outputFile antes de parsear |
| Docker Selenium Grid no disponible | test-engine | Verificar grid antes de Jest. Abortar + escalar si no responde |
| jira-writer `status: "partial"` | test-reporter | Registrar `errors[]` en Pipeline Execution Record. Escalar acciones fallidas. |
| jira-writer `status: "error"` | test-reporter | Retry con backoff, máximo 3 intentos. Si persiste: agregar a `failed-reports.json` + escalar |
| MCP Atlassian token expirado (401/403) | ticket-analyst / test-reporter | Escalar inmediatamente. No reintentar — el token no se autorenueva |
| Falta `prerelease_version` en `validate_devsaas` | test-reporter | Bloquear — pedir versión |
| ADF inválido (campo es string) | test-reporter | BLOQUEAR — reconstruir como ADF JSON |
| No existe comentario Master previo para Dev_SAAS | test-reporter | Abortar flujo Dev_SAAS |
| Context window cercano al límite (§11.6) | qa-orchestrator | Dividir ejecución. Ver §11.6. |
| `test-map.json` no encontrado | test-engine | Abortar + escalar. Verificar existencia en Fase 0 checklist. |

---

## 8. Pipeline Execution Record

### 8.1 Schema

```json
{
  "pipeline_id": "pipe-20260413-001",
  "schema_version": "2.0",
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
      "confidence": "high",
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
      "comment_id": "10045",
      "transition_applied": "42"
    }
  },
  "step_log": [
    { "stage": "ticket_analysis", "started_at": "...", "completed_at": "...", "duration_ms": 8000, "status": "completed", "notes": "" },
    { "stage": "test_execution",   "started_at": "...", "completed_at": "...", "duration_ms": 142000, "status": "completed", "notes": "" },
    { "stage": "reporting",        "started_at": "...", "completed_at": "...", "duration_ms": 15000, "status": "completed", "notes": "" }
  ],
  "final_status": "completed_all_pass | completed_with_failures | error | escalated",
  "human_escalation": false,
  "auto_generated_tests": false,
  "dry_run": false,
  "error_log": []
}
```

### 8.2 Almacenamiento

```
pipeline-logs/
├── active/
│   └── pipe-{id}-context.json       ← Pipeline Context mientras está corriendo
├── completed/
│   └── pipe-{date}-{id}-final.json  ← Pipeline Execution Record al completar
├── failed-reports.json              ← Payloads que no llegaron a Jira (DLQ mínimo)
└── .gitkeep
```

> **Sin SQLite.** El volumen actual (decenas de pipelines/semana) no justifica una base de datos. Los archivos JSON son suficientes y más simples de debuggear. Revisar si el volumen justifica SQLite cuando se superen 500 pipeline runs.

### 8.3 Resumption (recuperación de estado)

Ver §7.2 para el mecanismo completo. El Orchestrator siempre persiste el Pipeline Context antes de invocar cada sub-pipeline. Si Claude Code se cierra inesperadamente, la próxima invocación sobre el mismo ticket puede retomar desde el último stage completado usando el contexto activo.

---

## 9. Seguridad y Credenciales

### 9.1 Credenciales requeridas por el pipeline

| Credencial | Tipo | Dónde se configura |
|-----------|------|-------------------|
| MCP Atlassian (Jira) | Token de API Atlassian | `.mcp.json` + cuenta Atlassian activa en sesión Claude Code |
| CMS credentials (TESTING_URL, ADMIN_USER, ADMIN_PASS) | Variables de entorno | `.env` del repositorio (en .gitignore) |
| BASIC_AUTH_USER / BASIC_AUTH_PASS | Variables de entorno | `.env` del repositorio |
| Grid URL (para USE_GRID=true) | Variable de entorno | `.env` o default `http://localhost:4444` |

> El pipeline **no gestiona credenciales por sí mismo** — las lee del `.env` del repo y del contexto de sesión MCP ya configurado.

### 9.2 Datos sensibles en git

**Regla:** Ningún identificador personal (Account IDs, emails, tokens) entra en archivos versionados.

| Tipo de dato | Ubicación correcta |
|-------------|-------------------|
| Account IDs Jira de personas del equipo | `.claude/references/team-accounts.md` (en `.gitignore`) |
| API tokens / credenciales | `.env` (en `.gitignore`) |
| Cloud ID de Jira | Puede estar versionado — es un ID público |
| URLs de entornos de pre-prod | Pueden estar versionados |

### 9.3 Account IDs — archivo separado no versionado

Crear y agregar a `.gitignore`:
```
.claude/references/team-accounts.md
```

Contenido del archivo (no versionado):
```markdown
# Team Account IDs — NO VERSIONAR
Juanto (Juan Caldera): 712020:59e4ac7b-f44f-45cb-a444-44746cecec49
Paula Rodriguez:       633b5c898b75455be4580f5b
Verónica Tarletta:     5c51d02898c1ac41b4329be3
Claudia Tobares:       5c1d65c775b0e95216e8e175
```

Los schemas del pipeline usan `assignee_hint` (`"frontend"`, `"backend"`, `"editor"`) que el jira-writer resuelve internamente a Account IDs. El Account ID nunca viaja en los payloads del pipeline.

---

## 10. Observabilidad

### 10.1 step_log por stage

El `step_log[]` del Pipeline Context (§7.2) registra cada stage con timestamp, duración y notas. Esto permite:
- Detectar qué stage consume más tiempo.
- Identificar dónde falló un pipeline interrumpido.
- Calcular latencias por stage en forma histórica.

Los logs de Winston del test runner (`sessions/`) se correlacionan con el `pipeline_id` mediante el output file de Jest: `pipeline-logs/results-{ticket_key}-{pipeline_id}.json`.

### 10.2 failed-reports.json (Dead Letter Queue mínimo)

Si jira-writer falla después de 3 reintentos, el payload se agrega a `pipeline-logs/failed-reports.json`:

```json
[
  {
    "pipeline_id": "pipe-20260413-001",
    "timestamp": "2026-04-13T14:35:00Z",
    "ticket_key": "NAA-4429",
    "operation": "validate_master",
    "payload": { },
    "error": "MCP connection timeout después de 3 reintentos",
    "retry_count": 3
  }
]
```

Este archivo debe revisarse manualmente antes de cada sesión de trabajo. Los payloads pendientes se re-envían manualmente con jira-writer.

### 10.3 Alertas: mecanismo actual

En Fases 1-5, el mecanismo de alerta es:
1. Si `human_escalation = true` en el Pipeline Execution Record → el Orchestrator postea un comentario en el ticket Jira explicando por qué el pipeline no pudo resolver automáticamente.
2. Si `final_status = "error"` → el pipeline guarda el record en `pipeline-logs/completed/` con el detalle del error. Revisar antes de la siguiente sesión.

No se implementa infraestructura adicional de alertas (Slack, email) hasta Fase 6 cuando el pipeline corre sin sesión local activa.

### 10.4 Evolución futura (Fase 6+)

Cuando el pipeline migre a GitHub Actions:
- Los logs de ejecución quedan en GitHub Actions workflow logs (sin configuración adicional).
- Errores pueden notificarse vía GitHub Actions `notify-slack` action o similar.
- Para observabilidad de LLM calls directas (si se migra de Claude Code CLI a Claude API): evaluar LangSmith o Helicone.

---

## 11. Consideraciones Específicas del Entorno

### 11.1 ESM + WSL2

Todo comando Jest en el pipeline debe seguir la forma:
```bash
NODE_OPTIONS='--experimental-vm-modules' USE_GRID=true IS_HEADLESS=true \
  node node_modules/.bin/jest {TestName} --json --outputFile={path}
```

- `NODE_OPTIONS='--experimental-vm-modules'` → obligatorio por ESM en WSL2.
- `USE_GRID=true IS_HEADLESS=true` → para ejecución en pipeline sin UI.
- `--json --outputFile=pipeline-logs/results-{ticket}-{exec}.json` → para parsear resultados.
- `node node_modules/.bin/jest` → en WSL2, `npm` y `npx` resuelven al binario de Windows y fallan
  con `"No se permiten rutas UNC"`. Usar el binario local de jest directamente.
- `cross-env` es innecesario en bash — variables se pasan inline antes del comando.

### 11.2 ADF en todas las escrituras Jira

El test-reporter **nunca** pasa strings markdown a jira-writer. Todo body es un objeto ADF JSON.  
Ver `.claude/skills/jira-writer/references/adf-format-guide.md` para la referencia completa.

### 11.3 Naming de sessions

| Session file | TestName para Jest |
|---|---|
| `sessions/post/NewAIPost.test.ts` | `NewAIPost` |
| `sessions/video/NewYoutubeVideo.test.ts` | `NewYoutubeVideo` |
| `sessions/tags/AutoGenerated_NAA-XXXX.test.ts` | `AutoGenerated_NAA-XXXX` |

### 11.4 Variables de entorno para el pipeline

| Variable | Valor para pipeline |
|---|---|
| `USE_GRID` | `true` |
| `IS_HEADLESS` | `true` |
| `TESTING_URL` | URL del ambiente a probar (ver §11.5) |
| `MAX_INSTANCES` | `1` (una sesión por vez en pipeline) |
| `GRID_URL` | `http://localhost:4444` (default) |
| `ADMIN_USER` / `ADMIN_PASS` | Del `.env` del repo |
| `EDITOR_USER` / `EDITOR_PASS` | Del `.env` del repo |
| `BASIC_AUTH_USER` / `BASIC_AUTH_PASS` | Del `.env` del repo |

### 11.5 Cambio de TESTING_URL para Dev_SAAS

El test-engine, al correr en modo `env: dev_saas`, necesita apuntar a la URL de pre-prod. El mecanismo es pasar la variable inline al comando Jest (no modificar el `.env`):

```bash
NODE_OPTIONS='--experimental-vm-modules' \
  USE_GRID=true IS_HEADLESS=true \
  TESTING_URL="https://dev-saas.bluestack-cms.com" \
  node node_modules/.bin/jest {TestName} --json --outputFile={path}
```

La URL de Dev_SAAS viene del trigger event (`metadata.requested_env = "dev_saas"`) o del Orchestrator como parámetro explícito. **Nunca modificar el `.env` durante la ejecución del pipeline** — eso rompería otras sesiones en paralelo.

### 11.6 Context Window Budget

Cada pipeline run consume tokens de Claude Code. Para evitar truncaciones silenciosas:

**Límite operativo:** Mantener el contexto activo bajo **80K tokens** por pipeline run.

**Qué consume más tokens:**
- Historial de comentarios de un ticket con muchos comentarios (OP-1 devuelve el ticket completo).
- Output de Jest con muchos tests fallidos (mensajes de error verbosos).
- ADF construido para comentarios Dev_SAAS con muchos test_cases.

**Estrategia cuando se acerca el límite:**
1. ticket-analyst: usar `jira-reader OP-1` en modo resumido (sin `comments`). Si se necesitan comentarios, usar OP-3 directamente (que devuelve solo los test_cases del comentario Master).
2. test-engine: truncar el output de Jest a las primeras 100 líneas del stdout si el output es excesivo. El JSON de resultados (`--outputFile`) siempre está completo en disco.
3. Si el pipeline run completo excede el límite: dividir en dos invocaciones serializadas: (ticket-analyst + test-engine) en una sesión, guardar resultados en disco, luego (test-reporter) en otra sesión cargando el output del disco.

---

## 12. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Tests auto-generados con assertions débiles | Feedback incorrecto a devs | `dry_run: true` obligatorio. Human review antes de habilitar en pipeline. |
| Rate limits Jira API vía MCP | Pipeline se corta en reporting | Retry con backoff, máximo 3 intentos. Payload va a `failed-reports.json`. |
| Selenium flaky tests (timeouts) | Falsos negativos | Retry con exponential backoff ya en `src/core/wrappers/`. Reintentar el test una vez. Reportar como `error` (no `fail`) si sigue fallando. |
| `test-map.json` desactualizado | Sessions no se descubren | `sync-test-map.ts` para detectar drift. Fuzzy match como fallback. |
| Ticket con descripción ambigua | ticket-analyst no clasifica | `confidence = "low"` → `testable: false` → escalación. Pipeline comenta en Jira pidiendo contexto. |
| ADF mal construido | Jira rechaza escritura | El reporter valida el objeto ADF antes de enviar. Si falta `"type": "doc"`: bloquear y reconstruir. |
| Docker Selenium Grid no disponible | test-engine falla con connection refused | Verificar que el grid responde antes de invocar Jest. |
| MCP token expirado (401/403) | Todo el pipeline falla | Escalar inmediatamente. No reintentar. El token requiere renovación manual. |
| Context window excedido | Pipeline truncado silenciosamente | Monitorear tamaño del contexto. Estrategia de división en §11.6. |
| Pipeline ejecutado dos veces sobre el mismo ticket | Duplicación de comentarios en Jira | Idempotencia via `last_comment_id` en Pipeline Context (§7.2). |
| `test-map.json` no encontrado en Fase 0 | test-engine falla antes de empezar | Verificar existencia del archivo en cada pipeline run (primer check). |
| CronCreate no dispara (sesión Claude Code cerrada) | Sin validación automática | T3 depende de sesión activa. Para HA: migrar a GitHub Actions (Fase 6). |

---

## 13. Métricas de Éxito

| Métrica | Cómo se mide | Target Fase 4 | Notas |
|---------|-------------|---------------|-------|
| Tiempo ticket → feedback en Jira | Timestamp trigger vs timestamp comentario | < 15 min para sessions existentes | v2.0 decía < 10 min: demasiado optimista dado análisis + Jest + API |
| Tasa de clasificación correcta | Revisión manual de 20 pipelines ejecutados | > 85% módulos clasificados correctamente | Denominador: 20 tickets reales |
| Tasa de discovery | Tickets que matchearon session existente | > 65% (6/9 módulos tienen sessions) | Mide capacidad, no calidad |
| Falsos positivos/negativos | Revisión manual post-pipeline | < 10% resultados incorrectos | Requiere proceso de revisión definido |
| Pipelines sin intervención humana | Pipelines completados vs escalados | > 70% automáticos en flujo Master | |
| Coverage del test-map | Módulos con validated=true / módulos con tickets QA activos | +2 módulos nuevos por sprint en Fase 5 | Reemplaza "incremento medible" — ahora es un número concreto |
| **Token cost por pipeline run** | Tokens usados × precio por token | < $0.30 promedio por run | Nuevo — crítico para sostenibilidad |
| **Latencia P95** | Percentil 95 de duración de pipeline completo | < 20 min | Nuevo — P95 revela outliers que el promedio oculta |
| **Tasa fallos infraestructura vs aplicación** | `status: error` (infra) vs `status: fail` (app) | < 15% errores de infra | Nuevo — distingue "el grid cayó" de "bug real" |
| **test-map drift** | Sessions en disco no en test-map.json | 0 después de sync-test-map.ts | Nuevo — ejecutar antes de cada fase de trabajo |

---

## 14. Estructura de Archivos del Sistema

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
│   ├── qa-orchestrator/        ← NUEVO — Fase 4
│   │   ├── PIPELINE.md
│   │   └── scripts/
│   │       └── poll-jira.ts
│   │
│   └── test-generator/         ← NUEVO — Fase 5
│       ├── PIPELINE.md
│       └── references/
│           └── generation-rules.md
│
├── skills/
│   ├── jira-reader/            ← (existente, sin modificar)
│   ├── jira-writer/            ← (existente, sin modificar)
│   ├── create-session/         ← (existente, sin modificar)
│   └── pom-generator/          ← (existente, sin modificar)
│
├── references/
│   └── team-accounts.md        ← NUEVO (en .gitignore — datos sensibles)
│
scripts/
└── sync-test-map.ts            ← NUEVO — Fase 0

pipeline-logs/
├── active/                     ← Pipeline Contexts en curso
├── completed/                  ← Pipeline Execution Records finales
├── failed-reports.json         ← DLQ mínimo para payloads fallidos
└── .gitkeep
```

---

## 15. PLAN DE IMPLEMENTACIÓN — FASES

### Flowchart

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                    QA PIPELINE — FLOWCHART DE IMPLEMENTACIÓN                    ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  PIEZAS EXISTENTES (no tocar)                                                    ║
║  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐ ┌──────────────────┐    ║
║  │ jira-reader ✅│ │ jira-writer ✅│ │ create-session ✅│ │ pom-generator ✅ │    ║
║  └──────────────┘ └──────────────┘ └─────────────────┘ └──────────────────┘    ║
║        │                │                 │                      │              ║
║        └────────────────┴─────────────────┴──────────────────────┘              ║
║                                       │                                          ║
║                                       ▼                                          ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║  FASE 0 — Prerequisitos                                           sin deps       ║
║  ┌──────────────────────────────────────────────────────────────────────────┐   ║
║  │ test-map.json · component-to-module.json · pipeline-logs/ · .gitignore  │   ║
║  │ sync-test-map.ts · team-accounts.md (no-git) · verificar skills E2E     │   ║
║  └──────────────────────────────────────────────────────────────────────────┘   ║
║                                       │                                          ║
╠══════════════════════════════════════ ▼ ═════════════════════════════════════════╣
║  FASE 1 — ticket-analyst              deps: Fase 0 + jira-reader                 ║
║  ┌──────────────────────────────────────────────────────────────────────────┐   ║
║  │ PIPELINE.md ticket-analyst                                               │   ║
║  │ Validar sobre 10+ tickets reales de NAA                                  │   ║
║  │ Milestone: JSON de análisis correcto en >85% de tickets                  │   ║
║  └──────────────────────────────────────────────────────────────────────────┘   ║
║                                       │                                          ║
╠══════════════════════════════════════ ▼ ═════════════════════════════════════════╣
║  FASE 2 — test-engine                 deps: Fase 1 + test-map.json               ║
║  ┌──────────────────────────────────────────────────────────────────────────┐   ║
║  │ PIPELINE.md test-engine (modos: discover_and_run · run_existing)         │   ║
║  │ ⚠️ Solo modos existentes — sin generate_and_run (eso es Fase 5)         │   ║
║  │ Milestone: ticket con session → Jest corre → JSON de resultados          │   ║
║  └──────────────────────────────────────────────────────────────────────────┘   ║
║                                       │                                          ║
╠══════════════════════════════════════ ▼ ═════════════════════════════════════════╣
║  FASE 3 — test-reporter               deps: Fase 2 + jira-writer                 ║
║  ┌──────────────────────────────────────────────────────────────────────────┐   ║
║  │ ⚠️ RESOLVER DECISION-01 ANTES DE EMPEZAR ESTA FASE                      │   ║
║  │ PIPELINE.md test-reporter                                                │   ║
║  │ Milestone: comentario ADF correcto en Jira + transición aplicada         │   ║
║  └──────────────────────────────────────────────────────────────────────────┘   ║
║                                       │                                          ║
╠══════════════════════════════════════ ▼ ═════════════════════════════════════════╣
║  FASE 4 — qa-orchestrator + CronCreate  deps: Fases 1-3                         ║
║  ┌──────────────────────────────────────────────────────────────────────────┐   ║
║  │ PIPELINE.md qa-orchestrator                                              │   ║
║  │ poll-jira.ts · CronCreate configurado (cada 30 min)                      │   ║
║  │ failed-reports.json (DLQ)                                                │   ║
║  │ Milestone A: pipeline E2E con trigger manual → Jira actualizado          │   ║
║  │ Milestone B: CronCreate ejecuta sweep automático                         │   ║
║  └──────────────────────────────────────────────────────────────────────────┘   ║
║                                       │                                          ║
╠══════════════════════════════════════ ▼ ═════════════════════════════════════════╣
║  FASE 5 — test-generator              deps: Fase 4 + create-session + pom-gen   ║
║  ┌──────────────────────────────────────────────────────────────────────────┐   ║
║  │ PIPELINE.md test-generator                                               │   ║
║  │ ⚠️ dry_run obligatorio: tests auto-generados NO postean en Jira          │   ║
║  │ Validación manual requerida antes de habilitar en test-map.json          │   ║
║  │ Milestone: 3 módulos sin cobertura generan tests que compilan            │   ║
║  └──────────────────────────────────────────────────────────────────────────┘   ║
║                                       │                                          ║
╠══════════════════════════════════════ ▼ ═════════════════════════════════════════╣
║  FASE 6 — GitHub Actions schedule     deps: Fase 4 validada y estable           ║
║  ┌──────────────────────────────────────────────────────────────────────────┐   ║
║  │ .github/workflows/qa-pipeline.yml (schedule trigger)                    │   ║
║  │ Alcance: solo schedule automático — NO webhooks Jira (fuera de alcance) │   ║
║  │ Pipeline corre sin sesión local de Claude Code activa                   │   ║
║  │ Milestone: pipeline corre de madrugada sin intervención manual          │   ║
║  └──────────────────────────────────────────────────────────────────────────┘   ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

### Fase 0 — Prerequisitos

**Objetivo:** Asegurar que las piezas existentes están listas y crear los archivos base del sistema.

**Checklist completo:**
- [ ] Verificar `jira-reader` end-to-end: invocar sobre un ticket real de NAA (OP-1, OP-6).
- [ ] Verificar `jira-writer` end-to-end: postear comentario de prueba en ticket no-productivo.
- [ ] Crear `pipeline-logs/active/`, `pipeline-logs/completed/` con `.gitkeep`.
- [ ] Crear `pipeline-logs/failed-reports.json` con `[]` como contenido inicial.
- [ ] Crear `.claude/pipelines/test-engine/references/test-map.json` (§6.1).
- [ ] Crear `.claude/pipelines/ticket-analyst/references/component-to-module.json` (§6.3).
- [ ] Crear `scripts/sync-test-map.ts` y verificar que detecta las 14 sessions existentes.
- [ ] Crear `.claude/references/team-accounts.md` (no versionado — ver §9.3).
- [ ] Agregar `.claude/references/team-accounts.md` al `.gitignore`.
- [ ] Verificar que el `.env` del repo tiene todas las variables de §11.4 configuradas.
- [ ] Elegir un ticket real de NAA para caso de prueba del pipeline completo (E2E manual).
- [ ] **Primer test E2E manual:** ejecutar ticket-analyst sobre el ticket elegido + test-engine manualmente + test-reporter manualmente. Verificar el ciclo antes de automatizar.
- [ ] Resolver **DECISION-01** (MODO F en jira-writer) antes de comenzar Fase 3.

**Entregables:**
```
.claude/pipelines/
├── test-engine/references/test-map.json
└── ticket-analyst/references/component-to-module.json
.claude/references/team-accounts.md   (no en git)
pipeline-logs/
├── active/.gitkeep
├── completed/.gitkeep
└── failed-reports.json
scripts/sync-test-map.ts
```

---

### Fase 1 — Pipeline ticket-analyst (semanas 1-2)

**Objetivo:** Dado un ticket key, producir el JSON de análisis completo.

**Entregables:**

1. **`.claude/pipelines/ticket-analyst/PIPELINE.md`:**
   - Procedimiento paso a paso usando jira-reader OP-1, OP-6, OP-3.
   - Reglas de clasificación: mapear `component_jira` → `domain` + `module` usando `component-to-module.json`.
   - Lógica de `confidence_score`: cuando usar "high", "medium", "low".
   - Lógica de extracción de `test_hints` desde criteria del ticket.
   - Construcción del objeto `jira_metadata` desde el output de jira-reader OP-6.
   - Output contract JSON (schema del §3.3 de este documento).

2. **Validación:**
   - Correr ticket-analyst manualmente sobre 10+ tickets reales de NAA.
   - Verificar que `module` matchea correctamente con `test-map.json`.
   - Verificar que `test_hints` son accionables.
   - Verificar que `confidence` es "high" o "medium" en tickets con component_jira mapeado.

**Trigger de prueba:**
```
"Analizá el ticket NAA-XXXX y dame el JSON de análisis completo"
```

---

### Fase 2 — Pipeline test-engine: discovery + runner (semanas 2-4)

**Objetivo:** Dado el output del ticket-analyst, encontrar y ejecutar sessions existentes.

**Entregables:**

1. **`.claude/pipelines/test-engine/PIPELINE.md`:**
   - Test Discoverer: cómo leer `test-map.json`, precedencia del matching (§6.2).
   - Test Runner: comando exacto con todos los flags (§11.1).
   - Result Parser: cómo interpretar el JSON output de Jest (`--json`).
   - Verificación del grid antes de correr Jest.
   - Lógica de `sessions_found = false` → señalar al Orchestrator.
   - **Solo modos `discover_and_run` y `run_existing`.** No implementar `generate_and_run`.

2. **Formato del JSON output de Jest:**
   ```json
   {
     "numPassedTests": 1,
     "numFailedTests": 0,
     "testResults": [
       {
         "testFilePath": "sessions/post/NewAIPost.test.ts",
         "status": "passed",
         "testResults": [
           { "fullName": "NewAIPost", "status": "passed", "duration": 42000, "failureMessages": [] }
         ]
       }
     ]
   }
   ```

3. **Validación:**
   - Ejecutar ticket-analyst → test-engine sobre 3+ tickets con sessions existentes.
   - Verificar que el JSON de resultados es correcto.
   - Verificar que errores de infra (grid caído) se distinguen de errores de aplicación.

---

### Fase 3 — Pipeline test-reporter (semanas 4-5)

**Objetivo:** Dado el output del test-engine, escribir feedback correcto en Jira.

> ⚠️ **DECISION-01 debe estar resuelta antes de iniciar esta fase.** Ver §META.

**Entregables:**

1. **`.claude/pipelines/test-reporter/PIPELINE.md`:**
   - Mapeo `pass/fail` → payload jira-writer (schema v2.0 completo en §3.3).
   - Construcción ADF del body del comentario.
   - Lógica de transición: `42` vs `2` vs `31`.
   - Flujo Dev_SAAS con fallos: invocar jira-writer Modo D por cada ✘.
   - Idempotencia: verificar `idempotency.already_reported` antes de escribir.

2. **Validación:**
   - Verificar que los comentarios generados son idénticos en formato a los escritos manualmente.
   - Verificar que las transiciones se ejecutan correctamente.
   - Probar flujo Dev_SAAS con ticket que tiene errores (Modo D).
   - Probar idempotencia: ejecutar dos veces sobre el mismo ticket → solo un comentario.

---

### Fase 4 — qa-orchestrator + CronCreate (semanas 5-7)

**Objetivo:** Conectar todo. Un único punto de entrada que ejecuta el pipeline completo.

**Entregables:**

1. **`.claude/pipelines/qa-orchestrator/PIPELINE.md`:**
   - Recepción del trigger event normalizado.
   - Inicialización del Pipeline Context con `pipeline_id` único.
   - Verificación de idempotencia antes de proceder.
   - Secuencia: ticket-analyst → test-engine → (test-generator si `sessions_found=false`) → test-reporter.
   - Persistencia del Pipeline Context en cada stage.
   - Lógica de resumption (§8.3).
   - Registro del Pipeline Execution Record en `pipeline-logs/completed/`.

2. **`poll-jira.ts`:** Ejecutable con `tsx`. JQL queries de §4.3. Produce trigger events para cada ticket encontrado y los pasa al qa-orchestrator.

3. **CronCreate configurado:** prompt y schedule documentados en el PIPELINE.md del orchestrator.

4. **Validación end-to-end:**
   - Pipeline completo sobre ticket real: trigger → Jira actualizado.
   - Verificar Pipeline Execution Record en `pipeline-logs/completed/`.
   - Verificar que `failed-reports.json` funciona cuando jira-writer falla.
   - Probar resumption: interrumpir después de test-engine, retomar con qa-orchestrator.

**Milestone de Fase 4:** Pipeline ejecutable E2E con trigger manual para tickets con sessions existentes. CronCreate activo haciendo sweep cada 30 minutos.

---

### Fase 5 — Pipeline test-generator (semanas 7-9)

**Objetivo:** Cuando no hay sessions para un módulo, generarlas automáticamente con dry_run obligatorio.

**Entregables:**

1. **`.claude/pipelines/test-generator/PIPELINE.md`:**
   - Recepción del input desde qa-orchestrator (`sessions_found = false`).
   - Verificación de POM existente → invocar pom-generator si falta.
   - Invocación de create-session con test_hints + acceptance_criteria + POM.
   - Naming: `sessions/{domain}/AutoGenerated_{ticket_key}.test.ts`.
   - **dry_run obligatorio:** Jest corre, resultados NO van a Jira.
   - Actualización provisional de test-map.json con `validated: false`.
   - Escalación a humano para revisión manual.
   - Proceso de habilitación: solo cuando el commit tiene `[validated]`.

2. **Convenciones para tests auto-generados:**
   ```typescript
   // @auto-generated: true
   // @ticket: NAA-XXXX
   // @validated: false  ← cambiar a true después de revisión manual
   runSession("AutoGenerated NAA-XXXX — Nombre del flujo", async ({ driver, opts, log }) => {
     // lógica generada
   }, {
     issueId: "NAA-XXXX",
     epic:    "Módulo",
     // ...campos jira_metadata del ticket-analyst
   });
   ```

3. **Validación:**
   - Generar sessions para 3 módulos sin tests (Tags, Planning, Admin).
   - Verificar que los archivos generados compilan: `npx tsc --noEmit`.
   - Verificar dry_run: Jest ejecuta, `pipeline-logs/` tiene el resultado, Jira NO tiene comentario.
   - Revisar manualmente, marcar `[validated]`, verificar que pipeline los usa en la siguiente ejecución.

---

### Fase 6 — GitHub Actions schedule (semanas 9-12)

**Objetivo:** Pipeline corre sin sesión local de Claude Code activa.

**Alcance definido:** Solo `schedule` trigger de GitHub Actions. No webhooks Jira. No trigger por PR merge (eso es Fase 6 futura si el equipo crece).

**Entregable:**
```yaml
# .github/workflows/qa-pipeline.yml
name: QA Pipeline — Scheduled sweep
on:
  schedule:
    - cron: '0 */4 * * *'  # cada 4 horas
jobs:
  qa-sweep:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run poll-jira and invoke Claude
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          # credenciales CMS y Jira en secrets
        run: |
          # Invocar Claude API con el orchestrator prompt
          # (implementación específica a definir en Fase 6)
```

> ⚠️ La invocación de Claude en GitHub Actions requiere migrar de Claude Code CLI a Claude API directa o usar `claude --print` si el CLI está disponible en CI. La implementación específica se define al inicio de Fase 6.

**Milestone de Fase 6:** Pipeline ejecuta automáticamente sin que nadie tenga Claude Code abierto.

---

## 16. Resumen de Implementación

```
Fase     Entregable                                  Dependencia              Semanas
─────────────────────────────────────────────────────────────────────────────────────
0        test-map.json + archivos base + Fase 0      —                        0
         checklist completo
1        Pipeline ticket-analyst                     jira-reader ✅           1-2
2        Pipeline test-engine (discover + run)        test-map.json            2-4
3        Pipeline test-reporter                       jira-writer ✅           4-5
         ⚠️ DECISION-01 resuelta antes
4        Pipeline qa-orchestrator + poll-jira.ts      Fases 1-3                5-7
         + CronCreate + failed-reports.json
5        Pipeline test-generator (dry_run first)      create-session ✅        7-9
                                                      pom-generator ✅
6        GitHub Actions schedule                       Fase 4 validada         9-12
```

**Primer milestone funcional (Fase 4):** Pipeline E2E con trigger manual. Tiempo: ~7 semanas.  
**Segundo milestone (Fase 5):** Generación de tests para módulos sin cobertura (con dry_run).  
**Tercer milestone (Fase 6):** Pipeline autónomo sin sesión local activa.

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
| Pipeline Context | Estado acumulado durante la ejecución del qa-orchestrator (persistido a disco) |
| Module | Agrupación funcional del CMS con sessions asociadas (ej: `ai-post`, `video`) |
| ADF | Atlassian Document Format — formato JSON obligatorio para todo contenido rich text en Jira |
| dry_run | Ejecución del pipeline donde los tests corren pero los resultados NO se postean en Jira |
| confidence | Nivel de certeza del ticket-analyst al clasificar un módulo: high / medium / low |
| validated | Flag en test-map.json: true = session revisada manualmente; false = auto-generada sin review |
| DLQ | Dead Letter Queue — en este sistema: `pipeline-logs/failed-reports.json` |

---

## Apéndice B — Jira Cloud y Transiciones

- **Cloud ID:** `c303d73b-75df-492e-9e64-479b722035cf`
- **Proyecto:** `NAA` (Nuevo Administrador - AGIL)
- **Base URL:** `https://bluestack-cms.atlassian.net`

| transition.id | Destino | Cuándo usarlo en el pipeline |
|---|---|---|
| `2` | FEEDBACK | Validación Master con algún ✘ |
| `31` | Done | Validación Dev_SAAS toda ✔ |
| `42` | A Versionar | Validación Master toda ✔ |

Referencia completa de transiciones: `.claude/skills/jira-reader/references/transitions.md`

> **Account IDs del equipo:** Ver `.claude/references/team-accounts.md` (archivo no versionado en git — ver §9.3).

---

## Apéndice C — Referencias cruzadas de skills

| Paso del pipeline | Skill | Operación | Ubicación |
|---|---|---|---|
| ticket-analyst: contexto del ticket | `jira-reader` | OP-1 `read_ticket` | `.claude/skills/jira-reader/` |
| ticket-analyst: buscar tickets por JQL | `jira-reader` | OP-2 `search_jql` | `.claude/skills/jira-reader/` |
| ticket-analyst: extraer test_cases del Master | `jira-reader` | OP-3 `extract_test_cases` | `.claude/skills/jira-reader/` |
| ticket-analyst: extraer criterios para mapear tests | `jira-reader` | OP-6 `extract_criteria` | `.claude/skills/jira-reader/` |
| test-generator: generar session nueva | `create-session` | — | `.claude/skills/create-session/` |
| test-generator: generar POM faltante | `pom-generator` | — | `.claude/skills/pom-generator/` |
| test-reporter: validar en Master | `jira-writer` | `validate_master` (Modo B) | `.claude/skills/jira-writer/` |
| test-reporter: validar en Dev_SAAS | `jira-writer` | `validate_devsaas` (Modo C→D) | `.claude/skills/jira-writer/` |
| test-reporter: crear bug por fallo | `jira-writer` | `create_bug` (Modo A) | `.claude/skills/jira-writer/` |

### Contratos de integración (pipeline-schema.md)

- Input/Output de `jira-reader` → `.claude/skills/jira-reader/references/pipeline-schema.md`
- Input/Output de `jira-writer` → `.claude/skills/jira-writer/references/pipeline-schema.md`
- Flujo Dev_SAAS completo → `.claude/skills/jira-writer/references/devsaas-flow.md`

---

## Apéndice D — DECISION-01: MODO F en jira-writer

**Contexto:** `jira-reader/references/pipeline-schema.md` referencia "MODO F" como punto de entrada unificado para el pipeline. Actualmente no existe en jira-writer/SKILL.md.

**Estado:** ⚠️ ABIERTA — Resolver antes de Fase 3.

**Opción A:** Implementar MODO F en jira-writer antes de Fase 3.  
**Opción B:** No implementar MODO F. Eliminar la referencia de jira-reader/references/pipeline-schema.md. El test-reporter llama operaciones individuales.

**Registrar la decisión aquí al resolverla:**
```
Fecha de decisión: ___________
Opción elegida:    A | B
Razón:             ___________
Acción tomada:     ___________
```
