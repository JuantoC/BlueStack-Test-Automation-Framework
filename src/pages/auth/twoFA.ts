import { By, Locator, WebDriver } from 'selenium-webdriver';
import { RetryOptions } from "../../core/wrappers/retry.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { stackLabel } from "../../core/utils/stackLabel.js";

/**
 * Page Object para el modal de Doble Autenticación (2FA) que se descarta.
 */
export class TwoFAFields {
    public driver: WebDriver
    public twoFAModalDismissButton: Locator = By.css('[data-testid="btn-next"]');


    constructor(driver: WebDriver) {
        this.driver = driver;
    }

    async passTwoFA(timeout: number, opts: RetryOptions) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, 'passTwoFA') };
        console.log(`[${fullOpts.label}] Haciendo click en "I Will do it later"`);
        await clickSafe(this.driver, this.twoFAModalDismissButton, timeout, fullOpts);
    }
}