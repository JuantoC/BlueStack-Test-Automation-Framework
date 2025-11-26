import { By, Locator, WebDriver } from 'selenium-webdriver';
import { NoteAuthorField } from './authorField';
import { NoteFooterBtn } from './footerBtn';
import { NoteHeaderActions } from './headerActions';
import { NoteSidebarDropdow } from './sidebarDropdown';
import { NoteTextField, NoteTextFields } from './textFields';
import { NoteImageFields } from './imageFields';
import { NoteData } from '../../../dataTest/noteDataInterface';
import { RetryOptions } from '../../../core/wrappers/retry';
import { stackLabel } from '../../../core/utils/stackLabel';
// Mapeo entre la clave de NoteData y la clave del enum NoteTextField
const NOTE_TEXT_FIELD_MAP: Record<keyof NoteData, NoteTextField> = {
  title: NoteTextField.TITLE,
  secondaryTitle: NoteTextField.SECONDARY_TITLE,
  subTitle: NoteTextField.SUB_TITLE,
  halfTitle: NoteTextField.HALF_TITLE,
  body: NoteTextField.BODY,
  summary: NoteTextField.SUMMARY,
} as any;

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


  constructor(driver: WebDriver) {
    this.driver = driver;
    this.imageFields = new NoteImageFields()
    this.authorFields = new NoteAuthorField(driver)
    this.footerBtn = new NoteFooterBtn()
    this.headerActions = new NoteHeaderActions()
    this.sidebarDropdown = new NoteSidebarDropdow()
    this.textFields = new NoteTextFields(driver)
  }

  /**
   *  Rellena campos de forma flexible
   */
  async fillFields(data: Partial<NoteData>, timeout: number, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, 'NoteEditorPage.fillFields') };
    const textFieldsData: Partial<Record<NoteTextField, string>> = {};

    console.log(`[${fullOpts.label}] Iniciando llenado de campos...`);
    for (const key of Object.keys(NOTE_TEXT_FIELD_MAP) as Array<keyof typeof NOTE_TEXT_FIELD_MAP>) {
      const dataKey = key as keyof NoteData;
      const enumKey = NOTE_TEXT_FIELD_MAP[dataKey];
      const value = data[dataKey] as string | undefined;

      if (value !== undefined && value.trim() !== "") {
        textFieldsData[enumKey] = value;
      }
    }

    if (Object.keys(textFieldsData).length > 0) {
      await this.textFields.fillTextFields(textFieldsData, timeout, fullOpts);
    }

    // ========== TAGS ==========
    if (data.tags && data.tags.length > 0) {
      await this.textFields.addTags(data.tags, timeout, fullOpts);
    }
    if (data.hiddenTags && data.hiddenTags.length > 0) {
      await this.textFields.addHiddenTags(data.hiddenTags, timeout, fullOpts);
    }

    // ========== AUTOR ==========
    if (data.authorType) {
      await this.authorFields.selectAuthorType(data.authorType, timeout, fullOpts);
    }
    if (data.authorName !== undefined && data.authorName.trim() !== "") {
      await this.authorFields.fillAuthorName(data.authorName, timeout, fullOpts);
    }
    if (data.authorDescription !== undefined && data.authorDescription.trim() !== "") {
      await this.authorFields.fillAuthorDescription(data.authorDescription, timeout, fullOpts);
    }

    // ========== LISTICLE ITEMS ==========
    if (data.listicleItems && data.listicleItems.length > 0) {
      await this.textFields.fillListicleItems(data.listicleItems, timeout, fullOpts);
    }


    console.log(`[${fullOpts.label}] Llenado de campos completado.`);
  }

  // ... El resto de métodos se mantiene.
}