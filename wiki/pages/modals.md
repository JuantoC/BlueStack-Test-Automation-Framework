---
source: src/pages/modals/PublishModal.ts · src/pages/modals/CKEditorImageModal.ts
last-updated: 2026-04-13
---

# Pages: Modals

## Propósito

Modales compartidos por múltiples flujos del CMS. `PublishModal` confirma publicación; `CKEditorImageModal` selecciona imágenes dentro del editor CKEditor.

---

## API pública / Métodos principales

### `PublishModal`

| Método | Parámetros | Qué hace |
|--------|------------|----------|
| `clickOnPublishBtn()` | — | Hace clic en el botón de confirmar publicación del modal |

### `CKEditorImageModal`

| Método | Parámetros | Qué hace |
|--------|------------|----------|
| `selectImage(index)` | `index: number` | Selecciona la imagen en la posición dada dentro del modal |

---

## Dependencias internas

**`PublishModal`** es usado internamente por:
- `FooterActions` — tras `clickFooterAction()`
- `EditorFooterBtn` — tras confirmar publicación desde el editor

Los tests **no instancian `PublishModal` directamente** cuando usan los Maestros — los Maestros ya lo orquestan internamente.

**`CKEditorImageModal`** es usado por `EditorImagesSection` cuando se selecciona una imagen desde el CKEditor del editor de notas.

---

## Notas de uso

- `PublishModal` solo se instancia directamente en tests que testean el flujo de publicación de forma atómica (inusual).
- `CKEditorImageModal.selectImage(0)` selecciona la primera imagen disponible. Índice 0-based.
- Ambos modales son sub-componentes — no usan `step()`.
