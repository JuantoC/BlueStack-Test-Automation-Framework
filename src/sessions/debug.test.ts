import { runSession } from "../core/wrappers/testWrapper.js";
import { getAuthUrl } from "../core/utils/getAuthURL.js";
import { passLogin } from "../flows/manageAuth.js";
import { PostData } from "../dataTest/noteData.js";
import { CONFIG } from "../core/config/config.js";
import { PostTable } from "../pages/post_page/post_container/postTable.js";
import logger from "../core/utils/logger.js";
import { fillNote } from "../flows/fillNote.js";
import { NoteType } from "../pages/sidebar_options/NewNoteBtn.js";
import { NoteExitAction } from "../pages/post_page/note_editor_page/EditorHeaderActions.js";
import { closeNoteEditor, createNewNote } from "../flows/noteLifecycleManager.js";

runSession('Debug Session', async ({ driver, opts, log }) => {

  // 1. Setup de datos (único boiler necesario)
  const { user, pass } = CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(CONFIG.baseUrl, CONFIG.auth.basic.user, CONFIG.auth.basic.pass);

  // 2. Lógica de negocio pura
  await driver.get(authUrl);
  await passLogin(driver, { username: user, password: pass }, opts);

  await createNewNote(driver, NoteType.POST, opts);
  await fillNote(driver, PostData[5], opts);
  await closeNoteEditor(driver, NoteExitAction.SAVE_AND_EXIT, opts);
  
  const postPage = (new PostTable(driver))
  const postContainer = await postPage.getPostContainerByTitle(PostData[5].title!, opts);

  await postPage.changePostTitle(postContainer, opts);

  const postContainerUpdated = await postPage.getPostContainerByTitle(postPage.NEW_SUFFIX, opts);
  await postPage.clickEditorButton(postContainerUpdated, opts);

  logger.info("✅ Debug Session exitosa.");
});