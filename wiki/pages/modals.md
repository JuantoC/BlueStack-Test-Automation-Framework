---
source: src/pages/modals/PublishModal.ts · src/pages/modals/CKEditorImageModal.ts · src/core/helpers/handleUpdateModal.ts
last-updated: 2026-04-16
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

---

## System Interrupts — distinción arquitectural

`src/pages/modals/` es para **modales de flujo de usuario** (el test los dispara intencionalmente).

Los **system interrupts** — modales que el ambiente puede inyectar en cualquier momento sin que el test lo provoque — van en `src/core/helpers/`, no en `src/pages/modals/`.

### `handleUpdateModal` — Modal de actualización del ambiente

Cuando el ambiente pre-productivo se despliega, al ingresar post-login aparece un modal Angular CDK que cubre todo el viewport. Cualquier `clickSafe()` que ocurra mientras el modal está activo recibe `ElementClickInterceptedError`.

**Integración:** `clickSafe` lo invoca automáticamente como fallback ante `ElementClickInterceptedError`. Los tests no llaman a `handleUpdateModal` directamente.

**Selectores canónicos:**

| Elemento | Selector |
|----------|----------|
| Overlay (pane) | `[data-testid="overlay-update"]` |
| Backdrop | `[data-testid="backdrop-update"]` |
| Contenedor del modal | `[data-testid="modal-update"]` |
| Botón de recarga | `button[data-testid="btn-calendar-confirm"]` |

**Flujo de recuperación:**
```
ElementClickInterceptedError
  → handleUpdateModal detecta [data-testid="overlay-update"]
  → click en btn-calendar-confirm
  → espera stalenessOf(overlay) (10s timeout)
  → lanza StaleElementReferenceError
  → retry() re-busca el elemento en el DOM recargado y reintenta el click
```

**Regla:** si aparece un nuevo modal de sistema (no iniciado por el usuario), el handler va en `src/core/helpers/`, no en `src/pages/modals/`.
