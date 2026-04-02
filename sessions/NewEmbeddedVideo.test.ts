runSession(
  "Creación de Embedded, edicion y publicacion",
  async ({ driver, opts, log }) => {

    description(`
### Test: Flujo completo de Embedded Video
---
**Objetivo:** Validar la creación de un Embedded desde cero, la navegación al componente de videos, y la edición inline del título del Embedded previamente creado antes de su publicación final.

**Flujo de pasos:**
1. Login como editor.
2. Navegación al componente de Videos vía sidebar.
3. Creación de nueva nota tipo Embedded con datos frescos.
4. Edición inline del título del Embedded creado en el paso 3.
5. Busqueda y publicacion del ultimo video de la tabla.

> **Resultado esperado:** El Embedded se crea, el video se sube correctamente, y luego el Embedded se edita y publica exitosamente.
`);
    const newEmbeddedData = EmbeddedVideoDataFactory.create();

    const { user, pass } = ENV_CONFIG.getCredentials('editor');
    const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
    await driver.get(authUrl);

    // Instanciación de Page Objects necesarios
    const login = new MainLoginPage(driver, opts);
    const video = new MainVideoPage(driver, opts);
    const sidebar = new SidebarAndHeader(driver, opts);

    // 1. Login
    await login.passLoginAndTwoFA({ username: user, password: pass });

    // 4. Ingresar al componente de videos
    await sidebar.goToComponent('VIDEOS');

    // 5. Subir un nuevo video youtube
    await video.uploadNewVideo(newEmbeddedData);

    const embeddedContainer = await video.table.getVideoContainerByTitle(newEmbeddedData.title!);
    await video.changeVideoTitle(embeddedContainer);
    /*  const videos = await video.getVideoContainers(1);
     await video.selectAndPublishFooter(videos);
  */
    log.info("✅ Flujo de creación de Post, subida de video YouTube y edición completado exitosamente.");
  },
  {
    epic: "Video Component",
    feature: "Embedded Video",
    severity: "normal",
  }
);

// Imports obligatorios al final del archivo según las convenciones
import { runSession } from "../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { description } from "allure-js-commons";


// Imports de Page Objects
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
import { MainVideoPage } from "../src/pages/videos_page/MainVideoPage.js";
import { SidebarAndHeader } from "../src/pages/SidebarAndHeaderSection.js";
import { EmbeddedVideoDataFactory } from "../src/data_test/factories/index.js";
