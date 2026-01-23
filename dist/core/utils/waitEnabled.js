import { until, error } from "selenium-webdriver";
import { DefaultConfig } from "../config/default.js";
import { stackLabel } from "./stackLabel.js";
import logger from "../utils/logger.js";
import { retry } from "../wrappers/retry.js";
/**
 * Verifica que el elemento no esté en estado 'disabled' en el DOM.
 * Es el último paso de validación antes de intentar una interacción física.
 */
export async function waitEnabled(driver, element, opts = {}) {
    if (!element || typeof element.getId !== "function") {
        throw new Error(`[waitEnabled] Se esperaba un WebElement pero se recibió: ${element}`);
    }
    const config = {
        ...DefaultConfig,
        ...opts,
        label: stackLabel(opts.label, `waitEnabled`)
    };
    return await retry(async () => {
        try {
            logger.debug(`Esperando que el elemento esté habilitado (Enabled)...`, { label: config.label });
            // until.elementIsEnabled verifica el atributo 'disabled' del HTML
            await driver.wait(until.elementIsEnabled(element), config.timeoutMs);
            return element;
        }
        catch (err) {
            if (err instanceof error.TimeoutError) {
                logger.error(`Timeout: El elemento permanece deshabilitado tras ${config.timeoutMs / 1000}s`, {
                    label: config.label
                });
            }
            // Propagamos el error para que el orquestador decida si reintentar
            throw err;
        }
    }, config);
}
//# sourceMappingURL=waitEnabled.js.map