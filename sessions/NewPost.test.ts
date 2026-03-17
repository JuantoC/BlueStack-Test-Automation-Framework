import { runSession } from "../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { PostData } from "../src/data_test/noteData.js";
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { description } from "allure-js-commons";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
import { MainPostPage } from "../src/pages/post_page/MainPostPage.js";
import { MainEditorPage } from "../src/pages/post_page/note_editor_page/MainEditorPage.js";

runSession('Nota Post Exitosamente', async ({ driver, opts, log }) => {

  description(`
### Test: Crear Post exitosamente, entrar y publicar.
---
**Objetivo:** Verificar que un Post nuevo se guarde y publique correctamente tras re-ingresar.

**Detalles del flujo:**
* **Acción 1:** Creación desde cero + **SAVE_AND_EXIT**.
* **Acción 2:** Re-entrada para validación.
* **Acción 3:** **PUBLISH_ONLY** (sin salir).

**Objetivo:** Los datos deben reflejarse íntegramente en la UI.
`);

  const { user, pass } = ENV_CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);

  await driver.get(authUrl);

  const login = new MainLoginPage(driver, opts)
  const post = new MainPostPage(driver, 'POST', opts)
  const editor = new MainEditorPage(driver, 'POST', opts);

  await login.passLoginAndTwoFA({ username: user, password: pass });
  await post.createNewNote();
  await editor.fillFullNote(PostData[4]);
  await editor.closeNoteEditor("SAVE_AND_EXIT");

  await post.enterToEditorPage(PostData[4].title!);
  await editor.closeNoteEditor('PUBLISH_AND_EXIT')

  log.info("✅ Prueba de creación de Post exitosa.");
});