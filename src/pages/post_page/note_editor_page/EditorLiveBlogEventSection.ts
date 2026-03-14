import { Locator, WebDriver, By } from "selenium-webdriver";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import { RetryOptions, DefaultConfig } from "../../../core/config/defaultConfig.js";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import logger from "../../../core/utils/logger.js";
import { LiveBlogData } from "./noteList/BaseListicleSection.js";
import { step } from "allure-js-commons";

export enum LiveBlogEventField {
    EVENT_TITLE = 'EVENT_TITLE',
    EVENT_DESCRIPTION = 'EVENT_DESCRIPTION',
    PLACE_OF_EVENT = 'PLACE_OF_EVENT',
    EVENT_ADDRESS = 'EVENT_ADDRESS'
}

export class EditorLiveBlogEventSection {
    private driver: WebDriver;
    private config: RetryOptions;

    // ========== LOCATORS (Private & Readonly) ==========
    private static readonly LOCATORS: Record<LiveBlogEventField, Locator> = {
        [LiveBlogEventField.EVENT_TITLE]: By.css('div[id="event-note"] input.mda-form-control'),
        [LiveBlogEventField.EVENT_DESCRIPTION]: By.css('div[id="event-note"] textarea[cdktextareaautosize].ng-untouched'),
        [LiveBlogEventField.PLACE_OF_EVENT]: By.css('div[id="event-note"] textarea[id^="mat-input-"]'),
        [LiveBlogEventField.EVENT_ADDRESS]: By.css('div[id="event-note"] input#search-input'),
    }

    constructor(driver: WebDriver, opts: RetryOptions) {
        this.driver = driver;
        this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "EditorLiveBlogEventSection") };
    }

    async fillEventTitle(value: LiveBlogData): Promise<void> {
        await step("Rellenar evento de Liveblog", async () => {
            try {
                if (!value.eventLiveBlog?.eventTitle) {
                    logger.debug(`No se proporcionó un título para el evento de LiveBlog. Omitiendo este paso.`, { label: this.config.label });
                    return;
                }
                logger.debug(`Escribiendo contenido en el campo: ${LiveBlogEventField.EVENT_TITLE}`, { label: this.config.label });
                await writeSafe(this.driver, EditorLiveBlogEventSection.LOCATORS[LiveBlogEventField.EVENT_TITLE], value.eventLiveBlog.eventTitle, this.config);
            } catch (error: any) {
                logger.error(`Error en fillEventTitle: ${error.message}`, { label: this.config.label, error: error.message });
                throw error;
            }
        });
    }
}