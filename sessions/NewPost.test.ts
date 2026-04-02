runSession('Nota Post Exitosamente', async ({ driver, opts, log }) => {

  description(`
### Test: Crear Post exitosamente, entrar y publicar.
---
**Objetivo:** Verificar que un Post nuevo se guarde y publique correctamente tras re-ingresar.
**Flujo:** 

1. Creación desde cero + SAVE_AND_EXIT.
2. Re-entrada para validación.
3. PUBLISH_AND_EXIT.

> **Resultado esperado:** Los datos deben reflejarse íntegramente en la UI y Post publicado.
`);

  const { user, pass } = ENV_CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);

  await driver.get(authUrl);

  const postData = PostDataFactory.create();

  const login = new MainLoginPage(driver, opts);
  const post = new MainPostPage(driver, 'POST', opts);
  const editor = new MainEditorPage(driver, 'POST', opts);

  await login.passLoginAndTwoFA({ username: user, password: pass });
  await post.createNewNote();
  await editor.fillFullNote(postData);
  await editor.closeNoteEditor('SAVE_AND_EXIT');

  const postContainer = await post.table.getPostContainerByTitle(postData.title!);
  await post.enterToEditorPage(postContainer);
  await editor.settings.selectSectionOption(1);
  await editor.closeNoteEditor('PUBLISH_AND_EXIT');

  log.info("✅ Prueba de creación de Post exitosa.");
},
  {
    epic: "Post Component",
    feature: "Post",
    severity: "normal",
  });

import { runSession } from "../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { description } from "allure-js-commons";
import { PostDataFactory } from "../src/data_test/factories/index.js";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
import { MainPostPage } from "../src/pages/post_page/MainPostPage.js";
import { MainEditorPage } from "../src/pages/post_page/note_editor_page/MainEditorPage.js";
