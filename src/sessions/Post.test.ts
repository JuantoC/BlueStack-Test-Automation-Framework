import { runSession } from "../core/wrappers/testWrapper.js";
import { getAuthUrl } from "../core/utils/getAuthURL.js";
import { passLogin } from "../flows/manageAuth.js";
import { createNewNote, closeNoteEditor } from "../flows/noteLifecycleManager.js";
import { fillNote } from "../flows/fillNote.js";
import { PostData } from "../dataTest/noteData.js";
import { NoteType } from "../pages/post/note_editor/NoteCreationDropdown.js";
import { NoteExitAction } from "../pages/post/note_editor/NoteHeaderActions.js";
import { CONFIG } from "../core/config/config.js";

runSession('Crear Post Exitosamente', async ({ driver, opts, log }) => {

  // 1. Setup de datos (único boiler necesario)
  const { user, pass } = CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(CONFIG.baseUrl, CONFIG.auth.basic.user, CONFIG.auth.basic.pass);

  // 2. Lógica de negocio pura
  await driver.get(authUrl);
  await passLogin(driver, { username: user, password: pass }, opts);

  await createNewNote(driver, NoteType.POST, opts);
  await fillNote(driver, PostData[0], opts);
  await closeNoteEditor(driver, NoteExitAction.SAVE_ONLY, opts);

  log.info("✅ Prueba de creación de Post exitosa.");
});