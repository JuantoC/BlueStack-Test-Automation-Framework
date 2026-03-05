import * as Dict from './errorDict.js';

export const ErrorCategory = {
    RETRIABLE: 'RETRIABLE', // Fallos temporales (Red, DOM, Assertions en polling)
    FATAL: 'FATAL',         // Fallos definitivos (Sintaxis, Configuración)
    UNKNOWN: 'UNKNOWN'      // No clasificado (Se tratará como RETRIABLE por defecto)
} as const;

export type ErrorCategoryType = typeof ErrorCategory[keyof typeof ErrorCategory];

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