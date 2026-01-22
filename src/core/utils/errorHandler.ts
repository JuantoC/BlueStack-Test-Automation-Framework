import logger from './logger.js';
import * as Dict from '../config/errorDict.js';

/**
 * Clasifica si un error es "reintentable" o "fatal"
 */
export const ErrorCategory = {
    RETRIABLE: 'RETRIABLE', // Fallos por sincronización, red o DOM inestable
    FATAL: 'FATAL',         // Fallos por selectores mal escritos, lógica o asserts
    UNKNOWN: 'UNKNOWN'      // No se pudo clasificar el error
};

export function classifyError(error: any) {
    const message = error.message || '';
    const name = error.name || '';
    const messageLower = message.toLowerCase();

    // 1. Validar por NOMBRE (Prioridad Técnica)
    if (Dict.FATAL_ERRORS.has(name)) return ErrorCategory.FATAL;
    if (Dict.RETRIABLE_ERRORS.has(name)) return ErrorCategory.RETRIABLE;

    // 2. Validar por MENSAJE de Aplicación (Fatal)
    if (Dict.APP_FATAL_MESSAGES.some(msg => messageLower.includes(msg.toLowerCase()))) {
        return ErrorCategory.FATAL;
    }

    // 3. Validar por MENSAJE de Aplicación (Reintentable)
    if (Dict.APP_RETRIABLE_MESSAGES.some(msg => messageLower.includes(msg.toLowerCase()))) {
        return ErrorCategory.RETRIABLE;
    }

    // 4. GESTIÓN DE ERRORES DESCONOCIDOS
    // Si llegamos aquí, no sabemos qué es. Lo marcamos para investigación.
    logger.warn(`[INVESTIGACIÓN REQUERIDA] Error no clasificado detectado: 
               Nombre: ${name} 
               Mensaje: ${message}`);

    return ErrorCategory.UNKNOWN;
}