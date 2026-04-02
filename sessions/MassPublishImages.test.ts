runSession("Mass Publish Images — Subida Nativa", async ({ driver, opts, log }) => {

  description(`
### Test: Subir dos imágenes nativas desde distintos puntos de entrada, editar sus títulos inline y publicarlas desde el footer.
---
**Objetivo:** Validar el flujo completo de subida nativa de imágenes vía TABLE y SIDEBAR,
la mecánica de edición inline de títulos y la publicación masiva desde el footer.

**Flujo de pasos:**
1. Navegación hacia la sección de Imágenes
2. Subida de imagen A (jpg) desde el input de la TABLE
3. Subida de imagen B (webp) desde el botón del SIDEBAR
4. Edición inline del título de imagen A
5. Edición inline del título de imagen B
6. Selección y publicación de ambas imágenes desde el footer

> **Resultado esperado:** Ambas imágenes deben subirse con rutas distintas, conservar
> la edición de título inline y publicarse correctamente mediante la acción del footer.
`);

  const { user, pass } = ENV_CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
  await driver.get(authUrl);

  const imageDataA = ImageDataFactory.create({ path: IMAGE_PATHS[0] });  // jpg eris mushoku tensei.jpg
  const imageDataB = ImageDataFactory.create({ path: IMAGE_PATHS[2] });  // Michael Bradway.webp

  const login = new MainLoginPage(driver, opts);
  const imagePage = new MainImagePage(driver, opts);
  const sidebar = new SidebarAndHeader(driver, opts);

  await login.passLoginAndTwoFA({ username: user, password: pass });

  await sidebar.goToComponent('IMAGES');

  await imagePage.uploadNewImage(imageDataA, 'Table');

  await imagePage.uploadNewImage(imageDataB, 'Sidebar');

  const containerA = await imagePage.table.getImageContainerByTitle(imageDataA.title!);
  await imagePage.changeImageTitle(containerA);

  const containerB = await imagePage.table.getImageContainerByTitle(imageDataB.title!);
  await imagePage.changeImageTitle(containerB);

  await imagePage.selectAndPublishFooter(await imagePage.getImageContainers(2));

  log.info("✅ Subida nativa, edición inline y publicación de ambas imágenes completadas correctamente.");
},
  {
    epic: "Multimedia",
    feature: "Imágenes",
    story: "Subida nativa",
    severity: "normal",
  });

import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { runSession } from "../src/core/wrappers/testWrapper.js";
import { ImageDataFactory, IMAGE_PATHS } from "../src/data_test/factories/index.js";
import { MainImagePage } from "../src/pages/images_pages/MainImagePage.js";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
import { SidebarAndHeader } from "../src/pages/SidebarAndHeaderSection.js";
import { description } from "allure-js-commons";
