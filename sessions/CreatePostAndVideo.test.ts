runSession(
  "Creación de Post, subida de YouTube y Edición",
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
6. Navegación de regreso al componente de Noticias (Posts).
7. Edición inline del título del Post creado en el paso 2.
8. Re-ingreso al editor del Post.
9. Publicación del Post (\`PUBLISH_AND_EXIT\`).

> **Resultado esperado:** El Post original se crea, el video se sube correctamente, y luego el Post se edita y publica exitosamente.
`);
    const newPostData = PostData[6];

    const { user, pass } = ENV_CONFIG.getCredentials('editor');
    const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
    await driver.get(authUrl);

    // Instanciación de Page Objects necesarios
    const login = new MainLoginPage(driver, opts);
    const post = new MainPostPage(driver, NoteType.POST, opts);
    const editor = new MainEditorPage(driver, NoteType.POST, opts);
    const video = new MainVideoPage(driver, opts);
    const sidebar = new SidebarAndHeader(driver, opts);

    // 1. Login
    await login.passLoginAndTwoFA({ username: user, password: pass });

    // 2. Crear nueva nota
    await post.createNewNote();

    // El PostData recién agregado está en el índice 6 (son 7 elementos, de 0 a 6)
    await editor.fillFullNote(newPostData);

    // 3. Salir con el botón back_and_save (BACK_SAVE_AND_EXIT en el enum)
    await editor.closeNoteEditor(NoteExitAction.BACK_SAVE_AND_EXIT);

    // 4. Ingresar al componente de videos
    await sidebar.goToComponent(SidebarOption.VIDEOS);

    // 5. Subir un nuevo video youtube
    // El YoutubeVideoData recién agregado está en el índice 2
    const newYoutubeData = YoutubeVideoData[2];
    await video.uploadNewVideo(newYoutubeData);

    // 6. Volver a la página de posts (noticias)
    await sidebar.goToComponent(SidebarOption.NEWS);

    // 7. Encontrar la nota subida previamente y cambiarle el titulo inline
    await post.changePostTitle(newPostData.title!);

    await post.enterToEditorPage(newPostData.title!);

    // 9. Publicarla y salir
    await editor.closeNoteEditor(NoteExitAction.PUBLISH_AND_EXIT);

    log.info("✅ Flujo de creación de Post, subida de video YouTube y edición completado exitosamente.");
  },
  {
    epic: "Content Management",
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
import { PostData } from "../src/data_test/noteData.js";
import { YoutubeVideoData } from "../src/data_test/videoData.js";

// Imports de Page Objects
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
import { MainPostPage } from "../src/pages/post_page/MainPostPage.js";
import { MainEditorPage } from "../src/pages/post_page/note_editor_page/MainEditorPage.js";
import { MainVideoPage } from "../src/pages/videos_page/MainVideoPage.js";
import { SidebarAndHeader, SidebarOption } from "../src/pages/SidebarAndHeaderSection.js";

// Imports de Enums
import { NoteType } from "../src/pages/post_page/NewNoteBtn.js";
import { NoteExitAction } from "../src/pages/post_page/note_editor_page/EditorHeaderActions.js";
