import { By, Locator } from 'selenium-webdriver';
import { NoteAuthorField } from './authorField';
import { NoteFooterBtn } from './footerBtn';
import { NoteHeaderActions } from './headerActions';
import { NoteSidebarDropdow } from './sidebarDropdown';
import { NoteTextFields } from './textFields';
import { NoteImageFields } from './imageFields';

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

  constructor() {
    this.imageFields = new NoteImageFields()
    this.authorFields = new NoteAuthorField()
    this.footerBtn = new NoteFooterBtn()
    this.headerActions = new NoteHeaderActions()
    this.sidebarDropdown = new NoteSidebarDropdow()
    this.textFields = new NoteTextFields()
  }
}

export const LOCATOR_SUFFIX = 'Field';
export const noteEditorPage = new NoteEditorPage();