import { WebElement } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../config/default.js";
import { stackLabel } from "../utils/stackLabel.js";
import { retry } from "../wrappers/retry.js";
import logger from "../utils/logger.js";

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
  const config = {
    ...DefaultConfig,
    ...opts,
    label: stackLabel(opts.label, "scrollIntoView"),
  };

  return await retry(async () => {
    try {
      logger.debug(`Ejecutando scrollIntoView vía script JS...`, {
        label: config.label
      });

      const driver = element.getDriver();

      // 'true' alinea la parte superior del elemento con el viewport.
      await driver.executeScript("arguments[0].scrollIntoView(true);", element);

      logger.debug(`Scroll completado con éxito.`, { label: config.label });
      return element;

    } catch (error: any) {
      logger.debug(`Fallo scroll (reintentable): ${error.message}`, { label: config.label });
      error.message = `scrollIntoView falló: ${error.message}`;
      throw error;
    }
  }, config);
}