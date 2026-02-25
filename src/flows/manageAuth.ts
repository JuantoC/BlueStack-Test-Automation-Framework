import { WebDriver } from "selenium-webdriver";
import * as allure from "allure-js-commons";
import { AuthPage } from "../pages/login_page/authPage.js";
import { DefaultConfig, RetryOptions } from "../core/config/default.js";
import { stackLabel } from "../core/utils/stackLabel.js";
import logger from "../core/utils/logger.js";

/**
 * Orquestador de negocio para realizar el flujo completo de autenticación.
 * @param driver - Instancia de WebDriver.
 * @param credentials - Credenciales de acceso (Username/Password).
 * @param opts - Opciones extendidas (timeoutMs, retries, label).
 */
export async function passLogin(
  driver: WebDriver, 
  credentials: { username: string; password: string }, 
  opts: RetryOptions = {}
): Promise<void> {
  const config = {
    ...DefaultConfig,
    ...opts,
    label: stackLabel(opts.label, "passLogin")
  };

  const page = new AuthPage(driver);

  // Envolvemos la lógica de negocio en un paso de Allure
  await allure.step(`Autenticación: ${credentials.username}`, async (stepContext) => {
    // Agregamos metadata valiosa al reporte (seguro, no logueamos la password)
    stepContext.parameter("Username", credentials.username);
    stepContext.parameter("Timeout", `${config.timeoutMs}ms`);

    try {
      logger.debug(`Iniciando proceso de autenticación para el usuario: ${credentials.username}`, { 
        label: config.label 
      });

      await page.passAuth(credentials, config);

      logger.debug(`Autenticación completada exitosamente para ${credentials.username}`, { 
        label: config.label 
      });

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