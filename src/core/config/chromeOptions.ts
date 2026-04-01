import { Options as ChromeOptions } from 'selenium-webdriver/chrome.js';

/**
 * Opciones de configuración del WebDriver Chrome para cada sesión de prueba.
 * Determina el modo de ejecución (headless o GUI) y la conexión al Selenium Grid.
 * Consumida por `setChromeOptions` e `initializeDriver`.
 */
export interface DriverOptions {
    isHeadless: boolean;
    useGrid?: boolean;
    gridUrl?: string;
}

/**
 * Define las opciones específicas para Chrome.
 * @param options Opciones de configuración del driver.
 * @returns Un objeto ChromeOptions configurado para silencio total.
 */
export function setChromeOptions(options: DriverOptions): ChromeOptions {
    const chromeOptions = new ChromeOptions();

    if (options.isHeadless) {
        chromeOptions.addArguments('--headless=new');
    }
    if (!options.isHeadless) {
        chromeOptions.addArguments('--start-maximized');
    }
    chromeOptions.addArguments(
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1400,900'
    );

    return chromeOptions;
}

