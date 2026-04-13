---
source: src/core/wrappers/testWrapper.ts · src/core/wrappers/retry.ts
last-updated: 2026-04-13
---

# Core: runSession & retry

## Propósito

`runSession` es el punto de entrada estándar para todos los archivos `.test.ts`.
Orquesta el ciclo de vida completo de un test: metadata Allure → inicialización del driver → ejecución → screenshot en fallo → verificación de red → cierre limpio.

`retry` es el wrapper de resiliencia con exponential backoff usado por todas las acciones atómicas.

---

## API pública / Métodos principales

| Función | Firma | Qué hace |
|---------|-------|----------|
| `runSession` | `(sessionLabel: string, testLogic: (ctx: TestContext) => Promise<void>, metadata?: TestMetadata) => void` | Crea un test Jest con ciclo de vida completo |
| `retry<T>` | `(action: () => Promise<T>, options?: RetryOptions) => Promise<T>` | Ejecuta con reintentos y exponential backoff |
| `addSessionTransport` | `(sessionLabel: string) => Transport` | Crea log de archivo por sesión (usado internamente por `runSession`) |

---

## Interfaces exportadas

### `TestContext`
Inyectado en cada función de test por `runSession`.

```typescript
interface TestContext {
  driver: WebDriver;          // Instancia activa de Selenium
  session: DriverSession;     // Acceso a internals del driver (networkMonitor, toastMonitor)
  opts: RetryOptions;         // Config de reintentos con label = sessionLabel
  log: typeof logger;         // Logger Winston compartido
  toastMonitor: ToastMonitorHandle | null;
}
```

### `TestMetadata`
Metadata de clasificación para Allure. Todos los campos opcionales.
Incluye campos de clasificación Allure clásicos y metadata directa del ticket Jira vinculado.

```typescript
interface TestMetadata {
  // --- Clasificación Allure ---
  epic?: string;       // Agrupación de nivel alto (módulo/área de negocio)
  feature?: string;    // Funcionalidad dentro del epic
  story?: string;      // Caso de uso específico
  severity?: "blocker" | "critical" | "normal" | "minor" | "trivial";
  issueId?: string;    // Key del ticket Jira (ej. "NAA-4037"). Genera link clickeable.
  tags?: string[];     // Etiquetas genéricas de clasificación

  // --- Metadata Jira (correspondencia 1:1 con campos del ticket) ---
  jiraSummary?: string;       // summary: título del ticket
  ticketType?: string;        // issuetype.name ("Story - Back", "QA Bug - Front", etc.)
  ticketStatus?: string;      // status.name: estado actual del ticket
  assignee?: string;          // assignee.displayName
  component?: string;         // customfield_10061: componente técnico ("Videos", "AI", etc.)
  sprint?: string;            // customfield_10021: nombre del sprint activo
  executiveSummary?: string;  // customfield_10062: resumen ejecutivo
  parentKey?: string;         // parent.key: key del ticket padre (ej. "NAA-1751")
  linkedIssues?: string[];    // issuelinks: keys de tickets relacionados
  fixVersion?: string;        // fixVersions[0].name: versión objetivo del fix
  priority?: string;          // priority.name ("High", "Medium", "Low", etc.)
  jiraLabels?: string[];      // labels nativas de Jira (ej. ["Ecuavisa"]). Distinto de `tags`.
  jiraAttachments?: string[]; // attachment[].filename: archivos adjuntos del ticket
}
```

> `jira_metadata` retornado por `jira-reader OP-6` sigue este schema exacto y puede
> pasarse directamente a `runSession` para poblar Allure sin transformación.

---

## Ciclo de vida de `runSession`

1. **Metadata Allure** — inyecta epic, feature, story, severity, tags, issueId como link a Jira.
2. **Parámetros de entorno** — inyecta `Execution` (Grid/Local) y `Headless`.
3. **Inicialización del driver** — llama `initializeDriver()` con config de env.
4. **Ejecución del test** — llama `testLogic(context)`.
5. **Error** (catch) — toma screenshot y lo adjunta a Allure como `Fallo_Visual_<label>`.
6. **Finally** — verifica console errors, detiene NetworkMonitor, detiene ToastMonitor, llama `quitDriver`.
7. **Relanzamiento** — si test error + network error, los combina; si solo uno, relanza ese.

---

## Comportamiento de `retry`

| Caso | Comportamiento |
|------|---------------|
| `supressRetry: true` | Ejecuta `action()` una sola vez sin reintentos (para orquestaciones anidadas) |
| Error `FATAL` | Lanza inmediatamente sin reintentar |
| Error `RETRIABLE` o `UNKNOWN` | Reintenta con backoff exponencial hasta `retries` |
| Éxito en intento > 1 | Logea `INFO` si fue cercano al límite, `DEBUG` si fue glitch temprano |
| Reintentos agotados | Lanza el último error capturado |

**Umbral de logging:** `logThreshold = Math.round(retries * 0.7)`. Intentos anteriores son silenciosos (`DEBUG`). A partir del umbral, logea `WARN`.

---

## Notas de uso

**Estructura canónica de un test:**

```typescript
import { runSession } from "../../src/core/wrappers/testWrapper.js";

runSession("Nombre del Flujo", async ({ driver, opts, log }) => {
  description("### Objetivo...\n---\n**Flujo:** ...");
  
  const data = Factory.create();
  const page = new MainPage(driver, opts);
  await page.method(data);
  
  log.info("✅ Test completado");
}, { epic: "Módulo", feature: "Sub-feature", severity: "normal" });
```

**`opts` de `TestContext`:** siempre usar este `opts` al instanciar Page Objects. Ya contiene el `label` de la sesión como trazabilidad base.

**`supressRetry: true`:** úsarlo cuando orquestás acciones dentro de un `retry` externo para evitar reintentos anidados. Los sub-componentes lo reciben de los Maestros via `{ ...config, supressRetry: true }`.
