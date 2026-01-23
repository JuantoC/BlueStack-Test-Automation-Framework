import { WebDriver, By, Locator } from "selenium-webdriver";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { assertValueEquals } from "../../../core/utils/assertValueEquals.js";
import { RetryOptions, DefaultConfig } from "../../../core/config/default.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import logger from "../../../core/utils/logger.js";

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
export class NoteTextContentSection {
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

  /**
   * Rellena un campo de texto específico y verifica que el contenido sea correcto.
   * Maneja automáticamente la diferencia entre inputs estándar y editores enriquecidos.
   */
  async fillField(field: NoteTextField, value: string, opts: RetryOptions = {}): Promise<void> {
    if (!value) return;

    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, `fillField(${field})`)
    };

    const locator = this.LOCATORS[field];

    try {
      logger.debug(`Escribiendo contenido en el campo: ${field}`, { label: config.label });

      // writeSafe se encarga de la interacción inicial y reintentos.
      const element = await writeSafe(this.driver, locator, value, config);

      // Verificación de integridad del dato ingresado.
      // Se pasa 'config' para que el assert mantenga la trazabilidad del label.
      await assertValueEquals(element, locator, value, config);

      logger.info(`Campo "${field}" completado y verificado.`, { label: config.label });
    } catch (error) {
      // Propagamos el error sin loguear de nuevo (Regla de No Redundancia).
      throw error;
    }
  }
}