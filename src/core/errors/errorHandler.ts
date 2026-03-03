import * as Dict from './errorDict.js';

export const ErrorCategory = {
    RETRIABLE: 'RETRIABLE', // Fallos temporales (Red, DOM, Assertions en polling)
    FATAL: 'FATAL',         // Fallos definitivos (Sintaxis, Configuración)
    UNKNOWN: 'UNKNOWN'      // No clasificado (Se tratará como RETRIABLE por defecto)
} as const; // 'as const' para mejor tipado en TS

export type ErrorCategoryType = typeof ErrorCategory[keyof typeof ErrorCategory];

export function classifyError(error: any): ErrorCategoryType {
    if (!error) return ErrorCategory.UNKNOWN;

    // 1. Extracción segura de datos
    const name = error.name || 'Error';
    const message = error.message || '';

    // Normalizamos una sola vez para eficiencia
    const messageLower = message.toLowerCase();
    const nameLower = name.toLowerCase();

    // 2. FILTRO DE FATALIDAD (Prioridad Alta - Fail Fast)
    // Si es fatal, no perdemos tiempo revisando si es reintentable.
    if (Dict.FATAL_ERRORS.has(name)) return ErrorCategory.FATAL;

    // Check de mensajes fatales (ej: "invalid selector", "javascript error")
    if (Dict.APP_FATAL_MESSAGES.some(msg => messageLower.includes(msg.toLowerCase()))) {
        return ErrorCategory.FATAL;
    }

    // 3. FILTRO DE REINTENTO (Conocidos)
    if (Dict.RETRIABLE_ERRORS.has(name)) return ErrorCategory.RETRIABLE;

    if (Dict.APP_RETRIABLE_MESSAGES.some(msg => messageLower.includes(msg.toLowerCase()))) {
        return ErrorCategory.RETRIABLE;
    }

    // 4. EL CASO "GENÉRICO" (Assertion Errors)
    // Tu 'assertValueEquals' lanza 'new Error(...)'. Su nombre es "Error".
    // Si el mensaje contiene "Valor no coincide" o "Diferencia en índice", 
    // implícitamente es un error de aserción que QUEREMOS reintentar.
    if (name === 'Error' && (
        messageLower.includes('valor no coincide') ||
        messageLower.includes('diferencia en índice') ||
        messageLower.includes('esperado')
    )) {
        return ErrorCategory.RETRIABLE;
    }

    // 5. POR DEFECTO: UNKNOWN
    // NOTA: NO logueamos aquí. El logger.warn debe estar en el 'retry' 
    // solo si este error persiste y agota los intentos.
    return ErrorCategory.UNKNOWN;
}