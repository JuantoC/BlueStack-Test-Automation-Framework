import { NoteAuthorField } from "./authorField.js";
import { NoteFooterBtn } from "./footerBtn.js";
import { NoteHeaderActions } from "./headerActions.js";
import { NoteSidebarDropdow } from "./sidebarDropdown.js";
import { NoteTextFields } from "./textFields.js";
import { NoteImageFields } from "./imageFields.js";
import { NoteCreationDropwdown } from "./noteCreationDropdown.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";
/**
 * Orquestador de los Page Object para la página de edición de una nota.
*/
export class NoteEditorPage {
    imageFields;
    authorFields;
    footerBtn;
    headerActions;
    sidebarDropdown;
    textFields;
    driver;
    creationDropdow;
    constructor(driver) {
        this.driver = driver;
        this.imageFields = new NoteImageFields();
        this.authorFields = new NoteAuthorField(driver);
        this.footerBtn = new NoteFooterBtn();
        this.headerActions = new NoteHeaderActions(driver);
        this.sidebarDropdown = new NoteSidebarDropdow();
        this.textFields = new NoteTextFields(driver);
        this.creationDropdow = new NoteCreationDropwdown(driver);
    }
    /**
       * Rellena todos los campos de la nota (texto, tags, autor, listicle, etc.)
       * @param data - El objeto NoteData completo.
       * @param timeout - Timeout para la operación
       * @param opts - Opciones de retry
       */
    async fillFields(data, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, 'NoteEditorPage.fillFields') };
        console.log(`[${fullOpts.label}] Iniciando llenado de campos...`);
        // 1. NoteTextFields para Textos, Tags y Listicles
        await this.textFields.fillNoteData(data, timeout, fullOpts);
        // 2. Manejar campos de autor
        if (data.authorType) {
            await this.authorFields.selectAuthorType(data.authorType, timeout, fullOpts);
        }
        if (data.authorName !== undefined && data.authorName.trim() !== "") {
            await this.authorFields.fillAuthorName(data.authorName, timeout, fullOpts);
        }
        if (data.authorDescription !== undefined && data.authorDescription.trim() !== "") {
            await this.authorFields.fillAuthorDescription(data.authorDescription, timeout, fullOpts);
        }
        // 3. (Opcional) Manejar campos de Imagen, si existieran
        // if (data.image) { await this.imageFields.fillImage(data.image, timeout, fullOpts); }
        console.log(`[${fullOpts.label}] Llenado de campos completado.`);
    }
}
//# sourceMappingURL=noteEditorPage.js.map