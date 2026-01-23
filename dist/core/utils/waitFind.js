import { until, error } from "selenium-webdriver";
import { DefaultConfig } from "../config/default.js";
import { stackLabel } from "./stackLabel.js";
import logger from "../utils/logger.js";
import { retry } from "../wrappers/retry.js";
/**
 * Localiza un elemento en el DOM esperando a que esté presente.
 */
export async function waitFind(driver, locator, opts = {}) {
    const config = {
        ...DefaultConfig,
        ...opts,
        label: stackLabel(opts.label, `waitFind`)
    };
    return await retry(async () => {
        try {
            logger.debug(`Buscando elemento: ${JSON.stringify(locator)}`, { label: config.label });
            // until.elementLocated verifica la presencia del elemento en el DOM (independientemente de su visibilidad)
            const element = await driver.wait(until.elementLocated(locator), config.timeoutMs);
            logger.debug(`Elemento encontrado: ${JSON.stringify(locator)}`, { label: config.label });
            return element;
        }
        catch (err) {
            if (err instanceof error.TimeoutError) {
                // Logueamos el error de timeout con el detalle del locator para facilitar el debug
                logger.error(`Timeout: Elemento no encontrado ${JSON.stringify(locator)} tras ${config.timeoutMs}ms`, {
                    label: config.label
                });
            }
            // Propagamos el error para que sea el orquestador quien lo maneje
            throw err;
        }
    }, config);
}
//# sourceMappingURL=waitFind.js.map