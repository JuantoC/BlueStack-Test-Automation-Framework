import * as Dict from './errorDict.js';

/**
 * Categorías de error utilizadas por el sistema de reintentos del framework.
 * - `RETRIABLE`: Fallos transitorios del DOM o la red; se reintentan automáticamente.
 * - `FATAL`: Fallos de configuración o lógica de negocio; detienen el reintento inmediatamente.
 * - `UNKNOWN`: Error no clasificado; tratado como `RETRIABLE` por defecto con advertencia en log.
 */
export const ErrorCategory = {
    RETRIABLE: 'RETRIABLE', // Fallos temporales (Red, DOM, Assertions en polling)
    FATAL: 'FATAL',         // Fallos definitivos (Sintaxis, Configuración)
    UNKNOWN: 'UNKNOWN'      // No clasificado (Se tratará como RETRIABLE por defecto)
} as const;

export type ErrorCategoryType = typeof ErrorCategory[keyof typeof ErrorCategory];

/**
 * Clasifica un error según su naturaleza para determinar la política de reintento en `retry`.
 * Consulta los diccionarios de `errorDict` para identificar errores por nombre de tipo y mensaje.
 * Los errores de aserción de texto (provenientes de `assertValueEquals`) son clasificados como
 * `RETRIABLE` para permitir que el polling eventualmente confirme la escritura correcta.
 *
 * @param error - El objeto de error capturado en el bloque `catch`. Puede ser de cualquier tipo.
 * @returns {ErrorCategoryType} La categoría del error: `RETRIABLE`, `FATAL` o `UNKNOWN`.
 */
export function classifyError(error: any): ErrorCategoryType {
    if (!error) return ErrorCategory.UNKNOWN;

    const name = error.name || 'Error';
    const message = error.message || '';

    const messageLower = message.toLowerCase();
    const nameLower = name.toLowerCase();

    if (Dict.FATAL_ERRORS.has(name)) return ErrorCategory.FATAL;
    if (Dict.APP_FATAL_MESSAGES.some(msg => messageLower.includes(msg.toLowerCase()))) {
        return ErrorCategory.FATAL;
    }

    if (Dict.RETRIABLE_ERRORS.has(name)) return ErrorCategory.RETRIABLE;

    if (Dict.APP_RETRIABLE_MESSAGES.some(msg => messageLower.includes(msg.toLowerCase()))) {
        return ErrorCategory.RETRIABLE;
    }

    // Assertion Errors
    if (name === 'Error' && (
        messageLower.includes('valor no coincide') ||
        messageLower.includes('diferencia en índice') ||
        messageLower.includes('esperado')
    )) {
        return ErrorCategory.RETRIABLE;
    }

    // NO logueamos aca. El logger.warn esta en el 'retry' 
    return ErrorCategory.UNKNOWN;
}