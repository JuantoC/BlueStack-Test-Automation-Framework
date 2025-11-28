import { calcBackoff, sleep } from "../utils/backOff.js";
import { DefaultConfig } from "../config/default.js";

/**  Define la interfaz de opciones para mejorar la tipificación
 * T es el tipo de retorno de la acción que se va a reintentar
 */
export interface RetryOptions {
  retries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  label?: string;
  // ... cualquier otra opción que pueda tener tu función retry
}


export async function retry<T>(
  action: () => Promise<T>,
  {
    retries = DefaultConfig.retry.retries,
    initialDelayMs = DefaultConfig.retry.retryDelayMs,
    maxDelayMs = DefaultConfig.retry.maxRetryDelayMs,
    backoffFactor = DefaultConfig.retry.backoffFactor,
    label = "[Retry]"
  } = {}
): Promise<T> {
  let attempt = 1;

  while (attempt <= retries) {
    try {
      return await action();
    } catch (err: any) {
      const canRetry = attempt < retries;
      console.warn(`[${label}]: Intento ${attempt} falló: ${err.message}`);

      if (!canRetry) {
        console.error(`[${label}]: Agotó reintentos (${retries}).`);
        throw err;
      }
      const delay = calcBackoff(
        attempt,
        initialDelayMs,
        backoffFactor,
        maxDelayMs
      );

      console.log(`[${label}] Esperando ${delay / 1000}s antes del intento ${attempt + 1}...`);
      await sleep(delay);
      attempt++;
    }
  }
  throw new Error("[Retry`s agotado]");
}