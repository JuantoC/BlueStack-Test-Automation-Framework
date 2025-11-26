import { stackLabel } from "../core/utils/stackLabel";
import { NoteEditorPage } from "../pages/post/note_editor/noteEditorPage";
export async function createFullNote(driver, noteType, data, timeout, opts) {
    const fullOpts = { ...opts, label: stackLabel(opts.label, `createNewNote:${noteType}`) };
    const page = new NoteEditorPage(driver);
    console.log(`[${fullOpts.label}]`);
    page.creationDropdow.selectNoteType(noteType, timeout, fullOpts);
    page.fillFields(data, timeout, fullOpts);
    page.headerActions.clickSaveDropdown("save and exit", timeout, fullOpts);
}
//# sourceMappingURL=createNewNote.js.map