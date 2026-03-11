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
  await changeVideoTitle(driver, NativeVideoData[0].title, opts)

  await sleep(15000)
  /*  await createNewNote(driver, NoteType.POST, opts);
   await dynimicDataFilling(driver, DebugData, opts);
   await closeNoteEditor(driver, NoteExitAction.BACK_SAVE_AND_EXIT, opts);
  */

  log.info("✅ Prueba de DEBUG exitosa.");
});

import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { runSession } from "../src/core/wrappers/testWrapper.js";
import { passLogin } from "../src/flows/userSession.js";
import { dynimicDataFilling } from "../src/flows/populateNoteEditorFields.js";
import { createNewNote, closeNoteEditor, moveToComponent } from "../src/flows/sidebar&HeaderAction.js";
import { DebugData, PostData } from "../dataTest/noteData.js"
import { NoteType, SidebarOption } from "../src/pages/post_page/SidebarSection.js";
import { NoteExitAction } from "../src/pages/post_page/note_editor_page/EditorHeaderActions.js";
import { description } from "allure-js-commons";
import { uploadNewVideo } from "../src/flows/UploadNewVideo.js";
import { NativeVideoData, YoutubeVideoData, } from "../dataTest/videoData.js";
import { sleep } from "../src/core/utils/backOff.js";
import { changePostTitle } from "../src/flows/noteActions.js";
import { changeVideoTitle } from "../src/flows/videoActions.js";

