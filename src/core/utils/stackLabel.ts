/**
 * Genera una etiqueta de pila para rastrear la jerarquía de llamadas.
 * @param parent Etiqueta del padre.
 * @param current Etiqueta actual.
 * @returns Etiqueta combinada.
 */
export function stackLabel(parent: string | undefined, current: string) {
  if (!parent) return current;
  return `${parent} > ${current}`;
}
