/**
 * Genera una etiqueta de pila (breadcrumb) para rastrear la jerarquía de llamadas.
 * Garantiza una cadena de trazabilidad limpia sin duplicados adyacentes.
 * * @param parent - Etiqueta del nivel superior (opcional).
 * @param current - Nombre de la función o acción actual.
 * @returns Cadena formateada: "Abuelo > Padre > Hijo".
 */
export function stackLabel(parent: string | undefined, current: string): string {
  if (!parent || parent.trim() === "") {
    return current;
  }

  // Validación de redundancia:
  const pathParts = parent.split(" > ");
  const lastPart = pathParts[pathParts.length - 1];

  if (lastPart === current) {
    return parent;
  }

  // Construcción de la jerarquía.
  return `${parent} > ${current}`;
}