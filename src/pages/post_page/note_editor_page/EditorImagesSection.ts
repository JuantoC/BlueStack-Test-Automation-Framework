import { WebDriver, By, Locator } from "selenium-webdriver";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { RetryOptions, resolveRetryConfig } from "../../../core/config/defaultConfig.js";
import logger from "../../../core/utils/logger.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { step } from "allure-js-commons";
import { CKEditorImageModal } from "../../modals/CKEditorImageModal.js";
import { getErrorMessage } from "../../../core/utils/errorUtils.js";

/**
 * Sub-componente que gestiona la sección de imagen principal del Editor de Notas.
 * Orquesta la apertura del selector de imágenes de CKEditor, la selección por índice
 * y la escritura de la descripción de la imagen. Consumido por `MainEditorPage.fillFullNote`.
 */
export class EditorImageSection {
  private driver: WebDriver
  private config: RetryOptions;

  private readonly CKEditorSelector: CKEditorImageModal;

  // ========== LOCATORS (Private & Readonly) ==========
  private static readonly MAIN_IMAGE_LOCATOR: Locator = By.css('div[id="imagenPrevisualizacion-content"] div[data-testid="img-prev-add"]');
  private static readonly MAIN_IMAGE_DESCRIPTION_LOCATOR: Locator = By.css('div[id="imagenPrevisualizacion-content"] textarea.input_description');

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver
    this.config = resolveRetryConfig(opts, "EditorImageSection")

    this.CKEditorSelector = new CKEditorImageModal(driver, opts);
  }

  /**
   * Hace click en el área de imagen principal para abrir el selector de CKEditor,
   * selecciona la imagen en el índice indicado y escribe la descripción automática.
   * Orquesta: `clickOnImageInput` → `CKEditorImageModal.selectImage` → `writeOnMainImageDescription`.
   *
   * @param index - Índice de la imagen a seleccionar en el selector (base 0). Por defecto 0.
   */
  async selectAndWriteMainImage(index: number = 0): Promise<void> {
    await step(`Adjuntar imagen principal en index ${index}`, async () => {
      try {
        logger.debug(`Agregando imagen ${index} como principal`, { label: this.config.label });
        await this.clickOnImageInput();

        await this.CKEditorSelector.selectImage(index);

        await this.writeOnMainImageDescription();
      } catch (error: unknown) {
        logger.error(`Error en selectAndWriteMainImage: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
        throw error;
      }
    });
  }

  /**
   * Escribe la descripción estándar del framework en el campo de descripción de la imagen principal.
   * La descripción es fija y sirve como identificador en los reportes de automatización.
   */
  async writeOnMainImageDescription(): Promise<void> {
    await writeSafe(this.driver, EditorImageSection.MAIN_IMAGE_DESCRIPTION_LOCATOR, "Auto Generated Description by BlueStack_Test_Automation_Framework", this.config);
    logger.debug(`Descripción de la imagen agregada exitosamente`, { label: this.config.label });
  }

  // ==============
  //    HELPERS
  // ==============

  /**
   * Hace click en el área de añadir imagen principal para abrir el selector de CKEditor.
   */
  async clickOnImageInput(): Promise<void> {
    await clickSafe(this.driver, EditorImageSection.MAIN_IMAGE_LOCATOR, this.config);
  }
}
