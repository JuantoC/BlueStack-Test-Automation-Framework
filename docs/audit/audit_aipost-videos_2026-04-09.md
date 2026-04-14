# Auditoría de Refactorización — post_page/AIPost + videos_page

## Metadata

- **Scope**: `src/pages/post_page/AIPost/`, `src/pages/videos_page/`
- **Fecha**: 2026-04-09
- **Archivos analizados**:
  - `src/pages/post_page/AIPost/AIPostModal.ts`
  - `src/pages/post_page/AIPost/MainAIPage.ts`
  - `src/pages/videos_page/MainVideoPage.ts`
  - `src/pages/videos_page/VideoTable.ts`
  - `src/pages/videos_page/VideoInlineActions.ts`
  - `src/pages/videos_page/VideoTypeFilter.ts`
  - `src/pages/videos_page/UploadVideoBtn.ts`
  - `src/pages/videos_page/UploadVideoModal.ts`

---

## Resumen ejecutivo

El scope presenta **22 hallazgos** en 6 archivos (5 sub-componentes + 1 Maestro). Los problemas se agrupan en tres categorías:

1. **Interacciones directas con UI encapsuladas en métodos privados** — impiden reutilización y composición desde el Maestro o desde tests: `VideoTable` (×3), `UploadVideoBtn` (×1), `UploadVideoModal` (×1).
2. **Flujos compuestos sin exposición de acciones atómicas** — obligan a duplicar lógica en lugar de componer: `VideoInlineActions` (×2 flujos, 5 atómicos faltantes), `UploadVideoModal` (×1 atómico faltante), `AIPostModal` (×1 atómico faltante).
3. **Uso de `step()` en sub-componentes** — violación directa del contrato de capa definido en el README ("Sub-component public methods — same try/catch/log/re-throw, no `step()`"): `AIPostModal` (×4), `VideoTable` (×1), `UploadVideoBtn` (×1), `UploadVideoModal` (×4). Inverso en Maestro: `MainVideoPage.getVideoContainers()` falta `step()` siendo método público del Maestro.

Volumen estimado: **8 atómicos a crear/exponer**, **5 cambios de visibilidad**, **10 `step()` a eliminar de sub-componentes**, **1 `step()` a agregar en Maestro**, **0 cambios de firma pública** que afecten sesiones existentes.

---

## Hallazgos por archivo

---

### `src/pages/post_page/AIPost/AIPostModal.ts`

#### Métodos a atomizar

| Método actual | Visibilidad actual | Acciones atómicas a extraer | Nombre propuesto | Visibilidad requerida |
|---|---|---|---|---|
| `clickOnGenerateBtn()` (L71) | public | Click directo sobre `AIPostModal.GENERATE_BTN` sin las pre-condiciones de checkbox ni habilitación | `clickGenerateBtn(): Promise<void>` | public |

#### Flujos a refactorizar

| Flujo actual | Problema | Refactorización propuesta |
|---|---|---|
| `clickOnGenerateBtn()` (L71–86) | Combina tres acciones: `ensureCheckboxSelected()` (L73) + `isGenerateBtnEnabled()` (L76) + `clickSafe(GENERATE_BTN)` (L77). No existe un `clickGenerateBtn()` atómico que solo haga click en el botón. Un test que quiera verificar el comportamiento del botón deshabilitado no puede accionarlo sin pasar por las pre-condiciones. | Extraer `clickGenerateBtn()` que solo llame `clickSafe(this.driver, AIPostModal.GENERATE_BTN, this.config)`. Refactorizar `clickOnGenerateBtn()` para que consuma `ensureCheckboxSelected()` + `isGenerateBtnEnabled()` + `clickGenerateBtn()`. |
| `clickOnDoneBtn()` (L55–64) | Usa wrapper `step()` — sub-componentes no deben envolver en `step()`. | Eliminar el wrapper `step()`. Mantener try/catch/logger.error/rethrow. |
| `clickOnGenerateBtn()` (L71–86) | Usa wrapper `step()` — misma violación. | Eliminar el wrapper `step()`. |
| `fillAll()` (L95–105) | Usa wrapper `step()` — misma violación. | Eliminar el wrapper `step()`. |
| `fillField()` (L115–126) | Usa wrapper `step()` — misma violación. Al coexistir con el `step()` de `fillAll()`, genera nesting de steps en Allure. | Eliminar el wrapper `step()`. |

#### Cambios de visibilidad

Ninguno. El único método privado, `matchOption()` (L170), es un finder de DOM que no interactúa ni hace click ni escribe — correcto como privado.

---

### `src/pages/post_page/AIPost/MainAIPage.ts`

Sin hallazgos. El Maestro delega correctamente todas las interacciones en `AIPostModal`. `generateNewAINote()` usa `step()` como corresponde al contrato Maestro.

---

### `src/pages/videos_page/VideoTable.ts`

#### Métodos a atomizar

Los tres privados listados a continuación son las acciones atómicas faltantes. No se requieren métodos adicionales más allá de hacerlos públicos con nombre adecuado.

#### Flujos a refactorizar

| Flujo actual | Problema | Refactorización propuesta |
|---|---|---|
| `changeVideoTitle()` (L93–119) | Orquesta tres privados que interactúan directamente con la UI: `extractCurrentTitle()` (L101), `activateEditModeIfNeeded()` (L109), `writeAndValidateTitle()` (L112). Al ser privados no son accesibles como acciones individuales desde el Maestro ni para tests que quieran componer flujos distintos de edición inline. | Hacer públicos con nombres canónicos (ver tabla de visibilidad). `changeVideoTitle()` pasa a consumirlos explícitamente. |
| `skipInlineTitleEdit()` (L148–168) | Usa wrapper `step()` — sub-componente no debe usar `step()`. | Eliminar el wrapper `step()`. Mantener try/catch/logger.error/rethrow. |

#### Cambios de visibilidad

| Método actual | Visibilidad actual | Visibilidad requerida | Nombre propuesto | Razón |
|---|---|---|---|---|
| `extractCurrentTitle(videoContainer: WebElement)` (L224) | private | public | `readVideoTitle(videoContainer: WebElement): Promise<string>` | Lee directamente de `div.title-video` y `textarea.cdk-textarea-autosize` (getText, getAttribute). Acción atómica de tipo "read" sobre elemento de UI. |
| `activateEditModeIfNeeded(videoContainer: WebElement)` (L253) | private | public | `activateInlineEditMode(videoContainer: WebElement): Promise<void>` | Hace click sobre `div.title-video` para activar el textarea de edición inline. Interacción directa (click) con elemento de UI. |
| `writeAndValidateTitle(newTitle: string)` (L277) | private | public | `writeInlineTitle(newTitle: string): Promise<void>` | Escribe en `textarea.cdk-textarea-autosize` y envía `Key.ENTER`. Interacción directa (write + keypress) con elemento de UI. |

---

### `src/pages/videos_page/VideoInlineActions.ts`

#### Métodos a atomizar

| Método actual | Visibilidad actual | Acciones atómicas a extraer | Nombre propuesto | Visibilidad requerida |
|---|---|---|---|---|
| `clickOnAction(videoContainer, action)` (L92) | public | Hover sobre el botón toggle del dropdown (L97: `hoverOverParentContainer`) | `hoverActionDropdownToggle(videoContainer: WebElement): Promise<void>` | public |
| `clickOnAction(videoContainer, action)` (L92) | public | Click sobre el dropdown toggle para abrirlo (L101: `clickSafe(dropdownBtn)`) | `openActionDropdown(videoContainer: WebElement): Promise<void>` | public |
| `clickOnAction(videoContainer, action)` (L92) | public | Click sobre el ítem de acción dentro del dropdown ya abierto (L106: `clickSafe(actionBtn)`) | `clickDropdownAction(videoContainer: WebElement, action: ActionType): Promise<void>` | public |
| `clickOnKebabAction(videoContainer, action)` (L130) | public | Click sobre el botón kebab para abrir el menú (L136: `clickSafe(kebabBtn)`) | `openKebabMenu(videoContainer: WebElement): Promise<void>` | public |
| `clickOnKebabAction(videoContainer, action)` (L130) | public | Click sobre un ítem específico dentro del menú kebab ya abierto (L142: `clickSafe(actionBtn)`) | `clickKebabMenuItem(videoContainer: WebElement, action: InlineActionType): Promise<void>` | public |

#### Flujos a refactorizar

| Flujo actual | Problema | Refactorización propuesta |
|---|---|---|
| `clickOnAction()` (L92–114) | Embebe 3 interacciones de UI inline: (1) hover sobre el toggle (L97), (2) click condicional para abrir el dropdown (L101), (3) click sobre el ítem de acción (L106). Ninguna existe como método público independiente, impidiendo componer flujos que solo hagan hover o que asuman el dropdown ya abierto. | Extraer `hoverActionDropdownToggle()`, `openActionDropdown()`, `clickDropdownAction()`. Reescribir `clickOnAction()` consumiendo los tres en secuencia. |
| `clickOnKebabAction()` (L130–150) | Embebe 2 interacciones inline: (1) click condicional para abrir el kebab (L136), (2) click sobre el ítem (L142). Ninguna existe como método público independiente. | Extraer `openKebabMenu()`, `clickKebabMenuItem()`. Reescribir `clickOnKebabAction()` consumiendo ambos. |

#### Cambios de visibilidad

Los 4 privados actuales (`findDropdownAction`, `findKebabAction`, `isDropdownOpen`, `isKebabMenuOpen`) son finders y checkers de estado sin interacción directa (sin click ni escritura). Correctos como privados.

---

### `src/pages/videos_page/VideoTypeFilter.ts`

Sin hallazgos. `clickTab()` y `getActiveTabLabel()` son atómicos y públicos. `isTabActive()` compone `getActiveTabLabel()` correctamente. `resolveTypeFromLabel()` es privado sin interacción directa con UI.

---

### `src/pages/videos_page/UploadVideoBtn.ts`

#### Métodos a atomizar

No se requieren nuevos métodos. El único atómico faltante es el privado `clickOnUploadVideoButton()` hecho público (ver cambios de visibilidad).

#### Flujos a refactorizar

| Flujo actual | Problema | Refactorización propuesta |
|---|---|---|
| `selectVideoType()` (L53–73) | Usa wrapper `step()` — sub-componente no debe usar `step()`. | Eliminar el wrapper `step()`. Mantener try/catch/logger.error/rethrow. |
| `selectVideoType()` (L53–73) | Orquesta: espera tabla (L57) + apertura del dropdown via privado `clickOnUploadVideoButton()` (L60) + match del tipo (L63) + click (L66). El sub-flujo de apertura del dropdown es privado pese a hacer click sobre un elemento de UI. | Hacer público y renombrar `clickOnUploadVideoButton()` → `openVideoTypeDropdown()`. `selectVideoType()` lo consume explícitamente tras `waitUntilIsReady`. |

#### Cambios de visibilidad

| Método actual | Visibilidad actual | Visibilidad requerida | Nombre propuesto | Razón |
|---|---|---|---|---|
| `clickOnUploadVideoButton()` (L75) | private | public | `openVideoTypeDropdown(): Promise<void>` | Hace click sobre `UPLOAD_VIDEO_BTN` para abrir el dropdown de tipos. Interacción directa (click) con elemento de UI. |

---

### `src/pages/videos_page/UploadVideoModal.ts`

#### Métodos a atomizar

| Método actual | Visibilidad actual | Acciones atómicas a extraer | Nombre propuesto | Visibilidad requerida |
|---|---|---|---|---|
| `fillAll()` (L66) | public | Click sobre `IMAGE_PREVIEW` (L84: `clickSafe(this.driver, UploadVideoModal.IMAGE_PREVIEW, this.config)`) embebido inline dentro de la rama EMBEDDED | `clickImagePreview(): Promise<void>` | public |

#### Flujos a refactorizar

| Flujo actual | Problema | Refactorización propuesta |
|---|---|---|
| `fillAll()` (L66–89) | Usa wrapper `step()` — sub-componente no debe usar `step()`. Además embebe `clickSafe(IMAGE_PREVIEW)` (L84) inline sin método atómico propio; no se puede reutilizar el click sobre la preview sin pasar por el relleno completo del formulario. | Eliminar `step()`. Extraer `clickImagePreview()`. `fillAll()` llama a `clickImagePreview()` en la rama `data.video_type === 'EMBEDDED'`. |
| `fillField()` (L95–121) | Usa wrapper `step()` — misma violación. Al coexistir con el `step()` de `fillAll()`, genera nesting de steps en Allure. | Eliminar el wrapper `step()`. |
| `checkProgressBar()` (L131–148) | Usa wrapper `step()` — misma violación. | Eliminar el wrapper `step()`. |
| `clickOnUploadBtn()` (L154–163) | Usa wrapper `step()` — misma violación. | Eliminar el wrapper `step()`. |

#### Cambios de visibilidad

| Método actual | Visibilidad actual | Visibilidad requerida | Nombre propuesto | Razón |
|---|---|---|---|---|
| `uploadFile(relativePath: string)` (L180) | private | public | `uploadFile(relativePath: string): Promise<void>` (sin cambio de nombre) | Llama `fileInput.sendKeys(absolutePath)` — interacción directa (sendKeys) con el input de archivo de UI. |

---

### `src/pages/videos_page/MainVideoPage.ts`

#### Flujos a refactorizar

| Flujo actual | Problema | Refactorización propuesta |
|---|---|---|
| `getVideoContainers(NumberOfVideos)` (L243) | Método público del Maestro sin wrapper `step()`. El README establece: "Every Maestro public method → step() from allure-js-commons". Todos los demás métodos públicos del Maestro sí lo tienen. | Envolver en `step()` con parámetros de cantidad (`NumberOfVideos`) y timeout. Agregar try/catch/logger.error/rethrow en el cuerpo. |

No hay interacciones directas con UI en el Maestro. Todas delegadas correctamente en sub-componentes.

---

### Sesiones afectadas

Todas las modificaciones propuestas son **aditivas** (nuevos métodos públicos extraídos de privados existentes) o **internas** (eliminación de `step()`, cambio de visibilidad de privados). Ningún método público del Maestro cambia de nombre ni firma. **0 cambios requeridos en sesiones.**

Las sesiones listadas a continuación acceden a sub-componentes vía `video.table.*` (propiedad `public readonly` del Maestro). Los métodos específicos que usan no son modificados.

#### `sessions/video/MassPublishVideos.test.ts`

| Línea(s) | Código actual | Cambio requerido | Razón |
|---|---|---|---|
| L35, L37, L39 | `video.uploadNewVideo(...)` ×3 | Ninguno | Firma del Maestro intacta |
| L41, L43, L45 | `video.table.getVideoContainerByTitle(...)` | Ninguno | Método sin cambios |
| L42, L44, L46 | `video.changeVideoTitle(container)` | Ninguno | Firma del Maestro intacta |

#### `sessions/video/NewYoutubeVideo.test.ts`

| Línea(s) | Código actual | Cambio requerido | Razón |
|---|---|---|---|
| L37 | `video.uploadNewVideo(newYoutubeData)` | Ninguno | Firma intacta |
| L39 | `video.table.getVideoContainerByTitle(...)` | Ninguno | Método sin cambios |
| L40 | `video.changeVideoTitle(youtubeContainer)` | Ninguno | Firma intacta |

#### `sessions/video/NewEmbeddedVideo.test.ts`

| Línea(s) | Código actual | Cambio requerido | Razón |
|---|---|---|---|
| L37 | `video.uploadNewVideo(newEmbeddedData)` | Ninguno | Firma intacta |
| L39 | `video.table.getVideoContainerByTitle(...)` | Ninguno | Método sin cambios |
| L40 | `video.changeVideoTitle(embeddedContainer)` | Ninguno | Firma intacta |

#### `sessions/cross/PostAndVideo.test.ts`

| Línea(s) | Código actual | Cambio requerido | Razón |
|---|---|---|---|
| L54 | `video.uploadNewVideo(newYoutubeData)` | Ninguno | Firma intacta |

#### `sessions/stress/StressMassActions.test.ts`

| Línea(s) | Código actual | Cambio requerido | Razón |
|---|---|---|---|
| L74, L76 | `video.uploadNewVideo(...)` ×2 | Ninguno | Firma intacta |
| L80, L82 | `video.table.getVideoContainerByTitle(...)` | Ninguno | Método sin cambios |
| L81, L83 | `video.changeVideoTitle(container)` | Ninguno | Firma intacta |
| L89 | `ai.generateNewAINote(AIData)` | Ninguno | Firma intacta |

#### `sessions/debug/DebugVideoEditorHeader.test.ts`

| Línea(s) | Código actual | Cambio requerido | Razón |
|---|---|---|---|
| L36, L50 | `videoPage.table.getVideoContainerByIndex(0)` | Ninguno | Método sin cambios |
| L39, L52 | `videoPage.clickOnActionVideo(container, 'EDIT')` | Ninguno | Firma intacta |

#### `sessions/post/NewAIPost.test.ts`

| Línea(s) | Código actual | Cambio requerido | Razón |
|---|---|---|---|
| L37 | `ai_post.generateNewAINote(AIData)` | Ninguno | Firma intacta |

---

## Checklist de ejecución

- [ ] `AIPostModal.ts` — 1 atómico a crear (`clickGenerateBtn`), 4 `step()` a eliminar (`clickOnDoneBtn`, `clickOnGenerateBtn`, `fillAll`, `fillField`)
- [ ] `VideoTable.ts` — 3 cambios de visibilidad + rename (`readVideoTitle`, `activateInlineEditMode`, `writeInlineTitle`), 1 `step()` a eliminar (`skipInlineTitleEdit`)
- [ ] `VideoInlineActions.ts` — 5 atómicos a crear (`hoverActionDropdownToggle`, `openActionDropdown`, `clickDropdownAction`, `openKebabMenu`, `clickKebabMenuItem`), 2 flujos a refactorizar para consumirlos (`clickOnAction`, `clickOnKebabAction`)
- [ ] `UploadVideoBtn.ts` — 1 cambio de visibilidad + rename (`openVideoTypeDropdown`), 1 `step()` a eliminar (`selectVideoType`)
- [ ] `UploadVideoModal.ts` — 1 atómico a crear (`clickImagePreview`), 1 cambio de visibilidad (`uploadFile`), 4 `step()` a eliminar (`fillAll`, `fillField`, `checkProgressBar`, `clickOnUploadBtn`)
- [ ] `MainVideoPage.ts` — 1 `step()` a agregar en `getVideoContainers()`
- [ ] Sesiones — 0 cambios requeridos
