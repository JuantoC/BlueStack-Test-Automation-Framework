import { By, Locator } from 'selenium-webdriver';

export const LOCATOR_SUFFIX = 'Field';
/**
 * Page Object para la página de edición de un Post.
 */
export class PostPageLocators {
  // 1. Campos principales
  public titleField: Locator = By.css('div[id="titulo-content"] textarea.content__input-title.main__title-height');
  public secondaryTitleField: Locator = By.css('div[id="titulo-content"] textarea.content__input-title.secondary__title-height');
  public subTitleField: Locator = By.css('div[id="copete-content"] ckeditor[data-testid="copete-content"]');
  public halfTitleField: Locator = By.css('div[id="volanta-content"] input[type="text"]');
  public bodyField: Locator = By.css('div[id="cuerpo-content"] ckeditor[data-testid="ckCuerpoNota"]');
  public summaryField: Locator = By.id('resumen-content');

  // 2. Campos de Tags
  public tagsField: Locator = By.id('div[id="claves-content"] input[role="combobox"]');
  public hiddentagsField: Locator = By.id('div[id="clavesOcultas-content"] input[role="combobox"]');

  // 3. Sección de Autor
  public authorInternalUserBtn: Locator = By.css('mat-icon="check_circle_outline"');
  public authorAnonymuosUserBtn: Locator = By.css('mat-icon="person_outline"');
  public authorManualUserBtn: Locator = By.css('mat-icon="draw"');
  public authorDescriptionField: Locator = By.css('.author-description__height');
  public authorNameField: Locator = By.css('input[data-testid="type_autocomplete"]');

  // 4. Side Dropdown y Botones de Acción
  public sideDropdownButton: Locator = By.css('mat-select[data-testid="select-lateral"]');
  public comboSectionOptions: Locator = By.css('mat-select[data-testid="section-options"]');
  public firstSectionOption: Locator = By.id('mat-option-74');

  // 5. Header
  public saveBtn: Locator = By.css('button[data-testid="dropdown-actions"]')
  public dropdownSave: Locator = By.id('dropdown-save');
  public saveAndExitBtn: Locator = By.id("option-dropdown-0")
  public ExitBtn: Locator = By.id("option-dropdown-1")
  public dropdownPublish: Locator = By.id('dropdown-publish');
  public publishBtn: Locator = By.css('button[data-testid="dropdown-action"]')
  public publishAndExitBtn: Locator = By.id("option-dropdown-0")
  public scheduleBtn: Locator = By.id("option-dropdown-1")
  public backBtn: Locator = By.css('a[data-testid="btn-exit-note"]')

  // 6. Acciones
  public addListicleItemBtn: Locator = By.css('button[data-testid="add-listicle-item"]');

  // 7. Modales
  public exitAnywayBtnModal: Locator = By.css('app-cmsmedios-button[data-testid="btn-cancel"]')
  public saveAndExitBtnModal: Locator = By.css('button[data-testid="btn-calendar-confirm"]')
  public cancelBtnModal: Locator = By.css('app-cmsmedios-button[data-testid="post-note-cancel"] button[data-testid="btn-calendar-confirm"]')
  public publishBtnModal: Locator = By.css('app-cmsmedios-button[data-testid="post-note-confirm"] button[data-testid="btn-calendar-confirm"]')

  /**
    * Obtener el Locator de un campo de Listicle dinámico.
    * @param fieldType El tipo de campo ('title' o 'body').
    * @param index El índice del elemento Listicle
    * @returns El Locator de Selenium.
    */
  public getListicleFieldLocator(fieldType: 'title' | 'body', index: number): Locator {
    const baseSelector = `//div[@data-listicle-item-index="${index}"]`;
    let selector: string;

    switch (fieldType) {
      case 'title':
        selector = `${baseSelector}//input[contains(@class, 'listicle-title-input')]`;
        break;
      case 'body':
        selector = `${baseSelector}//ckeditor[contains(@class, 'listicle-body-editor')]/.ck-editor__editable`;
        break;
      default:
        throw new Error(`Tipo de campo Listicle desconocido: ${fieldType}`);
    }

    return By.xpath(selector);
  }

}

export const PostPage = new PostPageLocators();