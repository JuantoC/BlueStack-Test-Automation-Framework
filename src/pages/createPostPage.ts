import { By, Locator } from 'selenium-webdriver';

/**
 * Page Object para la página de creación/edición de un Post.
 */
export class CreatePostPage {
    // 1. Campos principales
    public mainTitleField: Locator = By.css('textarea.content__input-title.main__title-height');
    public subTitleField: Locator = By.css('ckeditor[data-testid="copete-content"] .ck-editor__editable');
    public halfTitleField: Locator = By.css('div[data-testid="volanta-content"] input[type="text"]');
    public bodyField: Locator = By.css('ckeditor[data-testid="ckCuerpoNota"] .ck-editor__editable');
    public summaryField: Locator = By.id('resumen-content');
    
    // 2. Campos de Tags
    public tagsField: Locator = By.id('mat-mdc-chip-list-input-0');
    public hiddentagsField: Locator = By.id('mat-mdc-chip-list-input-1');

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
    public saveBtn: Locator = By.id('dropdown-save');
    public publishBtn: Locator = By.id('dropdown-publish');
    
    
    // NOTA: Los localizadores de Listicle se asumen que son parte de esta página o un componente dentro.
    // Como son dinámicos, los definimos como funciones.
    public listicleTitleField(index: number): Locator {
        return By.xpath(`//listicle-title-locator[${index}]`); 
    }
    
    public listicleBodyField(index: number): Locator {
        // Asumiendo que listicleBodyLocator(i) en tu Fill-Fields.ts se refiere a un selector dinámico
        return By.xpath(`//listicle-body-locator[${index}]`); 
    }
}

export const createPostPage = new CreatePostPage();