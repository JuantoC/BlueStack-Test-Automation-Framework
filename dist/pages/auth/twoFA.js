import { By } from 'selenium-webdriver';
import { clickSafe } from '../../core/actions/clickSafe';
import { stackLabel } from '../../core/utils/stackLabel';
/**
 * Page Object para el modal de Doble Autenticación (2FA) que se descarta.
 */
export class TwoFAFields {
    driver;
    twoFAModalDismissButton = By.css('[data-testid="btn-next"]');
    constructor(driver) {
        this.driver = driver;
    }
    async passTwoFA(timeout, opts) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, 'passTwoFA') };
        console.log(`[${fullOpts.label}] Haciendo click en "I Will do it later"`);
        await clickSafe(this.driver, this.twoFAModalDismissButton, timeout, fullOpts);
    }
}
//# sourceMappingURL=twoFA.js.map