import { runSession } from "../core/wrappers/testWrapper.js";
import { getAuthUrl } from "../core/utils/getAuthURL.js";
import { passLogin } from "../flows/userSession.js";
import { createNewNote, closeNoteEditor } from "../flows/sidebar&HeaderAction.js";
import { dynimicDataFilling } from "../flows/populateNoteEditorFields.js";
import { PostData } from "../dataTest/noteData.js";
import { NoteType } from "../pages/post_page/SidebarSection.js";
import { NoteExitAction } from "../pages/post_page/note_editor_page/EditorHeaderActions.js";
import { ENV_CONFIG } from "../core/config/envConfig.js";
import { description } from "allure-js-commons";
import { enterToEditorPage } from "../flows/noteActions.js";

runSession('Nota Post Exitosamente', async ({ driver, opts, log }) => {

  description(`
### Test: Crear Post exitosamente, entrar y publicar.
---
**Objetivo:** Verificar que un Post nuevo se guarde y publique correctamente tras re-ingresar.

**Detalles del flujo:**
* **Acción 1:** Creación desde cero + **SAVE_AND_EXIT**.
* **Acción 2:** Re-entrada para validación.
* **Acción 3:** **PUBLISH_ONLY** (sin salir).

**Criterio de Aceptación:** Los datos deben reflejarse íntegramente en la UI.
`);
  const { user, pass } = ENV_CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);

  await driver.get(authUrl);
  await passLogin(driver, { username: user, password: pass }, opts);

  await createNewNote(driver, NoteType.POST, opts);
  await dynimicDataFilling(driver, PostData[3], opts);
  await closeNoteEditor(driver, NoteExitAction.SAVE_AND_EXIT, opts);
  await enterToEditorPage(driver, PostData[3].title!, opts);
  await closeNoteEditor(driver, NoteExitAction.PUBLISH_ONLY, opts);

  log.info("✅ Prueba de creación de Post exitosa.");
});