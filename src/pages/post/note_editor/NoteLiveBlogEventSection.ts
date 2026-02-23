import { Locator, WebDriver, By } from "selenium-webdriver";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import { RetryOptions, DefaultConfig } from "../../../core/config/default.js";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import logger from "../../../core/utils/logger.js";

export enum LiveBlogEventField {
    EVENT_TITLE = 'eventTitle',
    EVENT_DESCRIPTION = 'eventDescription',
    PLACE_OF_EVENT = 'placeOfEvent',
    EVENT_ADDRESS = 'eventAddress'
}

export class NoteLiveBlogEventSection {
    // ========== LOCATORS (Private & Readonly) ==========
    private readonly LOCATORS: Record<LiveBlogEventField, Locator> = {
        [LiveBlogEventField.EVENT_TITLE]: By.css('div[id="event-note"] input.mda-form-control'),
        [LiveBlogEventField.EVENT_DESCRIPTION]: By.css('div[id="event-note"] textarea[cdktextareaautosize].ng-untouched'),
        [LiveBlogEventField.PLACE_OF_EVENT]: By.css('div[id="event-note"] textarea[id^="mat-input-"]'),
        [LiveBlogEventField.EVENT_ADDRESS]: By.css('div[id="event-note"] input#search-input'),
    }

    constructor(private driver: WebDriver) { }

    async fillEventTitle(value: string, opts: RetryOptions = {}): Promise<void> {
        const config = {
            ...DefaultConfig,
            ...opts,
            label: stackLabel(opts.label, "NoteLiveBlogEventSection.fillEventTitle")
        };

        try {
            logger.debug(`Escribiendo contenido en el campo: ${LiveBlogEventField.EVENT_TITLE}`, { label: config.label });
            await writeSafe(this.driver, this.LOCATORS[LiveBlogEventField.EVENT_TITLE], value, config);
        } catch (error) {
            // Propagamos el error sin loguear de nuevo (Regla de No Redundancia).
            throw error;
        }
    }
}