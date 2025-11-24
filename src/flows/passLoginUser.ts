import { WebDriver } from "selenium-webdriver";
import { clickSafe } from "../core/actions/clickSafe.js";
import { writeSafe } from "../core/actions/writeSafe.js";
import { loginPage } from '../pages/loginPage.js';

/**
 * Realiza el proceso completo de login en la aplicación.
 * @param driver La instancia del WebDriver.
 * @param credentials El objeto con el usuario y la contraseña.
 */
export async function passLoginUser(driver: WebDriver, credentials: { username: string; password: string }): Promise<void> {

  console.log(`Intentando login con usuario: ${credentials.username}`);
  await writeSafe(driver, loginPage.usernameField, credentials.username, 1500, { label: "loginUser / Username Field : writeSafe" });
  await writeSafe(driver, loginPage.passwordField, credentials.password, 1500, { label: "loginUser / Password Field: writeSafe" });
  await clickSafe(driver, loginPage.loginButton, 1500, { label: "loginUser / Login Button : clickSafe" });
  console.log('Login exitoso. Esperando la redirección a la pantalla principal...');
}