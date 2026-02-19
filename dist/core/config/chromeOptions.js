import { Options as ChromeOptions } from 'selenium-webdriver/chrome.js';
/**
 * Define las opciones específicas para Chrome.
 * @param options Opciones de configuración del driver.
 * @returns Un objeto ChromeOptions configurado para silencio total.
 */
export function setChromeOptions(options) {
    const chromeOptions = new ChromeOptions();
    if (options.isHeadless) {
        chromeOptions.addArguments('--headless=new');
    }
    chromeOptions.addArguments('--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--window-size=1400,900');
    return chromeOptions;
}
//# sourceMappingURL=chromeOptions.js.map