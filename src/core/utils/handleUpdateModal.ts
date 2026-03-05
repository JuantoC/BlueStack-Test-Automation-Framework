import { WebDriver, By, until } from "selenium-webdriver";
import logger from "./logger.js";
import { RetryOptions } from "../config/defaultConfig.js";
import { stackLabel } from "../utils/stackLabel.js";
/**
 * 
 * Verifica si existe el modal de actualización y lo cierra.
 */
export async function handleUpdateModal(driver: WebDriver, opts: RetryOptions = {}): Promise<boolean> {
    const label = stackLabel(opts.label, `handleUpdateModal`);

    // Selectores: Usamos clases de Angular CDK que son estándar para overlays
    const overlayLocator = By.css('div[id="cdk-overlay-0"]');
    const updateBtnLocator = By.css('button[data-testid="btn-calendar-confirm"]');

    try {
        // 1. Verificamos si existe el contenedor del overlay en el DOM
        const overlay = await driver.findElement(overlayLocator);

        // 2. Comprobamos si el overlay es realmente visible para el usuario
        if (await overlay.isDisplayed()) {
            logger.warn(`[${label}] Overlay detectado y visible. Buscando botón de recarga...`);

            // 3. Buscamos el botón ESPECÍFICAMENTE dentro del overlay para evitar falsos positivos
            const updateButton = await overlay.findElement(updateBtnLocator);

            if (await updateButton.isDisplayed() && await updateButton.isEnabled()) {
                await updateButton.click();

                // 4. Esperamos a que el overlay desaparezca (staleness)
                await driver.wait(until.stalenessOf(overlay), 10000);
                logger.info(`[${label}] Modal procesado y removido con éxito.`);
                return true;
            }
        }
    } catch (e) {
        // Si no encuentra el overlay o el botón, asumimos que no hay modal (flujo normal)
    }

    return false;
}