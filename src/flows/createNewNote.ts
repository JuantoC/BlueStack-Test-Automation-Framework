import { WebDriver } from "selenium-webdriver";
import { RetryOptions } from "../core/wrappers/retry";
import { stackLabel } from "../core/utils/stackLabel";
import { NoteType, } from "../pages/post/note_editor/noteCreationDropdown.js";
import { NoteData } from "../dataTest/noteDataInterface";
import { NoteEditorPage } from "../pages/post/note_editor/noteEditorPage";

export async function createFullNote(driver: WebDriver, noteType: NoteType, data: NoteData, timeout: number, opts: RetryOptions) {
    const fullOpts: RetryOptions = { ...opts, label: stackLabel(opts.label, `createNewNote:${noteType}`) };
    const page = new NoteEditorPage(driver)
    
    console.log(`[${fullOpts.label}]`);
    page.creationDropdow.selectNoteType(noteType, timeout, fullOpts)
    page.fillFields(data, timeout, fullOpts)
    page.headerActions.clickSaveDropdown("save and exit", timeout, fullOpts)
}