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
        [AuthorType.INTERNAL]: By.xpath("//label[normalize-space(.)='Author']/following::div[contains(@class,'icon-preview')][1]//mat-icon[1]"),
        [AuthorType.ANONYMOUS]: By.xpath("//label[normalize-space(.)='Author']/following::div[contains(@class,'icon-preview')][1]//mat-icon[2]"),
        [AuthorType.MANUAL]: By.xpath("//label[normalize-space(.)='Author']/following::div[contains(@class,'icon-preview')][1]//mat-icon[3]"),
    };
    authorDescriptionField = By.css("#mat-input-3");
    authorNameField = By.css("#mat-input-2");
    driver;
    constructor(driver) {
        this.driver = driver;
    }
    // ========== MÉTODOS ==========
    async fillAuthorField(data, timeout, opts) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, `[NoteAuthorField.fillAuthorField]`) };
        const hasDescription = !!data.authorDescription?.trim();
        const hasName = !!data.authorName?.trim();
        console.log('[NoteAuthorField.fillAuthorField] Revisando formato de autor requerido...');
        let authorType;
        if (!data.authorType) {
            if (hasName || hasDescription) {
                authorType = AuthorType.MANUAL;
            }
            else {
                return;
            }
        }
        else {
            authorType = data.authorType;
        }
        switch (authorType) {
            case AuthorType.INTERNAL:
                console.log('[NoteAuthorField.fillAuthorField] El tipo de autor es: ', AuthorType.INTERNAL);
                return;
            case AuthorType.ANONYMOUS:
                await this.selectAuthorType(AuthorType.ANONYMOUS, timeout, fullOpts);
                return;
            case AuthorType.MANUAL:
                await this.selectAuthorType(AuthorType.MANUAL, timeout, fullOpts);
                if (hasName) {
                    await this.fillAuthorName(data.authorName, timeout, fullOpts);
                }
                if (hasDescription) {
                    await this.fillAuthorDescription(data.authorDescription, timeout, fullOpts);
                }
                return;
        }
    }
    async selectAuthorType(type, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, '[NoteAuthorField.selectAuthorType]') };
        const locator = this.authorButtonMap[type];
        console.log('[NoteAuthorField.selectAuthorType]');
        await clickSafe(this.driver, locator, timeout, fullOpts);
    }
    async fillAuthorName(name, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, '[NoteAuthorField.fillAuthorName]') };
        console.log(`[NoteAuthorField.fillAuthorName] Rellenando nombre de autor...`);
        const element = await writeSafe(this.driver, this.authorNameField, name, timeout, fullOpts);
        await assertValueEquals(this.driver, element, this.authorNameField, name, 'El valor del nombre de autor no coincide');
    }
    async fillAuthorDescription(description, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, '[NoteAuthorField.fillAuthorDescription]') };
        console.log(`[NoteAuthorField.fillAuthorDescription] Rellenando descripción de autor...`);
        const element = await writeSafe(this.driver, this.authorDescriptionField, description, timeout, fullOpts);
        await assertValueEquals(this.driver, element, this.authorDescriptionField, description, 'El valor de la descripción no coincide');
    }
}
//# sourceMappingURL=authorField.js.map