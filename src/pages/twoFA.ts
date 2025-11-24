import { By, Locator } from 'selenium-webdriver';

/**
 * Page Object para el modal de Doble Autenticación (2FA) que se descarta.
 */
export class TwoFAModal {
    public twoFAModalDismissButton: Locator = By.css('[data-testid="btn-next"]');
}

export const twoFAModal = new TwoFAModal();