import { WebDriver, until, WebElement, error } from "selenium-webdriver";
import { RetryOptions, DefaultConfig } from "../config/defaultConfig.js";
import { stackLabel } from "../utils/stackLabel.js";
import logger from "../utils/logger.js";
import { retry } from "../wrappers/retry.js";

/**
 * Verifica que el elemento no esté en estado 'disabled' en el DOM.
 * Es el último paso de validación antes de intentar una interacción física.
 */
export async function waitEnabled(
  driver: WebDriver,
  element: WebElement,
  opts: RetryOptions = {}
): Promise<WebElement> {

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
      await driver.wait(until.elementIsEnabled(element), config.timeoutMs);

      return element;
    } catch (err) {
      if (err instanceof error.TimeoutError) {
        logger.error(`Timeout: El elemento permaneció deshabilitado tras ${config.timeoutMs / 1000}s`, {
          label: config.label
        });
      }
      throw err;
    }
  }, config);
}