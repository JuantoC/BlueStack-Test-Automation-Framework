import { stackLabel } from "../core/utils/stackLabel.js";
import { NoteEditorPage } from "../pages/post/note_editor/noteEditorPage.js";
export async function createFullNote(driver, noteType, data, timeout, opts) {
    const fullOpts = { ...opts, label: stackLabel(opts.label, `createNewNote:${noteType}`) };
    const page = new NoteEditorPage(driver);
    console.log(`[${fullOpts.label}]`);
    await page.creationDropdow.selectNoteType(noteType, timeout, fullOpts);
    await page.fillFields(data, timeout, fullOpts);
    await page.headerActions.clickSaveDropdown("save and exit", timeout, fullOpts);
}
//# sourceMappingURL=createNewNote.js.map