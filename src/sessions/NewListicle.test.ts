import { ENV_CONFIG } from "../core/config/envConfig.js";
// Herramientas Core
import { getAuthUrl } from "../core/utils/getAuthURL.js";
import { runSession } from "../core/wrappers/testWrapper.js";
// Business Flows
import { passLogin } from "../flows/userSession.js";
import { dynimicDataFilling } from "../flows/populateNoteEditorFields.js";
import { createNewNote, closeNoteEditor } from "../flows/openCloseNote.js";
// Data y Enums
import { ListicleData } from "../dataTest/noteData.js";
import { NoteType } from "../pages/post_page/SideBarNewNoteBtn.js";
import { NoteExitAction } from "../pages/post_page/note_editor_page/EditorHeaderActions.js";
import { description } from "allure-js-commons";
import { enterToEditorPage } from "../flows/noteActions.js";

/**
 * TEST CASE: Creación de Nota tipo Listicle - 01
 */
runSession("Nota Listicle exitosamente", async ({ driver, opts, log }) => {

  description(`
### Test: Crear Nota Lista con salida alternativa y publicación
---
**Objetivo:** Crear nota y testear la funcionalidad del botón de retroceso como opcion de guardado.

**Secuencia:**
1. Creación de nota tipo **LISTICLE**.
2. Llenado de campos (Data Set [1]).
3. Ejecución de **BACK_SAVE_AND_EXIT**.
4. Verificación de re-entrada y publicación de la nota.
`);

  const { user, pass } = ENV_CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);

  await driver.get(authUrl);
  await passLogin(driver, { username: user, password: pass }, opts);

  await createNewNote(driver, NoteType.LISTICLE, opts);
  await dynimicDataFilling(driver, ListicleData[1], opts);
  await closeNoteEditor(driver, NoteExitAction.BACK_SAVE_AND_EXIT, opts);
  await enterToEditorPage(driver, ListicleData[1].title!, opts);
  await closeNoteEditor(driver, NoteExitAction.PUBLISH_AND_EXIT, opts);


  log.info("✅ Prueba de creación de Listicle exitosa.");
});
