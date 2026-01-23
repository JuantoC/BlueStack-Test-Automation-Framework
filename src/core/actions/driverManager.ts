import { Builder, WebDriver, Capabilities } from 'selenium-webdriver';
import { ServiceBuilder } from 'selenium-webdriver/chrome.js';
import { setChromeOptions, DriverOptions } from "../config/chromeOptions.js";
import { sleep } from '../utils/backOff.js';
import { stackLabel } from "../utils/stackLabel.js";
import logger from "../utils/logger.js";

/**
 * Inicializa y configura la instancia de WebDriver con Chrome.
 * Implementa una espera implícita base y configuración de servicio.
 * * @param options - Configuración de ejecución (Headless, Window size, etc.)
 * @returns Instancia de WebDriver lista para operar.
 */
export async function initializeDriver(options: DriverOptions): Promise<WebDriver> {
    const label = '[initializeDriver]';

    logger.debug(`Configurando entorno de ejecución (Headless: ${options.isHeadless})`, { label });

    try {
        // Nota: Se recomienda que driverPath sea inyectado vía variables de entorno en CI/CD
        const driverPath = './node_modules/chromedriver/lib/chromedriver/chromedriver.exe';
        const serviceBuilder = new ServiceBuilder(driverPath);
        const chromeOptions = setChromeOptions(options);

        const driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(chromeOptions)
            .setChromeService(serviceBuilder)
            .withCapabilities(Capabilities.chrome())
            .build();

        // Configuración de estabilidad inicial
        await driver.manage().setTimeouts({ implicit: 3000 });

        logger.info('Sesión de WebDriver iniciada correctamente', { label });
        return driver;

    } catch (error: any) {
        logger.error(`Error fatal al inicializar el Driver: ${error.message}`, { label });
        throw error;
    }
}

/**
 * Finaliza la sesión del WebDriver de forma segura.
 * * @param driver - Instancia activa de WebDriver.
 * @param time - Tiempo de espera opcional antes del cierre (ms).
 */
export async function quitDriver(driver: WebDriver | null, time?: number): Promise<void> {
    const label = '[quitDriver]';

    if (!driver) {
        logger.warn('Se intentó cerrar un Driver que no está inicializado o es nulo', { label });
        return;
    }

    try {
        if (time) {
            logger.debug(`Esperando ${time}ms antes de finalizar sesión...`, { label });
            await sleep(time);
        }

        await driver.quit();
        logger.info('Sesión de WebDriver cerrada exitosamente', { label });

    } catch (error: any) {
        // En este punto, un error suele indicar que el proceso ya estaba cerrado o es huérfano
        logger.warn(`No se pudo cerrar la sesión limpiamente: ${error.message}`, { label });
    }
}