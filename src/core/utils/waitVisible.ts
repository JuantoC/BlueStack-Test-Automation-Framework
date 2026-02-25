import { WebDriver, until, WebElement, error } from "selenium-webdriver";
import { RetryOptions, DefaultConfig } from "../config/default.js";
import { scrollIntoView } from "./scrollIntoView.js";
import { stackLabel } from "./stackLabel.js";
import logger from "../utils/logger.js";
import { retry } from "../wrappers/retry.js";

/**
 * Valida la visibilidad de un elemento en el DOM.
 * Si falla por timeout, intenta desplazar el elemento a la vista (scroll) antes de reportar el error.
 */
export async function waitVisible(
    driver: WebDriver,
    element: WebElement,
    opts: RetryOptions = {}
): Promise<WebElement> {

    // Validación preventiva: Evita llamadas al driver con objetos nulos o corruptos
    if (!element || typeof element.getId !== "function") {
        throw new Error(`[waitVisible] Se esperaba un WebElement pero se recibió un objeto inválido.`);
    }

    const config = {
        ...DefaultConfig,
        ...opts,
        label: stackLabel(opts.label, `waitVisible`)
    };
    return await retry(async () => {
        try {
            logger.debug(`Esperando visibilidad del elemento...`, { label: config.label });

            // until.elementIsVisible verifica que el elemento no esté oculto por CSS (display:none, visibility:hidden)
            await driver.wait(until.elementIsVisible(element), config.timeoutMs);

            return element;
        } catch (err) {
            if (err instanceof error.TimeoutError) {
                logger.debug(`Timeout de visibilidad alcanzado. Intentando scrollIntoView como recuperación...`, { label: config.label });
                // Intentamos scroll para ayudar al diagnóstico o a un reintento posterior
                try {
                    await scrollIntoView(element);
                } catch (scrollErr: any) {
                    logger.debug(`No se pudo realizar el scroll: ${scrollErr.message}`, { label: config.label });
                    err.message += ` Además, el intento de scroll para recuperar la visibilidad falló: ${scrollErr.message}`;
                }
            }
            // Relanzamos el error original para que el retryWrapper o el test decidan el siguiente paso
            throw err;
        }
    }, config);
}