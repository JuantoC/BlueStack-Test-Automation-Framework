# Test (Session) Conventions — BlueStack QA Automation

> Extraído de los archivos reales en `sessions/`. Fuente primaria: código en `sessions/*.test.ts`.

---

## Estructura canónica de una session

```
sessions/<NombreFlujo>.test.ts

Orden interno:
1. runSession() — siempre el primer bloque (sin imports encima)
2. description() — bloque Allure con objetivo y flujo
3. Credenciales + URL
4. Datos dinámicos (factories)
5. Instanciación de Page Objects
6. Ejecución del flujo
7. log.info("✅ ...")
8. Metadata object (epic/feature/severity)
// 9. IMPORTS — SIEMPRE AL FINAL
```

---

## Ejemplo real — NewPost.test.ts

```typescript
runSession('Nota Post Exitosamente', async ({ driver, opts, log }) => {

  description(`
### Test: Crear Post exitosamente, entrar y publicar.
---
**Objetivo:** Verificar que un Post nuevo se guarde y publique correctamente tras re-ingresar.
**Flujo:** 

1. Creación desde cero + SAVE_AND_EXIT.
2. Re-entrada para validación.
3. PUBLISH_AND_EXIT.

> **Resultado esperado:** Los datos deben reflejarse íntegramente en la UI y Post publicado.
`);

  const { user, pass } = ENV_CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
  await driver.get(authUrl);

  const postData = PostDataFactory.create();

  const login = new MainLoginPage(driver, opts);
  const post = new MainPostPage(driver, 'POST', opts);
  const editor = new MainEditorPage(driver, 'POST', opts);

  await login.passLoginAndTwoFA({ username: user, password: pass });
  await post.createNewNote();
  await editor.fillFullNote(postData);
  await editor.closeNoteEditor('SAVE_AND_EXIT');

  const postContainer = await post.table.getPostContainerByTitle(postData.title!);
  await post.enterToEditorPage(postContainer);
  await editor.settings.selectSectionOption(1);
  await editor.closeNoteEditor('PUBLISH_AND_EXIT');

  log.info("✅ Prueba de creación de Post exitosa.");
},
  {
    epic: "Post Component",
    feature: "Post",
    severity: "normal",
  });

import { runSession } from "../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { description } from "allure-js-commons";
import { PostDataFactory } from "../src/data_test/factories/index.js";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
import { MainPostPage } from "../src/pages/post_page/MainPostPage.js";
import { MainEditorPage } from "../src/pages/post_page/note_editor_page/MainEditorPage.js";
```

---

## runSession — firma

```typescript
runSession(
  sessionLabel: string,
  testLogic: (context: { driver: WebDriver, session: DriverSession, opts: RetryOptions, log: Logger }) => Promise<void>,
  metadata?: {
    epic?: string;
    feature?: string;
    story?: string;
    severity?: "blocker" | "critical" | "normal" | "minor" | "trivial";
    issueId?: string;
    tags?: string[];
  }
): void
```

Fuente: `src/core/wrappers/testWrapper.ts`

---

## Factories disponibles

```typescript
// Importar siempre desde este path:
import { PostDataFactory, ListicleDataFactory, LiveBlogDataFactory,
         YoutubeVideoDataFactory, NativeVideoDataFactory } from "../src/data_test/factories/index.js";

PostDataFactory.create()
PostDataFactory.create({ authorType: 'BYLINE' })
PostDataFactory.createMany(5)

ListicleDataFactory.create()
ListicleDataFactory.create({ itemCount: 7 })    // min 3, max 20

LiveBlogDataFactory.create()
LiveBlogDataFactory.create({ entryCount: 10 })  // min recomendado: 5

YoutubeVideoDataFactory.create()
YoutubeVideoDataFactory.create({ url: 'https://www.youtube.com/watch?v=ABC123' })

NativeVideoDataFactory.create()
```

---

## Naming de archivos

```
PascalCase.test.ts
NombreFlujoDescriptivo.test.ts  ← flujo completo en una palabra compuesta

Ejemplos reales:
NewPost.test.ts
NewListicle.test.ts
MassPublishNotes.test.ts
PostAndVideo.test.ts       ← cross-component: usar "And"
StressMassActions.test.ts  ← stress: prefijo "Stress"
```

---

## Metadata de Allure — valores reales del proyecto

```
epics usados: "Post Component", "Video Component", "AI Post Component",
              "Post Management", "Video Management", "Stress Test", "Login"

features usadas: "Post", "Listicle", "LiveBlog", "AI Post",
                 "Embedded Video", "Youtube Video",
                 "Mass Publication", "Cross-Component Workflow", "Mass Actions"

severity: "normal" para flujos estándar, "critical" para flujos críticos (cross-component, stress)
```

---

## TestContext — propiedades inyectadas

| Propiedad | Tipo | Uso |
|---|---|---|
| `driver` | `WebDriver` | Instancia Selenium — pasar a cada Page Object |
| `opts` | `RetryOptions` | Config de reintentos — pasar a cada Page Object |
| `log` | `Logger` | Logger estructurado — `log.info(...)`, `log.error(...)` |
| `session` | `DriverSession` | Incluye `networkMonitor`; uso avanzado |

---

## Setup y teardown

No existe `beforeAll`/`afterEach` en las sessions — el ciclo de vida completo está encapsulado en `runSession()`:
- Inicializa driver automáticamente
- Toma screenshot on failure
- Verifica errores 4xx/5xx via NetworkMonitor
- Libera driver al terminar

---

## Reglas clave

- **Un solo `runSession()` por archivo** — no anidar, no duplicar
- **`opts` en cada Page Object** — no omitirlo ni construir RetryOptions manualmente
- **`description()`** de `allure-js-commons` — siempre incluir para trazabilidad
- **`log.info("✅ ...")`** — señal de éxito al cierre, obligatorio
- **Datos dinámicos solo via factories** — cero fixtures estáticos, cero strings hardcodeados como datos de test
- **Imports al final** — convención que no se rompe
