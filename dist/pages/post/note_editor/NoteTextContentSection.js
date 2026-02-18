import { By } from "selenium-webdriver";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { DefaultConfig } from "../../../core/config/default.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import logger from "../../../core/utils/logger.js";
export var NoteTextField;
(function (NoteTextField) {
    NoteTextField["TITLE"] = "title";
    NoteTextField["SECONDARY_TITLE"] = "secondaryTitle";
    NoteTextField["SUB_TITLE"] = "subTitle";
    NoteTextField["HALF_TITLE"] = "halfTitle";
    NoteTextField["BODY"] = "body";
    NoteTextField["SUMMARY"] = "summary";
})(NoteTextField || (NoteTextField = {}));
/**
 * Gestiona los campos de texto principales y enriquecidos (CKEditor) de la nota.
 */
export class NoteTextContentSection {
    driver;
    // ========== LOCATORS (Private & Readonly) ==========
    LOCATORS = {
        [NoteTextField.TITLE]: By.css('div[id="titulo-content"] textarea.content__input-title.main__title-height'),
        [NoteTextField.SECONDARY_TITLE]: By.css('div[id="titulo-content"] textarea.content__input-title.secondary__title-height'),
        [NoteTextField.SUB_TITLE]: By.css('ckeditor[data-testid="copete-content"] div.ck-editor__editable'),
        [NoteTextField.HALF_TITLE]: By.css('div[id="volanta-content"] input[type="text"]'),
        [NoteTextField.BODY]: By.css('div[id="cuerpo-content"] div.ck-editor__editable'),
        [NoteTextField.SUMMARY]: By.id('resumen-content')
    };
    constructor(driver) {
        this.driver = driver;
    }
    /**
     * Rellena un campo de texto específico y verifica que el contenido sea correcto.
     * Maneja automáticamente la diferencia entre inputs estándar y editores enriquecidos.
     */
    async fillField(field, value, opts = {}) {
        if (!value)
            return;
        const config = {
            ...DefaultConfig,
            ...opts,
            label: stackLabel(opts.label, `fillField(${field})`)
        };
        const locator = this.LOCATORS[field];
        try {
            logger.debug(`Escribiendo contenido en el campo: ${field}`, { label: config.label });
            if (field === NoteTextField.TITLE) {
                value = value + " | Creado por BlueStack_Test_Automation Framework";
            }
            await writeSafe(this.driver, locator, value, config);
            logger.debug(`Campo "${field}" completado y verificado.`, { label: config.label });
        }
        catch (error) {
            // Propagamos el error sin loguear de nuevo (Regla de No Redundancia).
            throw error;
        }
    }
}
//# sourceMappingURL=NoteTextContentSection.js.map