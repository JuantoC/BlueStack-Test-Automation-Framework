# Known Testids — update-testids

Historial de data-testid procesados por esta skill.
Actualizar al finalizar cada ejecución (FASE 5).

---

## NAA-4324 — Agregar data-testid específicos para localizar elementos

**Fecha procesado:** 2026-04-15
**Assignee front:** Paula Valentina Rodriguez Roberto
**Commits front:** 393e427e, 2d627950, c545d01f, 5c4f819, 9e2ad376, 980045a0, 730415c4, c3c3994a

---

### Confirmados ✅

#### NewNoteBtn — opciones de tipo de nota

| data-testid | Elemento HTML | POM | Locator | Status |
|---|---|---|---|---|
| `option-create` | `div` | `NewNoteBtn.ts` | `DROPDOWN_COMBO_MODAL` | Validado |
| `link-navigate-news` | `a` | `NewNoteBtn.ts` | `NOTE_TYPE_TESTID_MAP['POST']` | Validado |
| `link-navigate-listas` | `a` | `NewNoteBtn.ts` | `NOTE_TYPE_TESTID_MAP['LISTICLE']` | Validado |
| `link-navigate-liveblog` | `a` | `NewNoteBtn.ts` | `NOTE_TYPE_TESTID_MAP['LIVEBLOG']` | Validado |
| `btn-create-ai` | `button` | `NewNoteBtn.ts` | `NOTE_TYPE_TESTID_MAP['AI_POST']` | Validado |

> **Nota:** El locator `LABELS_OF_NOTE_TYPES` (start-with) fue reemplazado por `NOTE_TYPE_TESTID_MAP` con testids directos por tipo (NAA-4324). Los testids `dropdown-item-news`, `dropdown-item-gamecasts`, etc. ya no se usan en el código.

#### HeaderNewContentBtn — dropdown "+" header global

| data-testid | Elemento HTML | POM | Locator | Status |
|---|---|---|---|---|
| `btn-add-header` | `button` | `HeaderNewContentBtn.ts` | `ADD_BTN` | Validado |
| `dropdown-menu-new-content` | `div` | `HeaderNewContentBtn.ts` | `DROPDOWN_CONTAINER` | Validado |
| `dropdown-item-new-news` | `a` | `HeaderNewContentBtn.ts` | `NEW_CONTENT_TYPE_MAP['NEW_POST']` | Validado |
| `dropdown-item-new-trivias` | `a` | `HeaderNewContentBtn.ts` | `NEW_CONTENT_TYPE_MAP['NEW_TRIVIA']` | Validado |
| `dropdown-item-new-polls` | `a` | `HeaderNewContentBtn.ts` | `NEW_CONTENT_TYPE_MAP['NEW_POLL']` | Validado |
| `dropdown-item-new-listas` | `a` | `HeaderNewContentBtn.ts` | `NEW_CONTENT_TYPE_MAP['NEW_LISTICLE']` | Validado |
| `dropdown-item-new-tag` | `a` | `HeaderNewContentBtn.ts` | `NEW_CONTENT_TYPE_MAP['NEW_TAG']` | Validado |
| `dropdown-item-new-gamecasts` | `a` | `HeaderNewContentBtn.ts` | `NEW_CONTENT_TYPE_MAP['NEW_GAMECAST']` | Validado |
| `dropdown-item-new-cronicas` | `a` | `HeaderNewContentBtn.ts` | `NEW_CONTENT_TYPE_MAP['NEW_CHRONICLE']` | Validado |
| `dropdown-item-new-liveblog` | `a` | `HeaderNewContentBtn.ts` | `NEW_CONTENT_TYPE_MAP['NEW_LIVEBLOG']` | Validado |
| `dropdown-item-new-AIEnabled` | `a` | `HeaderNewContentBtn.ts` | `NEW_CONTENT_TYPE_MAP['NEW_AI_NEWS']` | Validado |
| `dropdown-item-new-AIEnabledList` | `a` | `HeaderNewContentBtn.ts` | `NEW_CONTENT_TYPE_MAP['NEW_AI_LISTICLE']` | Validado |
| `dropdown-item-new-header.new_video.native` | `a` | `HeaderNewContentBtn.ts` | `NEW_CONTENT_TYPE_MAP['NEW_VIDEO_NATIVE']` | Validado |
| `dropdown-item-new-header.new_video.embed` | `a` | `HeaderNewContentBtn.ts` | `NEW_CONTENT_TYPE_MAP['NEW_VIDEO_EMBEDDED']` | Validado |
| `dropdown-item-new-header.new_video.youtube` | `a` | `HeaderNewContentBtn.ts` | `NEW_CONTENT_TYPE_MAP['NEW_VIDEO_YOUTUBE']` | Validado |

#### PostTable — tabla de notas

| data-testid | Elemento HTML | POM | Locator | Status |
|---|---|---|---|---|
| `checkbox-notice-{index}` | `mat-checkbox` | `PostTable.ts` | `CHECKBOX` | Validado |
| `btn-dropdown-views` | `button` | `PostTable.ts` | `VIEWS_DROPDOWN_BTN` | Validado |
| `dropdown-menu` | `div` | `PostTable.ts` | `VIEWS_DROPDOWN_MENU` | Validado |

#### PostTable — filtro de vistas (VIEW_FILTER_MAP, 19 vistas)

| data-testid | Elemento HTML | POM | Locator | Status |
|---|---|---|---|---|
| `dropdown-item-pines` | `div` | `PostTable.ts` | `VIEW_FILTER_MAP['PINS']` | Validado |
| `dropdown-item-frescura` | `div` | `PostTable.ts` | `VIEW_FILTER_MAP['FRESHNESS']` | Validado |
| `dropdown-item-noticias-ia` | `div` | `PostTable.ts` | `VIEW_FILTER_MAP['AI_POST']` | Validado |
| `dropdown-item-mis-ultimas-noticias` | `div` | `PostTable.ts` | `VIEW_FILTER_MAP['MY_LATEST_NEWS']` | Validado |
| `dropdown-item-ultimas-noticias-modificadas` | `div` | `PostTable.ts` | `VIEW_FILTER_MAP['LAST_MODIFIED_NEWS']` | Validado |
| `dropdown-item-home` | `div` | `PostTable.ts` | `VIEW_FILTER_MAP['HOME']` | Validado |
| `dropdown-item-home--parrilla` | `div` | `PostTable.ts` | `VIEW_FILTER_MAP['HOME_PARRILLA']` | Validado |
| `dropdown-item-notas-en-home-y-notas-desvinculadas` | `div` | `PostTable.ts` | `VIEW_FILTER_MAP['NOTES_HOME_AND_UNLINKED']` | Validado |
| `dropdown-item-prioridad--movil` | `div` | `PostTable.ts` | `VIEW_FILTER_MAP['PRIORITY_MOBILE']` | Validado |
| `dropdown-item-seccion---por-zona` | `div` | `PostTable.ts` | `VIEW_FILTER_MAP['SECTION_BY_ZONE']` | Validado |
| `dropdown-item-facebook-instant-articles` | `div` | `PostTable.ts` | `VIEW_FILTER_MAP['FACEBOOK_INSTANT_ARTICLES']` | Validado |
| `dropdown-item-notas-por-relevancia` | `div` | `PostTable.ts` | `VIEW_FILTER_MAP['NOTES_BY_RELEVANCE']` | Validado |
| `dropdown-item-pendientes` | `div` | `PostTable.ts` | `VIEW_FILTER_MAP['PENDING']` | Validado |
| `dropdown-item-notas-de-roma` | `div` | `PostTable.ts` | `VIEW_FILTER_MAP['NOTES_DE_ROMA']` | Validado |
| `dropdown-item-en-programacion` | `div` | `PostTable.ts` | `VIEW_FILTER_MAP['IN_PROGRAMMING']` | Validado |
| `dropdown-item-zona-compartida` | `div` | `PostTable.ts` | `VIEW_FILTER_MAP['SHARED_ZONE']` | Validado |
| `dropdown-item-todo` | `div` | `PostTable.ts` | `VIEW_FILTER_MAP['TODO']` | Validado |
| `dropdown-item-pendiente-por-estado` | `div` | `PostTable.ts` | `VIEW_FILTER_MAP['PENDING_BY_STATUS']` | Validado |
| `dropdown-item-testing` | `div` | `PostTable.ts` | `VIEW_FILTER_MAP['TESTING']` | Validado |

#### Post Editor — EditorHeaderActions (nota)

> Actualizado 2026-04-16 — Fuente: HTML manual del usuario (PATH-B, sin ticket Jira)

| data-testid | Elemento HTML | POM | Locator | Status |
|---|---|---|---|---|
| `btn-genericsavetext` | `button` | `note_editor_page/EditorHeaderActions.ts` | `SAVE_BTN` | Validado |
| `dropdown-toggle-genericsavetext` | `button[dropdowntoggle]` | `note_editor_page/EditorHeaderActions.ts` | `DROPDOWN_SAVE_CONTAINER` | Validado |
| `dropdown-item-guardar-y-salir` | `div.dropdown-item` | `note_editor_page/EditorHeaderActions.ts` | `SAVE_AND_EXIT_OPT` | Validado |
| `dropdown-item-salir` | `div.dropdown-item` | `note_editor_page/EditorHeaderActions.ts` | `EXIT_WITHOUT_SAVING_OPT` | Validado |
| `btn-newnotepublishtext` | `button` | `note_editor_page/EditorHeaderActions.ts` | `PUBLISH_BTN` | Validado |
| `dropdown-toggle-newnotepublishtext` | `button[dropdowntoggle]` | `note_editor_page/EditorHeaderActions.ts` | `DROPDOWN_PUBLISH_CONTAINER` | Validado |
| `dropdown-item-publicar-y-salir` | `div.dropdown-item` | `note_editor_page/EditorHeaderActions.ts` | `PUBLISH_AND_EXIT_OPT` | Validado (era ROTO — testid correcto confirmado) |
| `dropdown-item-programar` | `div.dropdown-item` | `note_editor_page/EditorHeaderActions.ts` | `SCHEDULE_OPT` | Validado (era pendiente — testid correcto confirmado) |
| `btn-exit-note` | `a` | `note_editor_page/EditorHeaderActions.ts` | `BACK_BTN` | Validado |
| `btn-confirm-generic-saveexit-text` + `btn-calendar-confirm` | `app-cmsmedios-button` (wrapper) + `button` interno | `note_editor_page/EditorHeaderActions.ts` | `MODAL_BACK_SAVE_AND_EXIT_BTN` | Validado |
| `btn-cancel-newnote-get-out-anyway-text` + `btn-calendar-confirm` | `app-cmsmedios-button` (wrapper) + `button` interno | `note_editor_page/EditorHeaderActions.ts` | `MODAL_BACK_DISCARD_EXIT_BTN` | Validado |

> **Patrón modal buttons:** Los botones de modal usan selector compuesto: `[data-testid="<wrapper>"] button[data-testid="btn-calendar-confirm"]`. El testid `btn-calendar-confirm` es compartido entre ambos botones; el wrapper los discrimina. `dropdown-menu` es contenedor general sin locator propio en este POM.

#### Video Editor — EditorHeaderActions

| data-testid | Elemento HTML | POM | Locator | Status |
|---|---|---|---|---|
| `dropdown-action` (btn blanco) | `button.white-btn` | `video_editor_page/EditorHeaderActions.ts` | `SAVE_BTN` | Validado |
| `dropdown-action` (btn info) | `button.btn-info` | `video_editor_page/EditorHeaderActions.ts` | `PUBLISH_BTN` | Validado |
| `dropdown-item-guardar-y-salir` | `div` | `video_editor_page/EditorHeaderActions.ts` | `SAVE_AND_EXIT_OPT` | Validado |
| `dropdown-item-salir` | `div` | `video_editor_page/EditorHeaderActions.ts` | `EXIT_WITHOUT_SAVING_OPT` | Validado |

#### Video Editor — EditorInfoSection (12 testids)

| data-testid | Elemento HTML | POM | Locator | Status |
|---|---|---|---|---|
| `input-title` | `textarea/input` | `video_editor_page/EditorInfoSection.ts` | `TITLE` | Validado |
| `input-description` | `textarea` | `video_editor_page/EditorInfoSection.ts` | `DESCRIPTION` | Validado |
| `input-source` | `input` | `video_editor_page/EditorInfoSection.ts` | `SOURCE` | Validado |
| `input-author` | `input` | `video_editor_page/EditorInfoSection.ts` | `AUTHOR` | Validado |
| `input-url-friendly` | `input` | `video_editor_page/EditorInfoSection.ts` | `URL_FRIENDLY` | Validado |
| `input-create-date` | `input` | `video_editor_page/EditorInfoSection.ts` | `CREATE_DATE` | Validado |
| `btn-open-datepicker` | `button` | `video_editor_page/EditorInfoSection.ts` | `OPEN_DATEPICKER_BTN` | Validado |
| `timepicker-create-hour` + `input[placeholder="HH"]` | `input` | `video_editor_page/EditorInfoSection.ts` | `TIMEPICKER_HOURS` | Validado |
| `timepicker-create-hour` + `input[placeholder="MM"]` | `input` | `video_editor_page/EditorInfoSection.ts` | `TIMEPICKER_MINUTES` | Validado |
| `dropdown-classification` | `mat-select` | `video_editor_page/EditorInfoSection.ts` | `RATING_DROPDOWN` | Validado |
| `check-autoplay` + `button[role="switch"]` | `button` | `video_editor_page/EditorInfoSection.ts` | `AUTOPLAY_TOGGLE` | Validado |
| `check-mute` + `button[role="switch"]` | `button` | `video_editor_page/EditorInfoSection.ts` | `MUTE_TOGGLE` | Validado |
| `btn-close-info` | `button` | `video_editor_page/EditorInfoSection.ts` | `CLOSE_BTN` | Validado |

#### Image Editor — EditorHeaderActions

| data-testid | Elemento HTML | POM | Locator | Status |
|---|---|---|---|---|
| `dropdown-action` (btn blanco) | `button.white-btn` | `images_editor_page/EditorHeaderActions.ts` | `SAVE_BTN` | Validado |
| `dropdown-action` (btn info) | `button.btn-info` | `images_editor_page/EditorHeaderActions.ts` | `PUBLISH_BTN` | Validado |
| `dropdown-item-publicar-y-salir` | `div` | `images_editor_page/EditorHeaderActions.ts` | `SAVE_AND_EXIT_OPT` / `PUBLISH_AND_EXIT_OPT` | Validado |

#### Image Editor — EditorInfoSection (5 testids)

| data-testid | Elemento HTML | POM | Locator | Status |
|---|---|---|---|---|
| `input-description` | `textarea` | `images_editor_page/EditorInfoSection.ts` | `DESCRIPTION` | Validado |
| `input-source` | `input` | `images_editor_page/EditorInfoSection.ts` | `SOURCE` | Validado |
| `input-photographer` | `input` | `images_editor_page/EditorInfoSection.ts` | `PHOTOGRAPHER` | Validado |
| `btn-close-info` | `button` | `images_editor_page/EditorInfoSection.ts` | `CLOSE_BTN` | Validado |

#### Modales y misceláneos

| data-testid | Elemento HTML | POM | Locator | Status |
|---|---|---|---|---|
| `btn-calendar-confirm` | `button` | (modal global — sin POM dedicado) | — | Confirmado |

## Sesión 2026-04-16 — HTML manual (sin ticket Jira)
**Área:** Editor Header — Videos e Imágenes (EditorHeaderActions)
**Fuente:** HTML inspeccionado por el usuario (F12 / outerHTML)
**Estado:** Todos los items validados — ver §Confirmados arriba (Video Editor / Image Editor)

| data-testid | POM | Locator | Status validación |
|---|---|---|---|
| btn-save | videos_page/video_editor_page/EditorHeaderActions.ts | SAVE_BTN | Validado 2026-04-16 |
| btn-publish | videos_page/video_editor_page/EditorHeaderActions.ts | PUBLISH_BTN | Validado 2026-04-16 |
| dropdown-toggle-save | videos_page/video_editor_page/EditorHeaderActions.ts | DROPDOWN_SAVE_CONTAINER | Validado 2026-04-16 |
| dropdown-toggle-publish | videos_page/video_editor_page/EditorHeaderActions.ts | DROPDOWN_PUBLISH_CONTAINER | Validado 2026-04-16 |
| dropdown-item-guardar-y-salir | videos_page/video_editor_page/EditorHeaderActions.ts | SAVE_AND_EXIT_OPT | Validado 2026-04-16 |
| dropdown-item-salir | videos_page/video_editor_page/EditorHeaderActions.ts | EXIT_WITHOUT_SAVING_OPT | Validado 2026-04-16 |
| dropdown-item-publicar-y-salir | videos_page/video_editor_page/EditorHeaderActions.ts | PUBLISH_AND_EXIT_OPT | Validado 2026-04-16 |
| btn-save | images_pages/images_editor_page/EditorHeaderActions.ts | SAVE_BTN | Validado 2026-04-16 |
| btn-publish | images_pages/images_editor_page/EditorHeaderActions.ts | PUBLISH_BTN | Validado 2026-04-16 |
| dropdown-toggle-save | images_pages/images_editor_page/EditorHeaderActions.ts | DROPDOWN_SAVE_CONTAINER | Validado 2026-04-16 |
| dropdown-toggle-publish | images_pages/images_editor_page/EditorHeaderActions.ts | DROPDOWN_PUBLISH_CONTAINER | Validado 2026-04-16 |
| dropdown-item-publicar-y-salir | images_pages/images_editor_page/EditorHeaderActions.ts | PUBLISH_AND_EXIT_OPT | Validado 2026-04-16 |

**Bugs corregidos en esta sesión:**
- Videos EditorHeaderActions: PUBLISH_AND_EXIT_OPT usaba `dropdown-item-guardar-y-salir` (testid de Save) — corregido a `dropdown-item-publicar-y-salir`
- Images EditorHeaderActions: SAVE_AND_EXIT_OPT y EXIT_WITHOUT_SAVING_OPT usaban `dropdown-item-publicar-y-salir` (testid de Publish) — corregidos

## Sin ticket — inspección manual 2026-04-16 (sesión 2)
**Área:** FooterActions (tabla global) · UploadVideoBtn (videos_page)
**Fuente:** HTML pegado directamente en el chat (PATH-B, sin ticket Jira)

### Confirmados ✅

#### FooterActions — botones del footer de tabla

| data-testid | Elemento HTML | POM | Locator | Status |
|---|---|---|---|---|
| `btn-tablepublishtext` | `button.btn-main.btn-info` | `FooterActions.ts` | `FOOTER_PUBLISH_BTN` | Aplicado |
| `dropdown-toggle-tablepublishtext` | `button.dropdown-toggle` | `FooterActions.ts` | `FOOTER_DROPDOWN_BTN` | Aplicado |
| `dropdown-item-programar` | `div.dropdown-item` | `FooterActions.ts` | `FOOTER_DROPDOWN_SCHEDULE` | Aplicado (reemplazó XPath con mat-icon) |
| `dropdown-item-publicar` | `div.dropdown-item` | `FooterActions.ts` | `FOOTER_DROPDOWN_PUBLISH` | Aplicado (locator + acción PUBLICAR nuevos) |
| `dropdown-item-exportar` | `div.dropdown-item` | `FooterActions.ts` | `FOOTER_DROPDOWN_EXPORT` | Aplicado (locator + acción EXPORT nuevos, sin lógica post-click aún) |

> **Locators previos reemplazados:**
> - `FOOTER_PUBLISH_BTN`: era `data-testid="dropdown-action"` → ahora `btn-tablepublishtext`
> - `FOOTER_DROPDOWN_BTN`: era `data-testid="dropdown-actions"` → ahora `dropdown-toggle-tablepublishtext`
> - `FOOTER_DROPDOWN_SCHEDULE`: era XPath `//div[@data-testid='dropdown-item']//mat-icon[contains(text(), 'access_alarm')]` → ahora CSS `div[data-testid="dropdown-item-programar"]`

#### UploadVideoBtn — dropdown de tipos de video

| data-testid | Elemento HTML | POM | Locator | Status |
|---|---|---|---|---|
| `dropdown-item-embedded` | `div.dropdown-item` | `UploadVideoBtn.ts` | `LABELS_OF_VIDEO_TYPES` (vía `^=`) | Aplicado |
| `dropdown-item-native` | `div.dropdown-item` | `UploadVideoBtn.ts` | `LABELS_OF_VIDEO_TYPES` (vía `^=`) | Aplicado |
| `dropdown-item-youtube` | `div.dropdown-item` | `UploadVideoBtn.ts` | `LABELS_OF_VIDEO_TYPES` (vía `^=`) | Aplicado |
| `dropdown-item-youtube_short` | `div.dropdown-item` | `UploadVideoBtn.ts` | `LABELS_OF_VIDEO_TYPES` (vía `^=`) | Aplicado |

> **Locator previo reemplazado:**
> - `LABELS_OF_VIDEO_TYPES`: era `div[data-testid="dropdown-item"] label` (exacto) → ahora `div[data-testid^="dropdown-item-"] label` (starts-with). La lógica de matcheo por texto del VIDEO_TYPE_MAP se mantiene intacta.

> **Sin cambio:** `DROPDOWN_COMBO_MODAL` (`data-testid="dropdown-menu"`) ya estaba correcto.
> **Sin data-testid:** El botón Upload (`button.btn-create-note`) no tiene data-testid en el DOM — se mantiene selector por clase.

### Fallbacks 🔄
*(vacío)*

---

### Pendientes ⏸ — requieren inspección manual del DOM

| Campo | POM | Locator actual | Por qué no se resolvió | Instrucción de inspección |
|---|---|---|---|---|
| Modal recarga CMS (overlay/container) | (sin POM dedicado) | CSS class compartida | Solo se leyó el botón, no el modal padre | Inspeccionar el componente padre de `btn-calendar-confirm` |
| `new-content-option-attachment` | `MainEditorPage.ts` (verificar) | — | No mapeado | Inspeccionar en editor de nota |
| `new-content-option-keyboard_voice` | `MainEditorPage.ts` (verificar) | — | No mapeado | Inspeccionar en editor de nota |
| `button-add-author`, `dropdown-add-author`, `dropdown-item-agregar-autor` | `note_editor_page/EditorHeaderActions.ts` (verificar) | — | No mapeado | Inspeccionar flujo de agregar autor en editor de nota |

---

### Fallbacks 🔄

> Locators que fallaron validación y se usó un selector alternativo.

*(vacío — completar en FASE 5 de cada ejecución)*

---

## Patrones de selectores complejos

Wrappers Angular u otros elementos que requieren combinar dos selectores para obtener el elemento interactuable real.
Documentar aquí para no reinferirlos en futuras ejecuciones.

### `app-cmsmedios-button` — wrapper Angular con botón interno

**Descripción:** Componente Angular custom que envuelve un `<button>` interno.
El `data-testid` puede estar en el wrapper (`app-cmsmedios-button[data-testid="..."]`)
o en el `<button>` interno (`button[data-testid="..."]`) — o en ambos.

**Selector correcto:**
```css
/* Si el testid está en el <button> interno */
app-cmsmedios-button [data-testid="btn-calendar-confirm"]

/* Si el testid está en el wrapper */
app-cmsmedios-button[data-testid="btn-calendar-confirm"]
```

**Regla:** leer el HTML completo del componente antes de asumir en qué elemento vive el testid.
Si el `<button>` interno tiene su propio `data-testid`, usar ese — es el elemento interactuable.

**Caso validado (2026-04-16):**
- `btn-calendar-confirm` vive en el `<button>` interno del wrapper
- Selector aplicado: `app-cmsmedios-button [data-testid="btn-calendar-confirm"]` (espacio = descendant combinator)

---

## Template para nuevos tickets

Copiar al procesar un ticket nuevo:

```markdown
## NAA-XXXX — {título del ticket}

**Fecha procesado:** YYYY-MM-DD
**Assignee front:** {nombre}
**Commits front:** {hashes}

### Confirmados ✅
| data-testid | Elemento | POM | Locator | Status |
|---|---|---|---|---|

### Pendientes ⏸
| Campo | POM | Locator actual | Por qué no se resolvió | Instrucción |
|---|---|---|---|---|

### Fallbacks 🔄
*(vacío)*
```

### Template para entradas sin ticket key (PATH-B sin key)

Usar cuando el usuario pegó HTML directo y no hay ticket de referencia:

```markdown
## Sin ticket — inspección manual {YYYY-MM-DD}

**Fuente:** HTML pegado directamente en el chat
**Área:** {área inferida del HTML o indicada por el usuario}

### Confirmados ✅
| data-testid | Elemento | POM | Locator | Status |
|---|---|---|---|---|

### Pendientes ⏸
| Campo | POM | Locator actual | Por qué no se resolvió | Instrucción |
|---|---|---|---|---|

### Fallbacks 🔄
*(vacío)*
```