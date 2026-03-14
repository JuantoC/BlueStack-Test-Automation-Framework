runSession('Titulo inline y edicion', async ({ driver, opts, log }) => {

  description(`
    ### Test: Crear Post, editar titulo inline y publicar.
    ---
**Objetivo:** Validar la persistencia de datos al editar y la accesibilidad mediante el icono de edición.

**Flujo de pasos:**
1. Creación de nota tipo **Post**.
2. Llenado dinámico y guardado con salida (**SAVE_AND_EXIT**).
3. Modificación de título desde el listado.
4. Re-ingreso al editor mediante el **icono de lápiz**.
5. Publicación y salida final.

> **Resultado esperado:** La nota debe conservar los cambios y permitir el acceso directo.
`);

  const { user, pass } = ENV_CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);

  await driver.get(authUrl);

  const login = new MainLoginPage(driver, opts)
  const post = new MainPostPage(driver, NoteType.POST, opts)
  const editor = new MainEditorPage(driver, NoteType.POST, opts);

  await login.passLoginAndTwoFA({ username: user, password: pass });

  await post.createNewNote();
  await editor.fillFullNote(PostData[5]);
  await editor.closeNoteEditor(NoteExitAction.SAVE_AND_EXIT);

  await post.changePostTitle(PostData[5].title!);

  await post.enterToEditorPage(PostData[5].title!);
  await editor.closeNoteEditor(NoteExitAction.PUBLISH_AND_EXIT);

  log.info("✅ Debug Session exitosa.");
});

import { runSession } from "../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { PostData } from "../data_test/noteData.js";;
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { NoteType } from "../src/pages/post_page/NewNoteBtn.js";
import { NoteExitAction } from "../src/pages/post_page/note_editor_page/EditorHeaderActions.js";
import { description } from "allure-js-commons";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js"; import { MainPostPage } from "../src/pages/post_page/MainPostPage.js";
import { MainEditorPage } from "../src/pages/post_page/note_editor_page/MainEditorPage.js";

