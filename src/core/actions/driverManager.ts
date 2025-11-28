import { Builder, WebDriver, Capabilities } from 'selenium-webdriver';
import { ServiceBuilder } from 'selenium-webdriver/chrome.js';
import { setChromeOptions } from "../config/chromeOptions.js";
import { DriverOptions } from "../config/chromeOptions.js";
import { sleep } from '../utils/backOff.js';

/**
 * Inicializa y configura la instancia de WebDriver.
 * @param options isHeadless: boolean
 * @returns Una promesa que resuelve con la instancia configurada de WebDriver.
 */
export async function initializeDriver(options: DriverOptions): Promise<WebDriver> {
    console.log(`[initializeDriver]: Inicializando WebDriver (Chrome; Headless: ${options.isHeadless})...`);

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

    console.log('[initializeDriver] WebDriver inicializado.');
    return driver;
}

/**
 * Cierra el navegador y termina la sesión de WebDriver.
 * @param driver La instancia del WebDriver a cerrar.
 */
export async function quitDriver(driver: WebDriver, time?: number): Promise<void> {
    console.log('[quitDriver] Cerrando WebDriver...');
    if (driver) {
        if (time) {
            await sleep(time);
        }
        await driver.quit();
        console.log('[quitDriver] WebDriver cerrado exitosamente.');
    }
}