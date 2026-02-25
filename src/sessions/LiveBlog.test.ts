/**
 * TEST CASE: Creación de Nota tipo LiveBlog - 01
 * Valida la generación dinámica de ítems y la salida con descarte de cambios.
 */
runSession("Crear LiveBlog exitosamente", async ({ driver, opts, log }) => {

    // 1. Setup de datos (único boiler necesario)
    const { user, pass } = CONFIG.getCredentials('editor');
    const authUrl = getAuthUrl(CONFIG.baseUrl, CONFIG.auth.basic.user, CONFIG.auth.basic.pass);

    // 2. Lógica de negocio pura
    await driver.get(authUrl);
    await passLogin(driver, { username: user, password: pass }, opts);

    const editorPage = await createNewNote(driver, NoteType.LIVEBLOG, opts);
    await editorPage.fillFullNote(LiveBlogData[0], opts);
    await closeNoteEditor(driver, NoteExitAction.SAVE_ONLY, opts);

    log.info("✅ Prueba de creación de LiveBlog exitosa.");
});

import { LiveBlogData } from "../dataTest/noteData.js";
// Core Tools
import { getAuthUrl } from "../core/utils/getAuthURL.js";
// Business Flows
import { passLogin } from "../flows/manageAuth.js";
import { fillNote } from "../flows/fillNote.js";
import { createNewNote, closeNoteEditor } from "../flows/noteLifecycleManager.js";
// Enums
import { NoteType } from "../pages/sidebar_options/NewNoteBtn.js";
import { NoteExitAction } from "../pages/post_page/note_editor_page/EditorHeaderActions.js";
import { CONFIG } from "../core/config/config.js";
import { runSession } from "../core/wrappers/testWrapper.js";

