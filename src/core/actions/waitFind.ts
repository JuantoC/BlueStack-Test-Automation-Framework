import { WebDriver, until, WebElement, Locator, error } from "selenium-webdriver";
import { RetryOptions, DefaultConfig } from "../config/defaultConfig.js";
import { stackLabel } from "../utils/stackLabel.js";
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