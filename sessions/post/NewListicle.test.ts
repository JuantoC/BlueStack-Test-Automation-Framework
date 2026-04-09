runSession("Nota Listicle exitosamente", async ({ driver, opts, log }) => {

  description(`
### Test: Crear Nota Lista con salida alternativa y publicación
---
**Objetivo:** Crear nota y testear la funcionalidad del botón de retroceso como opcion de guardado.

**Secuencia:**
1. Creación de nota tipo **LISTICLE**.
2. Llenado de campos.
3. Ejecución de **BACK_SAVE_AND_EXIT**.
4. Verificación de re-entrada y publicación de la nota.
`);

  const { user, pass } = ENV_CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);

  await driver.get(authUrl);

  const listicleData = ListicleDataFactory.create();

  const login = new MainLoginPage(driver, opts);
  const post = new MainPostPage(driver, 'LISTICLE', opts);
  const editor = new MainEditorPage(driver, 'LISTICLE', opts);

  await login.passLoginAndTwoFA({ username: user, password: pass });

  await post.createNewNote();
  await editor.fillFullNote(listicleData);
  await editor.closeNoteEditor('SAVE_AND_EXIT');

  const listicleContainer = await post.table.getPostContainerByTitle(listicleData.title!);
  await post.enterToEditorPage(listicleContainer);
  await editor.settings.selectSectionOption(1);
  await editor.closeNoteEditor('PUBLISH_AND_EXIT');

  log.info("✅ Prueba de creación de Listicle exitosa.");
},
  {
    epic: "Post Component",
    feature: "Listicle",
    severity: "normal",
  });

import { ENV_CONFIG } from "../../src/core/config/envConfig.js";
import { getAuthUrl } from "../../src/core/utils/getAuthURL.js";
import { runSession } from "../../src/core/wrappers/testWrapper.js";
import { ListicleDataFactory } from "../../src/data_test/factories/index.js";
import { description } from "allure-js-commons";
import { MainLoginPage } from "../../src/pages/login_page/MainLoginPage.js";
import { MainPostPage } from "../../src/pages/post_page/MainPostPage.js";
import { MainEditorPage } from "../../src/pages/post_page/note_editor_page/MainEditorPage.js";
