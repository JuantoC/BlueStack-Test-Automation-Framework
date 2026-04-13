---
source: src/pages/videos_page/MainVideoPage.ts · VideoTable.ts · UploadVideoBtn.ts · UploadVideoModal.ts · VideoInlineActions.ts · VideoTypeFilter.ts · video_editor_page/
last-updated: 2026-04-13
---

# Pages: Videos Page

## Propósito

Gestión completa del flujo de videos en el CMS. Cubre subida de videos (YouTube, Nativo, Embedded), edición de título, publicación masiva y acciones inline.

---

## API pública / Métodos principales

### `MainVideoPage` (Maestro)

Constructor: `constructor(driver: WebDriver, opts: RetryOptions)`

| Método | Parámetros | Qué hace |
|--------|------------|----------|
| `uploadNewVideo(videoData)` | `videoData: VideoData` | Flujo completo: selecciona tipo → rellena modal → sube → espera en tabla index 0 |
| `changeVideoTitle(videoContainer)` | `videoContainer: WebElement` | Edita título inline del video |
| `clickOnActionVideo(videoContainer, action)` | `videoContainer: WebElement, action: ActionType` | Ejecuta acción del menú desplegable principal |
| `clickOnVideoKebabAction(videoContainer, action)` | `videoContainer: WebElement, action: InlineActionType` | Ejecuta acción del menú kebab (3 puntos) |
| `selectAndPublishFooter(videos)` | `videos: WebElement[]` | Selecciona N videos y publica via footer |
| `getVideoContainers(numberOfVideos)` | `numberOfVideos: number` | Retorna array de N WebElements de filas desde index 0 |
| `switchVideoTypeTab(type)` | `type: VideoFilterType` | Cambia el filtro de tipo de video activo |
| `table` (público) | — | `VideoTable` accesible directamente |

### `video_editor_page/MainEditorPage`

| Método | Parámetros | Qué hace |
|--------|------------|----------|
| `fillVideoInfo(data)` | `data: VideoData` | Llena los campos del editor de video |
| `saveAndExit()` | — | Guarda y sale del editor |

---

## Tipos / Interfaces exportadas

### `ActionType` (de `VideoInlineActions.ts`)

Valores disponibles: verificar `VideoInlineActions.ACTION_MAP` — acciones del menú principal.

### `InlineActionType` (de `VideoInlineActions.ts`)

Valores: `'EDIT' | 'DELETE' | 'UNPUBLISH' | 'SCHEDULE' | 'PREVIEW'`

⚠️ `DELETE` y `UNPUBLISH` son mutuamente excluyentes según el estado del video: DELETE para no publicados, UNPUBLISH para publicados.

### `VideoFilterType` (de `VideoTypeFilter.ts`)

Pestañas disponibles: `'NATIVO' | 'EMBEDDED' | 'YOUTUBE' | 'SHORT'` — verificar contra `VideoTypeFilter` para valores exactos.

---

## Sub-componentes

| Sub-componente | Posee |
|---------------|-------|
| `UploadVideoBtn` | Botón de subida y selección de tipo de video |
| `UploadVideoModal` | Modal de subida: campos URL/iframe/path, progreso |
| `VideoTable` | Tabla: búsqueda, selección, edición inline, acceso por índice/título |
| `VideoInlineActions` | Menú de acciones principal y kebab |
| `VideoTypeFilter` | Pestañas de filtro por tipo |
| `FooterActions` | Footer de publicación masiva |
| `CKEditorImageModal` | Modal de imágenes CKEditor (thumbnail del video) |
| **Editor:** `EditorHeaderActions` | Header: guardar, publicar |
| **Editor:** `EditorInfoSection` | Info del video (vacío — por implementar) |
| **Editor:** `EditorCategorySection` | Categoría (vacío — por implementar) |
| **Editor:** `EditorImageSection` | Imagen del video (vacío — por implementar) |
| **Editor:** `EditorRelatesSection` | Videos relacionados (vacío — por implementar) |

⚠️ Los 4 sub-componentes del editor (`EditorInfoSection`, `EditorCategorySection`, `EditorImageSection`, `EditorRelatesSection`) están vacíos actualmente — 1 línea de contenido.

---

## Notas de uso

```typescript
// Subida de video YouTube
const page = new MainVideoPage(driver, opts);
await page.uploadNewVideo(YoutubeVideoDataFactory.create());

// Subida nativa — espera barra de progreso automáticamente
await page.uploadNewVideo(NativeVideoDataFactory.create());

// Publicación masiva
const containers = await page.getVideoContainers(3);
await page.selectAndPublishFooter(containers);

// Filtrar por tipo
await page.switchVideoTypeTab('YOUTUBE');
```

**`uploadNewVideo`** con tipo `'NATIVO'` llama automáticamente a `uploadModal.checkProgressBar()` antes de verificar en la tabla.

**`switchVideoTypeTab`** cambia la pestaña activa — los contenedores obtenidos con `getVideoContainers` reflejarán los videos del tipo filtrado.
