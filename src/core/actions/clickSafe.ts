import { WebDriver, until, WebElement, Locator } from "selenium-webdriver";
import { retry } from '../wrappers/retry';
import { RetryOptions } from '../wrappers/retry';
import { stackLabel } from "../utils/stackLabel";
import { waitClickable } from "../utils/waitClickable";

/**
 * Realiza un clic seguro en un elemento.
 * Combina las esperas de 'Find' y 'Visible' y espera a que el elemento esté habilitado.
 * @param driver La instancia del WebDriver.
 * @param element El WebElement donde se realizará el clic.
 * @param timeout Tiempo máximo de espera para  encontrar el elemento (default: 1.5s).
 * @param opts Objeto de ppciones de reintento (ej. retries, label).
 * @returns Una promesa que resuelve con el WebElement después del clic.
 */
export async function clickSafe(driver: WebDriver, element: WebElement, timeout: number = 1500, opts: RetryOptions = {}): Promise<WebElement> {
  const elementLabel = typeof element === 'string' ? element : JSON.stringify(element);
  const fullOpts = { ...opts, label: stackLabel(opts.label, `clickSafe: ${elementLabel}`) };

  console.log(`${fullOpts.label}`);
  return retry(
    async () => {
      try {
        await waitClickable(driver, element, timeout, fullOpts);
        console.log(`Realizando click en: ${elementLabel}.`);
        await element.click();
        console.log(`Exito click: ${elementLabel}.`);

        return element;
      } catch (error: any) {
        console.error(`${fullOpts.label} Falla en click: ${error.message}`);
        throw error;
      }
    },
    fullOpts
  )
}