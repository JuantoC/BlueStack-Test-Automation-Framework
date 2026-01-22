import { By } from "selenium-webdriver";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { assertValueEquals } from "../../../core/utils/assertValueEquals.js";
export var textField;
(function (textField) {
    textField["TITLE"] = "title";
    textField["SECONDARY_TITLE"] = "secondaryTitle";
    textField["SUB_TITLE"] = "subTitle";
    textField["HALF_TITLE"] = "halfTitle";
    textField["BODY"] = "body";
    textField["SUMMARY"] = "summary";
})(textField || (textField = {}));
export class textFields {
    driver;
    LOCATORS = {
        [textField.TITLE]: By.css('div[id="titulo-content"] textarea.content__input-title.main__title-height'),
        [textField.SECONDARY_TITLE]: By.css('div[id="titulo-content"] textarea.content__input-title.secondary__title-height'),
        [textField.SUB_TITLE]: By.css('ckeditor[data-testid="copete-content"] div.ck-editor__editable'),
        [textField.HALF_TITLE]: By.css('div[id="volanta-content"] input[type="text"]'),
        [textField.BODY]: By.css('div[id="cuerpo-content"] div.ck-editor__editable'),
        [textField.SUMMARY]: By.id('resumen-content')
    };
    constructor(driver) {
        this.driver = driver;
    }
    async fillField(field, value, timeout, opts = {}) {
        if (!value)
            return;
        const locator = this.LOCATORS[field];
        const element = await writeSafe(this.driver, locator, value, timeout, opts);
        // Verificación crítica para campos de texto core
        await assertValueEquals(this.driver, element, locator, value);
    }
}
//# sourceMappingURL=textFields.js.map