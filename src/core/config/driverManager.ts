import { Builder, WebDriver } from 'selenium-webdriver';
import { ServiceBuilder } from 'selenium-webdriver/chrome.js';
import { setChromeOptions, DriverOptions } from "./chromeOptions.js";
import { DefaultConfig, resolveRetryConfig, RetryOptions } from "./defaultConfig.js";
import { startNetworkMonitoring, NetworkMonitorHandle } from './networkMonitor.js';
import { stackLabel } from "../utils/stackLabel.js";
import logger from "../utils/logger.js";
import { sleep } from '../utils/backOff.js';
import { getErrorMessage } from '../utils/errorUtils.js';

declare global {
    // var es necesario aquí para que se fusione con el scope global
    var activeMonitor: NetworkMonitorHandle | undefined;
}

/**
 * Representa una sesión activa del WebDriver con su monitor de red CDP asociado.
 * Devuelta por `initializeDriver` y consumida por `runSession` y `quitDriver`.
 */
export interface DriverSession {
    driver: WebDriver;
    networkMonitor: NetworkMonitorHandle | null;
}

/**
 * Inicializa una sesión de WebDriver para Chrome con el monitor de red CDP activo.
 * Construye el driver según las opciones (headless/grid), configura los timeouts globales
 * e inicia el monitoreo de red por CDP a través de `startNetworkMonitoring`.
 *
 * @param options - Opciones de configuración del browser: modo headless y uso de Selenium Grid.
 * @param opts - Opciones de trazabilidad y configuración del framework.
 * @returns {Promise<DriverSession>} La sesión activa con el driver y el monitor de red listos.
 */
export async function initializeDriver(options: DriverOptions, opts: RetryOptions = {}): Promise<DriverSession> {
    const config = resolveRetryConfig(opts, "initializeDriver");

    try {
        const chromeOptions = setChromeOptions(options);
        const builder = new Builder().forBrowser('chrome').setChromeOptions(chromeOptions);

        if (options.useGrid) {
            builder.usingServer(options.gridUrl || 'http://localhost:4444');
        } else {
            builder.setChromeService(new ServiceBuilder().setStdio('ignore'));
        }

        const driver = await builder.build();

        await driver.manage().setTimeouts({ pageLoad: 30000, script: 30000, implicit: 5000 });

        // Activación del monitor CDP con ACK Sync
        const networkMonitor = await startNetworkMonitoring(driver, config.label);
        if (networkMonitor) {
            global.activeMonitor = networkMonitor;
        }
        logger.info('🚀 WebDriver y CDP listos', { label: config.label });

        return { driver, networkMonitor };
    } catch (error: unknown) {
        logger.error(`Fallo en inicialización: ${getErrorMessage(error)}`, { label: config.label });
        throw error;
    }
}

/**
 * Cierra la sesión del WebDriver y limpia los recursos asociados.
 * Maneja con gracia los errores de sesión ya cerrada (`NoSuchSession`). Si `opts.timeoutMs`
 * está definido, espera ese tiempo antes de cerrar (útil para inspección manual post-test).
 *
 * @param session - La sesión activa a cerrar. Si es `null`, la función retorna sin hacer nada.
 * @param opts - Opciones de trazabilidad y tiempo de espera antes del cierre.
 */
export async function quitDriver(session: DriverSession | null, opts: RetryOptions = {}): Promise<void> {
    const config = resolveRetryConfig(opts, "quitDriver");
    if (!session?.driver) return;

    try {
        if (opts.timeoutMs) await sleep(opts.timeoutMs);
        await session.driver.quit();
        global.activeMonitor = undefined;
        logger.info('🏁 Sesión cerrada', { label: config.label });
    } catch (error: unknown) {
        if (!getErrorMessage(error).includes('NoSuchSession')) {
            logger.warn(`Cierre parcial: ${getErrorMessage(error)}`, { label: config.label });
        }
    }
}