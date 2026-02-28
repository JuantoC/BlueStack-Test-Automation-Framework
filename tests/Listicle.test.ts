import { CONFIG } from "../src/core/config/config.js";
// Herramientas Core
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { runSession } from "../src/core/wrappers/testWrapper.js";
// Business Flows
import { passLogin } from "../src/flows/manageAuth.js";
import { fillNote } from "../src/flows/fillNote.js";
import { createNewNote, closeNoteEditor } from "../src/flows/noteLifecycleManager.js";
// Data y Enums
import { ListicleData } from "../src/dataTest/noteData.js";
import { NoteType } from "../src/pages/sidebar_options/NewNoteBtn.js";
import { NoteExitAction } from "../src/pages/post_page/note_editor_page/EditorHeaderActions.js";

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
  await fillNote(driver, ListicleData[1], opts);
  await closeNoteEditor(driver, NoteExitAction.BACK_SAVE_AND_EXIT, opts);


  log.info("✅ Prueba de creación de Listicle exitosa.");
});
