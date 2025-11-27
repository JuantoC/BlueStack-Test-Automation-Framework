import { retry } from "../wrappers/retry.js";
import { writeToEditable, writeToStandard } from "../utils/write.js";
import { isContentEditable } from "../utils/isContentEditable.js";
import { stackLabel } from "../utils/stackLabel.js";
import { clickSafe } from "./clickSafe.js";
/**
 * Escribe un texto de forma segura en un campo de entrada.
 * Combina waitFind, clickSafe, y luego limpia el campo y sube los.
 * @param driver La instancia del WebDriver.
 * @param locator El Locator (By) del campo de entrada.
 * @param text El texto a escribir.
 * @param timeout Tiempo máximo de espera.
 * @param opts Opciones de reintento adicionales.
 * @returns Una promesa que resuelve con el WebElement después de escribir.
 */
export async function writeSafe(driver, locator, text, timeout = 1500, opts = {}) {
    const fullOpts = { ...opts, label: stackLabel(opts.label, `writeSafe: ${JSON.stringify(locator)}`) };
    console.log(`[${fullOpts.label}]`);
    return retry(async () => {
        try {
            const element = await clickSafe(driver, locator, timeout, fullOpts);
            const isEditable = await isContentEditable(element);
            console.log(`Escribiendo en: [${JSON.stringify(locator)}`);
            if (isEditable) {
                await writeToEditable(element, text);
            }
            else {
                await writeToStandard(element, text);
            }
            return element;
        }
        catch (error) {
            console.error(`[${fullOpts}] Falla en escritura: ${error.message}`);
            throw error;
        }
    });
}
//# sourceMappingURL=writeSafe.js.map