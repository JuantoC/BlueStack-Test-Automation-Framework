import { clickSafe } from "../core/Core-Interactions.js";
/**
 * Abre el modal de selección de tipo de nota y selecciona el tipo especificado.
 * @param driver La instancia del WebDriver.
 * @param noteType Referencia al tipo de nota en el modal de botones (e.g. ......).
 * @param locators El conjunto de localizadores del ambiente actual.
 */
export async function selectNoteType(driver, noteType, locators) {
    // 1. Abre el modal de selección
    console.log('Abriendo modal de creación de contenido...');
    await clickSafe(driver, locators.createNoteModalButton, locators.TIMEOUTS.MEDIUM, "Create Note Modal Button");
    // 3. Selecciona el tipo de nota
    console.log(`Seleccionando el tipo de nota: "${noteType}"`);
    const noteLocator = locators.noteTypeBase(noteType);
    await clickSafe(driver, noteLocator, locators.TIMEOUTS.MEDIUM);
    console.log(`Tipo de nota "${noteType}" seleccionado y proceso completado.`);
}
//# sourceMappingURL=Note-Types.js.map