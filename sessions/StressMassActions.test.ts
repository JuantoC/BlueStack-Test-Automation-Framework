runSession("Stress Mass Actions",
  async ({ driver, opts, log }) => {
    description(`
### Test: Pruebas de estres en el CMS.
---
**Objetivo:** Validar el correcto funcionamiento del CMS bajo estres.
**Flujo:** 

1. Login como editor.
2. Crear Post, Listicle y Liveblog guardando cada una (back and save).
3. Editar inline el título de cada una de esas 3 notas.
4. Navegar a la seccion de videos.
5. Subir 3 videos (Native, Youtube, Embedded) y editar inline el título de cada uno de ellos.
6. Navegar a la seccion de noticias.
7. Seleccionar los 3 contenedores y publicar usando acciones del footer.
8. Verificar que las notas fueron publicadas exitosamente.

> **Resultado esperado:** Notas publicadas exitosamente desde la grilla.
    `);

    const { user, pass } = ENV_CONFIG.getCredentials('editor');
    const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
    await driver.get(authUrl);

    // Data declaration
    const postData = PostDataFactory.create();
    const listicleData = ListicleDataFactory.create();
    const liveBlogData = LiveBlogDataFactory.create();

    const nativeVideoData = NativeVideoDataFactory.create();
    const youtubeVideoData = YoutubeVideoDataFactory.create();
    const embeddedVideoData = EmbeddedVideoDataFactory.create();

    const AIData = AINoteDataFactory.create()


    const login = new MainLoginPage(driver, opts);
    const video = new MainVideoPage(driver, opts);
    const sidebar = new SidebarAndHeader(driver, opts);
    const ai = new MainAIPage(driver, opts);

    // PO instantiation
    const postPage = new MainPostPage(driver, 'POST', opts);
    const editor = new MainEditorPage(driver, 'POST', opts);

    // Login
    await login.passLoginAndTwoFA({ username: user, password: pass });

    // --- POST ---
    await postPage.createNewNote();
    await editor.fillFullNote(postData);
    await editor.closeNoteEditor('BACK_SAVE_AND_EXIT');

    // --- LISTICLE ---
    await postPage.createNewNote('LISTICLE');
    await editor.fillFullNote(listicleData);
    await editor.closeNoteEditor('SAVE_AND_EXIT');

    // --- LIVEBLOG ---
    await postPage.createNewNote('LIVEBLOG');
    await editor.fillFullNote(liveBlogData);
    await editor.closeNoteEditor('SAVE_AND_EXIT');

    // --- INLINE EDIT TITLES ---
    await postPage.changePostTitle(postData.title);
    await postPage.changePostTitle(listicleData.title);
    await postPage.changePostTitle(liveBlogData.title);

    await sidebar.goToComponent('VIDEOS');

    await video.uploadNewVideo(nativeVideoData);

    await video.uploadNewVideo(youtubeVideoData);

    //await video.uploadNewVideo(embeddedVideoData);

    await video.changeVideoTitle(nativeVideoData.title!);
    await video.changeVideoTitle(youtubeVideoData.title!);
    //await video.changeVideoTitle(embeddedVideoData.title!);

    await sidebar.goToComponent('NEWS');

    await postPage.createNewNote('AI_POST');
    await ai.generateNewAINote(AIData);
    await editor.closeNoteEditor('SAVE_AND_EXIT');

    // --- MASS PUBLICATION ---
    const postsContainers = await postPage.getPostContainers(4);
    await postPage.selectAndPublishFooter(postsContainers);

    log.info("✅ Test de Stress y publicación masiva finalizado correctamente.");
  },
  { epic: "Stress Test", feature: "Mass Actions", severity: "critical" }
);

import { runSession } from "../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { description } from "allure-js-commons";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
import { MainPostPage } from "../src/pages/post_page/MainPostPage.js";
import { MainAIPage } from "../src/pages/post_page/AIPost/MainAIPage.js";
import { MainEditorPage } from "../src/pages/post_page/note_editor_page/MainEditorPage.js";
import {
  PostDataFactory,
  ListicleDataFactory,
  LiveBlogDataFactory,
  NativeVideoDataFactory,
  YoutubeVideoDataFactory,
  EmbeddedVideoDataFactory,
  AINoteDataFactory
} from "../src/data_test/factories/index.js";
import { MainVideoPage } from "../src/pages/videos_page/MainVideoPage.js";
import { SidebarAndHeader } from "../src/pages/SidebarAndHeaderSection.js";

