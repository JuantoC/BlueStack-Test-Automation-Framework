# Convenciones del Repositorio POM — Referencia Obligatoria

Este archivo define todas las convenciones que el agente debe seguir al generar clases POM. Leelo completo antes de generar cualquier código.

---

## 1. Estructura de archivos

```
src/pages/
├── [feature]_page/
│   ├── Main[Feature]Page.ts       # Clase Maestro / Orquestador
│   ├── [SubComponente1].ts        # Subcomponente
│   ├── [SubComponente2].ts        # Subcomponente
│   └── [feature]_editor_page/     # Sub-sección editor (opcional)
│       ├── MainEditorPage.ts      # Maestro del editor
│       └── Editor[Section].ts     # Subcomponentes del editor
├── modals/                         # Componentes compartidos cross-page
│   ├── CKEditorImageModal.ts
│   ├── PublishModal.ts
│   └── Banners.ts
├── FooterActions.ts                # Compartido — acciones de footer
└── SidebarAndHeaderSection.ts      # Compartido — navegación
```

### Naming de archivos
- Clase Maestro: `Main[Feature]Page.ts` — PascalCase, prefijo `Main`, sufijo `Page`.
- Subcomponentes: `[NombreDescriptivo].ts` — PascalCase, sin prefijos ni sufijos forzados.
- Carpeta de feature: `[feature]_page/` — snake_case, sufijo `_page`.
- Carpeta de editor: `[feature]_editor_page/` — snake_case, sufijo `_editor_page`.

### Naming de clases
- Clase Maestro: `Main[Feature]Page` — coincide con el archivo.
- Subcomponentes: `[NombreDescriptivo]` — coincide con el archivo, sin sufijo `Section` salvo que represente una sección visual clara del editor.

---

## 2. Imports estándar

### Imports obligatorios para TODA clase POM

```typescript
import { WebDriver } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import logger from "../../core/utils/logger.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";
```

### Imports condicionales (usar según necesidad)

```typescript
// Si la clase define locators
import { By, Locator } from "selenium-webdriver";

// Si la clase maneja WebElements directamente
import { WebElement } from "selenium-webdriver";

// Si la clase es un Maestro con flujos orquestados
import { attachment, step } from "allure-js-commons";

// Si la clase tiene interacciones con elementos
import { clickSafe } from "../../core/actions/clickSafe.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { waitEnabled } from "../../core/actions/waitEnabled.js";
import { waitVisible } from "../../core/actions/waitVisible.js";

// Si la clase necesita escribir en inputs
import { writeSafe } from "../../core/actions/writeSafe.js";

// Si la clase maneja datos estructurados
import { [InterfaceName] } from "../../interfaces/data.js";
```

**Nota sobre rutas relativas:** Ajustar `../../` según la profundidad del archivo en el árbol de carpetas. Un archivo en `src/pages/videos_page/` usa `../../core/...`. Un archivo en `src/pages/videos_page/video_editor_page/` usa `../../../core/...`.

---

## 3. Estructura de una clase subcomponente

```typescript
import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import logger from "../../core/utils/logger.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { waitEnabled } from "../../core/actions/waitEnabled.js";
import { waitVisible } from "../../core/actions/waitVisible.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

/**
 * [JSDoc: Qué sección de la UI representa este subcomponente.
 *  Qué responsabilidad tiene. Quién lo consume.]
 */
export class NombreSubComponente {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  // ── Locators ──────────────────────────────────────────
  private static readonly ELEMENT_NAME: Locator = By.css('[data-testid="TODO_element_name"]');

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "NombreSubComponente");
  }

  /**
   * [JSDoc del método público]
   */
  async metodoPublico(): Promise<void> {
    try {
      logger.debug('Descripción de la acción...', { label: this.config.label });
      // Lógica de interacción
      logger.info('Acción completada', { label: this.config.label });
    } catch (error: unknown) {
      logger.error(`Error en [acción]: ${getErrorMessage(error)}`, {
        label: this.config.label,
        error: getErrorMessage(error)
      });
      throw error;
    }
  }
}
```

---

## 4. Estructura de una clase Maestro (Orquestador)

```typescript
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { WebDriver, WebElement } from "selenium-webdriver";
import { SubComponente1 } from "./SubComponente1.js";
import { SubComponente2 } from "./SubComponente2.js";
import { FooterActions } from "../FooterActions.js";
import { Banners } from "../modals/Banners.js";
import { attachment, step } from "allure-js-commons";
import logger from "../../core/utils/logger.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

/**
 * Page Object Maestro para la sección de [Feature] del CMS.
 * Actúa como Orquestador central que coordina las sub-secciones.
 * Es el punto de entrada para cualquier flujo de pruebas que involucre [descripción].
 *
 * @example
 * const page = new Main[Feature]Page(driver, { timeoutMs: 10000 });
 * await page.[metodoOrquestador](data);
 */
export class MainFeaturePage {
  private driver: WebDriver;
  private config: RetryOptions;

  // ── Subcomponentes propios ────────────────────────────
  private readonly subComp1: SubComponente1;
  private readonly subComp2: SubComponente2;

  // ── Componentes compartidos ───────────────────────────
  private readonly footer: FooterActions;
  private readonly banner: Banners;

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "MainFeaturePage");

    this.subComp1 = new SubComponente1(this.driver, this.config);
    this.subComp2 = new SubComponente2(this.driver, this.config);
    this.footer = new FooterActions(this.driver, this.config);
    this.banner = new Banners(this.driver, this.config);
  }

  /**
   * [JSDoc: qué flujo completo orquesta este método]
   */
  async flujoOrquestado(data: DataInterface): Promise<any> {
    await step(`Descripción del flujo`, async (stepContext) => {
      attachment(`Data`, JSON.stringify(data, null, 2), "application/json");
      stepContext.parameter("Param", "value");
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug(`Iniciando flujo...`, { label: this.config.label });

        await this.subComp1.accion();
        await this.subComp2.accion();

        const isError = await this.banner.checkBanners(false);
        if (isError) return;

        logger.info(`Flujo completado`, { label: this.config.label });
      } catch (error: unknown) {
        logger.error(`Error en flujo: ${getErrorMessage(error)}`, {
          label: this.config.label,
          error: getErrorMessage(error)
        });
        throw error;
      }
    });
  }
}
```

---

## 5. Patrones de interacción con elementos

### Click en un botón o link
```typescript
await clickSafe(this.driver, NombreClase.LOCATOR, this.config);
```

### Esperar y encontrar un elemento
```typescript
const element = await waitFind(this.driver, NombreClase.LOCATOR, this.config);
```

### Esperar visibilidad + habilitado (combo para botones)
```typescript
const element = await waitFind(this.driver, NombreClase.LOCATOR, this.config);
await waitEnabled(this.driver, element, this.config);
await waitVisible(this.driver, element, this.config);
```

### Escribir en un input
```typescript
await writeSafe(this.driver, NombreClase.INPUT_LOCATOR, "texto", this.config);
```

### Polling / esperar condición custom
```typescript
await this.driver.wait(async () => {
  const elements = await this.driver.findElements(NombreClase.LOADING_INDICATOR);
  return elements.length === 0;
}, this.config.timeoutMs);
```

---

## 6. Definición de locators

### Formato estándar
```typescript
private static readonly NOMBRE_ELEMENTO: Locator = By.css('selector');
```

### Reglas
- Siempre `private static readonly`.
- Nombre en UPPER_SNAKE_CASE.
- Tipo explícito `: Locator`.
- Usar `By.css()` como default. Usar `By.xpath()` solo si CSS no puede expresar la selección.
- Agrupar locators al inicio de la clase, después de las propiedades de instancia.

### Prioridad de selectores (cuando el DOM está disponible)
1. `[data-testid="..."]` — máxima estabilidad
2. `[data-test="..."]` o `[data-qa="..."]`
3. `#id` — si el id es semántico y estable
4. `[name="..."]` — para inputs de formulario
5. `[aria-label="..."]` — para elementos accesibles
6. Selector CSS estructural — marcar como `// FRAGILE`

### Placeholder para locators desconocidos
```typescript
private static readonly SUBMIT_BTN: Locator = By.css('[data-testid="TODO_submit_btn"]');
```

---

## 7. Cobertura atómica de locators

**Regla:** cada `private static readonly LOCATOR: Locator` definido en un subcomponente debe tener al menos un método `public async` que lo use directamente.

Un locator está cubierto si su nombre aparece en al menos uno de estos contextos dentro de un método público (o en un helper privado invocado desde un método público):

```typescript
clickSafe(this.driver, Clase.LOCATOR, this.config)
waitFind(this.driver, Clase.LOCATOR, this.config)
waitVisible(this.driver, Clase.LOCATOR, this.config)
waitEnabled(this.driver, Clase.LOCATOR, this.config)
writeSafe(this.driver, Clase.LOCATOR, value, this.config)
this.driver.findElements(Clase.LOCATOR)
container.findElement(Clase.LOCATOR)
container.findElements(Clase.LOCATOR)
```

**Excepción — locator en mapa público:** si un locator privado aparece como valor en un `public static readonly` mapa/objeto (ej: `LOCATORS`, `ACTION_MAP`), está cubierto por diseño — es accesible desde fuera de la clase a través del mapa.

**Regla de naming para métodos atómicos** (aplicar cuando el método no está ya descrito por el usuario):

| Sufijo del locator | Método generado |
|---|---|
| `*_BTN`, `*_LINK`, `*_ICON`, `*_TOGGLE` | `async click<Name>(): Promise<void>` |
| `*_INPUT`, `*_TEXTAREA`, `*_FIELD` | `async fill<Name>(value: string): Promise<void>` |
| `*_CONTAINER`, `*_TABLE`, `*_SECTION`, `*_MODAL` | `async get<Name>(): Promise<WebElement>` |
| `*_OPT`, `*_ITEM`, `*_OPTION` | `async get<Name>s(): Promise<WebElement[]>` |
| `*_ITEMS`, `*_LIST`, `*_OPTIONS` (plural) | `async get<Name>(): Promise<WebElement[]>` |
| `*_LABEL`, `*_TEXT`, `*_TITLE`, `*_BADGE` | `async get<Name>Text(): Promise<string>` |
| No encaja en ninguna categoría | `async get<Name>(): Promise<WebElement>` (fallback) |

**Aplicación al generar:** al definir cada locator, generar inmediatamente su método atómico correspondiente. No dejar locators sin método público.

---

## 8. Types y enumerados

Cuando una clase tiene un conjunto finito de opciones (tipos de acción, tipos de contenido, opciones de menú), definir un type literal:

```typescript
export type ActionType = 'EDIT' | 'DELETE' | 'UNPUBLISH';
```

### Ubicación
- Si el type lo usa solo un subcomponente → definirlo y exportarlo en ese archivo.
- Si el type lo usan múltiples archivos de la misma feature → crear `types.ts` en la carpeta.
- Si el type lo usan múltiples features → evaluar ubicación en `interfaces/` (preguntar al usuario).

---

## 8. Error handling

Todos los métodos públicos deben seguir este patrón:

```typescript
async metodo(): Promise<ReturnType> {
  try {
    logger.debug('Mensaje pre-ejecución', { label: this.config.label });
    // ... lógica ...
    logger.debug('Acción completada', { label: this.config.label });
  } catch (error: unknown) {
    logger.error(`Mensaje de error: ${getErrorMessage(error)}`, {
      label: this.config.label,
      error: getErrorMessage(error)
    });
    throw error;
  }
}
```

### Reglas
- El tipo del catch es siempre `: unknown`.
- Siempre usar `getErrorMessage(error)` para el mensaje — nunca castear a `Error` directamente.
- `logger.debug` para acciones intermedias o pre-ejecución.
- `logger.info` para confirmación de acciones exitosas.
- `logger.error` dentro del catch, siempre con `label` y `error` en el objeto de metadata.
- Siempre `throw error` al final del catch para propagar.

---

## 9. Configuración y RetryOptions

### Constructor pattern
```typescript
constructor(driver: WebDriver, opts: RetryOptions) {
  this.driver = driver;
  this.config = resolveRetryConfig(opts, "NombreClase");
}
```

### Override de timeout en el constructor (caso especial)
Cuando un componente necesita un timeout diferente al heredado:
```typescript
this.config = resolveRetryConfig({ ...opts, timeoutMs: 10000 }, "NombreClase");
```

---

## 10. JSDoc

### Clase
```typescript
/**
 * [Línea 1: qué sección de la UI modela y qué patrón es (subcomponente/modal/maestro)]
 * [Línea 2: responsabilidad específica y comportamiento clave]
 * [Línea 3: quién lo consume — "Consumido internamente por X; no invocar desde tests" o "Punto de entrada para tests de [feature]"]
 */
```

### Método público (subcomponente)
```typescript
/**
 * [Qué hace el método en una oración.]
 * [Detalle de comportamiento si es relevante.]
 *
 * @param nombre - Descripción del parámetro.
 * @returns {Promise<Tipo>} Descripción de lo que retorna.
 */
```

### Método público (maestro/orquestador)
```typescript
/**
 * Orquesta [qué flujo].
 * [Secuencia de pasos: primero X, luego Y, verifica Z.]
 * [Condiciones especiales si las hay.]
 *
 * @param data - Datos completos del [recurso], incluyendo [campos clave].
 */
```

---

## 11. Accesibilidad de propiedades de subcomponentes

- Por default, los subcomponentes instanciados en el Maestro son `private readonly`.
- Si un test necesita acceso directo a un subcomponente (ej: para obtener WebElements), puede ser `public readonly`.
- Indicar en el JSDoc del Maestro cuáles subcomponentes son públicos y por qué.

Ejemplo del repositorio: `public readonly table: VideoTable` es público porque los tests acceden a `page.table.getVideoContainerByTitle()`.

---

## 12. Utilidades core/ disponibles

| Módulo | Función | Uso |
|---|---|---|
| `core/actions/clickSafe` | `clickSafe(driver, locator/element, config)` | Click con retry y manejo de intercepted clicks |
| `core/actions/waitFind` | `waitFind(driver, locator, config)` | Espera + findElement con retry |
| `core/actions/waitEnabled` | `waitEnabled(driver, element, config)` | Espera hasta que el elemento esté enabled |
| `core/actions/waitVisible` | `waitVisible(driver, element, config)` | Espera hasta que el elemento sea visible |
| `core/actions/clearAndType` | `clearAndType(driver, locator, text, config)` | Limpia input y escribe texto |
| `core/config/defaultConfig` | `resolveRetryConfig(opts, label)` | Resuelve config con defaults + label |
| `core/utils/logger` | `logger.debug/info/warn/error(msg, meta)` | Logger con label y metadata |
| `core/utils/errorUtils` | `getErrorMessage(error)` | Extrae mensaje de error de unknown |

Si el agente necesita una utilidad que no existe en esta tabla, debe marcar el código con `// TODO: requiere nueva utilidad core/[nombre]` y no intentar implementarla.

---

## 13. Modo Extensión — Formatos de Output

### Bloque de inserción (para adiciones en archivos existentes)

Nunca reproducir el archivo completo. Usar este formato por zona de inserción:

```typescript
// ═══════════════════════════════════════════════════════════
// AGREGAR EN [NombreArchivo].ts
// Ubicación: [descripción exacta — "después del último `private static readonly`", "al final de la clase antes de `}`", etc.]
// ═══════════════════════════════════════════════════════════
[código nuevo aquí]
```

Reglas:
- Un bloque por zona de inserción contigua (varios locators juntos = un solo bloque).
- Indicar ubicación con precisión en cada encabezado de bloque.
- Nunca reproducir código existente dentro del bloque.
- El código del bloque debe compilar con los imports que el archivo ya tiene.
- Si la adición requiere un import nuevo, indicarlo en un bloque separado al inicio:

```typescript
// ═══════════════════════════════════════════════════════════
// AGREGAR EN [NombreArchivo].ts — imports nuevos requeridos
// ═══════════════════════════════════════════════════════════
import { nuevaUtilidad } from "../../core/actions/nuevaUtilidad.js";
```

### Tabla de Gap Analysis (Paso 1E)

| Elemento de UI | ¿Locator existe? | ¿Método existe? | Acción |
|---|---|---|---|
| [nombre] | Sí (`NOMBRE_LOCATOR`) | Sí (`metodo()`) | — (no tocar) |
| [nombre] | No | No | Locator + método |
| [nombre] | No (TODO placeholder) | Parcial | Reemplazar TODO por selector real |
| [nombre] | No | — (solo lectura/display) | Solo locator |
| [nombre] | — | No (flujo orquestado) | Método en Maestro |
