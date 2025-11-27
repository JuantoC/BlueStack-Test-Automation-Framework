import { By } from "selenium-webdriver";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";
/**
 * Component Object para el dropdown de selección del tipo de nota (Post, Listicle, LiveBlog, etc.).
 */
export class NoteCreationDropwdown {
    openDropdownBtn = By.css("button.btn-create-note");
    driver;
    constructor(driver) {
        this.driver = driver;
    }
    /**
     * Función de Locator para los tipos de nota en el modal de creación.
     * @param noteType El tipo de nota usando el enum NoteType.
     * @returns Un Locator (By.css) que apunta al botón correcto.
     */
    getNoteTypeLocator(noteType) {
        const config = NOTE_TYPE_CONFIG[noteType];
        if (!config) {
            throw new Error(`Error de Locator: El tipo de nota "${noteType}" no está definido.`);
        }
        return By.css(`#option-dropdown-${config.index} label`);
    }
    /**
     * Obtiene el nombre de visualización de un tipo de nota.
     * @param noteType El tipo de nota usando el enum NoteType.
     * @returns El nombre legible del tipo de nota.
     */
    getNoteTypeDisplayName(noteType) {
        return NOTE_TYPE_CONFIG[noteType].displayName;
    }
    async selectNoteType(noteType, timeout, opts) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, `selectNoteType:${noteType}`) };
        console.log(`Iniciando selección del tipo de nota: ${noteType}`);
        // 1. Click en el botón para abrir el dropdown
        console.log("Haciendo click en el botón para abrir el dropdown...");
        await clickSafe(this.driver, this.openDropdownBtn, timeout, fullOpts);
        // 2. Click en la opción elegida
        const noteTypeOptionLocator = this.getNoteTypeLocator(noteType);
        const displayName = this.getNoteTypeDisplayName(noteType);
        console.log(`Haciendo click en la opción: "${displayName}"`);
        await clickSafe(this.driver, noteTypeOptionLocator, timeout, fullOpts);
        console.log(`Tipo de nota "${displayName}" seleccionado con éxito.`);
    }
}
/**
 * Enum para los tipos de nota disponibles.
 */
export var NoteType;
(function (NoteType) {
    NoteType["POST"] = "POST";
    NoteType["LISTICLE"] = "LISTICLE";
    NoteType["LIVEBLOG"] = "LIVEBLOG";
})(NoteType || (NoteType = {}));
/**
 * Configuración de los tipos de nota con sus índices y nombres.
 */
const NOTE_TYPE_CONFIG = {
    [NoteType.POST]: { index: '0', displayName: 'New Post' },
    [NoteType.LISTICLE]: { index: '1', displayName: 'New Listicle' },
    [NoteType.LIVEBLOG]: { index: '2', displayName: 'New LiveBlog' }
};
//# sourceMappingURL=noteCreationDropdown.js.map