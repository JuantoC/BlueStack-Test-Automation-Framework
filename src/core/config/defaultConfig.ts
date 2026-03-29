/**  Define la interfaz de opciones para mejorar la tipificación
 * T es el tipo de retorno de la acción que se va a reintentar
 */
export interface RetryOptions {
  timeoutMs?: number;
  retries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  label?: string;
  supressRetry?: boolean;
  // ... cualquier otra opción que pueda tener tu función retry
}
/**
 * Configuración de reintentos y trazabilidad por defecto del framework.
 * Usada como base en todos los orquestadores cuando no se especifican opciones personalizadas.
 * Define el comportamiento estándar: 4 reintentos con backoff exponencial de hasta 6 segundos.
 */
export const DefaultConfig: Required<Omit<RetryOptions, 'label'>> & { label: string } = {
  timeoutMs: 3000,
  retries: 4,
  initialDelayMs: 300,
  maxDelayMs: 6000,
  backoffFactor: 2,
  label: "[RETRY]",
  supressRetry: false
};