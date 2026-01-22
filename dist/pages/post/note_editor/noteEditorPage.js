import { NoteAuthorField } from "./authorField.js";
import { NoteFooterBtn } from "./footerBtn.js";
import { NoteHeaderActions } from "./headerActions.js";
import { NoteLateralSettings } from "./lateralSettings.js";
import { textFields, textField } from "./textFields.js";
import { NoteImageFields } from "./imageFields.js";
import { NoteCreationDropwdown } from "./noteCreationDropdown.js";
import { NoteTagField, NoteTagsFields } from './tagFields.js';
import { listicleFields } from './listicleFields.js';
import { stackLabel } from '../../../core/utils/stackLabel.js';
/**
 * Orquestador de los Page Object para la página de edición de una nota.
*/
export class NoteEditorPage {
    tagsFields;
    listicleFields;
    imageFields;
    authorFields;
    footerBtn;
    headerActions;
    settingsBtn;
    textFields;
    driver;
    creationDropdow;
    constructor(driver) {
        this.driver = driver;
        this.tagsFields = new NoteTagsFields(driver);
        this.listicleFields = new listicleFields(driver);
        this.imageFields = new NoteImageFields();
        this.authorFields = new NoteAuthorField(driver);
        this.footerBtn = new NoteFooterBtn();
        this.headerActions = new NoteHeaderActions(driver);
        this.settingsBtn = new NoteLateralSettings(driver);
        this.textFields = new textFields(driver);
        this.creationDropdow = new NoteCreationDropwdown(driver);
    }
    /**
       * Rellena todos los campos de la nota (texto, tags, autor, listicle, etc.)
       * @param data - El objeto NoteData completo.
       * @param timeout - Timeout para la operación
       * @param opts - Opciones de retry
       */
    async fillFields(data, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, '[NoteEditorPage.fillFields]') };
        console.log(`[NoteEditorPage] Iniciando proceso de llenado integral...`);
        // 1. Textos Core (Mapeo explícito y seguro)
        const textMapping = [
            { dataKey: 'title', fieldEnum: textField.TITLE },
            { dataKey: 'secondaryTitle', fieldEnum: textField.SECONDARY_TITLE },
            { dataKey: 'subTitle', fieldEnum: textField.SUB_TITLE },
            { dataKey: 'halfTitle', fieldEnum: textField.HALF_TITLE },
            { dataKey: 'body', fieldEnum: textField.BODY },
            { dataKey: 'summary', fieldEnum: textField.SUMMARY },
        ];
        for (const { dataKey, fieldEnum } of textMapping) {
            const value = data[dataKey];
            if (typeof value === 'string' && value.trim()) {
                await this.textFields.fillField(fieldEnum, value, timeout, fullOpts);
            }
        }
        // 2. Tags (Delegación limpia)
        if (data.tags?.length) {
            await this.tagsFields.addTags(NoteTagField.TAGS, data.tags, timeout, fullOpts);
        }
        if (data.hiddenTags?.length) {
            await this.tagsFields.addTags(NoteTagField.HIDDEN_TAGS, data.hiddenTags, timeout, fullOpts);
        }
        // 3. Listicle (Delegación limpia)
        if (data.listicleItems?.length) {
            await this.listicleFields.fillListicleItems(data.listicleItems, timeout, fullOpts);
        }
        // 4. Autor y Configuración Lateral
        await this.authorFields.fillAuthorField(data, timeout, fullOpts);
        await this.settingsBtn.selectFirstSectionOption(timeout, fullOpts);
        console.log(`[NoteEditorPage] Proceso finalizado exitosamente.`);
    }
}
//# sourceMappingURL=noteEditorPage.js.map