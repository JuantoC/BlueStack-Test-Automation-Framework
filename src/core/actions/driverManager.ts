import { Builder, WebDriver } from 'selenium-webdriver';
import { ServiceBuilder } from 'selenium-webdriver/chrome.js';
import { setChromeOptions, DriverOptions } from "../config/chromeOptions.js";
import { DefaultConfig, RetryOptions } from "../config/default.js";
import { startNetworkMonitoring, NetworkMonitorHandle } from '../utils/networkMonitor.js';
import { stackLabel } from "../utils/stackLabel.js";
import logger from "../utils/logger.js";
import { sleep } from '../utils/backOff.js';

declare global {
    // var es necesario aquí para que se fusione con el scope global
    var activeMonitor: NetworkMonitorHandle | undefined;
}

export interface DriverSession {
    driver: WebDriver;
    networkMonitor: NetworkMonitorHandle | null;
}

export async function initializeDriver(options: DriverOptions, opts: RetryOptions = {}): Promise<DriverSession> {
    const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "initializeDriver") };

    try {
        const chromeOptions = setChromeOptions(options);
        const builder = new Builder().forBrowser('chrome').setChromeOptions(chromeOptions);

        if (options.useGrid) {
            builder.usingServer(options.gridUrl || 'http://localhost:4444');
        } else {
            builder.setChromeService(new ServiceBuilder().setStdio('ignore'));
        }

        const driver = await builder.build();

        // Optimización de Timeouts
        await driver.manage().setTimeouts({ pageLoad: 30000, script: 30000, implicit: 5000 });

        // Activación del monitor CDP con ACK Sync
        const networkMonitor = await startNetworkMonitoring(driver, config.label);
        if (networkMonitor) {
            global.activeMonitor = networkMonitor;
        }
        logger.info('🚀 WebDriver y CDP listos', { label: config.label });

        return { driver, networkMonitor };
    } catch (error: any) {
        logger.error(`Fallo en inicialización: ${error.message}`, { label: config.label });
        throw error;
    }
}

export async function quitDriver(session: DriverSession | null, opts: RetryOptions = {}): Promise<void> {
    const label = opts.label || "quitDriver";
    if (!session?.driver) return;

    try {
        if (opts.timeoutMs) await sleep(opts.timeoutMs);
        await session.driver.quit();
        global.activeMonitor = undefined;
        logger.info('🏁 Sesión cerrada', { label });
    } catch (error: any) {
        if (!error.message.includes('NoSuchSession')) {
            logger.warn(`Cierre parcial: ${error.message}`, { label });
        }
    }
}