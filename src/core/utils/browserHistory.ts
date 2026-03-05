import { WebDriver } from "selenium-webdriver";
import { stackLabel } from "../utils/stackLabel.js";
import logger from "../utils/logger.js";
import { RetryOptions } from "../config/defaultConfig.js";

/**
 * Navega en el historial del navegador hacia adelante o hacia atrás.
 * * @param driver - La instancia activa de WebDriver.
 * @param direction - La dirección de navegación: "back" o "forward".
 * @param label - (Opcional) Identificador para la trazabilidad de logs.
 */
export async function browserHistory(
  driver: WebDriver,
  direction: "back" | "forward",
  opts: RetryOptions
): Promise<void> {
  const config = {
    ...opts,
    label: stackLabel(opts.label, "browserHistory"),
  };

  try {
    logger.debug(`Ejecutando navegación de historial: ${direction}`, {
      label: config.label
    });

    if (direction === "back") {
      await driver.navigate().back();
    } else {
      await driver.navigate().forward();
    }

    logger.info(`Navegación '${direction}' completada con éxito`, {
      label: config.label
    });

  } catch (error: any) {
    logger.error(`Error al intentar navegar hacia ${direction}: ${error.message}`, {
      label: config.label
    });
    throw error;
  }
}