import { WebDriver, By, Locator, WebElement } from "selenium-webdriver";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { waitFind } from "../../../core/actions/waitFind.js";
import { RetryOptions, resolveRetryConfig } from "../../../core/config/defaultConfig.js";
import logger from "../../../core/utils/logger.js";
import { NoteData } from "../../../interfaces/data.js";
import { step } from "allure-js-commons";
import { getErrorMessage } from "../../../core/utils/errorUtils.js";

export type NoteTextField = keyof typeof EditorTextSection.LOCATORS;


/**
 * Gestiona los campos de texto principales y enriquecidos (CKEditor) de la nota.
 */
export class EditorTextSection {
  private config: RetryOptions;

  // ========== LOCATORS ( Readonly) ==========
  public static readonly LOCATORS = {
    title: By.css('div[id="titulo-content"] textarea.content__input-title.main__title-height'),
    secondaryTitle: By.css('div[id="titulo-content"] textarea.content__input-title.secondary__title-height'),
    subTitle: By.css('ckeditor[data-testid="copete-content"] div.ck-editor__editable'),
    halfTitle: By.css('div[id="volanta-content"] input[type="text"]'),
    body: By.css('div[id="cuerpo-content"] div.ck-editor__editable'),
    summary: By.id('resumen-content')
  } as const;

  private static readonly ADD_NEW_TITLE_BTN: Locator = By.css('[data-testid="button-add-title"]');
  private static readonly ADD_NEW_TITLE_ITEM: Locator = By.css('[data-testid^="dropdown-item-agregar-"]');

  constructor(private driver: WebDriver, opts: RetryOptions = {}) {
    this.config = resolveRetryConfig(opts, "EditorTextSection")
  }

  /**
   * Rellena todos los campos de texto disponibles en la nota según los valores presentes en `data`.
   * Itera sobre las claves de `LOCATORS` y delega cada campo no vacío en `fillField`.
   * Omite silenciosamente los campos con valor `undefined`, `null` o cadena vacía.
   *
   * @param data - Objeto parcial de `NoteData` con los valores de texto a completar.
   */
  async fillAll(data: Partial<NoteData>): Promise<void> {
    await step("Rellenar campos de texto", async () => {
      const fields = Object.keys(EditorTextSection.LOCATORS) as NoteTextField[];

      for (const field of fields) {
        const value = data[field];
        if (typeof value === 'string' && value.trim()) {
          await this.fillField(field, value);
        }
      }
    });
  }

  /**
   * Rellena un campo de texto específico y verifica que el contenido sea correcto.
   * Maneja automáticamente la diferencia entre inputs estándar y editores enriquecidos.
   *
   * @param field - Campo del formulario a rellenar (ej. "title", "summary").
   * @param value - Texto a ingresar en el campo.
   */
  async fillField(field: NoteTextField, value: string): Promise<void> {
    if (!value) return;

    await step(`Llenar campo de texto ${field}`, async () => {
      const locator = EditorTextSection.LOCATORS[field];

      try {
        logger.debug(`Escribiendo contenido en el campo: ${field}`, { label: this.config.label });

        if (field === 'title') {
          value = value + " | Creado por BlueStack_Test_Automation_Framework";
        }

        await writeSafe(this.driver, locator, value, this.config);

        logger.debug(`Campo "${field}" completado y verificado.`, { label: this.config.label });
      } catch (error: unknown) {
        logger.error(`Error en fillField (${field}): ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
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

  /**
   * Hace click en el botón para agregar un nuevo título.
   */
  public async clickAddNewTitleBtn(): Promise<void> {
    try {
      logger.debug("Clicking botón agregar nuevo título", { label: this.config.label });
      await clickSafe(this.driver, EditorTextSection.ADD_NEW_TITLE_BTN, this.config);
    } catch (error: unknown) {
      logger.error(`Error en clickAddNewTitleBtn: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Retorna todos los WebElements de los ítems del dropdown de nuevo título.
   *
   * @returns {Promise<WebElement[]>} Array de elementos encontrados.
   */
  public async getAddNewTitleItems(): Promise<WebElement[]> {
    try {
      logger.debug("Fetching add new title item elements", { label: this.config.label });
      return await this.driver.findElements(EditorTextSection.ADD_NEW_TITLE_ITEM);
    } catch (error: unknown) {
      logger.error(`Error en getAddNewTitleItems: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  // ========== GETTERS — Lectura de contenido actual ==========

  /**
   * Lee el valor actual del campo título principal.
   *
   * @returns {Promise<string>} Contenido actual del textarea de título.
   */
  public async getTitle(): Promise<string> {
    try {
      const el = await waitFind(this.driver, EditorTextSection.LOCATORS.title, this.config);
      return await el.getAttribute('value');
    } catch (error: unknown) {
      logger.error(`Error en getTitle: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Lee el valor actual del campo título secundario.
   *
   * @returns {Promise<string>} Contenido actual del textarea de título secundario.
   */
  public async getSecondaryTitle(): Promise<string> {
    try {
      const el = await waitFind(this.driver, EditorTextSection.LOCATORS.secondaryTitle, this.config);
      return await el.getAttribute('value');
    } catch (error: unknown) {
      logger.error(`Error en getSecondaryTitle: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Lee el texto actual del campo copete (subtítulo CKEditor).
   *
   * @returns {Promise<string>} Contenido actual del editor enriquecido de copete.
   */
  public async getSubTitle(): Promise<string> {
    try {
      const el = await waitFind(this.driver, EditorTextSection.LOCATORS.subTitle, this.config);
      return await el.getText();
    } catch (error: unknown) {
      logger.error(`Error en getSubTitle: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Lee el valor actual del campo volanta (medio título).
   *
   * @returns {Promise<string>} Contenido actual del input de volanta.
   */
  public async getHalfTitle(): Promise<string> {
    try {
      const el = await waitFind(this.driver, EditorTextSection.LOCATORS.halfTitle, this.config);
      return await el.getAttribute('value');
    } catch (error: unknown) {
      logger.error(`Error en getHalfTitle: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Lee el texto actual del campo cuerpo (body CKEditor).
   *
   * @returns {Promise<string>} Contenido actual del editor enriquecido de cuerpo.
   */
  public async getBody(): Promise<string> {
    try {
      const el = await waitFind(this.driver, EditorTextSection.LOCATORS.body, this.config);
      return await el.getText();
    } catch (error: unknown) {
      logger.error(`Error en getBody: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Lee el texto actual del campo resumen.
   *
   * @returns {Promise<string>} Contenido actual del editor enriquecido de resumen.
   */
  public async getSummary(): Promise<string> {
    try {
      const el = await waitFind(this.driver, EditorTextSection.LOCATORS.summary, this.config);
      return await el.getText();
    } catch (error: unknown) {
      logger.error(`Error en getSummary: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }
}