import { AuthPage } from "../pages/auth/authPage.js";
import { stackLabel } from "../core/utils/stackLabel.js";
/**
 * Realiza el proceso completo de login en la aplicación.
 * @param driver La instancia del WebDriver.
 * @param credentials El objeto con el usuario y la contraseña.
 * @param timeout Tiempo máximo de espera para cada acción.
 * @param opts Objeto de opciones de reintento (ej. retries, label).
 */
export async function passLogin(driver, credentials, timeout, opts = {}) {
    const fullOpts = { ...opts, label: stackLabel(opts.label, `passLogin:${credentials.username}`) };
    const page = new AuthPage(driver);
    console.log(`[${fullOpts.label}]`);
    await page.passAuth(credentials, timeout, fullOpts);
}
//# sourceMappingURL=manageAuth.js.map