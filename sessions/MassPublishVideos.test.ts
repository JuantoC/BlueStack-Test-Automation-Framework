runSession("Mass Publish Videos", async ({ driver, opts, log }) => {

  description(`
### Test: Crear un video Nativo, YouTube y Embedded, editar el titulo inline de cada uno de ellos y publicarlos.
---
**Objetivo:** Validar la subida de estos 3 tipos de videos, la mecanica de editar inline y su correcta publicacion.

**Flujo de pasos:**
1. Navegación hacia el componente de Videos
2. Subida del video Nativo
3. Subida del video YouTube
4. Subida del video Embedded
5. Modificación de los títulos de los 3 videos desde el listado.
6. Publicacion de los 3 videos subidos.

> **Resultado esperado:** los videos deben de conservar la informacion insertada y publicarse adecuadamente.
`);

  const { user, pass } = ENV_CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
  await driver.get(authUrl);

  const nativeVideoData = NativeVideoDataFactory.create();
  const youtubeVideoData = YoutubeVideoDataFactory.create();
  const embeddedVideoData = EmbeddedVideoDataFactory.create();

  const login = new MainLoginPage(driver, opts);
  const video = new MainVideoPage(driver, opts);
  const sidebar = new SidebarAndHeader(driver, opts);

  await login.passLoginAndTwoFA({ username: user, password: pass });

  await sidebar.goToComponent(SidebarOption.VIDEOS);

  await video.uploadNewVideo(nativeVideoData);

  await video.uploadNewVideo(youtubeVideoData);

  await video.uploadNewVideo(embeddedVideoData);

  await video.changeVideoTitle(nativeVideoData.title!);
  await video.changeVideoTitle(youtubeVideoData.title!);
  await video.changeVideoTitle(embeddedVideoData.title!);

  //await video.selectAndPublishFooter(await video.getVideoContainers(3));

  log.info("✅ Prueba de DEBUG exitosa.");
},
  {
    epic: "Video Component",
    feature: "Mass Publish Videos",
    severity: "normal",
  });

import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { runSession } from "../src/core/wrappers/testWrapper.js";
import { NativeVideoDataFactory, YoutubeVideoDataFactory, EmbeddedVideoDataFactory } from "../src/data_test/factories/index.js";
import { MainVideoPage } from "../src/pages/videos_page/MainVideoPage.js";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
import { SidebarAndHeader, SidebarOption } from "../src/pages/SidebarAndHeaderSection.js";
import { description } from "allure-js-commons"; 
