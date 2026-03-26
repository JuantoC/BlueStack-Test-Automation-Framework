runSession(
  "Creación de Post, subida de Video YT y Edición",
  async ({ driver, opts, log }) => {

    description(`
### Test: Flujo completo de Post y Video YouTube
---
**Objetivo:** Validar la creación de un Post desde cero, la navegación al componente de videos, la subida de un video de YouTube, el regreso al listado de posts, y la edición inline del título del post previamente creado antes de su publicación final.

**Flujo de pasos:**
1. Login como editor.
2. Creación de nueva nota tipo Post con datos frescos.
3. Guardado con salida (\`BACK_SAVE_AND_EXIT\`).
4. Navegación al componente de Videos vía sidebar.
5. Subida de un nuevo video tipo YouTube con datos frescos.
6. Busqueda y publicacion del ultimo video de la tabla.
7. Navegación de regreso al componente de Noticias.
8. Edición inline del título del Post creado en el paso 2.
9. Re-ingreso al editor del Post.
10. Publicación del Post (\`PUBLISH_AND_EXIT\`).

> **Resultado esperado:** El Post original se crea, el video se sube correctamente, y luego el Post se edita y publica exitosamente.
`);
    const newPostData = PostDataFactory.create();
    const newYoutubeData = YoutubeVideoDataFactory.create();

    const { user, pass } = ENV_CONFIG.getCredentials('editor');
    const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
    await driver.get(authUrl);

    // Instanciación de Page Objects necesarios
    const login = new MainLoginPage(driver, opts);
    const post = new MainPostPage(driver, 'POST', opts);
    const editor = new MainEditorPage(driver, 'POST', opts);
    const video = new MainVideoPage(driver, opts);
    const sidebar = new SidebarAndHeader(driver, opts);

    // 1. Login
    await login.passLoginAndTwoFA({ username: user, password: pass });

    // 2. Crear nueva nota
    await post.createNewNote();

    await editor.fillFullNote(newPostData);

    // 3. Salir con el botón back_and_save (BACK_SAVE_AND_EXIT)
    await editor.closeNoteEditor('BACK_SAVE_AND_EXIT');

    // 4. Ingresar al componente de videos
    await sidebar.goToComponent(SidebarOption.VIDEOS);

    // 5. Subir un nuevo video youtube
    await video.uploadNewVideo(newYoutubeData);

    // 6. Volver a la página de posts (noticias)
    await sidebar.goToComponent(SidebarOption.NEWS);

    // 7. Encontrar la nota subida previamente y cambiarle el titulo inline
    await post.changePostTitle(newPostData.title!);

    await post.enterToEditorPage(newPostData.title!);

    // 9. Publicarla y salir
    await editor.closeNoteEditor('PUBLISH_AND_EXIT');

    await sidebar.goToComponent(SidebarOption.VIDEOS)

    const videos = await video.getVideoContainers(1);
    await video.selectAndPublishFooter(videos);

    log.info("✅ Flujo de creación de Post, subida de video YouTube y edición completado exitosamente.");
  },
  {
    epic: "Post & Video Component",
    feature: "Cross-Component Workflow",
    severity: "critical",
  }
);

// Imports obligatorios al final del archivo según las convenciones
import { runSession } from "../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { description } from "allure-js-commons";

// Imports de datos
import { PostDataFactory, YoutubeVideoDataFactory } from "../src/data_test/factories/index.js";

// Imports de Page Objects
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
import { MainPostPage } from "../src/pages/post_page/MainPostPage.js";
import { MainEditorPage } from "../src/pages/post_page/note_editor_page/MainEditorPage.js";
import { MainVideoPage } from "../src/pages/videos_page/MainVideoPage.js";
import { SidebarAndHeader, SidebarOption } from "../src/pages/SidebarAndHeaderSection.js";