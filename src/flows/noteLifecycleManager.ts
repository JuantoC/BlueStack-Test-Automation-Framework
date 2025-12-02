import { WebDriver } from "selenium-webdriver";
import { stackLabel } from "../core/utils/stackLabel.js";
import { RetryOptions } from "../core/wrappers/retry.js";
import { NoteType } from "../pages/post/note_editor/noteCreationDropdown.js";
import { NoteEditorPage } from "../pages/post/note_editor/noteEditorPage.js";
import { NoteExitAction } from "../pages/post/note_editor/headerActions.js";

export async function createNewNote(driver: WebDriver, noteType: NoteType, timeout: number, opts: RetryOptions) {
    const fullOpts: RetryOptions = { ...opts, label: stackLabel(opts.label, `[createNewNote]: ${noteType}`) };
    const page = new NoteEditorPage(driver)

    console.log(`[createNewNote]: ${noteType}`);
    await page.creationDropdow.selectNoteType(noteType, timeout, fullOpts)
    return;
}

export async function closeNoteEditor(driver: WebDriver, exitAction: NoteExitAction, timeout: number, opts: RetryOptions) {
    const fullOpts: RetryOptions = { ...opts, label: stackLabel(opts.label, `[CloseNoteEditor]: ${exitAction}`) };
    const page = new NoteEditorPage(driver)

    console.log(`[CloseNoteEditor]: ${exitAction}`)
    await page.headerActions.clickExitAction(exitAction, timeout, fullOpts)
}