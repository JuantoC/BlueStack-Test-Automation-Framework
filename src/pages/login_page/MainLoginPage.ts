import { WebDriver } from "selenium-webdriver";
import { LoginSection } from "./LoginSection.js";
import { TwoFASection } from "./TwoFASection.js";
import { RetryOptions, resolveRetryConfig } from "../../core/config/defaultConfig.js";
import logger from "../../core/utils/logger.js";
import { AuthCredentials } from "./login.types.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";
import { parameter, step } from "allure-js-commons";

/**
 * Page Object Maestro para la autenticación en el CMS.
 * Coordina los sub-componentes `LoginSection` (credenciales) y `TwoFASection` (2FA)
 * para exponer flujos completos de autenticación: login exitoso con 2FA y prueba de intentos fallidos.
 * Es el único punto de entrada para tests que involucren la pantalla de login.
 *
 * @example
 * const page = new MainLoginPage(driver, opts);
 * await page.passLoginAndTwoFA({ username: 'user', password: 'pass' });
 */
export class MainLoginPage {
  private readonly login: LoginSection;
  private readonly twoFA: TwoFASection;
  private readonly config: RetryOptions;

  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.config = resolveRetryConfig(opts, "MainLoginPage");
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

    await step(`Autenticación Login + 2FA`, async (stepContext) => {
      stepContext.parameter("Username", credentials.username);
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug('Rellenando version del CMS...', { label: this.config.label })
        parameter("CMS_Version", await this.login.getVersionLabel(this.config));

        logger.debug(`Iniciando componentes de autenticación: ${credentials.username}`, { label: this.config.label });
        await this.login.passLogin(credentials.username, credentials.password);
        await this.twoFA.passTwoFA();

        logger.debug(`Flujo AuthPage completado correctamente: ${credentials.username}`, { label: this.config.label });

      } catch (error: unknown) {
        logger.error(`Error en passLoginAndTwoFA: ${getErrorMessage(error)}`, {
          label: this.config.label,
          error: getErrorMessage(error),
        });
        throw error;
      }
    });
  }

  /**
   * Ejecuta un flujo de login con intentos inválidos seguido de un acceso exitoso.
   * Itera sobre `invalidAttempts` usando `LoginSection.attemptLogin` y verifica que cada uno falle
   * con un mensaje de error visible. Si algún intento inválido tiene éxito, lanza un error de test.
   * Al finalizar los intentos inválidos, llama a `passLoginAndTwoFA` con las credenciales válidas.
   *
   * @param invalidAttempts - Lista de credenciales incorrectas que deben fallar en orden.
   * @param validCredentials - Credenciales válidas para el acceso final tras los intentos fallidos.
   */
  async failLogin(invalidAttempts: AuthCredentials[], validCredentials: AuthCredentials): Promise<void> {
    await step(`Flujo de Login Fallido (Intentos: ${invalidAttempts.length})`, async (stepContext) => {
      stepContext.parameter("Invalid Attempts Count", invalidAttempts.length.toString());
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug(`Iniciando intentos de login fallidos...`, { label: this.config.label });

        for (let i = 0; i < invalidAttempts.length; i++) {
          const attempt = await this.login.attemptLogin(invalidAttempts[i].username, invalidAttempts[i].password);

          if (attempt.success) {
            throw new Error(`El test esperaba fallar en el intento ${i + 1}, pero el login fue exitoso.`);
          }
          if (!attempt.errorMessage) {
            throw new Error(`El test esperaba un mensaje de error en la UI tras fallar, pero no se encontró ninguno.`);
          }
          logger.debug(`Intento ${i + 1} falló correctamente con error: ${attempt.errorMessage}`, { label: this.config.label });
        }

        logger.debug(`Intentos fallidos validados. Procediendo con credenciales válidas.`, { label: this.config.label });
        await this.passLoginAndTwoFA(validCredentials);

      } catch (error: unknown) {
        logger.error(`Error en failLogin: ${getErrorMessage(error)}`, {
          label: this.config.label,
          error: getErrorMessage(error),
        });
        throw error;
      }
    });
  }
}