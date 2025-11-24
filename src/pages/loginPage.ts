import { By, Locator } from 'selenium-webdriver';

/**
 * Page Object para la página de Login.
 */
export class LoginPage {
    // Campos de Login
    public usernameField: Locator = By.id('username-field-log');
    public passwordField: Locator = By.id('password-field-log');
    
    // Botones
    public loginButton: Locator = By.css('.security-card-submit-button');
}

export const loginPage = new LoginPage();