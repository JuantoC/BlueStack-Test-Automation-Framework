---
name: Description Accuracy
description: The description() call in each session must accurately reflect the actual test flow — no missing steps, no phantom actions, no stale copy-paste.
---

# Description Accuracy

## Context

Every session in `sessions/` calls `description()` from `allure-js-commons` to document the test's objective, flow steps, and acceptance criteria. This text is rendered verbatim in the Allure report and is the primary source of truth for QA reviewers and stakeholders.

The problem: because `description()` is freeform markdown, it drifts silently. A developer changes the workflow (adds a step, removes an action, swaps an exit action) but forgets to update the description. The test still passes — the Allure report just lies.

A real example from this codebase: `NewPost.test.ts` describes three actions including `PUBLISH_ONLY (sin salir)`, but the actual test body only performs two (`SAVE_AND_EXIT` + re-entry). The third action never runs.

## What to Check

### 1. Actions listed in description match calls in the test body

For every `NoteExitAction` enum value mentioned in `description()` (e.g. `SAVE_AND_EXIT`, `PUBLISH_ONLY`, `SAVE_AND_CLOSE`), verify that a corresponding `closeNoteEditor(NoteExitAction.X)` call exists in the test body.

**BAD — description mentions PUBLISH_ONLY but the test never calls it:**
```typescript
description(`
  * **Acción 3:** **PUBLISH_ONLY** (sin salir).
`);
// ...
await editor.closeNoteEditor(NoteExitAction.SAVE_AND_EXIT); // only this runs
```

**GOOD — every action in the description has a matching call:**
```typescript
description(`
  * **Acción 1:** Creación desde cero + **SAVE_AND_EXIT**.
  * **Acción 2:** Re-entrada a la nota.
`);
// ...
await editor.closeNoteEditor(NoteExitAction.SAVE_AND_EXIT);
await post.enterToEditorPage(PostData[4].title!);
```

### 2. Step count in description matches the test body

If the description lists numbered Acciones (Acción 1, Acción 2, Acción 3...), count them and verify the test body contains a roughly matching number of meaningful top-level `await` calls on Page Objects. A description with 3 actions and a test body with only 2 Page Object calls is a red flag.

### 3. Acceptance criteria reflects actual assertions

Check that the **Criterio de Aceptación** section describes something the test actually verifies — not a superset of checks the test skips. If the criteria says "Los datos deben reflejarse íntegramente en la UI" but the test only calls `enterToEditorPage()` without any field-level assertion, flag it as potentially aspirational rather than verified.

### 4. No copy-paste phantom steps from sibling sessions

When a new session is created by duplicating an existing one, the description often inherits steps from the original. Check for descriptions that reference Page Objects, actions, or CMS sections that don't appear anywhere in the test body (e.g., a description mentioning `videos_page` in a post creation test).

## Key Files

- `sessions/*.test.ts` — all session files, each with a `description()` call
- `src/pages/post_page/note_editor_page/EditorHeaderActions.ts` — defines `NoteExitAction` enum values
- `src/data_test/noteData.ts` — fixture data referenced in descriptions

## Exclusions

- Sessions with a single action and a one-liner description — no structural mismatch is possible.
- Descriptions that are intentionally forward-looking (e.g., marked with a `TODO:` comment) are acceptable if explicitly flagged.
- Do not flag stylistic differences between description language and code (Spanish prose vs. English identifiers is the project norm).