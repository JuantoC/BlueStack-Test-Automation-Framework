runSession("Debug — Video Editor Header Actions", async ({ driver, opts, log }) => {

  description(`
### Test: Debug del módulo de edición de Videos — acciones del header
---
**Objetivo:** Verificar que las cuatro acciones del header del editor de videos
funcionan correctamente: guardar sin salir, guardar y salir, publicar sin salir y publicar y salir.

**Flujo:**
1. Login y navegación a la sección Videos
2. Entrar al editor del video (EDIT sobre el primer ítem)
3. Ejecutar SAVE_ONLY — guardar sin salir
4. Ejecutar SAVE_AND_EXIT — guardar y salir
5. Re-entrar al editor del mismo video
6. Ejecutar PUBLISH_ONLY — publicar sin salir
7. Ejecutar PUBLISH_AND_EXIT — publicar y salir

> **Resultado esperado:** Cada acción del header se ejecuta sin errores.
> Las acciones de exit navegan correctamente de vuelta a la lista de videos.
> Las acciones sin salida muestran el banner de éxito correspondiente.
`);

  const { user, pass } = ENV_CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
  await driver.get(authUrl);

  const login = new MainLoginPage(driver, opts);
  const videoPage = new MainVideoPage(driver, opts);
  const videoEditor = new MainVideoEditorPage(driver, 'YOUTUBE', opts);
  const sidebar = new SidebarAndHeader(driver, opts);

  await login.passLoginAndTwoFA({ username: user, password: pass });

  await sidebar.goToComponent('VIDEOS');

  const videoContainer = await videoPage.table.getVideoContainerByIndex(0);

  await step('Entrar al editor — acción inicial', async () => {
    await videoPage.clickOnActionVideo(videoContainer, 'EDIT');
  });

  await step('Header Action: SAVE_ONLY — guardar sin salir', async () => {
    await videoEditor.closeNoteEditor('SAVE_ONLY');
  });

  await step('Header Action: SAVE_AND_EXIT — guardar y salir', async () => {
    await videoEditor.closeNoteEditor('SAVE_AND_EXIT');
  });

  const videoContainerFresh = await videoPage.table.getVideoContainerByIndex(0);

  await step('Re-entrar al editor tras SAVE_AND_EXIT', async () => {
    await videoPage.clickOnActionVideo(videoContainerFresh, 'EDIT');
  });

  await step('Header Action: PUBLISH_ONLY — publicar sin salir', async () => {
    await videoEditor.closeNoteEditor('PUBLISH_ONLY');
  });

  await step('Header Action: PUBLISH_AND_EXIT — publicar y salir', async () => {
    await videoEditor.closeNoteEditor('PUBLISH_AND_EXIT');
  });

  log.info("✅ Las cuatro acciones del header del editor de videos ejecutadas correctamente.");
},
  {
    epic: "Debug",
    feature: "Video Editor",
    story: "Header Actions",
    severity: "normal",
  });

import { runSession } from "../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { description, step } from "allure-js-commons";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
import { SidebarAndHeader } from "../src/pages/SidebarAndHeaderSection.js";
import { MainVideoPage } from "../src/pages/videos_page/MainVideoPage.js";
import { MainEditorPage as MainVideoEditorPage } from "../src/pages/videos_page/video_editor_page/MainEditorPage.js";
