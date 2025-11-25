import { WebDriver } from "selenium-webdriver";
import { clickSafe } from "../core/actions/clickSafe.js";
import { writeSafe } from "../core/actions/writeSafe.js";
import { loginLocators } from '../pages/login/mainLogin.js';
import { RetryOptions, retry } from "../core/wrappers/retry.js";
import { stackLabel } from "../core/utils/stackLabel.js";

/**
 * Realiza el proceso completo de login en la aplicación.
 * @param driver La instancia del WebDriver.
 * @param credentials El objeto con el usuario y la contraseña.
 * @param timeout Tiempo máximo de espera para cada acción.
 * @param opts Objeto de opciones de reintento (ej. retries, label).
 */
export async function passLoginUser(driver: WebDriver, credentials: { username: string; password: string },  timeout: number, opts: RetryOptions = {}): Promise<void> {
  const fullOpts: RetryOptions = { ...opts, label: stackLabel(opts.label, `passLoginUser:${credentials.username}`) };

  console.log(`[${fullOpts.label}]`);
  return retry(
    async () => {
      try {
        await writeSafe(driver, loginLocators.usernameField, credentials.username, timeout, fullOpts);
        await writeSafe(driver, loginLocators.passwordField, credentials.password, timeout, fullOpts);
        await clickSafe(driver, loginLocators.loginButton, timeout, fullOpts);
        console.log('Login exitoso.');
      } catch (error: any) {
        console.error(`[${fullOpts.label}] Falla en login: ${error.message}`);
        throw error;
      }
  })
}