import { until, error } from "selenium-webdriver";
import { scrollIntoView } from "./scrollIntoView.js";
import { stackLabel } from "./stackLabel.js";
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
        throw new Error("[waitVisible] Expected a WebElement but received: " + await element.getTagName());
    }
    const fullOpts = { ...opts, label: stackLabel(opts.label, `[waitVisible]: ${await element.getTagName()}`) };
    console.log(`[waitVisible]: ${await element.getTagName()}.`);
    try {
        console.log(`[waitVisible] Esperando que sea visible...`);
        await driver.wait(until.elementIsVisible(element), timeout, `[waitVisible] Elemento no visible: ${await element.getTagName()} en ${timeout / 1000}s`);
        console.log(`[waitVisible]: Elemento esta visible.`);
        return element;
    }
    catch (err) {
        if (err instanceof error.TimeoutError) {
            console.error(`[${fullOpts.label}] ERROR TIMEOUT: Elemento no visible`);
            await scrollIntoView(element);
        }
        throw err;
    }
}
//# sourceMappingURL=waitVisible.js.map