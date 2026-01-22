import { By } from "selenium-webdriver";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
export var NoteExitAction;
(function (NoteExitAction) {
    // Acciones del Dropdown 'Guardar'
    NoteExitAction["SAVE_ONLY"] = "save only";
    NoteExitAction["SAVE_AND_EXIT"] = "save and exit";
    NoteExitAction["EXIT_WITHOUT_SAVING"] = "exit without saving";
    // Acciones del Dropdown 'Publicar'
    NoteExitAction["PUBLISH_ONLY"] = "publish only";
    NoteExitAction["PUBLISH_AND_EXIT"] = "publish and exit";
    NoteExitAction["SCHEDULE_AND_EXIT"] = "schedule";
    // Acciones del Botón 'Back'
    NoteExitAction["BACK_SAVE_AND_EXIT"] = "back save and exit";
    NoteExitAction["BACK_EXIT_DISCARD"] = "back exit discard";
})(NoteExitAction || (NoteExitAction = {}));
/**
 * Clase para acciones del header
 */
export class NoteHeaderActions {
    driver;
    // ========== LOCATORS ORIGINALES Y RENOMBRADOS ==========
    // Los locators se definen como constantes privadas (readonly) para mayor seguridad.
    // 1. Botones de Acción Principal / Desplegables
    SAVE_BTN = By.css('[data-testid="btn-save-post"] button[data-testid="dropdown-action"]');
    PUBLISH_BTN = By.css('button.btn-info[data-testid="dropdown-action"]');
    BACK_BTN = By.css('a[data-testid="btn-exit-note"]'); // Tu 'backBtn' original
    // 2. Contenedores de Dropdowns (Aunque no se usan para el clic, los mantenemos si son necesarios para waits)
    DROPDOWN_SAVE_CONTAINER = By.id('dropdown-save'); // Tu 'dropdownSave' original
    DROPDOWN_PUBLISH_CONTAINER = By.id('dropdown-publish'); // Tu 'dropdownPublish' original
    // 3. Opciones de Dropdown (Guardar)
    SAVE_AND_EXIT_OPT = By.id("option-dropdown-0"); // Tu 'saveAndExitBtn' original
    EXIT_WITHOUT_SAVING_OPT = By.id("option-dropdown-1"); // Tu 'exitBtn' original
    // 4. Opciones de Dropdown (Publicar)
    PUBLISH_AND_EXIT_OPT = By.id("option-dropdown-0"); // Tu 'publishAndExitBtn' original
    SCHEDULE_OPT = By.id("option-dropdown-1"); // Tu 'scheduleBtn' original
    // 5. Modales
    MODAL_SAVE_AND_EXIT_BTN = By.css('[data-testid="btn-ok-confirmModal"] button');
    MODAL_DISCARD_EXIT_BTN = By.css('[data-testid="btn-cancel"] button');
    MODAL_PUBLISH_CONFIRM_BTN = By.css('app-cmsmedios-button[data-testid="post-note-confirm"] button[data-testid="btn-calendar-confirm"]'); // Tu 'publishBtnModal' original
    MODAL_CANCEL_BTN = By.css('app-cmsmedios-button[data-testid="post-note-cancel"] button[data-testid="btn-calendar-confirm"]'); // Tu 'cancelBtnModal' original (Añadido aunque no se use en las salidas)
    // ========== LOCATOR MAPS DINÁMICOS ==========
    locatorMap = {
        // Acciones que inician con el botón de Guardar (desplegable)
        [NoteExitAction.SAVE_ONLY]: this.SAVE_BTN,
        [NoteExitAction.SAVE_AND_EXIT]: this.DROPDOWN_SAVE_CONTAINER,
        [NoteExitAction.EXIT_WITHOUT_SAVING]: this.DROPDOWN_SAVE_CONTAINER,
        // Acciones que inician con el botón de Publicar (desplegable o directo)
        [NoteExitAction.PUBLISH_ONLY]: this.PUBLISH_BTN,
        [NoteExitAction.PUBLISH_AND_EXIT]: this.DROPDOWN_PUBLISH_CONTAINER,
        [NoteExitAction.SCHEDULE_AND_EXIT]: this.DROPDOWN_PUBLISH_CONTAINER,
        // Acciones que inician con el botón de Volver (Back)
        [NoteExitAction.BACK_SAVE_AND_EXIT]: this.BACK_BTN,
        [NoteExitAction.BACK_EXIT_DISCARD]: this.BACK_BTN,
    };
    constructor(driver) {
        this.driver = driver;
    }
    // ========== MÉTODO PADRE CENTRALIZADO ==========
    async clickExitAction(action, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, `[clickExitAction]: ${action}`) };
        // 1. Clicar el primer elemento usando el locatorMap
        const initialLocator = this.locatorMap[action];
        if (!initialLocator) {
            throw new Error(`[NoteHeaderActions]: Acción de salida no mapeada: ${action}`);
        }
        await clickSafe(this.driver, initialLocator, timeout, fullOpts);
        // 2. Manejar la secuencia posterior (Dropdowns, Modales, etc.)
        switch (action) {
            case NoteExitAction.SAVE_ONLY:
                // Clic simple, la acción se completó.
                break;
            // --- Dropdown de Guardar: Clic a la Opción ---
            case NoteExitAction.SAVE_AND_EXIT:
                await clickSafe(this.driver, this.SAVE_AND_EXIT_OPT, timeout, fullOpts);
                break;
            case NoteExitAction.EXIT_WITHOUT_SAVING:
                await clickSafe(this.driver, this.EXIT_WITHOUT_SAVING_OPT, timeout, fullOpts);
                await clickSafe(this.driver, this.MODAL_DISCARD_EXIT_BTN, timeout, fullOpts);
                break;
            // --- Publicación Directa: Clic al Modal de Confirmación ---
            case NoteExitAction.PUBLISH_ONLY:
                await clickSafe(this.driver, this.MODAL_PUBLISH_CONFIRM_BTN, timeout, fullOpts);
                break;
            // --- Dropdown de Publicar: Clic a la Opción ---
            case NoteExitAction.PUBLISH_AND_EXIT:
                await clickSafe(this.driver, this.PUBLISH_AND_EXIT_OPT, timeout, fullOpts);
                await clickSafe(this.driver, this.MODAL_PUBLISH_CONFIRM_BTN, 20000, fullOpts);
                break;
            case NoteExitAction.SCHEDULE_AND_EXIT:
                await clickSafe(this.driver, this.SCHEDULE_OPT, timeout, fullOpts);
                break;
            // --- Salida por Botón 'Back': Secuencia Compleja ---
            case NoteExitAction.BACK_SAVE_AND_EXIT:
                await clickSafe(this.driver, this.MODAL_SAVE_AND_EXIT_BTN, timeout, fullOpts);
                break;
            case NoteExitAction.BACK_EXIT_DISCARD:
                await clickSafe(this.driver, this.MODAL_DISCARD_EXIT_BTN, timeout, fullOpts);
                break;
            default:
                break;
        }
    }
}
//# sourceMappingURL=headerActions.js.map