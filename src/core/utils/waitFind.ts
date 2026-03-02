import { WebDriver, until, WebElement, Locator, error } from "selenium-webdriver";
import { RetryOptions, DefaultConfig } from "../config/default.js";
import { stackLabel } from "./stackLabel.js";
import logger from "../utils/logger.js";
import { retry } from "../wrappers/retry.js";

/**
 * Localiza un elemento en el DOM esperando a que esté presente.
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
      logger.debug(`Buscando elemento: ${JSON.stringify(locator)}`, { label: config.label });

      // until.elementLocated verifica la presencia del elemento en el DOM (independientemente de su visibilidad)
      const element = await driver.wait(
        until.elementLocated(locator),
        config.timeoutMs
      );
      logger.debug(`Elemento encontrado`, { label: config.label });
      return element;
    } catch (err) {
      // Propagamos el error para que sea el orquestador quien lo maneje
      throw err;
    }
  }, config);
}