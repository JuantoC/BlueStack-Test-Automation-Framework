import { WebDriver, until, WebElement, error } from "selenium-webdriver";
import { RetryOptions, resolveRetryConfig } from "../config/defaultConfig.js";
import { scrollIntoView } from "../helpers/scrollIntoView.js";
import logger from "../utils/logger.js";
import { retry } from "../wrappers/retry.js";
import { hoverOverParentContainer } from "../helpers/hoverOverParentContainer.js";
import { getErrorMessage } from "../utils/errorUtils.js";

/**
 * Valida la visibilidad de un elemento en el DOM.
 * Si falla por timeout, aplica una estrategia de recuperación escalonada: primero scroll,
 * luego hover sobre el contenedor ancestro para forzar la visibilidad en frameworks Angular Material.
 *
 * @param driver - Instancia activa de WebDriver para la sesión actual.
 * @param element - WebElement previamente localizado que se debe validar como visible.
 * @param opts - Opciones de reintento y trazabilidad. Propagadas a todos los sub-llamados internos.
 * @returns {Promise<WebElement>} El mismo elemento una vez confirmada su visibilidad.
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

    const config = resolveRetryConfig(opts, 'waitVisible');
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
                } catch (e) {
                    logger.debug(`Scroll recovery fallido, continuando con hover: ${getErrorMessage(e)}`, { label: config.label });
                }

                // 2. Intento de Hover sobre el contenedor (Estrategia para Angular Material/Menus)
                try {
                    logger.debug(`Intentando hover sobre ancestro para forzar visibilidad...`, { label: config.label });
                    await hoverOverParentContainer(driver, element, config);

                    // Verificación final post-hover (con timeout reducido para no penalizar el flujo)
                    await driver.wait(until.elementIsVisible(element), config.timeoutMs);
                    return element;

                } catch (hoverErr: any) {
                    logger.error(`La recuperación por hover falló o no fue necesaria: ${getErrorMessage(hoverErr)}`, { label: config.label, error: getErrorMessage(hoverErr) });
                }
            }
            logger.error(`waitVisible: elemento no visible tras recovery: ${getErrorMessage(err)}`, { label: config.label, error: getErrorMessage(err) });
            throw err;
        }
    }, config);
}