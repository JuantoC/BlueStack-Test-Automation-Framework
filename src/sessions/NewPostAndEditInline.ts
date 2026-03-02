import { runSession } from "../core/wrappers/testWrapper.js";
import { getAuthUrl } from "../core/utils/getAuthURL.js";
import { passLogin } from "../flows/userSession.js";
import { PostData } from "../dataTest/noteData.js";
import { CONFIG } from "../core/config/config.js";
import { fillNote } from "../flows/populateNoteEditorFields.js";
import { NoteType } from "../pages/post_page/SideBarNewNoteBtn.js";
import { NoteExitAction } from "../pages/post_page/note_editor_page/EditorHeaderActions.js";
import { closeNoteEditor, createNewNote } from "../flows/openCloseNote.js";
import { changePostTitle, enterToEditorPage } from "../flows/noteActions.js";
import { description } from "allure-js-commons";

runSession('Creacion de nota, titulo inline y edicion', async ({ driver, opts, log }) => {

  description(`
    Flujo para la creacion de una nota tipo Post, salir y guardar, luego editar y cambiar su titulo, y luego entrar a la pagina de su edicion desde el lapiz
    `)

  const { user, pass } = CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(CONFIG.baseUrl, CONFIG.auth.basic.user, CONFIG.auth.basic.pass);

  await driver.get(authUrl);
  await passLogin(driver, { username: user, password: pass }, opts);

  await createNewNote(driver, NoteType.POST, opts);
  await fillNote(driver, PostData[0], opts);
  await closeNoteEditor(driver, NoteExitAction.SAVE_AND_EXIT, opts);

  await changePostTitle(driver, PostData[0].title!, opts)

  await enterToEditorPage(driver, PostData[0].title!, opts)

  log.info("✅ Debug Session exitosa.");
});