import * as allure from "allure-js-commons";
import { WebDriver } from "selenium-webdriver";
import { ENV_CONFIG } from "../config/envConfig.js";
import { DefaultConfig, RetryOptions } from "../config/defaultConfig.js";
import { initializeDriver, quitDriver, DriverSession } from "../config/driverManager.js";
import { ToastMonitorHandle } from "../config/toastMonitor.js";
import { checkConsoleErrors } from "../utils/browserLogs.js";
import logger, { addSessionTransport } from "../utils/logger.js";
import { getErrorMessage } from "../utils/errorUtils.js";

/**
 * Metadata de negocio y clasificación para el reporte Allure del test.
 * Todos los campos son opcionales para permitir adopción incremental sin romper tests existentes.
 * Los campos se inyectan como labels y links en el reporte Allure vía `runSession`.
 */
export interface TestMetadata {
  epic?: string;
  feature?: string;
  story?: string;
  severity?: "blocker" | "critical" | "normal" | "minor" | "trivial";
  issueId?: string; // Para el ticket de Jira/Bug
  tags?: string[];
}

/**
 * Contexto inyectado en cada función de test por `runSession`.
 * Provee acceso al driver WebDriver activo, a los monitores CDP y a la configuración de reintentos.
 * Usar este contexto para interactuar con el navegador y acceder a los metadatos de ejecución.
 */
export interface TestContext {
  driver: WebDriver;
  session: DriverSession; // Por si necesitas acceso al monitor u otros internals
  opts: RetryOptions;
  log: typeof logger;
  toastMonitor: ToastMonitorHandle | null;
}

/**
 * Wrapper principal de sesión de prueba. Punto de entrada estándar para todos los archivos `.test.ts`.
 * Orquesta el ciclo de vida completo de un test: inyección de metadata en Allure, inicialización
 * del WebDriver, ejecución de la lógica del test, captura de screenshot ante fallos,
 * verificación de errores de red via CDP y cierre limpio de la sesión.
 *
 * @param sessionLabel - Nombre descriptivo de la sesión, usado como etiqueta en logs y reporte Allure.
 * @param testLogic - Función asíncrona con la lógica del test. Recibe `driver`, `session`, `opts`, `log` y `toastMonitor`.
 * @param metadata - Metadata de clasificación para Allure (epic, feature, story, severity, etc.). Opcional.
 *
 * @example
 * runSession("Crear Post Básico", async ({ driver, opts }) => {
 *   const page = new MainPostPage(driver, NoteType.POST, opts);
 *   await page.createNewNote();
 * }, { epic: "Posts", feature: "Creación", severity: "critical" });
 */
export function runSession(
  sessionLabel: string,
  testLogic: (context: TestContext) => Promise<void>,
  metadata: TestMetadata = {} // <-- Opcional para no romper tests existentes
) {

  test(`Sesión: ${sessionLabel}`, async () => {
    const sessionTransport = addSessionTransport(sessionLabel);
    const opts: RetryOptions = { ...DefaultConfig, label: sessionLabel };
    let session: DriverSession | null = null;
    let testError: unknown = null;

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
        log: logger,
        toastMonitor: session.toastMonitor
      });

    } catch (error: unknown) {
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

      const msg = (error as any).diff ? `${getErrorMessage(error)}\n>>> DIFF <<< ${(error as any).diff}` : getErrorMessage(error);
      logger.error(`❌ FALLO CRÍTICO en ${opts.label}`, { label: opts.label, details: msg });

      testError = error; // Guardamos para relanzar en finally, sin perderlo

    } finally {
      // --- 4. CIERRE Y VERIFICACIÓN DE RED ---
      if (session) {
        // A. Logs de consola del browser
        await checkConsoleErrors(session.driver);

        // B. Verificación de Network Monitor
        let networkError: Error | null = null;
        if (session.networkMonitor) {
          const summary = await session.networkMonitor.stop();
          if (summary.errorCount > 0) {
            networkError = new Error(`[Network Error] ${summary.errorCount} error(s) de red (4xx/5xx) detectados. Ver adjunto Allure.`);
          }
        }

        // B2. Verificación Toast Monitor (soft: reporta en Allure, no lanza error propio)
        if (session.toastMonitor) {
          await session.toastMonitor.stop();
          // Los logs warn y attachments ya se emiten dentro de stop() y en tiempo real por evento
        }

        // C. Apagar Driver
        logger.info("Cerrando sesión...", { label: opts.label });
        await quitDriver(session, opts);

        // D. Composición final de errores: el error del test tiene prioridad.
        //    Si el test pasó pero hubo error de red, lanzamos ese.
        //    Si el test falló Y además hubo error de red, los combinamos para no perder ninguno.
        if (testError && networkError) {
          const combined = new Error(
            `${getErrorMessage(testError)}\n\nAdemás: ${networkError.message}`
          );
          throw combined;
        }
        if (testError) {
          throw testError;
        }
        if (networkError) {
          throw networkError;
        }
      }
      logger.remove(sessionTransport);
    }
  });
}