import { WebDriver } from "selenium-webdriver";
import { LoginSection } from "./LoginSection.js";
import { TwoFASection } from "./TwoFASection.js";
import { RetryOptions, DefaultConfig } from "../../core/config/default.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import logger from "../../core/utils/logger.js";
import { AuthCredentials } from "../../environments/Dev_SAAS/env.config.js";
import { parameter } from "allure-js-commons";

export class MainLoginPage {
  public driver: WebDriver;
  public login: LoginSection;
  public twoFA: TwoFASection;
  public config: RetryOptions;

  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, "MainLoginPage")
    };
    this.driver = driver;
    this.login = new LoginSection(driver, this.config);
    this.twoFA = new TwoFASection(driver, this.config);
  }

  /**
   * Coordina el flujo completo de autenticación: Login + 2FA.
   * @param credentials - Objeto con usuario y contraseña (Interfaz AuthCredentials).
   */
  async passLoginAndTwoFA(
    credentials: AuthCredentials,
  ): Promise<void> {

    try {
      logger.debug('Rellenando version del CMS...')
      parameter("CMS_Version", await this.login.getVersionLabel(this.config));

      logger.debug("Iniciando componentes de autenticación...", { label: this.config.label });
      await this.login.passLogin(credentials.username, credentials.password);
      await this.twoFA.passTwoFA();

      logger.debug("Flujo AuthPage completado correctamente", { label: this.config.label });

    } catch (error: any) {
      throw error;
    }
  }
}