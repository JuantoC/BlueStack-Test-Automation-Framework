# Wiki Log

Registro de ingest, gaps detectados y cambios a la wiki.

---

## Formato de entrada

```
[YYYY-MM-DD] <tipo> | <descripción>
<detalle opcional>
```

Tipos: `ingest` | `gap` | `update` | `fix`

---

## Entradas

## [2026-04-16] fix | Issue 5 — HeaderNewContentBtn agregado al directorio de src/pages/README.md
`HeaderNewContentBtn.ts` existía en `src/pages/` pero no figuraba en la tabla de directorio del README.
Entrada agregada en la sección raíz, junto a `SidebarAndHeaderSection.ts` y `FooterActions.ts`, con link a `wiki/pages/_shared.md#headernewcontentbtn`.

## [2026-04-16] fix | Issue 6 — Descripción de clickOnMultimediaFileBtn completada en wiki/pages/_shared.md
La descripción del método omitía tres elementos del comportamiento real del código:
- Toda la secuencia está dentro de `retry()`
- La config interna usa `supressRetry: true` para evitar reintentos anidados
- Hay un `waitVisible()` explícito sobre el elemento del submenú antes de clickear la opción
Actualizada la tabla API y la sección "Navegación: directa vs multimedia" para reflejar el comportamiento real.

## [2026-04-16] update | Issue 10 — Sección "deuda de cobertura" en wiki/index.md verificada
Estado verificado al 2026-04-16: `comment_page/` y `user_profile_page/` continúan sin archivos `.ts`.
La sección en wiki/index.md ya refleja el estado real — no se requirieron cambios.

## [2026-04-16] update | Auditoría SSoT — referencias en SKILL.md apuntan a wiki/ (no a stubs en references/)

Los tres `references/` auditados ya eran stubs desde 2026-04-14. Se completó la segunda parte: actualizar los SKILL.md para que referencien directamente a wiki/.

- Issue 1 — `jira-writer/SKILL.md`: 3 menciones a `references/adf-format-guide.md` → reemplazadas por `../../../wiki/qa/adf-format-guide.md` (path relativo correcto desde `.claude/skills/jira-writer/`).
- Issue 2 — `audit-logs/SKILL.md`: 4 menciones a `references/log-conventions.md` → reemplazadas por `wiki/core/logging.md` (referencia inline en texto y tabla de referencias).
- Issue 3 — `skill-creator/SKILL.md`: 4 menciones a `references/bluestack-conventions.md` → reemplazadas por `wiki/development/skill-conventions.md`.

Los archivos stub en `references/` se conservan — no duplican contenido, solo redirigen.

## [2026-04-16] update | Consolidación SSoT convenciones — audit wiki Agente B
Brecha cerrada: `wiki/patterns/conventions.md` carecía de la distinción de tiers del retry boundary (solo estaba detallada en `wiki/core/logging.md`). Agregada sección "Retry Boundary" con tabla y puntero a logging.md.
Brecha cerrada: `driver.sleep()` solo aparecía en la tabla de anti-patrones sin regla ni ejemplos. Agregada sección autónoma con regla, ejemplos y alternativas.
`CLAUDE.md` § Reglas de Código — regla de error handling reducida a una línea con dos punteros a wiki/ (conventions.md y logging.md). El detalle canónico vive en wiki/.

## [2026-04-16] update | Retry Boundary Doctrine — nueva doctrina de logging por tiers
`wiki/core/logging.md` actualizado: sección "Concepto: Retry Boundary", reglas 1a/1b/2 (reemplazó regla 1 monolítica), 3 nuevas filas en anti-patrones.
`audit-logs/SKILL.md` actualizado: tabla de verificaciones split en Tier 1/2/3, bloque de detección de tiers.
`CLAUDE.md` actualizado: regla "Nunca silenciar errores" matizada para distinguir rethrow-a-retry (válido) de silenciamiento real.
5 archivos en `src/core/actions/` corregidos: `logger.error` → `logger.debug` dentro de lambdas de retry.

## [2026-04-16] Auditoría EditorHeaderActions — Videos e Imágenes

**Tipo:** update (locators + corrección de bugs)
**Archivos modificados:** `videos_page/video_editor_page/EditorHeaderActions.ts`, `images_pages/images_editor_page/EditorHeaderActions.ts`

### Locators actualizados (4 por archivo)
- `SAVE_BTN`: `button.white-btn[data-testid="dropdown-action"]` → `[data-testid="btn-save"]`
- `PUBLISH_BTN`: `button.btn-info[data-testid="dropdown-action"]` → `[data-testid="btn-publish"]`
- `DROPDOWN_SAVE_CONTAINER`: `By.id('dropdown-save')` → `[data-testid="dropdown-toggle-save"]`
- `DROPDOWN_PUBLISH_CONTAINER`: `By.id('dropdown-publish')` → `[data-testid="dropdown-toggle-publish"]`

### Bugs corregidos (3 bugs de testids cruzados Save/Publish)
- **Videos** — `PUBLISH_AND_EXIT_OPT` usaba `dropdown-item-guardar-y-salir` (testid de Save). Corregido a `dropdown-item-publicar-y-salir`
- **Imágenes** — `SAVE_AND_EXIT_OPT` usaba `dropdown-item-publicar-y-salir` (testid de Publish). Corregido a `dropdown-item-guardar-y-salir`
- **Imágenes** — `EXIT_WITHOUT_SAVING_OPT` usaba `dropdown-item-publicar-y-salir`. Corregido a `dropdown-item-salir`

### Origen
Input: HTML inspeccionado manualmente (F12 / outerHTML). Sin ticket Jira.
Validación: `btn-save` (video) confirmado en grid real. Resto pendiente por expiración de sesión en ambiente `testing`.

---

[2026-04-15] migration | Migración a Custom Agents completada
Los pipelines ticket-analyst, test-engine, test-reporter y qa-orchestrator fueron
migrados a custom agents de Claude Code en `.claude/agents/`. Los PIPELINE.md en
`.claude/pipelines/` se conservan como referencia histórica (deprecated v3.0).
Las referencias activas (test-map.json, component-to-module.json, classification-rules.md,
agent-capabilities.md) permanecen en `.claude/pipelines/*/references/`.

---

[2026-04-13] ingest | Bootstrap inicial
Páginas creadas: 16.
Gaps detectados: ninguno en el ingest inicial.
Directorios vacíos registrados:
- comment_page/ — 0 archivos .ts. No crear página wiki hasta que haya contenido.
- user_profile_page/ — 0 archivos .ts. No crear página wiki hasta que haya contenido.
Sub-componentes del video_editor_page con contenido vacío (1 línea):
- EditorInfoSection.ts
- EditorCategorySection.ts
- EditorImageSection.ts
- EditorRelatesSection.ts

---

[2026-04-14] gap | customfield IDs de campos custom del equipo Bluestack sin descubrir
Los campos "deploy", "cambios SQL" y "cambios VFS" existen en el proyecto NAA pero sus
customfield_XXXXX IDs no estaban mapeados.

[2026-04-15] fix | customfield IDs de campos deploy/SQL/VFS descubiertos y documentados

[2026-04-15] gap | discovery semántico por criterio en TE-4 — deuda técnica
TE-4 usa classification.module como proxy para elegir sesiones. Dos fallas conocidas:
1. Tickets con el mismo componente pueden requerir sesiones distintas.
2. Una sesión puede cubrir parcialmente los criterios — el pipeline la toma igual por módulo.
Propuesta: matching semántico (acceptance_criteria vs description() de cada sesión) + campo
"covers" en test-map.json. Postergado por decisión del equipo — aplicar solo a sesiones nuevas
cuando se retome. Ver fix 4 de sesión de validación 2026-04-15.
Discovery via GET /rest/api/3/field sobre la instancia NAA.
Encontrados DOS grupos de campos: A (10036-10041, legacy) y B (10066-10071, NAA activo).
Mapeo completo:
  Cambios SQL:          customfield_10036 / customfield_10066
  Cambios Librerias:    customfield_10037 / customfield_10067
  Cambios TLD:          customfield_10039 / customfield_10068
  Cambios VFS:          customfield_10040 / customfield_10069
  Cambios configuración:customfield_10041 / customfield_10070
  Comentarios Deploy:   customfield_10038 / customfield_10071
Archivos actualizados: ticket-analyst.md (TA-3 request fields + tabla mapeo),
classification-rules.md (§6 tabla expandida), COMMANDS.md (discovery marcado resuelto),
01-vision-y-estado.md (backlog ítem cerrado).

[2026-04-14] update | Fase 1 ticket-analyst completada
Creados: ticket-analyst/PIPELINE.md, classification-rules.md.
Corregida máquina de estados Jira en architecture doc, jira-reader OP-6, wiki y JQL queries.
Trigger QA Master = estado "Revisión" (no "A Versionar").
Pendiente validación E2E sobre 2 tickets adicionales (Post/Video) para milestone completo.

---

[2026-04-14] fix | component-to-module.json actualizado con variantes reales de Jira
Problema: las claves del mapa usaban nombres canónicos ("Video", "Images", "AI") pero Jira
almacena variantes reales: "Videos", "imagenes", "Ai", "IA", "CKEditor", "login", etc.
TA-6 paso 1 fallaba en exact match para cualquier ticket de componente Video o Images.
Solución: agregados aliases para todas las variantes encontradas en tickets reales.
Impacto: clasificación de tickets Video/Images pasa de confidence "low" (buggy) a "high" (correcto).
Acción: revisar periódicamente al encontrar nuevos valores de component_jira en Jira.

[2026-04-14] update | Milestone Fase 1 completado — 3/3 tickets correctamente clasificados
Tickets validados: NAA-4429 (AI, Fase 0) + NAA-3964 (Videos→video) + NAA-4120 (imagenes→images).
Tasa de clasificación: 3/3 = 100% > 85% requerido.
NAA-3964: criteria_source=inferred (no sección estructurada), 5 criterios, confidence=high.
NAA-4120: criteria_source=extracted (sección "Criterios de aceptación"), 2 criterios, confidence=high.
Resultados documentados en pipeline-logs/completed/.

[2026-04-14] update | Auditoría documental — consolidación SSoT completa
5 páginas wiki/ nuevas creadas: wiki/development/commit-conventions.md, wiki/development/skill-conventions.md, wiki/qa/adf-format-guide.md, wiki/qa/devsaas-flow.md, wiki/qa/pipeline-integration-schema.md.
7 references/ convertidas en stubs con punteros a wiki/: smart-commit/commit-format.md, skill-creator/bluestack-conventions.md, jira-writer/adf-format-guide.md, jira-writer/devsaas-flow.md, jira-reader/pipeline-schema.md, jira-writer/pipeline-schema.md, jira-writer-workspace/adf-format-guide.md.
.claude/rules/doc-organization.md creado (regla going-forward de organización documental).
CLAUDE.md: tabla de comandos eliminada (SSoT = COMMANDS.md), Wiki location actualizado.
wiki/overview.md: tabla de comandos reemplazada por referencia a COMMANDS.md.
wiki/index.md: secciones Development y QA/Jira agregadas.
src/core/README.md: referencia a wiki/core/ agregada.

---

[2026-04-14] update | Fase 2 test-engine completada — PIPELINE.md + E2E validado
Creado: .claude/pipelines/test-engine/PIPELINE.md (pasos TE-1 a TE-8).
Schema output unificado v2 aplicado (compatible GitHub Actions + test-reporter TR-3).
§3.3 del architecture doc actualizado con schema unificado.
E2E milestone: PASS — NewLiveBlog 1/1 passed (309s) en Docker Grid (3 nodos Chrome).
Session elegida: NewLiveBlog — IA features omitidas por fallo activo en TESTING.
Resultados: pipeline-logs/completed/E2E-MILESTONE-FASE2.json + pipeline-logs/results-E2E-liveblog-exec-20260414-001.json.
Wiki creada: wiki/core/docker-grid.md — setup grid WSL2, workaround npm→Windows.
Fix aplicado en PIPELINE.md: comando Jest usa `node node_modules/.bin/jest` (no npx — Windows en WSL2).
wiki/index.md: actualizar con docker-grid.md (pendiente).

---

[2026-04-14] fix | Corrección crítica: comandos Jest y Docker en WSL2
Problema: COMMANDS.md, architecture §11.1 y §11.5, y test-engine/PIPELINE.md usaban
`cross-env ... npx jest` y `npm run infra:up` — ambos fallan en WSL2 porque npm/npx
resuelven al binario de Windows (/mnt/c/Program Files/nodejs/) que rechaza rutas UNC.
Solución aplicada en todos los archivos: `node node_modules/.bin/jest` + `docker compose` directo.
CLAUDE.md actualizado con regla explícita anti-npx.
wiki/core/docker-grid.md enriquecida con console errors conocidos de TESTING y features down.
wiki/index.md: referencias rápidas actualizadas con docker-grid y COMMANDS.md.

---

[2026-04-14] update | Fase 3 test-reporter completada — E2E validado en Jira real
Ticket de prueba: NAA-4467 (QA Bug Front, component IA → ai-post → NewAIPost.test.ts).
Test result: failed (ElementClickInterceptedError — backdrop-update bloqueando click inicial).
Comentario ADF posteado: id 39678 en NAA-4467. Sin \\n literales. Transición FEEDBACK aplicada.
Error de ADF en primer intento: blockquote estaba dentro del listItem en lugar de ser hermano
del bulletList. Corrección aplicada — ver wiki/qa/adf-format-guide.md §Blockquote.
Aprendizaje: la guía ADF (línea 118) es crítica: blockquote va al mismo nivel que bulletList,
NO dentro del listItem. Primer error de tipo ADF reportado durante ejecución real de pipeline.

[2026-04-14] update | Fase 4 qa-orchestrator — PIPELINE.md creado + smoke test idempotencia
Creado: .claude/pipelines/qa-orchestrator/PIPELINE.md (ORC-1 a ORC-6 + error handling).
Smoke test de idempotencia: NAA-4467 con already_reported:true → detectado en ORC-1.2 → skip correcto.
Transición "Revisión" (id: 41) descubierta durante reversión del ticket de demo — no estaba en transitions.md.
Pendiente: poll-jira.ts (trigger automático) y Fase 5 (test-generator para tickets sin sessions).

[2026-04-14] fix | Corrección: ADF blockquote debe ser hermano de bulletList, no hijo de listItem
Durante E2E de test-reporter, el primer intento de postear comentario retornó INVALID_INPUT.
Causa: blockquote anidado dentro del listItem (estructura inválida en Jira Cloud ADF).
Corrección: mover blockquote al nivel raíz del doc, como nodo siguiente al bulletList.
Referencia: wiki/qa/adf-format-guide.md línea 118.
Impacto: actualizar ejemplos en references/comment-examples.md si tienen este anti-patrón.

---

[2026-04-14] fix | Auditoría post-sesión — 3 correcciones documentales aplicadas

**Fix 1 — ADF blockquote wording incorrecto (wiki/qa/adf-format-guide.md §Blockquote)**
Línea 118 decía "nodo hermano del listItem" → incorrecto. El blockquote es hermano del
`bulletList` en `doc.content[]`, no del `listItem` (que estaría dentro del bulletList).
El ejemplo ya era correcto; corregido solo el texto descriptivo.

**Fix 2 — Mapping de ambientes no documentado (test-engine/PIPELINE.md TE-6 + wiki nueva)**
La sesión E2E corrió con `environment: "testing"` en lugar de `"master"` → jira-writer
saltó correctamente (environment=testing → skip). La confusión viene de que `.env TARGET_ENV=testing`
apunta al ambiente de pre-producción (Dev_SAAS en Jira), no a un ambiente de desarrollo.
Correcciones:
- test-engine/PIPELINE.md TE-6: agrega tabla de mapping environment → TARGET_ENV y comandos separados por ambiente
- wiki/qa/environments.md: creada para documentar el mapping completo y la historia del naming
- wiki/index.md: referencia a environments.md agregada

**Fix 3 — Resolución de menciones en jira-writer MODO F (F3) no documentada**
El pipeline pasa `assignee_hint: "frontend" | "backend" | "editor"` pero F3 no especificaba
cómo resolver eso a un accountId para el nodo mention ADF.
Corrección: tabla de mapping assignee_hint → accountId agregada a F3 con ejemplo ADF.

---

[2026-04-15] update | Sincronización documental: estado de fases y pendientes formalizados

Documentos actualizados: `docs/architecture/qa-pipeline/01-vision-y-estado.md` y `09-plan-implementacion.md`.

Correcciones aplicadas:
- Fase 3 (test-reporter): corregida de "EN CURSO" a "✅ COMPLETA" — E2E validado NAA-4467 el 2026-04-14.
- Fase 4 (qa-orchestrator): marcada "⚠️ EN CURSO" — smoke test OK pero E2E completo pendiente.
- Tabla de backlog Fase 4: agregada columna Fase, agregado ítem de customfield IDs (deploy/SQL/VFS).
- Sección "Deuda de cobertura de tests" agregada en §2.2 con los 6 directorios/archivos sin implementar.
- Resumen de implementación (§16): migrado de formato semanas a estado actual con próximos pasos.

Gap cerrado: docker-grid.md ya estaba referenciado en wiki/index.md (pendiente del log era falso positivo).
Gap pendiente: customfield IDs — no tiene ticket Jira ni fecha asignada. Formalizado en backlog Fase 4.

---

[2026-04-15] update | Sesión de validación real — 5 fixes al pipeline QA aplicados
Hallazgos documentados en wiki/qa/validation-session-2026-04-15.md.
Fix 1 — component-to-module.json: 7 aliases nuevos (Liveblog/liveblog → post, NotaLista/notalista → post,
  Acciones/acciones/estilo → null). Valores encontrados en tickets NAA reales.
Fix 2 — ticket-analyst §TA-6 Paso 1: soporte para component_jira como array; null-ignorado; desempate
  por especificidad (ai-post > post > video > images > auth); no ir a fuzzy si hay ≥1 match.
Fix 3 — qa-orchestrator §ORC-2: confidence:low split en 2 sub-casos según sessions_found.
  sessions_found:true → continuar pipeline, postear con ⚠️ warning, sin transición de estado.
  sessions_found:false → escalar, outcome: "low_confidence".
Fix 4 — jira-writer/references/field-map.md: nota explícita de formato correcto customfield_10061
  = array de strings planos ["AI"], no [{value:"AI"}] que era rechazado por la API NAA.
Fix 5 — wiki/qa/validation-session-2026-04-15.md: creada con tabla de tickets, aliases, desvíos y decisiones.

[2026-04-16] update | Auditoría EditorHeaderActions (note editor) — locators y patrones actualizados
7 locators actualizados en src/pages/post_page/note_editor_page/EditorHeaderActions.ts:
- SAVE_BTN: btn-genericsavetext
- DROPDOWN_SAVE_CONTAINER: dropdown-toggle-genericsavetext (antes By.id('dropdown-save'))
- DROPDOWN_PUBLISH_CONTAINER: dropdown-toggle-newnotepublishtext (antes By.id('dropdown-publish'))
- PUBLISH_AND_EXIT_OPT: dropdown-item-publicar-y-salir (antes tenía testid del save — bug)
- SCHEDULE_OPT: dropdown-item-programar (antes tenía testid del exit — bug)
- MODAL_BACK_SAVE_AND_EXIT_BTN: selector compuesto wrapper + button interno btn-calendar-confirm
- MODAL_BACK_DISCARD_EXIT_BTN: ídem con wrapper btn-cancel-newnote-get-out-anyway-text
Nuevo patrón documentado: Patrón D en wiki/patterns/conventions.md — app-cmsmedios-button wrapper.
NoteExitAction y mapa LOCATORS documentados en wiki/pages/post-page.md.

[gap] pipeline: archivos binarios adjuntos (.webm, .mp4) en comentarios de dev —
evaluar si el pipeline debería sugerir revisión manual antes de escalar criteria_source:none

[2026-04-16] [gap] pipeline: test-generator (Fase 5) pendiente de implementación — el qa-orchestrator no tiene agente para generar sessions nuevas cuando no existen tests previos para el ticket (ORC-4 branch `sessions_found: false` sin implementar)

[2026-04-16] update | pipeline-integration-schema.md — referencia a customfields de deploy agregada
Sección "Mapping de customfields de deploy" agregada en "Notas de implementación".
Apunta explícitamente a `.claude/skills/jira-writer/references/field-map.md` §Campos de deploy.
Documenta los dos grupos (A legacy 10036-10041, B NAA activo 10066-10071) y la regla de usar Grupo B en tickets nuevos.

[2026-04-16] update | Auditoría wiki — artefactos históricos y mapeo de campos deploy
Issue 8: Verificados 6 PIPELINE.md. qa-orchestrator, test-engine, test-reporter, ticket-analyst ya tenían marca DEPRECATED. sync-docs y validate-ssot son pipelines activos (no migrados a custom agents) — no se marcaron como deprecated.
Issue 9: Agregado [gap] test-generator (Fase 5) — ORC-4 branch sessions_found:false sin implementar.
Issue 7: field-map.md completado con tabla completa de campos de deploy (grupos A y B): Cambios SQL, Librerías, TLD, VFS, Configuración, Comentarios Deploy — IDs 10036-10041 (legacy) y 10066-10071 (NAA activo).

---

## Regla de mantenimiento

Cuando modifiques cualquier archivo en `src/` o `sessions/`, actualizar la página wiki correspondiente en el mismo commit.
Si no sabés qué página corresponde, buscar en `wiki/index.md` por nombre de archivo o módulo.
Si no existe una página adecuada, crear una y agregar entrada `[gap]` aquí hasta completarla.
