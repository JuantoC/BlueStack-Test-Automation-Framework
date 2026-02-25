export interface ListicleStrategy {
  normalizeItems<T>(items: T[]): T[];
}


export const StandardStrategy: ListicleStrategy = {
  normalizeItems: (items) => items
};


export const LiveBlogStrategy: ListicleStrategy = {
  normalizeItems: (items) => {
    // Si no ves este log, es que el código está llamando a OTRA estrategia
    console.log("Ejecutando normalizeItems en LiveBlogStrategy");
    const reversed = [...items].reverse();
    return reversed;
  }
};