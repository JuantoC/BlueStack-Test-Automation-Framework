/**
 * VideoDataFactory.ts
 *
 * Genera fixtures dinámicos para Video YouTube y Video Nativo.
 * Reemplaza los arrays estáticos de src/data_test/videoData.ts.
 * Cada llamada produce datos únicos para evitar colisiones entre tests.
 *
 * Compatible con GitHub Actions sin cambios adicionales.
 * El archivo de video nativo se resuelve vía Git LFS o paso AWS en CI.
 */

import { faker } from '@faker-js/faker';
import { VideoType } from '../../pages/videos_page/UploadVideoBtn.js';
import { VideoData } from '../../interfaces/data.js';

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface YoutubeVideoData extends VideoData {
  video_type: VideoType.YOUTUBE;
  url: string;       // URL válida de YouTube: https://www.youtube.com/watch?v=...
  title: string;
  description?: string;
  // Campo PROHIBIDO: path
}

export interface NativeVideoData extends VideoData {
  video_type: VideoType.NATIVO;
  title: string;
  path: string;      // Ruta relativa desde raíz del proyecto: src/data_test/archivo.mp4
  description?: string;
  // Campo PROHIBIDO: url
}

// ─── Pools de IDs de YouTube reales (videos educativos/tech de dominio público) ──

/**
 * IDs de videos de YouTube verificados, temáticamente variados.
 * Se usan para construir URLs válidas sin depender de una red real en tests.
 * Podés ampliar este pool con IDs propios del CMS que estés probando.
 */
const YOUTUBE_VIDEO_IDS = [
  'dQw4w9WgXcQ',
  'jNQXAC9IVRw',
  'kJQP7kiw5Fk',
  'OPf0YbXqDm0',
  'pRpeEdMmmQ0',
  'L_jWHffIx5E',
  'fJ9rUzIMcZQ',
  '09R8_2nJtjg',
  '3tmd-ClpJxA',
  'hT_nvWreIhg',
];

// ─── Pools de datos en español ─────────────────────────────────────────────────

const CATEGORIAS_VIDEO = [
  'tutorial', 'entrevista', 'análisis', 'reseña',
  'documental', 'cobertura', 'resumen', 'debate',
];

const TEMAS_VIDEO = [
  'inteligencia artificial', 'desarrollo web', 'ciberseguridad',
  'startups latinoamericanas', 'diseño UX', 'cloud computing',
  'periodismo digital', 'marketing de contenidos', 'innovación tecnológica',
];

// ─── Helpers internos ──────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uniqueSuffix(): string {
  return Date.now().toString().slice(-6);
}

function generateVideoTitle(categoria: string, tema: string): string {
  return `${categoria.charAt(0).toUpperCase() + categoria.slice(1)}: ${tema} - ${uniqueSuffix()}`;
}

function generateDescription(tema: string): string {
  return `${faker.lorem.sentence()} Una mirada profunda sobre ${tema} con ejemplos prácticos y casos de uso reales. ${faker.lorem.sentence()}`;
}

// ─── YoutubeVideoDataFactory ───────────────────────────────────────────────────

export class YoutubeVideoDataFactory {
  /**
   * Crea un fixture de Video YouTube con URL válida y metadata realista.
   * Usa `overrides` para forzar campos específicos en un test puntual.
   *
   * @example
   * const video = YoutubeVideoDataFactory.create();
   * const videoConUrl = YoutubeVideoDataFactory.create({ url: 'https://www.youtube.com/watch?v=ABC123' });
   */
  static create(overrides?: Partial<YoutubeVideoData>): YoutubeVideoData {
    const categoria = pickRandom(CATEGORIAS_VIDEO);
    const tema = pickRandom(TEMAS_VIDEO);
    const videoId = pickRandom(YOUTUBE_VIDEO_IDS);

    const defaultData: YoutubeVideoData = {
      video_type: VideoType.YOUTUBE,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title: generateVideoTitle(categoria, tema),
      description: generateDescription(tema),
    };

    return { ...defaultData, ...overrides };
  }

  /**
   * Crea múltiples videos YouTube únicos.
   * Útil para tests de paginación o subida en bulk.
   */
  static createMany(
    count: number,
    overrides?: Partial<YoutubeVideoData>
  ): YoutubeVideoData[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

// ─── NativeVideoDataFactory ────────────────────────────────────────────────────

/**
 * Rutas de archivos de video nativo disponibles en el proyecto.
 * Estos archivos deben existir en src/data_test/ (vía Git LFS o paso AWS en CI).
 * Agregá más entradas si tenés múltiples archivos de prueba.
 */
export const NATIVE_VIDEO_PATHS = [
  "src/data_test/videos/Plataforma BLUESTACK CMS - 8.7.1 - Google Chrome 2026-03-17 13-12-08.mp4"
] as const;

export class NativeVideoDataFactory {
  /**
   * Crea un fixture de Video Nativo con ruta al archivo local.
   * El archivo debe estar disponible en `path` al momento de ejecutar el test.
   *
   * @example
   * const video = NativeVideoDataFactory.create();
   * const videoEspecifico = NativeVideoDataFactory.create({ path: 'src/data_test/mi_video.mp4' });
   */
  static create(overrides?: Partial<NativeVideoData>): NativeVideoData {
    const categoria = pickRandom(CATEGORIAS_VIDEO);
    const tema = pickRandom(TEMAS_VIDEO);

    const defaultData: NativeVideoData = {
      video_type: VideoType.NATIVO,
      title: generateVideoTitle(categoria, tema),
      description: generateDescription(tema),
      // Rota entre los archivos disponibles para variar entre tests
      path: pickRandom([...NATIVE_VIDEO_PATHS]),
    };

    return { ...defaultData, ...overrides };
  }

  static createMany(
    count: number,
    overrides?: Partial<NativeVideoData>
  ): NativeVideoData[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}