import { By } from 'selenium-webdriver';
import { stackLabel } from '../../core/utils/stackLabel';
import { writeSafe } from '../../core/actions/writeSafe';
import { clickSafe } from '../../core/actions/clickSafe';
/**
 * Page Object para la página de Login.
 */
export class LoginFields {
    usernameField = By.id('username-field-log');
    passwordField = By.id('password-field-log');
    loginButton = By.css('.security-card-submit-button');
    driver;
    constructor(driver) {
        this.driver = driver;
    }
    // ========== MÉTODOS ==========
    async fillUsername(username, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, 'fillUsername') };
        console.log(`[${fullOpts.label}] Rellenando username: ${username}`);
        await writeSafe(this.driver, this.usernameField, username, timeout, fullOpts);
    }
    async fillPassword(password, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, 'fillPassword') };
        console.log(`[${fullOpts.label}] Rellenando password`);
        await writeSafe(this.driver, this.passwordField, password, timeout, fullOpts);
    }
    async clickLogin(timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, 'clickLogin') };
        console.log(`[${fullOpts.label}] Haciendo click en login`);
        await clickSafe(this.driver, this.loginButton, timeout, fullOpts);
    }
    /**
     * Método completo - Hace login con credenciales
     */
    async fillLogin(username, password, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, 'LoginPage.login') };
        await this.fillUsername(username, timeout, fullOpts);
        await this.fillPassword(password, timeout, fullOpts);
        await this.clickLogin(timeout, fullOpts);
    }
}
//# sourceMappingURL=loginFields.js.map