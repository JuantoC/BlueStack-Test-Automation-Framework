import { WebDriver, until, WebElement, error } from "selenium-webdriver";
import { retry } from '../wrappers/retry';
import { RetryOptions } from '../wrappers/retry.js';
import { stackLabel } from "./stackLabel.js";

/**
 * Espera a que un WebElement (ya encontrado) esté habilitado para la interacción.
 * @param driver La instancia del WebDriver.
 * @param element El WebElement encontrado para verificar si está habilitado.
 * @param timeout El tiempo máximo de espera en milisegundos (default: 1.5s).
 * @param opts Opciones de reintento.
 * @returns Una promesa que resuelve con el mismo WebElement una vez que está habilitado.
 */
export async function waitEnabled(driver: WebDriver, element: WebElement, timeout: number = 1500, opts: RetryOptions = {}): Promise<WebElement> {
  const elementLabel = element ? element.toString() : JSON.stringify(element);
  const fullOpts = { ...opts, label: stackLabel(opts.label, `waitEnabled: ${elementLabel}`) };

  console.log(`${fullOpts.label}.`);
  return retry<WebElement>(
    async () => {
      try {
        console.log(`waitEnabled:${elementLabel} Esperando...`);
        await driver.wait(
          until.elementIsEnabled(element),
          timeout, `Elemento no habilitado: ${elementLabel} en ${timeout / 1000}s`);
        console.log(`waitEnabled:${elementLabel} Elemento está habilitado.`);
        return element;
      } catch (err) {
        if (err instanceof error.TimeoutError) {
          console.error(`ERROR en waitEnabled. Elemento no habilitado en ${timeout / 1000}s`);
        }
        throw err;
      }
    }, fullOpts);
}