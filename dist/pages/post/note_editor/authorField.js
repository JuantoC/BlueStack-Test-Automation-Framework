import { By } from "selenium-webdriver";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { assertValueEquals } from "../../../core/utils/assertValueEquals.js";
export var AuthorType;
(function (AuthorType) {
    AuthorType["INTERNAL"] = "internal";
    AuthorType["ANONYMOUS"] = "anonymous";
    AuthorType["MANUAL"] = "manual";
})(AuthorType || (AuthorType = {}));
/**
 * Clase para campos de autor
 */
export class NoteAuthorField {
    // ========== LOCATORS ==========
    authorButtonMap = {
        [AuthorType.INTERNAL]: By.xpath('//mat-icon[text()="check_circle_outline"]'),
        [AuthorType.ANONYMOUS]: By.css('mat-icon="person_outline"'),
        [AuthorType.MANUAL]: By.css('mat-icon="draw"')
    };
    authorDescriptionField = By.css('.author-description__height');
    authorNameField = By.css('input[data-testid="type_autocomplete"]');
    driver;
    constructor(driver) {
        this.driver = driver;
    }
    // ========== MÉTODOS ==========
    async selectAuthorType(type, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, 'selectAuthorType') };
        const locator = this.authorButtonMap[type];
        await clickSafe(this.driver, locator, timeout, fullOpts);
    }
    async fillAuthorName(name, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, 'fillAuthorName') };
        console.log(`[${fullOpts.label}] Rellenando nombre de autor...`);
        const element = await writeSafe(this.driver, this.authorNameField, name, timeout, fullOpts);
        await assertValueEquals(this.driver, element, this.authorNameField, name, 'El valor del nombre de autor no coincide');
    }
    async fillAuthorDescription(description, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, 'fillAuthorDescription') };
        console.log(`[${fullOpts.label}] Rellenando descripción de autor...`);
        const element = await writeSafe(this.driver, this.authorDescriptionField, description, timeout, fullOpts);
        await assertValueEquals(this.driver, element, this.authorDescriptionField, description, 'El valor de la descripción no coincide');
    }
}
//# sourceMappingURL=authorField.js.map