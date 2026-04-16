import { WebDriver, By, until } from "selenium-webdriver";
import logger from "../utils/logger.js";
import { RetryOptions } from "../config/defaultConfig.js";
import { stackLabel } from "../utils/stackLabel.js";
/**
 * Verifica si existe el modal de actualización de Angular (overlay CDK) y lo cierra automáticamente.
 * Diseñado como contingencia reactiva ante `ElementClickInterceptedError`: detecta si un overlay
 * bloqueante está visible, hace clic en el botón de confirmación y espera su desaparición del DOM.
 *
 * @param driver - Instancia activa de WebDriver para la sesión actual.
 * @param opts - Opciones de reintento y trazabilidad, incluyendo `timeoutMs` para controlar la espera del botón.
 * @returns {Promise<boolean>} `true` si el modal fue detectado y cerrado; `false` si no había modal.
 */
export async function handleUpdateModal(driver: WebDriver, opts: RetryOptions = {}): Promise<boolean> {
    const label = stackLabel(opts.label, `handleUpdateModal`);

    const overlayLocator = By.css('[data-testid="overlay-update"]');
    const updateBtnLocator = By.css('button[data-testid="btn-calendar-confirm"]');

    try {
        // 1. Verificamos si existe el contenedor del overlay en el DOM
        const overlay = await driver.findElement(overlayLocator);

        // 2. Comprobamos si el overlay es realmente visible para el usuario
        if (await overlay.isDisplayed()) {
            logger.warn(`[${label}] Overlay detectado y visible. Buscando botón de recarga...`, { label });

            // 3. Buscamos el botón ESPECÍFICAMENTE dentro del overlay para evitar falsos positivos
            const updateButton = await overlay.findElement(updateBtnLocator);

            if (await updateButton.isDisplayed() && await updateButton.isEnabled()) {
                await updateButton.click();

                // 4. Esperamos a que el overlay desaparezca (staleness)
                await driver.wait(until.stalenessOf(overlay), 10000);
                logger.debug(`[${label}] Modal procesado y removido con éxito.`, { label });
                return true;
            }
        }
    } catch (e) {
        // Si no encuentra el overlay o el botón, asumimos que no hay modal (flujo normal)
        logger.debug(`Sin overlay activo (flujo normal).`, { label });
    }

    return false;
}