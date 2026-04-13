---
name: create-session
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

**4.** Instanciar solo los POs que se usan. Firma base: `(driver, opts)`. Con tipo de nota: `(driver, 'POST', opts)`.

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

---

## Referencias

- **Maestros + imports:** [`references/maestros.md`](references/maestros.md)
- **Tipos de datos e interfaces:** [`wiki/interfaces/data-types.md`](../../../wiki/interfaces/data-types.md)
- **Factories API:** [`wiki/patterns/factory-api.md`](../../../wiki/patterns/factory-api.md)
- **Estructura canónica + ejemplo:** [`sessions/README.md`](../../../sessions/README.md) (sección "Convenciones de Escritura")
- **Catálogo de sessions existentes:** [`wiki/sessions/catalog.md`](../../../wiki/sessions/catalog.md)