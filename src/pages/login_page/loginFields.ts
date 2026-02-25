import { By, Locator, WebDriver } from 'selenium-webdriver';
import { stackLabel } from "../../core/utils/stackLabel.js";
import { writeSafe } from "../../core/actions/writeSafe.js";
import { RetryOptions, DefaultConfig } from "../../core/config/default.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import logger from "../../core/utils/logger.js";

/**
 * Componente de campos de Login.
 * Maneja la interacción atómica con los inputs de credenciales y el botón de acceso.
 */
export class LoginFields {
  private readonly usernameField: Locator = By.id('username-field-log');
  private readonly passwordField: Locator = By.id('password-field-log');
  private readonly loginButton: Locator = By.css('button[data-testid="qa-login"]');
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async fillUsername(username: string, opts: RetryOptions = {}): Promise<void> {
    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, "fillUsername")
    };

    logger.debug(`Ingresando nombre de usuario`, { label: config.label });
    await writeSafe(this.driver, this.usernameField, username, config);
  }

  async fillPassword(password: string, opts: RetryOptions = {}): Promise<void> {
    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, "fillPassword")
    };

    // Seguridad: Logueamos la acción, pero NUNCA el valor de la contraseña.
    logger.debug(`Ingresando contraseña (valor oculto)`, { label: config.label });
    await writeSafe(this.driver, this.passwordField, password, config);
  }

  async clickLogin(opts: RetryOptions = {}): Promise<void> {
    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, "clickLogin")
    };

    logger.debug(`Ejecutando click en botón de acceso`, { label: config.label });
    await clickSafe(this.driver, this.loginButton, config);
  }

  /**
   * Orquestador de nivel de componente: Completa el formulario de acceso.
   */
  async fillLogin(username: string, password: string, opts: RetryOptions = {}): Promise<void> {
    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, "fillLogin")
    };

    try {
      await this.fillUsername(username, config);
      await this.fillPassword(password, config);
      await this.clickLogin(config);

      logger.debug(`Formulario de login completado para: ${username}`, { label: config.label });
    } catch (error: any) {
      // Dejamos que el error se propague; writeSafe/clickSafe ya habrán logueado el detalle técnico.
      throw error;
    }
  }
}