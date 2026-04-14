import { Locator, WebDriver, By } from "selenium-webdriver";
import { RetryOptions, resolveRetryConfig } from "../../../../core/config/defaultConfig.js";
import { writeSafe } from "../../../../core/actions/writeSafe.js";
import logger from "../../../../core/utils/logger.js";
import { LiveBlogData } from "./BaseListicleSection.js";
import { step } from "allure-js-commons";
import { getErrorMessage } from "../../../../core/utils/errorUtils.js";

export type LiveBlogEventField = keyof typeof LiveBlogEventSection.LOCATORS;

/**
 * Sub-componente que gestiona la sección del evento en notas de tipo LiveBlog.
 * Encapsula los locators de los campos del evento (título, descripción, lugar, dirección)
 * y expone el método de escritura del título del evento utilizado por `LiveBlogSection`.
 */
export class LiveBlogEventSection {
    private config: RetryOptions;

    // ========== LOCATORS (Private & Readonly) ==========
    public static readonly LOCATORS = {
        EVENT_TITLE: By.css('div[id="event-note"] input.mda-form-control'),
        EVENT_DESCRIPTION: By.css('div[id="event-note"] textarea[cdktextareaautosize].ng-untouched'),
        PLACE_OF_EVENT: By.css('div[id="event-note"] textarea[id^="mat-input-"]'),
        EVENT_ADDRESS: By.css('div[id="event-note"] input#search-input'),
    } as const

    /**
     * Constructor para la sección de evento de LiveBlog.
     *
     * @param driver - Instancia activa de WebDriver para la sesión actual.
     * @param opts - Opciones de reintento y trazabilidad del framework.
     */
    constructor(private driver: WebDriver, opts: RetryOptions) {
        this.config = resolveRetryConfig(opts, "LiveBlogEventSection");
    }

    /**
     * Escribe el título del evento en el campo correspondiente de la sección LiveBlog.
     * Omite el paso silenciosamente si `value.eventLiveBlog.eventTitle` no está definido.
     * Delega la escritura en `writeSafe` usando el locator del campo `EVENT_TITLE`.
     *
     * @param value - Datos del LiveBlog que contienen el objeto `eventLiveBlog` con el título.
     */
    async fillEventTitle(value: LiveBlogData): Promise<void> {
        await step("Rellenar evento de Liveblog", async () => {
            try {
                if (!value.eventLiveBlog?.eventTitle) {
                    logger.debug(`No se proporcionó un título para el evento de LiveBlog. Omitiendo este paso.`, { label: this.config.label });
                    return;
                }
                logger.debug(`Escribiendo contenido en el campo: EVENT_TITLE`, { label: this.config.label });
                await writeSafe(this.driver, LiveBlogEventSection.LOCATORS['EVENT_TITLE'], value.eventLiveBlog.eventTitle, this.config);
            } catch (error: unknown) {
                logger.error(`Error en fillEventTitle: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
                throw error;
            }
        });
    }
}