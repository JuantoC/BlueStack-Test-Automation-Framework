---
name: create-session
description: Genera archivos .test.ts para el framework de automatización Bluestack dentro de la carpeta /sessions. Usar siempre que el usuario quiera crear un nuevo test, una nueva sesión, un nuevo caso de prueba, o cuando mencione "nuevo test", "nueva sesión", "quiero probar X flujo", "automatizar X", o cualquier variante de agregar cobertura de testing a una funcionalidad del CMS. También activar cuando el usuario describa un flujo de pasos que deba ser validado.
---

# Create Session Skill

Genera un archivo `.test.ts` completo, limpio y listo para ejecutar dentro de `sessions/`, siguiendo estrictamente las convenciones del framework Bluestack.

---

## Lo que necesitás entender antes de generar

### Estructura del wrapper `runSession()`

Todo test es una llamada a `runSession()` con esta firma:

```typescript
runSession(
  "Nombre del test",           // Label visible en Allure y en los logs
  async ({ driver, opts, log }) => {
    // lógica del test
  },
  {                            // Metadata Allure (opcional pero recomendada)
    epic: "...",
    feature: "...",
    severity: "critical" | "blocker" | "normal" | "minor" | "trivial",
    tags: [...],
    issueId: "...",            // Solo si hay ticket de Jira asociado
  }
);
```

`driver` → instancia de WebDriver  
`opts` → configuración de reintentos, se pasa a cada Page Object  
`log` → logger con contexto, usar `log.info()` al final del test para confirmar éxito

---

## Reglas de generación

### 1. Orden del archivo
Los imports van **siempre al final**, después de `runSession()`. Esto es una convención del proyecto, no un error.

```typescript
// ✅ Correcto
runSession("...", async ({ driver, opts, log }) => {
  // lógica
});

import { runSession } from "../src/core/wrappers/testWrapper.js";
import { ... } from "...";
```

### 2. Imports obligatorios en todo test

```typescript
import { runSession } from "../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { description } from "allure-js-commons";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
```

### 3. Bloque de navegación inicial (siempre presente)

```typescript
const { user, pass } = ENV_CONFIG.getCredentials('editor'); // o 'admin' según el caso
const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
await driver.get(authUrl);
```

### 4. Instanciación de Page Objects

Cada Page Object recibe `(driver, opts)` como mínimo. Algunos reciben un tercer argumento de tipo (como `NoteType`):

```typescript
const login   = new MainLoginPage(driver, opts);
const post    = new MainPostPage(driver, NoteType.POST, opts);
const editor  = new MainEditorPage(driver, NoteType.POST, opts);
const video   = new MainVideoPage(driver, opts);
const sidebar = new SidebarAndHeader(driver, opts);
```

Solo instanciar los Page Objects que el test realmente usa.

### 5. Login siempre es el primer paso

```typescript
await login.passLoginAndTwoFA({ username: user, password: pass });
```

### 6. Navegación por sidebar (cuando el flujo no empieza en posts)

```typescript
await sidebar.goToComponent(SidebarOption.VIDEOS); // o el componente correspondiente
```

Importar: `import { SidebarAndHeader, SidebarOption } from "../src/pages/SidebarAndHeaderSection.js";`

### 7. Log de cierre (obligatorio)

Siempre cerrar el test con una línea informativa:

```typescript
log.info("✅ <Descripción breve del resultado esperado>");
```

### 8. `description()` con formato Markdown

```typescript
description(`
  ### Test: <título del test>
  ---
**Objetivo:** <qué valida este test>

**Flujo de pasos:**
1. <paso 1>
2. <paso 2>
...

> **Resultado esperado:** <qué debe ocurrir al final>
`);
```

### 9. `sleep()` solo en casos de debug

Nunca generar sleeps en tests nuevos de producción. Si el usuario lo pide explícitamente, agregarlo con un comentario que explique por qué.

---

## Page Objects disponibles y sus imports

| Page Object | Import |
|---|---|
| `MainLoginPage` | `../src/pages/login_page/MainLoginPage.js` |
| `MainPostPage` | `../src/pages/post_page/MainPostPage.js` |
| `MainEditorPage` | `../src/pages/post_page/note_editor_page/MainEditorPage.js` |
| `MainVideoPage` | `../src/pages/videos_page/MainVideoPage.js` |
| `SidebarAndHeader` | `../src/pages/SidebarAndHeaderSection.js` |

## Enums frecuentes y sus imports

| Enum | Import |
|---|---|
| `NoteType` | `../src/pages/post_page/NewNoteBtn.js` |
| `NoteExitAction` | `../src/pages/post_page/note_editor_page/EditorHeaderActions.js` |
| `SidebarOption` | `../src/pages/SidebarAndHeaderSection.js` |
| `ActionType` | `../src/pages/videos_page/VideoActions.js` |

## Fixtures de datos disponibles

Los fixtures viven en `src/data_test/`. Los imports desde `sessions/` usan la ruta `../src/data_test/`.

| Variable | Import |
|---|---|
| `PostData` | `../src/data_test/noteData.js` |
| `ListicleData` | `../src/data_test/noteData.js` |
| `LiveBlogData` | `../src/data_test/noteData.js` |
| `NativeVideoData` | `../src/data_test/videoData.js` |
| `YoutubeVideoData` | `../src/data_test/videoData.js` |

Antes de referenciar campos de un fixture, leer `@src/interfaces/data.ts` para verificar la interfaz actualizada.

---

## Nombre del archivo

Usar `PascalCase` y que describa el flujo. Ejemplos:
- `PublishNewPost.test.ts`
- `EditInlineTitle.test.ts`
- `UploadNativeVideo.test.ts`
- `AdminUserCreation.test.ts`

---

## Comando para ejecutar el test generado

Al terminar de generar el archivo, **siempre** indicar el comando para correrlo.

El patrón es:
```bash
npm run test:dev -- NombreDelTest
```

Donde `NombreDelTest` es cualquier cadena **incluida** en el nombre del archivo. Jest la usa como regex y busca dentro de `sessions/` automáticamente. No es una ruta, no lleva `/sessions/`, no lleva `.test.ts`.

### Modos de ejecución

| Comando | Cuándo usarlo |
|---|---|
| `npm run test:dev -- NombreDelTest` | **Debug / desarrollo local** — browser visible |
| `npm run test:grid -- NombreDelTest` | Grid Docker headless |
| `npm run test:ci -- NombreDelTest` | CI: ciclo completo (clean → infra:up → exec → infra:down) |

**Para debuggear, siempre sugerir `test:dev`.**

Ejemplos con el archivo `PublishNewPost.test.ts`:
```bash
npm run test:dev -- PublishNewPost      # ✅ correcto
npm run test:dev -- Publish             # ✅ también válido (substring)
npm run test:dev -- sessions/PublishNewPost.test.ts  # ❌ incorrecto
```

---

## Proceso de generación

1. **Entender el flujo**: si no está claro, preguntar qué sección del CMS, qué pasos, qué rol de usuario.
2. **Identificar Page Objects y fixtures** necesarios para ese flujo.
3. **Verificar interfaces** leyendo `@src/interfaces/data.ts` antes de referenciar campos de fixtures.
4. **Generar el archivo** respetando todas las reglas anteriores.
5. **Indicar el nombre** del archivo en `PascalCase`.
6. **Indicar el comando** para correrlo: `npm run test:dev -- NombreDelTest`

---

## Ejemplo completo de referencia

```typescript
runSession(
  "Publicar nuevo post",
  async ({ driver, opts, log }) => {

    description(`
      ### Test: Crear Post y publicarlo.
      ---
**Objetivo:** Validar que un post puede crearse, guardarse y publicarse correctamente.

**Flujo de pasos:**
1. Login como editor.
2. Creación de nueva nota tipo Post.
3. Llenado de campos y guardado con salida.
4. Re-ingreso al editor y publicación.

> **Resultado esperado:** El post debe quedar publicado y accesible desde el listado.
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
  {
    epic: "Content Management",
    feature: "Post Creation",
    severity: "critical",
  }
);

import { runSession } from "../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { PostData } from "../src/data_test/noteData.js";
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { NoteType } from "../src/pages/post_page/NewNoteBtn.js";
import { NoteExitAction } from "../src/pages/post_page/note_editor_page/EditorHeaderActions.js";
import { description } from "allure-js-commons";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
import { MainPostPage } from "../src/pages/post_page/MainPostPage.js";
import { MainEditorPage } from "../src/pages/post_page/note_editor_page/MainEditorPage.js";
```

> Para correrlo: `npm run test:dev -- PublishNewPost`