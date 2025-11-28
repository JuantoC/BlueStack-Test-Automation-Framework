import { By } from 'selenium-webdriver';
import { stackLabel } from "../../core/utils/stackLabel.js";
import { writeSafe } from "../../core/actions/writeSafe.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
/**
 * Page Object para la página de Login.
 */
export class LoginFields {
    usernameField = By.id('username-field-log');
    passwordField = By.id('password-field-log');
    loginButton = By.css('button[data-testid="qa-login"]');
    driver;
    constructor(driver) {
        this.driver = driver;
    }
    // ========== MÉTODOS ==========
    async fillUsername(username, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, `[fillUsername]:${username}`) };
        console.log(`[fillUsername]: Rellenando username ${username}`);
        await writeSafe(this.driver, this.usernameField, username, timeout, fullOpts);
    }
    async fillPassword(password, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, `[fillPassword]:${password}`) };
        console.log(`[fillPassword]: Rellenando Password ${password}`);
        await writeSafe(this.driver, this.passwordField, password, timeout, fullOpts);
    }
    async clickLogin(timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, '[clickLogin]') };
        console.log(`[clickLogin]: cCickando en submit`);
        await clickSafe(this.driver, this.loginButton, timeout, fullOpts);
    }
    /**
     * Método completo - Hace login con credenciales
     */
    async fillLogin(username, password, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, `[fillLogin]`) };
        try {
            await this.fillUsername(username, timeout, fullOpts);
            await this.fillPassword(password, timeout, fullOpts);
            await this.clickLogin(timeout, fullOpts);
        }
        catch (err) {
            throw err;
        }
    }
}
//# sourceMappingURL=loginFields.js.map