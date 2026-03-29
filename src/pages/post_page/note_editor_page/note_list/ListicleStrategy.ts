/**
 * Interfaz Strategy para la normalización del orden de ítems en secciones de lista.
 * Cada implementación decide cómo ordenar los ítems antes de escribirlos en el CMS.
 * Permite que `BaseListicleSection` sea agnóstica al tipo de nota (Listicle vs LiveBlog).
 */
export interface ListicleStrategy {
  /**
   * Normaliza el orden de los ítems antes de ser procesados por `BaseListicleSection.fillItems`.
   * Cada implementación define si los ítems se preservan, invierten u ordenan de otra forma.
   *
   * @param items - Array de ítems a normalizar en el orden requerido por la estrategia.
   * @returns {T[]} Array de ítems en el orden correcto para escritura en el DOM.
   */
  normalizeItems<T>(items: T[]): T[];
}

/**
 * Estrategia estándar para notas de tipo Listicle.
 * Preserva el orden original de los ítems tal como vienen en los datos del test.
 */
export const StandardStrategy: ListicleStrategy = {
  normalizeItems: (items) => items
};

/**
 * Estrategia para notas de tipo LiveBlog.
 * Invierte el orden de los ítems antes de crearlos, ya que el CMS los apila
 * en orden inverso al de creación, resultando en el orden esperado en la UI final.
 */
export const LiveBlogStrategy: ListicleStrategy = {
  normalizeItems: (items) => {
    const reversed = [...items].reverse();
    return reversed;
  }
};
