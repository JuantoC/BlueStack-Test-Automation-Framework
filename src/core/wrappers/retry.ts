import logger from "../utils/logger.js";
import { calcBackoff, sleep } from "../utils/backOff.js";
import { DefaultConfig, RetryOptions } from "../config/default.js";
import { classifyError, ErrorCategory } from "../utils/errorHandler.js";

/**
 * Wrapper de resiliencia con Exponential Backoff.
 * Gestiona la política de reintentos basada en la categorización de errores
 * y permite la supresión de reintentos para orquestaciones anidadas.
 * * @param action - Función asíncrona a ejecutar.
 * @param options - Configuración de reintentos y trazabilidad.
 * @returns El resultado de la acción si tiene éxito.
 */
export async function retry<T>(
  action: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = {
    ...DefaultConfig,
    ...options
  };

  const { retries, initialDelayMs, maxDelayMs, backoffFactor, label, supressRetry } = config;

  // 1. Caso: Orquestación anidada (supressRetry)
  if (supressRetry) {
    logger.debug(`Ejecución directa (reintentos suprimidos)`, { label });
    return await action();
  }

  let attempt = 1;

  while (true) {
    try {
      const result = await action();

      // Solo logueamos en DEBUG si hubo éxito tras intentos previos para no saturar.
      if (attempt > 1) {
        logger.info(`Acción recuperada con éxito en el intento ${attempt}`, { label });
      } else {
        logger.debug(`Acción completada en el primer intento`, { label });
      }

      return result;

    } catch (err: any) {
      const category = classifyError(err);
      const errorMsg = err.message || "Error desconocido";

      // 2. Caso: Error Fatal (Configuración, sintaxis, etc.)
      if (category === ErrorCategory.FATAL) {
        logger.error(`Fallo Crítico: No es posible reintentar. Motivo: ${errorMsg}`, { label });
        throw err;
      }

      // 3. Caso: Límite de intentos alcanzado
      if (attempt >= retries) {
        logger.error(`Límite de reintentos alcanzado (${retries}). Abortando. Último error: ${errorMsg}`, { label });
        throw err;
      }

      // 4. Caso: Error reintentable (Timeout, StaleElement, etc.)
      const delay = calcBackoff(attempt, initialDelayMs, backoffFactor, maxDelayMs);

      logger.warn(`Fallo en intento ${attempt}/${retries}. Reintentando en ${delay}ms... Motivo: ${errorMsg}`, {
        label,
        category
      });

      await sleep(delay);
      attempt++;
    }
  }
}