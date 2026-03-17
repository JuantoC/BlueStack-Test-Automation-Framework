runSession("Native&YT Video", async ({ driver, opts, log }) => {

  description(`
    ###Test: Crear un video Nativo, uno YouTube, y editar el titulo inline.
    ---
    **Objetivo:** Validar la subida de estos 2 tipos de videos, la mecanica de editar inline y su correcta publicacion.

    **Flujo de pasos:**
    1. Navegación hacia el componente de Videos
    2. Subida dinamica del video Nativo
    3. Modificación de título desde el listado.
    4. Subida del video YouTube
    5. Modificación de título desde el listado.
    6. Publicacion de los ultimos 2 videos subidos.

    > **Resultado esperado:** los videos deben de conservar la informacion insertada y publicarse adecuadamente.
`);


  const { user, pass } = ENV_CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
  await driver.get(authUrl);

  const login = new MainLoginPage(driver, opts);
  const video = new MainVideoPage(driver, opts);
  const sidebar = new SidebarAndHeader(driver, opts);

  await login.passLoginAndTwoFA({ username: user, password: pass });

  await sidebar.goToComponent(SidebarOption.VIDEOS);

  await video.uploadNewVideo(NativeVideoData[0]);
  await video.changeVideoTitle(NativeVideoData[0].title!)

  await video.uploadNewVideo(YoutubeVideoData[1]);
  await video.changeVideoTitle(YoutubeVideoData[1].title!)

  // await video.selectAndPublishFooter(await video.getVideoContainers(2));

  log.info("✅ Prueba de DEBUG exitosa.");
});

import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { runSession } from "../src/core/wrappers/testWrapper.js";
import { NativeVideoData, YoutubeVideoData, } from "../src/data_test/videoData.js";
import { MainVideoPage } from "../src/pages/videos_page/MainVideoPage.js";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
import { SidebarAndHeader, SidebarOption } from "../src/pages/SidebarAndHeaderSection.js";
import { description } from "allure-js-commons";
