import { runSession } from "../core/wrappers/testWrapper.js";
import { getAuthUrl } from "../core/utils/getAuthURL.js";
import { passLogin } from "../flows/userSession.js";
import { createNewNote, closeNoteEditor } from "../flows/openCloseNote.js";
import { fillNote } from "../flows/populateNoteEditorFields.js";
import { PostData } from "../dataTest/noteData.js";
import { NoteType } from "../pages/post_page/SideBarNewNoteBtn.js";
import { NoteExitAction } from "../pages/post_page/note_editor_page/EditorHeaderActions.js";
import { CONFIG } from "../core/config/config.js";
import { description } from "allure-js-commons";

runSession('Nota Post Exitosamente', async ({ driver, opts, log }) => {

  description(`
          Flujo para crear una nota nueva de tipo Post desde 0, rellenar todos los campos que se encuentran en el objeto de data y publicar y salir.
          `)

  const { user, pass } = CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(CONFIG.baseUrl, CONFIG.auth.basic.user, CONFIG.auth.basic.pass);

  await driver.get(authUrl);
  await passLogin(driver, { username: user, password: pass }, opts);

  await createNewNote(driver, NoteType.POST, opts);
  await fillNote(driver, PostData[1], opts);
  await closeNoteEditor(driver, NoteExitAction.PUBLISH_AND_EXIT, opts);

  log.info("✅ Prueba de creación de Post exitosa.");
});