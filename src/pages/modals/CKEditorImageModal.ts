import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { RetryOptions, DefaultConfig } from "../../core/config/defaultConfig.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import logger from "../../core/utils/logger.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { waitEnabled } from "../../core/actions/waitEnabled.js";
import { waitVisible } from "../../core/actions/waitVisible.js";

/**
 * Sub-componente modal que gestiona la selección de imágenes desde el selector nativo de CKEditor.
 * Espera a que el contenedor del selector esté disponible, selecciona la imagen por índice
 * y confirma la selección con el botón "OK". Consumido por `EditorImageSection` y `UploadVideoModal`
 * para adjuntar imágenes principales o thumbnails según el contexto.
 *
 * @example
 * const modal = new CKEditorImageModal(driver, opts);
 * await modal.selectImage(0);
 */
export class CKEditorImageModal {
  private driver: WebDriver;
  private config: RetryOptions;

  private static readonly CKEDITOR_SELECTOR_IMAGE: Locator = By.css('div#ckeditor-selector')
  private static readonly DONE_BTN_CKEDITOR_SELECTOR_LOCATOR: Locator = By.css('app-cmsmedios-button[data-testid="btn-ok-ckeditor"] button[data-testid="btn-calendar-confirm"]');

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "CKEditorImageModal") }
  }

  /**
   * Selecciona una imagen del selector de CKEditor por su índice de posición y confirma la selección.
   * Espera a que el contenedor del selector esté listo, localiza la imagen mediante `getLocatorImage`,
   * la clickea vía `executeScript` (necesario por las capas de eventos Angular) y confirma con el botón OK.
   *
   * @param index - Índice de la imagen a seleccionar dentro del grid del selector (base 0).
   */
  async selectImage(index: number): Promise<void> {
    logger.debug(`Esperando a que el selector de CKEditor esté visible`, { label: this.config.label });
    await this.waitUntilIsReady(CKEditorImageModal.CKEDITOR_SELECTOR_IMAGE)

    logger.debug(`Seleccionando la imagen ${index}`, { label: this.config.label });
    const imageLocator = this.getLocatorImage(index)
    const imageElement = await this.waitUntilIsReady(imageLocator)
    await this.driver.executeScript("arguments[0].click();", imageElement);

    await clickSafe(this.driver, CKEditorImageModal.DONE_BTN_CKEDITOR_SELECTOR_LOCATOR, this.config);
    logger.debug(`Primera imagen agregada exitosamente`, { label: this.config.label });
  }

  // =============
  //    HELPERS
  // =============

  /**
   * Construye el locator CSS dinámico para una imagen específica del grid del selector.
   *
   * @param index - Índice de la imagen (base 0) que se usa como parte del ID del contenedor.
   * @returns {Locator} Locator CSS que apunta al elemento `img.image` dentro del contenedor del índice indicado.
   */
  getLocatorImage(index: number): Locator {
    return By.css(`div[id="image-selector-${index}"] img.image`);
  }

  /**
   * Espera a que un elemento esté presente en el DOM, habilitado y visible antes de retornarlo.
   * Combina `waitFind`, `waitEnabled` y `waitVisible` en secuencia para garantizar interactuabilidad.
   *
   * @param locator - Locator del elemento a esperar.
   * @returns {Promise<WebElement>} El elemento listo para ser interactuado.
   */
  async waitUntilIsReady(locator: Locator): Promise<WebElement> {
    const element = await waitFind(this.driver, locator, this.config)
    await waitEnabled(this.driver, element, this.config)
    await waitVisible(this.driver, element, this.config)
    return element
  }
}