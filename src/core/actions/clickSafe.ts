import { WebDriver, WebElement, Locator } from "selenium-webdriver";
import { RetryOptions, retry } from "../wrappers/retry.js";
import { stackLabel } from "../utils/stackLabel.js";
import { waitClickable } from "../utils/waitClickable.js";
import { waitFind } from "../utils/waitFind.js";

/**
 * Realiza un clic seguro en un elemento.
 * Combina las esperas de 'Find' y 'Visible' y espera a que el elemento esté habilitado.
 * @param driver La instancia del WebDriver.
 * @param locator El WebElement donde se realizará el clic.
 * @param timeout Tiempo máximo de espera para  encontrar el elemento (default: 1.5s).
 * @param opts Objeto de ppciones de reintento (ej. retries, label).
 * @returns Una promesa que resuelve con el WebElement después del clic.
 */
export async function clickSafe(driver: WebDriver, locator: Locator, timeout: number = 1500, opts: RetryOptions = {}): Promise<WebElement> {
  const fullOpts = { ...opts, label: stackLabel(opts.label, `[clickSafe]: ${JSON.stringify(locator)}`) };

  console.log(`[clickSafe]: ${JSON.stringify(locator)}`);
  return retry(
    async () => {
      try {
        const element = await waitFind(driver, locator, timeout, fullOpts);
        
        console.log(`[clickSafe] Realizando click...`);
        await waitClickable(driver, element, timeout, fullOpts);
        await element.click()
        console.log(`[clickSafe] Exito click.`);

        return element;
      } catch (error: any) {
        console.error(`[${fullOpts.label}] Falla en click: ${error.message}`);
        throw error;
      }
    },
    fullOpts
  )
}