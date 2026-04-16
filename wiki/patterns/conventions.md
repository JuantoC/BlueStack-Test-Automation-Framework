---
source: src/pages/README.md · README.md
last-updated: 2026-04-16
---

# Patterns: Conventions

## Propósito

Reglas de arquitectura y convenciones de código del framework. Estas son las reglas que gobiernan TODA la capa `src/pages/` y que deben respetarse sin excepción.

---

## Arquitectura de dos capas

### Maestros (`Main*Page`)

- Componen sub-componentes en el constructor.
- Exponen workflows de alto nivel al test.
- **Sus métodos públicos SIEMPRE están envueltos en `step()`** de `allure-js-commons`.
- **No tienen locators propios** — los delegan a sub-componentes.
- Pasan su `config` a los sub-componentes para propagar el label de trazabilidad.

### Sub-componentes

- Poseen una región de UI específica.
- **Declaran sus locators como `private static readonly`.**
- **Nunca llaman a hermanos ni al Maestro.**
- **Nunca usan `step()`.**
- Reciben `config` del Maestro vía constructor.

---

## Patrón constructor — Maestro con `NoteType`

```typescript
constructor(driver: WebDriver, noteType: NoteType, opts: RetryOptions) {
  this.config = resolveRetryConfig(opts, "NombreClase");
  this.noteType = noteType;
  this.subComponent = new SubComponent(driver, this.config);
}
```

Aplica a: `MainPostPage` (y derivados que requieren tipo de nota).

## Patrón constructor — Maestro sin `NoteType`

```typescript
constructor(driver: WebDriver, opts: RetryOptions) {
  this.config = resolveRetryConfig(opts, "NombreClase");
  this.subComponent = new SubComponent(driver, this.config);
}
```

Aplica a: `MainVideoPage`, `MainImagePage`, `MainTagsPage`, etc.

## Patrón constructor — Sub-componente

```typescript
constructor(private driver: WebDriver, opts: RetryOptions = {}) {
  this.config = resolveRetryConfig(opts, "NombreSubComponente");
}
```

El parámetro `private driver` declara y asigna la propiedad en un solo paso (TypeScript parameter property). No se necesita `private driver: WebDriver;` en el cuerpo de la clase ni `this.driver = driver;` en el constructor.

El `opts = {}` permite instanciación sin argumentos (aunque en la práctica siempre recibe el config del Maestro).

---

## Patrón de método — Maestro (con `step`)

```typescript
async myMethod(param: string): Promise<void> {
  await step(`Descripción visible en Allure`, async (stepContext) => {
    stepContext.parameter("Param", param);
    try {
      await this.subComponent.atomicMethod(param, this.config);
    } catch (error: unknown) {
      logger.error(`Error en myMethod: ${getErrorMessage(error)}`, { label: this.config.label });
      throw error;
    }
  });
}
```

## Patrón de método — Sub-componente (sin `step`)

```typescript
async atomicMethod(param: string, opts: RetryOptions): Promise<void> {
  try {
    await clickSafe(this.driver, SubComponent.LOCATOR, opts);
  } catch (error: unknown) {
    logger.error(`Error en atomicMethod: ${getErrorMessage(error)}`, { label: opts.label });
    throw error;
  }
}
```

---

## Declaración de locators

```typescript
// Solo en sub-componentes. Nunca en Maestros.
private static readonly BOTON_GUARDAR: Locator = By.css("button.save-btn");
private static readonly INPUT_TITULO: Locator = By.css("input[data-testid='title']");
```

Naming en SCREAMING_SNAKE_CASE, siempre `private static readonly`.

---

## `NoteType` — definición canónica

```typescript
// src/pages/post_page/NewNoteBtn.ts

export type NoteType = keyof typeof NewNoteBtn.NOTE_TYPE_MAP;

static readonly NOTE_TYPE_MAP = {
  POST:     new Set(['New post', "Crear noticia", "Nova notícia"]),
  LISTICLE: new Set(['New listicle', "Crear nota lista", "Nova lista de notas"]),
  LIVEBLOG: new Set(['New liveblog', "Crear liveblog", "Nova liveblog"]),
  AI_POST:  new Set(['Create AI Post', 'Crear noticia IA', 'Crie notícias sobre IA'])
} as const;
// NoteType = 'POST' | 'LISTICLE' | 'LIVEBLOG' | 'AI_POST'
```

---

## Import obligatorio con `.js`

```typescript
// ✅ Correcto — extensión .js siempre
import { clickSafe } from "../../core/actions/clickSafe.js";
import { RetryOptions } from "../../interfaces/config.js";

// ❌ Incorrecto — sin extensión (rompe ESM)
import { clickSafe } from "../../core/actions/clickSafe";
```

---

## Manejo de errores obligatorio

```typescript
// ✅ Patrón correcto en todos los catch
catch (error: unknown) {
  logger.error(`Error en nombreMetodo: ${getErrorMessage(error)}`, { label: this.config.label });
  throw error;
}

// ❌ Nunca silenciar
catch (error) {
  // nada → viola la regla de no silenciar errores
}
```

**Regla fundamental:** todo `catch` DEBE re-lanzar. Silenciar = atrapar sin relanzar.

### Retry Boundary — distinción de tiers

El comportamiento del `catch` depende de si está dentro o fuera del boundary de `retry()`:

| Contexto | `logger.error()` | `logger.debug()` | Rethrow |
|----------|-----------------|-----------------|---------|
| Dentro del lambda de `retry()` | **Prohibido** — dispara en cada intento | Permitido (diagnóstico) | **Obligatorio** |
| Boundary externo (envuelve `retry()`) o método sin retry | **Obligatorio** | Opcional | **Obligatorio** |

Ver [`wiki/core/logging.md`](../core/logging.md) — sección "Concepto: Retry Boundary" para el detalle completo, reglas numeradas y anti-patrones.

---

## Reglas de `step()`

- Solo en métodos públicos de Maestros.
- Usar `stepContext.parameter("Nombre", valor)` para parámetros relevantes en el reporte Allure.
- Los sub-componentes NO usan `step()` — hacerlo rompe la jerarquía de reporte.

---

## Convenciones de naming

| Artefacto | Convención | Ejemplo |
|-----------|-----------|---------|
| Maestros | `Main<Módulo>Page` | `MainPostPage`, `MainVideoPage` |
| Sub-componentes | `<Concepto><Tipo>` | `EditorHeaderActions`, `PostTable`, `NewNoteBtn` |
| Locators | `SCREAMING_SNAKE_CASE` | `SUBMIT_BTN`, `TITULO_INPUT` |
| Tipos derivados de maps | `keyof typeof Clase.MAP` | `NoteType`, `SidebarOption`, `FooterActionType` |
| Archivos | PascalCase | `MainPostPage.ts`, `EditorHeaderActions.ts` |
| Tests | `PascalCase.test.ts` (sin segmento de categoría) | `NewPost.test.ts`, `FailedLogin.test.ts` |

---

---

## Patrones de interacción — componentes Angular Material

Estos patrones se descubrieron en NAA-4324 y aplican a cualquier test que toque los componentes indicados.

### Patrón A — `mat-slide-toggle` (Autoplay / Mute)

El componente `<mat-slide-toggle>` de Angular Material es compuesto: el elemento raíz no es interactuable directamente. El click debe apuntar al `button[role="switch"]` interno.

```typescript
// ❌ No clickear el <mat-slide-toggle> ni su data-testid raíz directamente
By.css('[data-testid="check-autoplay"]')

// ✅ Clickear el button interno dentro del componente
By.css('[data-testid="check-autoplay"] button[role="switch"]')
```

Aplica a: `EditorInfoSection.AUTOPLAY_TOGGLE`, `EditorInfoSection.MUTE_TOGGLE` (video editor).

---

### Patrón B — `mat-select` (Rating / clasificación)

El click en un `<mat-select>` abre un overlay global del framework Angular Material. Las opciones (`mat-option`) se renderizan en el `body` del documento, **fuera** del shadow del componente padre.

```typescript
// Abrir: selector del componente es suficiente
By.css('[data-testid="dropdown-classification"]')  // abre el overlay

// Seleccionar opción: buscar a nivel documento, no dentro del componente
By.css('mat-option')  // opciones al nivel document — filtrar por texto si hay múltiples
```

Aplica a: `EditorInfoSection.RATING_DROPDOWN` (video editor). Cualquier `mat-select` del CMS sigue este patrón.

---

### Patrón C — timepicker de Angular Bootstrap

El `data-testid` está en el componente `<timepicker>` raíz, no en sus inputs internos. Para acceder a los campos HH y MM se usa un selector compuesto.

```typescript
// ✅ Selector compuesto: testid del componente + atributo placeholder del input interno
By.css('[data-testid="timepicker-create-hour"] input[placeholder="HH"]')
By.css('[data-testid="timepicker-create-hour"] input[placeholder="MM"]')

// ❌ No hay data-testid en los inputs individuales — no intentar asignarlos
```

Aplica a: `EditorInfoSection.TIMEPICKER_HOURS` / `TIMEPICKER_MINUTES` (video editor).

---

### Patrón D — `app-cmsmedios-button` (modales con botón de confirmación)

El componente Angular `<app-cmsmedios-button>` actúa como wrapper. Su `data-testid` se declara en el componente raíz, pero el `<button>` interno **siempre** renderiza con `data-testid="btn-calendar-confirm"` independientemente del contexto. El selector debe combinar ambos niveles.

```typescript
// ❌ No apuntar solo al wrapper — no es interactuable
By.css('[data-testid="btn-confirm-generic-saveexit-text"]')

// ❌ No apuntar solo al button interno — puede haber múltiples en el DOM
By.css('button[data-testid="btn-calendar-confirm"]')

// ✅ Selector compuesto: wrapper con su testid + button interno
By.css('[data-testid="btn-confirm-generic-saveexit-text"] button[data-testid="btn-calendar-confirm"]')
By.css('[data-testid="btn-cancel-newnote-get-out-anyway-text"] button[data-testid="btn-calendar-confirm"]')
```

Aplica a: `EditorHeaderActions.MODAL_BACK_SAVE_AND_EXIT_BTN` y `MODAL_BACK_DISCARD_EXIT_BTN` (note editor).
Cualquier modal que use `app-cmsmedios-button` sigue este patrón — el `data-testid` diferenciador está en el wrapper, no en el button.

---

## `driver.sleep()` — uso restringido

`driver.sleep()` está prohibido sin justificación explícita. Enmasca inestabilidad real y hace el test frágil ante cambios de rendimiento del ambiente.

**Regla:** si usás `driver.sleep()`, debés agregar un comentario que explique por qué ninguna espera explícita (como `waitVisible`, `waitEnabled` u otras core actions) puede resolver el caso.

```typescript
// ❌ Nunca sin comentario
await driver.sleep(1000);

// ✅ Solo si se justifica la excepción
// driver.sleep: el elemento aparece en el DOM antes de estar interactuable
// y waitEnabled retorna true prematuramente. No hay condición observable alternativa.
await driver.sleep(500);
```

Alternativas siempre preferibles: `waitVisible`, `waitEnabled`, `waitFind`, `assertValueEquals` con retry.

---

## Modo Extensión — Gap Analysis

Formato de la tabla de brechas a presentar en el Paso 1E de `pom-generator`:

| Elemento UI | ¿Tiene locator? | ¿Tiene método? | Acción propuesta |
|---|---|---|---|
| [Nombre del elemento] | Sí / No | Sí / No / Parcial | Agregar locator · Agregar método · Nada |

Reglas de llenado:
- Una fila por elemento UI identificado en el input del usuario.
- "Parcial" en la columna método = el método existe pero no cubre el caso pedido.
- "Acción propuesta" solo puede ser: "Agregar locator", "Agregar método", "Agregar locator + método", o "Nada (ya cubierto)".
- NO incluir filas con Acción = "Nada" si la tabla resultaría muy larga — filtrarlas para mostrar solo gaps reales.

---

## Modo Extensión — Formatos de Output

Para **archivos existentes**, la salida siempre se entrega en bloques de inserción explícitos. Nunca se reescribe el archivo completo.

### Formato de bloque de inserción — locators

```typescript
// ── INSERTAR después de la última declaración de locator existente ──
private static readonly NUEVO_LOCATOR: Locator = By.css('[data-testid="TODO_nuevo_elemento"]');
```

### Formato de bloque de inserción — métodos

```typescript
// ── INSERTAR al final de la clase, antes del último `}` ──
/**
 * Descripción del método nuevo.
 * @param param - descripción del parámetro
 */
async nuevoMetodo(param: string, opts: RetryOptions): Promise<void> {
  try {
    await clickSafe(this.driver, ClaseExistente.NUEVO_LOCATOR, opts);
  } catch (error: unknown) {
    logger.error(`Error en nuevoMetodo: ${getErrorMessage(error)}`, { label: opts.label });
    throw error;
  }
}
```

### Formato de bloque de inserción — map + switch coordinado

Cuando el archivo tiene un map de acciones y un switch coordinado, ambos se insertan en el mismo bloque:

```typescript
// ── INSERTAR en ACTIONS map: nuevo entry ──
NUEVA_ACCION: ClaseExistente.NUEVO_LOCATOR,

// ── INSERTAR en switch(action): nuevo case ──
case 'NUEVA_ACCION':
  // comportamiento post-click según lo especificado por el usuario
  break;
```

---

## Placeholder format — locators pendientes

Cuando un locator no puede determinarse del input del usuario (descripción textual o imagen sin DOM), usar este formato exacto:

```typescript
private static readonly ELEMENT_NAME: Locator = By.css('[data-testid="TODO_element_name"]');
```

Reglas:
- Prefijo `TODO_` seguido del nombre semántico del elemento en `snake_case`.
- Nunca inventar un selector que parezca real — siempre el formato TODO.
- El nombre describe el elemento semánticamente (ej: `TODO_save_button`, `TODO_title_input`).
- Este formato aplica tanto en Modo Creación (Paso 2) como en Modo Extensión (Paso 3E).

El patrón `TODO_placeholder_name` debe buscarse en el SKILL.md (`pom-generator`) si se quiere cambiar — modificar en ambos lugares.

---

## Anti-patrones explícitos

| Qué evitar | Por qué |
|-----------|---------|
| Locators en Maestros | Rompe el ownership de UI |
| `step()` en sub-componentes | Contamina el reporte Allure |
| Sub-componente llamando a hermano | Crea acoplamiento lateral |
| `driver.sleep()` sin comentario | Enmasca inestabilidad real |
| Import sin `.js` | Rompe la resolución ESM en WSL2 |
| `catch` sin log y rethrow | Silencia errores → imposible debuggear |
| `private driver: WebDriver;` + `this.driver = driver;` en sub-componentes | Redundante — usar parameter property `private driver` en el constructor |
| Guardar `driver` como propiedad en Maestros | Los Maestros no usan `driver` en métodos — pasarlo como parámetro local al constructor |
