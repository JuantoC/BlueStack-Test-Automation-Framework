---
source: src/pages/images_pages/MainImagePage.ts · ImageTable.ts · UploadImageBtn.ts · ImageActions.ts · images_editor_page/
last-updated: 2026-04-13
---

# Pages: Images Page

## Propósito

Gestión de imágenes en el CMS. Cubre subida vía input de archivo, edición de título, publicación masiva y acciones inline. Solo existe un tipo de imagen (archivo local — no hay distinción equivalente a `VideoType`).

**⚠️ Path:** el directorio es `src/pages/images_pages/` (plural con "s"), no `image_page`.

---

## API pública / Métodos principales

### `MainImagePage` (Maestro)

Constructor: `constructor(driver: WebDriver, opts: RetryOptions)`

| Método | Parámetros | Qué hace |
|--------|------------|----------|
| `uploadNewImage(imageData, btn?)` | `imageData: ImageData, btn?: 'Sidebar' \| 'Table'` | Sube imagen via input de archivo; verifica en tabla si `title` está presente |
| `changeImageTitle(imageContainer)` | `imageContainer: WebElement` | Edita título inline de la imagen |
| `clickOnActionImage(imageContainer, action)` | `imageContainer: WebElement, action: ImageActionType` | Ejecuta acción del menú de la imagen |
| `selectAndPublishFooter(images)` | `images: WebElement[]` | Selecciona N imágenes y publica via footer |
| `getImageContainers(numberOfImages)` | `numberOfImages: number` | Retorna array de N WebElements desde index 0 |
| `table` (público) | — | `ImageTable` accesible directamente |

### `images_editor_page/MainEditorPage`

| Método | Parámetros | Qué hace |
|--------|------------|----------|
| `fillImageInfo(data)` | `data: ImageData` | Llena los campos del editor de imagen |
| `saveAndExit()` | — | Guarda y sale del editor |

---

## Tipos / Interfaces exportadas

### `ImageActionType` (de `ImageActions.ts`)

Valores: verificar `ImageActions.ACTION_MAP` para valores exactos — acciones del menú de imagen.

---

## Sub-componentes

| Sub-componente | Posee |
|---------------|-------|
| `UploadImageBtn` | Botón de subida, envío de archivo al input `input[type="file"]` |
| `ImageTable` | Tabla: acceso por índice/título, selección, edición inline, espera post-subida |
| `ImageActions` | Menú de acciones sobre imagen |
| `FooterActions` | Footer de publicación masiva |
| **Editor:** `EditorHeaderActions` | Header del editor: guardar, publicar |

---

## Notas de uso

```typescript
// Subida básica
const page = new MainImagePage(driver, opts);
await page.uploadNewImage(ImageDataFactory.create());

// Subida desde botón de tabla (no sidebar)
await page.uploadNewImage(imageData, 'Table');

// Publicación masiva
const containers = await page.getImageContainers(5);
await page.selectAndPublishFooter(containers);
```

**`uploadNewImage`:**
- `btn` default es `'Sidebar'`.
- Si `imageData.title` se omite, saltea la verificación post-subida (emite `WARN` en log).
- Tras la subida: verifica en index 0 → llama `skipInlineTitleEdit()` → desselecciona.

**`ImageData.path`** es ruta relativa desde la raíz del proyecto: `"src/data_test/images/sample.jpg"`.
