# POM Component Map — update-testids

Mapa de áreas de UI → archivo POM responsable.
Usar para determinar qué archivo editar al encontrar un data-testid nuevo.

---

## Header global del CMS (`src/pages/`)

| Área de UI | POM archivo | Locator responsable |
|---|---|---|
| Botón "+" crear contenido (header global) | `HeaderNewContentBtn.ts` | `ADD_BTN`, `DROPDOWN_CONTAINER` |
| Items del dropdown "+" (Frequent, Others, Videos) | `HeaderNewContentBtn.ts` | `NEW_CONTENT_TYPE_MAP` (14 tipos) |

## Post Page (`src/pages/post_page/`)

| Área de UI | POM archivo | Locator responsable |
|---|---|---|
| Botón "Nueva Noticia" (combo desplegable) | `NewNoteBtn.ts` | `DROPDOWN_COMBO_MODAL` |
| Items del combo de tipo de nota (POST, LISTICLE, LIVEBLOG, AI_POST) | `NewNoteBtn.ts` | `NOTE_TYPE_TESTID_MAP` (testids directos por tipo) |
| Tabla de notas (body) | `PostTable.ts` | `POST_TABLE_BODY` |
| Título de nota en tabla | `PostTable.ts` | `POST_TITLE_LABEL`, `POST_TITLE_INPUT` |
| Botón editar nota en tabla | `PostTable.ts` | `POST_EDIT_BTN` |
| Checkbox selector de nota | `PostTable.ts` | `CHECKBOX` |
| Botón 3 puntitos de fila (acciones) | `PostTable.ts` | `MORE_ACTIONS_BTN` |
| Items del dropdown de 3 puntitos (Traducir, Preview, Editar, etc.) | `PostTable.ts` | `ROW_ACTION_MAP` (12 acciones por testid `menu-new-option-{icon}`) |
| Búsqueda simple | `PostTable.ts` | `SEARCH_INPUT` |
| Botón dropdown de vistas | `PostTable.ts` | `VIEWS_DROPDOWN_BTN` (testid: `btn-dropdown-views`) |
| Menú del dropdown de vistas (contenedor) | `PostTable.ts` | `VIEWS_DROPDOWN_MENU` (testid: `dropdown-menu`) |
| Opciones del filtro de vistas (19 vistas) | `PostTable.ts` | `VIEW_FILTER_MAP` + `selectView()` |
| Crear Contenido Secundario (dropdown modal) | `MainPostPage.ts` | (ver notas abajo) |

## Post Editor (`src/pages/post_page/note_editor_page/`)

| Área de UI | POM archivo | Locator responsable |
|---|---|---|
| Botón GUARDAR y su dropdown | `EditorHeaderActions.ts` | `SAVE_BTN` (testid: `btn-genericsavetext`), `DROPDOWN_SAVE_CONTAINER` (testid: `dropdown-toggle-genericsavetext`) |
| Botón PUBLICAR y su dropdown | `EditorHeaderActions.ts` | `PUBLISH_BTN` (testid: `btn-newnotepublishtext`), `DROPDOWN_PUBLISH_CONTAINER` (testid: `dropdown-toggle-newnotepublishtext`) |
| Opción "Guardar y Salir" del dropdown | `EditorHeaderActions.ts` | `SAVE_AND_EXIT_OPT` (testid: `dropdown-item-guardar-y-salir`) |
| Opción "Salir sin guardar" del dropdown | `EditorHeaderActions.ts` | `EXIT_WITHOUT_SAVING_OPT` (testid: `dropdown-item-salir`) |
| Opción "Publicar y Salir" del dropdown publish | `EditorHeaderActions.ts` | `PUBLISH_AND_EXIT_OPT` (testid: `dropdown-item-publicar-y-salir`) |
| Opción "Programar" del dropdown publish | `EditorHeaderActions.ts` | `SCHEDULE_OPT` (testid: `dropdown-item-programar`) |
| Botón Volver (flecha) | `EditorHeaderActions.ts` | `BACK_BTN` (testid: `btn-exit-note`, elemento `a`) |
| Modal confirmación "Save and Exit" del back | `EditorHeaderActions.ts` | `MODAL_BACK_SAVE_AND_EXIT_BTN` (wrapper: `btn-confirm-generic-saveexit-text` + interno: `btn-calendar-confirm`) |
| Modal confirmación "Discard" del back | `EditorHeaderActions.ts` | `MODAL_BACK_DISCARD_EXIT_BTN` (wrapper: `btn-cancel-newnote-get-out-anyway-text` + interno: `btn-calendar-confirm`) |
| Dropdown campos adicionales de nota | `MainEditorPage.ts` | (verificar) |
| Botón 3 puntitos de título secundario | `EditorHeaderActions.ts` (probable) | (verificar) |
| Dropdown agregar autor | `EditorHeaderActions.ts` (probable) | (verificar) |

## Videos Page (`src/pages/videos_page/`)

| Área de UI | POM archivo | Locator responsable |
|---|---|---|
| Header editor de videos — botón Guardar | `video_editor_page/EditorHeaderActions.ts` | `SAVE_BTN` (testid: `btn-save`) |
| Header editor de videos — botón Publicar | `video_editor_page/EditorHeaderActions.ts` | `PUBLISH_BTN` (testid: `btn-publish`) |
| Header editor de videos — toggle dropdown Guardar | `video_editor_page/EditorHeaderActions.ts` | `DROPDOWN_SAVE_CONTAINER` (testid: `dropdown-toggle-save`) |
| Header editor de videos — toggle dropdown Publicar | `video_editor_page/EditorHeaderActions.ts` | `DROPDOWN_PUBLISH_CONTAINER` (testid: `dropdown-toggle-publish`) |
| Header editor de videos — opción "Guardar y Salir" | `video_editor_page/EditorHeaderActions.ts` | `SAVE_AND_EXIT_OPT` (testid: `dropdown-item-guardar-y-salir`) |
| Header editor de videos — opción "Salir" | `video_editor_page/EditorHeaderActions.ts` | `EXIT_WITHOUT_SAVING_OPT` (testid: `dropdown-item-salir`) |
| Panel Info video — título, descripción, fuente, autor, URL, fecha, hora, rating, autoplay, mute, tags | `video_editor_page/EditorInfoSection.ts` | Ver locators en el archivo |
| Panel Info video — cerrar panel | `video_editor_page/EditorInfoSection.ts` | `CLOSE_BTN` (testid: `btn-close-info`) |
| Botón "Upload" (disparador dropdown tipos video) | `UploadVideoBtn.ts` | `UPLOAD_VIDEO_BTN` (`button.btn-create-note` — sin testid en DOM) |
| Contenedor dropdown de tipos de video | `UploadVideoBtn.ts` | `DROPDOWN_COMBO_MODAL` (testid: `dropdown-menu`) |
| Opciones de tipo de video (Embedded, Native, YouTube, Short) | `UploadVideoBtn.ts` | `LABELS_OF_VIDEO_TYPES` (testid: `^="dropdown-item-"`, matcheo por texto via `VIDEO_TYPE_MAP`) |

## Images Page (`src/pages/images_pages/`)

| Área de UI | POM archivo | Locator responsable |
|---|---|---|
| Header editor de imágenes — botón Guardar | `images_editor_page/EditorHeaderActions.ts` | `SAVE_BTN` (testid: `btn-save`) |
| Header editor de imágenes — botón Publicar | `images_editor_page/EditorHeaderActions.ts` | `PUBLISH_BTN` (testid: `btn-publish`) |
| Header editor de imágenes — toggle dropdown Guardar | `images_editor_page/EditorHeaderActions.ts` | `DROPDOWN_SAVE_CONTAINER` (testid: `dropdown-toggle-save`) |
| Header editor de imágenes — toggle dropdown Publicar | `images_editor_page/EditorHeaderActions.ts` | `DROPDOWN_PUBLISH_CONTAINER` (testid: `dropdown-toggle-publish`) |
| Header editor de imágenes — opción "Publicar y Salir" | `images_editor_page/EditorHeaderActions.ts` | `SAVE_AND_EXIT_OPT` / `PUBLISH_AND_EXIT_OPT` (testid: `dropdown-item-publicar-y-salir`) |
| Panel Info imagen — descripción, fuente, fotógrafo, tags | `images_editor_page/EditorInfoSection.ts` | `DESCRIPTION`, `SOURCE`, `PHOTOGRAPHER`, `TAGS_INPUT` |
| Panel Info imagen — cerrar panel | `images_editor_page/EditorInfoSection.ts` | `CLOSE_BTN` (testid: `btn-close-info`) |

## Modales globales

| Área de UI | POM archivo | Locator responsable |
|---|---|---|
| Modal de recarga del CMS (app updated) | (sin POM dedicado aún) | `btn-calendar-confirm` confirmado |
| Modal de publicación | `modals/PublishModal.ts` | (ya mapeado) |

## Componentes compartidos de tablas (`src/pages/`)

| Área de UI | POM archivo | Locator responsable |
|---|---|---|
| Botón "Publish" del footer de tabla | `FooterActions.ts` | `FOOTER_PUBLISH_BTN` (testid: `btn-tablepublishtext`) |
| Toggle desplegable del footer (flecha) | `FooterActions.ts` | `FOOTER_DROPDOWN_BTN` (testid: `dropdown-toggle-tablepublishtext`) |
| Opción "Publicar" en dropdown del footer | `FooterActions.ts` | `FOOTER_DROPDOWN_PUBLISH` (testid: `dropdown-item-publicar`) |
| Opción "Programar" en dropdown del footer | `FooterActions.ts` | `FOOTER_DROPDOWN_SCHEDULE` (testid: `dropdown-item-programar`) |
| Opción "Exportar" en dropdown del footer | `FooterActions.ts` | `FOOTER_DROPDOWN_EXPORT` (testid: `dropdown-item-exportar`) |
| Acciones del footer disponibles vía `clickFooterAction()` | `FooterActions.ts` | `FOOTER_ACTIONS`: `PUBLISH_ONLY`, `SCHEDULE`, `PUBLICAR`, `EXPORT` |

---

## Notas de mapeo

- **Crear Contenido Secundario**: el dropdown está en `MainPostPage.ts` pero puede requerir
  un sub-componente dedicado. Verificar si hay un POM específico antes de asumir.
- **Titulo secundario + agregar autor**: están en el área del editor de notas. Verificar
  si corresponden a `EditorHeaderActions.ts` o a `MainEditorPage.ts`.
- Cuando hay duda: leer `wiki/pages/post-page.md` para entender la jerarquía.