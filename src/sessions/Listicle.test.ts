import * as allure from "allure-js-commons";
import { CONFIG } from "../core/config/config.js";

// Herramientas Core
import { DriverSession, initializeDriver, quitDriver } from "../core/actions/driverManager.js";
import { getAuthUrl } from "../core/utils/getAuthURL.js";
import logger, { addSessionTransport } from "../core/utils/logger.js";
import { checkConsoleErrors } from "../core/utils/browserLogs.js";

// Business Flows
import { passLogin } from "../flows/manageAuth.js";
import { fillNote } from "../flows/fillNote.js";
import { createNewNote, closeNoteEditor } from "../flows/noteLifecycleManager.js";

// Data y Enums
import { ListicleData } from "../dataTest/noteData.js";
import { NoteType } from "../pages/post/note_editor/NoteCreationDropdown.js";
import { NoteExitAction } from "../pages/post/note_editor/NoteHeaderActions.js";
import { DefaultConfig, RetryOptions } from "../core/config/default.js";

/**
 * TEST CASE: Creación de Nota tipo Post - 01
 */
export async function run(sessionLabel: string): Promise<void> {
  const sessionTransport = addSessionTransport(sessionLabel);
  const opts: RetryOptions = { ...DefaultConfig, label: sessionLabel };

  // Obtenemos credenciales y URL desde el CONFIG centralizado
  const { user, pass } = CONFIG.getCredentials('editor');
  const { user: bUser, pass: bPass } = CONFIG.auth.basic;
  const authUrl = getAuthUrl(CONFIG.baseUrl, bUser, bPass);

  let session: DriverSession | null = null;

  try {
    logger.info(`>>> Iniciando Sesión: ${sessionLabel} <<<`, { label: sessionLabel });

    // 1. Setup del Entorno usando CONFIG
    session = await initializeDriver({
      isHeadless: CONFIG.browser.isHeadless,
      useGrid: CONFIG.grid.useGrid
    }, opts);

    const { driver } = session;

    // 2. Ejecución de flujos (Lógica Limpia)
    await driver.get(authUrl);
    await passLogin(driver, { username: user, password: pass }, opts);
    // 3. Creación de Listicle
    await createNewNote(driver, NoteType.LISTICLE, opts);
    // 4. Llenado Dinámico 
    await fillNote(driver, ListicleData[0], opts);
    // 5. Salida
    await closeNoteEditor(driver, NoteExitAction.BACK_SAVE_AND_EXIT, opts);


    logger.info(`✅ Prueba ${sessionLabel} finalizada con éxito.`, { label: sessionLabel });

  } catch (error: any) {
    // Evidencia visual solo en caso de error
    if (session?.driver) {
      const screenshot = await session.driver.takeScreenshot();
      await allure.attachment(`Fallo_${sessionLabel}`, Buffer.from(screenshot, 'base64'), 'image/png');
    }

    const msg = error.diff ? `${error.message}\n>>> DIFF <<< ${error.diff}` : error.message;
    logger.error(`❌ FALLO CRÍTICO en ${sessionLabel}`, { label: sessionLabel, details: msg });

    throw error;
  } finally {
    if (session) {
      await checkConsoleErrors(session.driver, sessionLabel);
      await quitDriver(session, opts);
    }
    logger.remove(sessionTransport);
  }
}