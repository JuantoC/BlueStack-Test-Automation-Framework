import { isContentEditable } from "./isContentEditable.js";
import { stackLabel } from "../utils/stackLabel.js";
import { DefaultConfig } from "../config/default.js";
import { retry } from "../wrappers/retry.js";
import logger from "../utils/logger.js";
/**
 * Valida que el contenido de un elemento coincida con un valor esperado.
 * Posee capacidad de reintento autónoma o suprimida por orquestadores superiores.
 * * @param element - El WebElement a inspeccionar.
 * @param locator - Locator original para trazabilidad en errores.
 * @param expected - Valor que se espera encontrar.
 * @param opts - Opciones de reintento y trazabilidad.
 */
export async function assertValueEquals(element, locator, expected, opts = {}) {
    // 1. Unificamos configuración (Merge de Default + Opciones del usuario)
    const config = {
        ...DefaultConfig,
        ...opts,
        label: stackLabel(opts.label, "assertValueEquals"),
    };
    // 2. Aplicamos el wrapper de retry con la lógica de supresión integrada
    return await retry(async () => {
        try {
            const isEditable = await isContentEditable(element);
            logger.debug(`Extrayendo valor para validación (Modo: ${isEditable ? 'Editable' : 'Standard'})`, {
                label: config.label
            });
            let actual;
            if (isEditable) {
                actual = await element.getDriver().executeScript("return (arguments[0].innerText || arguments[0].textContent || '').trim();", element);
            }
            else {
                actual = (await element.getAttribute("value")) ?? "";
            }
            if (actual !== expected) {
                // Log de nivel debug para no ensuciar la consola durante reintentos
                logger.debug(`Discrepancia detectada: Esperado "${expected}" vs Actual "${actual}"`, {
                    label: config.label
                });
                throw new Error(`Valor no coincide para ${locator.toString()}. Esperado: "${expected}", Obtenido: "${actual}"`);
            }
            logger.info(`Validación exitosa: El valor coincide con "${expected}"`, {
                label: config.label
            });
        }
        catch (error) {
            // Si el error es Stale o de comparación, el retry decidirá si continuar o lanzar
            // No realizamos acciones adicionales sobre 'element' aquí para evitar efectos secundarios.
            throw error;
        }
    }, config); // El wrapper 'retry' lee config.supressRetry internamente
}
//# sourceMappingURL=assertValueEquals.js.map