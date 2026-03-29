---
name: create-session
description: Genera archivos .test.ts para el framework de automatización Bluestack dentro de la carpeta /sessions. Usar siempre que el usuario quiera crear un nuevo test, una nueva sesión, un nuevo caso de prueba, o cuando mencione "nuevo test", "nueva sesión", "quiero probar X flujo", "automatizar X", o cualquier variante de agregar cobertura de testing a una funcionalidad del CMS. También activar cuando el usuario describa un flujo de pasos que deba ser validado.
---

# Create Session Skill

Genera un `.test.ts` dentro de `sessions/` siguiendo las convenciones Bluestack.

## Proceso

1. Entender el flujo (sección CMS, pasos, rol). Preguntar si no está claro.
2. Leer `sessions/README.md` para obtener contexto adicional: convenciones, catálogo existente, estructura canónica. Es input suplementario, no primario.
3. Identificar los Maestros necesarios → leer sus archivos `.ts` directamente en `src/pages/...`. La fuente de verdad son los tipos, firmas y JSDoc del código — no el README.
4. Si un método necesita más contexto, leer sub-components del mismo subdirectorio.
5. Generar el archivo con todas las reglas. Indicar nombre PascalCase.

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

## Data: Factories con faker-js

> **Siempre importar desde `../src/data_test/factories/index.js`** — solo las factories que se usan en el test.
> Para las firmas completas (`create`, `createMany`, overrides disponibles, y el caso especial de `AINoteData`), ver **[sessions/README.md — Data Factories](../../../sessions/README.md)**.

Reglas operativas:
- Declarar la data antes de instanciar los POs.
- `create()` para un objeto único; `createMany(n)` solo si el test necesita múltiples ítems distintos.
- Los valores de tipo son strings literales (`'BYLINE'`, `'POST'`) — ya no se usan enums.

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

Ver **[sessions/README.md — Convenciones de Escritura](../../../sessions/README.md)** para la estructura canónica completa con ejemplo funcional. Los tests existentes en `sessions/` son también fuente de referencia directa.
