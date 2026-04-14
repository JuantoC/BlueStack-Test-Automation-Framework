import { Locator, By, WebDriver, WebElement } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../../core/config/defaultConfig.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { waitFind } from "../../../core/actions/waitFind.js";
import logger from "../../../core/utils/logger.js";
import { getErrorMessage } from "../../../core/utils/errorUtils.js";

/**
 * Sub-componente que representa los botones del footer del Editor de Notas.
 * Encapsula los controles de creación de contenido adicional (ítems de lista, eventos).
 * Actualmente en construcción; los locators están definidos pero los métodos aún no están implementados.
 */
export class NoteFooterBtn {
  private config: RetryOptions;

  private static readonly ADD_CONTENT_CONTAINER: Locator = By.css("div[id='add-content-id']")
  private static readonly ADD_CONTENT_BTN: Locator = By.css('div[id="add-content-id"] div[data-testid="add-post-circle-container"]')
  private static readonly ADD_LISTICLE_ITEM_BTN: Locator = By.css('button[data-testid="add-listicle-item"]');

  constructor(private driver: WebDriver, opts: RetryOptions = {}) {
    this.config = resolveRetryConfig(opts, "EditorFooterBtn")
  }

  /**
   * Retorna el WebElement del contenedor de acciones de contenido.
   *
   * @returns {Promise<WebElement>} El elemento localizado.
   */
  public async getAddContentContainer(): Promise<WebElement> {
    try {
      logger.debug("Locating add content container", { label: this.config.label });
      return await waitFind(this.driver, NoteFooterBtn.ADD_CONTENT_CONTAINER, this.config);
    } catch (error: unknown) {
      logger.error(`Error en getAddContentContainer: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Hace click en el botón principal de agregar contenido.
   */
  public async clickAddContentBtn(): Promise<void> {
    try {
      logger.debug("Clicking botón agregar contenido", { label: this.config.label });
      await clickSafe(this.driver, NoteFooterBtn.ADD_CONTENT_BTN, this.config);
    } catch (error: unknown) {
      logger.error(`Error en clickAddContentBtn: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Hace click en el botón para agregar un ítem de listicle.
   */
  public async clickAddListicleItemBtn(): Promise<void> {
    try {
      logger.debug("Clicking botón agregar ítem de listicle", { label: this.config.label });
      await clickSafe(this.driver, NoteFooterBtn.ADD_LISTICLE_ITEM_BTN, this.config);
    } catch (error: unknown) {
      logger.error(`Error en clickAddListicleItemBtn: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }
}