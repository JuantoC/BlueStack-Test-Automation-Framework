import { WebDriver, WebElement, Locator } from "selenium-webdriver";
import { RetryOptions } from "../config/defaultConfig.js";
import { writeToEditable, writeToStandard } from "../helpers/write.js";
import { isContentEditable } from "../helpers/isContentEditable.js";
import { stackLabel } from "../utils/stackLabel.js";
import { clickSafe } from "./clickSafe.js";
import logger from "../utils/logger.js";
import { retry } from "../wrappers/retry.js";
import { assertValueEquals } from "./assertValueEquals.js";

/**
 * Orquestador de alto nivel para escribir texto.
 * Asegura la interactuabilidad delegando en clickSafe y selecciona la estrategia 
 * de escritura (DOM vs. ContentEditable) dinámicamente.
 * @param driver - Instancia activa de WebDriver.
 * @param ID - Locator o WebElement del elemento objetivo.
 * @param text - Cadena de texto a ingresar.
 * @param opts - Opciones de reintento y trazabilidad.
 * @returns {Promise<WebElement>} El elemento objetivo con el texto ingresado.
 */
export async function writeSafe(
  driver: WebDriver,
  ID: Locator | WebElement,
  text: string,
  opts: RetryOptions = {}
): Promise<WebElement> {
  const config = {
    ...opts,
    label: stackLabel(opts.label, "writeSafe"),
  };
  const identifierLabel = typeof ID === "object" && "toString" in ID ? ID.toString() : "WebElement";


  return await retry(async () => {
    const internalOpts = { ...config, supressRetry: true };

    // 1. Preparación: Click previo para ganar foco y asegurar visibilidad.
    const element = await clickSafe(driver, ID, internalOpts);

    // 2. Identificación: Determinamos la naturaleza del input.
    const isEditable = await isContentEditable(element);

    // 3. Ejecución: Acción atómica de escritura.
    if (isEditable) {
      await writeToEditable(element, text, config.label);
    } else {
      await writeToStandard(element, text, config.label);
    }

    // 4. Verificación: Confirmamos que el texto se haya ingresado correctamente.
    await assertValueEquals(element, text, internalOpts);

    logger.debug(`Texto ingresado correctamente en el elemento`, {
      label: config.label,
      text: text.length > 20 ? `${text.substring(0, 20)}...` : text
    });

    return element;
  }, config);
}