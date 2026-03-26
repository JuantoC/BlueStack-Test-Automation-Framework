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
} from './NoteDataFactory.js';

export {
  YoutubeVideoDataFactory,
  NativeVideoDataFactory,
  EmbeddedVideoDataFactory,
  NATIVE_VIDEO_PATHS,
} from './VideoDataFactory.js';

export type {
  YoutubeVideoData,
  NativeVideoData,
  EmbeddedVideoData,
} from './VideoDataFactory.js';

export {
  AINoteDataFactory,
} from './AINoteDataFactory.js';

export type {
  AINoteData,
} from './AINoteDataFactory.js';