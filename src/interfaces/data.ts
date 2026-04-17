/** Tipo de autor que puede tener una nota. Derivado de los valores válidos en `NoteData.authorType`. */
export type AuthorType = 'INTERNAL' | 'ANONYMOUS' | 'MANUAL';

/**
 * Tipo discriminante de nota editorial del CMS.
 * Campo canónico para identificar el tipo de nota en objetos de datos y Page Objects.
 * Equivalente a `VideoType` en el contexto de videos.
 */
export type NoteType = 'POST' | 'LISTICLE' | 'LIVEBLOG' | 'AI_POST';

/** Tipo de video que puede ser subido. Valores soportados: YouTube, video nativo o embedded. */
export type VideoType  = 'YOUTUBE' | 'NATIVO' | 'EMBEDDED';

/**
 * Represent un ítem individual dentro de una sección de lista (listicle).
 * Cada ítem tiene un título y un cuerpo editable.
 * Usado como elemento de `ListicleData.listicleItems`.
 */
export interface ListicleItem {
  title: string;
  body: string;
}

/**
 * Documento de evento para secciones de LiveBlog.
 * Contiene metadata del evento tales como título, descripción, lugar y dirección.
 * ⚠️ El campo `eventAdress` conserva intencionalmente el typo del backend para compatibilidad con la UI.
 */
export interface EventLiveBlog {
  eventTitle?: string;
  eventDescription?: string;
  placeOfEvent?: string;
  /** Typo preservado intencionalmente para compatibilidad con la UI */
  eventAdress?: string;
}

/**
 * Datos editable de una nota para el formulario del editor del CMS.
 * Base de otros tipos como `PostData`, `ListicleData` y `LiveBlogData`.
 * Todos los campos son opcionales para permitir relleno parcial en tests de datos.
 *
 * El campo `noteType` es el discriminante canónico del tipo de nota, equivalente a
 * `videoType` en `VideoData`. Cada subtipo lo fija como literal requerido.
 */
export interface NoteData {
  /** Tipo discriminante de nota. Requerido en subtipos concretos (`PostData`, `ListicleData`, `LiveBlogData`). */
  noteType?: NoteType;

  // Campos de texto principales
  title?: string;
  secondaryTitle?: string;
  subTitle?: string;
  halfTitle?: string;
  body?: string;
  summary?: string;

  // Tags
  tags?: string[];
  hiddenTags?: string[];

  // Autor
  authorName?: string;
  authorDescription?: string;
  authorType?: AuthorType;

  listicleItems?: ListicleItem[];

  eventLiveBlog?: EventLiveBlog;
}

/**
 * Datos de un post completo para el formulario del editor.
 * Extiende `NoteData` con validación de campos requeridos (title, body, tags, authorName, authorType).
 * ⚠️ Campos prohibidos: `secondaryTitle`, `halfTitle`, `listicleItems`, `eventLiveBlog`.
 * Estos son derivados automáticamente por el backend y no deben ser enviados.
 */
export interface PostData extends NoteData {
  noteType: 'POST';
  title: string;
  body: string;
  tags: string[];
  authorName: string;
  authorType: AuthorType;
  // Campos PROHIBIDOS: secondaryTitle, halfTitle, listicleItems, eventLiveBlog
}

/**
 * Datos de una nota listicle (artículo en formato de lista) para el editor.
 * Extiende `NoteData` con validación de lista de ítems (`listicleItems`).
 * ⚠️ Campos prohibidos: `secondaryTitle`, `halfTitle`, `eventLiveBlog`.
 */
export interface ListicleData extends NoteData {
  noteType: 'LISTICLE';
  title: string;
  body: string;
  tags: string[];
  authorName: string;
  authorType: AuthorType;
  listicleItems: ListicleItem[];
  // Campos PROHIBIDOS: secondaryTitle, halfTitle, eventLiveBlog
}

/**
 * Datos de un evento de livestream/liveblog para el editor.
 * Extiende `NoteData` con validación de ítems y evento (`eventLiveBlog`).
 * ⚠️ Campos prohibidos: `secondaryTitle`, `halfTitle`, `body`.
 */
export interface LiveBlogData extends NoteData {
  noteType: 'LIVEBLOG';
  title: string;
  tags: string[];
  authorName: string;
  listicleItems: ListicleItem[];
  eventLiveBlog: EventLiveBlog;
  // Campos PROHIBIDOS: secondaryTitle, halfTitle, body
}

/**
 * Datos base de un video para el formulario de subida.
 * Define la estructura común a todos los tipos de video.
 * Cada subtipo (`YoutubeVideoData`, `NativeVideoData`, `EmbeddedVideoData`) refina el contrato.
 */
export interface VideoData {
  videoType: VideoType
  url?: string;
  iframe?: string;
  title: string;
  description?: string;
  path?: string;
}

/**
 * Datos específicos de un video alojado en YouTube.
 * Requiere obligatoriamente una URL válida de YouTube.
 */
export interface YoutubeVideoData extends VideoData {
  videoType: 'YOUTUBE';
  url: string;
  title: string;
  description?: string;
}

/**
 * Datos específicos de un video nativo (alojado localmente o en CDN).
 * Requiere obligatoriamente una ruta (`path`) válida del servidor.
 */
export interface NativeVideoData extends VideoData {
  videoType: 'NATIVO';
  title: string;
  path: string;
  description?: string;
}

/**
 * Datos específicos de un video embebido (iframe externo).
 * Requiere obligatoriamente un código iframe válido (HTML embed code).
 */
export interface EmbeddedVideoData extends VideoData {
  videoType: 'EMBEDDED';
  iframe: string;
  title: string;
  description?: string;
}

/**
 * Datos para la generación asistida por IA de notas.
 * Parámetros de contexto y tono que controlan el asistente IA del CMS.
 * `noteType` es requerido y siempre `'AI_POST'` — igual que `PostData.noteType: 'POST'`.
 * `generateNewAINote()` recibe `Partial<AIDataNote>`, por lo que internamente sigue siendo opcional al pasar al modal.
 */
export interface AIDataNote {
  noteType: 'AI_POST';
  task?: string;
  context?: string;
  section?: number;
  paragraph?: number;
  tone?: number;
  language?: number;
}

/**
 * Datos para la creación de un nuevo tag en el Gestor de Tags del CMS.
 * El campo `title` es obligatorio. Los demás son opcionales y solo se interactúan
 * si están presentes en el objeto de datos.
 */
export interface TagData {
  /** Nombre del tag (campo obligatorio). */
  title: string;
  /** Descripción corta del tag (CKEditor). */
  description?: string;
  /** Lista de sinónimos del tag; cada uno se confirma con Enter en el chip input. */
  synonyms?: string[];
  /** Tipo del tag (mat-select "Tipo" en el panel de Configuración). Ej: 'tags_gammers'. */
  tipo?: string;
  /** Estado del tag (mat-select "Estado"). Ej: 'Aprobados', 'Desaprobados'. */
  estado?: string;
}

/**
 * Datos para la subida de una imagen nativa al CMS.
 * No existe distinción de tipos de imagen equivalente a `VideoType`:
 * el único flujo soportado es la subida de archivo local vía `input[type="file"]`.
 *
 * @see UploadImageBtn.sendFileToUploadInput
 */
export interface ImageData {
  /** Ruta relativa al archivo de imagen desde la raíz del proyecto. */
  path: string;
  /**
   * Título que se espera ver en la tabla tras la subida (usualmente el nombre del archivo sin extensión).
   * Si no se provee, se omite la verificación de presencia post-subida en la tabla.
   */
  title?: string;
  /** Descripción opcional de la imagen. */
  description?: string;
}

