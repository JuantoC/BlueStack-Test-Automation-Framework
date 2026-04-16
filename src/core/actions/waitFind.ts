import { WebDriver, until, WebElement, Locator, error } from "selenium-webdriver";
import { RetryOptions, resolveRetryConfig } from "../config/defaultConfig.js";
import logger from "../utils/logger.js";
import { retry } from "../wrappers/retry.js";
import { getErrorMessage } from "../utils/errorUtils.js";

/**
 * Localiza un elemento en el DOM esperando a que esté presente, con reintentos automáticos.
 * Punto de entrada estándar para la búsqueda de elementos cuando solo se dispone de un Locator.
 * Usada internamente por `clickSafe` y otros orquestadores cuando el ID no es un WebElement.
 *
 * @param driver - Instancia activa de WebDriver para la sesión actual.
 * @param locator - Locator de Selenium que define la estrategia de búsqueda del elemento.
 * @param opts - Opciones de reintento y trazabilidad. Propagadas a todos los sub-llamados internos.
 * @returns {Promise<WebElement>} El WebElement localizado una vez que está presente en el DOM.
 */
export async function waitFind<T extends WebElement = WebElement>(
  driver: WebDriver,
  locator: Locator,
  opts: RetryOptions = {}
): Promise<T> {

  const config = resolveRetryConfig(opts, 'waitFind');
  return await retry(async () => {
    try {

      const element = await driver.wait(
        until.elementLocated(locator),
        config.timeoutMs
      );
      return element as T;
    } catch (err) {
      logger.debug(`Fallo en intento (retry lo manejará): ${getErrorMessage(err)}`, { label: config.label });
      throw err;
    }
  }, config);
}