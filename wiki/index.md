# Wiki — BlueStack Test Automation Framework

Entry point del conocimiento compilado del framework. Leer este archivo antes de abrir cualquier `.ts`.

---

## Filosofía de la wiki

Esta wiki es una herramienta de contexto para **agentes IA**, no una wiki para humanos.

**Para qué sirve:**
- Brindar al agente el contexto que necesita en un solo lugar, con pocas lecturas
- Reducir tokens consumidos: una página wiki compacta reemplaza abrir 3-5 archivos `.ts`
- Ser el único lugar donde el agente busca convenciones, firmas públicas y ejemplos del equipo

**Para qué NO sirve:**
- No es la fuente de verdad del comportamiento del código — eso son los archivos TypeScript
- No define tipos, interfaces ni lógica funcional — eso va en `.ts`, nunca en `.md`
- No reemplaza leer el código cuando la wiki no cubre lo que se necesita

**Cómo usarla:**
1. Leer `wiki/index.md` (este archivo) como entry point
2. Navegar a la página relevante usando el índice o la tabla de referencias rápidas
3. Solo abrir el `.ts` fuente si la wiki no cubre lo que se necesita — y registrar el gap en `wiki/log.md`

**Cómo contribuir:**
- Decision tree de dónde va cada tipo de documento: `.claude/rules/doc-organization.md`
- Un concepto técnico = un archivo canónico en `wiki/`. Nunca duplicar
- Toda página wiki nueva debe quedar referenciada en `wiki/index.md` antes de hacer commit

---

## Protocolo wiki-first

1. Leer esta página.
2. Si una página wiki cubre lo que necesitás, usarla — no abrir el source.
3. Si la wiki no cubre lo que necesitás: abrir el source, completar el task, y actualizar o crear la página wiki.
4. Si algo falta a mitad de un task, agregar `[gap] <tema>` a `wiki/log.md`.

---

## Páginas disponibles

### Overview
- [overview.md](overview.md) — Propósito del framework, stack, estructura de carpetas, comandos de ejecución, arquitectura POM

### Infrastructure
- [core/docker-grid.md](core/docker-grid.md) — Docker Selenium Grid setup · workaround WSL2 npm→Windows · comando Jest directo

### Core (`src/core/`)
- [core/run-session.md](core/run-session.md) — `runSession()` · `retry()` · `TestContext` · `TestMetadata` · ciclo de vida del test
- [core/actions.md](core/actions.md) — `clickSafe` · `writeSafe` · `waitFind` · `waitVisible` · `waitEnabled` · `assertValueEquals`
- [core/driver-setup.md](core/driver-setup.md) — `DefaultConfig` · `resolveRetryConfig()` · `ENV_CONFIG` · `getAuthUrl()` · `AdminRoutes` · monitores CDP
- [core/errors.md](core/errors.md) — `ErrorCategory` · `classifyError()` · `BusinessLogicError` · diccionarios FATAL/RETRIABLE
- [core/utils.md](core/utils.md) — `logger` · `stackLabel()` · `getErrorMessage()` · helpers de DOM
- [core/logging.md](core/logging.md) — Convenciones Winston · niveles · anti-patrones · arquitectura de capas

### Interfaces (`src/interfaces/`)
- [interfaces/data-types.md](interfaces/data-types.md) — `RetryOptions` · `NoteData/PostData/ListicleData/LiveBlogData` · `VideoData` · `TagData` · `ImageData` · `AIDataNote`

### Patterns
- [patterns/conventions.md](patterns/conventions.md) — Arquitectura 2 capas · constructores · locators · `step()` · imports `.js` · anti-patrones
- [patterns/factory-api.md](patterns/factory-api.md) — `NoteDataFactory` · `VideoDataFactory` · `AINoteDataFactory` · `ImageDataFactory`
- [patterns/test-generation-conventions.md](patterns/test-generation-conventions.md) — Convenciones project-wide para generación de sessions: naming, estructura, assertions, patrones POM

### Pages (`src/pages/`)
- [pages/_shared.md](pages/_shared.md) — `SidebarAndHeaderSection` · `FooterActions` · `HeaderNewContentBtn` · tipos `SidebarOption` · `FooterActionType` · `HeaderNewContentType`
- [pages/login-page.md](pages/login-page.md) — `MainLoginPage` · `passLoginAndTwoFA()` · `AuthCredentials`
- [pages/post-page.md](pages/post-page.md) — `MainPostPage` · `NoteType` · editor de notas · sub-componentes editoriales
- [pages/videos-page.md](pages/videos-page.md) — `MainVideoPage` · `uploadNewVideo()` · tipos de video · acciones inline
- [pages/images-page.md](pages/images-page.md) — `MainImagePage` · `uploadNewImage()` · ⚠️ path: `images_pages/` (plural)
- [pages/tags-page.md](pages/tags-page.md) — `MainTagsPage` · `createNewTag()` · filtros alfanuméricos · `TagFooterActions`
- [pages/modals.md](pages/modals.md) — `PublishModal` · `CKEditorImageModal`
- [pages/video-image-editors.md](pages/video-image-editors.md) — Editores de video e imagen: Header actions · Panel Info · diferencias · patrones AM (mat-slide-toggle, mat-select, timepicker)
- [pages/ai-note.md](pages/ai-note.md) — Módulo AI Note: flujo prompt texto · Panel Asistencia IA (pom_gap) · Upload PDF (manual only) · reglas ticket-analyst
- [pages/ckeditor-limitations.md](pages/ckeditor-limitations.md) — Limitaciones del framework con CKEditor: qué puede/no puede hacer · keywords `non_automatable` · `reason: ckeditor_plugin_interaction_not_supported` · estado futuro

### Sessions (`sessions/`)
- [sessions/catalog.md](sessions/catalog.md) — Inventario de 14 tests: flujo, POs y factories de cada uno

### Agents (`.claude/agents/`)
5 agentes personalizados de Claude Code con roles y herramientas definidas: ticket-analyst · test-engine · test-reporter · qa-orchestrator · test-generator (Fase 5)

Los agentes consumen `wiki/qa/` como fuente canónica de contratos y schemas en runtime.

- [qa/execution-context-schema.md](qa/execution-context-schema.md) — Execution Context: schema completo, persistencia `pipeline-logs/`, resumption, idempotencia
- [qa/ticket-analyst-output-schema.md](qa/ticket-analyst-output-schema.md) — Schema del `ticket_analyst_output` que ticket-analyst escribe en el Execution Context
- [qa/pipeline-integration-schema.md](qa/pipeline-integration-schema.md) — Contrato test-reporter ↔ jira-writer: inputs, outputs, operaciones, multimedia v3.1
- [qa/pipeline-routing.md](qa/pipeline-routing.md) — Routing por `criterion_scope` y `testability_summary.action` (ORC-2.5)
- **Nota:** los agentes en `.claude/agents/` reemplazan el modelo pipelines-as-prompts; el `qa-orchestrator` los invoca via `Agent` tool con `subagent_type`.
- **Referencias activas** de los agentes (component-to-module.json, test-map.json) permanecen en `.claude/pipelines/*/references/`.
- **Historia de diseño:** `docs/architecture/qa-pipeline/` — historial arquitectural, no consumir en runtime.

### Development
- [development/commit-conventions.md](development/commit-conventions.md) — Formato de commits semánticos: tipos, estructura, tabla módulo → impacto
- [development/skill-conventions.md](development/skill-conventions.md) — Convenciones para crear y organizar skills: tipos, idioma, wiki-first, archivos modulares

### QA / Jira
- [qa/adf-format-guide.md](qa/adf-format-guide.md) — Formato ADF JSON para contenido rich text en Jira: nodos, marks, ejemplos completos
- [qa/devsaas-flow.md](qa/devsaas-flow.md) — Flujo de validación Dev_SAAS: pasos C1-D3, ejemplos reales, uso desde el agente orquestador
- [qa/environments.md](qa/environments.md) — Mapping de ambientes: `.env TARGET_ENV` ↔ agente `environment` ↔ Jira (testing=dev_saas, master=master)
- [qa/manual-test-validation.md](qa/manual-test-validation.md) — Procedimiento para habilitar tests auto-generados por `test-generator` tras revisión manual (`@validated: false → true`)
- [qa/multimedia-attachment-integration.md](qa/multimedia-attachment-integration.md) — Integración multimedia: `JiraAttachmentUploader`, Fase F2.5, schema v3.1 (`attachments[]`, `screenshots[]`)
- [qa/execution-context-schema.md](qa/execution-context-schema.md) — Execution Context: schema, persistencia `pipeline-logs/`, resumption, idempotencia
- [qa/ticket-analyst-output-schema.md](qa/ticket-analyst-output-schema.md) — Schema completo del `ticket_analyst_output` en el Execution Context
- [qa/pipeline-integration-schema.md](qa/pipeline-integration-schema.md) — Contrato completo agente test-reporter ↔ jira-reader/jira-writer: inputs, outputs, operaciones
- [qa/validation-session-2026-04-15.md](qa/validation-session-2026-04-15.md) — Hallazgos sesión real: aliases de componentes, fuzzy matching, decisión confidence:low, bug customfield_10061
- [qa/validation-url-pattern.md](qa/validation-url-pattern.md) — Patrón: URL de validación provista por dev (Basic Auth, extracción de casos de prueba, pipeline de procesamiento)
- [qa/comment-invalidation.md](qa/comment-invalidation.md) — Mecanismo TA-4.4: señales que invalidan criterios antes de correr tests
- [qa/visual-validation.md](qa/visual-validation.md) — Doctrina de screenshots: regla central para `visual_check`, cómo capturar con Selenium, uso de `test_data_hints[]`, flujo del pipeline
- [qa/pipeline-routing.md](qa/pipeline-routing.md) — Lookup de routing QA: `criterion_scope` (ui/vfs/backend_data/api), `testability_summary.action` y tabla ORC-2.5
- [qa/test-engine-output-schema.md](qa/test-engine-output-schema.md) — Schema del output de test-engine en el Execution Context
- [qa/test-generator-schema.md](qa/test-generator-schema.md) — Input/output schema del agente test-generator
- [qa/qa-orchestrator-trigger-schema.md](qa/qa-orchestrator-trigger-schema.md) — Schema del Trigger Event que inicia el pipeline
- [qa/error-handling-catalog.md](qa/error-handling-catalog.md) — Catálogo de 17 casos de error del pipeline con acciones
- [qa/comment-validation-style.md](qa/comment-validation-style.md) — Reglas tipográficas de comentarios de validación en Jira
- [qa/jira-customfields.md](qa/jira-customfields.md) — Mapeo de customfields Jira: grupos A (legacy) y B (NAA activo), con nombres, IDs y semántica
- [qa/domains-and-modules.md](qa/domains-and-modules.md) — Mapa component_jira → módulo de cobertura (usado en TA-6)
- [qa/pipeline-outcomes.md](qa/pipeline-outcomes.md) — Enum de 7 outcomes del pipeline (`milestone_notes.outcome`), ciclos PR-5/PR-6 y quién los escribe
- [qa/context-resumption.md](qa/context-resumption.md) — Stage routing para resumption (ORC-1.2): tabla de entrada por `stage` + `stage_status`
- [qa/criterion-automatizability.md](qa/criterion-automatizability.md) — Sub-casos de `reason_if_not`: backend_data_validation, timezone_display_check, pom_gap_clipboard, ckeditor_plugin_interaction_not_supported
- [qa/criterion-types-and-scopes.md](qa/criterion-types-and-scopes.md) — Enum completo de `criterion_type` (7 valores) y `criterion_scope` (4 valores) con reglas de guarda
- [qa/jira-operations-and-transitions.md](qa/jira-operations-and-transitions.md) — Tabla de operaciones Jira del pipeline (validate_master, validate_devsaas, escalation, create_bug) con IDs de transición
- [qa/test-roles.md](qa/test-roles.md) — Roles válidos (`editor`, `admin`, `basic`), resolución de `TEST_ROLE` desde `@default-role` en la session
- [qa/transition-logic.md](qa/transition-logic.md) — Lógica de transición condicional TR-4b: tabla de decisión, cuándo transicionar y cuándo no
- [qa/test-map-schema.md](qa/test-map-schema.md) — Schema de `test-map.json`: estructura por módulo, campos `auto_generated_sessions[]`, quién lee/escribe
- [qa/component-to-module-schema.md](qa/component-to-module-schema.md) — Schema de `component-to-module.json`: mapeo alias component_jira → domain/module para TA-6

---

## Referencias rápidas

| Necesito... | Ir a... |
|-------------|---------|
| Entender cómo crear un test | [core/run-session.md](core/run-session.md) |
| Instanciar un PO correctamente | [patterns/conventions.md](patterns/conventions.md) |
| Saber qué tipo de dato usar | [interfaces/data-types.md](interfaces/data-types.md) |
| Generar datos de prueba | [patterns/factory-api.md](patterns/factory-api.md) |
| Hacer click / escribir en un elemento | [core/actions.md](core/actions.md) |
| Navegar entre secciones del CMS | [pages/_shared.md](pages/_shared.md) |
| Ver qué tests existen | [sessions/catalog.md](sessions/catalog.md) |
| Cuándo usar cada nivel de log | [core/logging.md](core/logging.md) |
| Arquitectura del pipeline QA multi-agente | [qa/execution-context-schema.md](qa/execution-context-schema.md) · [qa/pipeline-integration-schema.md](qa/pipeline-integration-schema.md) |
| Levantar Docker Grid / comandos Jest en WSL2 | [core/docker-grid.md](core/docker-grid.md) |
| Comandos de ejecución completos | [.claude/references/COMMANDS.md](../.claude/references/COMMANDS.md) |
| Generar ADF JSON para comentarios Jira | [qa/adf-format-guide.md](qa/adf-format-guide.md) |
| Habilitar test auto-generado tras revisión manual | [qa/manual-test-validation.md](qa/manual-test-validation.md) |
| Routing por criterion_scope / testability_summary.action | [qa/pipeline-routing.md](qa/pipeline-routing.md) |
| Validar criterio visual_check (screenshots) | [qa/visual-validation.md](qa/visual-validation.md) |
| Invalidación de criterios por comentario QA (TA-4.4) | [qa/comment-invalidation.md](qa/comment-invalidation.md) |
| Mapping de ambientes master / dev_saas / cliente | [qa/environments.md](qa/environments.md) |

---

## Directorios con deuda de cobertura

- `comment_page/` — directorio existe, sin archivos `.ts` aún — ver [log.md](log.md)
- `user_profile_page/` — directorio existe, sin archivos `.ts` aún — ver [log.md](log.md)
