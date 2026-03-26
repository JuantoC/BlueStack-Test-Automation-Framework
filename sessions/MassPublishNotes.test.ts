runSession("Mass Publish Notes",
  async ({ driver, opts, log }) => {
    description(`
### Test: Publicacion Masiva de Notas
---
**Objetivo:** Validar que 3 tipos de notas (Post, Listicle, Liveblog) pueden ser creadas, guardadas, editadas inline y publicadas masivamente.
**Flujo:** 

1. Login como editor.
2. Crear Post, Listicle y Liveblog guardando cada una (back and save).
3. Editar inline el título de cada una de esas 3 notas.
4. Seleccionar los 3 contenedores y publicar usando acciones del footer.
5. Verificar que las notas fueron publicadas exitosamente.

> **Resultado esperado:** Notas publicadas exitosamente desde la grilla.
    `);

    const { user, pass } = ENV_CONFIG.getCredentials('editor');
    const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
    await driver.get(authUrl);

    // Data declaration
    const postData = PostDataFactory.create();
    const listicleData = ListicleDataFactory.create();
    const liveBlogData = LiveBlogDataFactory.create();

    // PO instantiation
    const login = new MainLoginPage(driver, opts);

    // Login
    await login.passLoginAndTwoFA({ username: user, password: pass });

    // --- POST ---
    const postPage = new MainPostPage(driver, 'POST', opts);
    const editorPost = new MainEditorPage(driver, 'POST', opts);
    await postPage.createNewNote();
    await editorPost.fillFullNote(postData);
    await editorPost.closeNoteEditor('SAVE_AND_EXIT');

    // --- LISTICLE ---
    const listiclePage = new MainPostPage(driver, 'LISTICLE', opts);
    const editorListicle = new MainEditorPage(driver, 'LISTICLE', opts);
    await listiclePage.createNewNote();
    await editorListicle.fillFullNote(listicleData);
    await editorListicle.closeNoteEditor('SAVE_AND_EXIT');

    // --- LIVEBLOG ---
    const liveBlogPage = new MainPostPage(driver, 'LIVEBLOG', opts);
    const editorLiveBlog = new MainEditorPage(driver, 'LIVEBLOG', opts);
    await liveBlogPage.createNewNote();
    await editorLiveBlog.fillFullNote(liveBlogData);
    await editorLiveBlog.closeNoteEditor('SAVE_AND_EXIT');

    // --- INLINE EDIT TITLES ---
    await postPage.changePostTitle(postData.title);
    await postPage.changePostTitle(listicleData.title);
    await postPage.changePostTitle(liveBlogData.title);

    // --- MASS PUBLICATION ---
    const postsContainers = await postPage.getPostContainers(3);
    await postPage.selectAndPublishFooter(postsContainers);

    log.info("✅ Test de publicación masiva finalizado correctamente.");
  },
  { epic: "Post Management", feature: "Mass Publication", severity: "normal" }
);

import { runSession } from "../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { description } from "allure-js-commons";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
import { MainPostPage } from "../src/pages/post_page/MainPostPage.js";
import { MainEditorPage } from "../src/pages/post_page/note_editor_page/MainEditorPage.js";
import {
  PostDataFactory,
  ListicleDataFactory,
  LiveBlogDataFactory
} from "../src/data_test/factories/index.js";
