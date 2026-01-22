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
export const DefaultConfig: Required<Omit<RetryOptions, 'label'>> & { label: string } = {
  retries: 4,
  initialDelayMs: 300,
  maxDelayMs: 5000,
  backoffFactor: 2,
  label: "[Retry]"
};