import { By, Key, Locator, WebDriver } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import logger from "../../core/utils/logger.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { writeToStandard } from "../../core/helpers/write.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";
import type { TagData } from "../../interfaces/data.js";

/**
 * Page Object que encapsula el modal "Nuevo Tag" del CMS.
 * Gestiona el llenado de todos los campos del formulario (título, descripción, sinónimos,
 * tipo, estado) y la confirmación o cancelación de la creación.
 * Los campos `tipo` y `estado` se interactúan mediante `mat-select` de Angular Material.
 * Consumido por `MainTagsPage.createNewTag` como paso de llenado del modal.
 *
 * @example
 * const modal = new NewTagModal(driver, opts);
 * await modal.fillAndCreate({ title: 'Gaming', estado: 'Aprobados' });
 */
export class NewTagModal {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  private static readonly MODAL_CONTAINER: Locator = By.css('app-tags-modal div#tags-modal-cms');
  private static readonly TITLE_INPUT: Locator = By.css('textarea.tags-modal__input-title');
  private static readonly DESCRIPTION_EDITOR: Locator = By.css('ckeditor#ckeditor_body_size_20r_modal div.ck-editor__editable_inline[contenteditable="true"]');
  private static readonly SYNONYM_INPUT: Locator = By.css('input.tags-modal__synonyms_input');
  private static readonly TIPO_SELECT: Locator = By.css('div.tags-modal__side_content div.mda-form-group:nth-child(1) mat-select');
  private static readonly ESTADO_SELECT: Locator = By.css('div.tags-modal__side_content div.mda-form-group:nth-child(3) mat-select');
  private static readonly MAT_OPTIONS: Locator = By.css("div[role='listbox'] mat-option[role='option']");
  private static readonly CANCEL_BTN: Locator = By.css('div.button-primary__two button[data-testid="btn-calendar-confirm"]');
  private static readonly CREATE_BTN: Locator = By.css('div.button-primary__four button[data-testid="btn-calendar-confirm"]');

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "NewTagModal");
  }

  /**
   * Llena los campos presentes en `tagData` y confirma la creación del tag.
   * Solo interactúa con los campos cuya propiedad en `tagData` no es `undefined`.
   * El campo `title` es obligatorio; el resto son opcionales.
   *
   * @param tagData - Datos del tag a crear. `title` es requerido.
   */
  async fillAndCreate(tagData: TagData): Promise<void> {
    try {
      logger.debug('Esperando que el modal de nuevo tag esté visible...', { label: this.config.label });
      await waitFind(this.driver, NewTagModal.MODAL_CONTAINER, this.config);

      await this.fillTitle(tagData.title);

      if (tagData.description) {
        await this.fillDescription(tagData.description);
      }

      if (tagData.synonyms && tagData.synonyms.length > 0) {
        for (const synonym of tagData.synonyms) {
          await this.addSynonym(synonym);
        }
      }

      if (tagData.tipo) {
        await this.selectMatOption(NewTagModal.TIPO_SELECT, tagData.tipo);
      }

      if (tagData.estado) {
        await this.selectMatOption(NewTagModal.ESTADO_SELECT, tagData.estado);
      }

      logger.debug('Campos llenados. Confirmando creación...', { label: this.config.label });
      await this.clickCreate();
    } catch (error: unknown) {
      logger.error(`Error en fillAndCreate: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Escribe el título del tag en el textarea del modal.
   * Limpia el contenido previo antes de escribir.
   *
   * @param title - Título del nuevo tag.
   */
  async fillTitle(title: string): Promise<void> {
    try {
      logger.debug(`Escribiendo título del tag: "${title}"`, { label: this.config.label });
      const input = await waitFind(this.driver, NewTagModal.TITLE_INPUT, this.config);
      await writeToStandard(input, title, this.config.label);
    } catch (error: unknown) {
      logger.error(`Error al escribir el título "${title}": ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Escribe la descripción corta en el editor CKEditor del modal.
   * Hace click en el editor para enfocarlo antes de enviar las teclas.
   *
   * @param description - Texto de descripción corta del tag.
   */
  async fillDescription(description: string): Promise<void> {
    try {
      logger.debug(`Escribiendo descripción del tag: "${description}"`, { label: this.config.label });
      const editor = await waitFind(this.driver, NewTagModal.DESCRIPTION_EDITOR, this.config);
      await clickSafe(this.driver, editor, this.config);
      await editor.sendKeys(description);
    } catch (error: unknown) {
      logger.error(`Error al escribir la descripción: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Agrega un sinónimo al chip input del modal y lo confirma con Enter.
   *
   * @param synonym - Texto del sinónimo a agregar.
   */
  async addSynonym(synonym: string): Promise<void> {
    try {
      logger.debug(`Agregando sinónimo: "${synonym}"`, { label: this.config.label });
      const input = await waitFind(this.driver, NewTagModal.SYNONYM_INPUT, this.config);
      await input.sendKeys(synonym, Key.ENTER);
      logger.debug(`Sinónimo "${synonym}" agregado.`, { label: this.config.label });
    } catch (error: unknown) {
      logger.error(`Error al agregar sinónimo "${synonym}": ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Hace click en el botón CREAR del modal para confirmar la creación del tag.
   */
  async clickCreate(): Promise<void> {
    try {
      logger.debug('Clickeando en CREAR...', { label: this.config.label });
      await clickSafe(this.driver, NewTagModal.CREATE_BTN, this.config);
    } catch (error: unknown) {
      logger.error(`Error al clickear CREAR: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Hace click en el botón CANCELAR para cerrar el modal sin crear el tag.
   */
  async clickCancel(): Promise<void> {
    try {
      logger.debug('Clickeando en CANCELAR...', { label: this.config.label });
      await clickSafe(this.driver, NewTagModal.CANCEL_BTN, this.config);
    } catch (error: unknown) {
      logger.error(`Error al clickear CANCELAR: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  // =========================================================================
  //                    HELPERS
  // =========================================================================

  /**
   * Abre un `mat-select` y selecciona la opción cuyo texto coincide con `value`.
   * Verifica si el select ya está expandido antes de hacer click para abrirlo.
   * Usa `div[role='listbox'] mat-option[role='option']` como selector de opciones.
   */
  private async selectMatOption(selectLocator: Locator, value: string): Promise<void> {
    try {
      const select = await waitFind(this.driver, selectLocator, this.config);
      const isExpanded = await select.getAttribute('aria-expanded');

      if (isExpanded !== 'true') {
        logger.debug(`Abriendo mat-select para seleccionar "${value}"...`, { label: this.config.label });
        await clickSafe(this.driver, select, this.config);
      }

      const options = await this.driver.findElements(NewTagModal.MAT_OPTIONS);
      if (options.length === 0) {
        throw new Error(`El mat-select se abrió pero no se encontraron opciones.`);
      }

      for (const option of options) {
        const text = await option.getText();
        if (text.trim().includes(value)) {
          logger.debug(`Opción "${value}" encontrada. Clickeando...`, { label: this.config.label });
          await clickSafe(this.driver, option, this.config);
          return;
        }
      }
      throw new Error(`No se encontró la opción "${value}" en el mat-select.`);
    } catch (error: unknown) {
      logger.error(`Error al seleccionar opción "${value}": ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }
}
