/**
 * NoteDataFactory.ts
 *
 * Genera fixtures dinámicos para Post, Listicle y LiveBlog.
 * Reemplaza los arrays estáticos de src/data_test/noteData.ts.
 * Cada llamada produce datos únicos para evitar colisiones entre tests.
 *
 * Compatible con GitHub Actions sin cambios adicionales.
 */

import { faker } from '@faker-js/faker';
import type { AuthorType } from '../../pages/post_page/note_editor_page/EditorAuthorSection.js';
import { NoteData } from '../../interfaces/data.js';

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface PostData extends NoteData {
  title: string;
  subTitle?: string;
  body: string;
  tags: string[];
  hiddenTags?: string[];
  authorName: string;
  authorDescription?: string;
  authorType: AuthorType;
  // Campos PROHIBIDOS en Post: secondaryTitle, halfTitle, listicleItems, eventLiveBlog
}

export interface ListicleItem {
  title: string;
  body: string;
}

export interface ListicleData extends NoteData {
  title: string;
  subTitle?: string;
  body: string;
  tags: string[];
  hiddenTags?: string[];
  authorName: string;
  authorDescription?: string;
  authorType: AuthorType;
  listicleItems: ListicleItem[]; // mínimo 3, máximo 20
  // Campos PROHIBIDOS en Listicle: secondaryTitle, halfTitle, eventLiveBlog
}

export interface EventLiveBlog {
  eventTitle: string;
  [key: string]: unknown; // campos opcionales del evento
}

export interface LiveBlogData extends NoteData {
  title: string;
  subTitle?: string;
  tags: string[];
  hiddenTags?: string[];
  authorName: string;
  authorDescription?: string;
  listicleItems: ListicleItem[]; // entradas cronológicas, mínimo 5
  eventLiveBlog: EventLiveBlog;
  // Campos PROHIBIDOS en LiveBlog: secondaryTitle, halfTitle, body
}

// ─── Pools de datos en español ─────────────────────────────────────────────────

const TEMAS_TECNOLOGIA = [
  'inteligencia artificial', 'machine learning', 'ciberseguridad',
  'desarrollo web', 'cloud computing', 'blockchain', 'IoT',
  'automatización', 'DevOps', 'microservicios',
];

const TEMAS_CULTURA = [
  'cine independiente', 'literatura latinoamericana', 'música electrónica',
  'fotografía urbana', 'arquitectura contemporánea', 'diseño gráfico',
  'videojuegos indie', 'podcasts', 'streaming', 'arte digital',
];

const TEMAS_NEGOCIOS = [
  'startups', 'emprendimiento', 'marketing digital',
  'e-commerce', 'fintech', 'economía circular',
  'liderazgo', 'productividad', 'innovación', 'sustentabilidad',
];

const TODOS_TEMAS = [...TEMAS_TECNOLOGIA, ...TEMAS_CULTURA, ...TEMAS_NEGOCIOS];

const AUTORES = [
  { name: 'Valentina Cruz', description: 'Frontend Developer especializada en estándares web' },
  { name: 'Martín Solís', description: 'Periodista tecnológico con foco en IA y privacidad' },
  { name: 'Lucía Fernández', description: 'Editora de contenidos digitales y estrategia SEO' },
  { name: 'Sebastián Ramos', description: 'Desarrollador full-stack y escritor técnico' },
  { name: 'Camila Torres', description: 'Especialista en UX y accesibilidad web' },
  { name: 'Diego Méndez', description: 'Analista de datos y visualización de información' },
  { name: 'Sofía Ibáñez', description: 'Consultora en transformación digital para PYMEs' },
  { name: 'Andrés Villalba', description: 'Fotógrafo y productor audiovisual' },
];

// ─── Helpers internos ──────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomAuthor() {
  return pickRandom(AUTORES);
}

function generateTags(tema: string, count = 3): string[] {
  const palabras = tema.split(' ');
  const extras = [
    faker.word.adjective(),
    faker.word.noun(),
    'tendencias',
    'análisis',
    'guía',
  ];
  return [...palabras, ...extras]
    .slice(0, count)
    .map(t => t.toLowerCase().replace(/\s+/g, '-'));
}

/**
 * Timestamp compacto para garantizar unicidad de títulos entre ejecuciones.
 * Formato: sufijo numérico corto, legible pero único.
 */
function uniqueSuffix(): string {
  return Date.now().toString().slice(-6);
}

// ─── PostDataFactory ───────────────────────────────────────────────────────────

export class PostDataFactory {
  /**
   * Crea un Post con datos realistas en español.
   * Usa `overrides` para forzar campos específicos en un test puntual.
   *
   * @example
   * const post = PostDataFactory.create();
   * const postPrivado = PostDataFactory.create({ authorType: AuthorType.BYLINE });
   */
  static create(overrides?: Partial<PostData>): PostData {
    const tema = pickRandom(TODOS_TEMAS);
    const autor = pickRandomAuthor();

    const defaultData: PostData = {
      title: `${faker.word.adjective({ strategy: 'closest' })} enfoque en ${tema} - ${uniqueSuffix()}`,
      subTitle: `Todo lo que necesitás saber sobre ${tema} en ${new Date().getFullYear()}`,
      body: [
        faker.lorem.paragraph(4),
        faker.lorem.paragraph(3),
        faker.lorem.paragraph(3),
      ].join('\n\n'),
      tags: generateTags(tema, 3),
      hiddenTags: [faker.word.noun(), 'contenido-editorial'],
      authorName: autor.name,
      authorDescription: autor.description,
      authorType: 'MANUAL',
    };

    return { ...defaultData, ...overrides };
  }

  /**
   * Crea múltiples Posts únicos. Útil para tests de paginación o listados.
   */
  static createMany(count: number, overrides?: Partial<PostData>): PostData[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

// ─── ListicleDataFactory ───────────────────────────────────────────────────────

export class ListicleDataFactory {
  /**
   * Crea un Listicle con `itemCount` items coherentes con el tema.
   * El título incluye el conteo para respetar la convención del proyecto.
   *
   * @example
   * const listicle = ListicleDataFactory.create({ itemCount: 7 });
   */
  static create(
    overrides?: Partial<ListicleData> & { itemCount?: number }
  ): ListicleData {
    const { itemCount = faker.number.int({ min: 3, max: 20 }), ...rest } = overrides ?? {};
    const tema = pickRandom(TODOS_TEMAS);
    const autor = pickRandomAuthor();

    const items = ListicleDataFactory.generateItems(tema, itemCount);

    const defaultData: ListicleData = {
      title: `${itemCount} claves sobre ${tema} que no podés ignorar - ${uniqueSuffix()}`,
      subTitle: `Una guía práctica sobre ${tema} para el día a día`,
      body: `Exploramos los aspectos más relevantes de ${tema} en el contexto actual. ${faker.lorem.sentence()}`,
      tags: generateTags(tema, 3),
      hiddenTags: ['listicle', faker.word.adjective()],
      authorName: autor.name,
      authorDescription: autor.description,
      authorType: 'MANUAL',
      listicleItems: items,
    };

    return { ...defaultData, ...rest };
  }

  static createMany(
    count: number,
    overrides?: Partial<ListicleData> & { itemCount?: number }
  ): ListicleData[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  private static generateItems(tema: string, count: number): ListicleItem[] {
    const verbos = ['Entender', 'Aplicar', 'Conocer', 'Dominar', 'Explorar', 'Analizar', 'Implementar', 'Evaluar', 'Adoptar', 'Optimizar'];
    return Array.from({ length: count }, (_, i) => ({
      title: `${verbos[i % verbos.length]} ${tema}`,
      body: faker.lorem.paragraph(2),
    }));
  }
}

// ─── LiveBlogDataFactory ───────────────────────────────────────────────────────

export class LiveBlogDataFactory {
  /**
   * Crea un LiveBlog con entradas cronológicas simuladas.
   * Mínimo 5 items (recomendado 10+).
   *
   * @example
   * const liveblog = LiveBlogDataFactory.create({ entryCount: 10 });
   * const evento = LiveBlogDataFactory.create({ eventLiveBlog: { eventTitle: 'Conferencia Tech 2025' } });
   */
  static create(
    overrides?: Partial<LiveBlogData> & { entryCount?: number }
  ): LiveBlogData {
    const { entryCount = faker.number.int({ min: 3, max: 20 }), ...rest } = overrides ?? {};
    const tema = pickRandom(TODOS_TEMAS);
    const autor = pickRandomAuthor();
    const eventTitle = `Cumbre de ${tema} ${new Date().getFullYear()}`;

    const defaultData: LiveBlogData = {
      title: `EN VIVO: ${eventTitle} - ${uniqueSuffix()}`,
      subTitle: `Seguí todas las novedades de ${eventTitle} en tiempo real`,
      tags: generateTags(tema, 3),
      hiddenTags: ['liveblog', 'en-vivo'],
      authorName: autor.name,
      authorDescription: autor.description,
      listicleItems: LiveBlogDataFactory.generateEntries(entryCount),
      eventLiveBlog: {
        eventTitle,
      },
    };

    // Merge profundo para eventLiveBlog si se pasa en overrides
    return {
      ...defaultData,
      ...rest,
      eventLiveBlog: {
        ...defaultData.eventLiveBlog,
        ...(rest.eventLiveBlog ?? {}),
      },
    };
  }

  static createMany(
    count: number,
    overrides?: Partial<LiveBlogData> & { entryCount?: number }
  ): LiveBlogData[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Genera entradas cronológicas con formato "HH:MM - Descripción"
   * comenzando a las 09:00 con intervalos de 10-20 minutos.
   */
  private static generateEntries(count: number): ListicleItem[] {
    let hour = 9;
    let minute = 0;

    return Array.from({ length: count }, (_, i) => {
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

      // Avanzar entre 10 y 20 minutos para la siguiente entrada
      minute += faker.number.int({ min: 10, max: 20 });
      if (minute >= 60) { hour += 1; minute -= 60; }

      const acciones = [
        'Apertura del evento',
        'Inicio de la sesión principal',
        'Primera presentación',
        'Panel de expertos',
        'Ronda de preguntas',
        'Descanso y networking',
        'Segunda sesión',
        'Demostración en vivo',
        'Anuncio especial',
        'Sesión de cierre',
        'Palabras finales',
        'Conclusiones y próximos pasos',
      ];

      const accion = acciones[i] ?? faker.lorem.words(4);

      return {
        title: `${timeStr} - ${accion}`,
        body: faker.lorem.paragraph(2),
      };
    });
  }
}