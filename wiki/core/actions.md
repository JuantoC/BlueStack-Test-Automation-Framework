---
source: src/core/actions/clickSafe.ts · waitFind.ts · waitVisible.ts · waitEnabled.ts · writeSafe.ts · assertValueEquals.ts
last-updated: 2026-04-13
---

# Core: Actions

## Propósito

Las 6 acciones atómicas del framework. Son los únicos puntos de interacción directa con el DOM de Selenium. Todos los Page Objects las usan a través de `clickSafe` y `writeSafe`; nunca llaman a `driver.findElement()` directamente.

---

## API pública / Métodos principales

| Función | Firma | Qué hace |
|---------|-------|----------|
| `clickSafe` | `(driver, ID: Locator \| WebElement, opts?) => Promise<WebElement>` | Clic resistente a flakiness: find → waitClickable → click |
| `writeSafe` | `(driver, ID: Locator \| WebElement, text: string, opts?) => Promise<WebElement>` | Escritura con verificación: click → detecta contenteditable → escribe → assertValueEquals |
| `waitFind` | `(driver, locator: Locator, opts?) => Promise<WebElement>` | Localiza elemento en DOM con retry |
| `waitVisible` | `(driver, element: WebElement, opts?) => Promise<WebElement>` | Valida visibilidad; recupera con scroll → hover si falla |
| `waitEnabled` | `(driver, element: WebElement, opts?) => Promise<WebElement>` | Verifica que el elemento no esté `disabled` |
| `assertValueEquals` | `(element: WebElement, expected: string, opts?) => Promise<void>` | Valida texto visible/valor; genera diff detallado en error |

---

## Cuándo usar cada una

**`clickSafe`** — para cualquier clic en el framework. Acepta `Locator` (busca en DOM) o `WebElement` ya localizado (omite búsqueda). Maneja `ElementClickInterceptedError` (toast bloqueante).

**`writeSafe`** — para escribir en inputs, textareas y contenteditable (CKEditor). Detecta automáticamente el tipo del elemento y elige la estrategia (`writeToStandard` vs `writeToEditable`). Verifica escritura con `assertValueEquals`.

**`waitFind`** — cuando solo tenés un `Locator` y necesitás el `WebElement`. Es el punto de entrada antes de operaciones que requieren el elemento ya localizado.

**`waitVisible`** — para confirmar que un elemento ya localizado es visible. Si falla por timeout, aplica: scroll → hover sobre ancestro (Angular Material).

**`waitEnabled`** — último paso de validación antes de interactuar. Usado por `waitClickable` internamente.

**`assertValueEquals`** — para verificar que lo escrito quedó en el campo. Clasifica el error como `RETRIABLE` para permitir polling. Normaliza comillas tipográficas y elipses en contenteditable.

---

## Pipeline interno de `clickSafe`

```
clickSafe(driver, ID, opts)
  ├─ si ID es Locator → waitFind(driver, ID, internalOpts)
  ├─ waitClickable(driver, element, internalOpts)
  │    ├─ waitVisible(driver, element, opts)
  │    └─ waitEnabled(driver, element, opts)
  └─ element.click()
```

Todo está envuelto en `retry()` con `supressRetry: true` para los llamados internos (evita reintentos anidados).

---

## Pipeline interno de `writeSafe`

```
writeSafe(driver, ID, text, opts)
  ├─ clickSafe(driver, ID, internalOpts)   ← gana foco
  ├─ isContentEditable(element)
  │    ├─ true  → writeToEditable(element, text)
  │    └─ false → writeToStandard(element, text)
  └─ assertValueEquals(element, text, internalOpts)
```

---

## Notas de uso

- Todos aceptan `opts: RetryOptions = {}`. Si omitís `opts`, usan `DefaultConfig`.
- Agregar siempre `label` en opts desde el PO para trazabilidad: `{ ...this.config }` ya lo incluye.
- `assertValueEquals` normaliza: comillas tipográficas (`"` → `"`), elipsis (`…` → `...`), saltos de línea Windows.
- Si `expected` termina en `\n` y el elemento no es contenteditable, `assertValueEquals` lo omite (textarea con trailing newline).
