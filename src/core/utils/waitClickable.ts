import { WebDriver, WebElement, error } from "selenium-webdriver";
import { RetryOptions, retry } from "../wrappers/retry.js";
import { stackLabel } from "./stackLabel.js";
import { waitVisible } from "./waitVisible.js";
import { waitEnabled } from "./waitEnabled.js";

export async function waitClickable(driver: WebDriver, element: WebElement, timeout: number = 1500, opts: RetryOptions = {}): Promise<WebElement> {
  if (!element || typeof element.getId !== "function") {
    throw new Error("Expected a WebElement but received: " + element.toString());
  }
  const fullOpts = { ...opts, label: stackLabel(opts.label, `waitClickable: ${(element.toString())}`) };

  console.log(`${fullOpts.label}.`);
  return retry<WebElement>(
    async () => {
      try {
        console.log(`waitClickable:${(element.toString())} Esperando...`);
        await waitVisible(driver, element, timeout, fullOpts);
        await waitEnabled(driver, element, timeout, fullOpts);
        console.log(`waitClickable:${(element.toString())} Elemento clickable.`);
        return element;
      } catch (err) {
        if (err instanceof error.TimeoutError) {
          console.error(`ERROR en waitClickable. Elemento no clickable en ${timeout / 1000}s`);
        }
        throw err;
      }
    }, fullOpts);
}