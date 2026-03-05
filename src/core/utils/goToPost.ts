import { WebDriver } from "selenium-webdriver";
import { postUrl } from "./routes.js";
import { stackLabel } from "./stackLabel.js";
import { DefaultConfig, RetryOptions } from "../config/defaultConfig.js";
import logger from "./logger.js";
import { step } from "allure-js-commons";

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
  const config = {
    ...DefaultConfig,
    ...opts,
    label: stackLabel(opts.label, "goToPost")
  };
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

    } catch (error: any) {
      logger.error(`Fallo en la navegación al post ${id}: ${error.message}`, {
        label: config.label,
        metadata: { url, id }
      });

      throw error;
    }
  });
}