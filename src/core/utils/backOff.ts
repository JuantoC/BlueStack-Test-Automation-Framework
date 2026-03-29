
/**
 * Suspende la ejecución del flujo durante un período de tiempo determinado.
 * Usada por `retry` para introducir pausas entre reintentos con Exponential Backoff.
 *
 * @param ms - Duración de la pausa en milisegundos.
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calcula el retraso usando Exponential Backoff clasico.
 * @param attempt El número de intento actual.
 * @param base Retraso base (retryDelayMs en config)
 * @param factor Factor de crecimiento (backoffFactor en config)
 * @param max Retraso máximo permitido (maxRetryDelayMs en config)
 */
export function calcBackoff(attempt: number, base: number, factor: number, max: number): number {
  const val = base * Math.pow(factor, attempt - 1);
  const cappedVal = Math.min(val, max);
  
  return Math.floor(cappedVal); 
}