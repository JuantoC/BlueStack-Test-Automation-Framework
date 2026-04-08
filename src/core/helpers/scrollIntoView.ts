import { WebElement } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../config/defaultConfig.js";
import { retry } from "../wrappers/retry.js";
import logger from "../utils/logger.js";
import { getErrorMessage } from "../utils/errorUtils.js";

/**
 * Desplaza el viewport del navegador hasta que el elemento sea visible.
 * Posee capacidad de reintento autónoma o suprimida por orquestadores.
 * * @param element - El WebElement objetivo del scroll.
 * @param opts - Opciones de reintento y trazabilidad.
 * @returns El mismo WebElement para permitir encadenamiento.
 */
export async function scrollIntoView(
  element: WebElement,
  opts: RetryOptions = {}
): Promise<WebElement> {
  const config = resolveRetryConfig(opts, 'scrollIntoView');

  return await retry(async () => {
    try {
      logger.debug(`Ejecutando scrollIntoView vía script JS...`, {
        label: config.label
      });

      const driver = element.getDriver();

      await driver.executeScript("arguments[0].scrollIntoView(true);", element);

      logger.debug(`Scroll completado con éxito.`, { label: config.label });
      return element;

    } catch (error: unknown) {
      logger.error(`Fallo scroll (reintentable): ${getErrorMessage(error)}`, { label: config.label, error: getErrorMessage(error) });
      throw new Error(`scrollIntoView falló: ${getErrorMessage(error)}`);
    }
  }, config);
}