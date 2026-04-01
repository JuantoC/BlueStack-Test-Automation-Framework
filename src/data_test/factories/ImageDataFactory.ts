/**
 * ImageDataFactory.ts
 *
 * Genera fixtures dinámicos para la subida de imágenes nativas al CMS.
 * A diferencia del circuito de videos, las imágenes no tienen distinción de tipos:
 * el único flujo es la subida de archivo local vía input[type="file"].
 *
 * El título por defecto se deriva del nombre del archivo (sin extensión), que es
 * lo que el CMS muestra en la tabla tras la subida. Puede sobreescribirse con `overrides`.
 */

import { faker } from '@faker-js/faker';
import path from 'path';
import { ImageData } from '../../interfaces/data.js';

export type { ImageData } from '../../interfaces/data.js';

// ─── Pool de archivos de imagen disponibles en el proyecto ─────────────────────

/**
 * Rutas relativas de los archivos de imagen disponibles para tests.
 * Deben existir en `src/data_test/images/` al momento de ejecutar el test.
 * Agregá más entradas si incorporás nuevos archivos de prueba.
 */
export const IMAGE_PATHS = [
  "src/data_test/images/jpg eris mushoku tensei.jpg",
  "src/data_test/images/jpg portada mushoku tensei.jpg",
  "src/data_test/images/Michael Bradway.webp",
  "src/data_test/images/png pajaro de colores.png",
] as const;

// ─── Helpers internos ──────────────────────────────────────────────────────────

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uniqueSuffix(): string {
  return Date.now().toString().slice(-6);
}

/**
 * Deriva el título esperado en la tabla del CMS a partir del nombre del archivo.
 * El CMS usa el nombre de archivo sin extensión como título predeterminado.
 * Se agrega un sufijo numérico único para evitar colisiones entre tests concurrentes.
 */
function titleFromPath(imagePath: string): string {
  const base = path.basename(imagePath, path.extname(imagePath));
  return `${base} - ${uniqueSuffix()}`;
}

// ─── ImageDataFactory ──────────────────────────────────────────────────────────

export class ImageDataFactory {
  /**
   * Crea un fixture de imagen nativa con ruta al archivo local.
   * El archivo debe estar disponible en `path` al momento de ejecutar el test.
   * El título se deriva del nombre del archivo si no se provee en `overrides`.
   *
   * @param overrides - Campos a sobreescribir para tests puntuales.
   *
   * @example
   * const image = ImageDataFactory.create();
   * const imageEspecifica = ImageDataFactory.create({ path: 'src/data_test/images/mi-imagen.jpg' });
   * const imageSinEsperaDeTabla = ImageDataFactory.create({ title: undefined });
   */
  static create(overrides?: Partial<ImageData>): ImageData {
    const imagePath = pickRandom(IMAGE_PATHS);

    const defaultData: ImageData = {
      path: imagePath,
      title: titleFromPath(imagePath),
      description: faker.lorem.sentence(),
    };

    return { ...defaultData, ...overrides };
  }

  /**
   * Crea múltiples fixtures de imagen únicos.
   * Útil para tests de paginación o subida en bulk.
   *
   * @param count - Cantidad de fixtures a generar.
   * @param overrides - Campos a sobreescribir en todos los fixtures generados.
   */
  static createMany(count: number, overrides?: Partial<ImageData>): ImageData[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}
