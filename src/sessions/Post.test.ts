// src/sessions/Post.test.ts
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

/**
 * TEST CASE: Creación de Nota tipo Post - 01
 */

// Usamos el wrapper. Jest leerá este archivo y registrará el test() automáticamente.
runSession('Crear Post Exitoso', async (sessionLabel) => {
  const sessionTransport = addSessionTransport(sessionLabel);
  const opts: RetryOptions = { ...DefaultConfig, label: sessionLabel };

  const { user, pass } = CONFIG.getCredentials('editor');
  const { user: bUser, pass: bPass } = CONFIG.auth.basic;
  const authUrl = getAuthUrl(CONFIG.baseUrl, bUser, bPass);

  let session: DriverSession | null = null;

  try {
    logger.info(`>>> Iniciando Sesión: ${sessionLabel} <<<`, { label: sessionLabel });

    session = await initializeDriver({
      isHeadless: CONFIG.browser.isHeadless,
      useGrid: CONFIG.grid.useGrid
    }, opts);

    const { driver } = session;

    await driver.get(authUrl);
    await passLogin(driver, { username: user, password: pass }, opts);

    await createNewNote(driver, NoteType.POST, opts);
    await fillNote(driver, PostData[0], opts);
    await closeNoteEditor(driver, NoteExitAction.SAVE_ONLY, opts);

    logger.info(`✅ Prueba ${sessionLabel} finalizada con éxito.`, { label: sessionLabel });

  } catch (error: any) {
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