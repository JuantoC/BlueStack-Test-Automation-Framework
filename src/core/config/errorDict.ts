// Errores que sabemos que son por problemas de código o selectores
export const FATAL_ERRORS = new Set([
  'InvalidSelectorError',
  'InvalidElementStateError',
  'SyntaxError',
  'ReferenceError',
  'TypeError',
  'InvalidArgumentError'
]);

// Errores que sabemos que son "flaky" por naturaleza
export const RETRIABLE_ERRORS = new Set([
  'StaleElementReferenceError',
  'ElementClickInterceptedError',
  'NoSuchElementException',
  'TimeoutError',
  'ServiceUnavailableError',
  'WebDriverError'
]);

// Mensajes específicos (substrings) que indican error fatal
export const FATAL_MESSAGES = [
  'is not defined',
  'cannot read property',
  'is not a function'
];

// Errores reintentables del cms
export const APP_RETRIABLE_MESSAGES = [
  'Internal Server Error',
  'Gateway Timeout',
  'Service Unavailable',
  "ElementNotInteractableError",
  'Error al procesar la solicitud, intente de nuevo'
];

// Errores fatales de lógica de negocio
export const APP_FATAL_MESSAGES = [
  'Credenciales inválidas',
  'Permisos insuficientes',
  'El recurso ya existe'
];