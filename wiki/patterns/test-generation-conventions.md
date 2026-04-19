# Test Generation Conventions

> Fuente canónica de las convenciones project-wide para la escritura de archivos `.test.ts` en `sessions/`. Referenciada por `create-session` SKILL.md, `test-generator.md` y `sessions/README.md`.

## Estructura obligatoria de un archivo de session

### Imports al final

Los imports siempre van **después** del bloque `runSession`, nunca antes. Esta es una convención del proyecto — romperla afecta la legibilidad del flujo:

```typescript
runSession("...", async ({ driver, opts, log }) => { ... });

import { runSession } from "../../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../../src/core/utils/getAuthURL.js";
// ...resto de imports
```

### Imports base (siempre presentes)

```typescript
import { runSession } from "../../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../../src/core/config/envConfig.js";
import { description } from "allure-js-commons";
import { MainLoginPage } from "../../src/pages/login_page/MainLoginPage.js";
```

> Paths desde `sessions/<subfolder>/` usan `../../src/...`. Si el archivo está directamente en `sessions/`, usar `../src/...`.

### Navegación inicial

Siempre presente, antes de cualquier acción del test:

```typescript
const { user, pass } = ENV_CONFIG.getCredentials('editor'); // o 'admin'
const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
await driver.get(authUrl);
```

### Login como primer step

```typescript
await login.passLoginAndTwoFA({ username: user, password: pass });
```

### Sidebar (cuando el flujo no empieza en posts)

```typescript
await sidebar.goToComponent('VIDEOS');
// import { SidebarAndHeader } from "../../src/pages/SidebarAndHeaderSection.js";
```

## Anotaciones de cabecera

### `@default-role` (obligatoria en toda session)

Primera línea del archivo. Debe coincidir exactamente con el rol pasado a `getCredentials()`:

```typescript
// @default-role: editor
runSession('Nombre del test', async ({ driver, opts, log }) => {
  const { user, pass } = ENV_CONFIG.getCredentials('editor');
```

Roles válidos: `editor` | `admin` | `basic`. Default del proyecto: `editor`.

### `@target-env` (cuando aplica)

Presente cuando la session es generada automáticamente o tiene un ambiente específico. Va antes de `@default-role`:

```typescript
// @target-env: master  // ejecutar con TARGET_ENV=master
// @default-role: editor
```

Mapping de valores:
- `"master"` → `TARGET_ENV=master`
- `"dev_saas"` → `TARGET_ENV=testing`

Esta anotación es solo documentativa — no modifica el runtime.

## Uso de Page Objects (POs)

- Instanciar solo los POs que se usan en el test.
- Usar siempre los **POs Maestros** de `src/pages/`. No duplicar lógica de UI inline.
- Firma única: `(driver, opts)` — ningún Maestro recibe `noteType`/`videoType` en el constructor. El tipo viaja dentro del objeto de data (`data.noteType` / `data.videoType`); los métodos lo leen internamente.
- Prohibido en archivos `.test.ts`: `By.*`, `driver.findElement`, `driver.wait`, `waitFind`, `clickSafe`, `writeSafe`, assertions directas sobre `WebElement`.

## Logs

**Log de cierre obligatorio:**

```typescript
log.info("✅ <resultado>");
```

## `description()` Allure (obligatoria)

```typescript
description(`
### Test: <título>
---
**Objetivo:** <qué valida>
**Flujo:**
1. paso
2. paso
> **Resultado esperado:** <qué ocurre al final>
`);
```

Importar desde `allure-js-commons`.

## No sleeps en producción

`driver.sleep()` solo con comentario justificado que explique por qué no funciona una espera explícita. Si el usuario no lo pide explícitamente, no incluir.

## Convenciones para sessions de exploración / log empírico

Cuando la session NO hace asserts funcionales sino que captura información para revisión manual:

1. **Leer campos desde el POM:** Para obtener el título de la nota usar `editor.text.getTitle()`, nunca `driver.getTitle()` (que devuelve el título del tab, no el campo del CMS).

2. **Siempre guardar antes de que el driver cierre:** Si la session abre el editor de notas, ejecutar `await editor.closeNoteEditor('SAVE_AND_EXIT')` (o `PUBLISH_AND_EXIT`) antes de terminar.

3. **Orden correcto para sessions empíricas con editor:**
   ```typescript
   // 1. Leer datos ANTES de salir del editor
   const noteTitle = await editor.text.getTitle();
   const editorUrl = await driver.getCurrentUrl();
   // 2. Guardar
   await editor.closeNoteEditor('SAVE_AND_EXIT');
   // 3. Loguear lo capturado
   log.info(`📋 Título: ${noteTitle}`);
   log.info(`🔗 URL del editor: ${editorUrl}`);
   ```

## Factories

Importar desde `../../src/data_test/factories/index.js`. Declarar data antes de instanciar POs.

**Override de campos de factory:**

```typescript
const aiData = AINoteDataFactory.create();
// Sobrescribir solo el campo necesario — el resto viene del factory
aiData.task = "Instrucción específica hardcodeada para este test";
```

Nunca construir el objeto entero a mano solo porque un campo necesita ser distinto.

## Ver también

- `wiki/patterns/factory-api.md` — API completa de factories de datos de prueba
- `wiki/sessions/catalog.md` — catálogo de sessions existentes
- `sessions/README.md` — estructura canónica y ejemplo completo
- `.claude/skills/create-session/references/maestros.md` — imports exactos de POs Maestros
