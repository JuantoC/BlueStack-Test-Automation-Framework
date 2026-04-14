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
│   ├── driverManager.ts      # initializeDriver, quitDriver, DriverSession
│   ├── networkMonitor.ts     # startNetworkMonitoring, NetworkMonitorHandle
│   └── toastMonitor.ts       # startToastMonitoring, ToastMonitorHandle, ToastEvent
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

Documentación detallada por sub-módulo: [wiki/core/](../../wiki/core/)

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

| Función | Wiki |
|---------|------|
| `runSession`, `retry`, `TestContext`, `TestMetadata` | [wiki/core/run-session.md](../../wiki/core/run-session.md) |
| `ENV_CONFIG`, `DefaultConfig`, `RetryOptions`, `resolveRetryConfig` | [wiki/core/driver-setup.md](../../wiki/core/driver-setup.md) |
| `logger`, `stackLabel`, `getErrorMessage`, `getAuthUrl` | [wiki/core/utils.md](../../wiki/core/utils.md) |
| `classifyError`, `BusinessLogicError`, `ErrorCategory` | [wiki/core/errors.md](../../wiki/core/errors.md) |
| `clickSafe`, `waitFind`, `writeSafe`, `waitVisible`, `waitEnabled` | [wiki/core/actions.md](../../wiki/core/actions.md) |
| Convenciones de log Winston (niveles, anti-patrones) | [wiki/core/logging.md](../../wiki/core/logging.md) |

URL utilities (`getAuthUrl`, `postUrl`, `joinUrl`, `AdminRoutes`): [wiki/core/utils.md](../../wiki/core/utils.md)

---

## 🔗 Documentación relacionada

- [wiki/core/](../../wiki/core/) — Documentación detallada de todos los sub-módulos
- [README.md raíz](../../README.md) — setup del proyecto, ejecución y convenciones globales
- [src/pages/README.md](../pages/README.md) — cómo los Page Objects consumen este módulo (clickSafe, waitVisible, stackLabel, DefaultConfig)
