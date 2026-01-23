import { postUrl } from "../utils/routes.js";
import { stackLabel } from "../utils/stackLabel.js";
import { DefaultConfig } from "../config/default.js";
import logger from "../utils/logger.js";
/**
 * Navega directamente a la página de edición de un post específico.
 * * @param driver - Instancia activa de WebDriver.
 * @param baseURL - URL base del entorno.
 * @param id - Identificador único del post.
 * @param opts - Opciones de trazabilidad y configuración.
 */
export async function goToPost(driver, baseURL, id, opts = {}) {
    // 1. Unificamos configuración y corregimos el acceso al label
    const config = {
        ...DefaultConfig,
        ...opts,
        label: stackLabel(opts.label, "goToPost")
    };
    const url = postUrl(baseURL, id);
    try {
        // Debug: Información técnica para replicación manual si fuera necesario.
        logger.debug(`Navegando a Post ID: ${id}. URL: ${url}`, {
            label: config.label
        });
        // Acción de navegación nativa
        await driver.navigate().to(url);
        // Info: Hito de navegación alcanzado.
        logger.info(`Navegación completada al post [ID: ${id}]`, {
            label: config.label
        });
    }
    catch (error) {
        // Error: Captura fallos de red, URLs malformadas o problemas de sesión.
        logger.error(`Fallo en la navegación al post ${id}: ${error.message}`, {
            label: config.label,
            metadata: { url, id } // Agrupamos metadata para el log
        });
        throw error;
    }
}
//# sourceMappingURL=goToPost.js.map