/**
 * Conjunto de nombres de error de Selenium/JavaScript que producen fallos definitivos.
 * Errores listados aquí son clasificados como `FATAL` por `classifyError` y no se reintentan.
 */
export const FATAL_ERRORS = new Set([
  'InvalidSelectorError',
  'InvalidElementStateError',
  'SyntaxError',
  'ReferenceError',
  'TypeError',
  'InvalidArgumentError',
  'BusinessLogicError'
]);

/**
 * Conjunto de nombres de error de Selenium que se consideran transitorios y reintentables.
 * Errores listados aquí son clasificados como `RETRIABLE` por `classifyError`.
 */
export const RETRIABLE_ERRORS = new Set([
  'StaleElementReferenceError',
  'ElementClickInterceptedError',
  'ElementNotInteractableError',
  'NoSuchElementException',
  'TimeoutError',
  'ServiceUnavailableError',
  'WebDriverError'
]);

/**
 * Substrings de mensajes de error que, al coincidir, clasifican el error como `FATAL`.
 * Complementa a `FATAL_ERRORS` para capturar errores de JavaScript sin nombre de tipo específico.
 */
export const FATAL_MESSAGES = [
  'is not defined',
  'cannot read property',
  'is not a function'
];

/**
 * Substrings de mensajes de error del CMS que se consideran reintentables (errores de servidor transitorios).
 * Al coincidir, el error es clasificado como `RETRIABLE` por `classifyError`.
 */
export const APP_RETRIABLE_MESSAGES = [
  'Internal Server Error',
  'Gateway Timeout',
  'Service Unavailable',
  'Error al procesar la solicitud, intente de nuevo'
];

/**
 * Substrings de mensajes de error del CMS que indican fallos de lógica de negocio definitivos.
 * Al coincidir, el error es clasificado como `FATAL` por `classifyError` y no se reintenta.
 */
export const APP_FATAL_MESSAGES = [
  'Credenciales inválidas',
  'Permisos insuficientes',
  'El recurso ya existe'
];