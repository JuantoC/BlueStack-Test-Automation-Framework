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
4. Generar el archivo con todas las reglas. Indicar nombre PascalCase.

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

**4.** Instanciar solo los POs que se usan. Firma base: `(driver, opts)`. Con tipo de nota: `(driver, 'POST', opts)`.

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
**Flujo:** 
1. paso
2. paso
...
> **Resultado esperado:** <qué ocurre al final>
`);
```

**9. No sleeps en producción.** Solo con comentario justificado si el usuario lo pide explícitamente.

---

## Data: Factories con faker-js (sistema activo)

> **Siempre importar desde `../src/data_test/factories/index.js`**

### Import canónico

```typescript
import {
  PostDataFactory,
  ListicleDataFactory,
  LiveBlogDataFactory,
  YoutubeVideoDataFactory,
  NativeVideoDataFactory,
} from "../src/data_test/factories/index.js";
```

Solo importar las factories que se usan en el test.

---

### Firmas de las factories

#### `PostDataFactory`

```typescript
// Un post con datos aleatorios
const postData = PostDataFactory.create();

// Con overrides para campos específicos
const postData = PostDataFactory.create({ authorType: 'BYLINE' });

// Múltiples posts únicos (para paginación, listados, etc.)
const postsData = PostDataFactory.createMany(5);
const postsData = PostDataFactory.createMany(3, { authorType: 'BYLINE' });
```

---

#### `ListicleDataFactory`

```typescript
// Listicle con cantidad de items aleatoria (3–20 por defecto)
const listicle = ListicleDataFactory.create();

// Forzar cantidad de items
const listicle = ListicleDataFactory.create({ itemCount: 7 });

// Múltiples listicles
const listicles = ListicleDataFactory.createMany(3, { itemCount: 5 });
```

`itemCount` es un parámetro de creación (no un campo de la interfaz). Mínimo 3, máximo 20.

---

#### `LiveBlogDataFactory`

```typescript
// LiveBlog con entradas aleatorias (5–20 por defecto)
const liveBlog = LiveBlogDataFactory.create();

// Forzar cantidad de entradas
const liveBlog = LiveBlogDataFactory.create({ entryCount: 10 });

// Forzar título del evento (merge profundo automático)
const liveBlog = LiveBlogDataFactory.create({
  eventLiveBlog: { eventTitle: 'Conferencia Tech 2025' }
});

// Múltiples liveblogs
const liveBlogs = LiveBlogDataFactory.createMany(2, { entryCount: 8 });
```

`entryCount` es un parámetro de creación (no un campo de la interfaz). Mínimo recomendado: 5.

---

#### `YoutubeVideoDataFactory`

```typescript
// Video YouTube con URL aleatoria del pool interno
const video = YoutubeVideoDataFactory.create();

// Forzar URL específica
const video = YoutubeVideoDataFactory.create({
  url: 'https://www.youtube.com/watch?v=ABC123'
});

// Múltiples videos
const videos = YoutubeVideoDataFactory.createMany(3);
```

---

#### `NativeVideoDataFactory`

```typescript
// Video nativo con path rotado del pool disponible
const video = NativeVideoDataFactory.create();

// Forzar archivo específico
const video = NativeVideoDataFactory.create({
  path: 'src/data_test/videos/mi_video.mp4'
});

// Múltiples videos nativos
const videos = NativeVideoDataFactory.createMany(2);
```

El archivo referenciado en `path` debe existir vía Git LFS o paso AWS en CI.

---

### Reglas de uso de factories

- **Siempre declarar la data antes de instanciar los POs**, al inicio del cuerpo del test.
- Usar `create()` para un objeto único. Usar `createMany(n)` solo si el test necesita múltiples ítems distintos.
- Los overrides son opcionales. Solo usarlos si el test valida un campo específico.
- Cada llamada a `create()` genera datos únicos (título con timestamp) → no hay colisiones entre tests concurrentes.
- Los valores de tipo (como `authorType`) son strings literales — ya **no se usan enums**. Ejemplo: `'BYLINE'`, no `AuthorType.BYLINE`.

---

## Data: AI Post (caso especial)

Para tests que involucren `MainAIPage`, la data **no** viene de faker-js sino de la interfaz `AINoteData` definida en `src/interfaces/data.ts`. Se pasa un objeto parcial con los prompts deseados:

```typescript
import { AINoteData } from "../src/interfaces/data.ts";

const aiData: Partial<AINoteData> = { /* campos de prompts */ };
await aiPage.generateNewAINote(aiData);
```

Solo importar `AINoteData` si el test usa `MainAIPage`.

---

## Maestros — paths para lectura dinámica

> Solo importar Maestros (`Main*`) en tests. Nunca sub-components directamente.

| Maestro | Leer en |
|---|---|
| `MainLoginPage` | `@src/pages/login_page/MainLoginPage.ts` |
| `MainPostPage` | `@src/pages/post_page/MainPostPage.ts` |
| `MainEditorPage` | `@src/pages/post_page/note_editor_page/MainEditorPage.ts` |
| `MainVideoPage` | `@src/pages/videos_page/MainVideoPage.ts` |
| `MainAIPage` | `@src/pages/post_page/AIPost/MainAIPage.ts` |
| `SidebarAndHeader` | `@src/pages/SidebarAndHeaderSection.ts` |

Sub-components por sección (bajar solo si se necesita más contexto):

- `login_page/` → `LoginSection.ts`, `TwoFASection.ts`
- `post_page/` → `PostTable.ts`, `NewNoteBtn.ts`
- `post_page/note_editor_page/` → `EditorHeaderActions.ts`, `EditorTextSection.ts`, `EditorTagsSection.ts`, `EditorAuthorSection.ts` `EditorLateralSettings.ts`, `EditorImagesSection.ts`, `noteList/BaseListicleSection.ts`, `noteList/ListicleItemSection.ts`
- `videos_page/` → `VideoTable.ts`, `UploadVideoBtn.ts`, `UploadVideoModal.ts`, `VideoActions.ts`, `FooterActions.ts`
- `modals/` → `CKEditorImageModal.ts`, `PublishModal.ts`
- `AIPost/` → `MainAIPage.ts`

---

## Types

> Todo parámetro con valor predeterminado es ahora un string literal inferido desde un `type` basado en `keyof typeof ClassName.STATIC_OBJECT`.

| Símbolo | Fuente canónica | Ejemplo de uso |
|---|---|---|
| `NoteType` | `@src/pages/post_page/NewNoteBtn.ts` | `'POST'`, `'LISTICLE'`, `'LIVEBLOG'` |
| `NoteExitAction` | `@src/pages/post_page/note_editor_page/EditorHeaderActions.ts` | `'SAVE_AND_EXIT'`, `'PUBLISH_AND_EXIT'` |
| `VideoType` | `@src/pages/videos_page/UploadVideoBtn.ts` | `'YOUTUBE'`, `'NATIVO'` |
| `ActionType` | `@src/pages/videos_page/VideoActions.ts` | string según acciones disponibles |
| `FooterActionType` | `@src/pages/FooterActions.ts` | `'PUBLISH_ONLY'`, etc. |
| `SidebarOption` | `@src/pages/SidebarAndHeaderSection.ts` | string según sección |
| `NoteData`, `VideoData`, `AINoteData` | `@src/interfaces/data.ts` | interfaces de datos |

> Los tipos `PostData`, `ListicleData`, `LiveBlogData`, `YoutubeVideoData`, `NativeVideoData`
> se exportan desde `../src/data_test/factories/index.js` — no hace falta importarlos por separado.

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

    const postData = PostDataFactory.create();

    const login  = new MainLoginPage(driver, opts);
    const post   = new MainPostPage(driver, 'POST', opts);
    const editor = new MainEditorPage(driver, 'POST', opts);

    await login.passLoginAndTwoFA({ username: user, password: pass });
    await post.createNewNote();
    await editor.fillFullNote(postData);
    await editor.closeNoteEditor('SAVE_AND_EXIT');
    await post.enterToEditorPage(postData.title);
    await editor.closeNoteEditor('PUBLISH_AND_EXIT');

    log.info("✅ Post creado y publicado exitosamente.");
  },
  { epic: "Content Management", feature: "Post Creation", severity: "critical" }
);

import { runSession } from "../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { description } from "allure-js-commons";
import { PostDataFactory } from "../src/data_test/factories/index.js";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
import { MainPostPage } from "../src/pages/post_page/MainPostPage.js";
import { MainEditorPage } from "../src/pages/post_page/note_editor_page/MainEditorPage.js";
```
