import { CONFIG } from "../src/core/config/config.js";
// Herramientas Core
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { runSession } from "../src/core/wrappers/testWrapper.js";
// Business Flows
import { passLogin } from "../src/flows/userSession.js";
import { fillNote } from "../src/flows/populateNoteEditorFields.js";
import { createNewNote, closeNoteEditor } from "../src/flows/openCloseNote.js";
// Data y Enums
import { PostData } from "../src/dataTest/noteData.js";
import { NoteType } from "../src/pages/post_page/SideBarNewNoteBtn.js";
import { NoteExitAction } from "../src/pages/post_page/note_editor_page/EditorHeaderActions.js";
import { sleep } from "../src/core/utils/backOff.js";

/**
 * TEST CASE: Creación de Notas tipo Post con stress del CMS - 02
 */
runSession("Stress Test", async ({ driver, opts, log }) => {

  // 1. Setup de datos (único boiler necesario)
  const { user, pass } = CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(CONFIG.baseUrl, CONFIG.auth.basic.user, CONFIG.auth.basic.pass);

  // 2. Lógica de negocio pura
  await driver.get(authUrl);
  await passLogin(driver, { username: user, password: pass }, opts);

  await sleep(1000 * 60 * 2)

  await createNewNote(driver, NoteType.POST, opts);
  await fillNote(driver, PostData[1], opts);
  await closeNoteEditor(driver, NoteExitAction.SAVE_AND_EXIT, opts);

  await sleep(1000 * 60 * 2)

  await createNewNote(driver, NoteType.POST, opts);
  await fillNote(driver, PostData[2], opts);
  await closeNoteEditor(driver, NoteExitAction.BACK_SAVE_AND_EXIT, opts);

  await sleep(1000 * 60 * 2)

  log.info("✅ Prueba de estres exitosa.");
});