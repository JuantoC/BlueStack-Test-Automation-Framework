import { WebDriver } from "selenium-webdriver";
import * as allure from "allure-js-commons";
import { MainLoginPage } from "../pages/login_page/MainLoginPage.js";
import { DefaultConfig, RetryOptions } from "../core/config/defaultConfig.js";
import { stackLabel } from "../core/utils/stackLabel.js";
import logger from "../core/utils/logger.js";
import { AuthCredentials } from "../environments/Dev_SAAS/env.config.js";

/**
 * Orquestador de negocio para realizar el flujo completo de autenticación.
 * @param driver - Instancia de WebDriver.
 * @param credentials - Credenciales de acceso (Username/Password).
 * @param opts - Opciones extendidas (timeoutMs, retries, label).
 */
export async function passLogin(
  driver: WebDriver,
  credentials: AuthCredentials,
  opts: RetryOptions = {}
): Promise<void> {
  const config = {
    ...DefaultConfig,
    ...opts,
    label: stackLabel(opts.label, "passLogin")
  };

  const page = new MainLoginPage(driver, config);

  await allure.step(`Autenticación: ${credentials.username}`, async (stepContext) => {
    stepContext.parameter("Username", credentials.username);
    stepContext.parameter("Timeout", `${config.timeoutMs}ms`);

    try {
      logger.info(`Iniciando proceso de autenticación para el usuario: ${credentials.username}`, { label: config.label });
      await page.passLoginAndTwoFA(credentials);
      logger.info(`Autenticación completada exitosamente para ${credentials.username}`, { label: config.label });

    } catch (error: any) {
      logger.error(`Fallo en el proceso de Login: ${error.message}`, {
        label: config.label,
        user: credentials.username,
        error: error.message
      });
      throw error;
    }
  });
}

export async function failLogin(driver: WebDriver, invalidAttempts: AuthCredentials[], validCredentials: AuthCredentials, opts: RetryOptions = {}) {
  const config = {
    ...DefaultConfig,
    ...opts,
    label: stackLabel(opts.label, "failLogin")
  };

  const page = new MainLoginPage(driver, config);

  // 1. Quemamos los intentos fallidos
  for (let i = 0; i < invalidAttempts.length; i++) {
    const attempt = await page.login.attemptLogin(invalidAttempts[i].username, invalidAttempts[i].password);

    if (attempt.success) {
      throw new Error(`El test esperaba fallar en el intento ${i + 1}, pero el login fue exitoso.`);
    }
    // Podríamos validar que attempt.errorMessage es el texto correcto ("Contraseña incorrecta", etc)
  }

  // 2. Finalmente, ingresamos el correcto
  await page.passLoginAndTwoFA(validCredentials);
}