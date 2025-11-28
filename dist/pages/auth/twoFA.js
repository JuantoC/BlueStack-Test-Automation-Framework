import { By } from 'selenium-webdriver';
import { clickSafe } from "../../core/actions/clickSafe.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
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
        const fullOpts = { ...opts, label: stackLabel(opts.label, '[passTwoFA]') };
        console.log(`[passTwoFA] Haciendo click en "I Will do it later"`);
        await clickSafe(this.driver, this.twoFAModalDismissButton, timeout, fullOpts);
    }
}
//# sourceMappingURL=twoFA.js.map