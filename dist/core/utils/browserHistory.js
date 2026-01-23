import { stackLabel } from "../utils/stackLabel.js";
import logger from "../utils/logger.js";
/**
 * Navega en el historial del navegador hacia adelante o hacia atrás.
 * * @param driver - La instancia activa de WebDriver.
 * @param direction - La dirección de navegación: "back" o "forward".
 * @param label - (Opcional) Identificador para la trazabilidad de logs.
 */
export async function browserHistory(driver, direction, label) {
    const contextLabel = stackLabel(label, `browserHistory`);
    try {
        logger.debug(`Ejecutando navegación de historial: ${direction}`, {
            label: contextLabel
        });
        if (direction === "back") {
            await driver.navigate().back();
        }
        else {
            await driver.navigate().forward();
        }
        logger.info(`Navegación '${direction}' completada con éxito`, {
            label: contextLabel
        });
    }
    catch (error) {
        // Reportamos el error pero no intentamos acciones costosas sobre el driver aquí
        logger.error(`Error al intentar navegar hacia ${direction}: ${error.message}`, {
            label: contextLabel
        });
        throw error;
    }
}
//# sourceMappingURL=browserHistory.js.map