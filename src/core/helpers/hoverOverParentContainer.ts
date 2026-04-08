import { By, WebDriver, WebElement } from "selenium-webdriver";
import { RetryOptions } from "../config/defaultConfig.js";
import logger from "../utils/logger.js";
import { stackLabel } from "../utils/stackLabel.js";
import { getErrorMessage } from "../utils/errorUtils.js";

/**
 * Navega hasta un ancestro del elemento y ejecuta un hover escalonado para forzar su visibilidad.
 * Combina acciones nativas de Selenium con eventos de JavaScript (`mouseenter`, `mouseover`)
 * para forzar la detección en frameworks reactivos como Angular Material.
 * Usada por `waitVisible` como estrategia de recuperación cuando el scroll no es suficiente.
 *
 * @param driver - Instancia activa de WebDriver para la sesión actual.
 * @param element - WebElement objetivo cuya visibilidad se intenta forzar mediante hover en ancestros.
 * @param opts - Opciones de reintento y trazabilidad. Propagadas a todos los sub-llamados internos.
 * @returns {Promise<boolean>} `true` si el elemento se volvió visible tras el hover; `false` en caso contrario.
 */
export async function hoverOverParentContainer(driver: WebDriver, element: WebElement, opts: RetryOptions): Promise<boolean> {
    const config = { ...opts, label: stackLabel(opts.label, `hoverOverParentContainer`) };
    try {
        logger.debug(`Intentando hacer hover sobre el elemento...`, { label: config.label });

        let current: WebElement | null = element;
        let depth = 0;
        const maxDepth = 3;

        while (current && depth < maxDepth) {
            try {
                // Subimos un nivel en el DOM
                current = await current.findElement(By.xpath(".."));
                logger.debug(`Hover sobre ancestor nivel ${depth + 1}`, { label: config.label });

                // 1. Intento nativo con Selenium Actions
                // Instanciamos actions de nuevo para evitar acumular movimientos previos
                const actions = driver.actions({ async: true });
                await actions.move({ origin: current }).perform();
                await actions.clear(); // Limpiamos la acción para la siguiente iteración

                // 2. Intento con JavaScript
                // Esto dispara los eventos que agregan clases condicionales como 'content_show-icon'
                await driver.executeScript(`
                    const el = arguments[0];
                    if (el) {
                        el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true, view: window }));
                        el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window }));
                    }
                `, current);

                // Wait para permitir que Angular procese el cambio de estado y re-renderice (CSS/DOM)
                const isVisible = await driver.wait(async () => {
                    try {
                        return await element.isDisplayed();
                    } catch {
                        return false;
                    }
                }, 1500);

                if (isVisible) {
                    logger.debug(`Elemento visible tras hover en nivel ${depth + 1}`, { label: config.label });
                    return true;
                }

            } catch (innerErr: any) {
                // Normal que falle en niveles bajos (ej. <li> ocultos)
                logger.error(`Fallo hover en nivel ${depth + 1} (probablemente no interactuable): ${getErrorMessage(innerErr)}`, { label: config.label, error: getErrorMessage(innerErr) });
            }

            depth++;
        }

        logger.debug(`El hover escalonado no logró hacer visible el elemento`, { label: config.label });
        return false;

    } catch (err: unknown) {
        logger.error(`Error crítico durante hover recovery: ${getErrorMessage(err)}`, { label: config.label, error: getErrorMessage(err) });
        return false;
    }
}