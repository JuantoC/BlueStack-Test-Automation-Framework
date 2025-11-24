import { WebDriver } from "selenium-webdriver";
import { clickSafe } from "./clickSafe.js";
import { NoteCreationModal } from "../../pages/newNoteModal.js";
import { newNoteTypeIndexMap } from "../../pages/NewNoteIndexMap.js";

/**
 * Abre el modal de selección de tipo de nota y selecciona el tipo especificado.
 * @param driver La instancia del WebDriver.
 * @param noteType Referencia al tipo de nota en el modal de botones (e.g. ......).
 * @param locators El conjunto de localizadores.
 */
export async function selectNoteType(driver: WebDriver, noteType: string, locators: NoteCreationModal): Promise<void> {
    console.log(`Seleccionando el tipo de nota: "${noteType}"`);
    const noteLocator = locators.noteTypeBase(noteType, newNoteTypeIndexMap);
    await clickSafe(driver, noteLocator, 1500, { retries: 3, label: `selectNoteType / Click : ${noteType}` });
    console.log(`Tipo de nota "${noteType}" seleccionado y proceso completado.`);
}