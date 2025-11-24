import { WebDriver, until, WebElement, Locator, error } from "selenium-webdriver";
import { retry } from '../wrappers/retry';
import { RetryOptions } from '../wrappers/retry.js';
import { stackLabel } from "./stackLabel.js";


/**
 * Espera a que un elemento sea ubicado en el DOM por su Locator.
 * @param driver La instancia del WebDriver.
 * @param locator El objeto By (e.g., By.css('...'), By.xpath('...')) que identifica el elemento.
 * @param timeout El tiempo máximo de espera en milisegundos (default: 1.5s).
 * @param opts Opciones de reintento.
 * @returns Una promesa que resuelve con el WebElement una vez ubicado.
 */
export async function waitFind(driver: WebDriver, locator: Locator, timeout: number = 1500, opts: RetryOptions = {}): Promise<WebElement> {
  const locatorLabel = typeof locator === 'string' ? locator : JSON.stringify(locator);
  const fullOpts = { ...opts, label: stackLabel(opts.label, `waitFind: ${locatorLabel}`) };

console.log(`[${fullOpts.label}]`);
return retry(
  () => {
    try {
      console.log(`Buscando: ${fullOpts.label}.`);
      const element = driver.wait(until.elementLocated(locator), timeout, `Elemento no encontrado: ${locatorLabel} en ${timeout / 1000}s`);
      console.log(`Exito: ${locatorLabel}.`);
      return element;
    } catch (err) {
      if (err instanceof error.TimeoutError) {
        throw new Error(`Elemento no encontrado: ${locatorLabel} en ${timeout / 1000}s`);
      }
      throw err;
    }
  }, fullOpts
); 
}
