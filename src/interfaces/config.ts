/**
 * Opciones de configuración para el mecanismo de reintentos del framework.
 * Contrato de datos puro — sin lógica, sin defaults.
 * Los valores por defecto viven en `core/config/defaultConfig.ts`.
 */
export interface RetryOptions {
  timeoutMs?: number;
  retries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  label?: string;
  supressRetry?: boolean;
}
