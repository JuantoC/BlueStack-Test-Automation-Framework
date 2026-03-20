/**
 * src/data/factories/index.ts
 *
 * Punto de entrada unificado para todas las factories del proyecto.
 * Importá desde acá en tus tests para mantener imports limpios.
 *
 * @example
 * import { PostDataFactory, ListicleDataFactory, YoutubeVideoDataFactory } from '../data/factories';
 */

export {
  PostDataFactory,
  ListicleDataFactory,
  LiveBlogDataFactory,
} from './NoteDataFactory.js';

export type {
  PostData,
  ListicleData,
  ListicleItem,
  LiveBlogData,
  EventLiveBlog,
} from './NoteDataFactory.js';

export {
  YoutubeVideoDataFactory,
  NativeVideoDataFactory,
  NATIVE_VIDEO_PATHS,
} from './VideoDataFactory.js';

export type {
  YoutubeVideoData,
  NativeVideoData,
} from './VideoDataFactory.js';