import { DefaultConfig } from "../config/default.js";
import { writeToEditable, writeToStandard } from "../utils/write.js";
import { isContentEditable } from "../utils/isContentEditable.js";
import { stackLabel } from "../utils/stackLabel.js";
import { clickSafe } from "./clickSafe.js";
import logger from "../utils/logger.js";
import { retry } from "../wrappers/retry.js";
import { assertValueEquals } from "../utils/assertValueEquals.js";
/**
 * Orquestador de alto nivel para escribir texto.
 * Asegura la interactuabilidad delegando en clickSafe y selecciona la estrategia
 * de escritura (DOM vs. ContentEditable) dinámicamente.
 * * @param driver - Instancia activa de WebDriver.
 * @param locator - Selector del elemento objetivo.
 * @param text - Cadena de texto a ingresar.
 * @param opts - Opciones de reintento y trazabilidad.
 */
export async function writeSafe(driver, locator, text, opts = {}) {
    const config = {
        ...DefaultConfig,
        ...opts,
        label: stackLabel(opts.label, "writeSafe"),
    };
    return await retry(async () => {
        // Desactivamos reintentos internos en los sub-pasos para que el orquestador controle el flujo.
        const internalOpts = { ...config, supressRetry: true };
        logger.debug(`Iniciando flujo de escritura para: ${locator.toString()}`, {
            label: config.label,
        });
        // 1. Preparación: Click previo para ganar foco y asegurar visibilidad.
        const element = await clickSafe(driver, locator, internalOpts);
        // 2. Identificación: Determinamos la naturaleza del input.
        const isEditable = await isContentEditable(element);
        logger.debug(`Modo de escritura detectado: ${isEditable ? "ContentEditable" : "Standard"}`, {
            label: config.label,
        });
        // 3. Ejecución: Acción atómica de escritura.
        if (isEditable) {
            await writeToEditable(element, text);
        }
        else {
            await writeToStandard(element, text);
        }
        // 4. Verificación: Confirmamos que el texto se haya ingresado correctamente.
        await assertValueEquals(element, locator, text, internalOpts);
        logger.debug(`Texto ingresado correctamente en el elemento`, {
            label: config.label,
            text: text.length > 20 ? `${text.substring(0, 20)}...` : text // Logueo seguro de datos
        });
        return element;
    }, config);
}
//# sourceMappingURL=writeSafe.js.map