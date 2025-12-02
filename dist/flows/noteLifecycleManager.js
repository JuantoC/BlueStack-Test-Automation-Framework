import { stackLabel } from "../core/utils/stackLabel.js";
import { NoteEditorPage } from "../pages/post/note_editor/noteEditorPage.js";
export async function createNewNote(driver, noteType, timeout, opts) {
    const fullOpts = { ...opts, label: stackLabel(opts.label, `[createNewNote]: ${noteType}`) };
    const page = new NoteEditorPage(driver);
    console.log(`[createNewNote]: ${noteType}`);
    await page.creationDropdow.selectNoteType(noteType, timeout, fullOpts);
    return;
}
export async function closeNoteEditor(driver, exitAction, timeout, opts) {
    const fullOpts = { ...opts, label: stackLabel(opts.label, `[CloseNoteEditor]: ${exitAction}`) };
    const page = new NoteEditorPage(driver);
    console.log(`[CloseNoteEditor]: ${exitAction}`);
    await page.headerActions.clickExitAction(exitAction, timeout, fullOpts);
}
//# sourceMappingURL=noteLifecycleManager.js.map