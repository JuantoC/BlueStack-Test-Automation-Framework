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

### Core (`src/core/`)
- [core/run-session.md](core/run-session.md) — `runSession()` · `retry()` · `TestContext` · `TestMetadata` · ciclo de vida del test
- [core/actions.md](core/actions.md) — `clickSafe` · `writeSafe` · `waitFind` · `waitVisible` · `waitEnabled` · `assertValueEquals`
- [core/driver-setup.md](core/driver-setup.md) — `DefaultConfig` · `resolveRetryConfig()` · `ENV_CONFIG` · `getAuthUrl()` · `AdminRoutes` · monitores CDP
- [core/errors.md](core/errors.md) — `ErrorCategory` · `classifyError()` · `BusinessLogicError` · diccionarios FATAL/RETRIABLE
- [core/utils.md](core/utils.md) — `logger` · `stackLabel()` · `getErrorMessage()` · helpers de DOM

### Interfaces (`src/interfaces/`)
- [interfaces/data-types.md](interfaces/data-types.md) — `RetryOptions` · `NoteData/PostData/ListicleData/LiveBlogData` · `VideoData` · `TagData` · `ImageData` · `AIDataNote`

### Patterns
- [patterns/conventions.md](patterns/conventions.md) — Arquitectura 2 capas · constructores · locators · `step()` · imports `.js` · anti-patrones
- [patterns/factory-api.md](patterns/factory-api.md) — `NoteDataFactory` · `VideoDataFactory` · `AINoteDataFactory` · `ImageDataFactory`

### Pages (`src/pages/`)
- [pages/_shared.md](pages/_shared.md) — `SidebarAndHeaderSection` · `FooterActions` · tipos `SidebarOption` · `FooterActionType`
- [pages/login-page.md](pages/login-page.md) — `MainLoginPage` · `passLoginAndTwoFA()` · `AuthCredentials`
- [pages/post-page.md](pages/post-page.md) — `MainPostPage` · `NoteType` · editor de notas · sub-componentes editoriales
- [pages/videos-page.md](pages/videos-page.md) — `MainVideoPage` · `uploadNewVideo()` · tipos de video · acciones inline
- [pages/images-page.md](pages/images-page.md) — `MainImagePage` · `uploadNewImage()` · ⚠️ path: `images_pages/` (plural)
- [pages/tags-page.md](pages/tags-page.md) — `MainTagsPage` · `createNewTag()` · filtros alfanuméricos · `TagFooterActions`
- [pages/modals.md](pages/modals.md) — `PublishModal` · `CKEditorImageModal`

### Sessions (`sessions/`)
- [sessions/catalog.md](sessions/catalog.md) — Inventario de 14 tests: flujo, POs y factories de cada uno

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

---

## Directorios con deuda de cobertura

- `comment_page/` — directorio existe, sin archivos `.ts` aún — ver [log.md](log.md)
- `user_profile_page/` — directorio existe, sin archivos `.ts` aún — ver [log.md](log.md)
