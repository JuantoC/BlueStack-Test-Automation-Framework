import { WebDriver, By, Locator } from "selenium-webdriver";
import { RetryOptions, resolveRetryConfig } from "../../../core/config/defaultConfig.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import logger from "../../../core/utils/logger.js";
import { getErrorMessage } from "../../../core/utils/errorUtils.js";

/**
 * Sub-componente del panel lateral "Image data" en el editor de imágenes.
 * Gestiona la escritura de metadatos de la imagen: descripción, fuente,
 * fotógrafo (autor) y tags.
 *
 * Nota: el editor de imágenes no expone título ni campos de fecha/hora/clasificación
 * con data-testid. El campo URL friendly es readonly sin testid.
 */
export class EditorInfoSection {
    private config: RetryOptions;

    // ========== LOCATORS ==========
    private static readonly DESCRIPTION: Locator = By.css('[data-testid="input-description"]');
    private static readonly SOURCE: Locator = By.css('[data-testid="input-source"]');
    private static readonly PHOTOGRAPHER: Locator = By.css('[data-testid="input-photographer"]');
    private static readonly TAGS_INPUT: Locator = By.css('input.input-tags-values');
    private static readonly CLOSE_BTN: Locator = By.css('[data-testid="btn-close-info"]');

    constructor(private driver: WebDriver, opts: RetryOptions = {}) {
        this.config = resolveRetryConfig(opts, "EditorInfoSection");
    }

    /**
     * Escribe la descripción de la imagen.
     *
     * @param value - Texto a ingresar como descripción.
     */
    async fillDescription(value: string): Promise<void> {
        try {
            logger.debug(`Escribiendo descripción`, { label: this.config.label });
            await writeSafe(this.driver, EditorInfoSection.DESCRIPTION, value, this.config);
        } catch (error: unknown) {
            logger.error(`Error al escribir descripción: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
            throw error;
        }
    }

    /**
     * Escribe la fuente (source) de la imagen.
     *
     * @param value - Texto a ingresar como fuente.
     */
    async fillSource(value: string): Promise<void> {
        try {
            logger.debug(`Escribiendo source`, { label: this.config.label });
            await writeSafe(this.driver, EditorInfoSection.SOURCE, value, this.config);
        } catch (error: unknown) {
            logger.error(`Error al escribir source: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
            throw error;
        }
    }

    /**
     * Escribe el fotógrafo/autor de la imagen.
     * El testid del front es `input-photographer` (distinto de `input-author` en video).
     *
     * @param value - Nombre del fotógrafo o autor.
     */
    async fillPhotographer(value: string): Promise<void> {
        try {
            logger.debug(`Escribiendo fotógrafo: "${value}"`, { label: this.config.label });
            await writeSafe(this.driver, EditorInfoSection.PHOTOGRAPHER, value, this.config);
        } catch (error: unknown) {
            logger.error(`Error al escribir fotógrafo: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
            throw error;
        }
    }

    /**
     * Agrega un tag al campo de etiquetas de la imagen.
     * El valor se confirma con Enter después de escribirlo.
     *
     * @param tag - Etiqueta a agregar.
     */
    async addTag(tag: string): Promise<void> {
        try {
            logger.debug(`Agregando tag: "${tag}"`, { label: this.config.label });
            await writeSafe(this.driver, EditorInfoSection.TAGS_INPUT, `${tag}\n`, this.config);
        } catch (error: unknown) {
            logger.error(`Error al agregar tag: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
            throw error;
        }
    }

    /**
     * Cierra el panel de información lateral del editor de imágenes.
     */
    async close(): Promise<void> {
        try {
            logger.debug(`Cerrando panel de información`, { label: this.config.label });
            await clickSafe(this.driver, EditorInfoSection.CLOSE_BTN, this.config);
        } catch (error: unknown) {
            logger.error(`Error al cerrar panel: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
            throw error;
        }
    }
}
