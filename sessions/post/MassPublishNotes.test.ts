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

    // PO instantiation — una sola instancia por Maestro, reutilizable para todos los tipos
    const login = new MainLoginPage(driver, opts);
    const postPage = new MainPostPage(driver, opts);
    const editor = new MainEditorPage(driver, opts);

    // Login
    await login.passLoginAndTwoFA({ username: user, password: pass });

    // --- POST ---
    await postPage.createNewNote(postData.noteType);
    await editor.fillFullNote(postData);
    await editor.closeNoteEditor('SAVE_AND_EXIT');

    // --- LISTICLE ---
    await postPage.createNewNote(listicleData.noteType);
    await editor.fillFullNote(listicleData);
    await editor.closeNoteEditor('SAVE_AND_EXIT');

    // --- LIVEBLOG ---
    await postPage.createNewNote(liveBlogData.noteType);
    await editor.fillFullNote(liveBlogData);
    await editor.closeNoteEditor('SAVE_AND_EXIT');

    // --- INLINE EDIT TITLES ---
    const containerPost = await postPage.table.getPostContainerByTitle(postData.title);
    await postPage.changePostTitle(containerPost);
    const containerListicle = await postPage.table.getPostContainerByTitle(listicleData.title);
    await postPage.changePostTitle(containerListicle);
    const containerLiveBlog = await postPage.table.getPostContainerByTitle(liveBlogData.title);
    await postPage.changePostTitle(containerLiveBlog);

    // --- MASS PUBLICATION ---
    const postsContainers = await postPage.getPostContainers(3);
    await postPage.selectAndPublishFooter(postsContainers);

    log.info("✅ Test de publicación masiva finalizado correctamente.");
  },
  { epic: "Post Management", feature: "Mass Publication", severity: "normal" }
);

import { runSession } from "../../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../../src/core/config/envConfig.js";
import { description } from "allure-js-commons";
import { MainLoginPage } from "../../src/pages/login_page/MainLoginPage.js";
import { MainPostPage } from "../../src/pages/post_page/MainPostPage.js";
import { MainEditorPage } from "../../src/pages/post_page/note_editor_page/MainEditorPage.js";
import {
  PostDataFactory,
  ListicleDataFactory,
  LiveBlogDataFactory
} from "../../src/data_test/factories/index.js";
