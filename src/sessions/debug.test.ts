runSession("Debug", async ({ driver, opts, log }) => {

  /* description(`
  Flujo para crear una nota nueva de tipo Lista desde 0, rellenar todos los campos que se encuentran en el objeto de data y salir desde la flecha, y guardar y salir.
  `)
  */

  const { user, pass } = ENV_CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);

  await driver.get(authUrl);
  await passLogin(driver, { username: user, password: pass }, opts);
  await moveToComponent(driver, SidebarOption.VIDEOS, opts);

  /*  await createNewNote(driver, NoteType.POST, opts);
   await dynimicDataFilling(driver, DebugData, opts);
   await closeNoteEditor(driver, NoteExitAction.BACK_SAVE_AND_EXIT, opts);
  */

  log.info("✅ Prueba de DEBUG exitosa.");
});

import { ENV_CONFIG } from "../core/config/envConfig.js";
import { getAuthUrl } from "../core/utils/getAuthURL.js";
import { runSession } from "../core/wrappers/testWrapper.js";
import { passLogin } from "../flows/userSession.js";
import { dynimicDataFilling } from "../flows/populateNoteEditorFields.js";
import { createNewNote, closeNoteEditor, moveToComponent } from "../flows/sidebar&HeaderAction.js";
import { DebugData, PostData } from "../dataTest/noteData.js";
import { NoteType, SidebarOption } from "../pages/post_page/SidebarSection.js";
import { NoteExitAction } from "../pages/post_page/note_editor_page/EditorHeaderActions.js";
import { description } from "allure-js-commons";
