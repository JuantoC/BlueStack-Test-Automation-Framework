import { WebDriver } from "selenium-webdriver";
import { clickSafe } from "./clickSafe.js";
import { NoteCreationModal } from "../../pages/newNoteModal.js";
import { newNoteTypeIndexMap } from "../../pages/NewNoteIndexMap.js";
import { RetryOptions } from "../wrappers/retry.js";

/**
 * Abre el modal de selección de tipo de nota y selecciona el tipo especificado.
 * @param driver La instancia del WebDriver.
 * @param noteType Referencia al tipo de nota en el modal de botones (e.g. ......).
 * @param locators El conjunto de localizadores.
 */
export async function selectNoteType(driver: WebDriver, noteType: string, locators: NoteCreationModal, opts: RetryOptions): Promise<void> {
    const fullOpts: RetryOptions = { ...opts, label: `selectNoteType : ${noteType}`};
    const noteLocator = locators.noteTypeBase(noteType, newNoteTypeIndexMap);

    console.log(`Seleccionando "${noteType}"...`);
    await clickSafe(driver, noteLocator, 1500, fullOpts);
    console.log(`"${noteType}" seleccionado.`);
}