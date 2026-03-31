/**
 * Extrae el mensaje de un error de forma segura, sin depender de `any`.
 * Util para reemplazar `error.message` en catch blocks con `error: unknown`.
 *
 * @param error - El valor capturado en el catch block.
 * @returns El mensaje de error como string.
 */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
