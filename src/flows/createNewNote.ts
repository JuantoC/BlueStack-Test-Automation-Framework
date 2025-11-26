import { Locator, WebDriver } from "selenium-webdriver";
import { RetryOptions } from "../core/wrappers/retry";
import { stackLabel } from "../core/utils/stackLabel";
import { clickSafe } from "../core/actions/clickSafe";
import { noteCreationModalPage, } from "../pages/post/noteCreationModal.js";
import { NoteData } from "../dataTest/noteDataInterface";
import { NoteEditorPage } from "../pages/post/note_editor/noteEditor";

export async function createNewNote(driver: WebDriver, noteType: string, data: NoteData, timeout: number, opts: RetryOptions) {
    const fullOpts: RetryOptions = { ...opts, label: stackLabel(opts.label, `createNewNote:${noteType}`) };
    const page =new NoteEditorPage(driver, )
    console.log(`[${fullOpts.label}]`);

    
}