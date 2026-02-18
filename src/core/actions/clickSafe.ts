import { WebDriver, WebElement, Locator } from "selenium-webdriver";
import { retry } from "../wrappers/retry.js";
import { RetryOptions, DefaultConfig } from "../config/default.js";
import { stackLabel } from "../utils/stackLabel.js";
import logger from "../utils/logger.js";
import { waitFind } from "../utils/waitFind.js"; 
import { waitClickable } from "../utils/waitClickable.js"; 

/**
 * Realiza un clic resitente a la inestabilidad del DOM (flakiness).
 * Orquesta la búsqueda, validación de estado y el clic físico en un único bloque de reintento.
 */
export async function clickSafe(
  driver: WebDriver,
  locator: Locator,
  opts: RetryOptions = {}
): Promise<WebElement> {

  // Fusionamos opciones y generamos un label de trazabilidad
  const config = {
    ...DefaultConfig,
    ...opts,
    label: stackLabel(opts.label, `clickSafe`)
  };

  return await retry(async () => {
    // 1. Preparamos las opciones para las piezas internas.
    const internalOpts = { ...config, supressRetry: true };
    try {
      // 2. Localización
      const element = await waitFind(driver, locator, internalOpts);

      // 3. Sincronización: Espera a que no haya loaders o animaciones bloqueantes.
      logger.debug(`Verificando estado interactuable...`, { label: config.label });
      await waitClickable(driver, element, internalOpts);

      // 4. Ejecución
      await element.click();

      logger.debug(`Click ejecutado correctamente`, { label: config.label });
      return element;

    } catch (error: any) {
      throw error;
    }
  }, config);
}