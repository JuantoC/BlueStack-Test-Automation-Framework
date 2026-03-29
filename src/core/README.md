<!--
@doc-type: readme
@scope: module
@audience: both
@related: ../../README.md, ../pages/README.md
@last-reviewed: 2026-03-29
@summary: Motor del framework: acciones Selenium con retry, configuración del driver, clasificación de errores, helpers de interacción, utilidades de logging/URL/backoff y wrapper del ciclo de vida del test.
-->

# `@src/core` — Framework Engine

> Capa de infraestructura del framework. Los Page Objects en `src/pages/` delegan todas las interacciones de bajo nivel a este módulo. Los tests nunca importan directamente desde `src/core/` — lo hacen a través de los Maestros.

## Quick Reference

| Sub-módulo | Responsabilidad | Exportación clave |
|---|---|---|
| `actions/` | Interacciones Selenium con retry y recuperación | `clickSafe`, `waitVisible`, `writeSafe` |
| `config/` | Driver, entorno y monitoreo de red | `ENV_CONFIG`, `DefaultConfig`, `RetryOptions`, `initializeDriver` |
| `errors/` | Clasificación de errores y excepciones de negocio | `classifyError`, `BusinessLogicError`, `ErrorCategory` |
| `helpers/` | Sub-acciones puras de apoyo a las acciones principales | `waitClickable`, `scrollIntoView`, `writeToEditable` |
| `utils/` | Logging, URLs, backoff, navegación del browser | `logger`, `stackLabel`, `retry`, `getAuthUrl` |
| `wrappers/` | Ciclo de vida del test y orquestador de resiliencia | `runSession`, `retry` |

---

## Directorio

```
src/core/
├── actions/
│   ├── clickSafe.ts          # Orquestador de click resiliente
│   ├── waitForVisible.ts     # Validación de visibilidad con recuperación
│   ├── writeSafe.ts          # Escritura de texto en inputs y contenteditables
│   ├── waitEnabled.ts        # Verifica que el elemento no esté deshabilitado
│   ├── waitFind.ts           # Localiza elemento por Locator en el DOM
│   └── assertValueEquals.ts  # Valida valor/texto de elemento con diff detallado
├── config/
│   ├── envConfig.ts          # ENV_CONFIG, credenciales, URLs base
│   ├── defaultConfig.ts      # DefaultConfig, RetryOptions, DriverOptions
│   ├── driverSetup.ts        # initializeDriver, quitDriver, setChromeOptions
│   └── networkMonitor.ts     # startNetworkMonitoring, NetworkMonitorHandle
├── errors/
│   ├── errorClassifier.ts    # classifyError, ErrorCategory, diccionarios FATAL/RETRIABLE
│   └── BusinessLogicError.ts # Excepción para errores de negocio (siempre FATAL)
├── helpers/
│   ├── waitClickable.ts      # waitVisible + waitEnabled encadenados
│   ├── scrollIntoView.ts     # Scroll JS hasta visibilidad del elemento
│   ├── hoverOverParentContainer.ts # Hover escalonado sobre ancestros (Angular Material)
│   ├── isContentEditable.ts  # Detecta elementos contenteditable / CKEditor
│   ├── writeToEditable.ts    # Escritura en contenteditables con limpieza previa
│   ├── writeToStandard.ts    # Escritura en inputs/textarea estándar
│   └── handleUpdateModal.ts  # Detecta y cierra modales Angular CDK overlay
├── utils/
│   ├── logger.ts             # logger Winston + addSessionTransport
│   ├── stackLabel.ts         # stackLabel — breadcrumb de labels para trazabilidad
│   ├── sleep.ts              # sleep + calcBackoff — backoff exponencial
│   ├── browserHistory.ts     # browserHistory — back/forward con logging
│   ├── goToPost.ts           # goToPost — navegación directa a post por ID
│   ├── urlBuilder.ts         # postUrl, joinUrl, AdminRoutes
│   └── getAuthURL.ts         # getAuthUrl — URL con HTTP Basic Auth
└── wrappers/
    ├── testWrapper.ts        # runSession, TestContext, TestMetadata
    └── retry.ts              # retry<T> — wrapper de resiliencia con backoff
```

---

## Arquitectura

### Cadena de orquestación

```
runSession()          ← test entry point (wrappers/)
  └─ Page Object      ← Maestro en src/pages/
       └─ clickSafe() ← acción con retry (actions/)
            └─ waitClickable() ← helper puro (helpers/)
                 └─ retry()    ← orquestador de resiliencia (wrappers/)
                      └─ classifyError() ← clasificador (errors/)
```

- Las **acciones** (`actions/`) son las únicas que los Page Objects llaman directamente.
- Los **helpers** (`helpers/`) son funciones puras de bajo nivel invocadas solo desde acciones.
- El **retry** (`wrappers/retry.ts`) envuelve cualquier `async` que pueda fallar por inestabilidad del DOM.

### Política de errores

`classifyError()` determina si un error es `RETRIABLE` (StaleElement, Timeout, NotInteractable) o `FATAL` (InvalidSelector, TypeError, BusinessLogicError, errores de credenciales del CMS). Los errores `FATAL` detienen el retry inmediatamente.

---

## API pública clave

### `runSession` — entrada de cada test

```typescript
runSession(
  sessionLabel: string,
  testLogic: (context: TestContext) => Promise<void>,
  metadata?: TestMetadata
): void
```

Envuelve `test()` de Jest. Inicializa el driver, ejecuta la lógica del test, captura screenshot en fallo, verifica errores de red (CDP) y cierra la sesión.

### `retry` — resiliencia

```typescript
retry<T>(action: () => Promise<T>, options?: RetryOptions): Promise<T>
```

Backoff exponencial. Reintenta en errores `RETRIABLE`, detiene en `FATAL`. Configurable vía `RetryOptions`.

### `RetryOptions` / `DefaultConfig`

```typescript
interface RetryOptions {
  timeoutMs?: number;       // default: 3000
  retries?: number;         // default: 4
  initialDelayMs?: number;  // default: 300
  maxDelayMs?: number;      // default: 6000
  backoffFactor?: number;   // default: 2
  label?: string;           // breadcrumb de trazabilidad
  supressRetry?: boolean;   // default: false
}
```

Siempre pasar `opts` (no `DefaultConfig` directamente) a los sub-componentes; los Maestros hacen spread con `stackLabel`.

### `stackLabel` — trazabilidad

```typescript
stackLabel(parent: string | undefined, current: string): string
// "MainPostPage > PostTable > clickRow"
```

Cada Page Object llama `stackLabel(opts.label, "ClassName")` en su constructor para construir el breadcrumb de logs.

### `ENV_CONFIG` — configuración de entorno

```typescript
ENV_CONFIG.baseUrl              // URL base del CMS
ENV_CONFIG.getCredentials(role) // { user, pass } para 'editor' | 'admin'
ENV_CONFIG.grid.url             // URL del Selenium Grid
ENV_CONFIG.browser.isHeadless   // boolean
```

---

## Utilidades de URL

| Función | Descripción |
|---|---|
| `getAuthUrl(base, user, pass)` | Construye URL con HTTP Basic Auth incrustado |
| `postUrl(base, id)` | URL de edición de post: `base/admin/post/{id}` |
| `joinUrl(base, path)` | Une base + path sin doble slash |
| `AdminRoutes.POSTS` etc. | Rutas constantes del panel admin |

---

## 🔗 Documentación relacionada

- [README.md raíz](../../README.md) — setup del proyecto, ejecución y convenciones globales
- [src/pages/README.md](../pages/README.md) — cómo los Page Objects consumen este módulo (clickSafe, waitVisible, stackLabel, DefaultConfig)
