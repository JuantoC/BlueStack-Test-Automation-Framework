// @target-env: master  // ejecutar con TARGET_ENV=master
// @default-role: editor

runSession(
  "Validación empírica de Markdown en nota generada por IA",
  async ({ driver, opts, log }) => {

    description(`
### Test: Validación de Markdown en nota IA
---
**Objetivo:** Verificar empíricamente que el modelo genera contenido Markdown (headers, bullets,
listas numeradas, tablas, negrita/cursiva) cuando se lo solicita explícitamente en el campo "tarea".

**Flujo:**
1. Login como editor.
2. Abrir modal de creación de nota IA.
3. Rellenar con datos del factory, pero con la tarea hardcodeada para exigir Markdown.
4. Generar la nota y confirmar con "Done" → editor abierto.
5. Leer el título desde el campo del editor (antes de guardar).
6. Capturar la URL del editor (antes de guardar).
7. Guardar y salir para que la nota persista en el CMS.
8. Loguear título y URL para búsqueda manual.

> **Resultado esperado:** El test pasa siempre que la generación no falle. El usuario
> usa el título y URL logueados para revisar manualmente el contenido generado en Master.
`);

    const { user, pass } = ENV_CONFIG.getCredentials('editor');
    const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
    await driver.get(authUrl);

    const login = new MainLoginPage(driver, opts);
    const post = new MainPostPage(driver, opts);
    const aiPage = new MainAIPage(driver, opts);
    const editor = new MainEditorPage(driver, opts);

    const aiData = AINoteDataFactory.create();

    // Sobrescribir solo 'task' — el resto (context, section, tone, language) viene del factory.
    // La instrucción exige Markdown explícito para validar el comportamiento del modelo tras el cambio de prompt.
    aiData.task = "Generá una nota de prensa sobre cualquier tema. La nota debe incluir obligatoriamente: " +
      "headers (## y ###), listas con bullets (-), listas numeradas, una tabla con al menos 3 columnas y " +
      "3 filas, y texto en negrita y cursiva. El contenido del tema es libre.";

    await login.passLoginAndTwoFA({ username: user, password: pass });

    await post.createNewNote(aiData.noteType);

    await aiPage.generateNewAINote(aiData);

    // Capturar título y URL ANTES de guardar — una vez que SAVE_AND_EXIT navega fuera, ya no están accesibles
    const noteTitle = await editor.text.getTitle();
    const editorUrl = await driver.getCurrentUrl();

    // Guardar la nota para que persista en el CMS — sin esto el driver cierra y la nota se pierde
    await editor.closeNoteEditor('SAVE_AND_EXIT');

    log.info(`📋 Título de la nota generada: ${noteTitle}`);
    log.info(`🔗 URL del editor: ${editorUrl}`);
    log.info("✅ Nota generada y guardada. Buscá el título arriba en el CMS para revisar el Markdown.");
  },
  {
    epic: "AI Post Component",
    feature: "Markdown Validation",
    severity: "normal",
  }
);

import { runSession } from "../../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../../src/core/config/envConfig.js";
import { description } from "allure-js-commons";
import { AINoteDataFactory } from "../../src/data_test/factories/AINoteDataFactory.js";
import { MainLoginPage } from "../../src/pages/login_page/MainLoginPage.js";
import { MainPostPage } from "../../src/pages/post_page/MainPostPage.js";
import { MainAIPage } from "../../src/pages/post_page/ai_note/MainAIPage.js";
import { MainEditorPage } from "../../src/pages/post_page/note_editor_page/MainEditorPage.js";
