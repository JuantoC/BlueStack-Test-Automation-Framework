import { WebDriver, By, Locator } from "selenium-webdriver";
import { writeSafe } from "../../../core/actions/writeSafe.js";
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
  private driver: WebDriver;
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

  private static readonly ADD_NEW_TITLE_BTN: Locator = By.xpath("//li[contains(@class,'more-icon__input-label')]//button[contains(@class,'mat-mdc-icon-button')]");
  private static readonly ADD_NEW_TITLE_ITEM: Locator = By.css('div[data-testid="dropdown-menu"] div[data-testid="dropdown-item"]');

  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.driver = driver;
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
} 