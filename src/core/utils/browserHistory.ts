import { WebDriver } from "selenium-webdriver";
import { stackLabel } from "../utils/stackLabel.js";
import logger from "../utils/logger.js";
import { RetryOptions } from "../config/defaultConfig.js";
import { getErrorMessage } from "../utils/errorUtils.js";

/**
 * Navega en el historial del navegador hacia adelante o hacia atrás.
 * Equivalente programático a los botones de navegación del browser. Incluye logging de trazabilidad.
 *
 * @param driver - Instancia activa de WebDriver para la sesión actual.
 * @param direction - Dirección de la navegación: `"back"` retrocede, `"forward"` avanza.
 * @param opts - Opciones de trazabilidad y configuración de la sesión.
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

  } catch (error: unknown) {
    logger.error(`Error al intentar navegar hacia ${direction}: ${getErrorMessage(error)}`, {
      label: config.label
    });
    throw error;
  }
}