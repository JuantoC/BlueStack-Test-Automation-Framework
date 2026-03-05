import * as allure from "allure-js-commons";
import { WebDriver } from "selenium-webdriver";
import { ENV_CONFIG } from "../config/envConfig.js";
import { DefaultConfig, RetryOptions } from "../config/defaultConfig.js";
import { initializeDriver, quitDriver, DriverSession } from "../actions/driverManager.js";
import { checkConsoleErrors } from "../utils/browserLogs.js";
import logger, { addSessionTransport } from "../utils/logger.js";

// 1. Definimos la interfaz para la metadata opcional
export interface TestMetadata {
  epic?: string;
  feature?: string;
  story?: string;
  severity?: "blocker" | "critical" | "normal" | "minor" | "trivial";
  issueId?: string; // Para el ticket de Jira/Bug
  tags?: string[];
}

// Definimos qué recibe el test
interface TestContext {
  driver: WebDriver;
  session: DriverSession; // Por si necesitas acceso al monitor u otros internals
  opts: RetryOptions;
  log: typeof logger;
}

// 2. Actualizamos la firma del wrapper (añadimos metadata = {})
export function runSession(
  sessionLabel: string,
  testLogic: (context: TestContext) => Promise<void>,
  metadata: TestMetadata = {} // <-- Opcional para no romper tests existentes
) {

  test(`Sesión: ${sessionLabel}`, async () => {
    const sessionTransport = addSessionTransport(sessionLabel);
    const opts: RetryOptions = { ...DefaultConfig, label: sessionLabel };
    let session: DriverSession | null = null;

    // --- SECCIÓN A: INYECCIÓN DE METADATA EN ALLURE ---

    // A.1 Inyectar Metadata de Negocio (del test)
    if (metadata.epic) await allure.epic(metadata.epic);
    if (metadata.feature) await allure.feature(metadata.feature);
    if (metadata.story) await allure.story(metadata.story);
    if (metadata.severity) await allure.severity(metadata.severity);
    if (metadata.tags) {
      for (const tag of metadata.tags) {
        await allure.label("tag", tag);
      }
    }

    // Links a Jira / Test Management (Allure los hace clickeables en el reporte)
    if (metadata.issueId) await allure.issue("Jira", `https://bluestack-cms.atlassian.net/browse/${metadata.issueId}`);

    // A.2 Inyectar Metadata de Entorno (Automático desde el .env)
    // Esto es clave para que Allure sepa en qué entorno corrió esta ejecución
    await allure.owner("BlueStack Automation Team");
    await allure.parameter("Execution", ENV_CONFIG.grid.useGrid === true ? "Grid Docker" : "Local");
    await allure.parameter("Headless", ENV_CONFIG.browser.isHeadless === true ? "true" : "false");

    try {
      logger.info(`>>> Iniciando Sesión: ${sessionLabel} <<<`, { label: sessionLabel });

      // Inicializamos Driver (incluye el NetworkMonitor por tu config anterior)
      session = await initializeDriver({
        isHeadless: ENV_CONFIG.browser.isHeadless,
        useGrid: ENV_CONFIG.grid.useGrid
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
          logger.error("No se pudo tomar screenshot del fallo.", { label: opts.label });
        }
      }

      const msg = error.diff ? `${error.message}\n>>> DIFF <<< ${error.diff}` : error.message;
      logger.error(`❌ FALLO CRÍTICO en ${opts.label}`, { label: opts.label, details: msg });

      throw error; // Re-lanzamos para que Jest falle

    } finally {
      // --- 4. CIERRE Y VERIFICACIÓN DE RED ---
      if (session) {
        // A. Logs de consola del browser
        await checkConsoleErrors(session.driver, opts);

        // B. Verificación de Network Monitor (Tu requisito principal)
        let networkError = null;
        if (session.networkMonitor) {
          const summary = await session.networkMonitor.stop(); // Esto ya adjunta el .txt a Allure
          if (summary.errorCount > 0) {
            networkError = new Error(`[Network Error] Test pasó, pero tuvo ${summary.errorCount} errores de red (4xx/5xx).`);
          }
        }

        // C. Apagar Driver
        logger.info("Cerrando sesión...", { label: opts.label });
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