import { WebDriver, WebElement, error } from "selenium-webdriver";
import { retry } from '../wrappers/retry';
import { RetryOptions } from '../wrappers/retry.js';
import { stackLabel } from "./stackLabel.js";
import { waitVisible } from "./waitVisible";
import { waitEnabled } from "./waitEnabled";

export async function waitClickable(driver: WebDriver, element: WebElement, timeout: number = 1500, opts: RetryOptions = {}): Promise<WebElement> {
    const elementLabel = element ? element.toString() : JSON.stringify(element);
    const fullOpts = { ...opts, label: stackLabel(opts.label, `waitClickable: ${elementLabel}`) };

    console.log(`${fullOpts.label}.`);  
    return retry<WebElement>(
        async () => {
            try {
                console.log(`waitClickable:${elementLabel} Esperando...`);
                await waitVisible(driver, element, timeout, fullOpts);
                await waitEnabled(driver, element, timeout, fullOpts);
                console.log(`waitClickable:${elementLabel} Elemento está clickable.`);
                return element;
            } catch (err) {
                if (err instanceof error.TimeoutError) {
                    console.error(`ERROR en waitClickable. Elemento no clickable en ${timeout / 1000}s`);
                }
                throw err;
            }
        }, fullOpts);
}