import { By, Locator } from 'selenium-webdriver';

/**
 * Component Object para el modal de selección del tipo de nota (Post, Listicle, LiveBlog, etc.).
 */
export class NoteCreationModal {
    public createNoteModalBtn: Locator = By.css("button.btn-create-note");

    /**
    * Función de Locator para los tipos de nota en el modal de creación.
    * Requiere el mapa de índices del ambiente.
    * @param noteName El nombre legible de la nota (e.g., 'New Post', 'New Listicle').
    * @param noteTypeIndexMap El mapa de índices del ambiente (importado de env.config).
    * @returns Un Locator (By.css) que apunta al botón correcto.
    */
    public noteTypeBase(noteName: string, noteTypeIndexMap: { [key: string]: string }): Locator {
        const index = noteTypeIndexMap[noteName];
        if (index === undefined) {
            throw new Error(`Error de Locator: El tipo de nota "${noteName}" no está definido.`);
        }
        return By.css(`#option-dropdown-${index} label`);
    }
}

export const noteCreationModal = new NoteCreationModal();