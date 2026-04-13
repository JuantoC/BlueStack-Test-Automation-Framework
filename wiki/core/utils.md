---
source: src/core/utils/ (8 archivos) · src/core/helpers/ (6 archivos)
last-updated: 2026-04-13
---

# Core: Utils & Helpers

## Propósito

Utilidades de soporte usadas por toda la capa core y los Page Objects. `utils/` expone APIs públicas; `helpers/` son primitivas DOM de bajo nivel usadas solo por `actions/`.

---

## API pública / Métodos principales (utils/)

| Función / Export | Archivo | Qué hace |
|-----------------|---------|----------|
| `logger` (default) | `logger.ts` | Instancia Winston compartida del framework |
| `addSessionTransport(label)` | `logger.ts` | Crea log de archivo por sesión; retorna transport para remover |
| `stackLabel(parent?, current)` | `stackLabel.ts` | Construye breadcrumb `"A > B > C"` sin duplicados |
| `getErrorMessage(error)` | `errorUtils.ts` | Extrae `.message` de forma segura con `error: unknown` |
| `calcBackoff(attempt, init, factor, max)` | `backOff.ts` | Calcula delay exponencial con cap |
| `sleep(ms)` | `backOff.ts` | Pausa asíncrona |
| `AdminRoutes` | `routes.ts` | Constantes de paths de admin |
| `postUrl(base, id, label?)` | `routes.ts` | URL de un post específico |
| `joinUrl(base, path, label?)` | `routes.ts` | Une base + path sin barras dobles |
| `getAuthUrl(baseURL, user, pass)` | `getAuthURL.ts` | URL con HTTP Basic Auth embebido |
| `checkConsoleErrors(driver)` | `browserLogs.ts` | Lee y logea errores de consola del browser |
| `back(driver, opts?)` | `browserHistory.ts` | Navega hacia atrás con logging |
| `forward(driver, opts?)` | `browserHistory.ts` | Navega hacia adelante con logging |

---

## `logger` — Winston

```typescript
import logger from "../../core/utils/logger.js";

// Uso correcto — siempre con { label }
logger.info("Mensaje informativo", { label: this.config.label });
logger.error("Error en método", { label: this.config.label, error: getErrorMessage(err) });
logger.debug("Debug info", { label: this.config.label });
logger.warn("Advertencia", { label: this.config.label });
```

**Configuración:**
- Archivo rotativo: `logs/application-YYYY-MM-DD.log` (máx 3 días, comprimido)
- Consola: nivel `info` con colores y formato `timestamp level: [label] message`
- Por sesión: `session-<label>.log` (nivel debug, archivo plano)

**Regla obligatoria:** siempre pasar `{ label: this.config.label }` en el segundo argumento. Sin `label`, los logs no son trazables.

---

## `stackLabel(parent?, current)` — trazabilidad de jerarquía

```typescript
stackLabel(undefined, "MainPostPage")        // → "MainPostPage"
stackLabel("MainPostPage", "PostTable")      // → "MainPostPage > PostTable"
stackLabel("A > B", "B")                     // → "A > B"  (evita duplicados adyacentes)
stackLabel("A > B", "C")                     // → "A > B > C"
```

Usado por `resolveRetryConfig` para construir el breadcrumb de trazabilidad en cada constructor.

---

## `getErrorMessage(error)` — extracción segura

```typescript
function getErrorMessage(error: unknown): string
// error instanceof Error → error.message
// otro tipo → String(error)
```

Reemplaza `(error as any).message` en todos los `catch` con `error: unknown`.

---

## `AdminRoutes` — constantes de navegación

```typescript
const AdminRoutes = {
  POSTS:    "/admin/posts",
  COMMENTS: "/admin/comments",
  IMAGES:   "/admin/images",
  PROFILE:  "/admin/user_profile",
} as const;
```

---

## Helpers de bajo nivel (helpers/)

Usados internamente por `actions/`. Los POs no los llaman directamente.

| Helper | Qué hace |
|--------|----------|
| `waitClickable(driver, element, opts)` | Encadena `waitVisible` + `waitEnabled` |
| `scrollIntoView(element, opts)` | Scroll JS hasta que el elemento sea visible |
| `hoverOverParentContainer(driver, element, opts)` | Hover escalonado sobre ancestros (Angular Material) |
| `isContentEditable(element)` | Detecta si el elemento es contenteditable (CKEditor) |
| `writeToEditable(element, text, label)` | Escritura en contenteditable vía JS |
| `writeToStandard(element, text, label)` | Escritura en input/textarea estándar |
| `handleUpdateModal(driver, opts)` | Detecta y cierra modales de Angular CDK overlay |

---

## Notas de uso

- `getErrorMessage` va en TODO catch de POs y actions. Sin excepción.
- `addSessionTransport` la llama `runSession` al inicio; el transport debe removerse con `logger.remove(transport)` al finalizar.
- `helpers/` son privados al módulo core. Si un PO necesita scroll o hover, lo hace a través de `clickSafe` o `waitVisible`.
