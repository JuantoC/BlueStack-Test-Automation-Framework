/**
 * AINoteDataFactory.ts
 *
 * Genera fixtures dinámicos para la generación de Notas IA en el CMS.
 * Reemplaza el array estático de src/data_test/AIData.ts.
 * Cada llamada produce datos únicos para evitar colisiones entre tests.
 *
 * Variables del modelo:
 *  - task:      Prompt que describe el artículo a generar.
 *  - context:   Perfil del periodista/autor simulado.
 *  - section:   ID numérico del combo de secciones (indistinto para tests).
 *  - paragraph: Cantidad de párrafos del artículo (1–8, relevante para el test).
 *  - tone:      ID numérico del combo de tonos (indistinto para tests).
 *  - language:  ID numérico del combo de idiomas (indistinto para tests).
 */

import { AIDataNote } from '../../interfaces/data.js';

// ─── Tipos auxiliares ──────────────────────────────────────────────────────────

export type ThematicGroup =
  | 'politica'
  | 'gastronomia'
  | 'tecnologia'
  | 'deportes'
  | 'cultura'
  | 'economia'
  | 'ciencia'
  | 'entretenimiento';

export interface AINoteData extends AIDataNote {
  task: string;
  context: string;
  section: number;
  paragraph: number;
  tone: number;
  language: number;
}

// ─── Helpers internos ──────────────────────────────────────────────────────────

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** section, tone y language son IDs de combos: cualquier valor entre 0–3 es válido en tests. */
function randomComboId(): number {
  return Math.floor(Math.random() * 4); // 0, 1, 2 o 3
}

/** Párrafos: entre 1 y 8 por defecto, controlable vía overrides. */
function randomParagraphs(min = 1, max = 8): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Pools temáticos ───────────────────────────────────────────────────────────

/**
 * Cada grupo temático tiene:
 *  - contexts: perfiles de periodistas/autores representativos del área.
 *  - tasks:    prompts de artículos específicos del tema.
 *
 * Usá `AINoteDataFactory.createFromGroup('gastronomia')` para forzar un grupo,
 * o `AINoteDataFactory.create()` para que se elija aleatoriamente.
 */
const THEMATIC_POOLS: Record<ThematicGroup, { contexts: string[]; tasks: string[] }> = {

  politica: {
    contexts: [
      'Periodista político de línea progresista, especializado en derechos humanos y políticas sociales en Argentina',
      'Columnista conservador con foco en economía de mercado, seguridad y valores tradicionales',
      'Analista político independiente, sin afiliación partidaria, con enfoque en datos electorales y encuestas',
      'Periodista oficialista con cobertura del gobierno nacional y comunicación institucional',
      'Militante y comunicador de izquierda, especializado en movimientos sociales y sindicalismo',
      'Senador nacional que escribe columnas de opinión sobre legislación y política exterior',
      'Diputada provincial con voz en temas de género, educación y presupuesto público',
    ],
    tasks: [
      'Escribir una nota de análisis sobre el impacto de las últimas medidas económicas del gobierno en los sectores más vulnerables',
      'Redactar un artículo de opinión sobre el rol de la oposición frente al ajuste fiscal y sus consecuencias sociales',
      'Crear una nota informativa sobre el resultado de las últimas elecciones provinciales y sus proyecciones nacionales',
      'Generar un artículo sobre la crisis de representación política y el auge de candidatos outsider en Latinoamérica',
      'Escribir una columna sobre el debate de la reforma previsional y sus efectos en los jubilados argentinos',
      'Redactar una nota sobre las tensiones diplomáticas entre Argentina y sus socios del Mercosur',
    ],
  },

  gastronomia: {
    contexts: [
      'Chef profesional con restaurante en Palermo, especializado en cocina de autor y fusión latinoamericana',
      'Crítico gastronómico del diario La Nación con 15 años cubriendo la escena culinaria porteña',
      'Foodie y creadora de contenido digital especializada en street food y cocina regional argentina',
      'Sommelier certificado y periodista de vinos, con foco en bodegas de Mendoza y Patagonia',
      'Nutricionista y divulgadora de alimentación saludable, con columna en revista de bienestar',
      'Cocinero autodidacta especializado en recetas tradicionales del norte argentino y cocina andina',
    ],
    tasks: [
      'Escribir una nota sobre las nuevas tendencias en cocina de fusión que están transformando la gastronomía porteña',
      'Redactar un artículo sobre el auge de los mercados de productores orgánicos y su impacto en la alimentación urbana',
      'Crear una nota sobre los mejores restaurantes para probar cocina regional argentina en Buenos Aires',
      'Generar un artículo sobre la cultura del asado argentino y su evolución en las nuevas generaciones',
      'Escribir una columna sobre el crecimiento de la gastronomía vegana y plant-based en el mercado local',
      'Redactar una nota sobre el turismo gastronómico en la región cuyana y el maridaje con vinos de alta gama',
    ],
  },

  tecnologia: {
    contexts: [
      'Periodista tecnológico argentino, divulgador científico, especializado en inteligencia artificial y startups',
      'Developer full-stack y tech writer con columna semanal sobre herramientas para programadores',
      'Investigadora en ciberseguridad con foco en privacidad digital y regulación tecnológica en Latinoamérica',
      'Emprendedor serial del ecosistema startup local, columnista en medios de negocios y tecnología',
      'Docente universitaria de ingeniería informática y escritora de divulgación científica para el público general',
      'Periodista especializado en fintech, criptomonedas y el impacto del blockchain en la economía argentina',
    ],
    tasks: [
      'Crear una nota sobre cómo los modelos de lenguaje avanzados están transformando la producción de contenido periodístico',
      'Redactar un artículo sobre el impacto de la inteligencia artificial en el mercado laboral argentino',
      'Escribir una nota sobre el ecosistema de startups tecnológicas en Buenos Aires y sus principales desafíos de financiamiento',
      'Generar un artículo sobre la regulación de la inteligencia artificial en Argentina y el debate sobre ética algorítmica',
      'Crear una nota sobre el crecimiento del trabajo remoto y las herramientas digitales que lo hacen posible',
      'Redactar un artículo sobre ciberseguridad para pymes: los principales riesgos y cómo mitigarlos',
    ],
  },

  deportes: {
    contexts: [
      'Periodista deportivo de TyC Sports, especializado en fútbol argentino y selección nacional',
      'Comentarista de básquet con foco en la Liga Nacional y la NBA, con columna en Olé',
      'Ex jugador de rugby convertido en analista táctico y columnista en La Nación Deportes',
      'Periodista de deportes de aventura y running, con cobertura de ultramaratones y Ironman',
      'Cronista de tenis con seguimiento del circuito ATP/WTA y cobertura de Grand Slams',
    ],
    tasks: [
      'Escribir una nota sobre las expectativas de la selección argentina de fútbol en las próximas eliminatorias mundialistas',
      'Redactar un análisis táctico sobre el rendimiento de los equipos argentinos en la Copa Libertadores',
      'Crear una nota sobre el crecimiento del pádel en Argentina y su impacto en la cultura deportiva urbana',
      'Generar un artículo sobre el negocio del fútbol argentino: pases, derechos de TV y economía de los clubes',
      'Escribir una columna sobre el legado de Messi y su influencia en las nuevas generaciones de futbolistas argentinos',
    ],
  },

  cultura: {
    contexts: [
      'Crítico literario y editor de una revista cultural independiente con base en Buenos Aires',
      'Periodista cultural especializada en teatro, danza y artes escénicas del circuito alternativo porteño',
      'Escritor y ensayista con foco en identidad latinoamericana, memoria colectiva y cultura popular',
      'Curadora de arte contemporáneo y columnista sobre el mercado del arte en Argentina y la región',
      'Periodista de música con cobertura de la escena independiente local y festivales de rock y pop',
    ],
    tasks: [
      'Escribir una nota sobre el resurgimiento de la literatura argentina contemporánea en el mercado editorial internacional',
      'Redactar un artículo sobre el impacto cultural del streaming en el consumo de cine y series en Argentina',
      'Crear una nota sobre los festivales culturales más importantes de Buenos Aires y su rol en la identidad porteña',
      'Generar un artículo sobre el arte callejero en Buenos Aires como expresión política y cultural',
      'Escribir una columna sobre la crisis del teatro independiente y las políticas culturales necesarias para sostenerlo',
    ],
  },

  economia: {
    contexts: [
      'Economista y periodista financiero especializado en macroeconomía argentina y mercados emergentes',
      'Consultora económica con foco en pymes, emprendedores y acceso al crédito en el mercado local',
      'Periodista de negocios internacionales con análisis de comercio exterior y acuerdos bilaterales',
      'Ex funcionario del Banco Central reconvertido en analista y columnista de política monetaria',
      'Economista feminista con foco en brecha salarial, economía del cuidado y políticas de género',
    ],
    tasks: [
      'Redactar una nota sobre el impacto de la inflación en el poder adquisitivo de los trabajadores argentinos',
      'Crear un artículo sobre las perspectivas del tipo de cambio y el mercado de divisas en Argentina',
      'Escribir una nota sobre el rol de las pymes en la economía argentina y los desafíos del acceso al financiamiento',
      'Generar un análisis sobre el comercio exterior argentino: exportaciones, balanza comercial y acuerdos con China',
      'Redactar una columna sobre el impacto económico del turismo receptivo en Argentina post-pandemia',
    ],
  },

  ciencia: {
    contexts: [
      'Investigadora del CONICET especializada en biología molecular y divulgación científica para el público general',
      'Físico y astrofísico con columna mensual en Infobae sobre exploración espacial y cosmología',
      'Médica especialista en salud pública con foco en epidemiología y políticas sanitarias en Latinoamérica',
      'Biólogo marino y activista ambiental con cobertura de la crisis climática y biodiversidad marina',
      'Periodista científico especializado en neurociencias y avances en salud mental',
    ],
    tasks: [
      'Escribir una nota sobre los últimos avances del CONICET en biotecnología y su impacto potencial en la agricultura',
      'Redactar un artículo sobre la exploración espacial latinoamericana y el rol de Argentina en la industria satelital',
      'Crear una nota sobre el cambio climático en la Patagonia: evidencias científicas y proyecciones para los próximos años',
      'Generar un artículo sobre las nuevas terapias génicas y su potencial para tratar enfermedades raras en Argentina',
      'Escribir una columna sobre salud mental en tiempos de crisis: qué dice la ciencia sobre ansiedad y resiliencia',
    ],
  },

  entretenimiento: {
    contexts: [
      'Periodista de espectáculos con cobertura de farándula, TV y redes sociales en Argentina',
      'Crítica de cine y series con columna semanal en un medio digital de cultura pop',
      'Influencer reconvertido en periodista digital, especializado en tendencias de TikTok e Instagram',
      'Conductor de podcast sobre pop culture, música urbana y entretenimiento latinoamericano',
    ],
    tasks: [
      'Redactar una nota sobre los reality shows más vistos del momento y su impacto en la cultura popular argentina',
      'Crear un artículo sobre el fenómeno de los influencers argentinos y su expansión en el mercado regional',
      'Escribir una nota sobre las series argentinas que están conquistando plataformas internacionales como Netflix y HBO',
      'Generar un artículo sobre el renacimiento de la cumbia y el cuarteto en la escena musical argentina actual',
      'Redactar una columna sobre el impacto del K-Pop y la cultura coreana en los jóvenes argentinos',
    ],
  },

};

// ─── AINoteDataFactory ─────────────────────────────────────────────────────────

export class AINoteDataFactory {
  /**
   * Crea un fixture de AIDataNote eligiendo un grupo temático al azar.
   * Usa `overrides` para forzar campos específicos en un test puntual.
   *
   * @example
   * const note = AINoteDataFactory.create();
   * const noteCorta = AINoteDataFactory.create({ paragraph: 2 });
   */
  static create(overrides?: Partial<AIDataNote>): AIDataNote {
    const groups = Object.keys(THEMATIC_POOLS) as ThematicGroup[];
    const group = pickRandom(groups);
    return this.createFromGroup(group, overrides);
  }

  /**
   * Crea un fixture de AIDataNote dentro de un grupo temático específico.
   * Garantiza que el contexto y la task pertenezcan al mismo universo temático.
   *
   * @example
   * const nota = AINoteDataFactory.createFromGroup('politica');
   * const notaGastro = AINoteDataFactory.createFromGroup('gastronomia', { paragraph: 4 });
   */
  static createFromGroup(
    group: ThematicGroup,
    overrides?: Partial<AIDataNote>
  ): AIDataNote {
    const pool = THEMATIC_POOLS[group];

    const defaultData: AIDataNote = {
      task: pickRandom(pool.tasks),
      context: pickRandom(pool.contexts),
      section: randomComboId(),
      paragraph: randomParagraphs(),
      tone: randomComboId(),
      language: randomComboId(),
    };

    return { ...defaultData, ...overrides };
  }

  /**
   * Crea múltiples fixtures al azar (grupos variados).
   * Útil para tests de generación en bulk o stress testing del endpoint de IA.
   *
   * @example
   * const notas = AINoteDataFactory.createMany(5);
   */
  static createMany(
    count: number,
    overrides?: Partial<AIDataNote>
  ): AIDataNote[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Crea múltiples fixtures dentro de un mismo grupo temático.
   * Útil para validar coherencia de resultados bajo un mismo contexto.
   *
   * @example
   * const notas = AINoteDataFactory.createManyFromGroup('tecnologia', 3);
   */
  static createManyFromGroup(
    group: ThematicGroup,
    count: number,
    overrides?: Partial<AIDataNote>
  ): AIDataNote[] {
    return Array.from({ length: count }, () =>
      this.createFromGroup(group, overrides)
    );
  }
}