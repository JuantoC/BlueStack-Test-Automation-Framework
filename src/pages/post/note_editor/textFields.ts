import { Locator } from "selenium-webdriver";

export class NoteTextFields {
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