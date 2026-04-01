import { Locator, By, WebDriver } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../../core/config/defaultConfig.js";

/**
 * Sub-componente que representa los botones del footer del Editor de Notas.
 * Encapsula los controles de creación de contenido adicional (ítems de lista, eventos).
 * Actualmente en construcción; los locators están definidos pero los métodos aún no están implementados.
 */
export class NoteFooterBtn {
  private driver: WebDriver
  private config: RetryOptions;

  private static readonly ADD_CONTENT_CONTAINER: Locator = By.css("div[id='add-content-id']")
  private static readonly ADD_CONTENT_BTN: Locator = By.css('div[id="add-content-id"] div[data-testid="add-post-circle-container"]')
  private static readonly ADD_LISTICLE_ITEM_BTN: Locator = By.css('button[data-testid="add-listicle-item"]');

  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.driver = driver
    this.config = resolveRetryConfig(opts, "EditorFooterBtn")
  }


}