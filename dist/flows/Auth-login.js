import { clickSafe, writeSafe } from "../core/Core-Interactions.js";
// ===========================================
//               FLUJOS DE AUTENTICACIÓN
// ===========================================
/**
 * Realiza el proceso completo de login en la aplicación.
 * @param driver La instancia del WebDriver.
 * @param credentials El objeto con el usuario y la contraseña.
 * @param locators El conjunto de localizadores del ambiente actual.
 */
export async function loginUser(driver, credentials, locators) {
    console.log(`Intentando login con usuario: ${credentials.username}`);
    await writeSafe(driver, locators.usernameField, credentials.username);
    await writeSafe(driver, locators.passwordField, credentials.password);
    await clickSafe(driver, locators.loginButton, locators.TIMEOUTS.LONG, "Login Button");
    console.log('Login exitoso. Esperando la redirección a la pantalla principal...');
}
//# sourceMappingURL=Auth-Login.js.map