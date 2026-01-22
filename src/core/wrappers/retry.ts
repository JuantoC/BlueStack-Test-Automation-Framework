import logger from "../utils/logger.js";
import { calcBackoff, sleep } from "../utils/backOff.js";
import { DefaultConfig } from "../config/default.js";
import { classifyError, ErrorCategory } from "../utils/errorHandler.js";

export async function retry<T>(
  action: () => Promise<T>,
  options: any = {}
): Promise<T> {
  const { retries, initialDelayMs, maxDelayMs, backoffFactor, label } = {
    ...DefaultConfig,
    ...options
  };

  let attempt = 1;

  while (true) {
    try {
      const result = await action();
      // Usamos DEBUG para no saturar la consola pero dejar rastro en el archivo
      logger.debug(`Acción exitosa`, { label });
      return result;
    } catch (err: any) {
      const category = classifyError(err);

      // SI EL ERROR ES FATAL: No esperamos, lanzamos el error de una.
      if (category === ErrorCategory.FATAL) {
        logger.error(`Error FATAL en ${label}: ${err.message}. Abortando reintentos.`);
        throw err;
      }

      // SI EL ERROR ES REINTENTABLE: Aplicamos la lógica de intentos
      if (attempt >= retries) {
        logger.error(`Se agotaron los reintentos (${retries}) para ${label}. Último error: ${err.message}`);
        throw err;
      }

      // Log de nivel WARN: Se guarda en combined.log y sale en consola para avisar del flakiness
      logger.warn(`Intento ${attempt} falló. Reintentando en breve... Motivo: ${err.message}`, { label });
      const delay = calcBackoff(attempt, initialDelayMs, backoffFactor, maxDelayMs);
      
      await sleep(delay);
      attempt++;
    }
  }
}