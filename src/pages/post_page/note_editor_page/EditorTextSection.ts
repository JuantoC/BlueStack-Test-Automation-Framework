import { WebDriver, By, Locator } from "selenium-webdriver";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { RetryOptions, DefaultConfig } from "../../../core/config/default.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import logger from "../../../core/utils/logger.js";
import { NoteData } from "../../../dataTest/noteDataInterface.js";

export enum NoteTextField {
  TITLE = 'title',
  SECONDARY_TITLE = 'secondaryTitle',
  SUB_TITLE = 'subTitle',
  HALF_TITLE = 'halfTitle',
  BODY = 'body',
  SUMMARY = 'summary'
}
export type NoteTextData = Pick<NoteData, 'title' | 'secondaryTitle' | 'subTitle' | 'halfTitle' | 'body' | 'summary'>;

/**
 * Gestiona los campos de texto principales y enriquecidos (CKEditor) de la nota.
 */
export class EditorTextSection {
  // ========== LOCATORS (Private & Readonly) ==========
  private readonly LOCATORS: Record<NoteTextField, Locator> = {
    [NoteTextField.TITLE]: By.css('div[id="titulo-content"] textarea.content__input-title.main__title-height'),
    [NoteTextField.SECONDARY_TITLE]: By.css('div[id="titulo-content"] textarea.content__input-title.secondary__title-height'),
    [NoteTextField.SUB_TITLE]: By.css('ckeditor[data-testid="copete-content"] div.ck-editor__editable'),
    [NoteTextField.HALF_TITLE]: By.css('div[id="volanta-content"] input[type="text"]'),
    [NoteTextField.BODY]: By.css('div[id="cuerpo-content"] div.ck-editor__editable'),
    [NoteTextField.SUMMARY]: By.id('resumen-content')
  };

  constructor(private driver: WebDriver) { }

  async fillAll(data: Partial<NoteData>, config: RetryOptions): Promise<void> {
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
        await this.fillField(type, value as string, config);
      }
    }
  }

  /**
   * Rellena un campo de texto específico y verifica que el contenido sea correcto.
   * Maneja automáticamente la diferencia entre inputs estándar y editores enriquecidos.
   */
  async fillField(field: NoteTextField, value: string, opts: RetryOptions = {}): Promise<void> {
    if (!value) return;

    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, `NoteTextContentSection.fillField(${field})`)
    };

    const locator = this.LOCATORS[field];

    try {
      logger.debug(`Escribiendo contenido en el campo: ${field}`, { label: config.label });

      if (field === NoteTextField.TITLE) {
        value = value + " | Creado por BlueStack_Test_Automation Framework"
      }

      await writeSafe(this.driver, locator, value, config);

      logger.debug(`Campo "${field}" completado y verificado.`, { label: config.label });
    } catch (error) {
      // Propagamos el error sin loguear de nuevo (Regla de No Redundancia).
      throw error;
    }
  }
}