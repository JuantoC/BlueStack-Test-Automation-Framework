// @default-role: editor
// @auto-generated: true
// @ticket: NAA-4248
// @validated: false  // cambiar a true después de revisión manual

runSession(
  "NAA-4248 — Labels de tiempo y títulos del panel Asistencia IA",
  async ({ driver, opts, log }) => {

    description(`
### Test: Verificación de labels en panel Asistencia IA
---
**Objetivo:** Validar que las opciones del panel de Asistencia IA (robotito) muestran
los títulos y tiempos correctos tras el fix del ticket NAA-4248.

**Flujo:**
1. Login como editor.
2. Crear nuevo POST y entrar al editor.
3. Abrir el panel de Asistencia IA.
4. Verificar que Grammar Improvements muestra tiempo "1m" (no "3m").
5. Verificar que Spelling Improvements muestra título "Spelling Improvements" (no "Best Spelling") y tiempo "1m".
6. Verificar que Summary muestra título "Summary" (no "Abstract") y tiene label de tiempo visible.
7. Verificar que la cuarta opción tiene label de tiempo visible.

> **Resultado esperado:** Todos los labels de título y tiempo coinciden con los valores definidos en el sistema.

> **ESTADO:** Test bloqueado — faltan métodos POM para el panel Asistencia IA.
> Ver wiki/log.md [gap] Panel Asistencia IA — AIAssistantPanel sub-componente pendiente.
`);

    const { user, pass } = ENV_CONFIG.getCredentials('editor');
    const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
    await driver.get(authUrl);

    const login  = new MainLoginPage(driver, opts);
    const post   = new MainPostPage(driver, opts);

    await login.passLoginAndTwoFA({ username: user, password: pass });

    await step("Crear nuevo POST y entrar al editor", async () => {
      await post.createNewNote("POST");
    });

    // ── Abrir panel de Asistencia IA ─────────────────────────────────────────
    // TODO-POM: Requiere método openAIAssistantPanel() en MainEditorPage o en un nuevo
    // sub-componente AIAssistantPanel (src/pages/post_page/note_editor_page/AIAssistantPanel.ts).
    // Confirmar con DevTools el selector del botón "robotito" en el header del editor.
    // Invocar pom-generator con los locators confirmados antes de descomentar.
    await step("Abrir panel de Asistencia IA", async () => {
      // await editor.openAIAssistantPanel();
      throw new Error("TODO-POM: Panel Asistencia IA sin métodos en src/pages/ — ver wiki/log.md [gap] Panel Asistencia IA");
    });

    // ── Criterio 1: Grammar Improvements → tiempo "1m" ───────────────────────
    // TODO-POM: Requiere método getAIOptionTimeLabel(optionKey: string): Promise<string>
    // en AIAssistantPanel. optionKey sería "grammar-improvements" o equivalente.
    // Confirmar data-testid real del badge de tiempo en DevTools.
    await step("Verificar Grammar Improvements: tiempo debe ser '1m'", async () => {
      // const grammarTime = await aiPanel.getAIOptionTimeLabel("grammar-improvements");
      // expect(grammarTime).toBe("1m");
      throw new Error("TODO-POM: getAIOptionTimeLabel no existe en src/pages/ — ver wiki/log.md [gap] Panel Asistencia IA");
    });

    // ── Criterio 2: Spelling Improvements → título y tiempo ──────────────────
    // TODO-POM: Requiere métodos getAIOptionTitle(optionKey) y getAIOptionTimeLabel(optionKey)
    // en AIAssistantPanel.
    await step("Verificar Spelling Improvements: título 'Spelling Improvements' y tiempo '1m'", async () => {
      // const title = await aiPanel.getAIOptionTitle("spelling-improvements");
      // const time  = await aiPanel.getAIOptionTimeLabel("spelling-improvements");
      // expect(title).toBe("Spelling Improvements");
      // expect(time).toBe("1m");
      throw new Error("TODO-POM: getAIOptionTitle / getAIOptionTimeLabel no existen en src/pages/ — ver wiki/log.md [gap] Panel Asistencia IA");
    });

    // ── Criterio 3: Summary → título "Summary" y tiempo visible ─────────────
    // TODO-POM: Mismos métodos que criterio 2 con optionKey "summary".
    await step("Verificar Summary: título 'Summary' y label de tiempo presente", async () => {
      // const title = await aiPanel.getAIOptionTitle("summary");
      // const time  = await aiPanel.getAIOptionTimeLabel("summary");
      // expect(title).toBe("Summary");
      // expect(time.trim()).not.toBe("");
      throw new Error("TODO-POM: getAIOptionTitle / getAIOptionTimeLabel no existen en src/pages/ — ver wiki/log.md [gap] Panel Asistencia IA");
    });

    // ── Criterio 4: cuarta opción → label de tiempo visible ──────────────────
    // TODO-POM: Requiere método getAIOptionTimeLabelByIndex(index: number): Promise<string>
    // o un identificador estable para la cuarta opción del panel.
    // Confirmar con DevTools si existe data-testid individual para cada opción.
    await step("Verificar cuarta opción del panel: label de tiempo presente", async () => {
      // const time = await aiPanel.getAIOptionTimeLabelByIndex(3);
      // expect(time.trim()).not.toBe("");
      throw new Error("TODO-POM: getAIOptionTimeLabelByIndex no existe en src/pages/ — ver wiki/log.md [gap] Panel Asistencia IA");
    });

    log.info("NAA-4248 — test bloqueado por POMs faltantes. Ver wiki/log.md [gap] Panel Asistencia IA.");
  },
  {
    epic: "ai-post",
    feature: "Asistencia IA",
    story: "Labels de tiempo y títulos de opciones",
    severity: "minor",
    issueId: "NAA-4248",
  }
);

import { runSession } from "../../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../../src/core/config/envConfig.js";
import { description, step } from "allure-js-commons";
import { MainLoginPage } from "../../src/pages/login_page/MainLoginPage.js";
import { MainPostPage } from "../../src/pages/post_page/MainPostPage.js";
