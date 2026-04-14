# Auditoría: Monitoreo Centralizado de Toast Notifications

**Fecha:** 2026-03-31  
**Autor:** Claude Code (auditoría arquitectónica)  
**Estado:** Análisis completado — pendiente de implementación

---

## Contexto del problema

### Qué se hace hoy

La clase `Banners` (`src/pages/modals/Banners.ts`) es un sub-componente transversal que monitorea y gestiona los toast notifications (Success, Error, Warning) del CMS. Para usarla, **cada Maestro o Modal que necesite monitoreo de toasts debe**:

1. Importar `Banners` con extensión `.js`
2. Declarar una propiedad privada `private readonly banner: Banners`
3. Instanciarla en el constructor: `this.banner = new Banners(this.driver, this.config)`
4. Llamar manualmente a `await this.banner.checkBanners(true|false)` después de cada acción relevante

### Por qué es un problema

Este patrón genera **acoplamiento repetido y disperso** en 6 puntos del proyecto (excluyendo el propio `Banners.ts`):

- La misma secuencia import → property → constructor init se repite sin variación en `MainVideoPage`, `MainImagePage`, `UploadVideoModal`, `UploadImageModal` y `FooterActions`
- Cada nuevo Maestro o Modal que cubra una nueva sección del CMS debe recordar replicar exactamente este boilerplate
- No existe ningún mecanismo que garantice que un nuevo Maestro incluya el monitoreo de toasts — la omisión es silenciosa y solo se detecta en ejecución
- El costo de mantenimiento escala linealmente con la cantidad de clases de página

---

## Hallazgos del análisis

### Mapa de invocaciones actuales

| Archivo | Líneas (aprox.) | Patrón | `expectSuccess` usado | Contexto |
|---------|----------------|--------|----------------------|----------|
| `src/core/actions/clickSafe.ts` | 8, 52–56 | Instancia local (on-demand) | `false` | Handler de `ElementClickInterceptedError` |
| `src/pages/videos_page/MainVideoPage.ts` | 13, 36, 48, 75, 118, 151 | Composición (property) | `false` y `true` | Upload monitoring + title change validation |
| `src/pages/images_pages/MainImagePage.ts` | 11, 33, 44, 72, 116, 150 | Composición (property) | `false` y `true` | Idéntico a MainVideoPage |
| `src/pages/videos_page/UploadVideoModal.ts` | 18, 41, 60, 175 | Composición (property) | `true` | Progress bar 100% → éxito obligatorio |
| `src/pages/images_pages/UploadImageModal.ts` | 17, 50, 69, 184 | Composición (property) | `true` | Idéntico a UploadVideoModal |
| `src/pages/FooterActions.ts` | 8, 27, 45, 76, 81 | Composición (property, timeout custom 10s) | `true` | Publish y Schedule obligan éxito |

**Instancias de `new Banners(...)` en el codebase:** 5 (Maestros + Modals + FooterActions) + 1 local en clickSafe

### Patrón arquitectónico identificado

El proyecto sigue un **POM de dos capas con Facade y composición**:

```
Session Test (sessions/*.test.ts)
  └─ [runSession()] TestWrapper lifecycle
        └─ Maestro Page Object (Main<Feature>Page)
              ├─ Sub-componentes enfocados (Tables, Buttons, Modals)
              ├─ Utilities transversales (FooterActions, CKEditorImageModal)
              └─ Banners (transversal toast monitor)  ← repetido en cada Maestro
```

**Características clave:**
- **Composición sobre herencia** — todos los Maestros componen sub-componentes en lugar de heredar
- El único precedente de herencia es `BaseListicleSection` (abstract) en el dominio de listicle editing
- No existe clase base para Maestros
- `runSession()` en `testWrapper.ts` es el único punto de entrada centralizado, pero no tiene acceso a Page Objects (solo al driver crudo)
- Jest no tiene `globalSetup`/`setupFiles` con acceso al driver de sesión

---

## Alternativas evaluadas

### Alternativa A — Clase base para Maestros (`BaseMaestroPage`)

**Descripción técnica:**  
Crear una clase abstracta `BaseMaestroPage` en `src/pages/` con `protected readonly banner: Banners` inicializado en el constructor. Los Maestros (`MainVideoPage`, `MainImagePage`, y futuros) extienden esta clase.

```typescript
// src/pages/BaseMaestroPage.ts
export abstract class BaseMaestroPage {
  protected readonly banner: Banners;

  constructor(protected driver: WebDriver, protected config: RetryOptions) {
    this.banner = new Banners(driver, config);
  }
}

// src/pages/videos_page/MainVideoPage.ts
export class MainVideoPage extends BaseMaestroPage {
  constructor(driver: WebDriver, opts: RetryOptions) {
    super(driver, resolveRetryConfig(opts, "MainVideoPage"));
    // ...resto de composición
  }
}
```

**Compatibilidad:** Alta. Sigue el único precedente de herencia del proyecto (`BaseListicleSection`). El constructor `(driver, opts)` es idéntico en todos los Maestros actuales.

**Ventajas:**
- Elimina 3 líneas de boilerplate (import, property, init) en cada Maestro actual y futuro
- Los Maestros siguen llamando `this.banner.checkBanners()` explícitamente — sin magia
- Garantiza estructuralmente que todo Maestro hereda el monitoreo
- Patrón reconocible; ningún cambio en la API pública de los Maestros

**Desventajas:**
- Introduce herencia donde solo existía composición en la capa de Maestros
- No cubre Modals (`UploadVideoModal`, `UploadImageModal`) ni `FooterActions` — estos seguirían usando composición explícita
- Requiere refactorizar todos los Maestros existentes (bajo impacto por clase, moderado en total)

**Intrusividad:** Baja-Media. Cambios mínimos por archivo (3–4 líneas eliminadas + `extends BaseMaestroPage`), pero toca todos los Maestros.

---

### Alternativa B — Hook global de Jest (`beforeEach` / `afterEach`)

**Descripción técnica:**  
Agregar `setupFilesAfterEach` o `globalSetup` en `jest.config.cjs` para inyectar lógica de monitoreo antes o después de cada test.

**Compatibilidad:** Muy baja. Razón técnica concreta: el WebDriver se inicializa **dentro** de `runSession()` (en `testWrapper.ts`), no en el ciclo de Jest. Los hooks de Jest no tienen acceso a la instancia de driver activa. Para que un `afterEach` llame a `checkBanners()` necesitaría la instancia del driver, lo que requeriría hacerlo accesible globalmente (antipatrón).

**Ventajas:** Centralización máxima sin cambiar Page Objects.

**Desventajas:**
- Técnicamente inviable sin reestructurar el ciclo de vida del driver
- Requeriría hacer el driver accesible via estado global, rompiendo el encapsulamiento actual de `runSession()`
- No aplicable a la arquitectura actual

**Intrusividad:** Muy alta (requeriría cambiar `testWrapper.ts` y `driverManager.ts`). **No recomendada.**

---

### Alternativa C — Observer/MutationObserver DOM inyectado via CDP

**Descripción técnica:**  
Usar Chrome DevTools Protocol (CDP, ya disponible via `session.networkMonitor`) para inyectar un `MutationObserver` JavaScript en la página que detecte cambios en `#toast-container` y los reporte via un canal asíncrono (p.ej. logs de consola o un endpoint local).

```javascript
// Script inyectado en el browser
const observer = new MutationObserver((mutations) => {
  mutations.forEach(m => {
    if (m.target.id === 'toast-container') {
      console.log('TOAST_EVENT:' + JSON.stringify({ type: ... }));
    }
  });
});
observer.observe(document.querySelector('#toast-container'), { childList: true, subtree: true });
```

El `checkConsoleErrors()` existente o un nuevo handler en `driverManager.ts` consumiría estos eventos.

**Compatibilidad:** Media. CDP ya está integrado en el proyecto. Pero el canal de comunicación browser→test es asíncrono y no está sincronizado con el flujo de steps Allure.

**Ventajas:**
- Monitoreo verdaderamente automático sin llamadas explícitas
- Un único punto de activación por sesión (en `initializeDriver`)
- No modifica ningún Page Object

**Desventajas:**
- Desincronización entre eventos DOM y steps Allure — los toasts pueden procesarse fuera del step en el que ocurrieron
- Complejidad de implementación significativa: parsing de logs de consola, sincronización de estado
- No permite `expectSuccess: true` (modo de validación obligatoria) sin mecanismos de señalización adicionales
- Fragilidad ante cambios de CDP entre versiones de Chrome

**Intrusividad:** Alta en `driverManager.ts` y `testWrapper.ts`. **No recomendada para el estilo del proyecto.**

---

### Alternativa D — Mixin TypeScript o decorador de método

**Descripción técnica:**  
Implementar un mixin `BannersAware` que agregue la propiedad `banner` automáticamente, o un decorador `@checkBannersAfter` que envuelva métodos de Maestro para llamar `checkBanners()` post-ejecución.

```typescript
// Decorador hipotético
@checkBannersAfter({ expectSuccess: true })
async changeVideoTitle(titleID: string) { ... }
```

**Compatibilidad:** Baja. Los decoradores de método en TypeScript son experimentales (requieren `"experimentalDecorators": true` en `tsconfig.json`). Los mixins agregan complejidad de tipo que puede interferir con la inferencia actual.

**Ventajas:**
- Declarativo — intención visible en la firma del método
- Elimina llamadas explícitas internas

**Desventajas:**
- Requiere activar feature experimental de TypeScript
- La semántica `expectSuccess: true|false` debe resolverse en el decorador, no en el método — reduce la claridad contextual
- Magia implícita: dificulta el debugging cuando el banner check falla
- No hay precedente de este patrón en el proyecto

**Intrusividad:** Alta (cambios en tsconfig + decoradores en todos los métodos relevantes). **No recomendada.**

---

### Alternativa E — Extender `clickSafe` y `writeSafe` para monitoreo automático

**Descripción técnica:**  
Integrar un `checkBanners(false)` automático al final de `clickSafe()` y `writeSafe()` (acciones core), eliminando la necesidad de llamadas explícitas en modo monitoreo en los Maestros. Los Maestros solo llamarían `checkBanners(true)` cuando necesitan validación obligatoria.

**Nota:** `clickSafe.ts` ya tiene lógica parcial de Banners para manejar `ElementClickInterceptedError`. Esta alternativa la extendería a ejecución normal.

**Compatibilidad:** Media-Baja. Añadiría 800ms por defecto a cada llamada de `clickSafe`/`writeSafe` incluso cuando no hay toasts, degradando la performance global de las sesiones.

**Ventajas:**
- Reduce llamadas explícitas `checkBanners(false)` en Maestros
- Un solo punto de cambio (acciones core)

**Desventajas:**
- Agrega latencia a **cada** acción de click, incluso las que nunca generan toasts
- Mezcla responsabilidades: las acciones core pasarían a conocer lógica de UI de toasts
- No resuelve `checkBanners(true)` (validación obligatoria) — los Maestros seguirían necesitando `this.banner`
- Rompe el principio de que `clickSafe` es una acción de interacción, no un validador de negocio

**Intrusividad:** Media en core actions, pero alto impacto en performance. **No recomendada como solución principal.**

---

## Solución recomendada

### Alternativa A: Clase base `BaseMaestroPage`

**Justificación técnica anclada en el análisis:**

1. **Precedente arquitectónico existente:** El proyecto ya usa herencia con `BaseListicleSection` para compartir estado y comportamiento común entre subclases enfocadas. `BaseMaestroPage` sigue exactamente el mismo patrón, solo aplicado a la capa de Maestros.

2. **Constructor idéntico en todos los Maestros:** `MainVideoPage`, `MainImagePage` y los Maestros futuros comparten la firma `(driver: WebDriver, opts: RetryOptions)`. La base puede absorber este constructor sin cambiar ningún contrato público.

3. **La decisión `expectSuccess` sigue siendo explícita:** La base solo centraliza la instanciación; los Maestros siguen llamando `this.banner.checkBanners(true|false)` con intención visible. No hay magia oculta.

4. **Scope correcto del problema:** El problema de boilerplate repetido afecta principalmente a los Maestros (la capa de orquestación). `FooterActions`, `UploadVideoModal` y `UploadImageModal` son casos especiales (shared utility y sub-modals) que tienen razones válidas para componer Banners directamente — especialmente `FooterActions` con su timeout custom de 10s.

5. **Menor riesgo de las alternativas viables:** B y C requieren reestructurar el ciclo de vida del driver o introducir asincronía DOM compleja. D requiere experimentalDecorators. E degrada performance global. A solo agrega una clase abstracta con un constructor.

**Alcance de la implementación:**
- Crear `src/pages/BaseMaestroPage.ts`
- Modificar los Maestros existentes para extenderla (actualmente: `MainVideoPage`, `MainImagePage`)
- No tocar `FooterActions`, `UploadVideoModal`, `UploadImageModal` ni `clickSafe.ts`
- Documentar en `src/pages/README.md` el nuevo contrato de la capa Maestros

---

## Prompt ejecutable de implementación

```
## Rol
Eres un ingeniero de automatización senior que implementa un refactor de bajo riesgo
en el framework BlueStack Test Automation. Tu tarea es crear una clase base para los
Maestros de la capa `src/pages/` que centralice la composición de `Banners`.

---

## Contexto ya auditado (no necesitas re-auditar)

### Arquitectura del proyecto
- Framework: TypeScript + Selenium WebDriver + Jest + Allure
- Patrón: POM de dos capas — Maestros (orquestadores) + Sub-componentes (enfocados)
- Composición sobre herencia, con un único precedente de herencia: `BaseListicleSection`
- Driver se inicializa en `runSession()` (testWrapper.ts), no en Jest hooks — no hay globalSetup

### El problema que resuelve este refactor
Los Maestros repiten 3 líneas idénticas de boilerplate para Banners:
1. `import { Banners } from "../modals/Banners.js"`
2. `private readonly banner: Banners`
3. `this.banner = new Banners(this.driver, this.config)` en el constructor

### Maestros actuales que deben refactorizarse
- `src/pages/videos_page/MainVideoPage.ts`
- `src/pages/images_pages/MainImagePage.ts`

### Archivos que NO se tocan en este refactor
- `src/pages/FooterActions.ts` — usa timeout custom de 10s; mantiene su propia composición
- `src/pages/videos_page/UploadVideoModal.ts` — es sub-componente modal, no Maestro
- `src/pages/images_pages/UploadImageModal.ts` — ídem
- `src/core/actions/clickSafe.ts` — instanciación local para error handling; no es Maestro

---

## Instrucciones paso a paso

### Paso 1: Leer los archivos fuente antes de modificar

Leer en su totalidad:
- `src/pages/modals/Banners.ts` — para entender el constructor y firma
- `src/pages/videos_page/MainVideoPage.ts` — Maestro de referencia
- `src/pages/images_pages/MainImagePage.ts` — segundo Maestro
- `src/core/config/defaultConfig.ts` — para verificar la firma de `RetryOptions` y `resolveRetryConfig`
- `src/pages/README.md` — para entender las convenciones de la capa

### Paso 2: Crear `src/pages/BaseMaestroPage.ts`

Requisitos:
- Clase abstracta exportada: `export abstract class BaseMaestroPage`
- Constructor: `(driver: WebDriver, config: RetryOptions)` — recibe `config` ya resuelto (no `opts` raw)
- Propiedad: `protected readonly banner: Banners` — inicializada con `new Banners(driver, config)`
- Driver: `protected readonly driver: WebDriver`
- Config: `protected readonly config: RetryOptions`
- JSDoc inline que documente propósito, contrato y ejemplo de extensión
- Imports: `WebDriver` de selenium-webdriver, `RetryOptions` de config, `Banners` de modals

### Paso 3: Refactorizar `MainVideoPage.ts`

Cambios:
- Agregar `extends BaseMaestroPage` a la declaración de clase
- Eliminar import de `Banners`
- Eliminar la declaración `private readonly banner: Banners`
- Reemplazar en constructor: eliminar `this.banner = new Banners(...)` y agregar llamada a `super(driver, this.config)` DESPUÉS de inicializar `this.config` con `resolveRetryConfig`
- Verificar que todas las llamadas a `this.banner.checkBanners(...)` siguen funcionando sin cambios
- No modificar ningún método público ni su lógica

### Paso 4: Refactorizar `MainImagePage.ts`

Mismos cambios que Paso 3, aplicados a `MainImagePage`.

### Paso 5: Actualizar `src/pages/README.md`

Agregar una sección que documente:
- La existencia de `BaseMaestroPage` como clase base para Maestros
- Que todo nuevo Maestro debe extender `BaseMaestroPage` en lugar de componer `Banners` directamente
- Que `this.banner.checkBanners(true|false)` sigue siendo la API pública para los Maestros

### Paso 6: Verificación post-implementación

Ejecutar:
1. `npx tsc --noEmit` — verificar que no hay errores de tipo
2. Buscar con grep cualquier archivo en `src/pages/` (excepto los excluidos) que aún importe `Banners` directamente — deben ser solo los excluidos
3. Verificar que `BaseMaestroPage.ts` exporta correctamente con extensión `.js` en los imports internos
4. Confirmar que `MainVideoPage` y `MainImagePage` no declaran `banner` como propiedad propia

---

## Criterios de validación post-implementación

- [ ] `npx tsc --noEmit` sin errores
- [ ] `MainVideoPage` y `MainImagePage` ya no importan `Banners` directamente
- [ ] `MainVideoPage` y `MainImagePage` tienen `extends BaseMaestroPage`
- [ ] `BaseMaestroPage` tiene JSDoc que explica su propósito y uso
- [ ] `src/pages/README.md` documenta el contrato de la clase base
- [ ] Los archivos excluidos (`FooterActions`, `UploadVideoModal`, `UploadImageModal`, `clickSafe.ts`) no fueron modificados
- [ ] Todas las llamadas existentes a `this.banner.checkBanners()` en los Maestros siguen siendo accesibles (propiedad heredada `protected`)

---

## Archivos a crear
- `src/pages/BaseMaestroPage.ts` (nuevo)

## Archivos a modificar
- `src/pages/videos_page/MainVideoPage.ts`
- `src/pages/images_pages/MainImagePage.ts`
- `src/pages/README.md`
```

---

## Dudas y puntos de decisión abiertos

### 1. ¿La propiedad `banner` debe ser `protected` o `private`?

**Contexto:** Si es `protected`, sub-subclases de los Maestros podrían acceder directamente a `this.banner`. Si es `private`, los Maestros solo heredan el comportamiento pero no pueden exponerlo. Actualmente, ningún Maestro tiene subclases.

**Decisión requerida del equipo:** ¿Se anticipa que habrá sub-clases de Maestros en el futuro? Si no, `private` es más seguro. Si puede haber herencia adicional, `protected` es correcto.

**Recomendación tentativa:** `protected` — mantiene la puerta abierta sin romper encapsulamiento público.

---

### 2. ¿`FooterActions` debería también heredar de `BaseMaestroPage`?

**Contexto:** `FooterActions` es un sub-componente compartido (no un Maestro), pero compone `Banners` con un timeout custom (`{ ...this.config, timeoutMs: 10000 }`). Si heredara de `BaseMaestroPage`, perdería esa flexibilidad a menos que se agregue un argumento adicional al constructor base.

**Decisión requerida:** ¿`FooterActions` es arquitectónicamente un "Maestro" o un "shared utility"? Según el `src/pages/README.md` (si documenta la distinción), puede quedar excluido o incluirse con timeout configurable.

**Recomendación tentativa:** Excluirlo del alcance inicial. Su timeout custom justifica composición directa.

---

### 3. ¿Agregar un método `checkBanners()` delegador en `BaseMaestroPage`?

**Contexto:** En lugar de que los Maestros llamen `this.banner.checkBanners()`, podrían llamar directamente `this.checkBanners()` (método heredado que delega a `this.banner`). Reduciría la visibilidad de la instancia interna.

**Decisión requerida:** ¿Se prefiere encapsulamiento adicional (método delegador) o acceso directo a la instancia (`this.banner.checkBanners()`)? Ambas son válidas; es una decisión de estilo.

**Recomendación tentativa:** Mantener acceso directo `this.banner.checkBanners()` — es más explícito y no introduce otra capa de indirección.

---

### 4. ¿Cuándo extender `BaseMaestroPage` a otros Maestros no auditados?

**Contexto:** El análisis cubrió `MainVideoPage` y `MainImagePage`. Existen otros Maestros en el proyecto (p.ej. `MainPostPage`, `MainEditorPage`, etc.) que pueden o no usar `Banners`. No todos los Maestros necesitan la base si no componen Banners.

**Decisión requerida:** ¿La base es solo para Maestros con Banners, o debe ser la base de TODOS los Maestros (como convención arquitectónica) aunque no todos usen `banner` directamente?

**Recomendación tentativa:** Aplicar solo a los Maestros que actualmente usan `Banners`, y documentar que los nuevos Maestros que necesiten monitoreo de toasts deben extender la base. No forzar herencia en Maestros que no la necesitan.
