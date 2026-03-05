import { runSession } from "../core/wrappers/testWrapper.js";
import { getAuthUrl } from "../core/utils/getAuthURL.js";
import { passLogin } from "../flows/userSession.js";
import { PostData } from "../dataTest/noteData.js";
import { ENV_CONFIG } from "../core/config/envConfig.js";
import { dynimicDataFilling } from "../flows/populateNoteEditorFields.js";
import { NoteType } from "../pages/post_page/SideBarNewNoteBtn.js";
import { NoteExitAction } from "../pages/post_page/note_editor_page/EditorHeaderActions.js";
import { closeNoteEditor, createNewNote } from "../flows/openCloseNote.js";
import { changePostTitle, enterToEditorPage } from "../flows/noteActions.js";
import { description } from "allure-js-commons";

runSession('Titulo inline y edicion', async ({ driver, opts, log }) => {

  description(`
### Test: Crear Post, editar titulo inline y publicar.
---
**Objetivo:** Validar la persistencia de datos al editar y la accesibilidad mediante el icono de edición.

**Flujo de pasos:**
1. Creación de nota tipo **Post**.
2. Llenado dinámico y guardado con salida (**SAVE_AND_EXIT**).
3. Modificación de título desde el listado.
4. Re-ingreso al editor mediante el **icono de lápiz**.
5. Publicación y salida final.

> **Resultado esperado:** La nota debe conservar los cambios y permitir el acceso directo.
`);

  const { user, pass } = ENV_CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);

  await driver.get(authUrl);
  await passLogin(driver, { username: user, password: pass }, opts);

  await createNewNote(driver, NoteType.POST, opts);
  await dynimicDataFilling(driver, PostData[2], opts);
  await closeNoteEditor(driver, NoteExitAction.SAVE_AND_EXIT, opts);

  await changePostTitle(driver, PostData[2].title!, opts)

  await enterToEditorPage(driver, PostData[2].title!, opts)
  await closeNoteEditor(driver, NoteExitAction.PUBLISH_AND_EXIT, opts);

  log.info("✅ Debug Session exitosa.");
});