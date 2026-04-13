---
source: sessions/ (todos los *.test.ts — 14 archivos)
last-updated: 2026-04-13
---

# Sessions: Catalog

## Propósito

Inventario de todos los tests del framework con su categoría, flujo cubierto, datos y POs utilizados.

---

## Resumen

| Total tests | Categorías |
|-------------|-----------|
| 14 | auth, post, video, images, cross, stress, debug |

---

## Catálogo

### auth/

#### `FailedLogin.test.ts`
- **Categoría:** auth
- **Flujo:** Login con credenciales inválidas (N intentos) → recuperación con credenciales válidas
- **Metadata Allure:** epic="Auth", feature="Login Fallido"
- **POs:** `MainLoginPage`
- **Factories:** ninguno

---

### post/

#### `NewPost.test.ts`
- **Categoría:** post
- **Flujo:** Login → navegar a Posts → crear POST → editar en editor → guardar → re-entrar → publicar
- **Metadata Allure:** epic="Post Component", feature="Post", severity="normal"
- **POs:** `MainLoginPage`, `MainPostPage` (NoteType='POST'), `note_editor_page/MainEditorPage`
- **Factories:** `PostDataFactory.create()`

#### `NewListicle.test.ts`
- **Categoría:** post
- **Flujo:** Login → crear LISTICLE → llenar ítems de lista → guardar → publicar
- **Metadata Allure:** epic="Post Component", feature="Listicle"
- **POs:** `MainLoginPage`, `MainPostPage` (NoteType='LISTICLE'), `note_editor_page/MainEditorPage`
- **Factories:** `ListicleDataFactory.create()`

#### `NewLiveBlog.test.ts`
- **Categoría:** post
- **Flujo:** Login → crear LIVEBLOG → llenar evento + ítems → guardar → publicar
- **Metadata Allure:** epic="Post Component", feature="LiveBlog"
- **POs:** `MainLoginPage`, `MainPostPage` (NoteType='LIVEBLOG'), `note_editor_page/MainEditorPage`
- **Factories:** `LiveBlogDataFactory.create()`

#### `NewAIPost.test.ts`
- **Categoría:** post
- **Flujo:** Login → crear AI_POST → configurar parámetros IA → generar contenido → publicar
- **Metadata Allure:** epic="Post Component", feature="AI Post"
- **POs:** `MainLoginPage`, `MainPostPage` (NoteType='AI_POST'), `AIPost/MainAIPage`, `AIPost/AIPostModal`
- **Factories:** `AINoteDataFactory.create()`

#### `MassPublishNotes.test.ts`
- **Categoría:** post
- **Flujo:** Login → obtener N posts → seleccionar todos → publicar masivamente via footer
- **Metadata Allure:** epic="Post Component", feature="Publicación Masiva"
- **POs:** `MainLoginPage`, `MainPostPage`, `FooterActions`
- **Factories:** ninguno

---

### video/

#### `NewYoutubeVideo.test.ts`
- **Categoría:** video
- **Flujo:** Login → navegar a Videos → subir YouTube → editar título inline
- **Metadata Allure:** epic="Video Component", feature="Youtube Video"
- **POs:** `MainLoginPage`, `SidebarAndHeaderSection`, `MainVideoPage`
- **Factories:** `YoutubeVideoDataFactory.create()`

#### `NewEmbeddedVideo.test.ts`
- **Categoría:** video
- **Flujo:** Login → navegar a Videos → subir Embedded (iframe)
- **Metadata Allure:** epic="Video Component", feature="Embedded Video"
- **POs:** `MainLoginPage`, `SidebarAndHeaderSection`, `MainVideoPage`
- **Factories:** `EmbeddedVideoDataFactory.create()`

#### `MassPublishVideos.test.ts`
- **Categoría:** video
- **Flujo:** Login → obtener N videos → seleccionar todos → publicar masivamente
- **Metadata Allure:** epic="Video Component", feature="Publicación Masiva"
- **POs:** `MainLoginPage`, `SidebarAndHeaderSection`, `MainVideoPage`
- **Factories:** ninguno

---

### images/

#### `MassPublishImages.test.ts`
- **Categoría:** images
- **Flujo:** Login → navegar a Imágenes → obtener N imágenes → publicar masivamente
- **Metadata Allure:** epic="Images Component", feature="Publicación Masiva"
- **POs:** `MainLoginPage`, `SidebarAndHeaderSection`, `MainImagePage`
- **Factories:** ninguno

---

### cross/

#### `PostAndVideo.test.ts`
- **Categoría:** cross
- **Flujo:** Login → crear post → crear video → verificar ambos flujos en sesión continua
- **Metadata Allure:** epic="Cross-Component"
- **POs:** `MainLoginPage`, `MainPostPage`, `MainVideoPage`, `SidebarAndHeaderSection`
- **Factories:** `PostDataFactory.create()`, `YoutubeVideoDataFactory.create()`

---

### stress/

#### `StressMassActions.test.ts`
- **Categoría:** stress
- **Flujo:** Operaciones masivas intensivas sobre múltiples entidades
- **POs:** múltiples Maestros
- **Factories:** múltiples factories

---

### debug/

#### `DebugVideoEditorHeader.test.ts`
- **Categoría:** debug
- **Flujo:** Navega al editor de video y verifica el header — test de diagnóstico
- **POs:** `MainLoginPage`, `MainVideoPage`, `video_editor_page/MainEditorPage`, `video_editor_page/EditorHeaderActions`

#### `DebugImageEditorHeader.test.ts`
- **Categoría:** debug
- **Flujo:** Navega al editor de imágenes y verifica el header — test de diagnóstico
- **POs:** `MainLoginPage`, `MainImagePage`, `images_editor_page/MainEditorPage`, `images_editor_page/EditorHeaderActions`

---

## Notas de uso

**Ejecutar un test:**
```bash
npm run test:dev -- NewPost
# o forma directa:
cross-env NODE_OPTIONS='--experimental-vm-modules' USE_GRID=false IS_HEADLESS=false npx jest NewPost
```

**Estructura canónica:** todos los tests usan `runSession()` como punto de entrada. Ver [wiki/core/run-session.md](../core/run-session.md) para la firma completa.

**Los tests `debug/`** son para diagnóstico rápido de componentes específicos — no forman parte de la suite de regresión principal.
