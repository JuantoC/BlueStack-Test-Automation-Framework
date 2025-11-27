import { until, error } from "selenium-webdriver";
import { retry } from "../wrappers/retry.js";
/**
 * Espera a que un WebElement (ya encontrado) sea visible en la página.
 * @param driver La instancia del WebDriver.
 * @param element El WebElement ya resuelto para verificar su visibilidad.
 * @param timeout El tiempo máximo de espera en milisegundos (default: 5s).
 * @param opts Opciones de reintento.
 * @returns Una promesa que resuelve con el mismo WebElement una vez que es visible.
 */
export async function waitVisible(driver, element, timeout = 1500, opts = {}) {
    if (!element || typeof element.getId !== "function") {
        throw new Error("Expected a WebElement but received: " + JSON.stringify(element));
    }
    const fullOpts = { ...opts, label: opts.label ?? `waitVisible: ${element.toString()}` };
    console.log(`${fullOpts.label}.`);
    return retry(async () => {
        try {
            console.log(`waitVisible:${element.toString()} Esperando...`);
            await driver.wait(until.elementIsVisible(element), timeout, `Elemento no visible: ${element.toString()} en ${timeout / 1000}s`);
            console.log(`waitVisible:${element.toString()} Elemento esta visible.`);
            return element;
        }
        catch (err) {
            if (err instanceof error.TimeoutError) {
                console.error(`ERROR en WaitVisible. Elemento no visible en ${timeout / 1000}s`);
            }
            throw err;
        }
    }, fullOpts);
}
//# sourceMappingURL=waitVisible.js.map