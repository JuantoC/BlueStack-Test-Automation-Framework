---
source: src/core/config/defaultConfig.ts · envConfig.ts · driverManager.ts · networkMonitor.ts · toastMonitor.ts · chromeOptions.ts
last-updated: 2026-04-13
---

# Core: Driver Setup & Config

## Propósito

Configuración del WebDriver, variables de entorno, defaults de retry y monitores CDP. Estos módulos son consumidos por `runSession` y los constructores POM.

---

## API pública / Métodos principales

| Símbolo | Origen | Qué hace |
|---------|--------|----------|
| `DefaultConfig` | `defaultConfig.ts` | Objeto con valores default de `RetryOptions` |
| `resolveRetryConfig(opts, label)` | `defaultConfig.ts` | Mezcla defaults + opts + stackLabel. Usado en TODO constructor POM |
| `ENV_CONFIG` | `envConfig.ts` | Config tipada del `.env` |
| `ENV_CONFIG.getCredentials(role)` | `envConfig.ts` | Retorna `{ user, pass }` para `'admin' \| 'editor' \| 'basic'` |
| `initializeDriver(config, opts)` | `driverManager.ts` | Inicializa WebDriver + NetworkMonitor + ToastMonitor |
| `quitDriver(session, opts)` | `driverManager.ts` | Cierre limpio de la sesión |

---

## `DefaultConfig` — valores por defecto de `RetryOptions`

```typescript
const DefaultConfig = {
  timeoutMs: 3000,       // ms de espera por elemento
  retries: 4,            // intentos máximos
  initialDelayMs: 300,   // primer delay entre reintentos
  maxDelayMs: 6000,      // cap del backoff exponencial
  backoffFactor: 2,      // multiplicador de delay
  label: "[RETRY]",      // label de trazabilidad por defecto
  supressRetry: false    // false = reintentos activos
} satisfies Required<RetryOptions>;
```

---

## `resolveRetryConfig(opts, contextLabel)` — patrón universal de constructor

Usado en **todos** los constructores POM (≈50 clases).

```typescript
// Firma
function resolveRetryConfig(opts: RetryOptions, contextLabel: string): Required<RetryOptions>

// Qué hace internamente:
return {
  ...DefaultConfig,
  ...opts,
  label: stackLabel(opts.label, contextLabel)  // "Padre > HijoClase"
};
```

Garantiza que:
- Todos los campos tengan valor (merge sobre defaults).
- El `label` acumule el breadcrumb de trazabilidad.

---

## `ENV_CONFIG` — variables del `.env`

```typescript
ENV_CONFIG = {
  grid: {
    url: string,          // GRID_URL (default: 'http://localhost:4444')
    useGrid: boolean,     // USE_GRID === 'true'
    maxInstances: number  // MAX_INSTANCES (default: 1)
  },
  browser: {
    isHeadless: boolean   // IS_HEADLESS !== 'false' → true por defecto
  },
  baseUrl: string,        // TESTING_URL (lanza Error si no está definida)
  auth: {
    basic: { user, pass },
    admin: { user, pass },
    editor: { user, pass }
  },
  getCredentials(role: 'admin' | 'editor' | 'basic'): { user: string, pass: string }
}
```

**Importante:** `IS_HEADLESS` es `true` por defecto. Para ver el navegador, establecer `IS_HEADLESS=false`.

---

## `getAuthUrl(baseUrl, username, password)` — URL con Basic Auth

Origen: `src/core/utils/getAuthURL.ts`

```typescript
function getAuthUrl(baseURL: string, username: string, password: string): string
// Retorna: "https://user:pass%40encoded@dominio.com"
```

Construye URL de autenticación HTTP Basic. La contraseña se encodea con `encodeURIComponent`. Preserva el protocolo original.

---

## Routes — constantes de navegación

Origen: `src/core/utils/routes.ts`

```typescript
const AdminRoutes = {
  POSTS:    "/admin/posts",
  COMMENTS: "/admin/comments",
  IMAGES:   "/admin/images",
  PROFILE:  "/admin/user_profile",
} as const;

function postUrl(base: string, id: number | string, label?: string): string
function joinUrl(base: string, path: string, label?: string): string
```

---

## Monitores CDP

**NetworkMonitor** (`networkMonitor.ts`):
- Captura errores 4xx/5xx via CDP.
- `session.networkMonitor.stop()` retorna `{ errorCount }`.
- Si `errorCount > 0`, `runSession` lanza un error de red post-test.

**ToastMonitor** (`toastMonitor.ts`):
- Monitorea toasts de notificación Angular en tiempo real.
- `session.toastMonitor.stop()` reporta en Allure pero no lanza error (soft assertion).

---

## Notas de uso

- Nunca instanciar `RetryOptions` completo manualmente — usar `resolveRetryConfig`.
- En tests, el `opts` de `TestContext` ya tiene `label = sessionLabel`; pasarlo directamente a los PO constructors.
- `ENV_CONFIG.getCredentials('admin')` retorna `{ user, pass }` — desestructurar para usar.
