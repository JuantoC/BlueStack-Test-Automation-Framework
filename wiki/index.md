# Wiki — BlueStack Test Automation Framework

Entry point del conocimiento compilado del framework. Leer este archivo antes de abrir cualquier `.ts`.

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

### Pages (`src/pages/`)
- [pages/_shared.md](pages/_shared.md) — `SidebarAndHeaderSection` · `FooterActions` · `HeaderNewContentBtn` · tipos `SidebarOption` · `FooterActionType` · `HeaderNewContentType`
- [pages/login-page.md](pages/login-page.md) — `MainLoginPage` · `passLoginAndTwoFA()` · `AuthCredentials`
- [pages/post-page.md](pages/post-page.md) — `MainPostPage` · `NoteType` · editor de notas · sub-componentes editoriales
- [pages/videos-page.md](pages/videos-page.md) — `MainVideoPage` · `uploadNewVideo()` · tipos de video · acciones inline
- [pages/images-page.md](pages/images-page.md) — `MainImagePage` · `uploadNewImage()` · ⚠️ path: `images_pages/` (plural)
- [pages/tags-page.md](pages/tags-page.md) — `MainTagsPage` · `createNewTag()` · filtros alfanuméricos · `TagFooterActions`
- [pages/modals.md](pages/modals.md) — `PublishModal` · `CKEditorImageModal`
- [pages/video-image-editors.md](pages/video-image-editors.md) — Editores de video e imagen: Header actions · Panel Info · diferencias · patrones AM (mat-slide-toggle, mat-select, timepicker)

### Sessions (`sessions/`)
- [sessions/catalog.md](sessions/catalog.md) — Inventario de 14 tests: flujo, POs y factories de cada uno

### Agents (`.claude/agents/`)
5 agentes personalizados de Claude Code con roles y herramientas definidas: ticket-analyst · test-engine · test-reporter · qa-orchestrator · test-generator (Fase 5)

- [docs/architecture/qa-pipeline/INDEX.md](../docs/architecture/qa-pipeline/INDEX.md) — Arquitectura multi-agente QA: tabla de decisión por tema → ticket-analyst · test-engine · test-reporter · qa-orchestrator · contratos JSON · flujos · plan de implementación
- **Nota:** los agentes en `.claude/agents/` reemplazan el modelo pipelines-as-prompts; el `qa-orchestrator` los invoca via `Agent` tool con `subagent_type`.
- **Referencias activas** de los agentes (component-to-module.json, test-map.json) permanecen en `.claude/pipelines/*/references/` — no se migraron para no romper rutas hardcoded en los agentes.

### Development
- [development/commit-conventions.md](development/commit-conventions.md) — Formato de commits semánticos: tipos, estructura, tabla módulo → impacto
- [development/skill-conventions.md](development/skill-conventions.md) — Convenciones para crear y organizar skills: tipos, idioma, wiki-first, archivos modulares

### QA / Jira
- [qa/adf-format-guide.md](qa/adf-format-guide.md) — Formato ADF JSON para contenido rich text en Jira: nodos, marks, ejemplos completos
- [qa/devsaas-flow.md](qa/devsaas-flow.md) — Flujo de validación Dev_SAAS: pasos C1-D3, ejemplos reales, uso desde el agente orquestador
- [qa/environments.md](qa/environments.md) — Mapping de ambientes: `.env TARGET_ENV` ↔ agente `environment` ↔ Jira (testing=dev_saas, master=master)
- [qa/manual-test-validation.md](qa/manual-test-validation.md) — Procedimiento para habilitar tests auto-generados por `test-generator` tras revisión manual (`@validated: false → true`)
- [qa/multimedia-attachment-integration.md](qa/multimedia-attachment-integration.md) — *(redirect)* → `docs/architecture/qa-pipeline/11-multimedia-attachments.md`
- [qa/pipeline-integration-schema.md](qa/pipeline-integration-schema.md) — Contrato completo agente test-reporter ↔ jira-reader/jira-writer: inputs, outputs, operaciones
- [qa/validation-session-2026-04-15.md](qa/validation-session-2026-04-15.md) — Hallazgos sesión real: aliases de componentes, fuzzy matching, decisión confidence:low, bug customfield_10061

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
| Arquitectura del pipeline QA multi-agente | [docs/architecture/qa-pipeline/INDEX.md](../docs/architecture/qa-pipeline/INDEX.md) |
| Levantar Docker Grid / comandos Jest en WSL2 | [core/docker-grid.md](core/docker-grid.md) |
| Comandos de ejecución completos | [.claude/references/COMMANDS.md](../.claude/references/COMMANDS.md) |
| Generar ADF JSON para comentarios Jira | [qa/adf-format-guide.md](qa/adf-format-guide.md) |
| Habilitar test auto-generado tras revisión manual | [qa/manual-test-validation.md](qa/manual-test-validation.md) |

---

## Directorios con deuda de cobertura

- `comment_page/` — directorio existe, sin archivos `.ts` aún — ver [log.md](log.md)
- `user_profile_page/` — directorio existe, sin archivos `.ts` aún — ver [log.md](log.md)
