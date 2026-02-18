export interface ListicleStrategy {
  normalizeItems<T>(items: T[]): T[];
}


export const StandardStrategy: ListicleStrategy = {
  normalizeItems: (items) => items
};


export const LiveBlogStrategy: ListicleStrategy = {
  normalizeItems: (items) => [...items].reverse()
};
