import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import logger from "../../core/utils/logger.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { waitVisible } from "../../core/actions/waitVisible.js";
import { waitEnabled } from "../../core/actions/waitEnabled.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

import type { VideoType } from '../../interfaces/data.js';
export type { VideoType } from '../../interfaces/data.js';

/**
 * Page Object que representa el botón de creación de videos y su menú desplegable de tipos.
 * Encapsula la lógica de apertura del dropdown y la selección del tipo de video correcto
 * mediante coincidencia dinámica de etiquetas multilinguales definidas en `VIDEO_TYPE_MAP`.
 * Utilizado por `MainVideoPage` como primer paso del flujo de subida de video.
 *
 * @example
 * const btn = new UploadVideoBtn(driver, opts);
 * await btn.selectVideoType('NATIVO');
 */
export class UploadVideoBtn {

  private driver: WebDriver;
  private config: RetryOptions;

  public static readonly VIDEO_TYPE_MAP = {
    EMBEDDED: new Set(['Embedded Video', "Video Embedded", "Video Incorporado"]),
    NATIVO: new Set(['Native Video', "Video Nativo", "Video Nativo"]),
    YOUTUBE: new Set(['YouTube Video', "Video YouTube"]),
    SHORT: new Set(['YouTube Short Video', "Video Youtube Short", "Video Youtube Short"])
  } as const;

  private static readonly VIDEOS_TABLE: Locator = By.css('div#multimedia-table-body')
  private static readonly UPLOAD_VIDEO_BTN: Locator = By.css("button.btn-create-note");
  private static readonly DROPDOWN_COMBO_MODAL: Locator = By.css('div[data-testid="dropdown-menu"]');
  private static readonly LABELS_OF_VIDEO_TYPES: Locator = By.css('div[data-testid="dropdown-item"] label');

  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "UploadVideoBtn");
  }

  /**
   * Abre el menú desplegable de tipos de video y selecciona la opción que corresponde al tipo indicado.
   * Si el dropdown ya está abierto, omite el click de apertura. Localiza la etiqueta correcta
   * comparando el texto visible contra el mapa de alias definido en `VIDEO_TYPE_MAP`.
   *
   * @param videoType - Tipo de video a seleccionar del menú (NATIVO, EMBEDDED, YOUTUBE o SHORT).
   */
  async selectVideoType(videoType: VideoType): Promise<void> {
    try {
      // Espera explicita para clickar en el boton mientras carga la pagina.
      await this.waitUntilIsReady(UploadVideoBtn.VIDEOS_TABLE);

      // Click en el boton de subir
      await this.openVideoTypeDropdown();

      // Busqueda del tipo de video
      const elementToClick = await this.matchVideoType(videoType);

      logger.debug(`Intentando hacer click en la opción "${videoType}"...`, { label: this.config.label });
      await clickSafe(this.driver, elementToClick, this.config);

    } catch (error: unknown) {
      logger.error(`Error en selectVideoType: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Hace click sobre el botón de subida para abrir el dropdown de tipos de video.
   * Acción atómica — omite el click si el dropdown ya está expandido.
   */
  async openVideoTypeDropdown(): Promise<void> {
    try {
      const isVisible = await this.isDropdownVisible();

      if (!isVisible) {
        logger.debug("Abriendo el dropdown de opciones...", { label: this.config.label });
        await clickSafe(this.driver, UploadVideoBtn.UPLOAD_VIDEO_BTN, this.config);
      } else {
        logger.debug("El dropdown ya estaba abierto.", { label: this.config.label });
      }
    } catch (error: unknown) {
      logger.error(`Error en openVideoTypeDropdown: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  private async isDropdownVisible(): Promise<boolean> {
    const element = await this.waitUntilIsReady(UploadVideoBtn.UPLOAD_VIDEO_BTN);

    // Verificamos visualmente el atributo
    const isExpanded = await element.getAttribute("aria-expanded");
    return isExpanded === "true";
  }


  /**
   * Busca en la lista de opciones desplegadas el WebElement que coincide con el VideoType.
   * Retorna el elemento para ser clickeado posteriormente.
   */
  private async matchVideoType(videoType: VideoType): Promise<WebElement> {
    try {
      await this.waitUntilIsReady(UploadVideoBtn.DROPDOWN_COMBO_MODAL)

    } catch (error: unknown) {
      logger.error(`El menú no se desplegó correctamente: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }

    // 2. Buscar todos los labels candidatos
    const elements = await this.driver.findElements(UploadVideoBtn.LABELS_OF_VIDEO_TYPES);

    if (elements.length === 0) {
      throw new Error(`El menú se abrió, pero no se encontraron labels con el selector: ${UploadVideoBtn.LABELS_OF_VIDEO_TYPES}`);
    }

    logger.debug(`Analizando ${elements.length} opciones disponibles...`, { label: this.config.label });

    // 3. Iterar dinámicamente
    for (const element of elements) {
      // Obtenemos el texto limpio (trim)
      const text = await element.getText();
      const cleanLabel = text.trim();

      if (UploadVideoBtn.VIDEO_TYPE_MAP[videoType].has(cleanLabel)) {
        logger.debug(`Match encontrado: "${cleanLabel}"`, { label: this.config.label });
        return element;
      }
    }
    throw new Error(`No se encontró la opción "${videoType}" en el menú.`);
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