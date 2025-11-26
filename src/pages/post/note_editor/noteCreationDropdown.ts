import { Locator, WebDriver } from "selenium-webdriver";
import { clickSafe } from "../../../core/actions/clickSafe";
import { RetryOptions } from "../../../core/wrappers/retry";
import { stackLabel } from "../../../core/utils/stackLabel";

/**
 * Enum para los tipos de nota disponibles.
 */
export enum NoteType {
  POST = 'POST',
  LISTICLE = 'LISTICLE',
  LIVEBLOG = 'LIVEBLOG'
}

/**
 * Configuración de los tipos de nota con sus índices y nombres.
 */
const NOTE_TYPE_CONFIG: Record<NoteType, { index: string; displayName: string }> = {
  [NoteType.POST]: { index: '0', displayName: 'New Post' },
  [NoteType.LISTICLE]: { index: '1', displayName: 'New Listicle' },
  [NoteType.LIVEBLOG]: { index: '2', displayName: 'New LiveBlog' }
};

/**
 * Component Object para el dropdown de selección del tipo de nota (Post, Listicle, LiveBlog, etc.).
 */
export class NoteCreationDropwdown {
  public openDropdownBtn: Locator = By.css("button.btn-create-note");
  public driver: WebDriver

  constructor(driver: WebDriver){
    this.driver = driver
  }

  /**
   * Función de Locator para los tipos de nota en el modal de creación.
   * @param noteType El tipo de nota usando el enum NoteType.
   * @returns Un Locator (By.css) que apunta al botón correcto.
   */
  public getNoteTypeLocator(noteType: NoteType): Locator {
    const config = NOTE_TYPE_CONFIG[noteType];
    if (!config) {
      throw new Error(`Error de Locator: El tipo de nota "${noteType}" no está definido.`);
    }
    return By.css(`#option-dropdown-${config.index} label`);
  }

  /**
   * Obtiene el nombre de visualización de un tipo de nota.
   * @param noteType El tipo de nota usando el enum NoteType.
   * @returns El nombre legible del tipo de nota.
   */
  public getNoteTypeDisplayName(noteType: NoteType): string {
    return NOTE_TYPE_CONFIG[noteType].displayName;
  }

  async selectNoteType(noteType: NoteType, timeout: number, opts: RetryOptions): Promise<void> {
    const fullOpts: RetryOptions = {...opts, label: stackLabel(opts.label, `selectNoteType:${noteType}`)}
    
    console.log(`Iniciando selección del tipo de nota: ${noteType}`);
    // 1. Click en el botón para abrir el dropdown
    console.log("Haciendo click en el botón para abrir el dropdown...");
    await clickSafe(this.driver, this.openDropdownBtn, timeout, fullOpts);

    // 2. Click en la opción elegida
    const noteTypeOptionLocator = this.getNoteTypeLocator(noteType);
    const displayName = this.getNoteTypeDisplayName(noteType);
    
    console.log(`Haciendo click en la opción: "${displayName}"`);
    await clickSafe(this.driver, noteTypeOptionLocator, timeout, fullOpts);

    console.log(`Tipo de nota "${displayName}" seleccionado con éxito.`);
  }
}
