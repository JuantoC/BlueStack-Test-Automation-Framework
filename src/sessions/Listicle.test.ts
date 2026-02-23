import { CONFIG } from "../core/config/config.js";
// Herramientas Core
import { getAuthUrl } from "../core/utils/getAuthURL.js";
import { runSession } from "../core/wrappers/testWrapper.js";
// Business Flows
import { passLogin } from "../flows/manageAuth.js";
import { fillNote } from "../flows/fillNote.js";
import { createNewNote, closeNoteEditor } from "../flows/noteLifecycleManager.js";
// Data y Enums
import { ListicleData } from "../dataTest/noteData.js";
import { NoteType } from "../pages/post/note_editor/NoteCreationDropdown.js";
import { NoteExitAction } from "../pages/post/note_editor/NoteHeaderActions.js";

/**
 * TEST CASE: Creación de Nota tipo Listicle - 01
 */
runSession("Crear Listicle exitosamente", async ({ driver, opts, log }) => {

  // 1. Setup de datos (único boiler necesario)
  const { user, pass } = CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(CONFIG.baseUrl, CONFIG.auth.basic.user, CONFIG.auth.basic.pass);

  // 2. Lógica de negocio pura
  await driver.get(authUrl);
  await passLogin(driver, { username: user, password: pass }, opts);

  await createNewNote(driver, NoteType.LISTICLE, opts);
  await fillNote(driver, ListicleData[0], opts);
  await closeNoteEditor(driver, NoteExitAction.BACK_SAVE_AND_EXIT, opts);


  log.info("✅ Prueba de creación de Listicle exitosa.");
});
