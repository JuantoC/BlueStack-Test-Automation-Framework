import { AuthorType } from "../pages/post_page/note_editor_page/EditorAuthorSection.js";
import { VideoType } from "../pages/videos_page/UploadVideoBtn.js";

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

  listicleItems?: Array<{
    title: string;
    body: string;
  }>;

  eventLiveBlog?: {
    eventTitle?: string;
    eventDescription?: string;
    placeOfEvent?: string;
    eventAdress?: string;
  }
}

export interface VideoData {
  video_type: VideoType
  url?: string;
  title: string;
  description?: string;
  path?: string;
}

export interface AIDataNote {
  task?: string;
  context?: string;
  section?: number;
  paragraph?: number;
  tone?: number;
  language?: number;
}

