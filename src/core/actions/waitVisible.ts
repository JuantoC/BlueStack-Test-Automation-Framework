import { WebDriver, until, WebElement, error } from "selenium-webdriver";
import { RetryOptions, DefaultConfig } from "../config/defaultConfig.js";
import { scrollIntoView } from "../helpers/scrollIntoView.js";
import { stackLabel } from "../utils/stackLabel.js";
import logger from "../utils/logger.js";
import { retry } from "../wrappers/retry.js";
import { hoverOverParentContainer } from "../helpers/hoverOverParentContainer.js";

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

            await driver.wait(until.elementIsVisible(element), config.timeoutMs);

            return element;
        } catch (err) {
            if (err instanceof error.TimeoutError) {
                logger.debug(`Timeout inicial. Iniciando protocolos de recuperación...`, { label: config.label });
                // 1. Intento de Scroll
                try {
                    await scrollIntoView(element, config);
                } catch (e) { /* ignore scroll errors to reach hover */ }

                // 2. Intento de Hover sobre el contenedor (Estrategia para Angular Material/Menus)
                try {
                    logger.debug(`Intentando hover sobre ancestro para forzar visibilidad...`, { label: config.label });
                    await hoverOverParentContainer(driver, element, config);

                    // Verificación final post-hover (con timeout reducido para no penalizar el flujo)
                    await driver.wait(until.elementIsVisible(element), config.timeoutMs);
                    return element;

                } catch (hoverErr: any) {
                    logger.debug(`La recuperación por hover falló o no fue necesaria: ${hoverErr.message}`, { label: config.label });
                }
            }
            throw err;
        }
    }, config);
}