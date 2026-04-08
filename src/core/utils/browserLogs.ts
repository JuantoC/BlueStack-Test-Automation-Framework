import { WebDriver, logging } from "selenium-webdriver";
import logger from "./logger.js";
import * as allure from "allure-js-commons";
import { getErrorMessage } from "./errorUtils.js";

/**
 * Extrae y reporta los errores de consola del navegador al finalizar un test.
 * Filtra las entradas de nivel `SEVERE` del log de browser de Selenium y las adjunta
 * como artifact de texto en Allure para su visualización en el reporte.
 * Usada automáticamente por `runSession` en el bloque `finally`.
 *
 * @param driver - Instancia activa de WebDriver desde la cual extraer los logs de consola.
 */
export async function checkConsoleErrors(driver: WebDriver) {
    const label = "checkConsoleErrors";
    try {
        const entries = await driver.manage().logs().get(logging.Type.BROWSER);
        const errors = entries.filter(entry => entry.level.name === 'SEVERE');

        if (errors.length > 0) {
            const formattedErrors = errors
                .map(e => `🟠 [JS ERROR] ${e.message}`)
                .join('\n');

            // 1. Log en archivos/consola
            logger.warn(`⚠️ Errores de JS detectados en [${label}]:\n${formattedErrors}`, { label: label });

            // 2. Adjunto para Allure (Fuera del logger)
            await allure.attachment(
                `Console_Errors_${label}`,
                formattedErrors,
                "text/plain"
            );
        }
    } catch (e) {
        logger.error(`No se pudieron extraer los logs de consola para ${label}.`, { label: label, error: getErrorMessage(e) });
    }
}