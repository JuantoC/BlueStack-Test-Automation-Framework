import { Locator, WebDriver } from "selenium-webdriver";
import { RetryOptions } from "../core/wrappers/retry";
import { stackLabel } from "../core/utils/stackLabel";
import { clickSafe } from "../core/actions/clickSafe";
import { noteCreationModalPage, } from "../pages/post/noteCreationModal.js";
import { NoteDataInterface } from "../dataTest/noteDataInterface";
import { fillPostFields } from "../core/helpers/fillPostFields";

export async function createNewNote(driver: WebDriver, noteType: string, data: NoteDataInterface, timeout: number, opts: RetryOptions) {
    const fullOpts: RetryOptions = { ...opts, label: stackLabel(opts.label, `createNewNote:${noteType}`) };
    const noteTypeBtn: Locator = noteCreationModalPage.getNoteTypeLocator(noteType)

    console.log(`[${fullOpts.label}]`);
    console.log('Abriendo nota...')
    clickSafe(driver, noteCreationModalPage.openDropdownBtn, timeout, fullOpts);
    clickSafe(driver, noteTypeBtn, timeout, fullOpts);
    console.log('Rellenando campos...')
    fillPostFields(driver, data, timeout, fullOpts);
    
}