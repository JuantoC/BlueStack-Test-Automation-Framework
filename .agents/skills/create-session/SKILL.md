---
name: create-session
description: Genera archivos .test.ts para el framework de automatización Bluestack dentro de la carpeta /sessions. Usar siempre que el usuario quiera crear un nuevo test, una nueva sesión, un nuevo caso de prueba, o cuando mencione "nuevo test", "nueva sesión", "quiero probar X flujo", "automatizar X", o cualquier variante de agregar cobertura de testing a una funcionalidad del CMS. También activar cuando el usuario describa un flujo de pasos que deba ser validado.
---

# Create Session Skill

Genera un `.test.ts` dentro de `sessions/` siguiendo las convenciones Bluestack.

## Proceso

1. Entender el flujo (sección CMS, pasos, rol). Preguntar si no está claro.
2. Identificar Maestros necesarios → leer su archivo `@src/pages/...` para conocer métodos/firmas exactas desde JSDoc. No asumir de memoria.
3. Si un método necesita más contexto, leer sub-components del mismo subdirectorio.
4. Leer `@src/interfaces/data.ts` antes de referenciar campos de fixtures.
5. Generar el archivo con todas las reglas. Indicar nombre PascalCase y comando de ejecución.

---

## Reglas (todas obligatorias)

**1. Imports al final** — convención del proyecto:

```typescript
runSession("...", async ({ driver, opts, log }) => { ... });
import { runSession } from "../src/core/wrappers/testWrapper.js";
```

**2. Imports base** (siempre presentes):

```typescript
import { runSession } from "../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { description } from "allure-js-commons";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
```

**3. Navegación inicial** (siempre presente):

```typescript
const { user, pass } = ENV_CONFIG.getCredentials('editor'); // o 'admin'
const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
await driver.get(authUrl);
```

**4.** Instanciar solo los POs que se usan. Firma: `(driver, opts)`. Con enum: `(driver, NoteType.POST, opts)`.

**5. Login siempre primer paso:** `await login.passLoginAndTwoFA({ username: user, password: pass });`

**6. Sidebar** (si el flujo no empieza en posts):

```typescript
await sidebar.goToComponent(SidebarOption.VIDEOS);
// import { SidebarAndHeader, SidebarOption } from "../src/pages/SidebarAndHeaderSection.js";
```

**7. Log de cierre** (obligatorio): `log.info("✅ <resultado>");`

**8. description() Markdown:**

```typescript
description(`
### Test: <título>
---
**Objetivo:** <qué valida>
**Flujo:** 1. paso / 2. paso / ...
> **Resultado esperado:** <qué ocurre al final>
`);
```

**9. No sleeps en producción.** Solo con comentario justificado si el usuario lo pide explícitamente.

---

## Maestros — paths para lectura dinámica

> Solo importar Maestros (`Main*`) en tests. Nunca sub-components directamente.

| Maestro | Leer en |
|---|---|
| `MainLoginPage` | `@src/pages/login_page/MainLoginPage.ts` |
| `MainPostPage` | `@src/pages/post_page/MainPostPage.ts` |
| `MainEditorPage` | `@src/pages/post_page/note_editor_page/MainEditorPage.ts` |
| `MainVideoPage` | `@src/pages/videos_page/MainVideoPage.ts` |
| `SidebarAndHeader` | `@src/pages/SidebarAndHeaderSection.ts` |

Sub-components por sección (bajar solo si se necesita más contexto):

- `login_page/` → `LoginSection.ts`, `TwoFaSection.ts`
- `post_page/` → `PostTable.ts`, `NewNoteBtn.ts`
- `post_page/note_editor_page/` → `EditorHeaderActions.ts`, `EditorTextSection.ts`, `EditorTagsSection.ts`, `EditorAuthorSection.ts`, `EditorLateralSettings.ts`, `EditorImagesSection.ts`, `noteList/BaseListicleSection.ts`, `noteList/ListicleItemSection.ts`
- `videos_page/` → `VideoTable.ts`, `UploadVideoBtn.ts`, `UploadVideoModal.ts`, `VideoActions.ts`, `FooterVideoActions.ts`

---

## Enums y Fixtures

| Símbolo | Fuente canónica |
|---|---|
| `NoteType` | `@src/pages/post_page/NewNoteBtn.ts` |
| `NoteExitAction` | `@src/pages/post_page/note_editor_page/EditorHeaderActions.ts` |
| `VideoType` | `@src/pages/videos_page/UploadVideoBtn.ts` |
| `ActionType` | `@src/pages/videos_page/VideoActions.ts` |
| `SidebarOption` | `@src/pages/SidebarAndHeaderSection.ts` |
| `LiveBlogData` | `@src/pages/post_page/note_editor_page/noteList/BaseListicleSection.ts` |
| `NoteData`, `VideoData` | `@src/interfaces/data.ts` |

Fixtures — verificar campos en `@src/interfaces/data.ts` antes de usarlos:

| Variable | Import |
|---|---|
| `PostData`, `ListicleData`, `LiveBlogData` | `../src/data_test/noteData.js` |
| `NativeVideoData`, `YoutubeVideoData` | `../src/data_test/videoData.js` |

---

## Ejecución

Al terminar, indicar siempre el comando. `NombreDelTest` = substring del archivo, sin path ni extensión.

```bash
npm run test:dev -- NombreDelTest   # dev/debug (browser visible) ← sugerir por defecto
npm run test:grid -- NombreDelTest  # headless
npm run test:ci -- NombreDelTest    # CI completo
```

---

## Ejemplo de referencia

```typescript
runSession(
  "Publicar nuevo post",
  async ({ driver, opts, log }) => {
    description(`
### Test: Crear Post y publicarlo.
---
**Objetivo:** Validar que un post puede crearse, guardarse y publicarse.
**Flujo:** 1. Login / 2. Crear nota / 3. Llenar y guardar / 4. Reingresar y publicar
> **Resultado esperado:** Post publicado y accesible desde el listado.
    `);

    const { user, pass } = ENV_CONFIG.getCredentials('editor');
    const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
    await driver.get(authUrl);

    const login  = new MainLoginPage(driver, opts);
    const post   = new MainPostPage(driver, NoteType.POST, opts);
    const editor = new MainEditorPage(driver, NoteType.POST, opts);

    await login.passLoginAndTwoFA({ username: user, password: pass });
    await post.createNewNote();
    await editor.fillFullNote(PostData[0]);
    await editor.closeNoteEditor(NoteExitAction.SAVE_AND_EXIT);
    await post.enterToEditorPage(PostData[0].title!);
    await editor.closeNoteEditor(NoteExitAction.PUBLISH_AND_EXIT);

    log.info("✅ Post creado y publicado exitosamente.");
  },
  { epic: "Content Management", feature: "Post Creation", severity: "critical" }
);

import { runSession } from "../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { description } from "allure-js-commons";
import { PostData } from "../src/data_test/noteData.js";
import { NoteType } from "../src/pages/post_page/NewNoteBtn.js";
import { NoteExitAction } from "../src/pages/post_page/note_editor_page/EditorHeaderActions.js";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
import { MainPostPage } from "../src/pages/post_page/MainPostPage.js";
import { MainEditorPage } from "../src/pages/post_page/note_editor_page/MainEditorPage.js";
```

> `npm run test:dev -- PublishNewPost`
