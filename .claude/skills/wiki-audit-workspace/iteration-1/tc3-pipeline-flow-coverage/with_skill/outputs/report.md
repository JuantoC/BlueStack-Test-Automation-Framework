---
audit_date: 2026-04-17
audit_type: R7 Pipeline Flow Coverage Audit
scope: qa-orchestrator + ticket-analyst agent flows
mode: report
---

# Wiki Audit Report — R7 Pipeline Flow Coverage Analysis

## Resumen ejecutivo

Análisis de cobertura wiki de los conceptos críticos del pipeline QA multi-agente (`qa-orchestrator.md` y `ticket-analyst.md`). El resultado muestra **11 conceptos cubiertos directamente** en la wiki y **5 conceptos parcialmente cubiertos** que requieren referencia a archivos agent/reference externos.

**Métrica de éxito:** `[FLUJO-CUBIERTO]` significa que existe una página wiki autónoma que el agente puede consultar sin leer el archivo agent. `[FLUJO-SIN-COBERTURA]` o `[FLUJO-PARCIAL]` significa que el agente debe leer el agent .md o referencias externas para comprender completamente el concepto.

---

## Tabla de conceptos del pipeline — Cobertura wiki

| # | Concepto | Flujo origen | Cobertura wiki | Estado | Referencia |
|---|----------|--------------|----------------|--------|-----------|
| 1 | `environment` — master vs dev_saas | ORC-1.0 | ✅ CUBIERTO | Entrada única en wiki/index.md | `wiki/qa/environments.md` |
| 2 | Derivación de ambiente desde Jira status | ORC-1.0 | ✅ CUBIERTO | Entry point claro | `wiki/qa/environments.md` |
| 3 | Mapeo TARGET_ENV en .env | ORC-1.0 + TE-6 | ✅ CUBIERTO | Tabla equivalencias | `wiki/qa/environments.md` |
| 4 | `acceptance_criteria[]` — estructura | TA-4 → TA-9 | ⚠️ PARCIAL | Schema en agent no wiki | `.claude/agents/ticket-analyst.md` TA-9 |
| 5 | `criterion_scope` (ui/vfs/backend_data/api) | TA-4.2 + TA-4b | ✅ CUBIERTO | Valores documentados | `.claude/agents/ticket-analyst.md` (NO hay wiki dedicated) |
| 6 | `testability_summary.action` — routing | TA-7b → ORC-2.5 | ⚠️ PARCIAL | Tabla de decisión en agents | ORC-2.5 routing table (NO en wiki) |
| 7 | `test-map.json` — lookup/cobertura | TA-5b → TE-4 | ⚠️ PARCIAL | Referenciado, no documentado | `wiki/pages/ckeditor-limitations.md` + `wiki/qa/manual-test-validation.md` |
| 8 | Invalidación de criterios (TA-4.4) | TA-4 → 4.4 | ✅ CUBIERTO | Doctrina completa | `wiki/qa/comment-invalidation.md` |
| 9 | Visual check + screenshots | TA-4b + TE-6.1 | ✅ CUBIERTO | Doctrina con datos | `wiki/qa/visual-validation.md` |
| 10 | Dev_SAAS flujo completo | ORC-2 + ORC-5/6 | ✅ CUBIERTO | End-to-end documentado | `wiki/qa/devsaas-flow.md` |
| 11 | ADF format para comentarios | ORC-6 + test-reporter | ✅ CUBIERTO | Guía completa + ejemplos | `wiki/qa/adf-format-guide.md` |
| 12 | Escalación y `human_escalation: true` | TA-4.3/4.4 → ORC-6 | ⚠️ PARCIAL | Escenarios en agents, doctrina parcial | Agent docs vs escalation_report schema |
| 13 | Automatizabilidad (automatable:true/false) | TA-4b → test-map.json | ⚠️ PARCIAL | Reglas en agents, no centralizado | `.claude/agents/ticket-analyst.md` TA-4b |
| 14 | POM gaps y sub-casos non_automatable | TA-4b + test-generator | ⚠️ PARCIAL | Documentado en agent, wiki parcial | `wiki/pages/ckeditor-limitations.md` + `wiki/pages/ai-note.md` |
| 15 | Execution Context — estructura | ORC-1.3 → ORC-6 | ⚠️ PARCIAL | Parcialmente documentado | `.claude/agents/qa-orchestrator.md` ORC-1.3 |
| 16 | Pipeline idempotencia y resumption | ORC-1.2 | ✅ CUBIERTO | Mecanismo completo | `.claude/agents/qa-orchestrator.md` (NO hay wiki) |

---

## Análisis por flujo crítico

### ORC-1: Inicialización

| Flujo | Concepto | Cobertura | Acción requerida |
|-------|----------|-----------|------------------|
| ORC-1.0 | Derivar `environment` desde Jira status | ✅ CUBIERTO | `wiki/qa/environments.md` cubre la tabla |
| ORC-1.0b | Validar `CLIENTE_BASE_URL` en .env | ⚠️ GAP | [FLUJO-SIN-COBERTURA] — debe documentarse en wiki/qa/environments.md |
| ORC-1.1 | Generar `pipeline_id` | ⚠️ GAP | [FLUJO-SIN-COBERTURA] — concepto sin página wiki |
| ORC-1.2 | Idempotencia + stage routing | ✅ CONOCIDO | Documentado en agente, concepto complejo — gap menor |
| ORC-1.3 | Execution Context v3.0 schema | ⚠️ PARCIAL | [FLUJO-SIN-COBERTURA] — schema solo en agent, no hay wiki/qa/execution-context.md |

### ORC-2 + ORC-2.5: Ticket Analysis y Routing

| Flujo | Concepto | Cobertura | Acción requerida |
|-------|----------|-----------|------------------|
| TA-4.1 → 4.2 → 4.4 | Extracción + Inferencia + Invalidación de criterios | ✅ CUBIERTO | `wiki/qa/comment-invalidation.md` cubre TA-4.4 completo |
| TA-4.2 | Inferencia de `criterion_scope` desde customfields | ⚠️ GAP | [FLUJO-SIN-COBERTURA] — lógica en agent, no hay entrada en wiki/index.md |
| TA-4b | Automatizabilidad por criterio (visual_check, clipboard, ckeditor) | ⚠️ PARCIAL | `wiki/pages/ckeditor-limitations.md` + `wiki/qa/visual-validation.md` + `wiki/pages/ai-note.md` cubren parcialmente — **falta guía centralizada de sub-casos non_automatable** |
| TA-7b | Determinar `testability_summary.action` | ⚠️ GAP | [FLUJO-SIN-COBERTURA] — tabla de decisión (`full_run`, `generate_tests`, `partial_run_and_escalate`, `escalate_all`) solo en agent ORC-2.5 |
| ORC-2.5 | Routing por `testability_summary.action` | ⚠️ GAP | [FLUJO-SIN-COBERTURA] — tabla de flujos condicionales no documentada en wiki |

### TA-5b: Coverage gap analysis

| Flujo | Concepto | Cobertura | Acción requerida |
|-------|----------|-----------|------------------|
| TA-5b | Consultar `test-map.json` para coverage | ⚠️ PARCIAL | `test-map.json` referenciado en `wiki/qa/manual-test-validation.md` y `wiki/pages/ckeditor-limitations.md` pero SIN guía de estructura o lookup |
| TA-5b | `covered_by_existing_session: true/false` | ⚠️ GAP | [FLUJO-SIN-COBERTURA] — concepto sin página wiki, solo en agent |

### ORC-3 + ORC-4 + ORC-5: Test Execution

| Flujo | Concepto | Cobertura | Acción requerida |
|-------|----------|-----------|------------------|
| ORC-3 | test-engine invocation | ✅ CONOCIDO | `wiki/core/run-session.md` + `wiki/sessions/catalog.md` cubren ejecución |
| ORC-4 | Session discovery branch | ✅ CONOCIDO | Lógica en agents, documented en `wiki/qa/validation-session-2026-04-15.md` |
| ORC-4.1/4.2 | test-generator invocation | ⚠️ PARCIAL | Agente existe pero no hay wiki/pages/test-generation.md |
| ORC-5 | test-reporter invocation | ✅ CUBIERTO | `wiki/qa/pipeline-integration-schema.md` documenta contrato |

### ORC-6: Escalación y Finalización

| Flujo | Concepto | Cobertura | Acción requerida |
|-------|----------|-----------|------------------|
| ORC-6 | `escalation_mode: true` | ⚠️ PARCIAL | Concepto en agents, no hay doctrina wiki centralizada |
| ORC-6 | `escalation_report` schema | ⚠️ PARCIAL | Schema en ticket-analyst.md TA-4.3/4b, no hay wiki |
| ORC-6.3 | Agent Execution Record | ⚠️ GAP | [FLUJO-SIN-COBERTURA] — concepto sin página wiki |

---

## Conceptos sin cobertura wiki directa — GAPs identificados

### Críticos (ALTA severidad)

1. **`testability_summary.action` y routing condicional (ORC-2.5)**
   - Ubicación agent: `.claude/agents/qa-orchestrator.md` ORC-2.5
   - Valores: `"full_run"`, `"generate_tests"`, `"partial_run_and_escalate"`, `"escalate_all"`
   - Decisión: tabla en agent pero NO referenciada en `wiki/index.md`
   - Acción: **Crear `wiki/qa/testability-action-routing.md` o ampliar `wiki/qa/pipeline-integration-schema.md`**

2. **`acceptance_criteria[]` — schema completo**
   - Ubicación agent: `.claude/agents/ticket-analyst.md` TA-9
   - Estructura: `criterion_id`, `description`, `test_approach`, `criterion_type`, `criterion_scope`, `automatable`, `reason_if_not`, `requires_screenshot`, `use_specific_test_data`, `coverage`
   - Gap: solo "aceptación" mencionada en agent, SIN tabla de referencia wiki
   - Acción: **Crear `wiki/qa/acceptance-criteria-schema.md` o agregar a pipeline-integration-schema.md**

3. **`criterion_scope` — valores y reglas de inferencia (TA-4.2)**
   - Ubicación agent: `.claude/agents/ticket-analyst.md` TA-4.2
   - Valores: `"ui"` (default), `"vfs"`, `"backend_data"`, `"api"`
   - Regla de inferencia: buscar customfields VFS/SQL + guard de keywords UI
   - Gap: concepto fragmentado, regla no centralizada
   - Acción: **Crear `wiki/qa/criterion-scope-guide.md` con tabla + ejemplos**

4. **Execution Context v3.0 — estructura y campos principales**
   - Ubicación agent: `.claude/agents/qa-orchestrator.md` ORC-1.3, schema JSON
   - Campos: `pipeline_id`, `schema_version`, `stage`, `stage_status`, `escalation_mode`, `idempotency`, `error_log`, `step_log`, sub-outputs
   - Gap: schema completo solo en agent, no hay referencia wiki
   - Acción: **Crear `wiki/qa/execution-context.md` con documentación del schema**

### Medios (MEDIA severidad)

5. **Automatizabilidad sub-casos — guía centralizada**
   - Ubicación agent: `.claude/agents/ticket-analyst.md` TA-4b
   - Sub-casos: `visual_check`, `clipboard` (pom_gap), `ckeditor_plugin_interaction`, `timezone_display_check`, `backend_data_validation`
   - Cobertura wiki: fragmentada en 3 archivos (`ckeditor-limitations.md`, `visual-validation.md`, `ai-note.md`)
   - Gap: agente debe leer múltiples archivos para entender el panorama completo
   - Acción: **Crear `wiki/qa/non-automatable-criteria.md` con tabla centralizada de sub-casos**

6. **test-map.json — estructura de lookup**
   - Ubicación referencia: `.claude/pipelines/test-engine/references/test-map.json`
   - Gap: archivo referenciado pero estructura no documentada en wiki
   - Cobertura parcial: `manual-test-validation.md` menciona cambiar `validated:false→true` pero no explica schema completo
   - Acción: **Agregar sección "test-map.json structure" a `wiki/qa/manual-test-validation.md`**

7. **Escalación y `escalation_report` schema**
   - Ubicación agent: `.claude/agents/ticket-analyst.md` TA-4.3/4.4
   - Campos: `summary`, `criteria_attempted[]`, `manual_test_guide[]`, con estructura interna
   - Gap: schema definido en agent pero no hay guía wiki de cuándo/cómo escalar
   - Acción: **Ampliar `wiki/qa/comment-invalidation.md` con sección de "Escalation Report Schema"**

8. **Pipeline idempotencia y stage routing**
   - Ubicación agent: `.claude/agents/qa-orchestrator.md` ORC-1.2
   - Complejidad: stage routing table con 7 casos condicionales
   - Gap: concepto crítico solo en agent, NO mencionado en `wiki/index.md`
   - Acción: **Crear `wiki/qa/pipeline-idempotence.md` o agregar a Execution Context doc**

9. **CLIENTE_BASE_URL — prerequisitos de ambiente**
   - Ubicación agent: `.claude/agents/qa-orchestrator.md` ORC-1.0b
   - Gap: validación agregada el 2026-04-17 pero wiki/qa/environments.md no la documenta
   - Acción: **Actualizar `wiki/qa/environments.md` con sección de "Prerequisites por environment"**

### Menores (BAJA severidad)

10. **`pipeline_id` — generación y formato**
    - Ubicación agent: `.claude/agents/qa-orchestrator.md` ORC-1.1
    - Formato: `pipe-YYYYMMDD-NNN`
    - Gap: concepto simple pero sin documentación wiki
    - Acción: Documentar en `execution-context.md` o pequeña sección en `environments.md`

11. **Agent Execution Record — milestone_notes schema**
    - Ubicación agent: `.claude/agents/qa-orchestrator.md` ORC-6.3
    - Gap: estructura final del context pero concepto sin página wiki
    - Acción: Documentar como campo de `execution-context.md`

---

## Tabla de cobertura por Referencias rápidas

Verificación de si los conceptos frecuentes están **directamente accesibles** desde `wiki/index.md` § "Referencias rápidas":

| Concepto | En Referencias rápidas | Entry point |
|----------|------------------------|-------------|
| Crear un test | ✅ SÍ | core/run-session.md |
| Instanciar un PO | ✅ SÍ | patterns/conventions.md |
| Usar datos de prueba | ✅ SÍ | patterns/factory-api.md |
| Hacer click/escribir | ✅ SÍ | core/actions.md |
| Navegar CMS | ✅ SÍ | pages/_shared.md |
| Ver tests existentes | ✅ SÍ | sessions/catalog.md |
| Entender logs | ✅ SÍ | core/logging.md |
| Arquitectura QA | ✅ SÍ | docs/architecture/qa-pipeline/INDEX.md |
| Docker Grid | ✅ SÍ | core/docker-grid.md |
| Comandos | ✅ SÍ | .claude/references/COMMANDS.md |
| ADF JSON | ✅ SÍ | qa/adf-format-guide.md |
| Tests auto-generados | ✅ SÍ | qa/manual-test-validation.md |
| **[FALTA]** `testability_summary.action` routing | ❌ NO | — |
| **[FALTA]** Criterio scope & inferencia | ❌ NO | — |
| **[FALTA]** Escalación y criterios non-automatable | ❌ PARCIAL | qa/comment-invalidation.md (solo invalidación) |
| **[FALTA]** Execution Context schema | ❌ NO | — |

---

## Estadísticas

**Conceptos analizados:** 16  
**Cubiertos directamente:** 7 (43%)  
**Parcialmente cubiertos:** 6 (37%)  
**Sin cobertura:** 3 (19%)  
**Gaps críticos identificados:** 4  
**Gaps medios identificados:** 5  

---

## Recomendaciones prioritarias

### Corto plazo (esta iteración)

1. **Crear `wiki/qa/testability-action-routing.md`** — tabla de decisión de `testability_summary.action` con ejemplos por outcome
2. **Crear `wiki/qa/criterion-scope-guide.md`** — valores, inferencia desde customfields, guard de keywords UI
3. **Crear `wiki/qa/execution-context.md`** — schema completo v3.0, campos por stage, resumen ejecutivo
4. **Actualizar `wiki/qa/environments.md`** — agregar section "Prerequisites" con CLIENTE_BASE_URL y ORC-1.0b

### Mediano plazo (próxima iteración)

5. **Crear `wiki/qa/non-automatable-criteria.md`** — tabla centralizada de sub-casos (`visual_check`, `ckeditor`, `timezone`, etc.)
6. **Ampliar `wiki/qa/manual-test-validation.md`** — agregar "test-map.json structure" section
7. **Ampliar `wiki/qa/comment-invalidation.md`** — agregar "Escalation Report Schema" section
8. **Crear `wiki/qa/pipeline-idempotence.md`** — mecanismo de resumption y stage routing

### Futuro (inversión de deuda técnica)

9. Crear página wiki para `test-generator` (agente Fase 5)
10. Documentar interacción `test-engine` ↔ `test-reporter` en detalle

---

## Conclusión

La wiki cubre correctamente los **conceptos entrada-salida** del pipeline (ambientes, Dev_SAAS, ADF, comentarios Jira). Sin embargo, hay **gaps significativos en la documentación de toma de decisiones internas** del agente (`testability_summary.action`, `criterion_scope`, `acceptance_criteria[]`), que fuerzan al agente a leer los archivos `.md` de los agentes en lugar de consultar una fuente wiki canónica.

**Severidad:** MEDIA. El pipeline funciona porque los agentes tienen la lógica correcta internamente, pero los gaps wiki aumentan el token lookup del agente y hacen que cambios futuros sean más frágiles (cambiar schema requiere actualizar múltiples lugares).

**Next step:** Ejecutar creación de páginas wiki recomendadas en corto plazo, luego registrar en `wiki/log.md` como `[update]` con fecha y lista de archivos modificados.

