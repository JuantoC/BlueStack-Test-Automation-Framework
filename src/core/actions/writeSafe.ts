import { WebDriver, WebElement, Locator } from "selenium-webdriver";
import { retry } from "../wrappers/retry.js"
import { RetryOptions } from "../config/default.js";
import { writeToEditable, writeToStandard } from "../utils/write.js";
import { isContentEditable } from "../utils/isContentEditable.js";
import { stackLabel } from "../utils/stackLabel.js";
import { clickSafe } from "./clickSafe.js";

/**
 * Escribe un texto de forma segura en un campo de entrada.
 * Combina waitFind, clickSafe, y luego limpia el campo y sube los.
 * @param driver La instancia del WebDriver.
 * @param locator El Locator (By) del campo de entrada.
 * @param text El texto a escribir.
 * @param timeout Tiempo máximo de espera.
 * @param opts Opciones de reintento adicionales.
 * @returns Una promesa que resuelve con el WebElement después de escribir.
 */
export async function writeSafe(driver: WebDriver, locator: Locator, text: string, timeout: number = 1500, opts: RetryOptions = {}): Promise<WebElement> {
  const fullOpts = { ...opts, label: stackLabel(opts.label, `[writeSafe]`) };

  console.log(`[writeSafe]`);
  return await retry<WebElement>(
    async () => {
      try {
        const element = await clickSafe(driver, locator, timeout, fullOpts);
        const isEditable = await isContentEditable(element);

        console.log(`[writeSafe] Escribiendo ...`);
        if (isEditable) {
          await writeToEditable(element, text)
        } else {
          await writeToStandard(element, text)
        }
        console.log(`[writeSafe] Exito Escritura.`)
        return element;
      } catch (error: any) {
        console.error(`[${fullOpts}] Falla en escritura: ${error.message}`);
        throw error;
      }
    }
  ,fullOpts)
}