import { WebDriver } from "selenium-webdriver";
import { clickSafe } from "./clickSafe.js";
import { writeSafe } from "./writeSafe.js";
import { loginPage } from '../../pages/loginPage.js';
import { RetryOptions, retry } from "../wrappers/retry.js";
import { stackLabel } from "../utils/stackLabel.js";

/**
 * Realiza el proceso completo de login en la aplicación.
 * @param driver La instancia del WebDriver.
 * @param credentials El objeto con el usuario y la contraseña.
 * @param timeout Tiempo máximo de espera para cada acción.
 * @param opts Objeto de opciones de reintento (ej. retries, label).
 */
export async function passLoginUser(driver: WebDriver, credentials: { username: string; password: string }, timeout: number, opts: RetryOptions = {}): Promise<void> {
  const fullOpts: RetryOptions = { ...opts, label: stackLabel(opts.label, `passLoginUser : ${credentials.username}`) };

  console.log(`[${fullOpts.label}]`);
  return retry(
    async () => {
      try {
        await writeSafe(driver, loginPage.usernameField, credentials.username, timeout, fullOpts);
        await writeSafe(driver, loginPage.passwordField, credentials.password, timeout, fullOpts);
        await clickSafe(driver, loginPage.loginButton, timeout, fullOpts);
        console.log('Login exitoso.');
      } catch (error: any) {
        console.error(`[${fullOpts.label}] Falla en login: ${error.message}`);
        throw error;
      }
  })
}