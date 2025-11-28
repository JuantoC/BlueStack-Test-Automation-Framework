import { WebDriver } from "selenium-webdriver";
import { RetryOptions } from "../core/wrappers/retry.js";
import { stackLabel } from "../core/utils/stackLabel.js";
import { NoteType, } from "../pages/post/note_editor/noteCreationDropdown.js";
import { NoteData } from "../dataTest/noteDataInterface.js";
import { NoteEditorPage } from "../pages/post/note_editor/noteEditorPage.js";

export async function createFullNote(driver: WebDriver, noteType: NoteType, data: NoteData, timeout: number, opts: RetryOptions) {
    const fullOpts: RetryOptions = { ...opts, label: stackLabel(opts.label, `[createFullNote]: ${noteType}`) };
    const page = new NoteEditorPage(driver)
    
    console.log(`[createFullNote]: ${noteType}`);
    await page.creationDropdow.selectNoteType(noteType, timeout, fullOpts)
    await page.fillFields(data, timeout, fullOpts)
    await page.headerActions.clickSaveDropdown("save and exit", timeout, fullOpts)
}