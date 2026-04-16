---
source: src/pages/FooterActions.ts · src/pages/SidebarAndHeaderSection.ts · src/pages/HeaderNewContentBtn.ts
last-updated: 2026-04-16
---

# Pages: Shared Components

## Propósito

Sub-componentes compartidos usados por múltiples Maestros. `SidebarAndHeader` maneja la navegación global; `FooterActions` maneja la publicación masiva; `HeaderNewContentBtn` encapsula el botón "+" del header y su dropdown de creación de contenido.

---

## API pública / Métodos principales

### `SidebarAndHeader`

| Método | Parámetros | Qué hace |
|--------|------------|----------|
| `goToComponent(option)` | `option: SidebarOption` | Navega a la sección del sidebar |
| `clickOnMultimediaFileBtn(action)` | `action: 'IMAGES' \| 'VIDEOS'` | Abre el menú colapsable Multimedia, espera visibilidad del submenú con `waitVisible()`, y hace click en la sub-sección. Toda la secuencia está dentro de `retry()`; la config interna usa `supressRetry: true` para evitar reintentos anidados. |

### `FooterActions`

| Método | Parámetros | Qué hace |
|--------|------------|----------|
| `clickFooterAction(action)` | `action: FooterActionType` | Ejecuta la acción de footer (publica o programa) |
| `isPublishBtnEnabled()` | — | Verifica si el botón de publicación está habilitado |

---

## Navegación: directa vs multimedia

`goToComponent` usa dos estrategias según el key recibido:

- **Navegación directa** — click inmediato en el enlace del sidebar. Aplica a: `COMMENTS`, `PLANNING`, `NEWS`, `TAGS`.
- **Navegación multimedia** — delega a `clickOnMultimediaFileBtn`, que ejecuta la secuencia completa dentro de `retry()`: click en el menú colapsable `a[title="Multimedia"]`, espera de visibilidad del submenú via `waitVisible()`, y click en la sub-sección. La config interna usa `supressRetry: true` para evitar reintentos anidados dentro del retry externo. Aplica a: `IMAGES`, `VIDEOS`.

> **Warning:** `'POSTS'` NO es un key válido de `SidebarOption`. Para navegar a noticias usar `'NEWS'`.

### Keys válidos de `SidebarOption`

| Key | Tipo de navegación | Locator destino |
|-----|--------------------|-----------------|
| `COMMENTS` | Directa | `a[title="Comentarios"]` |
| `PLANNING` | Directa | `a[title="Planning"]` |
| `NEWS` | Directa | `a[title="Noticias"]` |
| `TAGS` | Directa | `a[title="Tags"]` |
| `IMAGES` | Multimedia (colapsable) | `a[title="Imagenes"]` |
| `VIDEOS` | Multimedia (colapsable) | `a[title="Videos"]` |

---

## Tipos exportados

### `SidebarOption`

```typescript
// Derivado de SidebarAndHeader.SIDEBAR_MAP
type SidebarOption = 'COMMENTS' | 'PLANNING' | 'NEWS' | 'TAGS' | 'IMAGES' | 'VIDEOS'
```

### `FooterActionType`

```typescript
// Derivado de FooterActions.FOOTER_ACTIONS
type FooterActionType = 'PUBLISH_ONLY' | 'SCHEDULE' | 'PUBLICAR' | 'EXPORT'
```

| Key | Acción | testid |
|-----|--------|--------|
| `PUBLISH_ONLY` | Publica directamente | `btn-tablepublishtext` |
| `SCHEDULE` | Programa publicación (dropdown) | `dropdown-item-programar` |
| `PUBLICAR` | Publicar desde dropdown | `dropdown-item-publicar` |
| `EXPORT` | Exportar desde dropdown | `dropdown-item-exportar` |

Locators adicionales de `FooterActions`: `FOOTER_DROPDOWN_BTN` → `dropdown-toggle-tablepublishtext`.

---

## Dependencias internas

**`FooterActions`** orquesta internamente `PublishModal` — el PO de footer no necesita que el test interactúe con el modal directamente.

---

## Quién los usa

| PO | Usa `SidebarAndHeader` | Usa `FooterActions` |
|----|------------------------|---------------------|
| `MainPostPage` | ✓ (navegación a secciones) | ✓ (publicación masiva) |
| `MainVideoPage` | ✓ | ✓ |
| `MainImagePage` | ✓ | — |
| `MainTagsPage` | ✓ | — (usa `TagFooterActions` propio) |

---

## Notas de uso

```typescript
// Navegación a la sección de videos
await sidebarSection.goToComponent('VIDEOS');

// Publicar items seleccionados en footer
await footerActions.clickFooterAction('PUBLISH_ONLY');

// Verificar si el botón de publicar está habilitado antes de intentar
const enabled = await footerActions.isPublishBtnEnabled();
```

`FooterActions` llama internamente a `PublishModal.clickOnPublishBtn()` tras `clickFooterAction`. El test no necesita instanciar `PublishModal` separadamente cuando usa `FooterActions`.

---

## `HeaderNewContentBtn`

Sub-componente que encapsula el botón `+` del header (`btn-add-header`) y el dropdown `app-new-content-dropdown`.

### API pública

| Método | Parámetros | Qué hace |
|--------|------------|----------|
| `selectNewContent(type)` | `type: HeaderNewContentType` | Abre el dropdown (si no está abierto) y hace click en la opción indicada |
| `openDropdown()` | — | Abre el dropdown si no está abierto; verifica con `isDropdownOpen` primero |
| `isDropdownOpen()` | — | Lee `aria-expanded` del botón; retorna `boolean` |

### Tipo exportado: `HeaderNewContentType`

Derivado de `HeaderNewContentBtn.NEW_CONTENT_TYPE_MAP`. Grupos:

| Key | Sección | Notas |
|-----|---------|-------|
| `NEW_POST` | Frequent | — |
| `NEW_TRIVIA` | Frequent | — |
| `NEW_POLL` | Frequent | — |
| `NEW_LISTICLE` | Frequent | — |
| `NEW_TAG` | Others | — |
| `NEW_UCG` | Others | hidden por configuración de tenant |
| `NEW_GAMECAST` | Others | — |
| `NEW_CHRONICLE` | Others | hidden por configuración de tenant |
| `NEW_LIVEBLOG` | Others | — |
| `NEW_AI_NEWS` | Others | — |
| `NEW_AI_LISTICLE` | Others | — |
| `NEW_VIDEO_NATIVE` | Videos | testid con puntos literales |
| `NEW_VIDEO_EMBEDDED` | Videos | testid con puntos literales |
| `NEW_VIDEO_YOUTUBE` | Videos | testid con puntos literales |

### Notas de uso

```typescript
const header = new HeaderNewContentBtn(driver, opts);
await header.selectNewContent('NEW_POST');
```

Localiza el ítem por `data-testid` directamente — sin iterar texto visible. Las opciones `NEW_UCG` y `NEW_CHRONICLE` pueden no estar visibles dependiendo de la configuración del tenant.
