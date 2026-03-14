import { WebDriver, By, Locator } from "selenium-webdriver";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { RetryOptions, DefaultConfig } from "../../../core/config/defaultConfig.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import logger from "../../../core/utils/logger.js";
import { NoteData } from "../../../interfaces/data.js";
import { step } from "allure-js-commons";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { waitFind } from "../../../core/actions/waitFind.js";
import { hoverOverParentContainer } from "../../../core/helpers/hoverOverParentContainer.js";

export enum NoteTextField {
  TITLE = 'TITLE',
  SECONDARY_TITLE = 'SECONDARY_TITLE',
  SUB_TITLE = 'SUB_TITLE',
  HALF_TITLE = 'HALF_TITLE',
  BODY = 'BODY',
  SUMMARY = 'SUMMARY'
}

/**
 * Gestiona los campos de texto principales y enriquecidos (CKEditor) de la nota.
 */
export class EditorTextSection {
  private driver: WebDriver;
  private config: RetryOptions;
  // ========== LOCATORS (Private & Readonly) ==========
  private static readonly LOCATORS: Record<NoteTextField, Locator> = {
    [NoteTextField.TITLE]: By.css('div[id="titulo-content"] textarea.content__input-title.main__title-height'),
    [NoteTextField.SECONDARY_TITLE]: By.css('div[id="titulo-content"] textarea.content__input-title.secondary__title-height'),
    [NoteTextField.SUB_TITLE]: By.css('ckeditor[data-testid="copete-content"] div.ck-editor__editable'),
    [NoteTextField.HALF_TITLE]: By.css('div[id="volanta-content"] input[type="text"]'),
    [NoteTextField.BODY]: By.css('div[id="cuerpo-content"] div.ck-editor__editable'),
    [NoteTextField.SUMMARY]: By.id('resumen-content')
  };

  private static readonly ADD_NEW_TITLE_BTN: Locator = By.xpath("//li[contains(@class,'more-icon__input-label')]//button[contains(@class,'mat-mdc-icon-button')]");
  private static readonly ADD_NEW_TITLE_ITEM: Locator = By.css('div[data-testid="dropdown-menu"] div[data-testid="dropdown-item"]');

  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "EditorTextSection") }
  }

  async fillAll(data: Partial<NoteData>): Promise<void> {
    await step("Rellenar campos de texto", async () => {
      const textMapping: Array<{ key: keyof NoteData; type: NoteTextField }> = [
        { key: 'title', type: NoteTextField.TITLE },
        { key: 'secondaryTitle', type: NoteTextField.SECONDARY_TITLE },
        { key: 'subTitle', type: NoteTextField.SUB_TITLE },
        { key: 'halfTitle', type: NoteTextField.HALF_TITLE },
        { key: 'body', type: NoteTextField.BODY },
        { key: 'summary', type: NoteTextField.SUMMARY },
      ];

      for (const { key, type } of textMapping) {
        const value = data[key];
        if (typeof value === 'string' && value.trim()) {
          await this.fillField(type, value as string);
        }
      }
    });
  }

  /**
   * Rellena un campo de texto específico y verifica que el contenido sea correcto.
   * Maneja automáticamente la diferencia entre inputs estándar y editores enriquecidos.
   */
  async fillField(field: NoteTextField, value: string): Promise<void> {
    if (!value) return;

    await step(`Llenar campo de texto: "${field}"`, async (stepContext) => {
      stepContext.parameter("Field Name", field);
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      const locator = EditorTextSection.LOCATORS[field];

      try {
        logger.debug(`Escribiendo contenido en el campo: ${field}`, { label: this.config.label });

        if (field === NoteTextField.TITLE) {
          value = value + " | Creado por BlueStack_Test_Automation_Framework";
        }

        await writeSafe(this.driver, locator, value, this.config);

        logger.debug(`Campo "${field}" completado y verificado.`, { label: this.config.label });
      } catch (error: any) {
        logger.error(`Error en fillField (${field}): ${error.message}`, { label: this.config.label, error: error.message });
        throw error;
      }
    });
  }

  /**
   * Despliega las opciones y crea el campo de título secundario.
   */
  /*   async createSecondaryTitleField(): Promise<void> {
      logger.debug("Creando un nuevo titulo secundario...", { label: this.config.label });
      const element = await waitFind(this.driver, this.ADD_NEW_TITLE_BTN, this.config);
      await this.driver.executeScript(`
          const target = arguments[0];
          
          // 1. Buscamos el mat-icon (ya sea el propio elemento o uno hijo de él)
          const icon = target.tagName.toLowerCase() === 'mat-icon' 
              ? target 
              : target.querySelector('mat-icon') || target;
  
          // 2. Le agregamos la clase que lo hace visible en tu CSS
          icon.classList.add('content_show-icon');
          target.classList.add('content_show-icon'); // Por si la clase va en el botón o en el <li>
  
          // 3. Modificamos los atributos de accesibilidad/visibilidad
          icon.setAttribute('aria-hidden', 'false');
          target.setAttribute('aria-hidden', 'false');
      `, element);
      await clickSafe(this.driver, element, this.config);
      await clickSafe(this.driver, this.ADD_NEW_TITLE_ITEM, this.config);
    }
    */
} 