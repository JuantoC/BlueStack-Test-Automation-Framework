# `/src/pages` — Page Object Layer

> **AI AGENT DIRECTIVE:** This is the authoritative spec for all code written in this directory.
> Before writing any new file or method, verify it against every rule in this document.
> If a rule conflicts with your training defaults, **this document wins**.

---

## Quick Reference

| Concept               | Rule |
|-----------------------|-------------------------------------------------|
| Who imports what      | Test sessions import **only** Maestro classes |
| Locator ownership     | Locators live **only** in sub-components |
| Constructor signature | `(driver: WebDriver, opts: RetryOptions)` — always |
| Label stacking        | Always `stackLabel(opts.label, "ClassName")` |
| Method wrapping       | Every `public` method → `step()` from `allure-js-commons` |
| Error handling        | Every `catch` → log + re-throw, never swallow |
| Imports               | Always use `.js` extension on internal imports |
| Sleeps | `driver.sleep()` is **forbidden** without a justification comment |
| State cleanup | Page Objects **never** attempt to clean state after an error |

---

## Directory Structure

```
src/pages/
├── SidebarAndHeaderSection.ts   # Global nav — SidebarOption enum lives here
├── login_page/
│   └── MainLoginPage.ts
├── post_page/
│   ├── MainPostPage.ts          # Maestro
│   ├── PostTable.ts
│   ├── NewNoteBtn.ts            # NoteType enum lives here
│   └── note_editor_page/
│       ├── MainEditorPage.ts    # Maestro
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
│   ├── MainVideoPage.ts         # Maestro
│   ├── VideoTable.ts
│   ├── UploadVideoBtn.ts        # VideoType enum lives here
│   ├── UploadVideoModal.ts
│   ├── VideoActions.ts          # ActionType enum lives here
│   └── FooterVideoActions.ts
├── comment_page/
├── image_page/
└── user_profile_page/
```

**Rule:** One directory per CMS section. Sub-components and their Maestro share the same folder.

---

## Architectural Pattern: Two-Layer Facade

### Layer 1 — Sub-components
- Own a single UI region (e.g., `VideoTable`, `EditorTagsSection`).
- Declare all locators as `private readonly` class fields typed as `Locator`.
- Never call methods from sibling sub-components.
- Never call methods from their parent Maestro.

### Layer 2 — Maestros (`Main<PageName>Page`)
- Instantiate and compose all sub-components in `constructor`.
- Expose high-level workflow methods (e.g., `uploadNewVideo()`, `createNewNote()`).
- **Never hold raw locators** — all DOM interaction is delegated to sub-components.
- Are the **only classes imported by test sessions**.

```
Test Session
    └── MainVideoPage            ← only this is imported by the test
            ├── VideoTable
            ├── UploadVideoBtn
            ├── UploadVideoModal
            ├── VideoActions
            └── FooterVideoActions
```

---

## Constructor Contract

Every class — Maestro and sub-component — **must** use this exact signature:

```typescript
constructor(driver: WebDriver, opts: RetryOptions) {
  this.driver = driver;
  this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "ClassName") };
}
```

Maestros that require an enum (e.g., `NoteType`) add it as the second parameter:

```typescript
constructor(driver: WebDriver, noteType: NoteType, opts: RetryOptions)
```

**Rules:**
- Spread `DefaultConfig` first, then `opts` — callers can override individual defaults.
- Always call `stackLabel(opts.label, "ClassName")` — produces a trace-friendly label chain (e.g., `"Session > MainVideoPage > VideoTable"`).
- Always pass `this.config` (never `opts`) to every sub-component instantiated in the constructor.

---

## Method Structure Contract

Every `public` method in any Page Object must follow this template:

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
      throw error; // always re-throw
    }
  });
}
```

**Rules:**
- `step()` is mandatory on every main Maestro class method´s — no exceptions.
- `catch` blocks must log with `logger.error` always in the sub-component classes, and re-throw like all catch blocks. Silent catches are forbidden.
- Log levels: `logger.info` for workflow milestones, `logger.debug` for intermediate steps, `logger.error` only in catch blocks.
- `stepContext.parameter()` must document all key inputs.

---

## Naming Conventions

### Files
| Type          | Pattern                 | Example              |
| ------------- | ----------------------- | -------------------- |
| Maestro       | `Main<PageName>Page.ts` | `MainVideoPage.ts`   |
| Sub-component | `<UIRegion><Element>.ts`| `UploadVideoModal.ts`, `VideoTable.ts` |

### Classes
- Same as file name, PascalCase: `MainVideoPage`, `UploadVideoModal`.

### Locators
- Pattern: `[noun][ElementType]` — noun first, element type last.
- `private readonly` class fields typed as `Locator`.

```typescript
// ✅ Correct
private readonly saveBtn: Locator;
private readonly titleInput: Locator;
private readonly userDropdown: Locator;
private readonly progressBar: Locator;

// ❌ Wrong
private readonly btnSave: Locator;    // element type first
private readonly save: Locator;       // missing element type
private readonly button_save: Locator; // snake_case
```

### Methods
- `camelCase`, verb-first, intention-revealing.
- `fillFullNote()`, `uploadNewVideo()`, `selectFirstSectionOption()` — not `handleNote()` or `doUpload()`.

### Enums
- PascalCase for the enum type, UPPER_SNAKE_CASE for values.

```typescript
export enum VideoType {
  NATIVO = "nativo",
  YOUTUBE = "youtube",
}
```

---

## Explicit Wait Rules

- `driver.sleep()` is **forbidden** as a default strategy. If unavoidable, add a comment explaining why no wait utility works for that case.
- For dynamic elements, use explicit wait utilities from `src/core/actions/` **before** any interaction.
- Sub-components are responsible for their own waits. A Maestro never adds a sleep to compensate for a flaky sub-component.

```typescript
// ✅ Correct — explicit wait before interaction
await waitVisible(this.driver, this.saveBtn, this.config);
await clickSafe(this.driver, this.saveBtn, this.config);

// ❌ Wrong — raw sleep
await this.driver.sleep(2000);
await clickSafe(this.driver, this.saveBtn, this.config);
```

---

## Error Handling & State Contract

- Page Objects are **stateless with respect to error recovery**. A `catch` block logs and re-throws. It never navigates back, refreshes the page, or attempts to restore a previous state.
- This is intentional: letting the session die with the original error produces a clean failure with a full trace. Silent recovery masks the real failure point.

```typescript
// ✅ Correct
} catch (error: any) {
  logger.error(`Error in fillFullNote: ${error.message}`, { label: this.config.label });
  throw error;
}

// ❌ Wrong — attempting state cleanup
} catch (error: any) {
  await this.driver.navigate().back(); // forbidden
  logger.warn(`Recovered from error`); // masks failure
}
```

---

## Enum & Interface Ownership

Do not redefine these symbols elsewhere. Import only from the canonical source.

| Symbol          | Canonical file                                  |
| --------------- | ----------------------------------------------- |
| `NoteType`      | `src/pages/post_page/NewNoteBtn.ts`             |
| `NoteExitAction`| `src/pages/post_page/note_editor_page/EditorHeaderActions.ts` |
| `VideoType`     | `src/pages/videos_page/UploadVideoBtn.ts`       |
| `ActionType`    | `src/pages/videos_page/VideoActions.ts`         |
| `SidebarOption` | `src/pages/SidebarAndHeaderSection.ts`          |
| `LiveBlogData`  | `src/pages/post_page/note_editor_page/noteList/BaseListicleSection.ts` |
| `NoteData`      | `src/interfaces/data.ts`                        |
| `VideoData`     | `src/interfaces/data.ts`                        |

**Rule for new symbols:** Place them in the most specific file that owns the concept. If they are genuinely cross-cutting, add them to `src/interfaces/data.ts`.

---

## Import Conventions

All internal imports must use the `.js` extension (ESM module resolution requirement).

```typescript
// ✅ Correct
import { PostTable } from './PostTable.js';
import { NoteType } from './NewNoteBtn.js';
import { RetryOptions, DefaultConfig } from '../../core/config/defaultConfig.js';

// ❌ Wrong — will fail at runtime
import { PostTable } from './PostTable';
```

Placing imports at the bottom of the file (after the class declaration) is acceptable to keep the class definition at the top for readability. See `MainPostPage.ts` and `MainEditorPage.ts` as examples.

---

## Shared Utilities

Always use these. Never reimplement their behavior inline.

| Utility         | Location                                  | Usage                                        |
| --------------- | ------------------------------------------- | -------------------------------------------- |
| `clickSafe`     | `src/core/actions/clickSafe.js`             | Safe click with retry                          |
| `waitVisible`   | `src/core/actions/waitForVisible.js`        | Explicit visibility wait                     |
| `stackLabel`    | `src/core/utils/stackLabel.js`              | Builds cumulative label chain                |
| `logger`        | `src/core/utils/logger.js`                  | Structured logging (default import)          |
| `DefaultConfig` | `src/core/config/defaultConfig.js`          | Default timeout and retry values             |
| `RetryOptions`  | `src/core/config/defaultConfig.js`          | Type for `opts` / `config`                   |

---

## Anti-Patterns — Never Do These

The following patterns are **always wrong** in this codebase. If you find yourself writing any of these, stop and re-read the relevant section above.

```typescript
// ❌ Raw locator in a Maestro
class MainVideoPage {
  private readonly saveBtn = By.css('.save'); // locators belong in sub-components
}

// ❌ Sub-component imported directly in a test session
import { VideoTable } from '../pages/videos_page/VideoTable.js'; // only Maestros in tests

// ❌ Public method without step()
async fillTitle(title: string): Promise<void> {
  await this.titleInput.sendKeys(title); // must be wrapped in step()
}

// ❌ Silent catch
} catch (error: any) {
  logger.warn('Something went wrong'); // must re-throw
}

// ❌ Raw sleep without justification
await this.driver.sleep(1500); // forbidden without a comment

// ❌ Passing opts instead of this.config to a sub-component
this.table = new VideoTable(this.driver, opts); // must be this.config

// ❌ Locator naming with wrong pattern
private readonly btnSave: Locator;      // element type must come last
private readonly saveButton: Locator;   // use 'Btn', not 'Button'

// ❌ State cleanup in catch
} catch (error) {
  await this.driver.navigate().back();  // forbidden — Page Objects never clean state
  throw error;
}

// ❌ Internal import without .js extension
import { VideoTable } from './VideoTable'; // will fail at runtime
```

---

## Pre-existing Conditions (Do Not Break)

These behaviors are intentional. Do not simplify or remove them.

- **`SidebarAndHeaderSection.goToComponent()`** — navigating to `IMAGES` or `VIDEOS` requires a two-click pattern (first `MULTIMEDIA_FILE_BTN`, then the specific locator). This logic must not be simplified to a single click.

- **`MainEditorPage.fillFullNote()`** — calls `this.settings.selectFirstSectionOption()` unconditionally. New note types that do not require section selection must handle the conditional inside `EditorLateralSettings`, not by modifying `fillFullNote()`.

- **`MainEditorPage.fillListicleOrLiveblog()`** — private method that branches between `ListicleSection` and `LiveBlogSection` based on `this.noteType`. Adding a third note type means adding a third branch here. Do not move this logic into `fillFullNote()`.

- **`MainVideoPage.uploadNewVideo()`** — calls `checkProgressBar()` only for `VideoType.NATIVO`. Other video types skip it. This conditional is intentional and must be preserved.

- **`stackLabel()` is cumulative** — it appends the current class name to the parent label. The full chain (e.g., `"Session > MainVideoPage > VideoTable"`) appears in logs. Always pass `this.config` to sub-components so the chain grows correctly.

---

## Required Prior Knowledge

To work on this directory, the following must be understood:

- **Selenium WebDriver (TypeScript):** `WebDriver`, `WebElement`, `By`, `Locator`, `until` waiters, async call chains.
- **TypeScript:** Generics, `Partial<T>`, enums, access modifiers (`private`, `public`, `readonly`), ESM module resolution.
- **Page Object Model:** The difference between Facade/Maestro objects and atomic sub-components, and why the separation matters for maintainability.
- **Allure (`allure-js-commons`):** `step()`, `attachment()`, `stepContext.parameter()` — how they nest to build the report tree.
- **`RetryOptions` / `DefaultConfig` system:** How `timeoutMs`, `retries`, and `label` flow from the test session down through every nested Page Object.
- **Jest + `runSession()`:** How `runSession()` wraps `test()`, manages the driver lifecycle, and passes `{ driver, opts, log }` to the test body.