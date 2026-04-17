// @default-role: editor
// @auto-generated: true
// @ticket: NAA-782
// @validated: false  // cambiar a true después de revisión manual
// @target-env: master  // ejecutar con TARGET_ENV=master
runSession("NAA-782 — Galería CKEditor: paginación no-infinita", async ({ driver, opts, log }) => {

  description(`
### Test: Galería CKEditor — flechas de navegación no-infinita
---
**Objetivo:** Verificar que las flechas de navegación de la galería CKEditor respetan los límites:
- Primer ítem: solo flecha derecha visible
- Ítems intermedios: ambas flechas visibles
- Último ítem: solo flecha izquierda visible (galería no cicla)

**Flujo:**
1. Login y navegación a Posts.
2. Abrir post con galería CKEditor de al menos 3 ítems.
3. Verificar estado de flechas en posición inicial (primer ítem).
4. Navegar al segundo ítem y verificar ambas flechas.
5. Navegar al último ítem y verificar flecha izquierda solamente.

> **Resultado esperado:** Las flechas se muestran/ocultan correctamente según la posición en la galería — sin ciclo infinito.
`);

  const { user, pass } = ENV_CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);

  await driver.get(authUrl);

  const login = new MainLoginPage(driver, opts);
  const post = new MainPostPage(driver, 'POST', opts);

  await step("Login en el CMS", async () => {
    await login.passLoginAndTwoFA({ username: user, password: pass });
  });

  await step("Abrir post con galería CKEditor (≥3 ítems)", async () => {
    // TODO-POM: requiere método openPostWithGallery() o similar en MainPostPage / CKEditorGallerySection
    // (src/pages/post_page/note_editor_page/CKEditorGallerySection.ts — no existe aún)
    // Confirmar locators en DevTools: selector del widget galería en CKEditor, botones de navegación
    // await post.openPostWithGallery();
    throw new Error("TODO-POM: no existe método para abrir un post con galería CKEditor — ver wiki/log.md");
  });

  await step("Criterio 1 — Primer ítem: solo flecha derecha visible", async () => {
    // TODO-POM: requiere método getGalleryNavigationState() en CKEditorGallerySection
    // Precondición: galería en posición inicial (ítem 0)
    // Assertion esperada: leftArrow.isDisplayed() === false, rightArrow.isDisplayed() === true
    // await gallery.verifyFirstItemArrows(); // isLeftArrowHidden: true, isRightArrowVisible: true
    throw new Error("TODO-POM: CKEditorGallerySection.verifyFirstItemArrows() no existe — ver wiki/log.md");
  });

  await step("Criterio 2a — Navegar al segundo ítem", async () => {
    // TODO-POM: requiere método clickNextArrow() en CKEditorGallerySection
    // await gallery.clickNextArrow();
    throw new Error("TODO-POM: CKEditorGallerySection.clickNextArrow() no existe — ver wiki/log.md");
  });

  await step("Criterio 2b — Ítem intermedio: ambas flechas visibles", async () => {
    // TODO-POM: requiere método verifyMiddleItemArrows() en CKEditorGallerySection
    // Assertion esperada: leftArrow.isDisplayed() === true, rightArrow.isDisplayed() === true
    // await gallery.verifyMiddleItemArrows();
    throw new Error("TODO-POM: CKEditorGallerySection.verifyMiddleItemArrows() no existe — ver wiki/log.md");
  });

  await step("Criterio 3a — Navegar hasta el último ítem", async () => {
    // TODO-POM: requiere método navigateToLastItem() en CKEditorGallerySection
    // await gallery.navigateToLastItem();
    throw new Error("TODO-POM: CKEditorGallerySection.navigateToLastItem() no existe — ver wiki/log.md");
  });

  await step("Criterio 3b — Último ítem: solo flecha izquierda visible, sin ciclo", async () => {
    // TODO-POM: requiere método verifyLastItemArrows() en CKEditorGallerySection
    // Assertion esperada: leftArrow.isDisplayed() === true, rightArrow.isDisplayed() === false
    // Verificar además que click en derecha (si visible) no retrocede al primer ítem
    // await gallery.verifyLastItemArrows();
    throw new Error("TODO-POM: CKEditorGallerySection.verifyLastItemArrows() no existe — ver wiki/log.md");
  });

  log.info("✅ Test de galería CKEditor completado.");
},
  {
    issueId: "NAA-782",
    epic: "post",
  });

import { runSession } from "../../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../../src/core/config/envConfig.js";
import { description, step } from "allure-js-commons";
import { MainLoginPage } from "../../src/pages/login_page/MainLoginPage.js";
import { MainPostPage } from "../../src/pages/post_page/MainPostPage.js";
