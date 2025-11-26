import { WebDriver } from "selenium-webdriver";
import { AuthPage } from '../pages/auth/authPage.js';
import { RetryOptions } from "../core/wrappers/retry.js";
import { stackLabel } from "../core/utils/stackLabel.js";

/**
 * Realiza el proceso completo de login en la aplicación.
 * @param driver La instancia del WebDriver.
 * @param credentials El objeto con el usuario y la contraseña.
 * @param timeout Tiempo máximo de espera para cada acción.
 * @param opts Objeto de opciones de reintento (ej. retries, label).
 */
export async function passLogin(driver: WebDriver, credentials: { username: string; password: string }, timeout: number, opts: RetryOptions = {}): Promise<void> {
  const fullOpts: RetryOptions = { ...opts, label: stackLabel(opts.label, `passLoginUser:${credentials.username}`) };
  const page = new AuthPage(driver)

  console.log(`[${fullOpts.label}]`);
  page.passAuth(credentials, timeout, fullOpts)
}
