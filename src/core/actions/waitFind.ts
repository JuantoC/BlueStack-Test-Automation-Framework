import { WebDriver, until, WebElement, Locator, error } from "selenium-webdriver";
import { RetryOptions, DefaultConfig } from "../config/defaultConfig.js";
import { stackLabel } from "../utils/stackLabel.js";
import logger from "../utils/logger.js";
import { retry } from "../wrappers/retry.js";

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
export async function waitFind(
  driver: WebDriver,
  locator: Locator,
  opts: RetryOptions = {}
): Promise<WebElement> {

  const config = {
    ...DefaultConfig,
    ...opts,
    label: stackLabel(opts.label, `waitFind`)
  };
  return await retry(async () => {
    try {

      const element = await driver.wait(
        until.elementLocated(locator),
        config.timeoutMs
      );
      return element;
    } catch (err) {
      throw err;
    }
  }, config);
}