import { WebDriver } from "selenium-webdriver";
import { postUrl } from "./routes.js";
import { stackLabel } from "./stackLabel.js";
import { DefaultConfig, resolveRetryConfig, RetryOptions } from "../config/defaultConfig.js";
import logger from "./logger.js";
import { step } from "allure-js-commons";
import { getErrorMessage } from "./errorUtils.js";

/**
 * Navega directamente a la página de edición de un post específico.
 * * @param driver - Instancia activa de WebDriver.
 * @param baseURL - URL base del entorno.
 * @param id - Identificador único del post.
 * @param opts - Opciones de trazabilidad y configuración.
 */
export async function goToPost(
  driver: WebDriver,
  baseURL: string,
  id: number | string,
  opts: RetryOptions = {}
): Promise<void> {
  const config = resolveRetryConfig(opts, 'goToPost');
  const url = postUrl(baseURL, id);


  step(config.label, async (stepContext) => {
    stepContext.parameter('url', `${url}`);
    stepContext.parameter('id', `${id}`);
    try {
      logger.debug(`Navegando a Post ID: ${id}. URL: ${url}`, {
        label: config.label
      });

      await driver.navigate().to(url);

      logger.info(`Navegación completada al post [ID: ${id}]`, {
        label: config.label
      });

    } catch (error: unknown) {
      logger.error(`Fallo en la navegación al post ${id}: ${getErrorMessage(error)}`, {
        label: config.label,
        metadata: { url, id }
      });

      throw error;
    }
  });
}