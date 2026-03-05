import { ENV_CONFIG } from "../src/core/config/envConfig.js";
// Herramientas Core
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { runSession } from "../src/core/wrappers/testWrapper.js";
// Business Flows
import { passLogin } from "../src/flows/userSession.js";
import { dynimicDataFilling } from "../src/flows/populateNoteEditorFields.js";
import { createNewNote, closeNoteEditor } from "../src/flows/openCloseNote.js";
// Data y Enums
import { DebugData, PostData } from "../src/dataTest/noteData.js";
import { NoteType } from "../src/pages/post_page/SideBarNewNoteBtn.js";
import { NoteExitAction } from "../src/pages/post_page/note_editor_page/EditorHeaderActions.js";
import { description } from "allure-js-commons";

/**
 * TEST CASE: Creación de Nota tipo Listicle - 01
 */
runSession("Debug", async ({ driver, opts, log }) => {

  /* description(`
        Flujo para crear una nota nueva de tipo Lista desde 0, rellenar todos los campos que se encuentran en el objeto de data y salir desde la flecha, y guardar y salir.
        `)
 */

  const { user, pass } = ENV_CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);

  await driver.get(authUrl);
  await passLogin(driver, { username: user, password: pass }, opts);

  await createNewNote(driver, NoteType.POST, opts);
  await dynimicDataFilling(driver, DebugData, opts);
  /*   await closeNoteEditor(driver, NoteExitAction.BACK_SAVE_AND_EXIT, opts);
   */

  log.info("✅ Prueba de creación de Listicle exitosa.");
});
