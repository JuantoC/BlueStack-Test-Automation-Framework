// src/core/wrappers/testWrapper.ts
import * as allure from "allure-js-commons";
import { WebDriver } from "selenium-webdriver";
import { CONFIG } from "../config/config.js";
import { DefaultConfig, RetryOptions } from "../config/default.js";
import { initializeDriver, quitDriver, DriverSession } from "../actions/driverManager.js";
import { checkConsoleErrors } from "../utils/browserLogs.js";
import logger, { addSessionTransport } from "../utils/logger.js";

// Definimos qué recibe el test
interface TestContext {
  driver: WebDriver;
  session: DriverSession; // Por si necesitas acceso al monitor u otros internals
  opts: RetryOptions;
  log: typeof logger;
}

export function runSession(
  sessionLabel: string,
  testLogic: (context: TestContext) => Promise<void>
) {
  const targetFile = process.env.TEST_FILE;
  if (targetFile && !sessionLabel.includes(targetFile)) return;

  test(`Sesión: ${sessionLabel}`, async () => {
    // --- 1. CONFIGURACIÓN INICIAL ---
    await allure.owner("Bluestack-Test-Automation");
    await allure.parameter("Session", sessionLabel);

    const sessionTransport = addSessionTransport(sessionLabel);
    const opts: RetryOptions = { ...DefaultConfig, label: sessionLabel };
    let session: DriverSession | null = null;

    try {
      logger.info(`>>> Iniciando Sesión: ${sessionLabel} <<<`, { label: sessionLabel });

      // Inicializamos Driver (incluye el NetworkMonitor por tu config anterior)
      session = await initializeDriver({
        isHeadless: CONFIG.browser.isHeadless,
        useGrid: CONFIG.grid.useGrid
      }, opts);

      // --- 2. EJECUCIÓN DEL TEST ---
      // Le pasamos todo lo necesario al callback del usuario
      await testLogic({
        driver: session.driver,
        session: session,
        opts,
        log: logger
      });

    } catch (error: any) {
      // --- 3. MANEJO DE ERRORES AUTOMÁTICO ---
      // Screenshot automático
      if (session?.driver) {
        try {
          const screenshot = await session.driver.takeScreenshot();
          await allure.attachment(`Fallo_Visual_${sessionLabel}`, Buffer.from(screenshot, 'base64'), 'image/png');
        } catch (scrErr) {
          logger.error("No se pudo tomar screenshot del fallo.");
        }
      }

      const msg = error.diff ? `${error.message}\n>>> DIFF <<< ${error.diff}` : error.message;
      logger.error(`❌ FALLO CRÍTICO en ${sessionLabel}`, { label: sessionLabel, details: msg });

      throw error; // Re-lanzamos para que Jest falle

    } finally {
      // --- 4. CIERRE Y VERIFICACIÓN DE RED ---
      if (session) {
        // A. Logs de consola del browser
        await checkConsoleErrors(session.driver, sessionLabel);

        // B. Verificación de Network Monitor (Tu requisito principal)
        let networkError = null;
        if (session.networkMonitor) {
          const summary = await session.networkMonitor.stop(); // Esto ya adjunta el .txt a Allure
          if (summary.errorCount > 0) {
            networkError = new Error(`[Network Error] Test pasó, pero tuvo ${summary.errorCount} errores de red (4xx/5xx).`);
          }
        }

        // C. Apagar Driver
        logger.info("Cerrando sesión...", { label: sessionLabel });
        await quitDriver(session, opts);

        // D. Si hubo error de red, fallamos el test AHORA (después de cerrar todo)
        if (networkError) {
          throw networkError;
        }
      }
      logger.remove(sessionTransport);
    }
  });
}