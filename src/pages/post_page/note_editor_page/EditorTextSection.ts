import { WebDriver, By, Locator } from "selenium-webdriver";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { RetryOptions, DefaultConfig } from "../../../core/config/default.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import logger from "../../../core/utils/logger.js";
import { NoteData } from "../../../dataTest/noteDataInterface.js";
import { step } from "allure-js-commons";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { waitFind } from "../../../core/utils/waitFind.js";

export enum NoteTextField {
  TITLE = 'title',
  SECONDARY_TITLE = 'secondaryTitle',
  SUB_TITLE = 'subTitle',
  HALF_TITLE = 'halfTitle',
  BODY = 'body',
  SUMMARY = 'summary'
}

/**
 * Gestiona los campos de texto principales y enriquecidos (CKEditor) de la nota.
 */
export class EditorTextSection {
  private driver: WebDriver;
  private config: RetryOptions;
  // ========== LOCATORS (Private & Readonly) ==========
  private readonly LOCATORS: Record<NoteTextField, Locator> = {
    [NoteTextField.TITLE]: By.css('div[id="titulo-content"] textarea.content__input-title.main__title-height'),
    [NoteTextField.SECONDARY_TITLE]: By.css('div[id="titulo-content"] textarea.content__input-title.secondary__title-height'),
    [NoteTextField.SUB_TITLE]: By.css('ckeditor[data-testid="copete-content"] div.ck-editor__editable'),
    [NoteTextField.HALF_TITLE]: By.css('div[id="volanta-content"] input[type="text"]'),
    [NoteTextField.BODY]: By.css('div[id="cuerpo-content"] div.ck-editor__editable'),
    [NoteTextField.SUMMARY]: By.id('resumen-content')
  };

  private readonly titleMoreOptionsBtn: Locator = By.xpath("//li[contains(@class,'more-icon__input-label')]//button[.//mat-icon[text()='more_horiz']]");
  private readonly addSecondaryTitleBtn: Locator = By.css('div[data-testid="dropdown-menu"] div[data-testid="dropdown-item"]');

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

    const locator = this.LOCATORS[field];

    try {
      logger.debug(`Escribiendo contenido en el campo: ${field}`, { label: this.config.label });

      if (field === NoteTextField.TITLE) {
        value = value + " | Creado por BlueStack_Test_Automation Framework";
      }

      if (field === NoteTextField.SECONDARY_TITLE) {
        logger.debug("Revisando si el campo de titulo secundario existe", { label: this.config.label });

        try {
          // Buscamos el elemento suprimiendo los reintentos para no perder tiempo si no existe
          await waitFind(this.driver, locator, { ...this.config, supressRetry: true });
          logger.debug("El campo de titulo secundario existe", { label: this.config.label });
        } catch (error) {
          // Verificamos si el error es debido a que no se encontró el elemento
          if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'NoSuchElementError')) {
            logger.debug("El campo de titulo secundario no existe. Procediendo a crearlo.", { label: this.config.label });

            await this.createSecondaryTitleField();
          } else {
            throw error;
          }
        }
      }
      await writeSafe(this.driver, locator, value, this.config);

      logger.debug(`Campo "${field}" completado y verificado.`, { label: this.config.label });
    } catch (error) {
      // Propagamos el error sin loguear de nuevo (Regla de No Redundancia).
      throw error;
    }
  }

  /**
   * Despliega las opciones y crea el campo de título secundario.
   */
  async createSecondaryTitleField(): Promise<void> {
    logger.debug("Creando un nuevo titulo secundario...", { label: this.config.label });
    await clickSafe(this.driver, this.titleMoreOptionsBtn, this.config);
    await clickSafe(this.driver, this.addSecondaryTitleBtn, this.config);
  }
}