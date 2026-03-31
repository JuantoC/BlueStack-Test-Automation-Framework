import logger from "../utils/logger.js";
import { calcBackoff, sleep } from "../utils/backOff.js";
import { DefaultConfig, RetryOptions } from "../config/defaultConfig.js";
import { classifyError, ErrorCategory } from "../errors/errorHandler.js";
import { handleUpdateModal } from "../helpers/handleUpdateModal.js";
import { getErrorMessage } from "../utils/errorUtils.js";

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
    return await action();
  }

  const logThreshold = Math.round(retries * 0.7);

  let attempt = 1;

  while (true) {
    try {
      const result = await action();

      // Solo logueamos en DEBUG si hubo éxito tras intentos previos para no saturar.
      if (attempt > 1) {
        // Si superó el umbral, fue un problema serio que se resolvió. INFO.
        if (attempt >= logThreshold) {
          logger.info(`✅ Acción recuperada en intento ${attempt} (Estuvo cerca del límite)`, { label });
        } else {
          // Si fue antes del umbral, fue un glitch menor. DEBUG.
          logger.debug(`Acción recuperada silenciosamente en intento ${attempt}`, { label });
        }
      }

      return result;

    } catch (err: unknown) {
      const category = classifyError(err);
      const errorMsg = getErrorMessage(err);

      // 2. Caso: Error Fatal (Configuración, sintaxis, etc.)
      if (category === ErrorCategory.FATAL) {
        logger.error(`Fallo Crítico: No es posible reintentar. Motivo: ${errorMsg}`, { label });
        throw err;
      }

      // 3. Caso: Límite de intentos alcanzado
      if (attempt >= retries) {
        throw err;
      }

      // 4. Caso: Error reintentable (Timeout, StaleElement, etc.)
      const delay = calcBackoff(attempt, initialDelayMs, backoffFactor, maxDelayMs);

      // --- LOGGING PROGRESIVO ---
      if (attempt >= logThreshold) {
        // Obtenemos solo la primera línea del error para el WARN (limpieza visual)
        const shortMsg = errorMsg.split('\n')[0];

        // Si es UNKNOWN, le ponemos una etiqueta especial para diferenciarlo de timeouts normales
        const prefix = category === ErrorCategory.UNKNOWN ? '[⚠️ Error Raro/Unknown]' : '⚠️';

        logger.warn(`${prefix} Inestabilidad en intento ${attempt}/${retries}. Reintentando en ${delay}ms... | Motivo: ${shortMsg}`, {
          label,
          category
        });
      } else {
        // Intentos tempranos (Glitch): Silencio total (o Debug)
        logger.debug(`Fallo silencioso intento ${attempt}/${retries}. Reintentando...`, { label });
      }

      await sleep(delay);
      attempt++;
    }
  }
}