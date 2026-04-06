<!--
@doc-type: readme
@scope: module
@audience: both
@related: README.md, src/core/wrappers/testWrapper.ts, src/pages/README.md, src/core/README.md
@last-reviewed: 2026-04-06
@summary: Catálogo y convenciones de los archivos de test end-to-end del CMS Bluestack; uno por flujo editorial, descubiertos automáticamente por Jest.
-->

# `@sessions/` — Test Sessions

> Colección de tests E2E ejecutables. Cada archivo representa un flujo de usuario completo e independiente sobre el CMS Bluestack. Son la fuente de verdad del comportamiento observable del sistema.

---

# Quick Reference

| Concepto | Regla |
|---|---|
| Punto de entrada | `runSession(label, testLogic, metadata?)` — obligatorio |
| Un archivo = un flujo | Un solo `runSession()` por archivo |
| Imports | Siempre al final del archivo, extensión `.js` |
| Datos de prueba | Solo fábricas faker-js — cero fixtures estáticos |
| Naming de archivo | `PascalCase.test.ts` |
| Descubrimiento | Jest glob `**/sessions/**/*.test.ts` |
| Timeout por test | 20 minutos (`jest.config.cjs`) |
| Paralelismo | Controlado por `MAX_INSTANCES` en `.env` |

---

# Arquitectura

Los archivos en `sessions/` son el nivel más alto del framework. No contienen lógica de UI — solo orquestación:

```
Test file (sessions/*.test.ts)
    └── runSession()           ← testWrapper.ts — ciclo de vida completo
          ├── initializeDriver()
          ├── testLogic({ driver, opts, log })
          │     ├── Factory.create()        ← datos dinámicos
          │     ├── new MainXxxPage(...)    ← Page Objects
          │     └── await page.method()
          ├── screenshot on failure
          ├── checkConsoleErrors()
          ├── networkMonitor.stop()
          └── quitDriver()
```

`runSession` envuelve internamente `test()` de Jest e inyecta automáticamente:
- Metadata de Allure (`epic`, `feature`, `severity`, `issueId`, etc.)
- Parámetros de entorno (`Execution: Grid/Local`, `Headless: true/false`)
- Screenshot adjunto al reporte en caso de fallo
- Verificación de errores de red 4xx/5xx via `NetworkMonitor`

---

# Directorio

```
sessions/
├── FailedLogin.test.ts          # Auth — login fallido reiterado + exitoso
├── NewPost.test.ts              # Post — creación, guardado y publicación
├── NewListicle.test.ts          # Listicle — creación con BACK_SAVE y publicación
├── NewLiveBlog.test.ts          # LiveBlog — creación y publicación
├── NewAIPost.test.ts            # AI Post — generación asistida por IA + guardado
├── NewEmbeddedVideo.test.ts     # Video — creación de Embedded + edición inline
├── NewYoutubeVideo.test.ts      # Video — subida YouTube + edición inline
├── MassPublishNotes.test.ts     # Mass Actions — Post + Listicle + Liveblog masivos
├── MassPublishImages.test.ts    # Mass Actions — subida nativa, edición inline y publicación de imágenes
├── MassPublishVideos.test.ts    # Mass Actions — publicación masiva de videos
├── PostAndVideo.test.ts         # Cross-component — Post + YouTube (critical)
└── StressMassActions.test.ts    # Stress — notas + videos + AI + publicación masiva
```

---

# API — `runSession`

Firma extraída de [src/core/wrappers/testWrapper.ts](../src/core/wrappers/testWrapper.ts):

```typescript
runSession(
  sessionLabel: string,                              // Etiqueta del test en logs y Allure
  testLogic: (context: TestContext) => Promise<void>,
  metadata?: TestMetadata                            // Opcional — clasificación Allure
): void
```

**`TestContext`** — objeto inyectado en `testLogic`:

| Propiedad | Tipo | Descripción |
|---|---|---|
| `driver` | `WebDriver` | Instancia Selenium lista para usar |
| `session` | `DriverSession` | Sesión completa (incluye `networkMonitor`) |
| `opts` | `RetryOptions` | Config de reintentos; pasar a cada Page Object |
| `log` | `Logger` | Logger estructurado con transport de sesión |

**`TestMetadata`** — tercer argumento opcional:

| Campo | Tipo | Uso en Allure |
|---|---|---|
| `epic` | `string` | Agrupa tests por dominio de negocio |
| `feature` | `string` | Sub-agrupación dentro del epic |
| `story` | `string` | Historia de usuario específica |
| `severity` | `"blocker" \| "critical" \| "normal" \| "minor" \| "trivial"` | Criticidad del test |
| `issueId` | `string` | Ticket Jira — genera link clickeable en el reporte |
| `tags` | `string[]` | Etiquetas libres |

---

# Catálogo de Sessions

| Archivo | Epic | Feature | Severity | Page Objects usados |
|---|---|---|---|---|
| `FailedLogin` | Login | Failed Login | normal | `MainLoginPage` |
| `NewPost` | Post Component | Post | normal | `MainLoginPage`, `MainPostPage`, `MainEditorPage` |
| `NewListicle` | Post Component | Listicle | normal | `MainLoginPage`, `MainPostPage`, `MainEditorPage` |
| `NewLiveBlog` | Post Component | LiveBlog | normal | `MainLoginPage`, `MainPostPage`, `MainEditorPage` |
| `NewAIPost` | AI Post Component | AI Post | normal | `MainLoginPage`, `MainPostPage`, `MainAIPage`, `MainEditorPage` |
| `NewEmbeddedVideo` | Video Component | Embedded Video | normal | `MainLoginPage`, `MainVideoPage`, `SidebarAndHeader` |
| `NewYoutubeVideo` | Video Component | Youtube Video | normal | `MainLoginPage`, `MainVideoPage`, `SidebarAndHeader` |
| `MassPublishNotes` | Post Management | Mass Publication | normal | `MainLoginPage`, `MainPostPage`, `MainEditorPage` |
| `MassPublishImages` | Multimedia | Imágenes | normal | `MainLoginPage`, `MainImagePage`, `SidebarAndHeader` |
| `MassPublishVideos` | Video Management | Mass Publication | normal | `MainLoginPage`, `MainVideoPage`, `SidebarAndHeader` |
| `PostAndVideo` | Post & Video Component | Cross-Component Workflow | **critical** | `MainLoginPage`, `MainPostPage`, `MainEditorPage`, `MainVideoPage`, `SidebarAndHeader` |
| `StressMassActions` | Stress Test | Mass Actions | **critical** | todos los anteriores + `MainAIPage` |

---

# Data Factories

Todos los datos de prueba son generados dinámicamente via **faker-js**. Importar siempre desde `../src/data_test/factories/index.js`. Declarar la data antes de instanciar los Page Objects.

### `PostDataFactory`

```typescript
PostDataFactory.create()                              // datos aleatorios
PostDataFactory.create({ authorType: 'BYLINE' })     // con override
PostDataFactory.createMany(5)                         // múltiples únicos
PostDataFactory.createMany(3, { authorType: 'BYLINE' })
```

### `ListicleDataFactory`

```typescript
ListicleDataFactory.create()                          // items aleatorios (3–20)
ListicleDataFactory.create({ itemCount: 7 })          // forzar cantidad
ListicleDataFactory.createMany(3, { itemCount: 5 })
```

`itemCount`: parámetro de creación, no campo de la interfaz. Mínimo 3, máximo 20.

### `LiveBlogDataFactory`

```typescript
LiveBlogDataFactory.create()                          // entradas aleatorias (5–20)
LiveBlogDataFactory.create({ entryCount: 10 })
LiveBlogDataFactory.create({ eventLiveBlog: { eventTitle: 'Conferencia Tech 2025' } })
LiveBlogDataFactory.createMany(2, { entryCount: 8 })
```

`entryCount`: parámetro de creación. Mínimo recomendado: 5.

### `YoutubeVideoDataFactory`

```typescript
YoutubeVideoDataFactory.create()                      // URL aleatoria del pool interno
YoutubeVideoDataFactory.create({ url: 'https://www.youtube.com/watch?v=ABC123' })
YoutubeVideoDataFactory.createMany(3)
```

### `NativeVideoDataFactory`

```typescript
NativeVideoDataFactory.create()                       // path rotado del pool disponible
NativeVideoDataFactory.create({ path: 'src/data_test/videos/mi_video.mp4' })
NativeVideoDataFactory.createMany(2)
```

El archivo en `path` debe existir vía Git LFS o paso AWS en CI.

### AI Post (caso especial)

Para `MainAIPage` la data no viene de faker-js sino de la interfaz `AINoteData` en `src/interfaces/data.ts`:

```typescript
import { AINoteData } from "../src/interfaces/data.js";
const aiData: Partial<AINoteData> = { /* campos de prompts */ };
await aiPage.generateNewAINote(aiData);
```

---

# Convenciones de Escritura

### Estructura canónica de un archivo `.test.ts`

```typescript
// 1. runSession() — único punto de entrada, siempre primero
runSession(
  "Descripción legible del flujo",
  async ({ driver, opts, log }) => {

    // 2. description() — bloque Allure con objetivo y flujo
    description(`### Test: ...\n---\n**Objetivo:** ...\n**Flujo:** ...`);

    // 3. Credenciales y navegación
    const { user, pass } = ENV_CONFIG.getCredentials('editor');
    const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ...);
    await driver.get(authUrl);

    // 4. Datos dinámicos desde fábricas
    const data = XxxDataFactory.create();

    // 5. Instanciación de Page Objects (siempre con opts)
    const login = new MainLoginPage(driver, opts);
    const page  = new MainXxxPage(driver, 'TYPE', opts);

    // 6. Ejecución del flujo
    await login.passLoginAndTwoFA({ username: user, password: pass });
    await page.someMethod(data);

    log.info("✅ Descripción del resultado exitoso.");
  },
  {
    epic: "...",
    feature: "...",
    severity: "normal",  // o "critical" para flujos críticos
  }
);

// 7. Imports — SIEMPRE AL FINAL, extensión .js obligatoria
import { runSession } from "../src/core/wrappers/testWrapper.js";
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
// ...resto de imports
```

### Reglas clave

- **Imports al final:** convención del proyecto — invertir el orden rompe la legibilidad del flujo.
- **`opts` en cada Page Object:** permite que el sistema de reintentos funcione end-to-end.
- **Un flujo por archivo:** nunca anidar múltiples `runSession()`.
- **`log.info("✅ ...")` al cierre:** señal de éxito legible en la consola y en el log estructurado.
- **`description()`** es de `allure-js-commons` — siempre incluir para trazabilidad en el reporte.

---

# Ejecución

```bash
# Un test específico (local, browser visible)
npm run test:dev -- NewPost

# Contra el Docker Grid
npm run test:grid -- NewPost

# CI completo (clean → infra:up → exec → infra:down)
npm run test:ci -- NewPost

# Generar y abrir reporte Allure
npm run report:show
```

---

# 🔗 Documentación relacionada

- [README.md](../README.md) — setup completo, ejecución, Docker Grid y naming conventions del proyecto
- [src/core/wrappers/testWrapper.ts](../src/core/wrappers/testWrapper.ts) — implementación de `runSession`, `TestContext` y `TestMetadata`
- [src/core/wrappers/retry.ts](../src/core/wrappers/retry.ts) — política de reintentos con exponential backoff que consumen los Page Objects via `opts`
- [src/pages/README.md](../src/pages/README.md) — especificación autoritativa de la capa Page Object: constructores, locators y naming
- [src/data_test/factories/](../src/data_test/factories/) — fábricas faker-js para datos de prueba dinámicos
- [jest.config.cjs](../jest.config.cjs) — configuración de Jest: timeout, workers, testMatch y entorno Allure
