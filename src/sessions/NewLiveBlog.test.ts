/**
 * TEST CASE: Creación de Nota tipo LiveBlog - 01
 */
runSession("Nota LiveBlog exitosamente", async ({ driver, opts, log }) => {
    description(`
### Test: Crear LiveBlog, entrar y publicar.
---
**Objetivo:** Asegurar que los LiveBlogs permitan guardado y publicación incremental sin abandonar el editor.

**Puntos clave:**
* Uso de \`editorPage.fillFullNote\` para llenado masivo.
* Validación de la acción **SAVE_ONLY** (Sin redirección).
* Validación de la acción **PUBLISH_ONLY**.

*Nota: Este test valida la estabilidad del editor en sesiones largas.*
`);

    const { user, pass } = ENV_CONFIG.getCredentials('editor');
    const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
    await driver.get(authUrl);
    await passLogin(driver, { username: user, password: pass }, opts);

    const editorPage = await createNewNote(driver, NoteType.LIVEBLOG, opts);
    await editorPage.fillFullNote(LiveBlogData[0]);
    await closeNoteEditor(driver, NoteExitAction.SAVE_ONLY, opts);
    await closeNoteEditor(driver, NoteExitAction.PUBLISH_ONLY, opts);

    log.info("✅ Prueba de creación de LiveBlog exitosa.");
});

import { LiveBlogData } from "../dataTest/noteData.js";
// Core Tools
import { getAuthUrl } from "../core/utils/getAuthURL.js";
// Business Flows
import { passLogin } from "../flows/userSession.js";
import { createNewNote, closeNoteEditor } from "../flows/openCloseNote.js";
// Enums
import { NoteType } from "../pages/post_page/SideBarNewNoteBtn.js";
import { NoteExitAction } from "../pages/post_page/note_editor_page/EditorHeaderActions.js";
import { ENV_CONFIG } from "../core/config/envConfig.js";
import { runSession } from "../core/wrappers/testWrapper.js";
import { description, descriptionHtml } from "allure-js-commons";

