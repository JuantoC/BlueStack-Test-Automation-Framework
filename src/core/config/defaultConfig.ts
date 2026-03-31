import type { RetryOptions } from '../../interfaces/config.js';
export type { RetryOptions } from '../../interfaces/config.js';
import { stackLabel } from '../utils/stackLabel.js';

/**
 * Configuración de reintentos y trazabilidad por defecto del framework.
 * Usada como base en todos los orquestadores cuando no se especifican opciones personalizadas.
 * Define el comportamiento estándar: 4 reintentos con backoff exponencial de hasta 6 segundos.
 * `satisfies Required<RetryOptions>` valida que todos los campos estén presentes sin perder la
 * inferencia de literales. Si se agrega un campo nuevo a RetryOptions y se omite aquí, el
 * compilador falla en este archivo — no silenciosamente en los consumidores.
 */
export const DefaultConfig = {
  timeoutMs: 3000,
  retries: 4,
  initialDelayMs: 300,
  maxDelayMs: 6000,
  backoffFactor: 2,
  label: "[RETRY]",
  supressRetry: false
} satisfies Required<RetryOptions>;

/**
 * Resuelve la configuración final de reintentos mezclando defaults con overrides.
 * Centraliza el patrón `{ ...DefaultConfig, ...opts, label: stackLabel(...) }`
 * que actualmente se repite en ~50 constructores del proyecto.
 *
 * @param opts - Opciones parciales del caller (pueden ser vacías).
 * @param contextLabel - Nombre del componente para trazabilidad.
 * @returns Configuración completa con todos los campos resueltos.
 */
export function resolveRetryConfig(
  opts: RetryOptions,
  contextLabel: string
): Required<RetryOptions> {
  return {
    ...DefaultConfig,
    ...opts,
    label: stackLabel(opts.label, contextLabel)
  } as Required<RetryOptions>;
}