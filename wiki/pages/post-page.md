---
source: src/pages/post_page/MainPostPage.ts · PostTable.ts · NewNoteBtn.ts · note_editor_page/ · ai_note/
last-updated: 2026-04-16
---

# Pages: Post Page

## Propósito

Gestión completa del flujo editorial de notas en el CMS. Cubre creación, edición, búsqueda y publicación de Posts, Listicles, LiveBlogs y AI Posts.

---

## API pública / Métodos principales

### `MainPostPage` (Maestro)

Constructor: `constructor(driver: WebDriver, opts: RetryOptions)`

| Método | Parámetros | Qué hace |
|--------|------------|----------|
| `createNewNote(noteType)` | `noteType: NoteType` | Abre dropdown y selecciona tipo de nota; el tipo viene del objeto de datos (`data.noteType`) |
| `enterToEditorPage(postContainer)` | `postContainer: WebElement` | Navega al editor haciendo click en el botón de edición de la fila |
| `changePostTitle(postContainer)` | `postContainer: WebElement` | Edita título inline con retry y re-fetch por ID si el container queda stale |
| `selectAndPublishFooter(posts)` | `posts: WebElement[]` | Selecciona N posts y publica via footer |
| `getPostContainers(numberOfPosts)` | `numberOfPosts: number` | Retorna array de N WebElements de filas desde index 0 |
| `searchPost(title)` | `title: string` | Escribe en el buscador de la tabla |
| `previewPost(postContainer)` | `postContainer: WebElement` | Abre preview del post |
| `togglePostPin(postContainer)` | `postContainer: WebElement` | Alterna pin del post |
| `executeRowAction(postContainer, action)` | `postContainer: WebElement, action: PostRowActionType` | Ejecuta acción del dropdown de fila |
| `table` (público) | — | `PostTable` accesible directamente para métodos de bajo nivel |

### `note_editor_page/MainEditorPage` (Maestro del editor)

Constructor: `constructor(driver: WebDriver, opts: RetryOptions)`

| Método | Parámetros | Qué hace |
|--------|------------|----------|
| `fillFullNote(data)` | `data: PostData \| ListicleData \| LiveBlogData` | Llena todos los campos; lee `data.noteType` para bifurcar entre LISTICLE y LIVEBLOG |
| `closeNoteEditor(action)` | `action: NoteExitAction` | Cierra el editor delegando en `EditorHeaderActions.clickExitAction(action)` |

---

## Tipos / Interfaces exportadas

### `NoteType` (de `src/interfaces/data.ts`)

```typescript
// Definido en src/interfaces/data.ts — re-exportado por NewNoteBtn.ts
export type NoteType = 'POST' | 'LISTICLE' | 'LIVEBLOG' | 'AI_POST';
```

`NOTE_TYPE_MAP` en `NewNoteBtn.ts` mantiene los alias multilingüales por tipo:

```typescript
static readonly NOTE_TYPE_MAP = {
  POST:     new Set(['New post', "Crear noticia", "Nova notícia"]),
  LISTICLE: new Set(['New listicle', "Crear nota lista", "Nova lista de notas"]),
  LIVEBLOG: new Set(['New liveblog', "Crear liveblog", "Nova liveblog"]),
  AI_POST:  new Set(['Create AI Post', 'Crear noticia IA', 'Crie notícias sobre IA'])
} as const;
```

### `NoteExitAction` (de `EditorHeaderActions.ts`)

```typescript
export type NoteExitAction = keyof typeof EditorHeaderActions.LOCATORS;
// 'SAVE_ONLY' | 'SAVE_AND_EXIT' | 'EXIT_WITHOUT_SAVING' | 'PUBLISH_ONLY'
// | 'PUBLISH_AND_EXIT' | 'SCHEDULE_AND_EXIT' | 'BACK_SAVE_AND_EXIT' | 'BACK_EXIT_DISCARD'
```

El tipo se deriva del mapa `LOCATORS` público — es la única fuente de verdad de las acciones válidas.
Cada clave mapea al locator del primer elemento que se debe clickear (botón directo o toggle de dropdown).

### `PostRowActionType` (de `PostTable.ts`)

Valores disponibles en `PostTable.ROW_ACTION_MAP` — verificar contra el archivo fuente para valores actuales.

---

## `EditorHeaderActions` — locators y mapa de acciones

Sub-componente del editor de notas. Gestiona el header con guardado, publicación y navegación hacia atrás.

### Locators actuales (2026-04-16)

| Constante | Selector CSS |
|-----------|-------------|
| `SAVE_BTN` | `[data-testid="btn-genericsavetext"]` |
| `PUBLISH_BTN` | `button[data-testid="btn-newnotepublishtext"]` |
| `BACK_BTN` | `a[data-testid="btn-exit-note"]` |
| `DROPDOWN_SAVE_CONTAINER` | `[data-testid="dropdown-toggle-genericsavetext"]` |
| `DROPDOWN_PUBLISH_CONTAINER` | `[data-testid="dropdown-toggle-newnotepublishtext"]` |
| `SAVE_AND_EXIT_OPT` | `[data-testid="dropdown-item-guardar-y-salir"]` |
| `EXIT_WITHOUT_SAVING_OPT` | `[data-testid="dropdown-item-salir"]` |
| `PUBLISH_AND_EXIT_OPT` | `[data-testid="dropdown-item-publicar-y-salir"]` |
| `SCHEDULE_OPT` | `[data-testid="dropdown-item-programar"]` |
| `MODAL_BACK_SAVE_AND_EXIT_BTN` | `[data-testid="btn-confirm-generic-saveexit-text"] button[data-testid="btn-calendar-confirm"]` |
| `MODAL_BACK_DISCARD_EXIT_BTN` | `[data-testid="btn-cancel-newnote-get-out-anyway-text"] button[data-testid="btn-calendar-confirm"]` |

### Mapa `LOCATORS` — primer click por acción

| `NoteExitAction` | Locator inicial |
|-----------------|----------------|
| `SAVE_ONLY` | `SAVE_BTN` |
| `SAVE_AND_EXIT` | `DROPDOWN_SAVE_CONTAINER` |
| `EXIT_WITHOUT_SAVING` | `DROPDOWN_SAVE_CONTAINER` |
| `PUBLISH_ONLY` | `PUBLISH_BTN` |
| `PUBLISH_AND_EXIT` | `DROPDOWN_PUBLISH_CONTAINER` |
| `SCHEDULE_AND_EXIT` | `DROPDOWN_PUBLISH_CONTAINER` |
| `BACK_SAVE_AND_EXIT` | `BACK_BTN` |
| `BACK_EXIT_DISCARD` | `BACK_BTN` |

Ver `wiki/patterns/conventions.md` § Patrón D para el patrón de selector compuesto usado en los modales de back.

---

## Sub-componentes

| Sub-componente | Posee |
|---------------|-------|
| `NewNoteBtn` | Dropdown de tipos de nota, apertura y selección |
| `PostTable` | Tabla de posts: búsqueda, selección, edición inline, acciones de fila |
| `FooterActions` | Footer de publicación masiva |
| **Editor:** `EditorHeaderActions` | Header del editor: guardar, publicar, cerrar |
| **Editor:** `EditorTextSection` | CKEditor principal (título, cuerpo) |
| **Editor:** `EditorTagsSection` | Input de tags con autocompletado |
| **Editor:** `EditorAuthorSection` | Selector de autor y tipo |
| **Editor:** `EditorLateralSettings` | Panel lateral de configuración |
| **Editor:** `EditorImagesSection` | Gestión de imágenes en el editor |
| **Editor:** `EditorFooterBtn` | Botón de footer del editor |
| **note_list:** `BaseListicleSection` | Sección de lista de ítems para Listicle y LiveBlog |
| **note_list:** `ListicleItemSection` | Item individual de listicle |
| **note_list:** `ListicleStrategy` | Estrategia de llenado de lista |
| **note_list:** `LiveBlogEventSection` | Sección de evento de LiveBlog |
| **ai_note:** `MainAIPage` | Maestro del flujo de creación IA |
| **ai_note:** `AIPostModal` | Modal de parámetros IA |

---

## Dependencias internas

- `NewNoteBtn` — para `createNewNote()`
- `PostTable` — para búsqueda, selección y edición inline
- `FooterActions` → `PublishModal` — para publicación masiva
- `note_editor_page/MainEditorPage` — PO separado que se instancia en el test para editar

---

## Notas de uso

```typescript
// Flujo típico: crear → editar → publicar
const postData = PostDataFactory.create(); // incluye noteType: 'POST'
const page = new MainPostPage(driver, opts);
const editorPage = new MainEditorPage(driver, opts);

await page.createNewNote(postData.noteType); // lee 'POST' desde el objeto de datos
await editorPage.fillFullNote(postData);     // lee noteType internamente para bifurcar lógica
await editorPage.closeNoteEditor('SAVE_AND_EXIT');

const containers = await page.getPostContainers(1);
await page.selectAndPublishFooter(containers);
```

```typescript
// Una sola instancia maneja múltiples tipos — patrón equivalente a VideoData
const post = new MainPostPage(driver, opts);
const editor = new MainEditorPage(driver, opts);

await post.createNewNote(postData.noteType);      // 'POST'
await editor.fillFullNote(postData);

await post.createNewNote(listicleData.noteType);  // 'LISTICLE'
await editor.fillFullNote(listicleData);

await post.createNewNote(liveBlogData.noteType);  // 'LIVEBLOG'
await editor.fillFullNote(liveBlogData);
```

**Importante:** `MainPostPage` y `note_editor_page/MainEditorPage` son POs separados. El test instancia ambos una sola vez — son reutilizables entre tipos de nota.

**`changePostTitle`** maneja staleness automáticamente: guarda el `id` del contenedor y lo re-fetchea si el DOM se refresca tras el ENTER.

**Listicle y LiveBlog:** `fillFullNote` detecta `data.noteType` internamente y activa la sección correspondiente (`ListicleStrategy` o `LiveBlogEventSection`).

---

## API pública de `EditorTextSection`

Métodos de escritura (fill):
| Método | Descripción |
|--------|-------------|
| `fillAll(data)` | Rellena todos los campos no vacíos del objeto `NoteData` |
| `fillField(field, value)` | Rellena un campo específico por nombre |
| `clickAddNewTitleBtn()` | Click en botón de agregar título |
| `getAddNewTitleItems()` | Retorna WebElements del dropdown de título |

Métodos getter (lectura de contenido actual):
| Método | Retorno | Estrategia |
|--------|---------|------------|
| `getTitle()` | `Promise<string>` | `.getAttribute('value')` — textarea |
| `getSecondaryTitle()` | `Promise<string>` | `.getAttribute('value')` — textarea |
| `getHalfTitle()` | `Promise<string>` | `.getAttribute('value')` — input |
| `getSubTitle()` | `Promise<string>` | `.getText()` — CKEditor editable |
| `getBody()` | `Promise<string>` | `.getText()` — CKEditor editable |
| `getSummary()` | `Promise<string>` | `.getText()` — CKEditor editable |
