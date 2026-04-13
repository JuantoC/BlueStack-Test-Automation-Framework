<!--
@doc-type: readme
@scope: module
@audience: both
@related: ../../README.md, ../interfaces/data.ts, ../../wiki/patterns/conventions.md, ../../wiki/pages/_shared.md
@last-reviewed: 2026-04-13
@summary: Especificación autoritativa de la capa Page Object (POM) del framework: arquitectura two-layer facade, contratos de constructor/método, naming, tipos y fuentes canónicas.
-->

# `@src/pages` — Page Object Layer

> Especificación autoritativa de esta capa. Define arquitectura, contratos, naming y tipos. Para ejemplos de código e implementaciones: ver secciones **🔗 Referencias**.

---

## Quick Reference

| Concepto | Regla |
|---|---|
| Quién importa los Maestros | Solo los tests — nunca entre Maestros |
| Dónde viven los locators | Solo en sub-componentes |
| Declaración de locator | `private static readonly`, `SCREAMING_SNAKE_CASE`, via `Clase.LOCATOR` |
| Firma de constructor | `(driver: WebDriver, opts: RetryOptions)` — siempre |
| Label stacking | Siempre via `resolveRetryConfig(opts, "ClassName")` |
| Wrapping de métodos | Todo `public` de Maestro → `step()` de `allure-js-commons` |
| Error handling | Todo `catch` → `logger.error` + re-throw, nunca silenciar |
| Imports | Siempre extensión `.js` en imports internos |
| Sleeps | `driver.sleep()` prohibido sin comentario de justificación |
| Estado post-error | Los Page Objects **nunca** limpian estado tras un error |
| Tipos | Todos los params tipados: `keyof typeof Clase.STATIC_OBJECT` |

---

## Directorio

```
src/pages/
├── SidebarAndHeaderSection.ts     # Navegación global — SidebarOption type
├── FooterActions.ts               # Publicación masiva compartida — FooterActionType type
├── login_page/
│   ├── MainLoginPage.ts           # Maestro — login + 2FA
│   ├── LoginSection.ts
│   ├── TwoFASection.ts
│   └── login.types.ts             # AuthCredentials · LoginAttemptResult
├── post_page/
│   ├── MainPostPage.ts            # Maestro — notas (POST, LISTICLE, LIVEBLOG, AI_POST)
│   ├── PostTable.ts
│   ├── NewNoteBtn.ts              # NoteType type
│   ├── AIPost/
│   │   ├── MainAIPage.ts          # Maestro — generación de notas con IA
│   │   └── AIPostModal.ts
│   └── note_editor_page/
│       ├── MainEditorPage.ts      # Maestro del editor de notas
│       ├── EditorHeaderActions.ts # NoteExitAction type
│       ├── EditorTextSection.ts
│       ├── EditorTagsSection.ts
│       ├── EditorAuthorSection.ts
│       ├── EditorLateralSettings.ts
│       ├── EditorImagesSection.ts
│       ├── EditorFooterBtn.ts
│       └── note_list/
│           ├── BaseListicleSection.ts  # LiveBlogData interface
│           ├── ListicleItemSection.ts
│           ├── ListicleStrategy.ts
│           └── LiveBlogEventSection.ts
├── videos_page/
│   ├── MainVideoPage.ts           # Maestro — subida, acciones inline, publicación masiva
│   ├── VideoTable.ts
│   ├── UploadVideoBtn.ts          # VideoType type
│   ├── UploadVideoModal.ts
│   ├── VideoInlineActions.ts      # ActionType · InlineActionType types
│   ├── VideoTypeFilter.ts         # VideoFilterType type
│   └── video_editor_page/
│       ├── MainEditorPage.ts      # Maestro del editor de videos
│       ├── EditorHeaderActions.ts # VideoExitAction type
│       ├── EditorCategorySection.ts
│       ├── EditorInfoSection.ts
│       ├── EditorImageSection.ts
│       └── EditorRelatesSection.ts
├── modals/
│   ├── CKEditorImageModal.ts      # selectImage(index: number)
│   └── PublishModal.ts            # Confirmación de publicación — notas y videos
├── images_pages/                  # ⚠️ path plural — images_pages/, no images_page/
│   ├── MainImagePage.ts           # Maestro — subida, edición, acciones, publicación masiva
│   ├── ImageTable.ts
│   ├── UploadImageBtn.ts
│   ├── ImageActions.ts            # ImageActionType type
│   └── images_editor_page/
│       ├── MainEditorPage.ts      # Maestro del editor de imágenes
│       └── EditorHeaderActions.ts # ImageExitAction type
├── tags_page/
│   ├── MainTagsPage.ts            # Maestro — creación, acciones, selección masiva, filtrado
│   ├── NewTagBtn.ts
│   ├── NewTagModal.ts
│   ├── TagActions.ts              # TagActionType type
│   ├── TagAlphaFilter.ts          # Filtro A-Z y búsqueda libre
│   ├── TagFooterActions.ts        # TagFooterActionType type
│   └── TagTable.ts
├── comment_page/                  # ⚠️ sin archivos .ts aún — ver wiki/log.md
└── user_profile_page/             # ⚠️ sin archivos .ts aún — ver wiki/log.md
```

---

## Arquitectura: Two-Layer Facade

**Sub-componentes** — poseen una región de UI específica, declaran todos sus locators, nunca llaman a hermanos ni al Maestro.

**Maestros** (`Main<PageName>Page`) — componen sub-componentes en el constructor, exponen métodos de workflow de alto nivel, nunca tienen locators propios. Son la única clase que importan los tests.

Contratos completos de constructor, método, error handling y locators: [wiki/patterns/conventions.md](../../wiki/patterns/conventions.md).

---

## Naming

| Artefacto | Patrón | Ejemplo |
|---|---|---|
| Maestro | `Main<NombrePágina>Page.ts` | `MainVideoPage.ts` |
| Sub-componente | `<RegiónUI><Elemento>.ts` | `UploadVideoModal.ts`, `EditorHeaderActions.ts` |
| Locator | `NOUN_ELEMENT_TYPE` | `SAVE_BTN`, `TITLE_INPUT` |
| Método | `camelCase`, verbo-primero | `fillFullNote()`, `uploadNewVideo()` |
| Tipo derivado de map | `keyof typeof Clase.MAP` | `NoteType`, `FooterActionType`, `SidebarOption` |

---

## Tipos — Fuentes canónicas

| Tipo | Archivo fuente |
|---|---|
| `NoteType` | `src/pages/post_page/NewNoteBtn.ts` |
| `NoteExitAction` | `src/pages/post_page/note_editor_page/EditorHeaderActions.ts` |
| `VideoType` | `src/pages/videos_page/UploadVideoBtn.ts` |
| `ActionType` / `InlineActionType` | `src/pages/videos_page/VideoInlineActions.ts` |
| `VideoFilterType` | `src/pages/videos_page/VideoTypeFilter.ts` |
| `VideoExitAction` | `src/pages/videos_page/video_editor_page/EditorHeaderActions.ts` |
| `ImageActionType` | `src/pages/images_pages/ImageActions.ts` |
| `ImageExitAction` | `src/pages/images_pages/images_editor_page/EditorHeaderActions.ts` |
| `FooterActionType` | `src/pages/FooterActions.ts` |
| `SidebarOption` | `src/pages/SidebarAndHeaderSection.ts` |
| `TagActionType` | `src/pages/tags_page/TagActions.ts` |
| `TagFooterActionType` | `src/pages/tags_page/TagFooterActions.ts` |
| `AuthCredentials` / `LoginAttemptResult` | `src/pages/login_page/login.types.ts` |
| `LiveBlogData` | `src/pages/post_page/note_editor_page/note_list/BaseListicleSection.ts` |
| `NoteData`, `VideoData`, `AINoteData`, `ImageData`, `TagData` | `src/interfaces/data.ts` |

Nuevos símbolos → archivo más específico que posee el concepto. Cross-cutting → `src/interfaces/data.ts`.

---

## Utilidades compartidas

| Utilidad | Ubicación |
|---|---|
| `clickSafe` | `src/core/actions/clickSafe.js` |
| `waitVisible` | `src/core/actions/waitForVisible.js` |
| `stackLabel` | `src/core/utils/stackLabel.js` |
| `logger` | `src/core/utils/logger.js` |
| `resolveRetryConfig`, `RetryOptions` | `src/core/config/defaultConfig.js` |

---

## 🔗 Referencias

- [wiki/patterns/conventions.md](../../wiki/patterns/conventions.md) — arquitectura two-layer, contratos de constructor/método, locators, anti-patrones
- [wiki/pages/_shared.md](../../wiki/pages/_shared.md) — `SidebarAndHeaderSection` · `FooterActions` · tipos compartidos
- [wiki/pages/post-page.md](../../wiki/pages/post-page.md) — `MainPostPage` · editor de notas · sub-componentes editoriales
- [wiki/pages/videos-page.md](../../wiki/pages/videos-page.md) — `MainVideoPage` · tipos de video · acciones inline
- [wiki/pages/images-page.md](../../wiki/pages/images-page.md) — `MainImagePage` · ⚠️ path `images_pages/` (plural)
- [wiki/pages/tags-page.md](../../wiki/pages/tags-page.md) — `MainTagsPage` · filtros · `TagFooterActions`
- [wiki/pages/login-page.md](../../wiki/pages/login-page.md) — `MainLoginPage` · `passLoginAndTwoFA()` · `AuthCredentials`
- [wiki/pages/modals.md](../../wiki/pages/modals.md) — `PublishModal` · `CKEditorImageModal`
- [src/interfaces/data.ts](../interfaces/data.ts) — `NoteData`, `VideoData`, `AINoteData`, `ImageData`, `TagData`
