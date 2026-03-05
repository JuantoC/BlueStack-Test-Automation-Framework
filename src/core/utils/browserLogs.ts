import { WebDriver, logging } from "selenium-webdriver";
import logger from "./logger.js";
import * as allure from "allure-js-commons";
import { RetryOptions } from "../config/defaultConfig.js";
import { stackLabel } from "./stackLabel.js";

export async function checkConsoleErrors(driver: WebDriver, opts: RetryOptions) {
    const config = {
        ...opts,
        label: stackLabel(opts.label, "checkConsoleErrors"),
    };
    try {
        const entries = await driver.manage().logs().get(logging.Type.BROWSER);
        const errors = entries.filter(entry => entry.level.name === 'SEVERE');

        if (errors.length > 0) {
            const formattedErrors = errors
                .map(e => `🟠 [JS ERROR] ${e.message}`)
                .join('\n');

            // 1. Log en archivos/consola
            logger.warn(`⚠️ Errores de JS detectados en [${config.label}]:\n${formattedErrors}`, { label: config.label });

            // 2. Adjunto para Allure (Fuera del logger)
            await allure.attachment(
                `Console_Errors_${config.label}`,
                formattedErrors,
                "text/plain"
            );
        }
    } catch (e) {
        logger.warn(`No se pudieron extraer los logs de consola para ${config.label}.`, { label: config.label });
    }
}