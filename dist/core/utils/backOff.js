export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Calcula el retraso usando Exponential Backoff clasico.
 * @param attempt El número de intento actual.
 * @param base Retraso base (retryDelayMs en config)
 * @param factor Factor de crecimiento (backoffFactor en config)
 * @param max Retraso máximo permitido (maxRetryDelayMs en config)
 */
export function calcBackoff(attempt, base, factor, max) {
    const val = base * Math.pow(factor, attempt - 1);
    const cappedVal = Math.min(val, max);
    return Math.floor(cappedVal);
}
//# sourceMappingURL=backOff.js.map