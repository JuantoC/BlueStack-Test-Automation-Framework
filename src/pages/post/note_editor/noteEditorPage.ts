import { WebDriver } from 'selenium-webdriver';
import { NoteAuthorField } from './authorField';
import { NoteFooterBtn } from './footerBtn';
import { NoteHeaderActions } from './headerActions';
import { NoteSidebarDropdow } from './sidebarDropdown';
import { NoteTextFields } from './textFields';
import { NoteImageFields } from './imageFields';
import { NoteCreationDropwdown } from './noteCreationDropdown';
import { RetryOptions } from '../../../core/wrappers/retry';
import { NoteData } from '../../../dataTest/noteDataInterface';
import { stackLabel } from '../../../core/utils/stackLabel';

/**
 * Orquestador de los Page Object para la página de edición de una nota.
*/
export class NoteEditorPage {
  public imageFields: NoteImageFields;
  public authorFields: NoteAuthorField;
  public footerBtn: NoteFooterBtn;
  public headerActions: NoteHeaderActions;
  public sidebarDropdown: NoteSidebarDropdow;
  public textFields: NoteTextFields;
  public driver: WebDriver
  public creationDropdow: NoteCreationDropwdown


  constructor(driver: WebDriver) {
    this.driver = driver;
    this.imageFields = new NoteImageFields()
    this.authorFields = new NoteAuthorField(driver)
    this.footerBtn = new NoteFooterBtn()
    this.headerActions = new NoteHeaderActions(driver)
    this.sidebarDropdown = new NoteSidebarDropdow()
    this.textFields = new NoteTextFields(driver)
    this.creationDropdow = new NoteCreationDropwdown(driver)
  }

  /**
     * Rellena todos los campos de la nota (texto, tags, autor, listicle, etc.)
     * @param data - El objeto NoteData completo.
     * @param timeout - Timeout para la operación
     * @param opts - Opciones de retry
     */
    async fillFields(data: Partial<NoteData>, timeout: number, opts: RetryOptions = {}): Promise<void> {
        const fullOpts = { ...opts, label: stackLabel(opts.label, 'NoteEditorPage.fillFields') };

        console.log(`[${fullOpts.label}] Iniciando llenado de campos...`);

        // 1. NoteTextFields para Textos, Tags y Listicles
        await this.textFields.fillNoteData(data, timeout, fullOpts);

        // 2. Manejar campos de autor
        if (data.authorType) {
            await this.authorFields.selectAuthorType(data.authorType, timeout, fullOpts);
        }
        if (data.authorName !== undefined && data.authorName.trim() !== "") {
            await this.authorFields.fillAuthorName(data.authorName, timeout, fullOpts);
        }
        if (data.authorDescription !== undefined && data.authorDescription.trim() !== "") {
            await this.authorFields.fillAuthorDescription(data.authorDescription, timeout, fullOpts);
        }

        // 3. (Opcional) Manejar campos de Imagen, si existieran
        // if (data.image) { await this.imageFields.fillImage(data.image, timeout, fullOpts); }

        console.log(`[${fullOpts.label}] Llenado de campos completado.`);
    }
}