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

---

## Directory

```
src/pages/
├── SidebarAndHeaderSection.ts     # SidebarOption enum
├── login_page/
│   ├── MainLoginPage.ts
│   ├── LoginSection.ts
│   └── TwoFaSection.ts
├── post_page/
│   ├── MainPostPage.ts            # Maestro
│   ├── PostTable.ts
│   ├── NewNoteBtn.ts              # NoteType enum
│   └── note_editor_page/
│       ├── MainEditorPage.ts      # Maestro
│       ├── EditorHeaderActions.ts # NoteExitAction enum
│       ├── EditorTextSection.ts
│       ├── EditorTagsSection.ts
│       ├── EditorAuthorSection.ts
│       ├── EditorLateralSettings.ts
│       ├── EditorImagesSection.ts
│       └── noteList/
│           ├── BaseListicleSection.ts  # LiveBlogData interface
│           └── ListicleItemSection.ts
├── videos_page/
│   ├── MainVideoPage.ts           # Maestro
│   ├── VideoTable.ts
│   ├── UploadVideoBtn.ts          # VideoType enum
│   ├── UploadVideoModal.ts
│   ├── VideoActions.ts            # ActionType enum
│   └── FooterVideoActions.ts
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
// Maestros with enum: constructor(driver, noteType: NoteType, opts)
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
| Enum type/key/value | `PascalCase` / `SCREAMING_SNAKE_CASE` / `snake_case` | `NoteExitAction.SAVE_AND_EXIT = "save_and_exit"` |

Locators: `private static readonly`, assigned inline, accessed via `ClassName.LOCATOR` — never `this`.

---

## Explicit Waits

Use utilities from `src/core/actions/` before any interaction. `driver.sleep()` forbidden without comment. Sub-components own their waits — Maestros never add sleeps to compensate.

```typescript
await waitVisible(this.driver, EditorHeaderActions.SAVE_BTN, this.config);
await clickSafe(this.driver, EditorHeaderActions.SAVE_BTN, this.config);
```

---

## Enums & Interfaces — Canonical Sources

| Symbol | File |
|---|---|
| `NoteType` | `src/pages/post_page/NewNoteBtn.ts` |
| `NoteExitAction` | `src/pages/post_page/note_editor_page/EditorHeaderActions.ts` |
| `VideoType` | `src/pages/videos_page/UploadVideoBtn.ts` |
| `ActionType` | `src/pages/videos_page/VideoActions.ts` |
| `SidebarOption` | `src/pages/SidebarAndHeaderSection.ts` |
| `LiveBlogData` | `src/pages/post_page/note_editor_page/noteList/BaseListicleSection.ts` |
| `NoteData`, `VideoData` | `src/interfaces/data.ts` |

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
