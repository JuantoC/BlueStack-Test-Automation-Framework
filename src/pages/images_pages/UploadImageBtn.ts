import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { DefaultConfig, resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import logger from "../../core/utils/logger.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { waitVisible } from "../../core/actions/waitVisible.js";
import { waitEnabled } from "../../core/actions/waitEnabled.js";
import { step } from "allure-js-commons";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

export type ImageType = keyof typeof UploadImageBtn.IMAGE_TYPE_MAP;

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

  public static readonly IMAGE_TYPE_MAP = {
    EXTERNAL: new Set(['External Image', "Imagen Externa"]),
    LOCAL: new Set(['Local Image', "Imagen Local"]),
    EMBEDDED: new Set(['Embedded Image', "Imagen Incrustada"]),
    GALLERY: new Set(['Gallery Image', "Imagen de Galería"]),
  } as const;

  private static readonly IMAGES_TABLE: Locator = By.css('div#multimedia-table-body')
  private static readonly UPLOAD_IMAGE_BTN: Locator = By.css("button.btn-create-image");
  private static readonly DROPDOWN_COMBO_MODAL: Locator = By.css('div[data-testid="dropdown-menu"]');
  private static readonly LABELS_OF_IMAGE_TYPES: Locator = By.css('div[data-testid="dropdown-item"] label');

  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "UploadImageBtn");
  }

  /**
   * Abre el menú desplegable de tipos de imagen y selecciona la opción que corresponde al tipo indicado.
   * Si el dropdown ya está abierto, omite el click de apertura. Localiza la etiqueta correcta
   * comparando el texto visible contra el mapa de alias definido en `IMAGE_TYPE_MAP`.
   *
   * @param imageType - Tipo de imagen a seleccionar del menú (LOCAL, EXTERNAL, EMBEDDED o GALLERY).
   */
  async selectImageType(imageType: ImageType): Promise<void> {
    await step(`Seleccionar tipo de imagen ${imageType}`, async () => {
      try {
        // Espera explicita para clickar en el boton mientras carga la pagina.
        await this.waitUntilIsReady(UploadImageBtn.IMAGES_TABLE);

        // Click en el boton de subir
        await this.clickOnUploadImageButton();

        // Busqueda del tipo de imagen
        const elementToClick = await this.matchImageType(imageType);

        logger.debug(`Intentando hacer click en la opción "${imageType}"...`, { label: this.config.label });
        await clickSafe(this.driver, elementToClick, this.config);

      } catch (error: unknown) {
        logger.error(`Error en selectImageType: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
        throw error;
      }
    });
  }

  private async clickOnUploadImageButton(): Promise<void> {
    const isVisible = await this.isDropdownVisible();

    if (!isVisible) {
      logger.debug("Abriendo el dropdown de opciones...", { label: this.config.label });
      await clickSafe(this.driver, UploadImageBtn.UPLOAD_IMAGE_BTN, this.config);
    } else {
      logger.debug("El dropdown ya estaba abierto.", { label: this.config.label });
    }
  }

  private async isDropdownVisible(): Promise<boolean> {
    const element = await this.waitUntilIsReady(UploadImageBtn.UPLOAD_IMAGE_BTN);

    // Verificamos visualmente el atributo
    const isExpanded = await element.getAttribute("aria-expanded");
    return isExpanded === "true";
  }

  /**
   * Busca en la lista de opciones desplegadas el WebElement que coincide con el ImageType.
   * Retorna el elemento para ser clickeado posteriormente.
   */
  private async matchImageType(imageType: ImageType): Promise<WebElement> {
    try {
      await this.waitUntilIsReady(UploadImageBtn.DROPDOWN_COMBO_MODAL)

    } catch (error: unknown) {
      logger.error(`El menú no se desplegó correctamente: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }

    // 2. Buscar todos los labels candidatos
    const elements = await this.driver.findElements(UploadImageBtn.LABELS_OF_IMAGE_TYPES);

    if (elements.length === 0) {
      throw new Error(`El menú se abrió, pero no se encontraron labels con el selector: ${UploadImageBtn.LABELS_OF_IMAGE_TYPES}`);
    }

    logger.debug(`Analizando ${elements.length} opciones disponibles...`, { label: this.config.label });

    // 3. Iterar dinámicamente
    for (const element of elements) {
      // Obtenemos el texto limpio (trim)
      const text = await element.getText();
      const cleanLabel = text.trim();

      if (UploadImageBtn.IMAGE_TYPE_MAP[imageType].has(cleanLabel)) {
        logger.debug(`Match encontrado: "${cleanLabel}"`, { label: this.config.label });
        return element;
      }
    }
    throw new Error(`No se encontró la opción "${imageType}" en el menú.`);
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
