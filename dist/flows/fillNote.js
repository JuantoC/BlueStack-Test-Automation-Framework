import { stackLabel } from "../core/utils/stackLabel.js";
import { NoteEditorPage } from "../pages/post/note_editor/noteEditorPage.js";
export async function fillNote(driver, data, timeout, opts) {
    const fullOpts = { ...opts, label: stackLabel(opts.label, `[fillNote]`) };
    const page = new NoteEditorPage(driver);
    console.log(`[fillNote]`);
    await page.fillFields(data, timeout, fullOpts);
}
//# sourceMappingURL=fillNote.js.map