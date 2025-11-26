import { By, Locator, WebDriver } from 'selenium-webdriver';
import { stackLabel } from '../../core/utils/stackLabel';
import { writeSafe } from '../../core/actions/writeSafe';
import { RetryOptions } from '../../core/wrappers/retry';
import { clickSafe } from '../../core/actions/clickSafe';

/**
 * Page Object para la página de Login.
 */
export class LoginFields {
  public usernameField: Locator = By.id('username-field-log');
  public passwordField: Locator = By.id('password-field-log');
  public loginButton: Locator = By.css('.security-card-submit-button');
  public driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  // ========== MÉTODOS ==========
  async fillUsername(username: string, timeout: number = 1500, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, 'fillUsername') };
    console.log(`[${fullOpts.label}] Rellenando username: ${username}`);
    await writeSafe(this.driver, this.usernameField, username, timeout, fullOpts);
  }

  async fillPassword(password: string, timeout: number = 1500, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, 'fillPassword') };
    console.log(`[${fullOpts.label}] Rellenando password`);
    await writeSafe(this.driver, this.passwordField, password, timeout, fullOpts);
  }

  async clickLogin(timeout: number = 1500, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, 'clickLogin') };
    console.log(`[${fullOpts.label}] Haciendo click en login`);
    await clickSafe(this.driver, this.loginButton, timeout, fullOpts);
  }

  /**
   * Método completo - Hace login con credenciales
   */
  async fillLogin(username: string, password: string, timeout: number = 1500, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, 'LoginPage.login') };

    await this.fillUsername(username, timeout, fullOpts);
    await this.fillPassword(password, timeout, fullOpts);
    await this.clickLogin(timeout, fullOpts);
  }
}
