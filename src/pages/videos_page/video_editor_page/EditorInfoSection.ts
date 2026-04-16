import { WebDriver, By, Locator } from "selenium-webdriver";
import { RetryOptions, resolveRetryConfig } from "../../../core/config/defaultConfig.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import logger from "../../../core/utils/logger.js";
import { getErrorMessage } from "../../../core/utils/errorUtils.js";

/**
 * Sub-componente del panel lateral "Information" en el editor de videos.
 * Gestiona la lectura y escritura de metadatos del video: título, descripción,
 * fuente, autor, URL amigable, tags, fecha/hora de modificación, clasificación,
 * autoplay y mute.
 */
export class EditorInfoSection {
    private config: RetryOptions;

    // ========== LOCATORS ==========
    private static readonly TITLE: Locator = By.css('[data-testid="input-title"]');
    private static readonly DESCRIPTION: Locator = By.css('[data-testid="input-description"]');
    private static readonly SOURCE: Locator = By.css('[data-testid="input-source"]');
    private static readonly AUTHOR: Locator = By.css('[data-testid="input-author"]');
    private static readonly URL_FRIENDLY: Locator = By.css('[data-testid="input-url-friendly"]');
    private static readonly CREATE_DATE: Locator = By.css('[data-testid="input-create-date"]');
    private static readonly OPEN_DATEPICKER_BTN: Locator = By.css('[data-testid="btn-open-datepicker"]');
    private static readonly TIMEPICKER_HOURS: Locator = By.css('[data-testid="timepicker-create-hour"] input[placeholder="HH"]');
    private static readonly TIMEPICKER_MINUTES: Locator = By.css('[data-testid="timepicker-create-hour"] input[placeholder="MM"]');
    private static readonly RATING_DROPDOWN: Locator = By.css('[data-testid="dropdown-classification"]');
    private static readonly AUTOPLAY_TOGGLE: Locator = By.css('[data-testid="check-autoplay"] button[role="switch"]');
    private static readonly MUTE_TOGGLE: Locator = By.css('[data-testid="check-mute"] button[role="switch"]');
    private static readonly TAGS_INPUT: Locator = By.css('input.input-tags-values');
    private static readonly CLOSE_BTN: Locator = By.css('[data-testid="btn-close-info"]');

    constructor(private driver: WebDriver, opts: RetryOptions = {}) {
        this.config = resolveRetryConfig(opts, "EditorInfoSection");
    }

    /**
     * Escribe el título del video en el textarea correspondiente.
     * Limpia el campo antes de escribir.
     *
     * @param value - Texto a ingresar como título.
     */
    async fillTitle(value: string): Promise<void> {
        try {
            logger.debug(`Escribiendo título: "${value}"`, { label: this.config.label });
            await writeSafe(this.driver, EditorInfoSection.TITLE, value, this.config);
        } catch (error: unknown) {
            logger.error(`Error al escribir título: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
            throw error;
        }
    }

    /**
     * Escribe la descripción del video.
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
     * Escribe la fuente (source) del video.
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
     * Escribe el autor del video.
     *
     * @param value - Texto a ingresar como autor.
     */
    async fillAuthor(value: string): Promise<void> {
        try {
            logger.debug(`Escribiendo autor`, { label: this.config.label });
            await writeSafe(this.driver, EditorInfoSection.AUTHOR, value, this.config);
        } catch (error: unknown) {
            logger.error(`Error al escribir autor: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
            throw error;
        }
    }

    /**
     * Agrega un tag al campo de etiquetas del video.
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
     * Establece la fecha de última modificación del video.
     * Escribe directamente en el input de fecha (formato DD/MM/YYYY).
     *
     * @param date - Fecha en formato DD/MM/YYYY.
     */
    async fillDate(date: string): Promise<void> {
        try {
            logger.debug(`Escribiendo fecha: "${date}"`, { label: this.config.label });
            await writeSafe(this.driver, EditorInfoSection.CREATE_DATE, date, this.config);
        } catch (error: unknown) {
            logger.error(`Error al escribir fecha: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
            throw error;
        }
    }

    /**
     * Abre el datepicker de fecha de modificación.
     */
    async openDatepicker(): Promise<void> {
        try {
            logger.debug(`Abriendo datepicker`, { label: this.config.label });
            await clickSafe(this.driver, EditorInfoSection.OPEN_DATEPICKER_BTN, this.config);
        } catch (error: unknown) {
            logger.error(`Error al abrir datepicker: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
            throw error;
        }
    }

    /**
     * Establece la hora de última modificación del video.
     * Escribe en los campos HH y MM del timepicker.
     *
     * @param hours - Hora en formato HH (2 dígitos).
     * @param minutes - Minutos en formato MM (2 dígitos).
     */
    async fillTime(hours: string, minutes: string): Promise<void> {
        try {
            logger.debug(`Escribiendo hora: ${hours}:${minutes}`, { label: this.config.label });
            await writeSafe(this.driver, EditorInfoSection.TIMEPICKER_HOURS, hours, this.config);
            await writeSafe(this.driver, EditorInfoSection.TIMEPICKER_MINUTES, minutes, this.config);
        } catch (error: unknown) {
            logger.error(`Error al escribir hora: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
            throw error;
        }
    }

    /**
     * Abre el dropdown de clasificación (Rating).
     * La selección de la opción específica queda a cargo del test o del Maestro,
     * ya que las opciones del mat-select se renderizan en un overlay global.
     */
    async openRatingDropdown(): Promise<void> {
        try {
            logger.debug(`Abriendo dropdown de clasificación`, { label: this.config.label });
            await clickSafe(this.driver, EditorInfoSection.RATING_DROPDOWN, this.config);
        } catch (error: unknown) {
            logger.error(`Error al abrir dropdown de clasificación: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
            throw error;
        }
    }

    /**
     * Activa o desactiva el toggle de Autoplay.
     * Hace click en el botón switch interno del mat-slide-toggle.
     */
    async clickAutoplay(): Promise<void> {
        try {
            logger.debug(`Clickeando toggle Autoplay`, { label: this.config.label });
            await clickSafe(this.driver, EditorInfoSection.AUTOPLAY_TOGGLE, this.config);
        } catch (error: unknown) {
            logger.error(`Error al clickear Autoplay: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
            throw error;
        }
    }

    /**
     * Activa o desactiva el toggle de Mute.
     * Hace click en el botón switch interno del mat-slide-toggle.
     */
    async clickMute(): Promise<void> {
        try {
            logger.debug(`Clickeando toggle Mute`, { label: this.config.label });
            await clickSafe(this.driver, EditorInfoSection.MUTE_TOGGLE, this.config);
        } catch (error: unknown) {
            logger.error(`Error al clickear Mute: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
            throw error;
        }
    }

    /**
     * Cierra el panel de información lateral del editor.
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
