/**
 * Genera una etiqueta de pila (breadcrumb) para rastrear la jerarquía de llamadas.
 * Garantiza una cadena de trazabilidad limpia sin duplicados adyacentes.
 * * @param parent - Etiqueta del nivel superior (opcional).
 * @param current - Nombre de la función o acción actual.
 * @returns Cadena formateada: "Abuelo > Padre > Hijo".
 */
export function stackLabel(parent, current) {
    if (!parent || parent.trim() === "") {
        return current;
    }
    // 1. Validación de redundancia: Evitamos "clickSafe > clickSafe" en reintentos.
    // Dividimos el parent por el separador y tomamos el último eslabón.
    const pathParts = parent.split(" > ");
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart === current) {
        return parent;
    }
    // 2. Construcción de la jerarquía.
    return `${parent} > ${current}`;
}
//# sourceMappingURL=stackLabel.js.map