import { WebDriver, WebElement, Locator } from "selenium-webdriver";
import { RetryOptions, DefaultConfig } from "../config/default.js";
import { writeToEditable, writeToStandard } from "../utils/write.js";
import { isContentEditable } from "../utils/isContentEditable.js";
import { stackLabel } from "../utils/stackLabel.js";
import { clickSafe } from "./clickSafe.js";
import logger from "../utils/logger.js";
import { retry } from "../wrappers/retry.js";

/**
 * Orquestador de alto nivel para escribir texto.
 * Asegura la interactuabilidad delegando en clickSafe y selecciona la estrategia 
 * de escritura (DOM vs. ContentEditable) dinámicamente.
 * * @param driver - Instancia activa de WebDriver.
 * @param locator - Selector del elemento objetivo.
 * @param text - Cadena de texto a ingresar.
 * @param opts - Opciones de reintento y trazabilidad.
 */
export async function writeSafe(
  driver: WebDriver,
  locator: Locator,
  text: string,
  opts: RetryOptions = {}
): Promise<WebElement> {
  const config = {
    ...DefaultConfig,
    ...opts,
    label: stackLabel(opts.label, "writeSafe"),
  };

  return await retry(async () => {
    // Desactivamos reintentos internos en los sub-pasos para que el orquestador controle el flujo.
    const internalOpts = { ...config, supressRetry: true };

    try {
      logger.debug(`Iniciando flujo de escritura para: ${locator.toString()}`, {
        label: config.label,
      });

      // 1. Preparación: Click previo para ganar foco y asegurar visibilidad.
      const element = await clickSafe(driver, locator, internalOpts);

      // 2. Identificación: Determinamos la naturaleza del input.
      const isEditable = await isContentEditable(element);

      logger.debug(`Modo de escritura detectado: ${isEditable ? "ContentEditable" : "Standard"}`, {
        label: config.label,
      });

      // 3. Ejecución: Acción atómica de escritura.
      if (isEditable) {
        await writeToEditable(element, text);
      } else {
        await writeToStandard(element, text);
      }

      logger.info(`Texto ingresado correctamente en el elemento`, {
        label: config.label,
        text: text.length > 20 ? `${text.substring(0, 20)}...` : text // Logueo seguro de datos
      });

      return element;
    } catch (error: any) {
      // Si el error ocurre dentro de un reintento que no es el último, usamos WARN.
      // El logger.error definitivo se reserva para cuando la excepción sale del wrapper 'retry'.
      logger.warn(`Intento de escritura fallido: ${error.message}`, {
        label: config.label,
      });
      throw error;
    }
  }, config);
}