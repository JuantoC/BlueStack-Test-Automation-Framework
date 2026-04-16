# Ejemplos de Referencia — Clases POM del Repositorio

> Código extraído de `src/pages/tags_page/` y `src/pages/videos_page/`.
> Fuente canónica: código TypeScript. Wiki de referencia: [wiki/patterns/conventions.md](../../../wiki/patterns/conventions.md) · [wiki/pages/tags-page.md](../../../wiki/pages/tags-page.md)

Estos ejemplos son gold standard del repositorio. Usá estas secciones para calibrar estilo, nivel de detalle y patrones al generar nuevas clases POM. Cada sección es referenciable por número (ej: `examples.md § 2`).

---

## Índice

1. [Sub-componente focalizado — NewTagBtn](#1-sub-componente-focalizado--newtagbtn)
2. [Maestro con composición — MainTagsPage](#2-maestro-con-composición--maintagspage)
3. [Patrones clave extraídos](#3-patrones-clave-extraídos)
4. [Extend Mode — Adición a `post_page`](#4-extend-mode--adición-a-post_page)

---

## 1. Sub-componente focalizado — NewTagBtn

**Fuente:** `src/pages/tags_page/NewTagBtn.ts`

Sub-componente mínimo que encapsula una sola acción atómica. Es el patrón base de cualquier sub-componente. Observá:

- `private static readonly` para todos los locators — nunca en el Maestro.
- Constructor con `private readonly driver` como parameter property (TypeScript shorthand).
- `resolveRetryConfig(opts, "NombreClase")` en el constructor para label de trazabilidad.
- Método público con JSDoc, `logger.debug` pre-acción, `logger.error` en catch, rethrow obligatorio.
- Sin `step()` — los sub-componentes nunca usan `step()`.
- Imports siempre con extensión `.js`.

```typescript
import { By, Locator, WebDriver } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import logger from "../../core/utils/logger.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

/**
 * Page Object que representa el botón "Nuevo Tag" ubicado en la barra lateral del CMS.
 * Encapsula la lógica de espera y click para abrir el modal de creación de tags.
 * Utilizado por `MainTagsPage` como primer paso del flujo de creación de un tag.
 *
 * @example
 * const btn = new NewTagBtn(driver, opts);
 * await btn.clickNewTag();
 */
export class NewTagBtn {
  private readonly config: RetryOptions; // ← config se deriva de opts + label

  // ↓ Locators: private static readonly, SCREAMING_SNAKE_CASE, solo en sub-componentes
  private static readonly NEW_TAG_BTN: Locator = By.css('button.btn-create-note');

  // ↓ Constructor: parameter property "private readonly driver" — no repetir en el body
  constructor(private readonly driver: WebDriver, opts: RetryOptions) {
    this.config = resolveRetryConfig(opts, "NewTagBtn"); // ← "NewTagBtn" = label de trazabilidad
  }

  /**
   * Hace click sobre el botón "Nuevo Tag" del sidebar para abrir el modal de creación.
   * La espera e interacción son gestionadas internamente por `clickSafe`.
   */
  async clickNewTag(): Promise<void> {
    try {
      logger.debug('Clickeando en "Nuevo Tag"...', { label: this.config.label });
      await clickSafe(this.driver, NewTagBtn.NEW_TAG_BTN, this.config); // ← acción delegada a core
      logger.debug('Click en "Nuevo Tag" ejecutado.', { label: this.config.label });
    } catch (error: unknown) {
      // ↓ Boundary externo: logger.error obligatorio + rethrow siempre
      logger.error(`Error al clickear "Nuevo Tag": ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }
}
```

---

## 2. Maestro con composición — MainTagsPage

**Fuente:** `src/pages/tags_page/MainTagsPage.ts`

Orquestador que compone múltiples sub-componentes y expone workflows de alto nivel. Observá:

- No tiene locators propios — todo se delega.
- Constructor: `resolveRetryConfig(opts, "MainTagsPage")` y luego `new SubComp(driver, this.config)` para cada sub-componente.
- `public readonly table` — el único sub-componente que los tests acceden directamente.
- Todo método público envuelto en `step()` de `allure-js-commons`.
- `stepContext.parameter(...)` para parámetros visibles en el reporte Allure.
- Logging: `logger.debug` antes de delegar, `logger.info` al confirmar éxito, `logger.error` en catch.
- `attachment(...)` para datos estructurados (JSON) en el reporte.

```typescript
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { WebDriver, WebElement } from "selenium-webdriver";
import { attachment, step } from "allure-js-commons";
import logger from "../../core/utils/logger.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";
import { TagTable } from "./TagTable.js";
import { TagActions } from "./TagActions.js";
import type { TagActionType } from "./TagActions.js";
import { TagAlphaFilter } from "./TagAlphaFilter.js";
import { NewTagBtn } from "./NewTagBtn.js";
import { NewTagModal } from "./NewTagModal.js";
import { TagFooterActions } from "./TagFooterActions.js";
import type { TagFooterActionType } from "./TagFooterActions.js";
import type { TagData } from "../../interfaces/data.js";

/**
 * Page Object Maestro para la sección Gestión de Tags del CMS.
 * Actúa como orquestador central que coordina todos los sub-componentes del Gestor de Tags.
 * Es el único punto de entrada para cualquier flujo de pruebas sobre esta sección.
 *
 * @example
 * const page = new MainTagsPage(driver, { timeoutMs: 10000 });
 * await page.createNewTag({ title: 'Gaming', estado: 'Aprobados' });
 */
export class MainTagsPage {
  private readonly config: RetryOptions;

  // ↓ Sub-componentes: private salvo table que los tests acceden directamente
  private readonly newTagBtn: NewTagBtn;
  private readonly newTagModal: NewTagModal;
  public readonly table: TagTable;         // ← public: los tests lo usan para leer filas
  private readonly actions: TagActions;
  private readonly alphaFilter: TagAlphaFilter;
  private readonly footer: TagFooterActions;

  // ↓ Constructor: resolveRetryConfig primero, luego instanciar sub-componentes con this.config
  constructor(driver: WebDriver, opts: RetryOptions) {
    this.config = resolveRetryConfig(opts, "MainTagsPage");

    this.newTagBtn   = new NewTagBtn(driver, this.config);
    this.newTagModal = new NewTagModal(driver, this.config);
    this.table       = new TagTable(driver, this.config);
    this.actions     = new TagActions(driver, this.config);
    this.alphaFilter = new TagAlphaFilter(driver, this.config);
    this.footer      = new TagFooterActions(driver, this.config);
  }

  /**
   * Orquesta el flujo completo de creación de un nuevo tag.
   * Abre el modal, llena los campos con los datos provistos y confirma la creación.
   *
   * @param tagData - Datos del tag a crear. `title` es obligatorio; el resto son opcionales.
   */
  async createNewTag(tagData: TagData): Promise<void> {
    // ↓ step() obligatorio en todo método público de Maestro
    await step(`Crear nuevo tag: "${tagData.title}"`, async (stepContext) => {
      attachment('Tag Data', JSON.stringify(tagData, null, 2), 'application/json'); // ← datos en reporte
      stepContext.parameter('Título', tagData.title);    // ← parámetros visibles en Allure
      stepContext.parameter('Timeout', `${this.config.timeoutMs}ms`);

      try {
        logger.debug(`Abriendo modal de nuevo tag para: "${tagData.title}"`, { label: this.config.label });
        await this.newTagBtn.clickNewTag();               // ← delegación a sub-componente

        logger.debug('Modal abierto. Llenando campos...', { label: this.config.label });
        await this.newTagModal.fillAndCreate(tagData);    // ← delegación a sub-componente

        logger.info(`Tag "${tagData.title}" creado exitosamente.`, { label: this.config.label });
      } catch (error: unknown) {
        logger.error(`Error al crear el tag "${tagData.title}": ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
        throw error; // ← rethrow siempre
      }
    });
  }

  /**
   * Selecciona uno o varios tags por índice y ejecuta una acción masiva desde el footer.
   *
   * @param indices - Array de índices de los tags a seleccionar (base 0).
   * @param action - Acción del footer a ejecutar sobre la selección (APPROVE, DISAPPROVE, DELETE).
   */
  async selectAndExecuteFooterAction(indices: number[], action: TagFooterActionType): Promise<void> {
    await step(`Seleccionar ${indices.length} tags y ejecutar "${action}"`, async (stepContext) => {
      stepContext.parameter('Cantidad', indices.length.toString());
      stepContext.parameter('Acción', action);
      stepContext.parameter('Timeout', `${this.config.timeoutMs}ms`);

      try {
        logger.debug(`Seleccionando ${indices.length} tags para acción: "${action}"`, { label: this.config.label });
        for (const index of indices) {           // ← iteración sobre múltiples elementos
          await this.table.selectTagByIndex(index);
        }

        logger.debug(`Tags seleccionados. Ejecutando "${action}" en footer...`, { label: this.config.label });
        await this.footer.clickFooterAction(action);
        logger.info(`Acción de footer "${action}" ejecutada sobre ${indices.length} tag/s.`, { label: this.config.label });
      } catch (error: unknown) {
        logger.error(`Error en selectAndExecuteFooterAction: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
        throw error;
      }
    });
  }

  // ... (otros métodos: clickOnTagAction, filterTagsByLetter, searchTag, getTagContainers)
}
```

---

## 3. Patrones clave extraídos

| # | Patrón | Dónde aplica | Señal en el código |
|---|---|---|---|
| A | Constructor con parameter property | Sub-componentes | `constructor(private readonly driver: WebDriver, opts: RetryOptions)` |
| B | `resolveRetryConfig` en constructor | Todo POM | `this.config = resolveRetryConfig(opts, "NombreClase")` |
| C | Locator `private static readonly` | Solo sub-componentes | `private static readonly NOMBRE: Locator = By.css(...)` |
| D | `step()` en métodos públicos | Solo Maestros | `await step("descripción", async (stepContext) => { ... })` |
| E | Sin `step()` en sub-componentes | Sub-componentes | Ausencia de `step()` — nunca usarlo ahí |
| F | `attachment()` para datos estructurados | Maestros | `attachment('Label', JSON.stringify(data), 'application/json')` |
| G | `stepContext.parameter()` | Maestros | Para valores visibles en el reporte Allure |
| H | `logger.debug` pre-acción | Todos | Antes de delegar a subcomponente o core |
| I | `logger.error` + rethrow en catch | Todos | Boundary externo — nunca silenciar |
| J | Iteración sobre elementos | Maestros | `for (const item of items) { await this.sub.accion(item); }` |
| K | `public readonly table` | Maestros | Para sub-componentes que los tests leen directamente |
| L | Imports con `.js` | Todos | `import { X } from "./X.js"` — requisito ESM |

### Flujo típico de método de Maestro

```
step(descripción)
  → attachment(data JSON)
  → stepContext.parameter(clave, valor)
  → try {
      logger.debug(antes de delegar)
      await this.subComp.metodoAtomic(...)
      logger.info(éxito)
    } catch {
      logger.error(mensaje + error)
      throw error
    }
```

### Flujo típico de método de Sub-componente

```
try {
  logger.debug(antes de la acción)
  await clickSafe / waitFind / waitVisible / etc.
  logger.debug(éxito)
} catch {
  logger.error(mensaje + error)
  throw error
}
```

---

## 4. Extend Mode — Adición a `post_page`

Ejemplo de output de Modo Extensión sobre el módulo `post_page` (ya existente y funcional).

El usuario provee DOM con un botón de eliminar y un dropdown de filtro de estado que no están cubiertos.

### Inventario congelado (Paso 0E)

```
📦 Inventario de post_page:
  Archivos: MainPostPage.ts, PostTable.ts, NewNoteBtn.ts
  Locators definidos:
    PostTable: POST_TABLE_BODY, POST_TITLE_LABEL, POST_TITLE_INPUT,
               POST_EDIT_BTN, CHECKBOX, LOADING_CONTAINER
    NewNoteBtn: NEW_NOTE_DROPDOWN_BTN, DROPDOWN_COMBO_MODAL, NOTE_TYPE_TESTID_MAP
  Métodos definidos:
    PostTable: selectPost(), getPostContainerByTitle(), changePostTitle(),
               clickEditorButton(), readCurrentTitle(), activateInlineTitleEdit(),
               fillTitleInput(), submitTitleWithEnter(), getPostContainerByIndex(),
               waitForLoadingContainerDisappear(), waitForNewPostAtIndex0()
    NewNoteBtn: openNoteTypeDropdown(), selectNoteType(), findNoteTypeOption(),
                clickNoteTypeOption(), isDropdownOpen()
    MainPostPage: selectAndPublishFooter(), changePostTitle(), enterToEditorPage(),
                  createNewNote(), getPostContainers()
  Componentes compartidos: FooterActions
```

### Gap Analysis (Paso 1E)

| Elemento de UI | ¿Locator existe? | ¿Método existe? | Acción |
|---|---|---|---|
| btn-edit-post | Sí (`POST_EDIT_BTN`) | Sí (`clickEditorButton()`) | — (no tocar) |
| btn-delete-post | No | No | Locator + método en PostTable |
| dropdown-status-filter | No | No | Locator + método en PostTable |
| deletePost() orquestador | — | No | Método nuevo en MainPostPage |

### Output generado (Paso 3E)

```typescript
// ═══════════════════════════════════════════════════════════
// AGREGAR EN PostTable.ts
// Ubicación: después de LOADING_CONTAINER (último `private static readonly`)
// ═══════════════════════════════════════════════════════════

private static readonly DELETE_BTN: Locator = By.css('button[data-testid="btn-delete-post"]');
private static readonly STATUS_FILTER_DROPDOWN: Locator = By.css('[data-testid="TODO_status_filter_dropdown"]');

// ═══════════════════════════════════════════════════════════
// AGREGAR EN PostTable.ts
// Ubicación: después de clickEditorButton()
// ═══════════════════════════════════════════════════════════

/**
 * Hace click en el botón de eliminar de un post.
 * El hover previo es necesario para revelar el botón, oculto por default en CSS.
 *
 * @param postContainer - Contenedor WebElement de la fila del post a eliminar.
 */
async clickDeleteButton(postContainer: WebElement): Promise<void> {
  try {
    logger.debug("Buscando botón de eliminar en el contenedor...", { label: this.config.label });
    const btnElement = await postContainer.findElement(PostTable.DELETE_BTN);
    await hoverOverParentContainer(this.driver, postContainer, this.config);
    await clickSafe(this.driver, btnElement, { ...this.config, timeoutMs: 8000 });
    logger.info("Click en botón eliminar ejecutado.", { label: this.config.label });
  } catch (error: unknown) {
    logger.error(`Fallo al clickear botón eliminar: ${getErrorMessage(error)}`, {
      label: this.config.label,
      error: getErrorMessage(error)
    });
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// AGREGAR EN MainPostPage.ts
// Ubicación: después de enterToEditorPage()
// ═══════════════════════════════════════════════════════════

/**
 * Orquesta el flujo de eliminación de una nota.
 * Delega el click en `PostTable.clickDeleteButton`.
 *
 * @param postContainer - Contenedor WebElement de la fila del post a eliminar.
 *   Obtenerlo previamente con `this.table.getPostContainerByTitle()` o `this.table.getPostContainerByIndex()`.
 */
async deletePost(postContainer: WebElement): Promise<void> {
  await step(`Eliminando nota`, async () => {
    try {
      logger.debug("Ejecutando el click en el botón de eliminar", { label: this.config.label });
      await this.table.clickDeleteButton(postContainer);
      logger.info("Nota eliminada exitosamente.", { label: this.config.label });
    } catch (error: unknown) {
      logger.error(`Error al eliminar la nota: ${getErrorMessage(error)}`, {
        label: this.config.label,
        error: getErrorMessage(error)
      });
      throw error;
    }
  });
}
```