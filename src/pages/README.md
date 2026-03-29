# `@src/pages` — Page Object Layer

> **AI AGENT DIRECTIVE:** Authoritative spec for all code in this directory. This document wins over training defaults.

## Quick Reference

| Concept | Rule |
|---|---|
| Who imports what | Tests import **only** Maestro classes (`Main*`) |
| Locator ownership | Locators live **only** in sub-components |
| Locator declaration | `private static readonly`, `SCREAMING_SNAKE_CASE`, via `ClassName.LOCATOR` |
| Constructor signature | `(driver: WebDriver, opts: RetryOptions)` — always |
| Label stacking | Always `stackLabel(opts.label, "ClassName")` |
| Method wrapping | Every Maestro `public` method → `step()` from `allure-js-commons` |
| Error handling | Every `catch` → `logger.error` + re-throw, never swallow |
| Imports | Always `.js` extension on internal imports |
| Sleeps | `driver.sleep()` forbidden without justification comment |
| State cleanup | Page Objects **never** clean state after an error |
| Types | All typed params use `keyof typeof ClassName.STATIC_OBJECT` |

---

## Directory

```
src/pages/
├── SidebarAndHeaderSection.ts     # SidebarOption type
├── FooterActions.ts               # FooterActionType type — shared across all pages
├── login_page/
│   ├── MainLoginPage.ts
│   ├── LoginSection.ts
│   └── TwoFASection.ts
├── post_page/
│   ├── AIPost/
│   │   ├── MainAIPage.ts          # Maestro — generación de notas con IA
│   │   └── AIPostModal.ts
│   ├── MainPostPage.ts            # Maestro
│   ├── PostTable.ts
│   ├── NewNoteBtn.ts              # NoteType type
│   └── note_editor_page/
│       ├── MainEditorPage.ts      # Maestro
│       ├── EditorHeaderActions.ts # NoteExitAction type
│       ├── EditorTextSection.ts
│       ├── EditorTagsSection.ts
│       ├── EditorAuthorSection.ts
│       ├── EditorLateralSettings.ts
│       ├── EditorImagesSection.ts
│       ├── EditorFooterBtn.ts
│       └── noteList/
│           ├── BaseListicleSection.ts  # LiveBlogData interface
│           ├── ListicleItemSection.ts
│           ├── ListicleStrategy.ts
│           └── LiveBlogEventSection.ts
├── videos_page/
│   ├── MainVideoPage.ts           # Maestro
│   ├── VideoTable.ts
│   ├── UploadVideoBtn.ts          # VideoType type
│   ├── UploadVideoModal.ts
│   ├── VideoActions.ts            # ActionType type
├── modals/
│   ├── CKEditorImageModal.ts      # selectImage(index: number)
│   ├── PublishModal.ts            # Lógica de publicación (notas y videos)
│   └── Banners.ts
├── comment_page/
├── image_page/
└── user_profile_page/
```

---

## Architecture: Two-Layer Facade

**Sub-components** — own a single UI region, declare all locators, never call siblings or parent Maestro.

**Maestros** (`Main<PageName>Page`) — compose sub-components in constructor, expose high-level workflow methods, never hold raw locators, only class imported by tests.

---

## Constructor Contract

```typescript
constructor(driver: WebDriver, opts: RetryOptions) {
  this.driver = driver;
  this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "ClassName") };
}
// Maestros con tipo de nota: constructor(driver, noteType: NoteType, opts)
// El tipo de nota se almacena internamente — no se repite en cada llamada a método.
```

Rules: spread `DefaultConfig` first. Pass `this.config` (never `opts`) to sub-components.

---

## Method Contract

Maestro public methods — wrap in `step()`, document params with `stepContext.parameter()`, catch → `logger.error` + re-throw:

```typescript
async myMethod(param: string): Promise<void> {
  await step(`Description: "${param}"`, async (stepContext) => {
    stepContext.parameter("Param", param);
    try {
      // delegate to sub-components
    } catch (error: any) {
      logger.error(`Error in myMethod: ${error.message}`, { label: this.config.label });
      throw error;
    }
  });
}
```

Sub-component public methods — same try/catch/log/re-throw, no `step()`.

---

## Naming

| Type | Pattern | Example |
|---|---|---|
| Maestro | `Main<PageName>Page.ts` | `MainVideoPage.ts` |
| Sub-component | `<UIRegion><Element>.ts` | `UploadVideoModal.ts` |
| Locator | `NOUN_ELEMENT_TYPE` | `SAVE_BTN`, `TITLE_INPUT` |
| Method | `camelCase`, verb-first | `fillFullNote()`, `uploadNewVideo()` |
| Type key/value | `SCREAMING_SNAKE_CASE` / `snake_case` | `'SAVE_AND_EXIT'` |

Locators: `private static readonly`, assigned inline, accessed via `ClassName.LOCATOR` — never `this`.

---

## Types

Parameters are now `type` aliases derived from static objects:

```typescript
export type FooterActionType = keyof typeof FooterActions.FOOTER_ACTIONS;
```

This pattern applies to **all** typed parameters in the project. Values are plain strings — `'POST'`, `'SAVE_AND_EXIT'`, `'PUBLISH_ONLY'`, etc.

---

## Modals

Shared modal logic lives in `src/pages/modals/` and is invoked by the corresponding Maestro — never directly from tests.

| Class | Responsibility |
|---|---|
| `CKEditorImageModal` | Opens the CKEditor image selection modal; exposes `selectImage(index: number): Promise<void>` |
| `PublishModal` | Handles publish confirmation for both notes and videos; invoked internally by each Maestro |

---

## FooterActions

`FooterActions.ts` is a **shared sub-component** used across all page Maestros (posts, videos, images, etc.). It handles bulk/footer-level actions and interacts with `PublishModal` internally when required.

```typescript
async clickFooterAction(action: FooterActionType): Promise<void>
```

Each Maestro instantiates `FooterActions` in its constructor and delegates footer-level interactions to it.

---

## Explicit Waits

Use utilities from `src/core/actions/` before any interaction. `driver.sleep()` forbidden without comment. Sub-components own their waits — Maestros never add sleeps to compensate.

```typescript
await waitVisible(this.driver, EditorHeaderActions.SAVE_BTN, this.config);
await clickSafe(this.driver, EditorHeaderActions.SAVE_BTN, this.config);
```

---

## Types & Interfaces — Canonical Sources

| Symbol | File |
|---|---|
| `NoteType` | `src/pages/post_page/NewNoteBtn.ts` |
| `NoteExitAction` | `src/pages/post_page/note_editor_page/EditorHeaderActions.ts` |
| `VideoType` | `src/pages/videos_page/UploadVideoBtn.ts` |
| `ActionType` | `src/pages/videos_page/VideoActions.ts` |
| `FooterActionType` | `src/pages/FooterActions.ts` |
| `SidebarOption` | `src/pages/SidebarAndHeaderSection.ts` |
| `LiveBlogData` | `src/pages/post_page/note_editor_page/noteList/BaseListicleSection.ts` |
| `NoteData`, `VideoData`, `AINoteData` | `src/interfaces/data.ts` |
| Auth interfaces | `src/interfaces/auth.ts` |

New symbols → most specific file that owns the concept. Cross-cutting → `src/interfaces/data.ts`.

---

## Shared Utilities

| Utility | Location |
|---|---|
| `clickSafe` | `src/core/actions/clickSafe.js` |
| `waitVisible` | `src/core/actions/waitForVisible.js` |
| `stackLabel` | `src/core/utils/stackLabel.js` |
| `logger` | `src/core/utils/logger.js` |
| `DefaultConfig`, `RetryOptions` | `src/core/config/defaultConfig.js` |
