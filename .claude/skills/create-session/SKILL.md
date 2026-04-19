---
name: create-session
model: sonnet
effort: medium
description: Genera archivos .test.ts para el framework de automatización Bluestack dentro de la carpeta /sessions. Usar siempre que el usuario quiera crear un nuevo test, una nueva sesión, un nuevo caso de prueba, o cuando mencione "nuevo test", "nueva sesión", "quiero probar X flujo", "automatizar X", o cualquier variante de agregar cobertura de testing a una funcionalidad del CMS. También activar cuando el usuario describa un flujo de pasos que deba ser validado.
---

# Create Session Skill

Genera un `.test.ts` dentro de `sessions/` siguiendo las convenciones Bluestack.

## Proceso

1. Entender el flujo (sección CMS, pasos, rol de usuario). Preguntar si no está claro.
2. **Wiki-first:** Leer `wiki/index.md` → navegar a la página relevante para los POs que necesitás. Si la wiki no cubre lo que necesitás, abrir el `.ts` fuente y registrar el gap en `wiki/log.md`.
3. Si necesitás el catálogo de Maestros disponibles con sus imports → leer [`references/maestros.md`](references/maestros.md) (bundled con esta skill).
4. Generar el archivo con todas las reglas de abajo. Indicar nombre `PascalCase.test.ts` al usuario.

---

## Modo debug — invocación desde otras skills

Cuando otra skill (ej: `update-testids`) pasa `--debug` como flag, el comportamiento cambia:

**Input esperado del invocador:**
```
--debug
ticket: NAA-XXXX
area: <nombre del área, ej: "post_editor_header">
locators:
  - POM: src/pages/post_page/note_editor_page/EditorHeaderActions.ts
    nombre: SAVE_BTN
    método: closeNoteEditor('SAVE_ONLY')
    navegación: Login → Posts → entrar al primer ítem en EDIT
  - POM: src/pages/post_page/note_editor_page/EditorHeaderActions.ts
    nombre: PUBLISH_BTN
    método: closeNoteEditor('PUBLISH_ONLY')
    navegación: (misma sesión, re-entrar al editor)
```

**Comportamiento en modo debug:**
- Destino: `sessions/debug/DebugTestids_{KEY}_{area}.test.ts`
- Nombre del test: `"Debug Testids {KEY} — {área legible}"`
- Allure: `epic: "Debug"`, `feature: "Testid Validation"`, `story: "{KEY}"`
- Flujo: el mínimo necesario para llegar a cada elemento e invocar su método real
  - No replicar flujos completos de negocio
  - Agrupar locators de la misma ruta de navegación en un solo `runSession`
  - Un `step()` por cada locator validado
- Las reglas de escritura del modo normal aplican igual (imports al final, etc.)
- **No preguntar al usuario** — generar directamente con el input recibido
- **No registrar en `wiki/sessions/catalog.md`** — es una session temporal
- El invocador es responsable de eliminar el archivo después de ejecutarlo

**Reglas de resolución en modo debug:**

**M1 — Método inexistente en POM:** Si el invocador especifica un método o tipo que no existe en el POM real leído, usar el método real equivalente y dejar un comentario inline:
```typescript
// NOTE: caller specified openNewNoteMenu(), real method is openNoteTypeDropdown()
await postTable.openNoteTypeDropdown();
```

**M2 — Maestro no expone el método (excepción a "solo Maestros"):** Si el Maestro no expone el método requerido como público, instanciar el sub-component directamente con comentario explicativo:
```typescript
// sub-component directo — Maestro no expone selectNoteType() públicamente
const dropdown = new NoteTypeDropdown(driver, opts);
await dropdown.selectNoteType('POST');
```

**M3 — Locators inline sin respaldo POM:** Marcar con `// VERIFY_TESTID` todo locator inline sin método POM para que el invocador sepa qué confirmar con DevTools:
```typescript
const saveBtn = await driver.findElement(By.css('[data-testid="save-btn"]')); // VERIFY_TESTID
```

---

## Reglas (todas obligatorias)

**1. Imports al final** — convención del proyecto (romper el orden rompe la legibilidad del flujo):

```typescript
runSession("...", async ({ driver, opts, log }) => { ... });
import { runSession } from "../../src/core/wrappers/testWrapper.js";
```

**2. Imports base** (siempre presentes, paths desde `sessions/<subfolder>/`):

```typescript
import { runSession } from "../../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../../src/core/config/envConfig.js";
import { description } from "allure-js-commons";
import { MainLoginPage } from "../../src/pages/login_page/MainLoginPage.js";
```

> Si el archivo es `sessions/<subfolder>/` usar `../../src/...`. Si fuera raíz directo, usar `../src/...`.

**3. Navegación inicial** (siempre presente):

```typescript
const { user, pass } = ENV_CONFIG.getCredentials('editor'); // o 'admin'
const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
await driver.get(authUrl);
```

> `ENV_CONFIG` resuelve automáticamente las credenciales y la URL del entorno activo (`TARGET_ENV`). No hay que cambiar nada en el test para correrlo contra otro ambiente — es un parámetro externo de invocación.

**3b. Cuando el invocador especifica `Ambiente destino`** (ej: invocación desde `test-generator`):

Si el input incluye `Ambiente destino: <valor>`, agregar la siguiente línea en la cabecera del archivo (después de `@validated`):

```typescript
// @target-env: master  // ejecutar con TARGET_ENV=master
// @default-role: editor
```

El valor de `@target-env` mapea al `TARGET_ENV` del `.env` así:
- `"master"` → `TARGET_ENV=master`
- `"dev_saas"` → `TARGET_ENV=testing`

> Esta anotación es solo documentativa — no modifica el runtime. El operador que ejecute el test debe setear `TARGET_ENV` en consecuencia. Ver `wiki/qa/environments.md` para la tabla completa de equivalencias.

> Cuando `@target-env` y `@default-role` están presentes, `@default-role` va inmediatamente después de `@target-env` (línea 2 de la cabecera).

**3c. Anotación `@default-role` (obligatoria):**  
Agregar `// @default-role: <rol>` como primera línea del archivo (o segunda, si hay `@target-env`).  
El rol debe coincidir exactamente con el que se pasa a `getCredentials()` en el cuerpo del test.  
Roles válidos: `editor` | `admin` | `basic`. Default del proyecto: `editor`.

Ejemplo (sin `@target-env`):
```typescript
// @default-role: editor
runSession('Nombre del test', async ({ driver, opts, log }) => {
  const { user, pass } = ENV_CONFIG.getCredentials('editor');
```

**4.** Instanciar solo los POs que se usan. Firma única: `(driver, opts)` — ningún Maestro recibe `noteType`/`videoType` en el constructor. El tipo viaja dentro del objeto de data generado por el factory (`data.noteType` / `data.videoType`).

**5. Login siempre primer paso:** `await login.passLoginAndTwoFA({ username: user, password: pass });`

**6. Sidebar** (si el flujo no empieza en posts):

```typescript
await sidebar.goToComponent('VIDEOS');
// import { SidebarAndHeader } from "../../src/pages/SidebarAndHeaderSection.js";
```

**7. Log de cierre** (obligatorio): `log.info("✅ <resultado>");`

**8. description() Allure** (obligatorio, de `allure-js-commons`):

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

**9. No sleeps en producción.** Solo con comentario justificado si el usuario lo pide explícitamente.

---

## Data factories

> Importar desde `../../src/data_test/factories/index.js`. Declarar data antes de instanciar POs.
> API completa: [`wiki/patterns/factory-api.md`](../../../wiki/patterns/factory-api.md).

Caso especial AI Post: usar `AINoteDataFactory` — ver wiki para el contrato de `AIDataNote`.

### Patrón de override de campos de factory

Cuando el usuario pide que un campo específico NO use el valor del factory sino uno hardcodeado (o generado de otra forma), sobrescribir el campo directamente sobre el objeto retornado:

```typescript
const aiData = AINoteDataFactory.create();
// Sobrescribir solo el campo 'task' — el resto viene del factory
aiData.task = "Instrucción específica hardcodeada para este test";
```

Aplica a cualquier factory del framework. Los demás campos siguen siendo generados por el factory normalmente. Nunca construir el objeto entero a mano solo porque un campo necesita ser distinto.

### Convenciones para sessions de exploración / log empírico

Cuando la session NO hace asserts funcionales sino que captura información para revisión manual:

1. **Leer campos desde el POM, nunca desde APIs del browser:** Para obtener el título de la nota usar `editor.text.getTitle()`, nunca `driver.getTitle()` (que devuelve el título del tab, no el campo del CMS).

2. **Siempre guardar antes de que el driver cierre:** Si la session abre el editor de notas, debe ejecutar `await editor.closeNoteEditor('SAVE_AND_EXIT')` (o `PUBLISH_AND_EXIT`) antes de terminar. Si no se guarda, la nota no persiste y el test no sirve para nada.

3. **Orden correcto para sessions empíricas con editor:**
   ```typescript
   // 1. Leer datos que necesito ANTES de salir del editor
   const noteTitle = await editor.text.getTitle();
   const editorUrl = await driver.getCurrentUrl();
   // 2. Guardar (el driver cierra después de esto)
   await editor.closeNoteEditor('SAVE_AND_EXIT');
   // 3. Loguear lo capturado
   log.info(`📋 Título: ${noteTitle}`);
   log.info(`🔗 URL del editor: ${editorUrl}`);
   ```

---

## Wiki Sync *(obligatorio, silencioso — no aplica en modo debug)*

Después de generar el archivo `.test.ts`, ejecutás este paso internamente:

1. Abrir `wiki/sessions/catalog.md` y agregar la nueva session al catálogo con: nombre del archivo, descripción del flujo, módulo/sección del CMS y fecha. **Auto-aplica** (es una adición al catálogo, no modifica entradas existentes).
2. Si la session usa un flujo o patrón que **no está documentado** en la wiki (nueva navegación, nuevo tipo de dato, nuevo PO usado por primera vez): agregar `[gap] <tema>` a `wiki/log.md`. **Auto-aplica**.
3. Si la session documenta un **comportamiento del CMS desconocido** para el framework: reportarlo en la retrospectiva como ⚠️ NECESITA CONFIRMACIÓN para evaluar si va a una página wiki.

---

## Referencias

- **Maestros + imports:** [`references/maestros.md`](references/maestros.md)
- **Tipos de datos e interfaces:** [`wiki/interfaces/data-types.md`](../../../wiki/interfaces/data-types.md)
- **Factories API:** [`wiki/patterns/factory-api.md`](../../../wiki/patterns/factory-api.md)
- **Estructura canónica + ejemplo:** [`sessions/README.md`](../../../sessions/README.md) (sección "Convenciones de Escritura")
- **Catálogo de sessions existentes:** [`wiki/sessions/catalog.md`](../../../wiki/sessions/catalog.md)