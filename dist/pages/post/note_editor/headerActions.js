import { stackLabel } from "../../../core/utils/stackLabel";
import { clickSafe } from "../../../core/actions/clickSafe";
/**
 * Clase para acciones del header
 */
export class NoteHeaderActions {
    // ========== LOCATORS ==========
    saveBtn = By.css('button[data-testid="dropdown-actions"]');
    dropdownSave = By.id('dropdown-save');
    saveAndExitBtn = By.id("option-dropdown-0");
    exitBtn = By.id("option-dropdown-1");
    dropdownPublish = By.id('dropdown-publish');
    publishBtn = By.css('button[data-testid="dropdown-action"]');
    publishAndExitBtn = By.id("option-dropdown-0");
    scheduleBtn = By.id("option-dropdown-1");
    backBtn = By.css('a[data-testid="btn-exit-note"]');
    // Modales
    exitAnywayBtnModal = By.css('app-cmsmedios-button[data-testid="btn-cancel"]');
    saveAndExitBtnModal = By.css('button[data-testid="btn-calendar-confirm"]');
    publishBtnModal = By.css('app-cmsmedios-button[data-testid="post-note-confirm"] button[data-testid="btn-calendar-confirm"]');
    cancelBtnModal = By.css('app-cmsmedios-button[data-testid="post-note-cancel"] button[data-testid="btn-calendar-confirm"]');
    driver;
    constructor(driver) {
        this.driver = driver;
    }
    // ========== MÉTODOS ==========
    async clickSave(timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, 'clickSave') };
        await clickSafe(this.driver, this.saveBtn, timeout, fullOpts);
    }
    async clickSaveDropdown(action, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, 'clickSaveAndExit') };
        await clickSafe(this.driver, this.dropdownSave, timeout, fullOpts);
        switch (action) {
            case 'save and exit':
                await clickSafe(this.driver, this.saveAndExitBtn);
                break;
            case 'exit':
                await clickSafe(this.driver, this.exitBtn);
                break;
            default:
                throw new Error(`${action} no es una opcion correcta. "save and exit" o "exit" parametros permitidos `);
        }
        await clickSafe(this.driver, this.saveAndExitBtn, timeout, fullOpts);
    }
    async clickPublish(timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, 'clickPublish') };
        await clickSafe(this.driver, this.publishBtn, timeout, fullOpts);
        await clickSafe(this.driver, this.publishBtnModal, timeout, fullOpts);
    }
    async clickBack(action, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, 'clickBack') };
        await clickSafe(this.driver, this.backBtn, timeout, fullOpts);
        switch (action) {
            case 'save':
                await clickSafe(this.driver, this.saveAndExitBtnModal);
                break;
            case 'exit':
                await clickSafe(this.driver, this.exitAnywayBtnModal);
                break;
            default:
                throw new Error(`${action} no es una opcion correcta. "save" o "exit" parametros permitidos `);
        }
    }
    async clickPublishDropdown(action, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, 'clickSaveAndExit') };
        await clickSafe(this.driver, this.dropdownPublish, timeout, fullOpts);
        switch (action) {
            case 'publish and exit':
                await clickSafe(this.driver, this.publishAndExitBtn);
                break;
            case 'schedule':
                await clickSafe(this.driver, this.scheduleBtn);
                break;
            default:
                throw new Error(`${action} no es una opcion correcta. "save and exit" o "exit" parametros permitidos `);
        }
        await clickSafe(this.driver, this.saveAndExitBtn, timeout, fullOpts);
    }
}
//# sourceMappingURL=headerActions.js.map