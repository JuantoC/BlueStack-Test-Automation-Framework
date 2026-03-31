export type AuthorType = 'INTERNAL' | 'ANONYMOUS' | 'MANUAL';
export type VideoType  = 'YOUTUBE' | 'NATIVO' | 'EMBEDDED';

export interface ListicleItem {
  title: string;
  body: string;
}

export interface EventLiveBlog {
  eventTitle?: string;
  eventDescription?: string;
  placeOfEvent?: string;
  /** Typo preservado intencionalmente para compatibilidad con la UI */
  eventAdress?: string;
}

export interface NoteData {
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

export interface PostData extends NoteData {
  title: string;
  body: string;
  tags: string[];
  authorName: string;
  authorType: AuthorType;
  // Campos PROHIBIDOS: secondaryTitle, halfTitle, listicleItems, eventLiveBlog
}

export interface ListicleData extends NoteData {
  title: string;
  body: string;
  tags: string[];
  authorName: string;
  authorType: AuthorType;
  listicleItems: ListicleItem[];
  // Campos PROHIBIDOS: secondaryTitle, halfTitle, eventLiveBlog
}

export interface LiveBlogData extends NoteData {
  title: string;
  tags: string[];
  authorName: string;
  listicleItems: ListicleItem[];
  eventLiveBlog: EventLiveBlog;
  // Campos PROHIBIDOS: secondaryTitle, halfTitle, body
}

export interface VideoData {
  video_type: VideoType
  url?: string;
  iframe?: string;
  title: string;
  description?: string;
  path?: string;
}

export interface YoutubeVideoData extends VideoData {
  video_type: 'YOUTUBE';
  url: string;
  title: string;
  description?: string;
}

export interface NativeVideoData extends VideoData {
  video_type: 'NATIVO';
  title: string;
  path: string;
  description?: string;
}

export interface EmbeddedVideoData extends VideoData {
  video_type: 'EMBEDDED';
  iframe: string;
  title: string;
  description?: string;
}

export interface AIDataNote {
  task?: string;
  context?: string;
  section?: number;
  paragraph?: number;
  tone?: number;
  language?: number;
}

