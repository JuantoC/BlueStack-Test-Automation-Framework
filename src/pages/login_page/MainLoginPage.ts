import { WebDriver } from "selenium-webdriver";
import { LoginSection } from "./LoginSection.js";
import { TwoFASection } from "./TwoFASection.js";
import { RetryOptions, DefaultConfig } from "../../core/config/defaultConfig.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import logger from "../../core/utils/logger.js";
import { AuthCredentials } from "../../interfaces/auth.js";
import { parameter, step } from "allure-js-commons";

export class MainLoginPage {
  private driver: WebDriver;
  private readonly login: LoginSection;
  private readonly twoFA: TwoFASection;
  private readonly config: RetryOptions;

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

    await step(`Autenticación: ${credentials.username}`, async (stepContext) => {
      stepContext.parameter("Username", credentials.username);
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug('Rellenando version del CMS...', { label: this.config.label })
        parameter("CMS_Version", await this.login.getVersionLabel(this.config));

        logger.debug(`Iniciando componentes de autenticación: ${credentials.username}`, { label: this.config.label });
        await this.login.passLogin(credentials.username, credentials.password);
        await this.twoFA.passTwoFA();

        logger.debug(`Flujo AuthPage completado correctamente: ${credentials.username}`, { label: this.config.label });

      } catch (error: any) {
        throw error;
      }
    });
  }

  async failLogin(invalidAttempts: AuthCredentials[], validCredentials: AuthCredentials) {
    for (let i = 0; i < invalidAttempts.length; i++) {
      const attempt = await this.login.attemptLogin(invalidAttempts[i].username, invalidAttempts[i].password);

      if (attempt.success) {
        throw new Error(`El test esperaba fallar en el intento ${i + 1}, pero el login fue exitoso.`);
      }
      // Podríamos validar que attempt.errorMessage es el texto correcto ("Contraseña incorrecta", etc)
    }
    await this.passLoginAndTwoFA(validCredentials);
  }
}