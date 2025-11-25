import { By, Locator } from 'selenium-webdriver';

/**
 * Component Object para el drowpdown de selección del tipo de nota (Post, Listicle, LiveBlog, etc.).
 */
export class NoteCreationModalPage {
  public openDropdownBtn: Locator = By.css("button.btn-create-note");

  /**
  * Función de Locator para los tipos de nota en el modal de creación.
  * Requiere el mapa de índices del ambiente.
  * @param noteName El nombre legible de la nota (e.g., 'New Post', 'New Listicle').
  * @returns Un Locator (By.css) que apunta al botón correcto.
  */
  public getNoteTypeLocator(noteName: NoteType): Locator {
    const index = noteTypeIndexMap[noteName];
    if (index === undefined) {
      throw new Error(`Error de Locator: El tipo de nota "${noteName}" no está definido.`);
    }
    return By.css(`#option-dropdown-${index} label`);
  }
}

export const noteTypeIndexMap: Record<string, string> = {
  'New Post': '0',
  'New Listicle': '1',
  'New LiveBlog': '2',
};
export enum NoteType {
  POST = 'New Post',
  LISTICLE = 'New Listicle',
  LIVEBLOG = 'New LiveBlog'
}
export const noteCreationModalPage = new NoteCreationModalPage();