runSession("Nota LiveBlog exitosamente", async ({ driver, opts, log }) => {
    description(`
### Test: Crear LiveBlog, entrar y publicar.
---

**Secuencia:**
1. Creación de nota tipo **LIVEBLOG**.
2. Llenado de campos.
3. Ejecución de **SAVE_ONLY**.
4. Posterior publicación de la nota con **PUBLISH_ONLY**.

**Objetivo:** Asegurar que los LiveBlogs permitan guardado y publicación sin abandonar el editor.
`);

    const { user, pass } = ENV_CONFIG.getCredentials('editor');
    const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
    await driver.get(authUrl);

    const liveBlogData = LiveBlogDataFactory.create();

    const login = new MainLoginPage(driver, opts);
    const post = new MainPostPage(driver, 'LIVEBLOG', opts);
    const editor = new MainEditorPage(driver, 'LIVEBLOG', opts);

    await login.passLoginAndTwoFA({ username: user, password: pass });
    await post.createNewNote();
    await editor.fillFullNote(liveBlogData);
    await editor.closeNoteEditor('SAVE_ONLY');
    await editor.closeNoteEditor('PUBLISH_ONLY');
    await editor.settings.selectSectionOption(1);
    await editor.closeNoteEditor('SAVE_AND_EXIT');
    await post.changePostTitle(liveBlogData.title)

    log.info("✅ Prueba de creación de LiveBlog exitosa.");
},
    {
        epic: "Post Component",
        feature: "LiveBlog",
        severity: "normal",
    });

import { LiveBlogDataFactory } from "../src/data_test/factories/index.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { runSession } from "../src/core/wrappers/testWrapper.js";
import { description } from "allure-js-commons";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
import { MainPostPage } from "../src/pages/post_page/MainPostPage.js";
import { MainEditorPage } from "../src/pages/post_page/note_editor_page/MainEditorPage.js";
