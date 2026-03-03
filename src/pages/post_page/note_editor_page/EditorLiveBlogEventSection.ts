import { Locator, WebDriver, By } from "selenium-webdriver";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import { RetryOptions, DefaultConfig } from "../../../core/config/default.js";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import logger from "../../../core/utils/logger.js";
import { LiveBlogData } from "./noteList/BaseListicleSection.js";
import { step } from "allure-js-commons";

export enum LiveBlogEventField {
    EVENT_TITLE = 'eventTitle',
    EVENT_DESCRIPTION = 'eventDescription',
    PLACE_OF_EVENT = 'placeOfEvent',
    EVENT_ADDRESS = 'eventAddress'
}

export class EditorLiveBlogEventSection {
    private driver: WebDriver;
    private config: RetryOptions;

    // ========== LOCATORS (Private & Readonly) ==========
    private readonly LOCATORS: Record<LiveBlogEventField, Locator> = {
        [LiveBlogEventField.EVENT_TITLE]: By.css('div[id="event-note"] input.mda-form-control'),
        [LiveBlogEventField.EVENT_DESCRIPTION]: By.css('div[id="event-note"] textarea[cdktextareaautosize].ng-untouched'),
        [LiveBlogEventField.PLACE_OF_EVENT]: By.css('div[id="event-note"] textarea[id^="mat-input-"]'),
        [LiveBlogEventField.EVENT_ADDRESS]: By.css('div[id="event-note"] input#search-input'),
    }

    constructor(driver: WebDriver, config: RetryOptions = {}) {
        this.driver = driver;
        this.config = { ...DefaultConfig, ...config, label: stackLabel(config.label, "EditorLiveBlogEventSection") };
    }

    async fillEventTitle(value: LiveBlogData): Promise<void> {
        await step("Rellenar evento de Liveblog", async () => {
            try {
                if (!value.eventLiveBlog?.eventTitle) {
                    logger.debug(`No se proporcionó un título para el evento de LiveBlog. Omitiendo este paso.`, { label: this.config.label });
                    return;
                }
                logger.debug(`Escribiendo contenido en el campo: ${LiveBlogEventField.EVENT_TITLE}`, { label: this.config.label });
                await writeSafe(this.driver, this.LOCATORS[LiveBlogEventField.EVENT_TITLE], value.eventLiveBlog.eventTitle, this.config);
            } catch (error) {
                // Propagamos el error sin loguear de nuevo (Regla de No Redundancia).
                throw error;
            }
        });
    }
}