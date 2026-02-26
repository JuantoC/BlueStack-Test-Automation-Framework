import { runSession } from "../core/wrappers/testWrapper.js";
import { getAuthUrl } from "../core/utils/getAuthURL.js";
import { passLogin } from "../flows/manageAuth.js";
import { createNewNote, closeNoteEditor } from "../flows/noteLifecycleManager.js";
import { fillNote } from "../flows/fillNote.js";
import { PostData } from "../dataTest/noteData.js";
import { NoteType } from "../pages/sidebar_options/NewNoteBtn.js";
import { NoteExitAction } from "../pages/post_page/note_editor_page/EditorHeaderActions.js";
import { CONFIG } from "../core/config/config.js";
import { PostTable } from "../pages/post_page/post_container/postTable.js";
import logger from "../core/utils/logger.js";

runSession('Debug Session', async ({ driver, opts, log }) => {

  // 1. Setup de datos (único boiler necesario)
  const { user, pass } = CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(CONFIG.baseUrl, CONFIG.auth.basic.user, CONFIG.auth.basic.pass);

  // 2. Lógica de negocio pura
  await driver.get(authUrl);
  await passLogin(driver, { username: user, password: pass }, opts);

  const postPage = (new PostTable(driver))
  const postContainer = await postPage.getPostContainerByTitle(PostData[3].title!, opts);

  await postPage.changePostTitleToStandard(postContainer, opts);

  await postPage.clickEditorButton(postContainer, opts);

  logger.info("✅ Debug Session exitosa.");
});