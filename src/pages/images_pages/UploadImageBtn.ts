import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import logger from "../../core/utils/logger.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { waitVisible } from "../../core/actions/waitVisible.js";
import { waitEnabled } from "../../core/actions/waitEnabled.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";
import path from "path";
import ENV_CONFIG from "../../core/config/envConfig.js";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const remote = require('selenium-webdriver/remote');

/**
 * Sub-componente que gestiona la subida de archivos de imagen al CMS.
 * Encapsula la localización del input de archivo correcto según el punto de entrada
 * (Sidebar o Table) y el envío de la ruta del archivo mediante `sendKeys`.
 * Utilizado por `MainImagePage.uploadNewImage` como primer paso del flujo de subida.
 *
 * @example
 * const btn = new UploadImageBtn(driver, opts);
 * await btn.sendFileToUploadInput('/ruta/imagen.jpg', 'Sidebar');
 */
export class UploadImageBtn {

  private config: RetryOptions;


  private static readonly IMAGES_TABLE: Locator = By.css('div#multimedia-table-body')
  private static readonly IMAGE_UPLOAD_INPUT_TABLE: Locator = By.css('input#image-file[type="file"]')
  private static readonly IMAGE_UPLOAD_INPUT_SIDEBAR: Locator = By.css('div#file-upload-plus input[type="file"]')

  constructor(private driver: WebDriver, opts: RetryOptions = {}) {
    this.config = resolveRetryConfig(opts, "UploadImageBtn");
  }

  /**
   * Envía un archivo de imagen al input de subida correspondiente según el origen seleccionado.
   * Localiza el input `type="file"` del Sidebar o de la Table y le aplica `sendKeys` con la ruta absoluta.
   *
   * @param filePath - Ruta absoluta del archivo de imagen a enviar al input.
   * @param btn - Origen del input: `'Sidebar'` usa `div#file-upload-plus input[type="file"]`;
   *              `'Table'` usa `input#image-file[type="file"]`.
   * @returns {Promise<void>}
   */
  async sendFileToUploadInput(filePath: string, btn: 'Sidebar' | 'Table'): Promise<void> {
    try {
      const cleanRelativePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
      const absolutePath = path.resolve(process.cwd(), cleanRelativePath);
      logger.debug(`Ruta final calculada: ${absolutePath}`, { label: this.config.label });

      await this.waitUntilIsReady(UploadImageBtn.IMAGES_TABLE);

      const inputLocator = btn === 'Sidebar' ? UploadImageBtn.IMAGE_UPLOAD_INPUT_SIDEBAR : UploadImageBtn.IMAGE_UPLOAD_INPUT_TABLE;
      const fileInput = await waitFind(this.driver, inputLocator, this.config);

      // Replica la lógica de FileDetector de UploadVideoModal.uploadFile.
      // Las imágenes usan el mismo mecanismo de sendKeys que los videos nativos.
      if (ENV_CONFIG.grid.useGrid) {
        logger.debug('Modo Grid: Seteando FileDetector', { label: this.config.label });
        try {
          const target = remote.default || remote;
          const DetectorClass = target.FileDetector;

          if (!DetectorClass) {
            throw new Error(`Inconsistencia interna: 'FileDetector' no encontrado en: ${Object.keys(target)}`);
          }

          this.driver.setFileDetector(new DetectorClass());
          logger.debug('FileDetector activado correctamente.', { label: this.config.label });
        } catch (err: unknown) {
          logger.error(`Error en configuración Grid: ${getErrorMessage(err)}`, { label: this.config.label });
          throw err;
        }
      } else {
        // En local desactivamos para que Selenium use el FS directo de WSL
        this.driver.setFileDetector(null as any);
      }

      await fileInput.sendKeys(absolutePath);
      logger.debug('Archivo enviado al input de subida de imagen.', { label: this.config.label });
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
