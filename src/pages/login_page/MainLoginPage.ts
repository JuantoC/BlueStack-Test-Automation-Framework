import { WebDriver } from "selenium-webdriver";
import { LoginFields } from "./LoginSection.js";
import { TwoFAFields } from "./TwoFASection.js";
import { RetryOptions, DefaultConfig } from "../../core/config/default.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import logger from "../../core/utils/logger.js";
import { AuthCredentials } from "../../environments/Dev_SAAS/env.config.js";

export class AuthPage {
  public driver: WebDriver;
  public login: LoginFields;
  public twoFA: TwoFAFields;

  constructor(driver: WebDriver) {
    this.driver = driver;
    this.login = new LoginFields(driver);
    this.twoFA = new TwoFAFields(driver);
  }

  /**
   * Coordina el flujo completo de autenticación: Login + 2FA.
   * @param credentials - Objeto con usuario y contraseña (Interfaz AuthCredentials).
   * @param opts - Opciones que incluyen timeoutMs, retries y label.
   */
  async passAuth(
    credentials: AuthCredentials,
    opts: RetryOptions = {}
  ): Promise<void> {
    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, "passAuth")
    };

    try {
      logger.debug("Iniciando componentes de autenticación...", { label: config.label });

      // 1. Fase de Login
      await this.login.fillLogin(credentials.username, credentials.password, config);

      // 2. Fase de Segundo Factor
      await this.twoFA.passTwoFA(config);

      logger.debug("Flujo AuthPage completado correctamente", { label: config.label });

    } catch (error: any) {
      throw error;
    }
  }
}