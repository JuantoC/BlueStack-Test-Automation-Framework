/**
 * Error personalizado para fallos de lógica de negocio detectados durante la automatización.
 * Al ser lanzado, es clasificado como `FATAL` por `classifyError`, deteniendo los reintentos
 * inmediatamente. Debe usarse en Page Objects cuando se detecta una condición de negocio inválida
 * (ej.: elemento no disponible por razones de flujo, no por inestabilidad del DOM).
 *
 * @example
 * throw new BusinessLogicError("El botón de publicar no está disponible para este tipo de nota.");
 */
export class BusinessLogicError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BusinessLogicError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BusinessLogicError);
        }
    }
}