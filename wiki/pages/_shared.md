---
source: src/pages/FooterActions.ts · src/pages/SidebarAndHeaderSection.ts
last-updated: 2026-04-13
---

# Pages: Shared Components

## Propósito

Sub-componentes compartidos usados por múltiples Maestros. `SidebarAndHeaderSection` maneja la navegación global; `FooterActions` maneja la publicación masiva.

---

## API pública / Métodos principales

### `SidebarAndHeaderSection`

| Método | Parámetros | Qué hace |
|--------|------------|----------|
| `goToComponent(option)` | `option: SidebarOption` | Navega a la sección del sidebar |
| `clickOnMultimediaFileBtn(action)` | `action: string` | Abre el submenú de multimedia y selecciona la acción |

### `FooterActions`

| Método | Parámetros | Qué hace |
|--------|------------|----------|
| `clickFooterAction(action)` | `action: FooterActionType` | Ejecuta la acción de footer (publica o programa) |
| `isPublishBtnEnabled()` | — | Verifica si el botón de publicación está habilitado |

---

## Tipos exportados

### `SidebarOption`

```typescript
// Derivado de SidebarAndHeaderSection.SIDEBAR_MAP
type SidebarOption = 'COMMENTS' | 'PLANNING' | 'NEWS' | 'TAGS' | 'IMAGES' | 'VIDEOS'
```

### `FooterActionType`

```typescript
// Derivado de FooterActions.FOOTER_ACTIONS
type FooterActionType = 'PUBLISH_ONLY' | 'SCHEDULE'
```

---

## Dependencias internas

**`FooterActions`** orquesta internamente `PublishModal` — el PO de footer no necesita que el test interactúe con el modal directamente.

---

## Quién los usa

| PO | Usa `SidebarAndHeaderSection` | Usa `FooterActions` |
|----|------------------------------|---------------------|
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
