import { WebDriver, until, WebElement, error } from "selenium-webdriver";
import { retry } from '../wrappers/retry';
import { RetryOptions } from '../wrappers/retry.js';

/**
 * Espera a que un WebElement (ya encontrado) sea visible en la página.
 * @param driver La instancia del WebDriver.
 * @param element El WebElement ya resuelto para verificar su visibilidad.
 * @param timeout El tiempo máximo de espera en milisegundos (default: 5s).
 * @param opts Opciones de reintento.
 * @returns Una promesa que resuelve con el mismo WebElement una vez que es visible.
 */
export async function waitVisible(driver: WebDriver, element: WebElement, timeout: number = 1500, opts: RetryOptions = {}): Promise<WebElement> {
    const locatorLabel = element ? element.toString() : JSON.stringify(element);
    const fullOpts = { ...opts, label: opts.label ?? `waitVisible: ${locatorLabel}` };

    console.log(`${fullOpts.label}.`);
    return retry<WebElement>(
        async () => {
            try {
                console.log(`waitVisible:${locatorLabel} Esperando...`);
                await driver.wait(
                    until.elementIsVisible(element),
                    timeout, `Elemento no visible: ${locatorLabel} en ${timeout / 1000}s`);
                console.log(`waitVisible:${locatorLabel} Elemento esta visible.`);
                return element;
            } catch (err) {
                if (err instanceof error.TimeoutError) {
                    console.error(`ERROR en WaitVisible. Elemento no visible en ${timeout / 1000}s`);
                }
                throw err;
            }
        }, fullOpts
    );
}