---
source: src/core/errors/errorHandler.ts · errorDict.ts · bussinesLogicError.ts
last-updated: 2026-04-13
---

# Core: Errors

## Propósito

Sistema de clasificación de errores que determina la política de reintentos en `retry()`. Cada error es categorizado como `RETRIABLE`, `FATAL` o `UNKNOWN`.

---

## API pública / Métodos principales

| Símbolo | Origen | Qué hace |
|---------|--------|----------|
| `ErrorCategory` | `errorHandler.ts` | Objeto constante con las 3 categorías |
| `classifyError(error)` | `errorHandler.ts` | Clasifica un error capturado → `ErrorCategoryType` |
| `BusinessLogicError` | `bussinesLogicError.ts` | Error personalizado que siempre es `FATAL` |

---

## `ErrorCategory` — constante de categorías

```typescript
const ErrorCategory = {
  RETRIABLE: 'RETRIABLE', // DOM transitorio, red → se reintenta automáticamente
  FATAL:     'FATAL',     // Config, sintaxis, lógica de negocio → detiene reintentos
  UNKNOWN:   'UNKNOWN'    // No clasificado → tratado como RETRIABLE con advertencia WARN
} as const;

type ErrorCategoryType = typeof ErrorCategory[keyof typeof ErrorCategory];
```

---

## `classifyError(error)` — algoritmo de clasificación

Orden de evaluación:

1. `FATAL_ERRORS` (por nombre de tipo) → `FATAL`
2. `APP_FATAL_MESSAGES` (substrings en message) → `FATAL`
3. `RETRIABLE_ERRORS` (por nombre de tipo) → `RETRIABLE`
4. `APP_RETRIABLE_MESSAGES` (substrings en message) → `RETRIABLE`
5. Errores de aserción de texto (`"valor no coincide"`, `"diferencia en índice"`, `"esperado"`) → `RETRIABLE`
6. Resto → `UNKNOWN`

---

## Errores FATAL

**Por nombre de tipo (`FATAL_ERRORS`):**
- `InvalidSelectorError` — selector CSS/XPath inválido
- `InvalidElementStateError` — elemento en estado inválido para la operación
- `SyntaxError` — error de sintaxis JavaScript/TypeScript
- `ReferenceError` — variable no definida
- `TypeError` — tipo incorrecto
- `InvalidArgumentError` — argumento inválido para Selenium
- `BusinessLogicError` — error personalizado del framework (ver abajo)

**Por mensaje (`APP_FATAL_MESSAGES`):**
- `'Credenciales inválidas'`
- `'Permisos insuficientes'`
- `'El recurso ya existe'`

**Por mensaje genérico (`FATAL_MESSAGES`):**
- `'is not defined'`
- `'cannot read property'`
- `'is not a function'`

---

## Errores RETRIABLE

**Por nombre de tipo (`RETRIABLE_ERRORS`):**
- `StaleElementReferenceError` — elemento perdido tras re-render
- `ElementClickInterceptedError` — toast u overlay bloqueando el clic
- `ElementNotInteractableError` — elemento no interactuable temporalmente
- `NoSuchElementException` — elemento no encontrado aún
- `TimeoutError` — espera agotada
- `ServiceUnavailableError` — servicio no disponible
- `WebDriverError` — error genérico del driver

**Por mensaje (`APP_RETRIABLE_MESSAGES`):**
- `'Internal Server Error'`
- `'Gateway Timeout'`
- `'Service Unavailable'`
- `'Error al procesar la solicitud, intente de nuevo'`

---

## `BusinessLogicError` — error personalizado

```typescript
// Origen: src/core/errors/bussinesLogicError.ts
// ⚠️ El nombre del archivo conserva intencionalmente el typo "bussines" para compatibilidad

class BusinessLogicError extends Error {
  constructor(message: string)
  name = 'BusinessLogicError'  // → clasificado como FATAL
}
```

**Cuándo lanzarlo:** en Page Objects cuando se detecta una condición de negocio inválida (no es inestabilidad del DOM, es un flujo que no debería continuar).

```typescript
// Ejemplo de uso en un PO
if (!isPublishAvailable) {
  throw new BusinessLogicError("El botón de publicar no está disponible para este tipo de nota.");
}
```

---

## Notas de uso

- El logging de `WARN` por `UNKNOWN` lo emite `retry()`, no `classifyError()`.
- No agregar `logger.warn` dentro de `classifyError` — el logging progresivo vive en `retry`.
- Todos los `catch` en POs deben loguear y re-lanzar: nunca silenciar errores.
