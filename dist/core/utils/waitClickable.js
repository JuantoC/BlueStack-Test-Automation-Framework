import { error } from "selenium-webdriver";
import { DefaultConfig } from "../config/default.js";
import { stackLabel } from "./stackLabel.js";
import { waitVisible } from "./waitVisible.js";
import { waitEnabled } from "./waitEnabled.js";
import logger from "../utils/logger.js";
import { retry } from "../wrappers/retry.js";
/**
 * Valida que un elemento sea apto para recibir clics (Visible + Habilitado).
 * Esta función es "pura": no reintenta, solo espera dentro del timeout definido.
 */
export async function waitClickable(driver, element, opts = {}) {
    // Validación de integridad del objeto antes de operar
    if (!element || typeof element.getId !== "function") {
        throw new Error(`Se esperaba un WebElement válido pero se recibió: ${element}`);
    }
    const fullOpts = {
        ...DefaultConfig,
        ...opts,
        label: stackLabel(opts.label, `waitClickable`)
    };
    return await retry(async () => {
        try {
            // La combinación de visible + enabled garantiza que el driver pueda interactuar
            await waitVisible(driver, element, fullOpts);
            await waitEnabled(driver, element, fullOpts);
            logger.debug(`Elemento listo para recibir interacción`, { label: fullOpts.label });
            return element;
        }
        catch (err) {
            if (err instanceof error.TimeoutError) {
                logger.error(`El elemento no alcanzó el estado 'interactuable' tras ${fullOpts.timeoutMs / 1000}s`, {
                    label: fullOpts.label
                });
            }
            throw err; // El error debe subir para que el retryWrapper lo capture
        }
    }, fullOpts);
}
//# sourceMappingURL=waitClickable.js.map