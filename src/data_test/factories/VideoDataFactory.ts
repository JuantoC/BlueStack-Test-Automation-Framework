/**
 * VideoDataFactory.ts
 *
 * Genera fixtures dinámicos para Video YouTube, Video Nativo y Video Embebido.
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
  // Campo PROHIBIDO: path, iframe
}

export interface NativeVideoData extends VideoData {
  video_type: VideoType.NATIVO;
  title: string;
  path: string;      // Ruta relativa desde raíz del proyecto: src/data_test/archivo.mp4
  description?: string;
  // Campo PROHIBIDO: url, iframe
}

export interface EmbeddedVideoData extends VideoData {
  video_type: VideoType.EMBEDDED;
  iframe: string;       // URL de iframe embebido: https://www.youtube.com/embed/... u otros proveedores
  title: string;
  description?: string; // Obligatorio (a diferencia de YouTube y Nativo que lo tienen como opcional)
  // Campo PROHIBIDO: path, url
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

/**
 * URLs de iframes embebidos verificados de múltiples proveedores.
 * El formato difiere según la plataforma:
 *   - YouTube:  /embed/{id}
 *   - Vimeo:    /video/{id}
 *   - Dailymotion: /embed/video/{id}
 * Podés reemplazar estas URLs por iframes propios del CMS que estés probando.
 */
const EMBEDDED_IFRAME_URLS = [
  // YouTube embed
  '<iframe width="560" height="315" src="https://www.youtube.com/embed/PPViqH0fmW0?si=Od6dWSUqCN6eq60Z" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
  '<iframe width="560" height="315" src="https://www.youtube.com/embed/jNQXAC9IVRw?si=Od6dWSUqCN6eq60Z" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
  '<iframe width="560" height="315" src="https://www.youtube.com/embed/kJQP7kiw5Fk?si=Od6dWSUqCN6eq60Z" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
  '<iframe width="560" height="315" src="https://www.youtube.com/embed/OPf0YbXqDm0?si=Od6dWSUqCN6eq60Z" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
  '<iframe width="560" height="315" src="https://www.youtube.com/embed/pRpeEdMmmQ0?si=Od6dWSUqCN6eq60Z" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
  // Vimeo embed
  '<iframe width="560" height="315" src="https://player.vimeo.com/video/76979871?si=Od6dWSUqCN6eq60Z" title="Vimeo video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
  '<iframe width="560" height="315" src="https://player.vimeo.com/video/148751763?si=Od6dWSUqCN6eq60Z" title="Vimeo video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
  // Dailymotion embed
  '<iframe width="560" height="315" src="https://www.dailymotion.com/embed/video/x7tgd9g?si=Od6dWSUqCN6eq60Z" title="Dailymotion video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
  '<iframe width="560" height="315" src="https://www.dailymotion.com/embed/video/x7ywxrr?si=Od6dWSUqCN6eq60Z" title="Dailymotion video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
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

// ─── EmbeddedVideoDataFactory ──────────────────────────────────────────────────

export class EmbeddedVideoDataFactory {
  /**
   * Crea un fixture de Video Embebido con URL de iframe y metadata realista.
   * La `description` es obligatoria en este tipo (no opcional como en YouTube/Nativo).
   * El pool incluye iframes de YouTube, Vimeo y Dailymotion.
   *
   * Usa `overrides` para forzar campos específicos en un test puntual.
   *
   * @example
   * const video = EmbeddedVideoDataFactory.create();
   * const videoConUrl = EmbeddedVideoDataFactory.create({ url: 'https://www.youtube.com/embed/ABC123' });
   */
  static create(overrides?: Partial<EmbeddedVideoData>): EmbeddedVideoData {
    const categoria = pickRandom(CATEGORIAS_VIDEO);
    const tema = pickRandom(TEMAS_VIDEO);

    const defaultData: EmbeddedVideoData = {
      video_type: VideoType.EMBEDDED,
      iframe: pickRandom(EMBEDDED_IFRAME_URLS),
      title: generateVideoTitle(categoria, tema),
      description: generateDescription(tema),
    };

    return { ...defaultData, ...overrides };
  }

  /**
   * Crea múltiples videos embebidos únicos.
   * Útil para tests de paginación o subida en bulk.
   */
  static createMany(
    count: number,
    overrides?: Partial<EmbeddedVideoData>
  ): EmbeddedVideoData[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}