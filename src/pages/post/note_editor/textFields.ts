import { WebDriver, By, Locator } from "selenium-webdriver";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { assertValueEquals } from "../../../core/utils/assertValueEquals.js";
import { RetryOptions } from "../../../core/config/default.js";

export enum textField {
  TITLE = 'title',
  SECONDARY_TITLE = 'secondaryTitle',
  SUB_TITLE = 'subTitle',
  HALF_TITLE = 'halfTitle',
  BODY = 'body',
  SUMMARY = 'summary'
}

export class textFields {
  private readonly LOCATORS: Record<textField, Locator> = {
    [textField.TITLE]: By.css('div[id="titulo-content"] textarea.content__input-title.main__title-height'),
    [textField.SECONDARY_TITLE]: By.css('div[id="titulo-content"] textarea.content__input-title.secondary__title-height'),
    [textField.SUB_TITLE]: By.css('ckeditor[data-testid="copete-content"] div.ck-editor__editable'),
    [textField.HALF_TITLE]: By.css('div[id="volanta-content"] input[type="text"]'),
    [textField.BODY]: By.css('div[id="cuerpo-content"] div.ck-editor__editable'),
    [textField.SUMMARY]: By.id('resumen-content')
  };

  constructor(private driver: WebDriver) {}

  async fillField(field: textField, value: string, timeout: number, opts: RetryOptions = {}): Promise<void> {
    if (!value) return;
    
    const locator = this.LOCATORS[field];
    const element = await writeSafe(this.driver, locator, value, timeout, opts);
    
    // Verificación crítica para campos de texto core
    await assertValueEquals(this.driver, element, locator, value);
  }
}