import { CONFIG } from "../core/config/config.js";
// Herramientas Core
import { getAuthUrl } from "../core/utils/getAuthURL.js";
import { runSession } from "../core/wrappers/testWrapper.js";
// Business Flows
import { passLogin } from "../flows/userSession.js";
import { fillNote } from "../flows/populateNoteEditorFields.js";
import { createNewNote, closeNoteEditor } from "../flows/openCloseNote.js";
// Data y Enums
import { ListicleData } from "../dataTest/noteData.js";
import { NoteType } from "../pages/post_page/SideBarNewNoteBtn.js";
import { NoteExitAction } from "../pages/post_page/note_editor_page/EditorHeaderActions.js";
import { description } from "allure-js-commons";

/**
 * TEST CASE: Creación de Nota tipo Listicle - 01
 */
runSession("Nota Listicle exitosamente", async ({ driver, opts, log }) => {

  description(`
        Flujo para crear una nota nueva de tipo Lista desde 0, rellenar todos los campos que se encuentran en el objeto de data y salir desde la flecha, y guardar y salir.
        `)

  const { user, pass } = CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(CONFIG.baseUrl, CONFIG.auth.basic.user, CONFIG.auth.basic.pass);

  await driver.get(authUrl);
  await passLogin(driver, { username: user, password: pass }, opts);

  await createNewNote(driver, NoteType.LISTICLE, opts);
  await fillNote(driver, ListicleData[0], opts);
  await closeNoteEditor(driver, NoteExitAction.BACK_SAVE_AND_EXIT, opts);


  log.info("✅ Prueba de creación de Listicle exitosa.");
});
