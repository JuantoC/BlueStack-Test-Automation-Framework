import { WebDriver, Locator } from "selenium-webdriver";
import { writeSafe } from "../actions/writeSafe.js";
import { RetryOptions } from "../wrappers/retry.js";
import { stackLabel } from "../utils/stackLabel.js";

/**
 * Rellena los campos de Tags
 * * @param driver La instancia del WebDriver.
 * @param tags Array de tags (strings) a ingresar.
 * @param tagsLocator Locator del campo de input de tags.
 * @param timeout Tiempo máximo de espera para la escritura.
 * @param opts Opciones de reintento.
 */
export async function handleTagsFields(driver: WebDriver, tags: string[], tagsLocator: Locator, timeout: number, opts: RetryOptions): Promise<void> {
    const fullOpts: RetryOptions = { ...opts, label: stackLabel(opts.label, `handleTagsFields`) };

    if (tags.length === 0) {
        console.log(`[${fullOpts.label}] No hay tags para procesar.`);
        return;
    }

    console.log(`[handleTagsFields] Iniciando ingreso de ${tags.length} tags.`);
    for (const tag of tags) {
        if (tag.trim() === "") continue;
        const tagTextWithSubmit = tag.trim() + '\n';

        console.log(`[$handleTagsFields] - Ingresando tag: "${tag.trim()}"`);
        // NOTA: Agregar logica para contar numero de tags y verificar
        await writeSafe(driver, tagsLocator, tagTextWithSubmit, timeout, fullOpts);
    }
    console.log(`[handleTagsFields] Tags completados.`);
}