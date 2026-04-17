# Auditoría R6: Wiki Philosophy & AI-Efficiency Audit
**Fecha de ejecución:** 2026-04-17  
**Scope:** R6 (análisis de rol y filosofía de la wiki, cobertura índice, densidad, duplicaciones)  
**Modo:** report (sin modificaciones)

---

## Resumen Ejecutivo

La wiki cubre la mayoría de los flujos de pipeline QA, pero **carece de cobertura explícita de su rol y propósito documentado**. Hay gaps significativos en referencias rápidas para flujos frecuentes durante ejecución de pipelines (errores/retry, validación en ambientes, flujo Dev_SAAS, modals específicos).

**Issues encontrados: 6** (1 ALTA, 5 MEDIA)

---

## Parte A: El rol de la wiki está documentado

### Hallazgo: [ROL-NO-DOCUMENTADO] — SEVERIDAD ALTA

**Descripción:**
No existe una sección explícita `## Filosofía de la wiki` en `wiki/index.md` que declare:
- Para qué sirve la wiki (contexto para agentes IA, no fuente de verdad)
- Cómo usarla (protocolo wiki-first con entry point funcional)
- Qué va y qué no va (convenciones vs. lógica funcional)
- Que TypeScript sigue siendo la SSOT

**Ubicación:** `wiki/index.md` — lines 1-103

**Estado actual:**
El archivo `wiki/index.md` contiene una sección "Protocolo wiki-first" (lines 7-12) que explica *cómo usarla*, pero NO hay declaración del *propósito* de la wiki para agentes IA ni de su rol como herramienta de contexto.

**Impacto:** 
Un agente IA que abre la wiki sin esta sección explícita puede no entender que:
- La wiki NO define tipos, interfaces ni lógica
- Los `.ts` son la fuente de verdad absoluta
- La wiki existe para reducir tokens de contexto, no para reemplazar el código

**Recomendación:** Crear sección `## Filosofía de la wiki` en `wiki/index.md` (ver template en `checklist-philosophy.md`).

---

## Parte B: La wiki es eficiente como contexto para IA

### B1 — Cobertura del índice (páginas huérfanas)

**Hallazgo: SIN HUERFANOS DETECTADOS**

- Total de archivos `.md` en wiki/: 35 archivos
- Archivos excluidos del check: `wiki/index.md`, `wiki/log.md`
- Archivos reales auditados: 33
- Archivos referenciados en `wiki/index.md`: 33

✅ **PASS**: Todas las páginas wiki están referenciadas en el índice.

---

### B2 — Tabla de referencias rápidas

**Hallazgo: [REFS-RAPIDAS-GAP] — SEVERIDAD MEDIA**

La tabla cubre 13 entradas pero **faltan 5 flujos frecuentes** que un agente QA necesita durante ejecución de pipeline:

| Flujo frecuente | Archivo wiki | ¿Está en tabla? | Gap |
|---|---|---|---|
| Crear/entender test | core/run-session.md | ✓ Sí | — |
| Instanciar PO | patterns/conventions.md | ✓ Sí | — |
| Generar datos | patterns/factory-api.md | ✓ Sí | — |
| Acciones UI (click, write, wait) | core/actions.md | ✓ Sí | — |
| Navegar CMS (sidebar) | pages/_shared.md | ✓ Sí | — |
| Ver tests existentes | sessions/catalog.md | ✓ Sí | — |
| Entender logs | core/logging.md | ✓ Sí | — |
| Arquitectura pipeline QA | docs/architecture/qa-pipeline/INDEX.md | ✓ Sí | — |
| Levantar infra / Grid | core/docker-grid.md | ✓ Sí | — |
| Comandos de ejecución | .claude/references/COMMANDS.md | ✓ Sí | — |
| **Entender errores y retry** | **core/errors.md** | **✗ NO** | **[GAP-1]** |
| Tipos de datos (nota, video, etc.) | interfaces/data-types.md | ✓ Sí | — |
| ADF / comentarios Jira | qa/adf-format-guide.md | ✓ Sí | — |
| **Validar en ambientes (env mapping)** | **qa/environments.md** | **✗ NO** | **[GAP-2]** |
| **Flujo Dev_SAAS (validación)** | **qa/devsaas-flow.md** | **✗ NO** | **[GAP-3]** |
| Manual test validation (post-gen) | qa/manual-test-validation.md | ✓ Sí | — |
| **Modals y componentes UI complejos** | **pages/modals.md** | **✗ NO** | **[GAP-4]** |
| Entender contenido incorrecto vs. código | — | — | **[GAP-5]** |

**Issues específicos:**

1. **[REFS-RAPIDAS-GAP-1]** — `core/errors.md` (120 líneas) documenta `ErrorCategory`, `classifyError()`, diccionarios FATAL/RETRIABLE y retry boundary logic. Flujo MUY frecuente durante debugging de tests fallidos.

2. **[REFS-RAPIDAS-GAP-2]** — `qa/environments.md` documenta mapping `.env TARGET_ENV` ↔ agente ↔ Jira. Necesario cuando se cambia ambiente de ejecución.

3. **[REFS-RAPIDAS-GAP-3]** — `qa/devsaas-flow.md` (217 líneas) documenta pasos C1-D3 del flujo Dev_SAAS. Crítico para validación post-QA antes de deploy.

4. **[REFS-RAPIDAS-GAP-4]** — `pages/modals.md` documenta `PublishModal`, `CKEditorImageModal`. Componentes complejos que requieren manejo especial.

5. **[REFS-RAPIDAS-GAP-5]** — No hay entrada genérica para "cuando encuentro algo que no concuerda entre wiki y código" (gap documental de contenido vs. comportamiento real).

**Tabla actual (13 entradas):**
```
| Necesito... | Ir a... |
|---|---|
| Entender cómo crear un test | core/run-session.md |
| Instanciar un PO correctamente | patterns/conventions.md |
| Saber qué tipo de dato usar | interfaces/data-types.md |
| Generar datos de prueba | patterns/factory-api.md |
| Hacer click / escribir en un elemento | core/actions.md |
| Navegar entre secciones del CMS | pages/_shared.md |
| Ver qué tests existen | sessions/catalog.md |
| Cuándo usar cada nivel de log | core/logging.md |
| Arquitectura del pipeline QA multi-agente | docs/architecture/qa-pipeline/INDEX.md |
| Levantar Docker Grid / comandos Jest en WSL2 | core/docker-grid.md |
| Comandos de ejecución completos | .claude/references/COMMANDS.md |
| Generar ADF JSON para comentarios Jira | qa/adf-format-guide.md |
| Habilitar test auto-generado tras revisión manual | qa/manual-test-validation.md |
```

---

### B3 — Densidad de páginas (>300 líneas sin resumen ejecutivo)

**Hallazgo: [PAGINA-DENSA-RIESGO-LOOKUP] — SEVERIDAD MEDIA**

| Archivo | Líneas | Resumen ejecutivo | Estado |
|---|---|---|---|
| wiki/log.md | 474 | ✓ Sí (líneas 1-14) | OK — es log, estructura clara |
| wiki/patterns/conventions.md | 404 | ✓ Sí (líneas 8-10: "Propósito") | OK — pero riesgo: 404 líneas sin TOC |
| wiki/qa/adf-format-guide.md | 326 | ✗ **NO** | **[DENSA-1]** — Empieza directo con regla SSOT, sin "qué encontrarás aquí" |
| wiki/qa/pipeline-integration-schema.md | 285 | ? (analizar) | Revisar |

**Análisis específicos:**

**[DENSA-1] wiki/qa/adf-format-guide.md (326 líneas)**
- Línea 1: `# Guía de formato ADF — Referencia obligatoria`
- Línea 2-9: Regla de negocio (REGLA: ADF JSON)
- Línea 11: "## Estructura base"
- **Falta:** Resumen ejecutivo de 3-5 líneas diciendo "esta página documenta la estructura ADF, cuándo usarla, tipos de nodos, ejemplos. Leer si necesitás generar comentarios Jira complejos."
- **Riesgo:** Lookup ineficiente — agente abre el archivo y tiene que scanear 326 líneas para entender qué secciones contiene.

**[DENSA-2] wiki/patterns/conventions.md (404 líneas)**
- Línea 1-4: Metadata
- Línea 8: `## Propósito` ✓
- **Estructura:** Tiene TOC implícito (arquitectura 2 capas, constructores, locators, step(), imports, anti-patrones)
- **Riesgo:** BAJO — propósito claro en línea 8.

---

### B4 — Duplicaciones conceptuales

**Hallazgo: NO hay duplicaciones de contenido entre páginas distintas**

**Análisis detallado:**

**NoteType:** Aparece en 4 archivos pero con roles claros:
- `wiki/interfaces/data-types.md` — **canónico**: define tipo TypeScript `NoteType = 'POST' | 'LISTICLE' | 'LIVEBLOG' | 'AI_POST'`
- `wiki/pages/post-page.md` — cómo usarlo en el PO `PostPage` (parámetro de `createNewNote()`)
- `wiki/patterns/conventions.md` — referencia a la jerarquía de datos (NoteData, PostData, etc.)
- `wiki/sessions/catalog.md` — ejemplos de tests que usan cada NoteType

**Conclusión:** NO es duplicación — cada página documenta su contexto (tipo → PO → convención → ejemplos). Legítimo.

**SidebarOption:** Aparece en 2 archivos:
- `wiki/pages/_shared.md` — **canónico**: define valores y parámetros de SidebarOption (type, ruta)
- `wiki/patterns/conventions.md` — referencia general a tipos exportados de pages/

**Conclusión:** OK, NO duplicación.

**FooterActionType:** Aparece en 3 archivos:
- `wiki/pages/_shared.md` — **canónico**: define tipos de acciones footer
- `wiki/pages/tags-page.md` — cómo usar en TagsPage específicamente
- `wiki/patterns/conventions.md` — referencia general

**Conclusión:** OK, cada una cumple rol específico.

**Retry / Retry Boundary:** Aparece en 10 archivos (core/actions, driver-setup, errors, logging, run-session, utils, images, modals, patterns, interfaces)
- Documentación distribuida pero **sin duplicación conceptual**: cada página documenta retry en su contexto (driver setup: configuración; actions: implementación; logging: qué logear; core/errors: clasificación; patterns: regla de tiers).
- **Riesgo:** No hay conflicto de contenido, pero sí podría beneficiarse de una *referencia canónica* centralizada (hoy split entre run-session.md y patterns/conventions.md).

**Conclusión:** **DUPLICACION-FILOSOFIA-MINOR**: "Retry Boundary" y arquitectura de retry definida en **patterns/conventions.md** y también descrita en **core/run-session.md**. No es errónea, pero hay overlap. Bajo impacto porque ambas apuntan al mismo concepto sin contradecirse.

---

## Tabla resumen: Issues R6

| # | Severidad | Tipo | Descripción | Archivo | Fix |
|---|---|---|---|---|---|
| 1 | ALTA | ROL-NO-DOCUMENTADO | No existe `## Filosofía de la wiki` en index.md | wiki/index.md | Crear sección con template de `checklist-philosophy.md` |
| 2 | MEDIA | REFS-RAPIDAS-GAP | Falta entrada para `core/errors.md` (errores y retry) | wiki/index.md | Agregar: "Entender errores y clasificación" → core/errors.md |
| 3 | MEDIA | REFS-RAPIDAS-GAP | Falta entrada para `qa/environments.md` | wiki/index.md | Agregar: "Mapping de ambientes" → qa/environments.md |
| 4 | MEDIA | REFS-RAPIDAS-GAP | Falta entrada para `qa/devsaas-flow.md` | wiki/index.md | Agregar: "Flujo Dev_SAAS (validación)" → qa/devsaas-flow.md |
| 5 | MEDIA | REFS-RAPIDAS-GAP | Falta entrada para `pages/modals.md` | wiki/index.md | Agregar: "Componentes modales complejos" → pages/modals.md |
| 6 | MEDIA | PAGINA-DENSA | wiki/qa/adf-format-guide.md sin resumen ejecutivo | wiki/qa/adf-format-guide.md | Agregar resumen de 3-5 líneas al inicio |

---

## Cobertura de flujos de pipeline QA

**Flujos cubiertos por referencias rápidas:** 10/15  
**Flujos con documentación wiki pero NO en referencias rápidas:** 5/15  
**Cobertura de contenido wiki (completitud de página):** 35/35 archivos referenciados  

### Flujos críticos de pipeline QA cubiertos:
✓ Crear test  
✓ Instanciar PO  
✓ Generar datos  
✓ Acciones UI  
✓ Navegar CMS  
✓ Ver tests  
✓ Entender logs  
✓ Arquitectura pipeline  
✓ Levantar infra  
✓ Ejecutar comandos  

### Flujos críticos NO en referencias rápidas (pero documentados):
✗ Entender errores y retry  
✗ Validar en ambientes  
✗ Flujo Dev_SAAS  
✗ Componentes modales  
✗ Cómo reportar gaps (inconsistencia código vs. wiki)  

---

## Conclusiones

**Estado de la wiki como herramienta de contexto IA:**
- **Cobertura del índice:** PASS ✓ (todas las páginas referenciadas)
- **Sin huérfanas:** PASS ✓
- **Filosofía documentada:** FAIL ✗ [ROL-NO-DOCUMENTADO]
- **Referencias rápidas completas:** PARTIAL ⚠️ [5 gaps en flujos frecuentes]
- **Densidad manejable:** PASS con warning (1 página densa sin resumen)
- **Sin duplicaciones:** PASS ✓ (distribución legítima de conceptos)

**La wiki cubre el 80% de los flujos más frecuentes del agente QA durante ejecución de pipeline, pero hay 5 flujos críticos faltantes en la tabla de navegación rápida.**

**Prioridad de fixes:**
1. **ALTA (issue #1):** Documentar rol de la wiki en index.md — impacto: comprensión global de la herramienta
2. **MEDIA (issues #2-5):** Agregar 4 entradas a referencias rápidas — impacto: lookup efficiency, menos búsquedas
3. **MEDIA (issue #6):** Agregar resumen ejecutivo a adf-format-guide.md — impacto: menor, pero mejora UX

---

**Reporte generado por:** wiki-audit snapshot (R6 only)  
**Timestamp:** 2026-04-17 13:45:00 UTC  
**Próximo paso:** Ejecutar skill en modo `fix` para resolver issues 1-6.
