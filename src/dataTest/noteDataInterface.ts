import { AuthorType } from "../pages/post/note_editor/NoteAuthorSection.js";

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
        eventTitle: string;
        eventDescription: string;
        placeOfEvent: string;
        eventAdress: string;
    }
}