import { WebDriver, logging } from "selenium-webdriver";
import logger from "./logger.js";

/**
 * Verifica si hay errores en la consola del navegador.
 * @param driver Instancia del WebDriver
 * @returns Array de mensajes de error encontrados
 */
export async function checkConsoleErrors(driver: WebDriver, label: string = "BrowserLogs") {
    try {
        // Obtenemos los logs de tipo BROWSER
        const entries = await driver.manage().logs().get(logging.Type.BROWSER);

        // Filtramos solo los SEVERE (Errores rojos de consola)
        const errors = entries.filter(entry => entry.level.name === 'SEVERE');

        if (errors.length > 0) {
            // 1. Convertimos los errores a un String con formato lista
            const formattedErrors = errors
                .map(e => `   🟠 [JS ERROR] ${e.message}`)
                .join('\n'); // Unimos con salto de línea

            // 2. Lo inyectamos en el mensaje principal
            logger.warn(`⚠️ Se detectaron ${errors.length} errores de JS en la consola del navegador:\n${formattedErrors}`, {
                label
            });
        }
    } catch (e) {
        logger.warn("No se pudieron extraer los logs de la consola (posiblemente no soportado en este modo).");
        return [];
    }
}