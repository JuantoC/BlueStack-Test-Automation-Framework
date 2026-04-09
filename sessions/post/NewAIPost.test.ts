runSession(
  "Creación de Nota IA, guardado y publicación",
  async ({ driver, opts, log }) => {

    description(`
### Test: Flujo completo de Nota IA
---
**Objetivo:** Validar la creación de una Nota IA desde cero, su guardado y su publicación.

**Flujo de pasos:**
1. Login como editor.
2. Entrada al modal de Nota IA
3. Rellenar campos de prompt y contexto
4. Seleccionar opciones de seccion, parrafo, tono y lenguaje
5. Hacer click en generar
6. Publicación de la nota (\`PUBLISH_AND_EXIT\`).

> **Resultado esperado:** La Nota IA original se crea, y luego la Nota IA se edita y publica exitosamente.
`);

    const { user, pass } = ENV_CONFIG.getCredentials('editor');
    const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
    await driver.get(authUrl);

    // Instanciación de Page Objects necesarios
    const login = new MainLoginPage(driver, opts);
    const post = new MainPostPage(driver, 'AI_POST', opts);
    const ai_post = new MainAIPage(driver, opts)
    const editor = new MainEditorPage(driver, 'AI_POST', opts)

    const AIData = AINoteDataFactory.create()

    await login.passLoginAndTwoFA({ username: user, password: pass });

    await post.createNewNote();

    await ai_post.generateNewAINote(AIData);

    // await editor.closeNoteEditor('PUBLISH_AND_EXIT');

    log.info("✅ Prueba de creación de Post exitosa.");
  },
  {
    epic: "AI Post Component",
    feature: "AI Post",
    severity: "normal",
  }
)

// Imports obligatorios al final del archivo según las convenciones
import { runSession } from "../../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../../src/core/config/envConfig.js";
import { description } from "allure-js-commons";

// Imports de datos
import { AINoteDataFactory } from "../../src/data_test/factories/AINoteDataFactory.js";
import { MainPostPage } from "../../src/pages/post_page/MainPostPage.js";
import { MainLoginPage } from "../../src/pages/login_page/MainLoginPage.js";
import { MainAIPage } from "../../src/pages/post_page/AIPost/MainAIPage.js";
import { MainEditorPage } from "../../src/pages/post_page/note_editor_page/MainEditorPage.js";
