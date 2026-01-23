import { Builder, WebDriver, Capabilities } from 'selenium-webdriver';
import { ServiceBuilder } from 'selenium-webdriver/chrome.js';
import { setChromeOptions, DriverOptions } from "../config/chromeOptions.js";
import { sleep } from '../utils/backOff.js';
import { stackLabel } from "../utils/stackLabel.js";
import { RetryOptions, DefaultConfig } from "../config/default.js";
import logger from "../utils/logger.js";

/**
 * Gestiona el ciclo de vida del WebDriver.
 */

export async function initializeDriver(options: DriverOptions, opts: RetryOptions = {}): Promise<WebDriver> {
    const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "initializeDriver") };

    logger.debug(`Configurando navegador (Headless: ${options.isHeadless})`, { label: config.label });

    try {
        const chromeOptions = setChromeOptions(options);

        // Selenium 4 gestiona el driver automáticamente. 
        // Solo usamos ServiceBuilder si necesitamos pasar argumentos específicos al proceso del driver.
        const driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(chromeOptions)
            .withCapabilities(Capabilities.chrome())
            .build();

        /**
         * REGLA SENIOR: Evitamos timeouts implícitos globales. 
         * Confiamos en nuestras piezas Lego (writeSafe, clickSafe) que ya manejan 
         * sus propias esperas explícitas. Esto hace que el test sea mucho más rápido.
         */
        await driver.manage().setTimeouts({
            pageLoad: 30000, // Tiempo límite para que cargue la URL
            script: 30000    // Tiempo límite para ejecución de JS
        });

        logger.info('Sesión de WebDriver iniciada y lista para operar', { label: config.label });
        return driver;

    } catch (error: any) {
        logger.error(`Error crítico al inicializar WebDriver: ${error.message}`, { label: config.label });
        throw error;
    }
}

/**
 * Finaliza la sesión del WebDriver de forma segura.
 * @param driver - Instancia activa.
 * @param opts - Opciones para trazabilidad y posible delay de observación.
 */
export async function quitDriver(driver: WebDriver | null, opts: RetryOptions = {}): Promise<void> {
    const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "quitDriver") };

    if (!driver) {
        logger.warn('Intento de cierre sobre un driver nulo o inexistente', { label: config.label });
        return;
    }

    try {
        // Si el usuario pasó un timeoutMs, esperamos antes de cerrar. 
        // Útil para ver el estado final de la UI antes de que desaparezca la ventana.
        if (opts.timeoutMs) {
            logger.debug(`Delay de observación activo: esperando ${opts.timeoutMs}ms`, { label: config.label });
            await sleep(opts.timeoutMs);
        }

        await driver.quit();
        logger.info('Sesión finalizada exitosamente', { label: config.label });

    } catch (error: any) {
        // No lanzamos error aquí para no interrumpir el cierre del proceso de Node
        logger.warn(`Cierre de sesión no limpio (posible proceso huérfano): ${error.message}`, { label: config.label });
    }
}