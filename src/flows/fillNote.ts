import { WebDriver } from "selenium-webdriver";
import { RetryOptions } from "../core/config/default.js";
import { stackLabel } from "../core/utils/stackLabel.js";
import { NoteData } from "../dataTest/noteDataInterface.js";
import { NoteEditorPage } from "../pages/post/note_editor/noteEditorPage.js";

export async function fillNote(driver: WebDriver, data: NoteData, timeout: number, opts: RetryOptions) {
    const fullOpts: RetryOptions = { ...opts, label: stackLabel(opts.label, `[fillNote]`) };
    const page = new NoteEditorPage(driver)
    
    console.log(`[fillNote]`);
    await page.fillFields(data, timeout, fullOpts)
}