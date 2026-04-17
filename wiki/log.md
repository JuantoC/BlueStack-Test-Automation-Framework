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

## Regla de mantenimiento

Cuando modifiques cualquier archivo en `src/` o `sessions/`, actualizar la página wiki correspondiente en el mismo commit.
Si no sabés qué página corresponde, buscar en `wiki/index.md` por nombre de archivo o módulo.
Si no existe una página adecuada, crear una y agregar entrada `[gap]` aquí hasta completarla.

---

[2026-04-17] update | Auditoría y consolidación docs/architecture → wiki/qa/

**Páginas nuevas creadas:**
- `wiki/qa/execution-context-schema.md` — Execution Context schema, persistencia pipeline-logs/, resumption, idempotencia (migrado desde docs/05 §7.2)
- `wiki/qa/ticket-analyst-output-schema.md` — Schema completo del ticket_analyst_output (extraído de ticket-analyst.md §TA-9)
- `wiki/qa/multimedia-attachment-integration.md` — Convertido de redirect a página canónica operacional (JiraAttachmentUploader, Fase F2.5, schema v3.1)

**Archivos modificados:**
- `docs/architecture/qa-pipeline/INDEX.md` — Cabecera de historial: "no consumir en runtime, fuente operacional en wiki/qa/"
- `wiki/index.md` — Sección Agents reemplaza referencia a docs/INDEX.md por wiki/qa/; nuevas páginas indexadas; referencia rápida de arquitectura actualizada
- `.claude/agents/ticket-analyst.md` §TA-9 — Schema inline ~75 líneas reemplazado por referencia a wiki/qa/ticket-analyst-output-schema.md
- `.claude/agents/test-reporter.md` Input y TR-4 — Schemas inline reemplazados por referencias a wiki/qa/execution-context-schema.md y wiki/qa/pipeline-integration-schema.md

**Validación:** grep de docs/architecture en .claude/agents/ → 0 resultados. Todos los archivos wiki/qa/ con entrada en wiki/index.md.

---

## Bootstrap

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

## Pages gaps

[2026-04-17][gap][deuda técnica] Panel Asistencia IA (editor de notas) — TODA la funcionalidad del panel no está contenida en el framework
El panel Asistencia IA ("robotito") del editor de notas (botón ícono IA en el header → modal de opciones → modal de respuesta) no tiene implementación en src/pages/. Esto incluye:
- Mejoras de gramática
- Mejoras de ortografía
- Resumen / Abstract
- Cualquier otra opción del panel
TODOS los tickets que refieran a estas funcionalidades serán non_automatable hasta que se cree el POM correspondiente.
El POM se va a agregar en el corto plazo. Cuando se agregue: crear AIAssistantPanel (o similar) en src/pages/post_page/note_editor_page/, confirmar locators con DevTools, y actualizar test-map.json módulo ai-post.
NO agregar lógica de workaround en el pipeline — solo clasificar como non_automatable y escalar al QA.
Tickets conocidos afectados: NAA-4248, NAA-4474, NAA-3851, NAA-2765, NAA-4475.

[2026-04-17] gap | AI response modal — estructura sin documentar y sin POM
Modal de respuesta IA (panel gramática/ortografía): campo principal (texto corregido) + descripción inferior (qué se corrigió) + botón Copiar por bloque. Estructura de 3 capas: botón robotito → modal opciones → modal respuesta. Locators desconocidos — requiere DevTools en src/pages/post_page/ (probablemente note_editor_page/ o ai_note/).

[2026-04-17] gap | Clipboard automation via sendKeys — estrategia futura para criterios de copia
Los criterios de tipo "botón copiar" en la UI son automatizables via: (1) leer texto del campo origen, (2) click botón copiar, (3) foco en campo editable del body, (4) sendKeys(Ctrl+V), (5) leer campo y comparar. El bloqueo actual es el POM gap del modal de respuesta IA, no el clipboard per se. Cuando se cree el POM, reclasificar estos criterios como automatable: true.

[2026-04-17] gap | src/pages/comment_page/ — directorio sin archivos .ts
El directorio `comment_page/` existe en `src/pages/` pero no tiene implementación. Sin POM. Los tickets que involucren el módulo de comentarios son non_automatable hasta que se cree el POM. Ver también: `wiki/index.md` § Directorios con deuda de cobertura.

[2026-04-17] gap | src/pages/user_profile_page/ — directorio sin archivos .ts
El directorio `user_profile_page/` existe en `src/pages/` pero no tiene implementación. Sin POM. Los tickets del módulo de perfil de usuario son non_automatable hasta que se cree el POM. Ver también: `wiki/index.md` § Directorios con deuda de cobertura.

[gap] Panel Asistencia IA — falta POM: src/pages/post_page/note_editor_page/ necesita métodos para abrir el panel (botón en header del editor), acceder a cada opción y leer su título y badge de tiempo. El test AutoGenerated_NAA-4248 usa selectores INVENTADOS (no verificados con DevTools) — está deshabilitado hasta que se confirmen los locators reales. Invocar pom-generator con locators confirmados por DevTools antes de habilitar AutoGenerated_NAA-4248.test.ts.

[gap] CKEditorGallerySection — falta POM: src/pages/post_page/note_editor_page/ necesita clase CKEditorGallerySection con métodos: openPostWithGallery(), verifyFirstItemArrows(), clickNextArrow(), verifyMiddleItemArrows(), navigateToLastItem(), verifyLastItemArrows(). Test AutoGenerated_NAA-782 usa TODO-POM markers — deshabilitado hasta que se confirmen locators reales en DevTools.

[2026-04-17] gap | Módulo CKEditor galería — Para activar AutoGenerated_NAA-782.test.ts: (1) abrir DevTools sobre una galería CKEditor en master, extraer selectores de flechas izquierda/derecha y del widget, (2) invocar pom-generator para crear CKEditorGallerySection en src/pages/post_page/note_editor_page/, (3) cambiar @validated:false → true en el test. A futuro: habilitar pom-generator para recibir HTML crudo de componentes CKEditor y generar locators automáticamente sin DevTools manual.

---

## Agent fixes

[2026-04-17] fix | pipeline-routing.md creado — gap criterion_scope / testability_summary.action cerrado
Creado `wiki/qa/pipeline-routing.md` con: tabla de valores de `criterion_scope` (ui/vfs/backend_data/api) con implicaciones y reglas de inferencia por customfield; schema de `testability_summary`; tabla de valores de `action` con condiciones (TA-7b); tabla de routing ORC-2.5 completa; casos especiales (testable:false, partial_automatable, dry-run falla). Agregado a `wiki/index.md` § QA/Jira.

[fix] 2026-04-17 | ambiente master en sesiones auto-generadas — test-generator no propagaba `environment` del Execution Context a create-session; create-session no tenía instrucción para anotar el ambiente destino. Fix aplicado en TG-1/TG-3 de `.claude/agents/test-generator.md` (leer y propagar `target_environment`) y en regla 3b de `.claude/skills/create-session/SKILL.md` (agregar `@target-env` en cabecera). `AutoGenerated_NAA-782.test.ts` corregido con `@target-env: master`.

[2026-04-16] fix | agent-auditor — 8 inconsistencias de contrato corregidas en 5 agentes QA

**Fix 1** — `test-reporter.md` TR-4: `schema_version: "3.1"` duplicado eliminado. Quedó solo `"3.0"` como única declaración en el payload.

**Fix 2** — `test-reporter.md` Input esperado: `partial_coverage: false` agregado. ORC-3 seteaba el flag pero test-reporter no lo declaraba en su contrato de entrada.

**Fix 3** — `test-reporter.md` TR-2: IDs de transición (`42`, `2`, `31`) referenciados en nuevo archivo `transition-ids.md`. Contenido externalizad de magic numbers inline.

**Fix 4** — `test-reporter.md` TR-4: `assignee_hint` hardcodeado (Paula/Verónica/Claudia) reemplazado por puntero a `field-map.md`. Sección `assignee_hint` agregada a `field-map.md`.

**Fix 5** — `qa-orchestrator.md` ORC-1.2: stage `"test_generation"` agregado al routing table (faltaba cobertura).

**Fix 6** — `ticket-analyst.md` TA-9: schema expandido con `testability_summary` completo (incluye `action`), `acceptance_criteria[].coverage`, y `escalation_report: null` como field de primer orden.

**Fix 7** — `test-engine.md` TE-6: tabla `environment→TARGET_ENV` deduplicada — reemplazada por puntero a `wiki/qa/environments.md` (canónica). TE-4: lógica de fallback del discovery aclarada (lineal, no cascada).

**Fix 8** — `test-generator.md` TG-2/TG-5: instrucción para `pom_paths` vacío + instrucción de merge en test-map.json. Sección de habilitación humana movida a `wiki/qa/manual-test-validation.md`.

**Archivos nuevos:** `customfield-mapping.json`, `transition-ids.md`, `wiki/qa/manual-test-validation.md`.

[2026-04-16] fix | ORC-4.1: conversión de test_hints array→string + ORC-1.0b: validación de CLIENTE_BASE_URL
- ORC-4.1: el valor de `test_hints` pasado a test-generator cambia de `classification.test_hints` (array de objetos) a la concatenación de los campos `description` de cada elemento unidos por ` | ` (string). Fix al Bloqueante 1 del gap documentado el 2026-04-16.
- ORC-1.0b (nuevo paso): si `environment == "[cliente]"`, verificar que `CLIENTE_BASE_URL` esté definida y no comentada en `.env` antes de continuar. Si falta, abortar con `outcome: "missing_env_config"` e ir a ORC-6 sin invocar sub-agentes.
- Tabla Input — Trigger Event: nota agregada indicando prerequisito de `CLIENTE_BASE_URL` para ambiente `[cliente]`.

[2026-04-16] fix | Gap-3 cerrado — pipeline distingue validación UI vs datos persistidos por backend

Cambios aplicados en `.claude/agents/ticket-analyst.md` y `.claude/agents/qa-orchestrator.md`:
- **Schema `acceptance_criteria[]`**: campo `criterion_scope` agregado (`"ui"` default | `"vfs"` | `"backend_data"` | `"api"`).
- **TA-4.2 (inferencia)**: si `customfield_10040/10069` (VFS) tiene valor → inferir `criterion_scope: "vfs"`; si `customfield_10036/10066` (SQL) tiene valor → inferir `criterion_scope: "backend_data"`.
- **TA-4b (automatizabilidad)**: nueva rama para `criterion_scope: "vfs"` y `"backend_data"` — fuerza `automatable: false`, `reason_if_not: "backend_data_validation"` y genera `manual_test_guide` con pasos backend-específicos (sin pasos de tipo click→observar).
- **ORC-1.0 (nuevo paso)**: derivación automática de `environment` cuando no viene en el trigger. Estado `"Revisión"` → `"master"`; estado `"Done"` → `"dev_saas"`; otro estado → error explícito pidiendo `environment` explícito.

[2026-04-16] fix | Gap-5 cerrado — test-generator (Fase 5) implementado y conectado en ORC-4
Creado `.claude/agents/test-generator.md` con pasos TG-1 a TG-6:
- TG-1: validación de input (acceptance_criteria, domain, Execution Context)
- TG-2: verificación de POMs — invoca pom-generator si alguno falta
- TG-3: invocación de create-session con cabecera @auto-generated, criterios vfs/backend_data como comentarios MANUAL
- TG-4: dry-run obligatorio (`node node_modules/.bin/jest`) — resultados NO van a Jira
- TG-5: actualización provisional de test-map.json con `validated: false`
- TG-6: escritura del output en Execution Context
ORC-4 actualizado en `.claude/agents/qa-orchestrator.md`:
- Reemplazado placeholder `sessions_found: false → ORC-6 (no_sessions)` por ORC-4.1 (invocar test-generator) y ORC-4.2 (evaluar resultado).
- Si `auto_generated + dry_run:pass` → continuar a ORC-5.
- Si `auto_generated + dry_run:fail` → escalar con `outcome: "auto_generated_dry_run_failed"`.
- Si `failed` → escalar con `outcome: "no_sessions"` (comportamiento anterior).
Guard de reapertura y milestone_notes actualizados para incluir los nuevos outcomes.

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

[2026-04-16] Auditoría EditorHeaderActions — Videos e Imágenes

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

[2026-04-16] fix | Issue 5 — HeaderNewContentBtn agregado al directorio de src/pages/README.md
`HeaderNewContentBtn.ts` existía en `src/pages/` pero no figuraba en la tabla de directorio del README.
Entrada agregada en la sección raíz, junto a `SidebarAndHeaderSection.ts` y `FooterActions.ts`, con link a `wiki/pages/_shared.md#headernewcontentbtn`.

[2026-04-16] fix | Issue 6 — Descripción de clickOnMultimediaFileBtn completada en wiki/pages/_shared.md
La descripción del método omitía tres elementos del comportamiento real del código:
- Toda la secuencia está dentro de `retry()`
- La config interna usa `supressRetry: true` para evitar reintentos anidados
- Hay un `waitVisible()` explícito sobre el elemento del submenú antes de clickear la opción
Actualizada la tabla API y la sección "Navegación: directa vs multimedia" para reflejar el comportamiento real.

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

[2026-04-14] fix | Corrección: ADF blockquote debe ser hermano de bulletList, no hijo de listItem
Durante E2E de test-reporter, el primer intento de postear comentario retornó INVALID_INPUT.
Causa: blockquote anidado dentro del listItem (estructura inválida en Jira Cloud ADF).
Corrección: mover blockquote al nivel raíz del doc, como nodo siguiente al bulletList.
Referencia: wiki/qa/adf-format-guide.md línea 118.
Impacto: actualizar ejemplos en references/comment-examples.md si tienen este anti-patrón.

[2026-04-14] fix | component-to-module.json actualizado con variantes reales de Jira
Problema: las claves del mapa usaban nombres canónicos ("Video", "Images", "AI") pero Jira
almacena variantes reales: "Videos", "imagenes", "Ai", "IA", "CKEditor", "login", etc.
TA-6 paso 1 fallaba en exact match para cualquier ticket de componente Video o Images.
Solución: agregados aliases para todas las variantes encontradas en tickets reales.
Impacto: clasificación de tickets Video/Images pasa de confidence "low" (buggy) a "high" (correcto).
Acción: revisar periódicamente al encontrar nuevos valores de component_jira en Jira.

---

## Wiki fixes

[2026-04-17] fix | wiki-audit scope:all mode:fix — 2 issues corregidos

**Fix 1** — `wiki/index.md`: sección `## Filosofía de la wiki` agregada al inicio.
Declaración explícita del propósito de la wiki para agentes IA: para qué sirve, para qué no, cómo usarla, cómo contribuir. Resuelve [ROL-NO-DOCUMENTADO].

**Fix 2** — `wiki/patterns/conventions.md` §"Patrón constructor — Maestro con NoteType": descripción incorrecta eliminada.
La wiki decía que `MainPostPage` acepta `noteType` en el constructor — el código real usa `constructor(driver, opts)` sin noteType. El tipo se pasa por llamada en `createNewNote(noteType)`. Sección renombrada y corregida para reflejar el patrón real. Resuelve [CONTENIDO-INCORRECTO].

[2026-04-17] fix | wiki-audit scope:all mode:fix — 2 fixes aplicados (referencias rápidas + gaps log)

**Fix 1** — `wiki/index.md` § Referencias rápidas: agregadas 4 entradas faltantes para flujos de alta frecuencia del agente QA: pipeline routing (criterion_scope/testability_summary.action), visual-validation (visual_check), comment-invalidation (TA-4.4) y environments mapping. Resuelve [REFS-RAPIDAS-GAP].

**Fix 2** — `wiki/log.md`: agregados [gap] explícitos para `comment_page/` y `user_profile_page/` sin implementación. Los directorios existían como notas embebidas en bloques fix pero sin entrada [gap] standalone. Resuelve issue de checklist-artifacts.md.

[2026-04-16] fix | wiki-audit scope:all — 4 issues corregidos

**Issue 1** — `wiki/pages/video-image-editors.md` línea 76: contradicción eliminada.
La descripción del editor de imágenes decía "sin la opción 'Salir sin guardar'" pero la tabla inmediatamente siguiente documentaba `EXIT_WITHOUT_SAVING_OPT`. El código define el locator (línea 32 de `EditorHeaderActions.ts` en images_editor_page) y la auditoría del 2026-04-16 ya lo corrigió con testid `dropdown-item-salir`. Texto actualizado para reflejar que la opción existe.

**Issue 2** — `wiki/pages/modals.md`: selectores `backdrop-update` y `modal-update` eliminados de la tabla de `handleUpdateModal`.
El código solo usa `overlay-update` y `btn-calendar-confirm` (líneas 17-18 de `src/core/helpers/handleUpdateModal.ts`). Las dos filas eliminadas referenciaban selectores que el handler nunca busca.

**Issue 3** — `wiki/index.md`: `wiki/qa/manual-test-validation.md` agregado a la sección QA y a la tabla de referencias rápidas. Página existente pero huérfana del índice.

**Issue 4** — `wiki/index.md`: `wiki/qa/multimedia-attachment-integration.md` (stub redirect) agregado a la sección QA. + 2 entradas nuevas en "Referencias rápidas": ADF JSON y habilitación de tests auto-generados.

[2026-04-16] update | Issue 10 — Sección "deuda de cobertura" en wiki/index.md verificada
Estado verificado al 2026-04-16: `comment_page/` y `user_profile_page/` continúan sin archivos `.ts`.
La sección en wiki/index.md ya refleja el estado real — no se requirieron cambios.

[2026-04-16] update | pipeline-integration-schema.md — referencia a customfields de deploy agregada
Sección "Mapping de customfields de deploy" agregada en "Notas de implementación".
Apunta explícitamente a `.claude/skills/jira-writer/references/field-map.md` §Campos de deploy.
Documenta los dos grupos (A legacy 10036-10041, B NAA activo 10066-10071) y la regla de usar Grupo B en tickets nuevos.

[2026-04-16] update | Auditoría wiki — artefactos históricos y mapeo de campos deploy
Issue 8: Verificados 6 PIPELINE.md. qa-orchestrator, test-engine, test-reporter, ticket-analyst ya tenían marca DEPRECATED. sync-docs y validate-ssot son pipelines activos (no migrados a custom agents) — no se marcaron como deprecated.
Issue 9: Agregado [gap] test-generator (Fase 5) — ORC-4 branch sessions_found:false sin implementar.
Issue 7: field-map.md completado con tabla completa de campos de deploy (grupos A y B): Cambios SQL, Librerías, TLD, VFS, Configuración, Comentarios Deploy — IDs 10036-10041 (legacy) y 10066-10071 (NAA activo).

---

## Pipeline gaps

[2026-04-17] gap | criterion_scope y testability_summary.action sin cobertura wiki
Los campos `criterion_scope` (ui/vfs/backend_data/api) y `testability_summary.action` (enum de routing del pipeline) están definidos en `.claude/agents/ticket-analyst.md` y `.claude/agents/qa-orchestrator.md` pero no tienen página wiki. Los agentes deben leer sus propios `.md` para entender estos conceptos — gap de eficiencia de lookup.
Propuesta: crear `wiki/qa/pipeline-routing.md` con tablas de `criterion_scope`, `testability_summary.action` (generate_tests / run_existing / skip / escalate) y lógica de routing ORC-2.5. Referir desde `wiki/index.md` § Referencias rápidas.

[2026-04-17] training-run | NAA-3897 — outcome: no_sessions (pom_gap → reclasificado como non_automatable)
Tickets de carga/inserción de plugins CKEditor son non_automatable estructural. Documentado en wiki/pages/ckeditor-limitations.md. Actualizado test-map.json (post.not_automatable_components) y ticket-analyst.md (TA-4b). reason_if_not: ckeditor_plugin_interaction_not_supported.

[2026-04-16] gap | Pipeline no cubre validación manual de datos persistidos por jobs de backend
Caso: NAA-4465 — job de migración que escribe una property en el VFS de OpenCms para videos pre-existentes.
El pipeline-run no tiene un flujo para tickets donde el trabajo ya fue ejecutado en producción (job corrido)
y la validación consiste en verificar el estado de datos persistidos en backend, no en reproducir un flujo UI.
Gaps concretos:
- No deriva el ambiente desde el estado del ticket (Revisión → Master)
- No genera borrador de comentario con casos de prueba cuando el criterio es `automatable: false` por razón de datos de backend
- No distingue entre "no automatizable por UI" y "no automatizable porque la validación es sobre datos VFS/DB"

[2026-04-16] [gap] pipeline: test-generator (Fase 5) pendiente de implementación — el qa-orchestrator no tiene agente para generar sessions nuevas cuando no existen tests previos para el ticket (ORC-4 branch `sessions_found: false` sin implementar)

[gap cerrado 2026-04-16] pipeline: adjuntos visuales en criteria_source:none — ticket-analyst ahora extrae attachments[] con origin, detecta video/audio en comentarios de dev (attachment_hint:true) y ajusta escalation_reason y escalation_report para recomendar revisión manual antes de escalar sin contexto.

[2026-04-16] gap | test-generator (Fase 5) — 3 bloqueantes identificados en auditoría post-implementación
La implementación inicial de `.claude/agents/test-generator.md` y los cambios en ORC-4 de
`qa-orchestrator.md` tienen tres problemas bloqueantes que impiden el funcionamiento real del agente.
Se documenta acá para retomar en próxima sesión.

**Bloqueante 1 — `test_hints` tipo incorrecto en ORC-4.1**
ORC-4.1 (qa-orchestrator.md) pasa `classification.test_hints` al input de test-generator.
`classification.test_hints` es un ARRAY de objetos (con campos `description`, `automatable`,
`criterion_type`, etc.) según el schema de TA-7 en ticket-analyst.md.
test-generator.md TG-1 espera un STRING de descripción breve del flujo.
Tipos incompatibles — test-generator recibiría un array donde espera texto plano.
Fix: en ORC-4.1, extraer el campo `description` del primer elemento del array de test_hints
(o concatenar todos los `description` separados por "; ") antes de pasarlo a test-generator.

**Bloqueante 2 — `pom_paths` siempre vacío, lógica no implementada**
ORC-4.1 pasa `"pom_paths": []` siempre, con un comentario "se deriva de test-map.json"
pero SIN código que implemente esa derivación.
La lógica correcta es:
1. Leer `.claude/pipelines/test-engine/references/test-map.json`
2. Buscar `modules[classification.module].page_objects[]`
3. Si existe → usar como `pom_paths`
4. Si no existe → `pom_paths: []` (aceptable — TG-2 invocará pom-generator)
Sin esto, create-session genera un test sin referencias a Page Objects reales.
Fix: implementar esta lógica en ORC-4.1 antes de construir el input de test-generator.

**Bloqueante 3 — TG-5 escribe a schema equivocado de test-map.json**
test-generator.md TG-5 intenta agregar esta estructura al test-map.json:
  `{ "module": "post", "sessions": [{ "file": "...", "validated": false, "auto_generated": true, "ticket": "NAA-XXXX" }] }`
Pero el archivo real tiene estructura completamente diferente:
  `{ "version": "1.0", "modules": { "post": { "sessions": ["NewPost", ...], "paths": [...], "page_objects": [...], "validated": true } } }`
Los arrays `sessions[]` y `paths[]` son arrays de STRINGS (nombres y rutas), no objetos.
No existen campos `auto_generated`, `ticket`, `generated_at` en el schema real.
TG-5 fallará al intentar escribir o corromperá el archivo.
Fix: reescribir TG-5 para que:
  1. Lea el JSON actual correctamente
  2. Si `modules[domain]` existe: agregar el filename a `sessions[]` y la ruta a `paths[]`
  3. Si `modules[domain]` no existe: crear la entrada con estructura correcta
  4. Marcar el módulo con `"validated": false` (no el objeto de sesión)
  Archivo de referencia: `.claude/pipelines/test-engine/references/test-map.json`

**Problemas adicionales (no bloqueantes)**
- Falta `escalation_report` en el output de test-generator para el outcome
  `auto_generated_dry_run_failed`. ORC-6 lo necesita cuando invoca test-reporter en modo escalación.
- Ambigüedad en ORC-4.2 sobre qué modo debe usar test-engine al continuar con auto-generated test:
  ¿`discover_and_run` (default) o `run_existing` con el path del test generado?
  test-engine.md distingue estos dos modos (línea 73-75) pero ORC-4.2 no especifica cuál usar.

Archivos a modificar para el fix completo (próxima sesión):
- `.claude/agents/qa-orchestrator.md` — ORC-4.1: lógica de pom_paths + conversión test_hints
- `.claude/agents/test-generator.md` — TG-5: reescribir con schema correcto; agregar escalation_report para dry_run_failed
- `.claude/pipelines/test-engine/references/test-map.json` — verificar schema antes de modificar

[gap] Transformación de campos inter-agente en ORC-4.1: documentar en wiki/pipelines/ la política de adaptación de tipos entre ticket-analyst y test-generator

[gap] wiki/qa/environments.md: documentar prerequisito de CLIENTE_BASE_URL para ambiente [cliente] — variable debe estar configurada en .env antes de ejecutar el pipeline

[gap] console_errors_detected[] no implementado: test-engine produce el campo como array vacío [] pero no hay lógica de captura documentada ni implementada. El campo aparece con valores reales en pipeline-logs/completed/E2E-MILESTONE-FASE2.json y NAA-4429.json, pero esos valores fueron escritos manualmente durante ejecuciones E2E — no por lógica automática del agente. Verificar si Jest v29.7.0 expone consoleMsgs en el JSON output (campo testResults[*].console[]) antes de implementar. Referencia: decisión pendiente de escalación #5 de auditoría 2026-04-16.

[gap] wiki/pipelines/ o wiki/qa/: documentar el comportamiento de --passWithNoTests en el dry-run de test-generator y por qué es necesario parsear stderr para errores TS

[gap] Execution Context v3.0: documentar todos los campos de primer nivel del context (partial_coverage, escalation_mode, etc.) en wiki/pipelines/ o wiki/qa/

[2026-04-15] gap | discovery semántico por criterio en TE-4 — deuda técnica
TE-4 usa classification.module como proxy para elegir sesiones. Dos fallas conocidas:
1. Tickets con el mismo componente pueden requerir sesiones distintas.
2. Una sesión puede cubrir parcialmente los criterios — el pipeline la toma igual por módulo.
Propuesta: matching semántico (acceptance_criteria vs description() de cada sesión) + campo
"covers" en test-map.json. Postergado por decisión del equipo — aplicar solo a sesiones nuevas
cuando se retome. Ver fix 4 de sesión de validación 2026-04-15.

---

## Training runs

[2026-04-17] training-run | NAA-2765 — outcome: non_automatable — Story-Back módulo ai-post (gramática/ortografía extendida a Título+Subtítulo). 3 criterios funcionales, todos pom_gap (AIAssistantPanel sin POM). customfield_10070 tenía los prompts actualizados como test_data_hints. Comentario escalación posteado (id: 40432). Ticket permanece en Revisión.

[training-run] 2026-04-17 — NAA-4474 — outcome: non_automatable — criterios de clipboard (botón copiar en panel Asistencia IA gramática) no automatizables en Docker Grid; POM del panel sin mapear. Criterios de mejora (botón Aplicar) delegados a NAA-4487 por dev y excluidos por TA-4.4.

[training-run] 2026-04-17 — NAA-782 — outcome: auto_generated_dry_run_failed — Test generado (sessions/post/AutoGenerated_NAA-782.test.ts), 3 criterios state_transition automatizables, pero falta POM CKEditorGallerySection. Comentario escalación posteado (id: 40360). Ticket en Revisión.

[training-run] 2026-04-17 — NAA-4475 — outcome: non_automatable — QA Bug-Back módulo GenAI: 4 criterios de error_handling/functional_flow en upload PDF del panel AI, todos pom_gap (IAcreate/uploadFile sin POM). Comentario escalación posteado (id: 40430). Ticket permanece en Revisión.

[training-run] 2026-04-17 — NAA-2019 — outcome: non_automatable — Bug-Back de búsqueda avanzada (webservice news/refactor/get + LuceneNewsCollector.java). Componente 'busqueda' sin módulo en test-map. Sin POM para admin search. Dev dejó URL de validación (requiere credenciales). Comentario escalación posteado (id: 40358).

[training-run] 2026-04-16 — NAA-3851 — outcome: non_automatable — Story IA de ajustes de layout/scroll (visual_check × 4). Comentario escalación ADF posteado (id: 40281) — estructura validada como "perfecta". Ticket permanece en Revisión.

[training-run] 2026-04-16 — NAA-4458 — outcome: success — re-run exitoso tras fix de bullets en preview IA; NewAIPost pasó 1/1, ticket transicionado a A Versionar

[training-run] 2026-04-16 — NAA-4188 — outcome: wrong_status — Ticket en "A Versionar"; requiere "Revisión" para master. Sin tests ejecutados.

[training-run] 2026-04-16 — NAA-4248 — outcome: auto_generated_dry_run_failed — Test generado (sessions/ai-post/AutoGenerated_NAA-4248.test.ts), login y POST OK, falla en selector TODO del panel Asistencia IA. Requiere data-testid reales vía DevTools.

[training-run] 2026-04-16 — NAA-1939 — outcome: non_automatable — Bug de timezone display al despublicar; criterios visual_timezone_check no automatizables con Selenium. Comentario manual posteado en Jira (id: 40280).

- [training-run] 2026-04-16 — NAA-4464 — outcome: escalated (url-validation parcial) — Deploy confirmado HTTP 200; servidor cae a HTTP 500 CmsInitException ERR_CRITICAL_INIT_XML_0 en requests posteriores; tag <nt:video-user-modification-date/> visible en UI; validación dinámica bloqueada; comentario Jira #40270 posteado

- [training-run] 2026-04-16 — NAA-4188 — outcome: success — RE-RUN tras fix de selector UploadVideoBtn (dropdown-item → dropdown-item-*); NewYoutubeVideo PASS 67s; ticket pasado a A Versionar; comentario #40276 posteado

- [learning] 2026-04-16 — NAA-4188 — Dos errores críticos de pipeline documentados: (1) TA-4.4 ignorada → criterios delegados a otros tickets no invalidados → tests irrelevantes ejecutados; (2) testability_summary.action no usado para routing → test-engine corre sessions sin cobertura. Fixes aplicados en ticket-analyst y qa-orchestrator. Ver wiki/qa/comment-invalidation.md

---

## Infrastructure fixes

[2026-04-16] fix | Corrección crítica: comandos Jest y Docker en WSL2
Problema: COMMANDS.md, architecture §11.1 y §11.5, y test-engine/PIPELINE.md usaban
`cross-env ... npx jest` y `npm run infra:up` — ambos fallan en WSL2 porque npm/npx
resuelven al binario de Windows (/mnt/c/Program Files/nodejs/) que rechaza rutas UNC.
Solución aplicada en todos los archivos: `node node_modules/.bin/jest` + `docker compose` directo.
CLAUDE.md actualizado con regla explícita anti-npx.
wiki/core/docker-grid.md enriquecida con console errors conocidos de TESTING y features down.
wiki/index.md: referencias rápidas actualizadas con docker-grid y COMMANDS.md.

---

## SSoT / doc consolidation

[2026-04-16] update | Auditoría SSoT — referencias en SKILL.md apuntan a wiki/ (no a stubs en references/)

Los tres `references/` auditados ya eran stubs desde 2026-04-14. Se completó la segunda parte: actualizar los SKILL.md para que referencien directamente a wiki/.

- Issue 1 — `jira-writer/SKILL.md`: 3 menciones a `references/adf-format-guide.md` → reemplazadas por `../../../wiki/qa/adf-format-guide.md` (path relativo correcto desde `.claude/skills/jira-writer/`).
- Issue 2 — `audit-logs/SKILL.md`: 4 menciones a `references/log-conventions.md` → reemplazadas por `wiki/core/logging.md` (referencia inline en texto y tabla de referencias).
- Issue 3 — `skill-creator/SKILL.md`: 4 menciones a `references/bluestack-conventions.md` → reemplazadas por `wiki/development/skill-conventions.md`.

Los archivos stub en `references/` se conservan — no duplican contenido, solo redirigen.

[2026-04-16] update | Consolidación SSoT convenciones — audit wiki Agente B
Brecha cerrada: `wiki/patterns/conventions.md` carecía de la distinción de tiers del retry boundary (solo estaba detallada en `wiki/core/logging.md`). Agregada sección "Retry Boundary" con tabla y puntero a logging.md.
Brecha cerrada: `driver.sleep()` solo aparecía en la tabla de anti-patrones sin regla ni ejemplos. Agregada sección autónoma con regla, ejemplos y alternativas.
`CLAUDE.md` § Reglas de Código — regla de error handling reducida a una línea con dos punteros a wiki/ (conventions.md y logging.md). El detalle canónico vive en wiki/.

[2026-04-16] update | Retry Boundary Doctrine — nueva doctrina de logging por tiers
`wiki/core/logging.md` actualizado: sección "Concepto: Retry Boundary", reglas 1a/1b/2 (reemplazó regla 1 monolítica), 3 nuevas filas en anti-patrones.
`audit-logs/SKILL.md` actualizado: tabla de verificaciones split en Tier 1/2/3, bloque de detección de tiers.
`CLAUDE.md` actualizado: regla "Nunca silenciar errores" matizada para distinguir rethrow-a-retry (válido) de silenciamiento real.
5 archivos en `src/core/actions/` corregidos: `logger.error` → `logger.debug` dentro de lambdas de retry.

[2026-04-14] update | Auditoría documental — consolidación SSoT completa
5 páginas wiki/ nuevas creadas: wiki/development/commit-conventions.md, wiki/development/skill-conventions.md, wiki/qa/adf-format-guide.md, wiki/qa/devsaas-flow.md, wiki/qa/pipeline-integration-schema.md.
7 references/ convertidas en stubs con punteros a wiki/: smart-commit/commit-format.md, skill-creator/bluestack-conventions.md, jira-writer/adf-format-guide.md, jira-writer/devsaas-flow.md, jira-reader/pipeline-schema.md, jira-writer/pipeline-schema.md, jira-writer-workspace/adf-format-guide.md.
.claude/rules/doc-organization.md creado (regla going-forward de organización documental).
CLAUDE.md: tabla de comandos eliminada (SSoT = COMMANDS.md), Wiki location actualizado.
wiki/overview.md: tabla de comandos reemplazada por referencia a COMMANDS.md.
wiki/index.md: secciones Development y QA/Jira agregadas.
src/core/README.md: referencia a wiki/core/ agregada.

---

## Pipeline implementation

[2026-04-16] update | Sesión de validación real — 5 fixes al pipeline QA aplicados
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

[2026-04-16] update | Sincronización documental: estado de fases y pendientes formalizados

Documentos actualizados: `docs/architecture/qa-pipeline/01-vision-y-estado.md` y `09-plan-implementacion.md`.

Correcciones aplicadas:
- Fase 3 (test-reporter): corregida de "EN CURSO" a "✅ COMPLETA" — E2E validado NAA-4467 el 2026-04-14.
- Fase 4 (qa-orchestrator): marcada "⚠️ EN CURSO" — smoke test OK pero E2E completo pendiente.
- Tabla de backlog Fase 4: agregada columna Fase, agregado ítem de customfield IDs (deploy/SQL/VFS).
- Sección "Deuda de cobertura de tests" agregada en §2.2 con los 6 directorios/archivos sin implementar.
- Resumen de implementación (§16): migrado de formato semanas a estado actual con próximos pasos.

Gap cerrado: docker-grid.md ya estaba referenciado en wiki/index.md (pendiente del log era falso positivo).
Gap pendiente: customfield IDs — no tiene ticket Jira ni fecha asignada. Formalizado en backlog Fase 4.

[2026-04-15] migration | Migración a Custom Agents completada
Los pipelines ticket-analyst, test-engine, test-reporter y qa-orchestrator fueron
migrados a custom agents de Claude Code en `.claude/agents/`. Los PIPELINE.md en
`.claude/pipelines/` se conservan como referencia histórica (deprecated v3.0).
Las referencias activas (test-map.json, component-to-module.json, classification-rules.md,
agent-capabilities.md) permanecen en `.claude/pipelines/*/references/`.

[2026-04-15] update | Sincronización documental: estado de fases y pendientes formalizados

Documentos actualizados: `docs/architecture/qa-pipeline/01-vision-y-estado.md` y `09-plan-implementacion.md`.

[2026-04-14] update | Fase 4 qa-orchestrator — PIPELINE.md creado + smoke test idempotencia
Creado: .claude/pipelines/qa-orchestrator/PIPELINE.md (ORC-1 a ORC-6 + error handling).
Smoke test de idempotencia: NAA-4467 con already_reported:true → detectado en ORC-1.2 → skip correcto.
Transición "Revisión" (id: 41) descubierta durante reversión del ticket de demo — no estaba en transitions.md.
Pendiente: poll-jira.ts (trigger automático) y Fase 5 (test-generator para tickets sin sessions).

[2026-04-14] update | Fase 3 test-reporter completada — E2E validado en Jira real
Ticket de prueba: NAA-4467 (QA Bug Front, component IA → ai-post → NewAIPost.test.ts).
Test result: failed (ElementClickInterceptedError — backdrop-update bloqueando click inicial).
Comentario ADF posteado: id 39678 en NAA-4467. Sin \\n literales. Transición FEEDBACK aplicada.
Error de ADF en primer intento: blockquote estaba dentro del listItem en lugar de ser hermano
del bulletList. Corrección aplicada — ver wiki/qa/adf-format-guide.md §Blockquote.
Aprendizaje: la guía ADF (línea 118) es crítica: blockquote va al mismo nivel que bulletList,
NO dentro del listItem. Primer error de tipo ADF reportado durante ejecución real de pipeline.

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

[2026-04-14] update | Fase 1 ticket-analyst completada
Creados: ticket-analyst/PIPELINE.md, classification-rules.md.
Corregida máquina de estados Jira en architecture doc, jira-reader OP-6, wiki y JQL queries.
Trigger QA Master = estado "Revisión" (no "A Versionar").
Pendiente validación E2E sobre 2 tickets adicionales (Post/Video) para milestone completo.

[2026-04-14] update | Milestone Fase 1 completado — 3/3 tickets correctamente clasificados
Tickets validados: NAA-4429 (AI, Fase 0) + NAA-3964 (Videos→video) + NAA-4120 (imagenes→images).
Tasa de clasificación: 3/3 = 100% > 85% requerido.
NAA-3964: criteria_source=inferred (no sección estructurada), 5 criterios, confidence=high.
NAA-4120: criteria_source=extracted (sección "Criterios de aceptación"), 2 criterios, confidence=high.
Resultados documentados en pipeline-logs/completed/.

---

## Jira / customfields

[2026-04-17] update | Documentación gap PDF upload módulo ai-post — memory reference_ai_assistant_panel_pom_gap.md ampliado con sección IAcreate/uploadFile (manual-only, no planificado corto plazo). test-map.json: campo not_automatable_components agregado al módulo ai-post. Wiki nueva: wiki/pages/ai-note.md con tabla de estado de automatización por componente y reglas de clasificación para ticket-analyst.

[2026-04-15] fix | customfield IDs de campos deploy/SQL/VFS descubiertos y documentados
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

[2026-04-14] gap | customfield IDs de campos custom del equipo Bluestack sin descubrir
Los campos "deploy", "cambios SQL" y "cambios VFS" existen en el proyecto NAA pero sus
customfield_XXXXX IDs no estaban mapeados.
