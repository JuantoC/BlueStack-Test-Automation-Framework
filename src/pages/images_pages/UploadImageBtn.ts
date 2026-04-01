import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import logger from "../../core/utils/logger.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { waitVisible } from "../../core/actions/waitVisible.js";
import { waitEnabled } from "../../core/actions/waitEnabled.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

/**
 * Page Object que representa el botón de creación de imágenes y su menú desplegable de tipos.
 * Encapsula la lógica de apertura del dropdown y la selección del tipo de imagen correcto
 * mediante coincidencia dinámica de etiquetas multilinguales definidas en `IMAGE_TYPE_MAP`.
 * Utilizado por `MainImagePage` como primer paso del flujo de subida de imagen.
 *
 * @example
 * const btn = new UploadImageBtn(driver, opts);
 * await btn.selectImageType('LOCAL');
 */
export class UploadImageBtn {

  private driver: WebDriver;
  private config: RetryOptions;


  private static readonly IMAGES_TABLE: Locator = By.css('div#multimedia-table-body')
  private static readonly IMAGE_UPLOAD_INPUT_TABLE: Locator = By.css('input#image-file[type="file"]')
  private static readonly IMAGE_UPLOAD_INPUT_SIDEBAR: Locator = By.css('div#file-upload-plus input[type="file"]')

  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "UploadImageBtn");
  }

  async sendFileToUploadInput(filePath: string, btn: 'Sidebar' | 'Table'): Promise<void> {
    try {
      const inputLocator = btn === 'Sidebar' ? UploadImageBtn.IMAGE_UPLOAD_INPUT_SIDEBAR : UploadImageBtn.IMAGE_UPLOAD_INPUT_TABLE;
      const fileInput = await this.waitUntilIsReady(inputLocator);
      await fileInput.sendKeys(filePath);
    } catch (error: unknown) {
      logger.error(`Error al enviar el archivo al input de subida: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }
  
  // ==================
  // HELPERS
  // ==================

  private async waitUntilIsReady(locator: Locator): Promise<WebElement> {
    const element = await waitFind(this.driver, locator, this.config)
    await waitEnabled(this.driver, element, this.config)
    await waitVisible(this.driver, element, this.config)
    return element
  }
}
