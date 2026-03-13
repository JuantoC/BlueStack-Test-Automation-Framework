# `/src/pages` — Page Object Layer

This is the most critical directory in the framework. It contains the entire **Page Object Model (POM)** layer that maps every section of the Bluestack CMS to structured, reusable TypeScript classes. All test sessions in `sessions/` depend exclusively on the classes defined here.

---

## Purpose & Responsibility

The `/pages` directory is the **only** interface between test sessions and the browser DOM. No test file should ever contain raw Selenium locators, `driver.findElement()` calls, or direct interaction logic. All of that lives here.

Its responsibilities are:

- Encapsulate every CMS UI section as a typed, self-contained class.
- Expose high-level, intention-revealing methods (e.g., `fillFullNote()`, `uploadNewVideo()`) that test sessions can call without knowing DOM internals.
- Propagate `RetryOptions` and the shared `logger` consistently so every action is observable and resilient.
- Wrap multi-step operations in Allure `step()` blocks for granular report visibility.

---

## Directory Structure

```
src/pages/
├── SidebarAndHeaderSection.ts   # Global navigation (sidebar + top header)
├── login_page/
│   └── MainLoginPage.ts
├── post_page/
│   ├── MainPostPage.ts          # Maestro: post list page
│   ├── PostTable.ts
│   ├── NewNoteBtn.ts            # NoteType enum lives here
│   └── note_editor_page/
│       ├── MainEditorPage.ts    # Maestro: full note editor
│       ├── EditorHeaderActions.ts   # NoteExitAction enum lives here
│       ├── EditorTextSection.ts
│       ├── EditorTagsSection.ts
│       ├── EditorAuthorSection.ts
│       ├── EditorLateralSettings.ts
│       ├── EditorImagesSection.ts
│       └── noteList/
│           ├── BaseListicleSection.ts   # LiveBlogData interface lives here
│           └── ListicleItemSection.ts   # ListicleSection + LiveBlogSection
├── videos_page/
│   ├── MainVideoPage.ts         # Maestro: video management page
│   ├── VideoTable.ts
│   ├── UploadVideoBtn.ts        # VideoType enum lives here
│   ├── UploadVideoModal.ts
│   ├── VideoActions.ts          # ActionType enum lives here
│   └── FooterVideoActions.ts
├── comment_page/
├── image_page/
└── user_profile_page/
```

---

## Architectural Pattern: Two-Layer Facade

Every CMS section is modeled with a strict two-layer hierarchy:

### Layer 1 — Sub-components
Small, focused classes that own a single UI region (e.g., `VideoTable`, `UploadVideoModal`, `EditorTagsSection`). Each one:
- Declares its own locators as `private readonly` class fields typed as `Locator`.
- Contains only the interactions that belong to that specific region.
- Never calls methods from sibling sub-components.

### Layer 2 — Main Page Objects (Maestros)
Orchestrator classes named `Main<PageName>Page` (e.g., `MainVideoPage`, `MainPostPage`, `MainEditorPage`). Each one:
- Instantiates and composes all relevant sub-components in its `constructor`.
- Exposes high-level workflow methods (e.g., `uploadNewVideo()`, `createNewNote()`).
- Never holds raw locators — it delegates all DOM interaction to its sub-components.
- Is the **only class that test sessions import** for that CMS section.

```
Test Session
    └── MainVideoPage          ← only this is imported by the test
            ├── VideoTable
            ├── UploadVideoBtn
            ├── UploadVideoModal
            ├── VideoActions
            └── FooterVideoActions
```

---

## Constructor Contract (Required for Every Class)

Every Page Object class — both Maestros and sub-components — **must** follow this constructor signature:

```typescript
constructor(driver: WebDriver, opts: RetryOptions) {
  this.driver = driver;
  this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "ClassName") };
}
```

**Maestros** that accept a `NoteType` or similar enum add it as the second parameter:

```typescript
constructor(driver: WebDriver, noteType: NoteType, opts: RetryOptions)
```

Key rules:
- Always spread `DefaultConfig` first, then `opts`, so callers can selectively override defaults.
- Always append the class name via `stackLabel()` — this builds a trace-friendly label chain that makes logs and error messages traceable across nested Page Objects.
- Always pass `this.config` (never `opts` directly) to every sub-component instantiated in the constructor.

---

## Method Structure Contract

Every public method in a Page Object must follow this pattern:

```typescript
async myMethod(param: string): Promise<void> {
  await step(`Human-readable description: "${param}"`, async (stepContext) => {
    stepContext.parameter("Param Name", param);
    stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

    try {
      logger.debug(`Starting action...`, { label: this.config.label });
      // delegate to sub-components
      logger.debug(`Action completed successfully.`, { label: this.config.label });
    } catch (error: any) {
      logger.error(`Error in myMethod: ${error.message}`, {
        label: this.config.label,
        param,
        error: error.message,
      });
      throw error; // always re-throw — never swallow errors silently
    }
  });
}
```

Rules:
- Wrap every public method in `step()` from `allure-js-commons` for Allure report traceability.
- Always re-throw caught errors after logging. Silent catch blocks mask failures.
- Use `logger.info` for workflow milestones, `logger.debug` for intermediate steps, `logger.error` only in catch blocks.
- `stepContext.parameter()` should document key inputs so they are visible in the Allure report.

---

## Enum & Interface Ownership

Several enums and interfaces are defined inside Page Object files and must be imported from their canonical source. **Do not redefine them elsewhere.**

| Symbol | Defined in |
|---|---|
| `NoteType` | `src/pages/post_page/NewNoteBtn.ts` |
| `NoteExitAction` | `src/pages/post_page/note_editor_page/EditorHeaderActions.ts` |
| `VideoType` | `src/pages/videos_page/UploadVideoBtn.ts` |
| `ActionType` | `src/pages/videos_page/VideoActions.ts` |
| `SidebarOption` | `src/pages/SidebarAndHeaderSection.ts` |
| `LiveBlogData` | `src/pages/post_page/note_editor_page/noteList/BaseListicleSection.ts` |
| `NoteData` | `src/interfaces/data.ts` |
| `VideoData` | `src/interfaces/data.ts` |

---

## Import Conventions

All internal imports must use the `.js` extension (even for `.ts` source files). This is required by the ESM module resolution configuration used in this project.

```typescript
// ✅ Correct
import { PostTable } from './PostTable.js';
import { NoteType } from './NewNoteBtn.js';
import { RetryOptions, DefaultConfig } from '../../core/config/defaultConfig.js';

// ❌ Wrong — will fail at runtime
import { PostTable } from './PostTable';
```

Imports at the bottom of the file are acceptable (as seen in `MainPostPage.ts` and `MainEditorPage.ts`) to allow the class declaration to appear at the top of the file for readability.

---

## Shared Utilities (from `src/core/`)

Page Objects must use these shared utilities and must **never** reimplement their behavior inline:

| Utility | Location | Usage |
|---|---|---|
| `clickSafe` | `src/core/actions/clickSafe.js` | Safe element click with retry |
| `stackLabel` | `src/core/utils/stackLabel.js` | Builds the label chain for `config.label` |
| `logger` | `src/core/utils/logger.js` | Structured logging — import as default |
| `DefaultConfig` | `src/core/config/defaultConfig.js` | Provides default timeout and retry values |
| `RetryOptions` | `src/core/config/defaultConfig.js` | Type for the `opts` / `config` object |

Raw `driver.sleep()` calls are **forbidden** except as a documented last resort. Always prefer wait utilities from `src/core/actions/`.

---

## Rules for Modifying This Directory

1. **One directory per CMS section.** Sub-components of the same page must live in the same folder as their Maestro.
2. **Never add locators to Maestro classes.** Locators belong exclusively in sub-components.
3. **Never import a sub-component directly in a test session.** Test sessions import only Maestro classes.
4. **Maintain the constructor contract.** Every new class must accept `(driver, opts)` and call `stackLabel()`.
5. **Never skip `step()` wrapping.** Every public method must be wrapped — this is what produces meaningful Allure output.
6. **Never swallow errors.** Every `catch` block must log and re-throw.
7. **New enums or shared interfaces go in the most specific file** that owns that concept, or in `src/interfaces/data.ts` if they are truly cross-cutting.
8. **No raw `sleep()` calls.** Document with a comment if unavoidable.

---

## Pre-existing Conditions from the Codebase

These are implicit constraints derived from the existing code that any AI or developer must respect:

- `SidebarAndHeaderSection.ts` handles a special case: navigating to `IMAGES` or `VIDEOS` requires a two-click pattern (first click `MULTIMEDIA_FILE_BTN`, then the specific locator). This logic is already encoded in `goToComponent()` and must not be removed or simplified.
- `MainEditorPage.fillFullNote()` calls `this.settings.selectFirstSectionOption()` unconditionally. Any new note type that does not require a section selection must handle this via its own conditional logic inside `EditorLateralSettings`, not by modifying `fillFullNote()`.
- `MainEditorPage` uses a private `fillListicleOrLiveblog()` helper to branch between `ListicleSection` and `LiveBlogSection` based on `this.noteType`. If a new note type requires a third branch, add it to this private method — do not split the logic into `fillFullNote()`.
- `MainVideoPage.uploadNewVideo()` only calls `checkProgressBar()` for `VideoType.NATIVO`. Other video types skip it. This conditional is intentional and must be preserved.
- `stackLabel()` is cumulative — it appends the current class name to the parent label. The full label chain (e.g., `"Session > MainVideoPage > VideoTable"`) is what appears in logs. Always pass `this.config` (with the already-stacked label) to sub-components, never `opts`.

---

## Required Prior Knowledge

To work effectively on this directory, the following must be understood:

- **Selenium WebDriver (TypeScript):** `WebDriver`, `WebElement`, `By`, `Locator`, `until` waiters, and the async nature of all Selenium calls.
- **TypeScript:** Generics, `Partial<T>`, enums, access modifiers (`private`, `public`, `readonly`), and ESM module resolution.
- **Page Object Model pattern:** The difference between Facade/Maestro objects and atomic sub-components, and why the separation matters for maintainability.
- **Allure reporting (`allure-js-commons`):** `step()`, `attachment()`, `stepContext.parameter()` — how they nest to build the report tree.
- **The `RetryOptions` / `DefaultConfig` system:** How `timeoutMs`, `retries`, and `label` flow from the test session down through every nested Page Object.
- **Jest + `runSession()`:** How `runSession()` wraps `test()`, manages the driver lifecycle, and passes `{ driver, opts, log }` to the test body.