import * as allure from "allure-js-commons";
import { CONFIG } from "../core/config/config.js";

// Herramientas Core
import { DriverSession, initializeDriver, quitDriver } from "../core/actions/driverManager.js";
import { getAuthUrl } from "../core/utils/getAuthURL.js";
import logger, { addSessionTransport } from "../core/utils/logger.js";
import { checkConsoleErrors } from "../core/utils/browserLogs.js";
import { runSession } from "../core/wrappers/testWrapper.js";

// Business Flows
import { passLogin } from "../flows/manageAuth.js";
import { fillNote } from "../flows/fillNote.js";
import { createNewNote, closeNoteEditor } from "../flows/noteLifecycleManager.js";

// Data y Enums
import { PostData } from "../dataTest/noteData.js";
import { NoteType } from "../pages/post/note_editor/NoteCreationDropdown.js";
import { NoteExitAction } from "../pages/post/note_editor/NoteHeaderActions.js";
import { DefaultConfig, RetryOptions } from "../core/config/default.js";
import { sleep } from "../core/utils/backOff.js";

/**
 * TEST CASE: Creación de Notas tipo Post con stress del CMS - 02
 */
runSession("Stress Test", async (sessionLabel: string) => {
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

    await sleep(1000 * 60 * 2)

    // 3. Creación de Nota tipo Post
    await createNewNote(driver, NoteType.POST, opts);

    // 4. Llenado Dinámico de la Nota
    await fillNote(driver, PostData[1], opts);

    // 5. Salida
    await closeNoteEditor(driver, NoteExitAction.SAVE_AND_EXIT, opts);

    await sleep(1000 * 60 * 2)

    await createNewNote(driver, NoteType.POST, opts);

    await fillNote(driver, PostData[2], opts);

    await closeNoteEditor(driver, NoteExitAction.BACK_SAVE_AND_EXIT, opts);

    await sleep(1000 * 60 * 2)

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
});