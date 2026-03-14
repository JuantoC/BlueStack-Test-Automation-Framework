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

    const login = new MainLoginPage(driver, opts)
    const post = new MainPostPage(driver, NoteType.LIVEBLOG, opts)
    const editor = new MainEditorPage(driver, NoteType.LIVEBLOG, opts);

    await login.passLoginAndTwoFA({ username: user, password: pass });
    await post.createNewNote();
    await editor.fillFullNote(LiveBlogData[1]);
    await editor.closeNoteEditor(NoteExitAction.SAVE_ONLY);
    await editor.closeNoteEditor(NoteExitAction.PUBLISH_ONLY);

    log.info("✅ Prueba de creación de LiveBlog exitosa.");
});

import { LiveBlogData } from "../src/data_test/noteData.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { NoteType } from "../src/pages/post_page/NewNoteBtn.js";
import { NoteExitAction } from "../src/pages/post_page/note_editor_page/EditorHeaderActions.js";
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { runSession } from "../src/core/wrappers/testWrapper.js";
import { description } from "allure-js-commons";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
import { MainPostPage } from "../src/pages/post_page/MainPostPage.js";
import { MainEditorPage } from "../src/pages/post_page/note_editor_page/MainEditorPage.js";

