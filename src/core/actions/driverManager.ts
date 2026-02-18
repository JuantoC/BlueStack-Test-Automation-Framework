/**
 * Gestiona el ciclo de vida del WebDriver.
 */
export async function initializeDriver(options: DriverOptions, opts: RetryOptions = {}): Promise<DriverSession> {
    const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "initializeDriver") };

    logger.debug(`Configurando navegador (Headless: ${options.isHeadless})`, { label: config.label });

    try {
        const chromeOptions = setChromeOptions(options);

        // Selenium 4 gestiona el driver automáticamente. 
        // Solo usamos ServiceBuilder si necesitamos pasar argumentos específicos al proceso del driver.
        const service = new ServiceBuilder()
            .setStdio('ignore'); // Evita logs innecesarios del driver

        const driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(chromeOptions)
            .setChromeService(service)
            .build();

        await driver.manage().setTimeouts({
            pageLoad: 30000, // Tiempo límite para que cargue la URL
            script: 30000    // Tiempo límite para ejecución de JS
        });

        const networkMonitor = await startNetworkMonitoring(driver, config.label);

        logger.info('Sesión de WebDriver iniciada y lista para operar', { label: config.label });
        return {
            driver,
            networkMonitor
        };

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
export async function quitDriver(session: DriverSession | null, opts: RetryOptions = {}): Promise<void> {
    const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "quitDriver") };

    if (!session?.driver) {
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

        await session.networkMonitor?.stop();
        await session.driver.quit();
        logger.info('Sesión finalizada exitosamente', { label: config.label });

    } catch (error: unknown) {
        if (error instanceof Error && error.message.includes('NoSuchSession')) {
            logger.warn('Sesión ya estaba cerrada.', { label: config.label });
        } else {
            logger.warn(`Cierre no limpio: ${(error as Error)?.message}`, { label: config.label });
        }
    }
}
export interface DriverSession {
    driver: WebDriver;
    networkMonitor: NetworkMonitorHandle | null;
}


import { Builder, WebDriver, Capabilities } from 'selenium-webdriver';
import { ServiceBuilder } from 'selenium-webdriver/chrome.js';
import { setChromeOptions, DriverOptions } from "../config/chromeOptions.js";
import { sleep } from '../utils/backOff.js';
import { stackLabel } from "../utils/stackLabel.js";
import { RetryOptions, DefaultConfig } from "../config/default.js";
import logger from "../utils/logger.js";
import { NetworkMonitorHandle, startNetworkMonitoring } from '../utils/networkMonitor.js';