---
source: src/pages/videos_page/video_editor_page/ · src/pages/images_pages/images_editor_page/
last-updated: 2026-04-16
---

# Pages: Video & Image Editors

Primera documentación de los editores de video e imagen. Cubiertos por primera vez en NAA-4324.

---

## Estructura general

Ambos editores comparten la misma arquitectura de dos zonas:

1. **Header** — botones de acción (Guardar / Publicar / Volver) → `EditorHeaderActions.ts`
2. **Panel Info lateral** — metadatos del asset → `EditorInfoSection.ts`

El panel Info **se abre automáticamente** al entrar al editor — no hay botón para abrirlo. Solo existe `btn-close-info` para cerrarlo. Ambos editores comparten este comportamiento.

---

## Editor de Videos (`src/pages/videos_page/video_editor_page/`)

### Header — `EditorHeaderActions.ts`

Tipo exportado: `VideoExitAction`

| Acción | Selector | Testid / CSS |
|---|---|---|
| Guardar (botón principal) | `SAVE_BTN` | `[data-testid="btn-save"]` |
| Publicar (botón principal) | `PUBLISH_BTN` | `[data-testid="btn-publish"]` |
| Abrir dropdown Guardar | `DROPDOWN_SAVE_CONTAINER` | `[data-testid="dropdown-toggle-save"]` |
| Abrir dropdown Publicar | `DROPDOWN_PUBLISH_CONTAINER` | `[data-testid="dropdown-toggle-publish"]` |
| Opción "Guardar y Salir" | `SAVE_AND_EXIT_OPT` | `[data-testid="dropdown-item-guardar-y-salir"]` |
| Opción "Salir" | `EXIT_WITHOUT_SAVING_OPT` | `[data-testid="dropdown-item-salir"]` |
| Opción "Publicar y Salir" | `PUBLISH_AND_EXIT_OPT` | `[data-testid="dropdown-item-publicar-y-salir"]` |
| Volver | `BACK_BTN` | `a.navbar-brand` |
| Modal Guardar y Salir (back) | `MODAL_BACK_SAVE_AND_EXIT_BTN` | `[data-testid="btn-ok-confirmModal"] button` |
| Modal Descartar (back) | `MODAL_BACK_DISCARD_EXIT_BTN` | `[data-testid="btn-cancel"] button` |

Señal de página cargada: `div.info-image-container` (locator `INFO_SECTION`).

### Panel Info — `EditorInfoSection.ts`

El panel contiene metadatos del video. Todos los campos tienen `data-testid`.

| Campo | Testid | Método POM | Notas |
|---|---|---|---|
| Título | `input-title` | `fillTitle(value)` | |
| Descripción | `input-description` | `fillDescription(value)` | |
| Fuente | `input-source` | `fillSource(value)` | |
| Autor | `input-author` | `fillAuthor(value)` | |
| URL amigable | `input-url-friendly` | — (solo lectura en práctica) | |
| Fecha modificación | `input-create-date` | `fillDate(date)` | Formato DD/MM/YYYY |
| Abrir datepicker | `btn-open-datepicker` | `openDatepicker()` | **Condicional** — solo aparece en videos nativos/subidos directamente. Videos YouTube/embed NO muestran este campo |
| Hora (HH) | `timepicker-create-hour` + `input[placeholder="HH"]` | `fillTime(hh, mm)` | Ver Patrón C en conventions.md |
| Minutos (MM) | `timepicker-create-hour` + `input[placeholder="MM"]` | `fillTime(hh, mm)` | Ver Patrón C en conventions.md |
| Rating / Clasificación | `dropdown-classification` | `openRatingDropdown()` | `mat-select` — las opciones aparecen en overlay global (ver Patrón B) |
| Autoplay toggle | `check-autoplay` + `button[role="switch"]` | `clickAutoplay()` | `mat-slide-toggle` — ver Patrón A en conventions.md |
| Mute toggle | `check-mute` + `button[role="switch"]` | `clickMute()` | `mat-slide-toggle` — ver Patrón A en conventions.md |
| Tags | `input.input-tags-values` (sin testid) | `addTag(tag)` | Confirmar con `\n` |
| Cerrar panel | `btn-close-info` | `close()` | Compartido con editor de imagen |

**Testids confirmados funcionales en master (2026-04-16):**
`input-title`, `input-description`, `input-source`, `input-author`, `dropdown-classification`, `check-autoplay`, `check-mute`, `btn-close-info`.

---

## Editor de Imágenes (`src/pages/images_pages/images_editor_page/`)

### Header — `EditorHeaderActions.ts`

Tipo exportado: `ImageExitAction`

Misma estructura visual que el editor de video, pero **sin** la opción "Salir sin guardar" — solo existe "Publicar y Salir".

| Acción | Selector | Testid / CSS |
|---|---|---|
| Guardar (botón principal) | `SAVE_BTN` | `[data-testid="btn-save"]` |
| Publicar (botón principal) | `PUBLISH_BTN` | `[data-testid="btn-publish"]` |
| Abrir dropdown Guardar | `DROPDOWN_SAVE_CONTAINER` | `[data-testid="dropdown-toggle-save"]` |
| Abrir dropdown Publicar | `DROPDOWN_PUBLISH_CONTAINER` | `[data-testid="dropdown-toggle-publish"]` |
| Opción "Guardar y Salir" | `SAVE_AND_EXIT_OPT` | `[data-testid="dropdown-item-guardar-y-salir"]` |
| Opción "Publicar y Salir" | `PUBLISH_AND_EXIT_OPT` | `[data-testid="dropdown-item-publicar-y-salir"]` |
| Opción "Salir" | `EXIT_WITHOUT_SAVING_OPT` | `[data-testid="dropdown-item-salir"]` |
| Volver | `BACK_BTN` | `a.navbar-brand` |
| Modal Guardar y Salir (back) | `MODAL_BACK_SAVE_AND_EXIT_BTN` | `[data-testid="btn-ok-confirmModal"] button` |
| Modal Descartar (back) | `MODAL_BACK_DISCARD_EXIT_BTN` | `[data-testid="btn-cancel"] button` |

Señal de página cargada: `div.info-image-container` (mismo locator que video).

### Panel Info — `EditorInfoSection.ts`

El panel de imagen expone menos campos que el de video. **No tiene** `input-title`, fecha/hora, rating, autoplay ni mute.

| Campo | Testid | Método POM | Notas |
|---|---|---|---|
| Descripción | `input-description` | `fillDescription(value)` | |
| Fuente | `input-source` | `fillSource(value)` | |
| Fotógrafo / Autor | `input-photographer` | `fillPhotographer(value)` | Distinto de `input-author` en video |
| Tags | `input.input-tags-values` (sin testid) | `addTag(tag)` | Confirmar con `\n` |
| Cerrar panel | `btn-close-info` | `close()` | Compartido con editor de video |

---

## Diferencias clave entre editores

| Característica | Editor Video | Editor Imagen |
|---|---|---|
| Tipo de acción exportado | `VideoExitAction` | `ImageExitAction` |
| Tiene `input-title` | ✅ | ❌ |
| Campo de autor | `input-author` | `input-photographer` |
| Fecha/Hora/Rating | ✅ | ❌ |
| Toggles Autoplay/Mute | ✅ | ❌ |
| Opción "Salir sin guardar" | ✅ | ❌ (solo "Publicar y Salir") |
| Componente Angular (ng-content) | `_ngcontent-ng-c2282007382` | `_ngcontent-ng-c3833517467` |
| Locator señal de carga | `div.info-image-container` | `div.info-image-container` (igual) |

---

## Patrones Angular Material involucrados

Los editores de video hacen uso intensivo de componentes AM que requieren técnicas especiales:

- **`mat-slide-toggle`** (Autoplay, Mute) → ver [Patrón A](conventions.md#patrón-a--mat-slide-toggle-autoplay--mute)
- **`mat-select`** (Rating) → ver [Patrón B](conventions.md#patrón-b--mat-select-rating--clasificación)
- **timepicker Angular Bootstrap** (HH/MM) → ver [Patrón C](conventions.md#patrón-c--timepicker-de-angular-bootstrap)

---

## Flujo operativo de inspección de campos faltantes

Cuando una captura PNG no permite leer un testid (imagen pequeña o fuera de foco), la alternativa más eficiente es que el usuario pegue el HTML completo del panel desde DevTools. En una sola respuesta se pueden resolver todos los campos pendientes de una zona.

Este patrón está institucionalizado en el SKILL.md de `update-testids` (checkpoint de campos manuales).
