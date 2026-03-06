import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import logger from "../../core/utils/logger.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { waitVisible } from "../../core/actions/waitVisible.js";

export enum VideoType {
  NATIVO = 'Nativo',
  EMBEDDED = 'Embedded',
  YOUTUBE = 'Youtube',
  SHORT = 'Short'
}

export class UploadVideoBtn {

  private driver: WebDriver;
  private config: RetryOptions;

  private readonly VIDEO_TYPE_MAP: Record<VideoType, Set<string>> = {
    [VideoType.EMBEDDED]: new Set(['Embedded Video', "Video Embedded", "Video Incorporado"]),
    [VideoType.NATIVO]: new Set(['Native Video', "Video Nativo", "Video Nativo"]),
    [VideoType.YOUTUBE]: new Set(['YouTube Video', "Video Youtube", "Video Youtube"]),
    [VideoType.SHORT]: new Set(['YouTube Short Video', "Video Youtube Short", "Video Youtube Short"])
  };

  private readonly VIDEOS_TABLE: Locator = By.css('div#multimedia-table-body')
  private readonly UPLOAD_VIDEO_BTN: Locator = By.css("button.btn-create-note");
  private readonly DROPDOWN_COMBO_MODAL: Locator = By.css('div[data-testid="dropdown-menu"]');
  private readonly LABELS_OF_VIDEO_TYPES: Locator = By.css('div[data-testid="dropdown-item"] label');

  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "UploadVideoBtn") };
  }

  async selectVideoType(videoType: VideoType): Promise<void> {
    // Espera explicita para clickar en el boton mientras carga la pagina.
    const table_container = await waitFind(this.driver, this.VIDEOS_TABLE, this.config)
    await waitVisible(this.driver, table_container, this.config)

    // Click en el boton de subir
    await this.clickOnUploadVideoButton();

    // Busqueda del tipo de video
    const elementToClick = await this.matchVideoType(videoType);

    logger.debug(`Intentando hacer click en la opción "${videoType}"...`, { label: this.config.label });
    await clickSafe(this.driver, elementToClick, this.config);
  }

  async clickOnUploadVideoButton(): Promise<void> {
    const isVisible = await this.isDropdownVisible();

    if (!isVisible) {
      logger.debug("Abriendo el dropdown de opciones...", { label: this.config.label });
      await clickSafe(this.driver, this.UPLOAD_VIDEO_BTN, this.config);
    } else {
      logger.debug("El dropdown ya estaba abierto.", { label: this.config.label });
    }
  }

  async isDropdownVisible(): Promise<boolean> {
    const element = await waitFind(this.driver, this.UPLOAD_VIDEO_BTN, this.config);

    // Verificamos visualmente el atributo
    const isExpanded = await element.getAttribute("aria-expanded");
    return isExpanded === "true";
  }


  /**
   * Busca en la lista de opciones desplegadas el WebElement que coincide con el VideoType.
   * Retorna el elemento para ser clickeado posteriormente.
   */
  async matchVideoType(videoType: VideoType): Promise<WebElement> {
    // 1. Esperar a que el contenedor del menú sea visible en pantalla
    try {

      const menuContainer = await waitFind(this.driver, this.DROPDOWN_COMBO_MODAL, this.config)
      await waitVisible(this.driver, menuContainer, this.config)

    } catch (error) {
      logger.error("El menú no se desplegó correctamente.", { label: this.config.label });
      throw error;
    }

    // 2. Buscar todos los labels candidatos
    const elements = await this.driver.findElements(this.LABELS_OF_VIDEO_TYPES);

    if (elements.length === 0) {
      throw new Error(`El menú se abrió, pero no se encontraron labels con el selector: ${this.LABELS_OF_VIDEO_TYPES}`);
    }

    logger.debug(`Analizando ${elements.length} opciones disponibles...`, { label: this.config.label });

    // 3. Iterar dinámicamente
    for (const element of elements) {
      // Obtenemos el texto limpio (trim)
      const text = await element.getText();
      const cleanLabel = text.trim();

      if (this.VIDEO_TYPE_MAP[videoType].has(cleanLabel)) {
        logger.debug(`Match encontrado: "${cleanLabel}"`, { label: this.config.label });
        return element;
      }
    }

    throw new Error(`No se encontró la opción "${videoType}" en el menú.`);
  }
}