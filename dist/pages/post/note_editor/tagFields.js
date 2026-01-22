import { By } from "selenium-webdriver";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";
export var NoteTagField;
(function (NoteTagField) {
    NoteTagField["TAGS"] = "tags";
    NoteTagField["HIDDEN_TAGS"] = "hiddenTags";
})(NoteTagField || (NoteTagField = {}));
export class NoteTagsFields {
    driver;
    // Locators centralizados y privados
    LOCATORS = {
        [NoteTagField.TAGS]: By.css('div[id="claves-content"] input[role="combobox"]'),
        [NoteTagField.HIDDEN_TAGS]: By.css('div[id="clavesOcultas-content"] input[role="combobox"]')
    };
    constructor(driver) {
        this.driver = driver;
    }
    /**
     * Agrega múltiples tags presionando Enter después de cada uno.
     */
    async addTags(type, tags, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, `NoteTagsFields.addTags:${type}`) };
        const locator = this.LOCATORS[type];
        if (!tags || tags.length === 0)
            return;
        for (const tag of tags) {
            const sanitizedTag = tag.trim();
            if (!sanitizedTag)
                continue;
            console.log(`[Tags] Agregando: "${sanitizedTag}"`);
            // Nota: El \n es crítico aquí para que el componente de UI procese el tag
            await writeSafe(this.driver, locator, `${sanitizedTag}\n`, timeout, fullOpts);
        }
    }
}
//# sourceMappingURL=tagFields.js.map