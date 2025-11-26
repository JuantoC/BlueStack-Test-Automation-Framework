import { Builder, Capabilities } from 'selenium-webdriver';
import { ServiceBuilder } from 'selenium-webdriver/chrome.js';
import { setChromeOptions } from '../config/chromeOptions.js';
/**
 * Inicializa y configura la instancia de WebDriver.
 * @param options isHeadless: boolean
 * @returns Una promesa que resuelve con la instancia configurada de WebDriver.
 */
export async function initializeDriver(options) {
    console.log(`Inicializando WebDriver (Chrome, Headless: ${options.isHeadless})...`);
    const driverPath = './node_modules/chromedriver/lib/chromedriver/chromedriver';
    const serviceBuilder = new ServiceBuilder(driverPath);
    const chromeOptions = setChromeOptions(options);
    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .withCapabilities(Capabilities.chrome())
        .setChromeService(serviceBuilder)
        .build();
    await driver.manage().setTimeouts({ implicit: 3000 });
    console.log('WebDriver inicializado.');
    return driver;
}
/**
 * Cierra el navegador y termina la sesión de WebDriver.
 * @param driver La instancia del WebDriver a cerrar.
 */
export async function quitDriver(driver) {
    console.log('Cerrando WebDriver...');
    if (driver) {
        await driver.quit();
        console.log('WebDriver cerrado exitosamente.');
    }
}
//# sourceMappingURL=driverManager.js.map