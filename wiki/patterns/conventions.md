---
source: src/pages/README.md · README.md
last-updated: 2026-04-13
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
constructor(driver: WebDriver, opts: RetryOptions = {}) {
  this.driver = driver;
  this.config = resolveRetryConfig(opts, "NombreSubComponente");
}
```

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
| Tests | `<Nombre>.<categoria>.test.ts` | `NewPost.test.ts`, `FailedLogin.test.ts` |

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
