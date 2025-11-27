import { until, error } from "selenium-webdriver";
import { retry } from "../wrappers/retry.js";
import { stackLabel } from "./stackLabel.js";
/**
 * Espera a que un elemento sea ubicado en el DOM por su Locator.
 * @param driver La instancia del WebDriver.
 * @param locator El objeto By (e.g., By.css('...'), By.xpath('...')) que identifica el elemento.
 * @param timeout El tiempo máximo de espera en milisegundos (default: 1.5s).
 * @param opts Opciones de reintento.
 * @returns Una promesa que resuelve con el WebElement una vez ubicado.
 */
export async function waitFind(driver, locator, timeout = 1500, opts = {}) {
    const fullOpts = { ...opts, label: stackLabel(opts.label, `waitFind: ${JSON.stringify(locator)}`) };
    console.log(`[${fullOpts.label}]`);
    return retry(async () => {
        try {
            console.log(`Buscando: ${JSON.stringify(locator)}.`);
            const element = await driver.wait(until.elementLocated(locator), timeout, `Elemento no encontrado: ${JSON.stringify(locator)} en ${timeout / 1000}s`);
            console.log(`Exito: ${JSON.stringify(locator)}.`);
            return element;
        }
        catch (err) {
            if (err instanceof error.TimeoutError) {
                throw new Error(`Elemento no encontrado: ${JSON.stringify(locator)} en ${timeout / 1000}s`);
            }
            throw err;
        }
    }, fullOpts);
}
//# sourceMappingURL=waitFind.js.map